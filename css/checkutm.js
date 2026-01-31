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
            default: ["+78452000000", "+7 (8452) 00-00-00"],
            utm: {}
        },

        eng: {
            default: ["+78453000000", "+7 (8453) 00-00-00"],
            utm: {}
        },

        uly: {
            default: ["+78422000000", "+7 (8422) 00-00-00"],
            utm: {}
        },

        tol: {
            default: ["+78482000000", "+7 (8482) 00-00-00"],
            utm: {}
        },

        pnz: {
            default: ["+78412000000", "+7 (8412) 00-00-00"],
            utm: {}
        },

        yar: {
            default: ["+74852000000", "+7 (4852) 00-00-00"],
            utm: {}
        },

        oms: {
            default: ["+73812000000", "+7 (3812) 00-00-00"],
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
    // 5. Если главная и UTM нет → очищаем
    if (!utm.source && window.location.pathname === "/") {
        sessionStorage.removeItem("tel");
        sessionStorage.removeItem("phone");
        return;
    }

    // 6. Сохраняем номер
    if (phone) {
        sessionStorage.setItem("tel", phone[0]);
        sessionStorage.setItem("phone", phone[1]);
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

