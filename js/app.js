"use strict";

// Функция для построения URL с поддоменом города
function buildCityUrlForRedirect(cityName, fallbackHref) {
    const subdomainMap = {
        "Саратов": "sar",
        "Энгельс": "eng",
        "Омск": "oms",
        "Пенза": "pnz",
        "Тольятти": "tol",
        "Ульяновск": "uly",
        "Ярославль": "yar"
    };
    
    const subdomain = subdomainMap[cityName];
    if (!subdomain) return fallbackHref;
    
    const host = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port ? ":" + window.location.port : "";
    
    // Находим базовый домен
    const parts = host.split(".");
    let baseHost;
    
    if (parts.length >= 3) {
        // Уже есть поддомен — убираем его
        baseHost = parts.slice(1).join(".");
    } else if (parts.length === 2) {
        // Просто rusvodokanal.ru
        baseHost = host;
    } else {
        // localhost — используем fallback href
        return fallbackHref;
    }
    
    const newHost = subdomain + "." + baseHost;
    return protocol + "//" + newHost + port + window.location.pathname + window.location.search + window.location.hash;
}

if (document.querySelector(".navlink")) {
    let navLinkArr = Array.from(document.querySelectorAll(".navlink"));
    let url = window.location.href;
    for (let i = 0; i < navLinkArr.length; i++) {
        if (navLinkArr[i].href === url) {
            navLinkArr[i].classList.add("navlink-active");
        }
        else {
            navLinkArr[i].classList.remove("navlink-active");
        }
    }
}

"use strict";

"use strict";
if (document.querySelector(".about-advantages")) {
    const swiperAdvantages = new Swiper(".about-advantages__swiper", {
        speed: 500,
        spaceBetween: 0,
        centeredSlides: false,
        allowTouchMove: true, // Разрешаем свайп на всех экранах
        slidesPerView: "auto",
        autoplay: false,
        loop: false,
        disableOnInteraction: true,
        navigation: {
            nextEl: ".about-advantages .swiper-button-next",
            prevEl: ".about-advantages .swiper-button-prev"
        }
    });
}

"use strict";
if (document.querySelector(".about-form")) {
    const form = document.getElementById("aboutForm-about");
    const name = document.getElementById("name-about");
    const phone = document.getElementById("phone-about");
    const submitBtn = document.querySelector(".about-form__btn");
    const modal = document.querySelector(".modal-form__thanks-application");
    
    //const recaptchaInput = form.querySelector("[name=recaptchaResponse]").getAttribute("class")
    
    let nameState = false;
    let phoneState = false;
    function clearForm() {
        name.value = "";
        phone.value = "";
    }
    function validateName() {
        if (name.value.trim() !== "") {
            nameState = true;
            name.classList.remove("error");
        }
        else {
            nameState = false;
            name.classList.add("error");
        }
    }
    function validatePhone() {
        if (phone.value.trim() !== "") {
            phoneState = true;
            phone.classList.remove("error");
        }
        else {
            phoneState = false;
            phone.classList.add("error");
        }
    }
    function getCheckedValue() {
        const selected = document.querySelector(".about-form-select__checked");
        return selected ? selected.textContent : "";
    }
    submitBtn.addEventListener("click", function (event) {
        event.preventDefault();
        validateName();
        validatePhone();
        if (nameState && phoneState) {
            const formData = new FormData(form);

            /*const jsonData = {
                name: formData.get("name"),
                phone: formData.get("phone"),
                services: getCheckedValue(),
                date: new Date()
            };*/
            
            const jsonData = {
                name: formData.get("name"),
                phone: formData.get("phone"),
                services: getCheckedValue(),
                //recaptchaResponse: formData.get("recaptchaResponse"),
                date: new Date()
            };
            
            fetch(`https://${window.location.host}/api/lead/setLead/index.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(jsonData)
            })
                .then((res) => res.json())
                .then((data) => {
                if (data.success) {
                    modal.style.display = "block";
                    //getGoogleToken(recaptchaInput);
                }
                if (modalOverlay) {
                    modalOverlay.style.display = "block";
                    setTimeout(() => {
                        modalOverlay.style.display = "none";
                        modal.style.display = "none";
                    }, 3000);
                    clearForm();
                }
                else {
                    console.log("При отправке заявки произошла ошибка.");
                }
            })
                .catch((error) => {
                console.error("Error:", error);
                alert("При отправке заявки произошла ошибка.");
            });
        }
        else {
            console.log("Заполните все поля формы!");
        }
    });
    phone.addEventListener("input", onPhoneInput);
    // Открытие селекта в форме
    const createServicesSelectorHandlers = () => {
        const openSelectedAbout = document.querySelector(".about-form-select");
        openSelectedAbout.addEventListener("click", (event) => {
            event.preventDefault();
            // Проверка текущего состояния overflow и переключение его значения
            if (openSelectedAbout.style.overflow === "visible") {
                openSelectedAbout.style.overflow = "hidden";
                openSelectedAbout.classList.remove("open"); // удаляем класс open, чтобы вернуть before в исходное состояние
            }
            else {
                openSelectedAbout.style.overflow = "visible";
                openSelectedAbout.classList.add("open"); // добавляем класс open для вращения before
            }
        });
        // Закрытие селекта при клике вне его области
        document.addEventListener("click", (event) => {
            if (!openSelectedAbout.contains(event.target)) {
                openSelectedAbout.style.overflow = "hidden";
                openSelectedAbout.classList.remove("open");
            }
        });
        function initializeSelectList() {
            const list = document.querySelector(".about-form-select__list");
            if (!list)
                return;
            const items = Array.from(list.querySelectorAll(".about-form-select__item"));
            items.forEach(item => {
                item.addEventListener("click", () => {
                    items.forEach(i => {
                        i.classList.remove("about-form-select__checked");
                        i.style.color = "#666666";
                    });
                    item.classList.add("about-form-select__checked");
                    list.insertBefore(item, list.firstChild);
                    if (item.classList.contains("about-form-select__checked")) {
                        item.style.color = "#175CAB";
                    }
                });
            });
        }
        initializeSelectList();
    };
    createServicesSelectorHandlers();
    function onPhoneInput(event) {
        const input = event.target;
        const value = input.value.replace(/\D/g, "");
        const formattedValue = formatPhoneNumber(value);
        input.value = formattedValue;
    }
    function formatPhoneNumber(value) {
        // Удаляем все нецифровые символы и добавляем префикс 7, если отсутствует
        value = value.replace(/\D/g, "");
        if (!value.startsWith("7")) {
            value = "7" + value;
        }
        const phonePattern = [
            { pattern: "(", length: 1 },
            { pattern: ")", length: 4 },
            { pattern: " ", length: 4 },
            { pattern: "-", length: 7 },
            { pattern: "-", length: 9 }
        ];
        let formattedValue = "+7 ";
        let index = 1;
        for (let i = 0; i < phonePattern.length; i++) {
            const { pattern, length } = phonePattern[i];
            if (value.length > length) {
                formattedValue += value.slice(index, length) + pattern;
                index = length;
            }
        }
        formattedValue += value.slice(index);
        return formattedValue;
    }
}

"use strict";

"use strict";

"use strict";
if (document.querySelector(".advantages")) {
    const swiperAdvantages = new Swiper(".advantages__swiper", {
        speed: 500,
        spaceBetween: 0,
        centeredSlides: false,
        allowTouchMove: true, // Разрешаем свайп на всех экранах
        slidesPerView: "auto",
        autoplay: false,
        loop: false,
        disableOnInteraction: true,
        navigation: {
            nextEl: ".advantages .swiper-button-next",
            prevEl: ".advantages .swiper-button-prev"
        }
    });
}

"use strict";
if (document.querySelector(".application-form")) {
    const form = document.getElementById("applicationForm");
    const name = document.getElementById("name");
    const phone = document.getElementById("phone");
    const formSubmitBtn = document.querySelector(".form__btn");
    const modal = document.querySelector(".modal-form__thanks-application");
    let nameState = false;
    let phoneState = false;
    function clearForm() {
        name.value = "";
        phone.value = "";
    }
    function validateName() {
        if (name.value.trim() !== "") {
            nameState = true;
            name.classList.remove("error");
        }
        else {
            nameState = false;
            name.classList.add("error");
        }
    }
    function validatePhone() {
        if (phone.value.trim() !== "") {
            phoneState = true;
            phone.classList.remove("error");
        }
        else {
            phoneState = false;
            phone.classList.add("error");
        }
    }
    function getCheckedValue() {
        const selected = document.querySelector(".application-form-select__checked");
        return selected ? selected.textContent : "";
    }
    formSubmitBtn.addEventListener("click", function (event) {
        event.preventDefault();
        validateName();
        validatePhone();
        if (nameState && phoneState) {
            const formData = new FormData(form);
            const jsonData = {
                name: formData.get("name"),
                phone: formData.get("phone"),
                services: getCheckedValue(),
                date: new Date()
            };
            fetch(`https://${window.location.host}/api/lead/setLead/index.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(jsonData)
            })
                .then((res) => res.json())
                .then((data) => {
                if (data.success) {
                    modal.style.display = "block";
                }
                if (modalOverlay) {
                    modalOverlay.style.display = "block";
                    setTimeout(() => {
                        modalOverlay.style.display = "none";
                        modal.style.display = "none";
                    }, 3000);
                    clearForm();
                }
                else {
                    console.log("При отправке заявки произошла ошибка.");
                }
            })
                .catch((error) => {
                console.error("Error:", error);
                alert("При отправке заявки произошла ошибка.");
            });
        }
        else {
            console.log("Заполните все поля формы!");
        }
    });
    phone.addEventListener("input", onPhoneInput);
    // Открытие селекта в форме
    const createServicesSelectorHandlers = () => {
        const openSelected = document.querySelector(".application-form-select");
        openSelected.addEventListener("click", (event) => {
            event.preventDefault();
            // Проверка текущего состояния overflow и переключение его значения
            if (openSelected.style.overflow === "visible") {
                openSelected.style.overflow = "hidden";
                openSelected.classList.remove("open"); // удаляем класс open, чтобы вернуть before в исходное состояние
            }
            else {
                openSelected.style.overflow = "visible";
                openSelected.classList.add("open"); // добавляем класс open для вращения before
            }
        });
        // Закрытие селекта при клике вне его области
        document.addEventListener("click", (event) => {
            if (!openSelected.contains(event.target)) {
                openSelected.style.overflow = "hidden";
                openSelected.classList.remove("open");
            }
        });
        function initializeSelectList() {
            const list = document.querySelector(".application-form-select__list");
            if (!list)
                return;
            const items = Array.from(list.querySelectorAll(".application-form-select__item"));
            items.forEach(item => {
                item.addEventListener("click", () => {
                    items.forEach(i => {
                        i.classList.remove("application-form-select__checked");
                        i.style.color = "#666666";
                    });
                    item.classList.add("application-form-select__checked");
                    list.insertBefore(item, list.firstChild);
                    if (item.classList.contains("application-form-select__checked")) {
                        item.style.color = "#175CAB";
                    }
                });
            });
        }
        initializeSelectList();
    };
    createServicesSelectorHandlers();
    function onPhoneInput(event) {
        const input = event.target;
        const value = input.value.replace(/\D/g, "");
        const formattedValue = formatPhoneNumber(value);
        input.value = formattedValue;
    }
    function formatPhoneNumber(value) {
        // Удаляем все нецифровые символы и добавляем префикс 7, если отсутствует
        value = value.replace(/\D/g, "");
        if (!value.startsWith("7")) {
            value = "7" + value;
        }
        const phonePattern = [
            { pattern: "(", length: 1 },
            { pattern: ")", length: 4 },
            { pattern: " ", length: 4 },
            { pattern: "-", length: 7 },
            { pattern: "-", length: 9 }
        ];
        let formattedValue = "+7 ";
        let index = 1;
        for (let i = 0; i < phonePattern.length; i++) {
            const { pattern, length } = phonePattern[i];
            if (value.length > length) {
                formattedValue += value.slice(index, length) + pattern;
                index = length;
            }
        }
        formattedValue += value.slice(index);
        return formattedValue;
    }
}

"use strict";
if (document.querySelector(".article")) {
    const navHeader = document.querySelector(".article__nav__header");
    const nav = document.querySelector(".article__nav__list");
    const svgRotate = document.querySelector(".article__rotate");
    if (navHeader && nav && svgRotate) {
        navHeader.addEventListener("click", () => {
            svgRotate.classList.toggle("open");
            nav.classList.toggle("open");
        });
    }
}
document.querySelectorAll("a[href^=\"#\"]").forEach(anchor => {
    anchor.addEventListener("click", function (event) {
        // Определяем целевой элемент
        const targetId = this.getAttribute("href");
        const targetElement = targetId ? document.querySelector(targetId) : null;
        if (targetElement) {
            event.preventDefault();
            const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY - 143;
            // Плавный скролл к целевому элементу
            window.scrollTo({
                top: offsetTop,
                behavior: "smooth"
            });
        }
    });
});

"use strict";
if (document.querySelector(".articles")) {
    function allowTouchMove() {
        return window.innerWidth <= 550;
    }
    const swiperReviews = new Swiper(".articles__swiper", {
        speed: 500,
        spaceBetween: 12,
        centeredSlides: false,
        allowTouchMove: allowTouchMove(),
        slidesPerView: "auto",
        autoplay: false,
        loop: false,
        navigation: {
            nextEl: ".articles .swiper-button-next",
            prevEl: ".articles .swiper-button-prev"
        },
        disableOnInteraction: true
    });
}

"use strict";
if (document.querySelector(".articles-page")) {
}

"use strict";
if (document.querySelector(".certificate")) {
    const swiperReviews = new Swiper(".certificate__swiper", {
        speed: 500,
        spaceBetween: 0,
        centeredSlides: false,
        allowTouchMove: true,
        slidesPerView: "auto",
        autoplay: false,
        loop: false,
        navigation: {
            nextEl: ".certificate .swiper-button-next",
            prevEl: ".certificate .swiper-button-prev"
        },
        disableOnInteraction: true
    });
}

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
if (document.querySelector(".certificates")) {
    const certificatesMoreBtn = document.querySelector(".certificates__btn");
    const certificatesList = document.querySelector(".certificates__list");
    // Начальное значение counter
    let counter = 3;
    const apiUrl = `https://${document.location.host}/api/certificates/getCertificates/index.php`;
    // Функция для загрузки данных
    const loadCertificates = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ counter })
            });
            // Проверка на успешный ответ
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = yield response.json();
            //Проверяем, что данные получены
            if (data.length === 0) {
                certificatesMoreBtn.style.display = "none"; // Если данных нет, скрываем кнопку
            }
            data.forEach(item => {
                const certificateItem = document.createElement("li");
                certificateItem.classList.add("certificates__item");
                certificateItem.innerHTML = `
          <div class="certificate__image">
            <img class="certificates__img" src="${item.image}" alt="${item.alt}">
          </div>
          <p class="certificates__text">${item.descr}</p>
        `;
                certificatesList.appendChild(certificateItem);
            });
            // Увеличиваем счетчик для следующего запроса
            counter += 3;
        }
        catch (error) {
            console.error("Error fetching certificates:", error);
        }
    });
    // Обработчик клика по кнопке
    certificatesMoreBtn.addEventListener("click", loadCertificates);
}

"use strict";

"use strict";
if (document.querySelector(".complaint-form")) {
    const form = document.querySelector(".complaint-form__form");
    const name = document.getElementById("name-complaint");
    const email = document.getElementById("email-complaint");
    const phone = document.getElementById("phone-complaint");
    const message = document.getElementById("message-complaint");
    const number = document.getElementById("application-number-complaint");
    const submitBtn = document.querySelector(".complaint-form__form-btn");
    const messageLength = message.nextElementSibling;
    const modal = document.querySelector(".modal-form__thanks-application");
    let nameState = false;
    let emailState = false;
    let phoneState = false;
    let messageState = false;
    let numberState = false;
    // Очистка формы и состояний
    function clearForm() {
        name.value = "";
        email.value = "";
        phone.value = "";
        message.value = "";
        number.value = "";
        nameState = false;
        emailState = false;
        phoneState = false;
        messageState = false;
        numberState = false;
        messageLength.textContent = "0 / 200";
    }
    //Валидация формы
    const validateForm = () => {
        // Валидация Name
        function validateName() {
            if (name.value !== "") {
                nameState = true;
                name.classList.remove("error");
            }
            else {
                nameState = false;
                name.classList.add("error");
            }
        }
        
        function validatePhone() {
          if (phone.value !== "") {
            phoneState = true;
            phone.classList.remove("error");
          } else {
            phoneState = false;
            phone.classList.add("error");
          }
        }
        
        // Валидация Email
        function validateEmail() {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (email.value !== "" && emailRegex.test(email.value)) {
                emailState = true;
                email.classList.remove("error");
            }
            else {
                emailState = false;
                email.classList.add("error");
            }
        }
        // Валидация Message
        function validateMessage() {
            if (message.value !== "") {
                messageState = true;
                message.classList.remove("error");
            }
            else {
                messageState = false;
                message.classList.add("error");
            }
        }
        // Валидация Application Number
        function validateNumber() {
            if (number.value !== "") {
                numberState = true;
                number.classList.remove("error");
            }
            else {
                numberState = false;
                number.classList.add("error");
            }
        }
        validateName();
        validateEmail();
        validatePhone();
        validateNumber();
        validateMessage();
        // Возвращаем true если все поля валидны
        return nameState && emailState && messageState && numberState && phoneState;
    };
    //счетчик ограничения символов
    function countMessageLength() {
        message.addEventListener("input", (event) => {
            messageLength.textContent = `${message.value.length}/ 200`;
        });
    }
    // Отправка формы
    submitBtn.addEventListener("click", (event) => {
        event.preventDefault();
        validateForm();
        if (nameState && emailState && numberState && messageState) {
            const formData = new FormData(form);
            const jsonData = {
                name: formData.get("name-complaint"),
                email: formData.get("email-complaint"),
                phone: formData.get("phone-complaint"),
                complaint: formData.get("message-complaint"),
                orderNum: formData.get("number-complaint")
            };
            fetch(`https://${window.location.host}/api/complaint/setcomplaint/index.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(jsonData)
            })
                .then((res) => res.json())
                .then((data) => {
                if (data.success) {
                    modal.style.display = "block";
                }
                if (modalOverlay) {
                    modalOverlay.style.display = "block";
                    setTimeout(() => {
                        modalOverlay.style.display = "none";
                        modal.style.display = "none";
                    }, 3000);
                    clearForm();
                }
                else {
                    console.log("Произошла ошибка при отправке формы");
                }
            })
                .then((data) => {
                name.value = "";
                email.value = "";
                phone.value = "";
                number.value = "";
                message.value = "";
            })
                .catch((error) => {
                console.error("Error", error);
                console.log("Произошла ошибка при отправке формы");
            });
        }
        else {
            console.log("что-то пошло не так");
        }
        clearForm();
    });
    countMessageLength();
}

"use strict";
if (document.querySelector(".contacts")) {
    let mapContainer = document.querySelector(".contacts__map");
    let dataMarker = mapContainer.getAttribute("data-marker") || "";
    let position = dataMarker.split(", ");
    ymaps.ready(function () {
        const myMap = new ymaps.Map(document.querySelector(".contacts__map"), {
            center: position,
            controls: ['zoomControl'],
            zoom: 16
        }, null), myPlacemark = new ymaps.Placemark(myMap.getCenter(), null, {
            // Опции.
            // Необходимо указать данный тип макета.
            iconLayout: 'default#image',
            // Своё изображение иконки метки.
            iconImageHref: '/img/icon_on_the_map.svg',
            // Размеры метки.
            iconImageSize: [32, 41],
            // Смещение левого верхнего угла иконки относительно
            // её "ножки" (точки привязки).
            iconImageOffset: [-18, -38]
        });
        myMap.geoObjects.add(myPlacemark);
    });
}

"use strict";

"use strict";

"use strict";
if (document.querySelector(".faq")) {
    document.querySelectorAll(".tab__title").forEach((tabTitle) => {
        tabTitle.addEventListener("click", function () {
            const tabContent = this.nextElementSibling;
            const svgIcon = this.querySelector(".svg");
            if (tabContent.classList.contains("open")) {
                tabContent.style.maxHeight = "0";
                tabContent.classList.remove("open");
                svgIcon.classList.remove("open");
            }
            else {
                tabContent.style.maxHeight = tabContent.scrollHeight + "px";
                tabContent.classList.add("open");
                svgIcon.classList.add("open");
            }
        });
    });
}

"use strict";

"use strict";
// if(document.querySelector('.footer')) {
//   const footerPhone = document.querySelector('.footer__logo__contact__phone') as HTMLAnchorElement;
//   const footerPhoneSpan = document.querySelector('.footer__logo__contact__phone span') as HTMLSpanElement;
//
//   //переключение через utm метки
//   if (sessionStorage.getItem("tel") && sessionStorage.getItem("phone")) {
//     footerPhone.href = `tel:${sessionStorage.getItem("tel")}`;
//     footerPhoneSpan.textContent = sessionStorage.getItem("phone");
//   }
// }
document.addEventListener("DOMContentLoaded", () => {
    const footerPhone = document.querySelector(".footer__logo__contact__phone");
    const footerPhoneSpan = document.querySelector(".footer__logo__contact__phone span");
    const tel = sessionStorage.getItem("tel");
    const phone = sessionStorage.getItem("phone");
    if (tel && phone) {
        footerPhone.href = `tel:${tel}`;
        footerPhoneSpan.textContent = phone;
    }
});

"use strict";

"use strict";
if (document.querySelector(".header")) {
    const headerPage = document.querySelector(".header");
    const createCitySelectorHandlers = () => {
        const openSelected = document.querySelector(".header__top__city_selected");
        const cityListWrapper = document.querySelector(".header__top__city__list");
        const cityList = document.querySelectorAll(".header__top__city__item");
        // Проверяем наличие данных в sessionStorage
        //     const tel = sessionStorage.getItem("tel");
        //     const phone = sessionStorage.getItem("phone");
        //
        //     if (tel && phone) {
        //       // Если данные присутствуют, обновляем элементы DOM
        //       headerPhone.href = `tel:${tel}`;
        //       headerPhoneSpan.textContent = phone;
        //     }
        const handleOpenMouseOver = (event) => {
            event.preventDefault();
            cityListWrapper.style.display = "block";
        };
        const handleOpenMouseLeave = () => {
            setTimeout(() => {
                if (!cityListWrapper.matches(":hover")) {
                    cityListWrapper.style.display = "none";
                }
            }, 200);
        };
        const handleWrapperMouseLeave = () => {
            setTimeout(() => {
                if (!openSelected.matches(":hover")) {
                    cityListWrapper.style.display = "none";
                }
            }, 200);
        };
        const handleWindowClick = (event) => {
            if (!openSelected.contains(event.target) && !cityListWrapper.contains(event.target)) {
                cityListWrapper.style.display = "none";
            }
        };
        const handleOpenClick = (event) => {
            event.stopPropagation();
            cityListWrapper.style.display = cityListWrapper.style.display === "block" ? "none" : "block";
        };
        const handleWrapperClick = (event) => {
            event.stopPropagation();
        };
        const handleCityClick = (event) => {
            event.preventDefault();
            const target = event.currentTarget;
            const selectedCity = target.innerText.trim();
            
            // Находим ссылку внутри элемента
            const link = target.querySelector("a");
            const href = link ? link.getAttribute("href") : null;
            
            // Строим URL с сохранением текущей страницы
            const cityUrl = buildCityUrlForRedirect(selectedCity, href);
            
            if (cityUrl) {
                window.location.href = cityUrl;
                return;
            }
            
            // Fallback: просто меняем текст если редирект не удался
            const span = openSelected.querySelector("span");
            if (span) {
                span.innerText = selectedCity;
            }
            cityList.forEach(el => el.classList.remove("header__top__city__item_checked"));
            target.classList.add("header__top__city__item_checked");
            cityListWrapper.style.display = "none";
        };
        openSelected.addEventListener("mouseover", handleOpenMouseOver);
        openSelected.addEventListener("mouseleave", handleOpenMouseLeave);
        cityListWrapper.addEventListener("mouseleave", handleWrapperMouseLeave);
        window.addEventListener("click", handleWindowClick);
        openSelected.addEventListener("click", handleOpenClick);
        cityListWrapper.addEventListener("click", handleWrapperClick);
        cityList.forEach(city => {
            // @ts-ignore
            city.addEventListener("click", handleCityClick);
        });
    };
    const createCitySelectorBurger = () => {
        const openBurgerSelected = document.querySelector(".header__top__city_selected__burger");
        const cityListBurgerWrapper = document.querySelector(".header__top__city__list__burger");
        const cityListBurger = document.querySelectorAll(".header__top__city__burger__item");
        const handleOpenBurgerMouseOver = (event) => {
            event.preventDefault();
            cityListBurgerWrapper.style.display = "block";
        };
        const handleOpenBurgerMouseLeave = () => {
            setTimeout(() => {
                if (!cityListBurgerWrapper.matches(":hover")) {
                    cityListBurgerWrapper.style.display = "none";
                }
            }, 200);
        };
        const handleWrapperBurgerMouseLeave = () => {
            setTimeout(() => {
                if (!openBurgerSelected.matches(":hover")) {
                    cityListBurgerWrapper.style.display = "none";
                }
            }, 200);
        };
        const handleWindowClick = (event) => {
            if (!openBurgerSelected.contains(event.target) && !cityListBurgerWrapper.contains(event.target)) {
                cityListBurgerWrapper.style.display = "none";
            }
        };
        const handleOpenBurgerClick = (event) => {
            event.stopPropagation();
            cityListBurgerWrapper.style.display = cityListBurgerWrapper.style.display === "block" ? "none" : "block";
        };
        const handleWrapperBurgerClick = (event) => {
            event.stopPropagation();
        };
        const handleCityBurgerClick = (event) => {
            event.preventDefault();
            const target = event.currentTarget;
            const selectedCity = target.innerText.trim();
            
            // Находим ссылку внутри элемента
            const link = target.querySelector("a");
            const href = link ? link.getAttribute("href") : null;
            
            // Строим URL с сохранением текущей страницы
            const cityUrl = buildCityUrlForRedirect(selectedCity, href);
            
            if (cityUrl) {
                window.location.href = cityUrl;
                return;
            }
            
            // Fallback: просто меняем текст если редирект не удался
            const span = openBurgerSelected.querySelector("span");
            if (span) {
                span.innerText = selectedCity;
            }
            cityListBurger.forEach(el => el.classList.remove("header__top__city__item_checked"));
            target.classList.add("header__top__city__item_checked");
            cityListBurgerWrapper.style.display = "none";
        };
        openBurgerSelected.addEventListener("mouseover", handleOpenBurgerMouseOver);
        openBurgerSelected.addEventListener("mouseleave", handleOpenBurgerMouseLeave);
        cityListBurgerWrapper.addEventListener("mouseleave", handleWrapperBurgerMouseLeave);
        window.addEventListener("click", handleWindowClick);
        openBurgerSelected.addEventListener("click", handleOpenBurgerClick);
        cityListBurgerWrapper.addEventListener("click", handleWrapperBurgerClick);
        cityListBurger.forEach(city => {
            // @ts-ignore
            city.addEventListener("click", handleCityBurgerClick);
        });
    };
    const createServiceSelectorHandlers = () => {
        const openBottomSelector = document.querySelector(".header__bottom__navigation__item_selected");
        const servicesListWrapper = document.getElementById("services__list");
        const handleOpenMouseOver = (event) => {
            event.preventDefault();
            servicesListWrapper.classList.add("header__bottom__services__list-active");
        };
        const handleOpenMouseLeave = () => {
            setTimeout(() => {
                if (!servicesListWrapper.matches(":hover")) {
                    servicesListWrapper.style.display = "none";
                    servicesListWrapper.classList.remove("header__bottom__services__list-active");
                }
            }, 200);
        };
        const handleWrapperMouseLeave = () => {
            setTimeout(() => {
                if (!openBottomSelector.matches(":hover")) {
                    servicesListWrapper.style.display = "none";
                }
            }, 200);
        };
        const handleWindowClick = (event) => {
            if (!openBottomSelector.contains(event.target)) {
                servicesListWrapper.style.display = "none";
            }
        };
        const handleOpenClick = (event) => {
            event.stopPropagation();
            servicesListWrapper.style.display = servicesListWrapper.style.display === "block" ? "none" : "block";
        };
        openBottomSelector.addEventListener("mouseover", handleOpenMouseOver);
        openBottomSelector.addEventListener("mouseleave", handleOpenMouseLeave);
        servicesListWrapper.addEventListener("mouseleave", handleWrapperMouseLeave);
        window.addEventListener("click", handleWindowClick);
        openBottomSelector.addEventListener("click", handleOpenClick);
        //
        // const openFeedbackModal = () => {
        //   const headerForm = document.querySelectorAll(".headerForm");
        //   headerForm.forEach(elem => {
        //     elem.addEventListener("click", function(event: Event) {
        //       event.preventDefault();
        //       const modal = document.querySelector(".header-form") as HTMLDivElement;
        //       const modalOverlay = document.querySelector(".overlay") as HTMLDivElement;
        //
        //       modal.style.display = "flex";
        //       modalOverlay.style.display = "block";
        //     });
        //   })
        // }
        //
        // openFeedbackModal();
    };
    const createHeaderHandlers = () => {
        const reviewsList = document.querySelector(".reviews-list");
        const updateHeaderBackground = (isScroll) => {
            if (isScroll || reviewsList) {
                headerPage.style.backgroundColor = "#fff";
                localStorage.setItem("headerBackground", "#fff");
            }
            else {
                headerPage.style.backgroundColor = "transparent";
                localStorage.setItem("headerBackground", "transparent");
            }
        };
        const handleScroll = () => {
            const isScroll = window.scrollY > 0;
            updateHeaderBackground(isScroll);
        };
        // Устанавливаем фон заголовка при загрузке страницы
        const savedBackground = sessionStorage.getItem("headerBackground");
        if (savedBackground) {
            headerPage.style.backgroundColor = savedBackground;
        }
        else {
            headerPage.style.backgroundColor = "transparent"; // Начальное состояние
        }
        handleScroll();
        window.addEventListener("scroll", handleScroll);
    };
    const createBurgerMenuHandlers = () => {
        const burgerMenu = document.querySelector(".header__burger");
        const navMenu = document.querySelector(".header__burger__menu");
        const handleBurgerClick = () => {
            navMenu.classList.toggle("header__burger__menu__active");
            burgerMenu.classList.toggle("active");
            headerPage.style.backgroundColor = "white";
        };
        burgerMenu.addEventListener("click", handleBurgerClick);
    };
    createCitySelectorHandlers();
    createCitySelectorBurger();
    createServiceSelectorHandlers();
    createHeaderHandlers();
    createBurgerMenuHandlers();
}
// const openModalForm = () => {
//   const order = document.querySelectorAll(".order");
//
//   order.forEach(el => {
//     el.addEventListener("click", function (event: Event) {
//       event.preventDefault();
//
//       const urlParams = new URLSearchParams(window.location.search);
//       const hasUtmParams = urlParams.has('utm_source') || urlParams.has('utm_medium') || urlParams.has('utm_campaign');
//
//       const modal = document.querySelector(".modal-form") as HTMLDivElement;
//       const modalForm = document.querySelector(".modal-form__container") as HTMLElement;
//       const modalSale = document.querySelector(".modal-form__formSale") as HTMLDivElement;
//       const modalOverlay = document.querySelector(".overlay") as HTMLDivElement;
//
//
//       modalSale.style.display = "block";
//
//       modal.style.display = "flex";
//       modalForm.style.display = "block";
//       modalOverlay.style.display = "block";
//
//       if (hasUtmParams && window.location.pathname == "/") {
//         modalSale.style.display = "none";
//       }
//     });
//   });
// };
const openModalForm = () => {
    const orderElements = document.querySelectorAll(".order");
    orderElements.forEach(el => {
        el.addEventListener("click", function (event) {
            event.preventDefault();
            const urlParams = new URLSearchParams(window.location.search);
            const hasAnyUtmParams = Array.from(urlParams.keys()).some(key => key.startsWith('utm_'));
            const modal = document.querySelector(".modal-form");
            const modalForm = document.querySelector(".modal-form__container");
            const modalSale = document.querySelector(".modal-form__formSale");
            const modalOverlay = document.querySelector(".overlay");
            // По умолчанию показываем все модальные элементы
            modal.style.display = "flex";
            modalForm.style.display = "block";
            modalOverlay.style.display = "block";
            modalSale.style.display = "block"; // Показываем modalSale по умолчанию
            // Скрываем modalSale, если присутствуют любые utm-параметры
            if (hasAnyUtmParams && window.location.pathname === "/") {
                modalSale.style.display = "none";
            }
        });
    });
};
openModalForm();
document.addEventListener("DOMContentLoaded", () => {
    const headerForm = document.querySelectorAll(".headerForm");
    headerForm.forEach(elem => {
        elem.addEventListener("click", function (event) {
            event.preventDefault();
            const modal = document.querySelector(".header-form");
            const modalOverlay = document.querySelector(".overlay");
            modal.style.display = "flex";
            modalOverlay.style.display = "block";
        });
    });
});
// document.addEventListener("DOMContentLoaded", () => {
//   const headerPhone = document.querySelector(".header__top__phone") as HTMLAnchorElement;
//   const headerPhoneSpan = document.querySelector(".header__top__phone span") as HTMLSpanElement;
//
//   const tel = sessionStorage.getItem("tel");
//   const phone = sessionStorage.getItem("phone");
//
//
//   if (tel && phone) {
//     headerPhone.href = `tel:${tel}`;
//     headerPhoneSpan.textContent = phone;
//   }
// });
document.addEventListener("DOMContentLoaded", () => {
    const headerPhone = document.querySelector(".header__top__phone");
    const headerPhoneSpan = document.querySelector(".header__top__phone .phone-number");
    const tel = sessionStorage.getItem("tel");
    const phone = sessionStorage.getItem("phone");
    if (headerPhone && headerPhoneSpan && tel && phone) {
        headerPhone.href = `tel:${tel}`;
        headerPhoneSpan.textContent = phone;
    }
});

"use strict";
if (document.querySelector(".header-form")) {
    const headerForm = document.getElementById("header-form");
    const name = document.getElementById("name-header-form");
    const phone = document.getElementById("phone-header-form");
    const headerSubmitBtn = document.querySelector(".header-form__btn");
    const closeHeaderModal = document.querySelector(".header-form__btn-close");
    const modal = document.querySelector(".header-form");
    let nameHeaderFormState = false;
    let phoneHeaderFormState = false;
    function clearForm() {
        name.value = "";
        phone.value = "";
    }
    function validateName() {
        if (name.value.trim() !== "") {
            nameHeaderFormState = true;
            name.classList.remove("error");
        }
        else {
            nameHeaderFormState = false;
            name.classList.add("error");
        }
    }
    function validatePhone() {
        if (phone.value.trim() !== "") {
            phoneHeaderFormState = true;
            phone.classList.remove("error");
        }
        else {
            phoneHeaderFormState = false;
            phone.classList.add("error");
        }
    }
    function handleFormSubmit() {
        validateName();
        validatePhone();
        if (nameHeaderFormState && phoneHeaderFormState) {
            const formData = new FormData(headerForm);
            const jsonData = {
                name: formData.get("header-name"),
                phone: formData.get("header-phone"),
                services: "Перезвонить клиенту ",
                date: new Date()
            };
            fetch(`https://${document.location.host}/api/lead/setLead/index.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(jsonData)
            })
                .then((res) => res.json())
                .then((data) => {
                if (data.success) {
                    clearForm();
                    formModalClose();
                    thanksApplication();
                }
                else {
                    console.error(data.error);
                    console.log("Что-то пошло не так");
                }
            });
        }
    }
    headerSubmitBtn.addEventListener("click", handleFormSubmit);
    phone.addEventListener("input", onPhone);
    function onPhone(event) {
        const input = event.target;
        const value = input.value.replace(/\D/g, "");
        const formattedValue = formatPhoneNumber(value);
        input.value = formattedValue;
    }
    function formatPhoneNumber(value) {
        // Удаляем все нецифровые символы и добавляем префикс 7, если отсутствует
        value = value.replace(/\D/g, "");
        if (!value.startsWith("7")) {
            value = "7" + value;
        }
        const phonePattern = [
            { pattern: "(", length: 1 },
            { pattern: ")", length: 4 },
            { pattern: " ", length: 4 },
            { pattern: "-", length: 7 },
            { pattern: "-", length: 9 }
        ];
        let formattedValue = "+7 ";
        let index = 1;
        for (let i = 0; i < phonePattern.length; i++) {
            const { pattern, length } = phonePattern[i];
            if (value.length > length) {
                formattedValue += value.slice(index, length) + pattern;
                index = length;
            }
        }
        formattedValue += value.slice(index);
        return formattedValue;
    }
    function formModalClose() {
        modal.style.display = "none";
    }
    function btnFormClose() {
        closeHeaderModal.addEventListener("click", () => {
            modal.style.display = "none";
            modalOverlay.style.display = "none";
        });
    }
    btnFormClose();
    function thanksApplication() {
        const thanksApplication = document.querySelector(".modal-form__thanks-application");
        thanksApplication.style.display = "block";
        modalOverlay.style.display = "block";
    }
    function closeThanksApplication() {
        const closeBtn = document.querySelector(".modal-form__thanks-application-btn");
        const closeBtnCross = document.querySelector(".modal-form__thanks-application-btn-cross");
        const thanksApplication = document.querySelector(".modal-form__thanks-application");
        closeBtn.addEventListener("click", () => {
            thanksApplication.style.display = "none";
            modalOverlay.style.display = "none";
            modal.style.display = "none";
        });
        closeBtnCross.addEventListener("click", () => {
            thanksApplication.style.display = "none";
            modalOverlay.style.display = "none";
            modal.style.display = "none";
        });
    }
    closeThanksApplication();
}
// const openFeedbackModal = () => {
//   const headerForm = document.querySelectorAll(".headerForm");
//   headerForm.forEach(elem => {
//     elem.addEventListener("click", function(event: Event) {
//       event.preventDefault();
//       const modal = document.querySelector(".header-form") as HTMLDivElement;
//       const modalOverlay = document.querySelector(".overlay") as HTMLDivElement;
//
//       modal.style.display = "flex";
//       modalOverlay.style.display = "block";
//     });
//   })
// }
//
// openFeedbackModal()

"use strict";

"use strict";

"use strict";
if (document.querySelector(".leave-feedback")) {
    const form = document.querySelector(".leave-feedback__form");
    const name = document.getElementById("name-feedback");
    const email = document.getElementById("email-feedback");
    const message = document.getElementById("message-feedback");
    const number = document.getElementById("number-feedback");
    const submitBtn = document.querySelector(".leave-feedback__form-btn");
    const messageLength = message.nextElementSibling;
    const modal = document.querySelector(".modal-form__thanks-application-feedback");
    let elements = document.getElementsByTagName('main');
    let dataCity = elements.length > 0 ? elements[0].getAttribute("data-city") : null;
    //покраска звезд
    let starsContainer = document.querySelector(".leave-feedback svg");
    let stars = Array.from(document.querySelectorAll(".leave-feedback svg"));
    let stateStars = false;
    let counterStars = 5;
    for (let i = 0; i < stars.length; i++) {
        stars[i].addEventListener("mouseover", () => {
            clearFillStars();
            fillStars(i);
        });
    }
    for (let i = 0; i < stars.length; i++) {
        stars[i].addEventListener("click", () => {
            clearStateStars();
            fillStars(i);
            counterStars = i + 1;
            stars[i].classList.add("checked");
            stateStars = true;
        });
    }
    starsContainer.addEventListener("mouseout", () => {
        !stateStars ? clearFillStars() : null;
        counterStars != 0 ? fillStars(counterStars - 1) : null;
    });
    function defaultStateStars() {
        stars.forEach((star) => {
            let elem = star.querySelector("path");
            elem.style.fill = "#FFA800";
            counterStars = 5;
        });
    }
    function clearStateStars() {
        for (let j = 0; j < stars.length; j++) {
            stars[j].classList.remove("checked");
        }
    }
    function clearFillStars() {
        for (let j = 0; j < stars.length; j++) {
            let elem = stars[j].querySelector("path");
            elem.style.fill = "#FFF";
        }
    }
    function fillStars(i) {
        for (let j = 0; j <= i; j++) {
            let elem = stars[j].querySelector("path");
            switch (i) {
                case 0:
                    elem.style.fill = "#FFA800";
                    break;
                case 1:
                    elem.style.fill = "#FFA800";
                    break;
                case 2:
                    elem.style.fill = "#FFA800";
                    break;
                case 3:
                    elem.style.fill = "#FFA800";
                    break;
                case 4:
                    elem.style.fill = "#FFA800";
                    break;
            }
        }
    }
    let nameState = false;
    let emailState = false;
    let messageState = false;
    let numberState = false;
    function clearForm() {
        name.value = "";
        email.value = "";
        number.value = "";
        message.value = "";
        nameState = false;
        emailState = false;
        numberState = false;
        messageState = false;
        messageLength.textContent = "0 / 1000";
        clearFillStars();
        clearStateStars();
        defaultStateStars();
    }
    function validateName() {
        if (name.value !== "") {
            nameState = true;
            name.classList.remove("error");
        }
        else {
            nameState = false;
            name.classList.add("error");
        }
    }
    function validateEmail() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email.value !== "" && emailRegex.test(email.value)) {
            email.classList.remove("error");
            emailState = true;
        }
        else {
            emailState = false;
            email.classList.add("error");
        }
    }
    function validateApplicationNumber() {
        if (number.value !== "") {
            numberState = true;
            number.classList.remove("error");
        }
        else {
            numberState = false;
            number.classList.add("error");
        }
    }
    function validateMessage() {
        if (message.value !== "") {
            messageState = true;
            message.classList.remove("error");
        }
        else {
            messageState = false;
            message.classList.add("error");
        }
    }
    //Счетчик символов
    function countMessageLength() {
        message.addEventListener("input", (event) => {
            messageLength.textContent = `${message.value.length}/ 1000`;
        });
    }
    submitBtn.addEventListener("click", function (event) {
        event.preventDefault();
        validateName();
        validateEmail();
        validateApplicationNumber();
        validateMessage();
        if (nameState && emailState && numberState && messageState) {
            const formData = new FormData(form);
            const jsonData = {
                name: formData.get("name-feedback"),
                email: formData.get("email-feedback"),
                order: formData.get("number-feedback"),
                review: formData.get("message-feedback"),
                rating: counterStars,
                city: dataCity,
            };
            fetch(`https://${window.location.host}/api/reviews/setReview/index.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(jsonData)
            })
                .then((res) => res.json())
                .then((data) => {
                if (data.success) {
                    if (modal) {
                        modal.style.display = "block";
                    }
                    if (modalOverlay) {
                        modalOverlay.style.display = "block";
                        setTimeout(() => {
                            modalOverlay.style.display = "none";
                            modal.style.display = "none";
                        }, 3000);
                        clearForm();
                    }
                }
                else {
                    alert("Произошла ошибка при отправке формы");
                }
            })
                .then((data) => {
                name.value = "";
                email.value = "";
                number.value = "";
                message.value = "";
            })
                .catch((error) => {
                console.error("Error:", error);
                alert("Произошла ошибка при отправке формы");
            });
        }
        else {
            console.log("что-то пошло не так");
        }
        clearForm();
    });
    countMessageLength();
}

"use strict";
if (document.querySelector(".masters")) {
    const mastersSwiper = new Swiper(".masters__swiper", {
        speed: 500,
        spaceBetween: 0,
        centeredSlides: false,
        allowTouchMove: true,
        slidesPerView: "auto",
        autoplay: false,
        loop: false,
        navigation: {
            nextEl: ".masters .swiper-button-next", // Navigation buttons
            prevEl: ".masters .swiper-button-prev"
        },
        disableOnInteraction: true
    });
}

"use strict";
if (document.querySelector(".meter-brands")) {
    function allowTouchMove() {
        //   return window.innerWidth <= 1024;
        return true;
    }
    const swiperPartners = new Swiper(".meter-brands__swiper", {
        loop: true,
        spaceBetween: 0,
        centeredSlides: false,
        allowTouchMove: false,
        navigation: {
            nextEl: ".meter-brands .swiper-button-next",
            prevEl: ".meter-brands .swiper-button-prev"
        },
        speed: 4000, // Скорость анимации перехода
        autoplay: {
            delay: 0
        },
        slidesPerView: "auto",
        disableOnInteraction: false
    });
}

"use strict";
if (document.querySelector(".modal-form")) {
    const formModal = document.getElementById("modalForm-modal-form");
    const name = document.getElementById("name-modal-form");
    const phone = document.getElementById("phone-modal-form");
    const checkbox = document.getElementById("modal-form-checked");
    const errorCheckbox = document.getElementById("error");
    const submitBtnModal = document.querySelector(".modal-form__btn");
    const submitBtnModalSale = document.querySelector(".modal-form__formSale-btn");
    const list = document.querySelector(".modal-form-select__list");
    const modalForm = document.querySelector(".modal-form__container");
    const modal = document.querySelector(".modal-form");
    const thanksApplicationModal = document.querySelector(".modal-form__thanks-application");
    let nameModalState = false;
    let phoneModalState = false;
    function closeModalForm() {
        // modal.style.display = "none";
        modalForm.style.display = "none";
        modalForm.classList.remove("sale");
        modalOverlay.style.display = "none";
    }
    function closeApplicationBtn() {
        thanksApplicationModal.style.display = "none";
        modalOverlay.style.display = "none";
        modal.style.display = "none";
    }
    function clearForm() {
        name.value = "";
        phone.value = "";
    }
    function validateCheckbox() {
        if (!checkbox.checked) {
            errorCheckbox.style.display = "block"; // Показываем сообщение об ошибке
            return false; // Останавливаем отправку формы
        }
        else {
            errorCheckbox.style.display = "none"; // Скрываем сообщение об ошибке
            return true; // Разрешаем отправку формы
        }
    }
    function validateName() {
        if (name.value.trim() !== "") {
            nameModalState = true;
            name.classList.remove("error");
        }
        else {
            nameModalState = false;
            name.classList.add("error");
        }
    }
    function validatePhone() {
        if (phone.value.trim() !== "") {
            phoneModalState = true;
            phone.classList.remove("error");
        }
        else {
            phoneModalState = false;
            phone.classList.add("error");
        }
    }
    function getCheckedValue() {
        const selected = document.querySelector(".modal-form-select__checked");
        return selected ? selected.textContent : "";
    }
    function handleFormSubmit(percentValue, saleValue) {
        validateName();
        validatePhone();
        validateCheckbox();
        if (nameModalState && phoneModalState && checkbox.checked) {
            const formData = new FormData(formModal);
            const jsonData = {
                name: formData.get("name"),
                phone: formData.get("phone"),
                percent: percentValue,
                sale: saleValue,
                services: getCheckedValue(),
                date: new Date()
            };
            fetch(`https://${document.location.host}/api/lead/setLead/index.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(jsonData)
            })
                .then((res) => res.json())
                .then((data) => {
                if (data.success) {
                    clearForm();
                    formModalClose();
                    thanksApplication();
                    // setTimeout(() => {
                    //   modalOverlay.style.display = "none";
                    // }, 2000);
                }
                else {
                    console.log("При отправке заявки произошла ошибка.");
                }
            })
                .catch((error) => {
                console.error("Error:", error);
                alert("При отправке заявки произошла ошибка.");
            });
        }
        else {
            console.log("Заполните все поля формы!");
        }
    }
    function updateTitle() {
        const modalFormTitle = document.querySelector(".modal-form__title span");
        if (modalForm.classList.contains("sale")) {
            modalFormTitle.textContent = " сегодня со скидкой";
        }
        else {
            modalFormTitle.textContent = " сегодня!";
        }
    }
    updateTitle();
    submitBtnModal.addEventListener("click", function (event) {
        event.preventDefault();
        if (modalForm.classList.contains("sale")) {
            handleFormSubmit(10, true);
        }
        else {
            handleFormSubmit(0, false);
        }
        updateTitle();
    });
    submitBtnModalSale.addEventListener("click", function (event) {
        event.preventDefault();
        modalForm.style.display = "block";
        modalForm.classList.add("sale");
        updateTitle();
    });
    phone.addEventListener("input", onPhone);
    // Открытие селекта в форме
    const createServiceSelectorHandlers = () => {
        const openSelectedAbout = document.querySelector(".modal-form-select");
        openSelectedAbout.addEventListener("click", (event) => {
            event.preventDefault();
            // Переключение класса open для селекта и списка
            const isOpen = openSelectedAbout.classList.toggle("open");
            if (list) {
                list.classList.toggle("open", isOpen);
            }
        });
        function initializeSelectList() {
            if (!list)
                return;
            const items = Array.from(list.querySelectorAll(".modal-form-select__item"));
            items.forEach(item => {
                item.addEventListener("click", () => {
                    items.forEach(i => {
                        i.classList.remove("modal-form-select__checked");
                        i.style.color = "#666666";
                    });
                    item.classList.add("modal-form-select__checked");
                    list.insertBefore(item, list.firstChild);
                    if (item.classList.contains("modal-form-select__checked")) {
                        item.style.color = "#175CAB";
                    }
                });
            });
        }
        initializeSelectList();
    };
    createServiceSelectorHandlers();
    function onPhone(event) {
        const input = event.target;
        const value = input.value.replace(/\D/g, "");
        const formattedValue = formatPhoneNumber(value);
        input.value = formattedValue;
    }
    function formatPhoneNumber(value) {
        // Удаляем все нецифровые символы и добавляем префикс 7, если отсутствует
        value = value.replace(/\D/g, "");
        if (!value.startsWith("7")) {
            value = "7" + value;
        }
        const phonePattern = [
            { pattern: "(", length: 1 },
            { pattern: ")", length: 4 },
            { pattern: " ", length: 4 },
            { pattern: "-", length: 7 },
            { pattern: "-", length: 9 }
        ];
        let formattedValue = "+7 ";
        let index = 1;
        for (let i = 0; i < phonePattern.length; i++) {
            const { pattern, length } = phonePattern[i];
            if (value.length > length) {
                formattedValue += value.slice(index, length) + pattern;
                index = length;
            }
        }
        formattedValue += value.slice(index);
        return formattedValue;
    }
    function modalFormClose() {
        const modalFormCloseBtn = document.querySelector(".modal-form__btn-close");
        modalFormCloseBtn.addEventListener("click", () => {
            closeModalForm();
            updateTitle();
            const urlParams = new URLSearchParams(window.location.search);
            const hasUtmParams = urlParams.has("utm_source") || urlParams.has("utm_medium") || urlParams.has("utm_campaign");
            if (hasUtmParams && window.location.pathname == "/") {
                const modal = document.querySelector(".modal-form");
                modal.style.display = "none";
            }
        });
    }
    function formModalClose() {
        const modalSale = document.querySelector(".modal-form__formSale");
        modalSale.style.display = "none";
        closeModalForm();
        updateTitle();
    }
    function modalSaleClose() {
        const modalSaleRefusal = document.querySelector(".modal-form__formSale-close");
        const modalSaleClose = document.querySelector(".modal-form__close");
        modalSaleClose.addEventListener("click", () => {
            const modalSale = document.querySelector(".modal-form__formSale");
            modalSale.style.display = "none";
            modal.style.display = "none";
            closeModalForm();
            updateTitle();
        });
        modalSaleRefusal.addEventListener("click", () => {
            const modalSale = document.querySelector(".modal-form__formSale");
            modalSale.style.display = "none";
            modal.style.display = "none";
            closeModalForm();
            updateTitle();
        });
    }
    function thanksApplication() {
        thanksApplicationModal.style.display = "block";
        modalOverlay.style.display = "block";
    }
    function closeThanksApplication() {
        const closeBtn = document.querySelector(".modal-form__thanks-application-btn");
        const closeBtnCross = document.querySelector(".modal-form__thanks-application-btn-cross");
        closeBtn.addEventListener("click", () => {
            closeApplicationBtn();
        });
        closeBtnCross.addEventListener("click", () => {
            closeApplicationBtn();
        });
    }
    modalFormClose();
    modalSaleClose();
    closeThanksApplication();
}
const modalOverlay = document.createElement("div");
//добовление оверлея в DOM
modalOverlay.classList.add("overlay");
document.body.appendChild(modalOverlay);
modalOverlay.style.display = ("none");

"use strict";
if (document.querySelector(".moderation-complaint")) {
    let selectArr = Array.from(document.querySelectorAll(".select"));
    selectArr.forEach(item => {
        let value = item.querySelector(".select__value");
        let valueSpan = value.querySelector("span");
        value === null || value === void 0 ? void 0 : value.addEventListener("click", () => {
            item.classList.toggle("select--opened");
        });
        let elems = Array.from(item.querySelectorAll(".select__list__item"));
        function clearStateElems() {
            elems.forEach(elem => {
                elem.classList.remove("select__list__item--checked");
            });
        }
        elems.forEach(elem => {
            elem.addEventListener("click", () => {
                valueSpan.textContent = elem.textContent;
                clearStateElems();
                elem.classList.add("select__list__item--checked");
                item.classList.remove("select--opened");
            });
        });
        document.addEventListener("click", (event) => {
            const target = event.target;
            if (!item.contains(target) && !item.contains(target)) {
                item.classList.remove("select--opened");
            }
        });
    });
    let moderationReviewsWrapper = document.querySelector(".moderation-complaint__list");
    let moderationReviewsLoadMoreBtn = document.querySelector(".moderation-complaint__load-more button");
    let templateCard = document.querySelector(".moderation-complaint__list template");
    let searchBtn = document.querySelector(".moderation-complaint__filters__column__search-btn");
    let counter = 10;
    //filters
    let filterCity = document.querySelector(".moderation-complaint__filters__column__city .select__value span");
    let filterIP = document.querySelector(".moderation-complaint__filters__column__ip .select__value span");
    let filterDateStart = document.querySelector(".moderation-complaint__filters__column__date-start input");
    let filterDateEnd = document.querySelector(".moderation-complaint__filters__column__date-end input");
    function renderItem(item) {
        let template = templateCard.content.cloneNode(true);
        let name = template.querySelector(".moderation-complaint__list__item__name input");
        let phone = template.querySelector(".moderation-complaint__list__item__phone input");
        let email = template.querySelector(".moderation-complaint__list__item__email input");
        let date = template.querySelector(".moderation-complaint__list__item__date input");
        let ip = template.querySelector(".moderation-complaint__list__item__ip input");
        let city = template.querySelector(".moderation-complaint__list__item__city input");
        let complaint = template.querySelector(".moderation-complaint__list__item__complaint input");
        function formatDate(inputDateString) {
            const date = new Date(inputDateString);
            const day = ("0" + date.getDate()).slice(-2);
            const month = ("0" + (date.getMonth() + 1)).slice(-2);
            const year = date.getFullYear();
            return `${day}.${month}.${year}`;
        }
        name && item.name ? name.value = item.name : null;
        phone && item.phone ? phone.value = item.phone : null;
        email && item.email ? email.value = item.email : null;
        date && item.date ? date.value = formatDate(item.date) : null;
        ip && item.ip ? ip.value = item.ip : null;
        city && item.city ? city.value = item.city : null;
        complaint && item.complaint ? complaint.value = item.complaint : null;
        let templateSelectArr = Array.from(template.querySelectorAll(".select"));
        templateSelectArr.forEach(item => {
            let value = item.querySelector(".select__value");
            let valueSpan = value.querySelector("span");
            value === null || value === void 0 ? void 0 : value.addEventListener("click", () => {
                item.classList.toggle("select--opened");
            });
            let elems = Array.from(item.querySelectorAll(".select__list__item"));
            function clearStateElems() {
                elems.forEach(elem => {
                    elem.classList.remove("select__list__item--checked");
                });
            }
            elems.forEach(elem => {
                elem.addEventListener("click", () => {
                    valueSpan.textContent = elem.textContent;
                    clearStateElems();
                    elem.classList.add("select__list__item--checked");
                    item.classList.remove("select--opened");
                });
            });
            document.addEventListener("click", (event) => {
                const target = event.target;
                if (!item.contains(target) && !item.contains(target)) {
                    item.classList.remove("select--opened");
                }
            });
        });
        moderationReviewsWrapper.appendChild(template);
    }
    function renderModerationReviews(data) {
        moderationReviewsWrapper.innerHTML = "";
        data.forEach(item => {
            renderItem(item);
        });
    }
    function addModerationReviews(data) {
        data.forEach(item => {
            renderItem(item);
        });
    }
    searchBtn.addEventListener("click", (evt) => {
        evt.preventDefault();
        counter = 0;
        let url = `https://${window.location.host}/api/complaint/getComplaints/index.php`;
        let data = {
            city: filterCity.textContent,
            ip: filterIP.textContent,
            dateStart: filterDateStart.value,
            dateEnd: filterDateEnd.value,
            counter: counter,
        };
        fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(data)
        })
            .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
            .then(data => {
            renderModerationReviews(data);
            data.length < 10 ? moderationReviewsLoadMoreBtn.style.display = "none" : moderationReviewsLoadMoreBtn.style.display = "flex";
        });
        counter = 10;
    });
    moderationReviewsLoadMoreBtn.addEventListener("click", (evt) => {
        evt.preventDefault();
        let url = `https://${window.location.host}/api/complaint/getComplaints/index.php`;
        let data = {
            city: filterCity.textContent,
            ip: filterIP.textContent,
            dateStart: filterDateStart.value,
            dateEnd: filterDateEnd.value,
            counter: counter,
        };
        fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(data)
        })
            .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
            .then(data => {
            addModerationReviews(data);
            data.length < 10 ? moderationReviewsLoadMoreBtn.style.display = "none" : moderationReviewsLoadMoreBtn.style.display = "flex";
        });
        counter = counter + 10;
    });
}

"use strict";
if (document.querySelector(".moderation-reviews")) {
    let selectArr = Array.from(document.querySelectorAll(".select"));
    selectArr.forEach(item => {
        let value = item.querySelector(".select__value");
        let valueSpan = value.querySelector("span");
        value === null || value === void 0 ? void 0 : value.addEventListener("click", () => {
            item.classList.toggle("select--opened");
        });
        let elems = Array.from(item.querySelectorAll(".select__list__item"));
        function clearStateElems() {
            elems.forEach(elem => {
                elem.classList.remove("select__list__item--checked");
            });
        }
        elems.forEach(elem => {
            elem.addEventListener("click", () => {
                valueSpan.textContent = elem.textContent;
                clearStateElems();
                elem.classList.add("select__list__item--checked");
                item.classList.remove("select--opened");
            });
        });
        document.addEventListener("click", (event) => {
            const target = event.target;
            if (!item.contains(target) && !item.contains(target)) {
                item.classList.remove("select--opened");
            }
        });
    });
    let moderationReviewsWrapper = document.querySelector(".moderation-reviews__list");
    let moderationReviewsLoadMoreBtn = document.querySelector(".moderation-reviews__load-more button");
    let templateCard = document.querySelector(".moderation-reviews__list template");
    let searchBtn = document.querySelector(".moderation-reviews__filters__column__search-btn");
    let counter = 10;
    //filters
    let filterCity = document.querySelector(".moderation-reviews__filters__column__city .select__value span");
    let filterModerationStatus = document.querySelector(".moderation-reviews__filters__column__status .select__value span");
    let filterIP = document.querySelector(".moderation-reviews__filters__column__ip .select__value span");
    let filterDateStart = document.querySelector(".moderation-reviews__filters__column__date-start input");
    let filterDateEnd = document.querySelector(".moderation-reviews__filters__column__date-end input");
    let filterRating1 = document.querySelector(".moderation-reviews__filters__column__rating__one input");
    let filterRating2 = document.querySelector(".moderation-reviews__filters__column__rating__two input");
    let filterRating3 = document.querySelector(".moderation-reviews__filters__column__rating__three input");
    let filterRating4 = document.querySelector(".moderation-reviews__filters__column__rating__four input");
    let filterRating5 = document.querySelector(".moderation-reviews__filters__column__rating__five input");
    function renderItem(item) {
        let template = templateCard.content.cloneNode(true);
        let name = template.querySelector(".moderation-reviews__list__item__name input");
        let date = template.querySelector(".moderation-reviews__list__item__date input");
        let ip = template.querySelector(".moderation-reviews__list__item__ip input");
        let email = template.querySelector(".moderation-reviews__list__item__email input");
        let rating = template.querySelector(".moderation-reviews__list__item__rating .select__value span");
        let status = template.querySelector(".moderation-reviews__list__item__status-moderation .select__value span");
        let city = template.querySelector(".moderation-reviews__list__item__city .select__value span");
        let review = template.querySelector(".moderation-reviews__list__item__review textarea");
        let btnDelete = template.querySelector(".btn-grey");
        let btnUpdate = template.querySelector(".btn-lightblue");
        function formatDate(inputDateString) {
            const date = new Date(inputDateString);
            const day = ("0" + date.getDate()).slice(-2);
            const month = ("0" + (date.getMonth() + 1)).slice(-2);
            const year = date.getFullYear();
            return `${day}.${month}.${year}`;
        }
        name && item.name ? name.value = item.name : null;
        date && item.date ? date.value = formatDate(item.date) : null;
        ip && item.ip ? ip.value = item.ip : null;
        email && item.email ? email.value = item.email : null;
        rating && item.rating ? rating.textContent = item.rating.toString() : null;
        status && item.moderation ? status.textContent = item.moderation == "true" ? "Отмодерирован" : "Неотмодерирован" : null;
        city && item.city ? city.textContent = item.city : null;
        review && item.review ? review.value = item.review : null;
        btnDelete && item.id ? btnDelete.setAttribute("data-id", item.id.toString()) : null;
        btnUpdate && item.id ? btnUpdate.setAttribute("data-id", item.id.toString()) : null;
        let templateSelectArr = Array.from(template.querySelectorAll(".select"));
        templateSelectArr.forEach(item => {
            let value = item.querySelector(".select__value");
            let valueSpan = value.querySelector("span");
            value === null || value === void 0 ? void 0 : value.addEventListener("click", () => {
                item.classList.toggle("select--opened");
            });
            let elems = Array.from(item.querySelectorAll(".select__list__item"));
            function clearStateElems() {
                elems.forEach(elem => {
                    elem.classList.remove("select__list__item--checked");
                });
            }
            elems.forEach(elem => {
                elem.addEventListener("click", () => {
                    valueSpan.textContent = elem.textContent;
                    clearStateElems();
                    elem.classList.add("select__list__item--checked");
                    item.classList.remove("select--opened");
                });
            });
            document.addEventListener("click", (event) => {
                const target = event.target;
                if (!item.contains(target) && !item.contains(target)) {
                    item.classList.remove("select--opened");
                }
            });
        });
        btnDelete.addEventListener("click", (evt) => {
            evt.preventDefault();
            alert("Куда ты жмакаешь! Удалять он собрался)");
        });
        btnUpdate.addEventListener("click", (evt) => {
            evt.preventDefault();
            let url = `https://${window.location.host}/api/reviews/patchModerationReview/index.php`;
            let data = {
                id: item.id,
                email: email.value,
                name: name.value,
                city: city.textContent,
                moderationStatus: status.textContent,
                rating: rating.textContent,
                review: review.value,
            };
            fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: "PATCH",
                body: JSON.stringify(data)
            })
                .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
                .then(data => {
                alert("Сохранено!");
            })
                .catch(error => {
                console.error('Error:', error);
                alert("Произошла ошибка при сохранении!");
            });
        });
        moderationReviewsWrapper.appendChild(template);
    }
    function renderModerationReviews(data) {
        moderationReviewsWrapper.innerHTML = "";
        data.forEach(item => {
            renderItem(item);
        });
    }
    function addModerationReviews(data) {
        data.forEach(item => {
            renderItem(item);
        });
    }
    searchBtn.addEventListener("click", (evt) => {
        evt.preventDefault();
        counter = 0;
        let url = `https://${window.location.host}/api/reviews/getModerationReviews/index.php`;
        let data = {
            city: filterCity.textContent,
            moderationStatus: filterModerationStatus.textContent,
            ip: filterIP.textContent,
            dateStart: filterDateStart.value,
            dateEnd: filterDateEnd.value,
            rating1: filterRating1.checked,
            rating2: filterRating2.checked,
            rating3: filterRating3.checked,
            rating4: filterRating4.checked,
            rating5: filterRating5.checked,
            counter: counter,
        };
        fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(data)
        })
            .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
            .then(data => {
            renderModerationReviews(data);
            data.length < 10 ? moderationReviewsLoadMoreBtn.style.display = "none" : moderationReviewsLoadMoreBtn.style.display = "flex";
        });
        counter = 10;
    });
    moderationReviewsLoadMoreBtn.addEventListener("click", (evt) => {
        evt.preventDefault();
        let url = `https://${window.location.host}/api/reviews/getModerationReviews/index.php`;
        let data = {
            city: filterCity.textContent,
            moderationStatus: filterModerationStatus.textContent,
            ip: filterIP.textContent,
            dateStart: filterDateStart.value,
            dateEnd: filterDateEnd.value,
            rating1: filterRating1.checked,
            rating2: filterRating2.checked,
            rating3: filterRating3.checked,
            rating4: filterRating4.checked,
            rating5: filterRating5.checked,
            counter: counter,
        };
        fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(data)
        })
            .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
            .then(data => {
            addModerationReviews(data);
            data.length < 10 ? moderationReviewsLoadMoreBtn.style.display = "none" : moderationReviewsLoadMoreBtn.style.display = "flex";
        });
        counter = counter + 10;
    });
}

"use strict";
if (document.querySelector(".news")) {
    const newsSwiper = new Swiper(".news__swiper", {
        speed: 500,
        spaceBetween: 0,
        centeredSlides: false,
        allowTouchMove: true,
        slidesPerView: "auto",
        autoplay: false,
        loop: false,
        disableOnInteraction: true,
        navigation: {
            nextEl: ".swiper-button-next", // Fixed selectors to match actual DOM elements
            prevEl: ".swiper-button-prev"
        }
    });
}

"use strict";

"use strict";

"use strict";
if (document.querySelector(".partners")) {
    function allowTouchMove() {
        return false; // Запрещаем движение слайдов
    }
    const swiperPartners = new Swiper(".partners__swiper", {
        loop: true,
        spaceBetween: 0,
        centeredSlides: true,
        slidesPerView: "auto",
        allowTouchMove: allowTouchMove(),
        speed: 3500,
        autoplay: {
            delay: 0,
            disableOnInteraction: false
        },
        navigation: {
            nextEl: ".partners .swiper-button-next", // Navigation buttons
            prevEl: ".partners .swiper-button-prev"
        },
        // @ts-ignore
        // loopAdditionalSlides: 10
    });
}
document.addEventListener("DOMContentLoaded", function () {
    function allowTouchMove() {
        return false; // Запрещаем движение слайдов
    }
    if (document.querySelector(".partners__swiper")) {
        const swiperPartners = new Swiper(".partners__swiper", {
            loop: true,
            spaceBetween: 0,
            centeredSlides: true,
            slidesPerView: "auto",
            allowTouchMove: allowTouchMove(),
            speed: 3500,
            autoplay: {
                delay: 0,
                disableOnInteraction: false
            },
            navigation: {
                nextEl: ".partners .swiper-button-next",
                prevEl: ".partners .swiper-button-prev"
            },
            // @ts-ignore
            // loopAdditionalSlides: 10
        });
    }
});

"use strict";

"use strict";

"use strict";

"use strict";

"use strict";

"use strict";

"use strict";

"use strict";
if (document.querySelector(".region")) {
    const districtLinks = document.querySelectorAll(".region__district__link");
    const buttonsRegion = document.querySelectorAll("button[data-region]");
    const buttonsPath = document.querySelectorAll("button[data-path]");
    const valueStr = document.querySelector(".value");
    //довобление и удаление класса --active на кнопки с регионами
    districtLinks.forEach((districtLink) => {
        districtLink.addEventListener("click", function (event) {
            event.preventDefault();
            // Удаляем активный класс у кнопок
            districtLinks.forEach((item) => {
                item.classList.remove("region__district__link--active");
            });
            this.classList.add("region__district__link--active");
        });
    });
    //связываем кнопу и регион лист по data-атрибуту
    buttonsRegion.forEach((button) => {
        button.addEventListener("click", function () {
            const region = this.getAttribute("data-region");
            if (region) {
                const allRegions = document.querySelectorAll("div[data-region]");
                allRegions.forEach((elem) => {
                    elem.style.display = "none";
                });
                const containerRegion = document.querySelector(`div[data-region="${region}"]`);
                if (containerRegion) {
                    containerRegion.style.display = "block";
                }
            }
        });
    });
    //связываем data-path со строкой geo
    if (valueStr) {
        buttonsPath.forEach((button) => {
            button.addEventListener("click", function () {
                const pathEl = this.getAttribute("data-path");
                if (pathEl !== null) {
                    valueStr.setAttribute("href", pathEl);
                }
            });
        });
    }
    if (valueStr) {
        buttonsPath.forEach((button) => {
            button.addEventListener("click", function () {
                const valueBtnEl = this.textContent;
                if (valueBtnEl !== null) {
                    valueStr.textContent = valueBtnEl;
                }
            });
        });
    }
}

"use strict";

"use strict";

"use strict";
if (document.querySelector(".reviews")) {
    const openReviewLinks = document.querySelectorAll(".reviews__item__body__content__link");
    // Открытие и закрытие контента в отзывах
    openReviewLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const clickedLink = event.currentTarget;
            const parentItem = clickedLink.closest(".reviews__item");
            const childContent = parentItem.querySelector(".reviews__item__body__content");
            // Переключение текущего блока (открытие/закрытие)
            if (childContent) {
                childContent.classList.toggle("reviews__item__body__content--active");
            }
            (childContent === null || childContent === void 0 ? void 0 : childContent.classList.contains("reviews__item__body__content--active"))
                ? clickedLink.textContent = "Свернуть"
                : clickedLink.textContent = "Подробнее...";
        });
    });
}

"use strict";
if (document.querySelector(".reviews-list")) {
    const reviewWrapper = document.querySelector(".reviews-list__list");
    const reviewsLoadMoreBtn = document.querySelector(".reviews-list__btn");
    let counter = 0;
    if (reviewWrapper) {
        const initialItems = Array.from(reviewWrapper.querySelectorAll(".reviews-list__item"));
        initialItems.slice(3).forEach((item) => {
            item.setAttribute("data-hidden", "true");
            item.style.display = "none";
        });
    }
    // Открытие и закрытие контента в отзывах
    document.addEventListener("click", (event) => {
        const target = event.target;
        if (target && target.classList.contains("reviews-list__item__body__content__link")) {
            event.preventDefault();
            const parentItem = target.closest(".reviews-list__item");
            const childContent = parentItem.querySelector(".reviews-list__item__body__content");
            if (childContent) {
                childContent.classList.toggle("reviews-list__item__body__content--active");
                target.textContent = childContent.classList.contains("reviews-list__item__body__content--active")
                    ? "Свернуть"
                    : "Подробнее...";
            }
        }
    });
    function renderReviewCard(data) {
        data.forEach((item) => {
            const reviewCard = document.createElement("li");
            reviewCard.classList.add("reviews-list__item");
            // Генерация звезд на основе рейтинга
            const starsHTML = Array(5)
                .fill(0)
                .map((_, index) => `
      <svg class="star ${index < item.rating ? "full" : "empty"}" 
           data-rating="${index + 1}" 
           width="16" 
           height="16" 
           viewBox="0 0 16 16" 
           fill="${index < item.rating ? "#FFA800" : "none"}" 
           stroke="${index < item.rating ? "none" : "#FFA800"}" 
           xmlns="http://www.w3.org/2000/svg">
        <path d="M3.75019 16C3.53019 16 3.31019 15.93 3.12019 15.8001C2.75019 15.5403 2.56019 15.0906 2.63019 14.6608L3.34019 10.2836L0.330189 7.18551C0.0301887 6.8757 -0.0798117 6.42598 0.0601883 6.00625C0.200188 5.5965 0.540188 5.31668 0.970188 5.24672L5.11019 4.61711L6.97019 0.659588C7.16019 0.249844 7.56019 0 8.00019 0C8.44019 0 8.84019 0.249844 9.03019 0.659588L10.8902 4.61711L15.0302 5.24672C15.4602 5.31668 15.8002 5.5965 15.9402 6.00625C16.0802 6.42598 15.9802 6.8757 15.6702 7.18551L12.6502 10.2736L13.3602 14.6508C13.4302 15.0806 13.2402 15.5303 12.8702 15.7901C12.5202 16.04 12.0702 16.06 11.6802 15.8401L7.99019 13.8014L4.30019 15.8401C4.12019 15.94 3.93019 15.99 3.74019 15.99L3.75019 16Z"/>
      </svg>`)
                .join("");
            reviewCard.innerHTML = `
      <div class="reviews-list__item__header">
        <div class="reviews-list__item__header__author">
          <span class="reviews-list__item__initial">${item.name[0].toUpperCase()}</span>
          <p class="reviews-list__item__name">${item.name}</p>
        </div>
        <div class="reviews-list__item__header__application_number">
          <span>Номер заявки</span>
          <span class="number">${item.order}</span>
        </div>
      </div>
      <div class="reviews-list__item__body">
        <div class="reviews-list__item__body__stars">
          <span>${item.rating}</span>
          <figure class="leave-feedback__stars">
              ${starsHTML}
          </figure>
        </div>
        <div class="reviews-list__item__body__content">
          <p class="reviews-list__item__body__content__text">${item.review}</p>
        </div>
        <button class="reviews-list__item__body__content__link">Подробнее...</button>
      </div>
    `;
            reviewWrapper.appendChild(reviewCard);
        });
    }
    // Подгрузка новых отзывов
    reviewsLoadMoreBtn === null || reviewsLoadMoreBtn === void 0 ? void 0 : reviewsLoadMoreBtn.addEventListener("click", () => {
        const apiHost = window.location.host || "rusvodokanal.ru";
        const apiUrl = `https://${apiHost}/api/reviews/getReviews/index.php`;
        const data = {
            counter: counter
        };
        console.log(data);
        fetch(apiUrl, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({ counter })
        })
            .then((response) => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
            .then((data) => {
            console.log(data);
            if (Array.isArray(data)) {
                renderReviewCard(data);
                if (data.length === 0) {
                    reviewsLoadMoreBtn === null || reviewsLoadMoreBtn === void 0 ? void 0 : reviewsLoadMoreBtn.remove();
                }
                else if (data.length < 10) {
                    reviewsLoadMoreBtn === null || reviewsLoadMoreBtn === void 0 ? void 0 : reviewsLoadMoreBtn.remove();
                }
            }
            else {
                console.error("Полученные данные не являются массивом:", data);
            }
        })
            .catch((error) => {
            console.error("Ошибка при загрузке отзывов:", error);
            if (!reviewWrapper) {
                return;
            }
            const fallbackItems = Array.from(document.querySelectorAll(".reviews-list__item[data-hidden='true']"));
            if (fallbackItems.length > 0) {
                const nextItems = fallbackItems.slice(0, 3);
                nextItems.forEach((item) => {
                    item.removeAttribute("data-hidden");
                    item.style.display = "";
                    reviewWrapper.appendChild(item);
                });
                const remaining = document.querySelectorAll(".reviews-list__item[data-hidden='true']");
                if (remaining.length === 0) {
                    reviewsLoadMoreBtn === null || reviewsLoadMoreBtn === void 0 ? void 0 : reviewsLoadMoreBtn.remove();
                }
            }
        });
        counter += 10;
    });
}

"use strict";

"use strict";

"use strict";

"use strict";

"use strict";

"use strict";

"use strict";
if (document.querySelector(".thanks")) {
    const swiperReviews = new Swiper(".thanks__swiper", {
        speed: 500,
        spaceBetween: 0,
        centeredSlides: false,
        allowTouchMove: true,
        slidesPerView: "auto",
        autoplay: false,
        loop: false,
        navigation: {
            nextEl: ".thanks .swiper-button-next",
            prevEl: ".thanks .swiper-button-prev"
        },
        disableOnInteraction: true
    });
}

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
if (document.querySelector('.thanks-list')) {
    const thanksList = document.querySelector('.thanks-list__list');
    const thanksLoadMoreBtn = document.querySelector('.thanks-list__btn');
    let counter = 6;
    const apiUrl = `https://${document.location.host}/api/thanks/getThanks/index.php`;
    const loadThanksCard = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ counter })
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = yield response.json();
            if (data.length === 0) {
                thanksLoadMoreBtn.style.display = 'none';
            }
            data.forEach((item) => {
                const thanksItem = document.createElement('li');
                thanksItem.classList.add('thanks-list__item');
                thanksItem.innerHTML = `
          <div class="thanks-list__image">
              <img class="thanks-list__img" src="/${item.image}" alt="${item.alt}">
          </div>
          <p class="thanks-list__text">${item.description}</p>
        `;
                thanksList.append(thanksItem);
            });
            counter += 6;
        }
        catch (error) {
            console.error('Error fetching thanks:', error);
        }
    });
    thanksLoadMoreBtn.addEventListener('click', loadThanksCard);
}

"use strict";

"use strict";

"use strict";

"use strict";

"use strict";
if (document.querySelector(".wrapper") && window.innerWidth > 1200) {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Если блок попал в область видимости, добавляем ему класс wrapper-mounted
                entry.target.classList.add("wrapper-mounted");
            }
            else {
                // Если блок перестал быть видимым, удаляем класс wrapper-mounted
                entry.target.classList.remove("wrapper-mounted");
            }
        });
    });
    // Получаем все блоки с классом .wrapper
    const wrapperBlocks = document.querySelectorAll(".wrapper");
    // Для каждого блока добавляем его в список отслеживаемых элементов IntersectionObserver
    wrapperBlocks.forEach((block) => {
        observer.observe(block);
    });
}
