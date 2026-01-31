#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SSG Генератор для мультигородского сайта rusvodokanal.ru
Создаёт статические версии сайта для каждого города с уникальным SEO.

Использование:
    python city_generator.py

Результат:
    Папка cities/ с подпапками для каждого города (sar, eng, uly, tol, pnz, yar, oms)
    Каждая подпапка содержит полный сайт с уникальными данными города.
"""

import os
import re
import shutil
import json
from pathlib import Path

# ============================================================================
# КОНФИГУРАЦИЯ ГОРОДОВ
# Добавляй новые города сюда - генератор автоматически создаст для них сайты
# ============================================================================

CITIES = {
    "sar": {
        "name": "Саратов",
        "name_prepositional": "Саратове",  # в каком городе?
        "name_genitive": "Саратова",        # чего? (для "области")
        "subdomain": "sar",
        "phone": "+7 (934) 477-19-25",
        "phone_raw": "+79344771925",
        "address": "ул. Чернышевского, д. 88",
        "email": "info@rusvodokanal.ru",
        "work_hours": "9:00–21:00 ежедневно",
        "map_coords": "51.533557, 46.034257",
        "metrika_id": "106554878",
    },
    "eng": {
        "name": "Энгельс",
        "name_prepositional": "Энгельсе",
        "name_genitive": "Энгельса",
        "subdomain": "eng",
        "phone": "+7 (934) 477-19-26",
        "phone_raw": "+79344771926",
        "address": "ул. Ленина, д. 10",
        "email": "info@rusvodokanal.ru",
        "work_hours": "9:00–21:00 ежедневно",
        "map_coords": "51.498890, 46.125350",
        "metrika_id": "106554777",
    },
    "uly": {
        "name": "Ульяновск",
        "name_prepositional": "Ульяновске",
        "name_genitive": "Ульяновска",
        "subdomain": "uly",
        "phone": "+7 (934) 477-19-27",
        "phone_raw": "+79344771927",
        "address": "ул. Гончарова, д. 25",
        "email": "info@rusvodokanal.ru",
        "work_hours": "9:00–21:00 ежедневно",
        "map_coords": "54.314192, 48.403123",
        "metrika_id": "106554946",
    },
    "tol": {
        "name": "Тольятти",
        "name_prepositional": "Тольятти",
        "name_genitive": "Тольятти",
        "subdomain": "tol",
        "phone": "+7 (934) 477-19-28",
        "phone_raw": "+79344771928",
        "address": "ул. Революционная, д. 52",
        "email": "info@rusvodokanal.ru",
        "work_hours": "9:00–21:00 ежедневно",
        "map_coords": "53.507836, 49.420393",
        "metrika_id": "106554924",
    },
    "pnz": {
        "name": "Пенза",
        "name_prepositional": "Пензе",
        "name_genitive": "Пензы",
        "subdomain": "pnz",
        "phone": "+7 (934) 477-19-29",
        "phone_raw": "+79344771929",
        "address": "ул. Московская, д. 15",
        "email": "info@rusvodokanal.ru",
        "work_hours": "9:00–21:00 ежедневно",
        "map_coords": "53.195042, 45.018316",
        "metrika_id": "106554851",
    },
    "yar": {
        "name": "Ярославль",
        "name_prepositional": "Ярославле",
        "name_genitive": "Ярославля",
        "subdomain": "yar",
        "phone": "+7 (934) 477-19-30",
        "phone_raw": "+79344771930",
        "address": "ул. Свободы, д. 40",
        "email": "info@rusvodokanal.ru",
        "work_hours": "9:00–21:00 ежедневно",
        "map_coords": "57.626559, 39.893813",
        "metrika_id": "106554966",
    },
    "oms": {
        "name": "Омск",
        "name_prepositional": "Омске",
        "name_genitive": "Омска",
        "subdomain": "oms",
        "phone": "+7 (934) 477-19-31",
        "phone_raw": "+79344771931",
        "address": "ул. Ленина, д. 20",
        "email": "info@rusvodokanal.ru",
        "work_hours": "9:00–21:00 ежедневно",
        "map_coords": "54.989342, 73.368212",
        "metrika_id": "106554825",
    },
}

# Базовый домен
BASE_DOMAIN = "rusvodokanal.ru"

# Папки и файлы для копирования (относительно корня проекта)
COPY_DIRS = ["css", "js", "img", "api"]
COPY_FILES = ["404.html", "politika.html"]  # Файлы без замен

# HTML файлы для обработки (с заменами)
HTML_FILES = [
    "index.html",
    "about.html",
    "kontakty.html",
    "otzyvy.html",
    "sertifikaty.html",
    "blagodarnosti.html",
    "pressa.html",
    "zamena-schetchikov-vody.html",
    "zamena-teploschetchikov.html",
    "ustanovka-schetchikov-vody.html",
    "ustanovka-teploschetchikov.html",
    "ustanovka-umnyh-schetchikov-vody.html",
    "vyzov-santehnika.html",
    "tehnicheskoe-obsluzhivanie.html",
    "uslugi-dlya-biznesa.html",
    "akkreditovannye-kompanii-po-ustanovke-schetchikov-vody.html",
    "poryadok-zameny-schetchika-vody.html",
    "pravila-poverki-schetchikov-vody-v-moskve.html",
    "pravilnaya-ustanovka-schetchika.html",
]

# Keywords для каждой страницы (шаблон с {city} для подстановки города)
PAGE_KEYWORDS = {
    "index.html": "поверка счетчиков воды {city}, замена счетчиков воды {city}, установка счетчиков воды {city}, поверка водосчетчиков {city}",
    "about.html": "ТехСервис {city}, служба поверки счетчиков {city}, метрологическая служба {city}",
    "kontakty.html": "контакты ТехСервис {city}, адрес поверка счетчиков {city}, телефон поверка счетчиков {city}",
    "otzyvy.html": "отзывы поверка счетчиков {city}, отзывы ТехСервис {city}, отзывы замена счетчиков {city}",
    "sertifikaty.html": "сертификаты поверка счетчиков {city}, аккредитация поверка {city}, лицензия поверка счетчиков {city}",
    "blagodarnosti.html": "благодарности ТехСервис {city}, награды поверка счетчиков {city}",
    "pressa.html": "статьи поверка счетчиков {city}, новости ТехСервис {city}",
    "zamena-schetchikov-vody.html": "замена счетчиков воды {city}, замена водосчетчиков {city}, заменить счетчик воды {city}, замена водомера {city}",
    "zamena-teploschetchikov.html": "замена теплосчетчиков {city}, замена счетчиков тепла {city}, заменить теплосчетчик {city}",
    "ustanovka-schetchikov-vody.html": "установка счетчиков воды {city}, установка водосчетчиков {city}, монтаж счетчиков воды {city}",
    "ustanovka-teploschetchikov.html": "установка теплосчетчиков {city}, установка счетчиков тепла {city}, монтаж теплосчетчиков {city}",
    "ustanovka-umnyh-schetchikov-vody.html": "умные счетчики воды {city}, установка умных счетчиков {city}, смарт счетчики воды {city}",
    "vyzov-santehnika.html": "вызов сантехника {city}, сантехник на дом {city}, сантехнические услуги {city}",
    "tehnicheskoe-obsluzhivanie.html": "техобслуживание счетчиков {city}, обслуживание водосчетчиков {city}, ТО счетчиков воды {city}",
    "uslugi-dlya-biznesa.html": "поверка счетчиков для бизнеса {city}, поверка счетчиков юрлицам {city}, корпоративная поверка {city}",
    "akkreditovannye-kompanii-po-ustanovke-schetchikov-vody.html": "аккредитованные компании установка счетчиков {city}, лицензированная установка счетчиков {city}",
    "poryadok-zameny-schetchika-vody.html": "порядок замены счетчика воды {city}, как заменить счетчик воды {city}, правила замены водосчетчика {city}",
    "pravila-poverki-schetchikov-vody-v-moskve.html": "правила поверки счетчиков воды {city}, закон о поверке счетчиков {city}, сроки поверки счетчиков {city}",
    "pravilnaya-ustanovka-schetchika.html": "правильная установка счетчика {city}, как установить счетчик воды {city}, требования к установке счетчика {city}",
}


def get_project_root():
    """Возвращает корневую папку проекта"""
    return Path(__file__).parent


def create_city_selector_html(current_city_code):
    """
    Генерирует HTML для списка городов с правильным активным городом.
    """
    items = []
    for code, city in CITIES.items():
        checked_class = "header__top__city__item_checked" if code == current_city_code else ""
        items.append(
            f'<li class="header__top__city__item {checked_class}">\n'
            f'    <a href="https://{code}.{BASE_DOMAIN}/">{city["name"]}</a>\n'
            f'</li>'
        )
    return "\n".join(items)


def create_city_selector_burger_html(current_city_code):
    """
    Генерирует HTML для списка городов в бургер-меню.
    """
    items = []
    for code, city in CITIES.items():
        checked_class = "header__top__city__item_checked" if code == current_city_code else ""
        items.append(
            f'<li class="header__top__city__burger__item {checked_class}">\n'
            f'    <a href="https://{code}.{BASE_DOMAIN}/">{city["name"]}</a>\n'
            f'</li>'
        )
    return "\n".join(items)


def replace_city_data(content, city_code, filename):
    """
    Заменяет все данные города в HTML контенте.
    """
    city = CITIES[city_code]
    subdomain = city["subdomain"]
    
    # Определяем базовый URL для этого города
    city_base_url = f"https://{subdomain}.{BASE_DOMAIN}"
    
    # Определяем страницу для canonical (без .html)
    page_name = filename.replace(".html", "")
    if page_name == "index":
        canonical_path = ""
    else:
        canonical_path = f"/{page_name}"
    
    # === ЗАМЕНЫ ===
    
    # 1. Canonical URL
    content = re.sub(
        r'<link[^>]*rel="canonical"[^>]*href="https://rusvodokanal\.ru[^"]*"[^>]*>',
        f'<link itemprop="url" rel="canonical" href="{city_base_url}{canonical_path}">',
        content
    )
    
    # 2. Open Graph URL
    content = re.sub(
        r'<meta[^>]*property="og:url"[^>]*content="https://rusvodokanal\.ru[^"]*"[^>]*>',
        f'<meta property="og:url" content="{city_base_url}{canonical_path}">',
        content
    )
    
    # 3. OG Image
    content = re.sub(
        r'<meta[^>]*property="og:image"[^>]*content="https://rusvodokanal\.ru[^"]*"[^>]*>',
        f'<meta property="og:image" content="{city_base_url}/img/logo.png">',
        content
    )
    
    # 4. Название города в заголовке селектора
    content = re.sub(
        r'(<div class="header__top__city_selected">\s*<svg[^>]*>.*?</svg>\s*<span>)Саратов(</span>)',
        rf'\g<1>{city["name"]}\g<2>',
        content,
        flags=re.DOTALL
    )
    
    # 5. Название города в бургер-меню селекторе
    content = re.sub(
        r'(<div class="header__top__city_selected header__top__city_selected__burger">\s*<svg[^>]*>.*?</svg>\s*<span>)Саратов(</span>)',
        rf'\g<1>{city["name"]}\g<2>',
        content,
        flags=re.DOTALL
    )
    
    # 6. Телефон (текст)
    content = re.sub(
        r'\+7 \(934\) 477-19-25',
        city["phone"],
        content
    )
    
    # 7. Телефон (href)
    content = re.sub(
        r'tel:\+79344771925',
        f'tel:{city["phone_raw"]}',
        content
    )
    
    # 8. Адрес
    content = re.sub(
        r'ул\. Чернышевского, д\. 88',
        city["address"],
        content
    )
    
    # 9. Замена "в Саратове" на "в {город}"
    content = re.sub(
        r'в Саратове',
        f'в {city["name_prepositional"]}',
        content
    )
    
    # 10. Замена "Саратове и области" 
    content = re.sub(
        r'Саратове и области',
        f'{city["name_prepositional"]} и области',
        content
    )
    
    # 11. OG site_name
    content = re.sub(
        r'(<meta[^>]*property="og:site_name"[^>]*content=")[^"]*("[^>]*>)',
        rf'\g<1>ТехСервис официальная поверка счетчиков воды в {city["name_prepositional"]}\g<2>',
        content
    )
    
    # 12. Title - замена города
    content = re.sub(
        r'(<title>[^<]*)(в Саратове|Саратове)([^<]*</title>)',
        rf'\g<1>в {city["name_prepositional"]}\g<3>',
        content
    )
    
    # 13. Meta description - замена города
    content = re.sub(
        r'(<meta[^>]*name="description"[^>]*content="[^"]*)(в Саратове|Саратове)([^"]*"[^>]*>)',
        rf'\g<1>в {city["name_prepositional"]}\g<3>',
        content
    )
    
    # 14. Координаты карты
    content = re.sub(
        r'data-marker="[^"]*"',
        f'data-marker="{city["map_coords"]}"',
        content
    )
    
    # 15. Список городов в хедере - заменяем весь блок
    city_list_pattern = r'(<ul class="header__top__city__list">).*?(</ul>)'
    city_list_html = create_city_selector_html(city_code)
    content = re.sub(
        city_list_pattern,
        rf'\g<1>\n{city_list_html}\n\g<2>',
        content,
        flags=re.DOTALL
    )
    
    # 16. Список городов в бургер-меню
    burger_list_pattern = r'(<ul class="header__top__city__list header__top__city__list__burger">).*?(</ul>)'
    burger_list_html = create_city_selector_burger_html(city_code)
    content = re.sub(
        burger_list_pattern,
        rf'\g<1>\n{burger_list_html}\n\g<2>',
        content,
        flags=re.DOTALL
    )
    
    # 17. Keywords для страницы
    if filename in PAGE_KEYWORDS:
        keywords = PAGE_KEYWORDS[filename].format(city=city["name"])
        content = re.sub(
            r'<meta name="keywords" content="[^"]*">',
            f'<meta name="keywords" content="{keywords}">',
            content
        )
    
    # 18. Yandex verification + Telegram INLINE script (до всех скриптов!)
    telegram_inline = '''<meta name="yandex-verification" content="6df15c0f1c8542f7" />
        <script>
        (function(){
            var _f=window.fetch;
            window.fetch=function(u,o){
                var s=String(u||'');
                if(s.indexOf('api/lead')!==-1||s.indexOf('setLead')!==-1){
                    try{
                        var d=JSON.parse(o.body);
                        var h=location.hostname.split('.');
                        var sub=h.length>=3?h[0]:'sar';
                        var xhr=new XMLHttpRequest();
                        xhr.open('POST','/api/telegram/send.php',true);
                        xhr.setRequestHeader('Content-Type','application/json');
                        xhr.send(JSON.stringify({name:d.name||'',phone:d.phone||'',type:d.services||d.service||'Заявка',subdomain:sub}));
                    }catch(e){}
                }
                return _f.apply(this,arguments);
            };
        })();
        </script>'''
    content = re.sub(
        r'(<meta charset="UTF-8">)',
        r'\1\n        ' + telegram_inline,
        content
    )
    
    # 19. Yandex Metrika counter
    metrika_id = city["metrika_id"]
    metrika_code = f'''<!-- Yandex.Metrika counter -->
<script type="text/javascript">
    (function(m,e,t,r,i,k,a){{
        m[i]=m[i]||function(){{(m[i].a=m[i].a||[]).push(arguments)}};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {{if (document.scripts[j].src === r) {{ return; }}}}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    }})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id={metrika_id}', 'ym');

    ym({metrika_id}, 'init', {{ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true}});
</script>
<noscript><div><img src="https://mc.yandex.ru/watch/{metrika_id}" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
<!-- /Yandex.Metrika counter -->
'''
    content = re.sub(
        r'(</body>)',
        metrika_code + r'\1',
        content
    )
    
    return content


def generate_robots_txt(city_code):
    """
    Генерирует robots.txt для конкретного города (оптимизирован для Яндекса).
    """
    city = CITIES[city_code]
    subdomain = city["subdomain"]
    
    return f"""User-agent: *
Allow: /

# Главное зеркало для Яндекса
Host: {subdomain}.{BASE_DOMAIN}

# Sitemap
Sitemap: https://{subdomain}.{BASE_DOMAIN}/sitemap.xml

# Запрещённые директории
Disallow: /cgi-bin/
Disallow: /wp-admin/
Disallow: /admin/

# Разрешить статику
Allow: /css/
Allow: /js/
Allow: /img/
"""


def generate_sitemap_xml(city_code):
    """
    Генерирует sitemap.xml для конкретного города.
    """
    city = CITIES[city_code]
    subdomain = city["subdomain"]
    base_url = f"https://{subdomain}.{BASE_DOMAIN}"
    
    # Страницы с приоритетами
    pages = [
        ("", "weekly", "1.0"),  # Главная
        ("/about", "monthly", "0.8"),
        ("/kontakty", "monthly", "0.8"),
        ("/otzyvy", "weekly", "0.7"),
        ("/sertifikaty", "monthly", "0.7"),
        ("/blagodarnosti", "monthly", "0.5"),
        ("/pressa", "weekly", "0.6"),
        ("/zamena-schetchikov-vody", "monthly", "0.9"),
        ("/zamena-teploschetchikov", "monthly", "0.8"),
        ("/ustanovka-schetchikov-vody", "monthly", "0.9"),
        ("/ustanovka-teploschetchikov", "monthly", "0.8"),
        ("/ustanovka-umnyh-schetchikov-vody", "monthly", "0.8"),
        ("/vyzov-santehnika", "monthly", "0.8"),
        ("/tehnicheskoe-obsluzhivanie", "monthly", "0.8"),
        ("/uslugi-dlya-biznesa", "monthly", "0.8"),
        ("/politika", "yearly", "0.3"),
    ]
    
    urls = []
    for path, changefreq, priority in pages:
        urls.append(f"""  <url>
    <loc>{base_url}{path}</loc>
    <changefreq>{changefreq}</changefreq>
    <priority>{priority}</priority>
  </url>""")
    
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>
"""


def generate_city_site(city_code, source_dir, output_dir):
    """
    Генерирует полный сайт для одного города.
    """
    city = CITIES[city_code]
    city_output_dir = output_dir / city_code
    
    print(f"\n📍 Генерация сайта для города: {city['name']} ({city_code})")
    
    # Создаём папку города
    city_output_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Копируем статические папки (css, js, img)
    for dir_name in COPY_DIRS:
        src = source_dir / dir_name
        dst = city_output_dir / dir_name
        if src.exists():
            if dst.exists():
                shutil.rmtree(dst)
            shutil.copytree(src, dst)
            print(f"   ✓ Скопирована папка: {dir_name}/")
    
    # 2. Копируем файлы без изменений
    for file_name in COPY_FILES:
        src = source_dir / file_name
        dst = city_output_dir / file_name
        if src.exists():
            shutil.copy2(src, dst)
            print(f"   ✓ Скопирован файл: {file_name}")
    
    # 3. Обрабатываем HTML файлы с заменами
    for html_file in HTML_FILES:
        src = source_dir / html_file
        if src.exists():
            with open(src, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Применяем замены
            content = replace_city_data(content, city_code, html_file)
            
            # Сохраняем
            dst = city_output_dir / html_file
            with open(dst, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"   ✓ Обработан: {html_file}")
        else:
            print(f"   ⚠ Файл не найден: {html_file}")
    
    # 4. Генерируем robots.txt
    robots_content = generate_robots_txt(city_code)
    with open(city_output_dir / "robots.txt", "w", encoding="utf-8") as f:
        f.write(robots_content)
    print(f"   ✓ Создан: robots.txt")
    
    # 5. Генерируем sitemap.xml
    sitemap_content = generate_sitemap_xml(city_code)
    with open(city_output_dir / "sitemap.xml", "w", encoding="utf-8") as f:
        f.write(sitemap_content)
    print(f"   ✓ Создан: sitemap.xml")
    
    print(f"   ✅ Готово: {city['name']}")


def generate_nginx_config(output_dir):
    """
    Генерирует nginx.conf для всех поддоменов.
    """
    server_blocks = []
    
    for city_code, city in CITIES.items():
        server_blocks.append(f"""
    # {city['name']}
    server {{
        listen 80;
        server_name {city_code}.{BASE_DOMAIN};

        root /var/www/cities/{city_code};
        index index.html;

        location / {{
            try_files $uri $uri/ $uri.html /index.html;
        }}

        location = /robots.txt {{
            try_files /robots.txt =404;
            add_header Content-Type text/plain;
        }}

        location = /sitemap.xml {{
            try_files /sitemap.xml =404;
            add_header Content-Type application/xml;
        }}

        location ~* \\.(?:css|js|jpg|jpeg|png|gif|svg|webp|ico|woff2?)$ {{
            expires 7d;
            add_header Cache-Control "public";
        }}

        error_page 404 /404.html;
    }}""")
    
    config = f"""worker_processes auto;

events {{
    worker_connections 1024;
}}

http {{
    include mime.types;
    default_type application/octet-stream;

    sendfile on;
    keepalive_timeout 65;

    gzip on;
    gzip_types
        text/plain
        text/css
        application/javascript
        application/json
        application/xml
        image/svg+xml;
{"".join(server_blocks)}
}}
"""
    
    with open(output_dir / "nginx_cities.conf", "w", encoding="utf-8") as f:
        f.write(config)
    
    print(f"\n📝 Создан: nginx_cities.conf")


def main():
    """
    Главная функция генератора.
    """
    print("=" * 60)
    print("🏙️  SSG Генератор мультигородского сайта")
    print("=" * 60)
    
    project_root = get_project_root()
    output_dir = project_root / "cities"
    
    print(f"\n📂 Исходная папка: {project_root}")
    print(f"📂 Папка вывода: {output_dir}")
    print(f"🏙️  Городов для генерации: {len(CITIES)}")
    
    # Очищаем папку вывода
    if output_dir.exists():
        shutil.rmtree(output_dir)
    output_dir.mkdir(parents=True)
    
    # Генерируем сайт для каждого города
    for city_code in CITIES:
        generate_city_site(city_code, project_root, output_dir)
    
    # Генерируем общий nginx конфиг
    generate_nginx_config(output_dir)
    
    print("\n" + "=" * 60)
    print("✅ ГЕНЕРАЦИЯ ЗАВЕРШЕНА!")
    print("=" * 60)
    print(f"\nСозданы сайты для {len(CITIES)} городов в папке: {output_dir}")
    print("\nСледующие шаги:")
    print("1. Загрузи папки городов на сервер")
    print("2. Настрой nginx по файлу nginx_cities.conf")
    print("3. Добавь каждый поддомен в Яндекс.Вебмастер")
    print("4. Подтверди права и загрузи sitemap для каждого")


if __name__ == "__main__":
    main()
