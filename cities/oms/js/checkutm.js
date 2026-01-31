(function () {

    // 1. Получение параметров UTM
    const url = new URL(window.location.href);
    const utm = {
        source: url.searchParams.get("utm_source") || "",
        medium: url.searchParams.get("utm_medium") || "",
        campaign: url.searchParams.get("utm_campaign") || ""
    };

    // 2. Определяем субдомен = регион
    function getRegion() {
        const host = window.location.hostname.split(".");
        if (host.length > 2) {
            const sub = host.slice(0, host.length - 2).join('.');
            if (["msk", "spb", "kazan", "ekb", "chel", "pnz", "tol", "oms", "yar", "sar", "uly"].includes(sub)) {
                if (sub === "ekb") return "ekaterinburg";
                return sub;
            }
        }
        return "msk";
    }

    const region = getRegion();
    const path = window.location.pathname;

    // 3. База номеров по регионам
    const phoneMap = {
        msk: {
            default: ["84991107236", "8 (499) 110-72-36"],
            

            vyzov_santehnika: {
                "bee|sms|site": ["+74997026910", "+7 (499) 702-69-10"],
                "megafon|sms|site": ["+74997026910", "+7 (499) 702-69-10"],
                "mts|sms|site": ["+74997026910", "+7 (499) 702-69-10"],
                "mts|sms|site_telegram": ["+74997026910", "+7 (499) 702-69-10"],
                "bee|sms|tel": ["+74997026910", "+7 (499) 702-69-10"],
                "megafon|sms|tel": ["+74997026910", "+7 (499) 702-69-10"],
                "mts|sms|tel": ["+74997026910", "+7 (499) 702-69-10"],
                "mts|sms|tel_telegram": ["+74997026910", "+7 (499) 702-69-10"],
            },
            vyzov_santehnika_default: ["+74997026910", "+7 (499) 702-69-10"],

            utm: {
                "2gis|maps|msk_mo": ["+74997027201", "+7 (499) 702-72-01"],
                "pochta|notice|DS_0724": ["+74994046520", "+7 (499) 404-65-20"],
                "pochta|notice|zhitel_0724": ["+74994046521", "+7 (499) 404-65-21"],
                "pochta|notice|predict_0724": ["+74994046522", "+7 (499) 404-65-22"],
                "pochta|notice|1c_0724": ["+74994046523", "+7 (499) 404-65-23"],
                "pochta|notice|zhitel": ["+74997027175", "+7 (499) 702-71-75"],
                "pochta|notice|new_from_old": ["+74997027401", "+7 (499) 702-74-01"],
                "pochta|notice|EV": ["+74997027406", "+7 (499) 702-74-06"],
                "pochta|notice|1c": ["+74992888230", "+7 (499) 288-82-30"],
                "pochta|notice|predict": ["+74994441476", "+7 (499) 444-14-76"],
                "pochta|notice|DS": ["+74993023239", "+7 (499) 302-32-39"],
                "pochta|notice|new_house": ["+74997027401", "+7 (499) 702-74-01"],
                "pochta|notice|new_houses": ["+74997027401", "+7 (499) 702-74-01"],

                "bee|sms|site": ["+74994554529", "+7 (499) 455-45-29"],
                "bee|sms|phone": ["+74997027408", "+7 (499) 702-74-08"],

                "beeline|sms|site": ["+74994554529", "+7 (499) 455-45-29"],
                "beeline|sms|phone": ["+74997027408", "+7 (499) 702-74-08"],

                "megafon|sms|site": ["+74997025930", "+7 (499) 702-59-30"],
                "mts|sms|site": ["+74994554526", "+7 (499) 455-45-26"],
                "mts|sms|phone1": ["+74997027409", "+7 (499) 702-74-09"],

                "uk460|||": ["+74994600408", "+7 (499) 460-04-08"],
                "reklam_uk_domodedovo||": ["+74997025929", "+7 (499) 702-59-29"],
                "vodochet_yandexdirect||": ["+74994554536", "+7 (499) 455-45-36"],
                "top-poverka_yandexdirect||": ["+74954194158", "+7 (499) 419-41-58"],

                "yandex|cpc|": ["+74994554528", "+7 (499) 455-45-28"],
                "yandex|cpa|": ["+74994554528", "+7 (499) 455-45-28"],
                "yandex|maps|msk_mo": ["+74994046525", "+7 (499) 404-65-25"],

                "sluzhbi_zhkh_rating|||": ["+74997026837", "+7 (499) 702-68-37"],
                "potarifu|||": ["+74997027181", "+7 (499) 702-71-81"],

                "mfc|video|site": ["+74997026950", "+7 (499) 702-69-50"],
                "t-bank|rassylka|site": ["+74954194152", "+7 (495) 419-41-52"],
                "zayavky|mosru|site": ["+74954194154", "+7 (495) 419-41-54"]
            }
        },

        spb: {
            default: ["+78124261672", "+7 812 426-16-72"],
            utm: {
                "pochta|notice|ev": ["+78124261672", "+7 812 426-16-72"],
                "pochta|notice|1c": ["+78124261672", "+7 812 426-16-72"],
                "pochta|notice|predict": ["+78124261672", "+7 812 426-16-72"],
                "beeline|sms|site": ["+78123132295", "+7 812 313-22-95"],
                "megafon|sms|site": ["+78123132295", "+7 812 313-22-95"],
                "megafon|sms|tel": ["+78123132295", "+7 812 313-22-95"],
                "mts|sms|site": ["+78123132295", "+7 812 313-22-95"],
                "mts|sms|tel": ["+78123132295", "+7 812 313-22-95"],
                "mts|sms|tel_telegram": ["+78123132295", "+7 812 313-22-95"],
                "mts|sms|site_telegram": ["+78123132295", "+7 812 313-22-95"],
                "bee|sms|site": ["+78123132295", "+7 812 313-22-95"],
                "bee|sms|tel": ["+78123132295", "+7 812 313-22-95"],
            }
        },

        pnz: {
            default: ["+79845004830", "+7 (984) 500-48-30"],
            utm: {}
        },

        tol: {
            default: ["+79585407673", "+7 (958) 540-76-73"],
            utm: {}
        },

        oms: {
            default: ["+79539979880", "+7 (953) 997-98-80"],
            utm: {}
        },

        yar: {
            default: ["+79539979962", "+7 (953) 997-99-62"],
            utm: {}
        },

        sar: {
            default: ["+79344771925", "+7 (934) 477-19-25"],
            utm: {}
        },

        uly: {
            default: ["+79344772392", "+7 (934) 477-23-92"],
            utm: {}
        }
    };

    // 4. Функция выбора телефона
    function selectPhone() {
        const data = phoneMap[region];
        if (!data) return;

        // Специальный для "/vyzov-santehnika"
        if (region === "msk" && path === "/vyzov-santehnika") {
            const key = `${utm.source}|${utm.medium}|${utm.campaign}`;
            if (data.vyzov_santehnika[key]) {
                return data.vyzov_santehnika[key];
            }
            return data.vyzov_santehnika_default;
        }

        // Основные UTM
        const key = `${utm.source}|${utm.medium}|${utm.campaign}`;
        if (data.utm[key]) {
            return data.utm[key];
        }

        return data.default;
    }

    const phone = selectPhone();
    // 5. Если главная и UTM нет → очищаем (только для msk и spb)
    if (!utm.source && window.location.pathname === "/" && (region === "msk" || region === "spb")) {
        sessionStorage.removeItem("tel");
        sessionStorage.removeItem("phone");
        return;
    }

    // 6. Сохраняем номер и применяем к странице
    if (phone) {
        sessionStorage.setItem("tel", phone[0]);
        sessionStorage.setItem("phone", phone[1]);
        
        // Применяем телефон к элементам на странице
        function applyPhone() {
            var phoneSpans = document.querySelectorAll(".phone-number");
            phoneSpans.forEach(function(span) {
                span.textContent = phone[1];
            });
            
            var telLinks = document.querySelectorAll('a[href^="tel:"]');
            telLinks.forEach(function(link) {
                link.setAttribute("href", "tel:" + phone[0]);
                if (!link.querySelector(".phone-number")) {
                    link.textContent = phone[1];
                }
            });
        }
        
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", applyPhone);
        } else {
            applyPhone();
        }
    }

})();

