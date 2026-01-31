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
            if (["sar", "eng", "uly", "tol", "pnz", "yar", "oms"].includes(sub)) {
                return sub;
            }
        }
        return "sar";
    }

    const region = getRegion();
    const path = window.location.pathname;

    // 3. База номеров по регионам
    const phoneMap = {
        sar: {
            default: ["+79344771925", "+7 (934) 477-19-25"],
            utm: {}
        },

        eng: {
            default: ["+79344771925", "+7 (934) 477-19-25"],
            utm: {}
        },

        uly: {
            default: ["+79344772392", "+7 (934) 477-23-92"],
            utm: {}
        },

        tol: {
            default: ["+79585407673", "+7 (958) 540-76-73"],
            utm: {}
        },

        pnz: {
            default: ["+79845004830", "+7 (984) 500-48-30"],
            utm: {}
        },

        yar: {
            default: ["+79539979962", "+7 (953) 997-99-62"],
            utm: {}
        },

        oms: {
            default: ["+79539979880", "+7 (953) 997-98-80"],
            utm: {}
        }
    };

    // 4. Функция выбора телефона
    function selectPhone() {
        const data = phoneMap[region];
        if (!data) return;

        // Основные UTM
        const key = `${utm.source}|${utm.medium}|${utm.campaign}`;
        if (data.utm && data.utm[key]) {
            return data.utm[key];
        }

        return data.default;
    }

    const phone = selectPhone();
    // 5. Для городов всегда сохраняем телефон (не очищаем)

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

    // 7. База адресов по регионам
    const addressMap = {
        sar: "ул. Чернышевского, д. 88",
        eng: "ул. Тельмана, д. 15",
        uly: "ул. Гончарова, д. 25",
        tol: "ул. Революционная, д. 52",
        pnz: "ул. Московская, д. 83",
        yar: "ул. Кирова, д. 8",
        oms: "ул. Ленина, д. 12"
    };

    // 8. Подставляем адрес
    const address = addressMap[region];
    if (address) {
        const addressElements = document.querySelectorAll(".header__top__address-info, .footer__logo-contact-descr");
        addressElements.forEach(function(el) {
            if (el.classList.contains("footer__logo-contact-descr")) {
                el.innerHTML = 'ООО «Городской Центр Учёта и Экономии Ресурсов»<br/>Адрес: ' + address;
            } else {
                el.textContent = address;
            }
        });
    }

})();

