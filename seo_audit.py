import os
import re
import glob
from collections import defaultdict


ROOT = os.path.dirname(os.path.abspath(__file__))


def _extract(pattern: str, text: str) -> str | None:
    m = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
    return m.group(1).strip() if m else None


def _extract_all(pattern: str, text: str) -> list[str]:
    return [m.group(1) for m in re.finditer(pattern, text, re.IGNORECASE | re.DOTALL)]


def _extract_meta_content(text: str, name: str) -> str | None:
    # Find a <meta ... name="..." ...> tag and extract its content attribute
    m = re.search(
        rf"<meta[^>]*\bname\s*=\s*(['\"])({re.escape(name)})\1[^>]*>",
        text,
        re.IGNORECASE | re.DOTALL,
    )
    if not m:
        return None
    tag = m.group(0)
    m2 = re.search(r"\bcontent\s*=\s*(['\"])(.*?)\1", tag, re.IGNORECASE | re.DOTALL)
    return m2.group(2).strip() if m2 else None


def _extract_link_href(text: str, rel: str) -> str | None:
    m = re.search(
        rf"<link[^>]*\brel\s*=\s*(['\"])({re.escape(rel)})\1[^>]*>",
        text,
        re.IGNORECASE | re.DOTALL,
    )
    if not m:
        return None
    tag = m.group(0)
    m2 = re.search(r"\bhref\s*=\s*(['\"])(.*?)\1", tag, re.IGNORECASE | re.DOTALL)
    return m2.group(2).strip() if m2 else None


def _extract_html_lang(text: str) -> str | None:
    m = re.search(r"<html[^>]*\blang\s*=\s*(['\"])(.*?)\1", text, re.IGNORECASE | re.DOTALL)
    return m.group(2).strip() if m else None


def _has_meta_property(text: str, prop: str) -> bool:
    return bool(
        re.search(
            rf"<meta[^>]*\bproperty\s*=\s*(['\"])({re.escape(prop)})\1",
            text,
            re.IGNORECASE | re.DOTALL,
        )
    )


def _count_imgs_missing_alt(text: str) -> tuple[int, int]:
    imgs = re.findall(r"<img\b[^>]*>", text, re.IGNORECASE | re.DOTALL)
    missing = 0
    for tag in imgs:
        if re.search(r"\balt\s*=", tag, re.IGNORECASE) is None:
            missing += 1
    return len(imgs), missing


def main() -> int:
    html_files = sorted(glob.glob(os.path.join(ROOT, "*.html")))
    rows: list[dict] = []

    for path in html_files:
        file = os.path.basename(path)
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()

        title = _extract(r"<title[^>]*>(.*?)</title>", text)
        desc = _extract_meta_content(text, "description")
        canonical = _extract_link_href(text, "canonical")
        robots = _extract_meta_content(text, "robots")
        lang = _extract_html_lang(text)
        viewport = bool(_extract_meta_content(text, "viewport"))
        og_title = _has_meta_property(text, "og:title")

        h1s = _extract_all(r"<h1\b[^>]*>(.*?)</h1>", text)
        img_count, img_missing_alt = _count_imgs_missing_alt(text)

        rows.append(
            {
                "file": file,
                "title": title,
                "desc": desc,
                "canonical": canonical,
                "robots": (robots or "").lower() if robots else None,
                "lang": lang,
                "viewport": viewport,
                "og_title": og_title,
                "h1_count": len(h1s),
                "img_count": img_count,
                "img_missing_alt": img_missing_alt,
            }
        )

    def _missing(key: str) -> list[str]:
        out = []
        for r in rows:
            val = r.get(key)
            if val is None:
                out.append(r["file"])
            elif isinstance(val, str) and not val.strip():
                out.append(r["file"])
        return out

    missing_title = _missing("title")
    missing_desc = _missing("desc")
    missing_canonical = _missing("canonical")
    missing_lang = _missing("lang")
    missing_viewport = [r["file"] for r in rows if not r["viewport"]]
    noindex = [r["file"] for r in rows if r["robots"] and "noindex" in r["robots"]]

    by_title: defaultdict[str, list[str]] = defaultdict(list)
    by_desc: defaultdict[str, list[str]] = defaultdict(list)
    for r in rows:
        if r["title"]:
            by_title[r["title"]].append(r["file"])
        if r["desc"]:
            by_desc[r["desc"]].append(r["file"])

    dup_titles = {t: fs for t, fs in by_title.items() if len(fs) > 1}
    dup_desc = {d: fs for d, fs in by_desc.items() if len(fs) > 1}

    print(f"FILES: {len(rows)}")
    print("\nMISSING:")
    print(f"  title: {len(missing_title)}")
    if missing_title:
        print("   ", ", ".join(missing_title))
    print(f"  description: {len(missing_desc)}")
    if missing_desc:
        print("   ", ", ".join(missing_desc))
    print(f"  canonical: {len(missing_canonical)}")
    if missing_canonical:
        print("   ", ", ".join(missing_canonical))
    print(f"  html lang: {len(missing_lang)}")
    if missing_lang:
        print("   ", ", ".join(missing_lang))
    print(f"  viewport: {len(missing_viewport)}")
    if missing_viewport:
        print("   ", ", ".join(missing_viewport))

    print("\nROBOTS META:")
    print(f"  pages with noindex: {len(noindex)}")
    if noindex:
        print("   ", ", ".join(noindex))

    print("\nDUPLICATES:")
    print(f"  duplicate titles: {len(dup_titles)}")
    for t, fs in list(dup_titles.items())[:25]:
        print(f"   - {t!r} => {', '.join(fs)}")
    print(f"  duplicate descriptions: {len(dup_desc)}")
    for d, fs in list(dup_desc.items())[:15]:
        print(f"   - {d!r} => {', '.join(fs)}")

    # Titles length
    short_titles = [r for r in rows if r["title"] and len(r["title"]) < 20]
    long_titles = [r for r in rows if r["title"] and len(r["title"]) > 70]
    print("\nTITLE LENGTH:")
    print(f"  short (<20): {len(short_titles)}")
    if short_titles:
        print("   ", ", ".join([r['file'] for r in short_titles]))
    print(f"  long (>70): {len(long_titles)}")
    if long_titles:
        print("   ", ", ".join([r['file'] for r in long_titles]))

    # H1
    no_h1 = [r["file"] for r in rows if r["h1_count"] == 0]
    multi_h1 = [r["file"] for r in rows if r["h1_count"] > 1]
    print("\nH1:")
    print(f"  pages without H1: {len(no_h1)}")
    if no_h1:
        print("   ", ", ".join(no_h1))
    print(f"  pages with multiple H1: {len(multi_h1)}")
    if multi_h1:
        print("   ", ", ".join(multi_h1))

    # ALT coverage
    with_imgs = [r for r in rows if r["img_count"] > 0]
    with_imgs.sort(
        key=lambda r: (r["img_missing_alt"] / max(1, r["img_count"]), r["img_missing_alt"]),
        reverse=True,
    )
    print("\nIMG ALT (top 15 by missing share):")
    for r in with_imgs[:15]:
        share = r["img_missing_alt"] / max(1, r["img_count"])
        print(f"  {r['file']}: missing_alt {r['img_missing_alt']}/{r['img_count']} ({share:.0%})")

    # OG coverage quick view
    missing_og = [r["file"] for r in rows if not r["og_title"]]
    print("\nOPEN GRAPH:")
    print(f"  pages without og:title: {len(missing_og)}")
    if missing_og:
        print("   ", ", ".join(missing_og))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

