
function initCustomScripts() {
  // Hide flash of default city until replacements applied
  var revealTimer = setTimeout(function() {
    document.documentElement.classList.add("city-ready");
  }, 1500);

  var phoneIds = ["phone-about", "phone", "phone-header-form"];

  phoneIds.forEach(function (id) {
    var input = document.getElementById(id);
    if (!input) return;

    input.addEventListener("focus", onFocus);
    input.addEventListener("beforeinput", onBeforeInput);
    input.addEventListener("input", onInput);
  });

  function onFocus(e) {
    if (!e.target.value) {
      e.target.value = "+7 ";
    }
  }

  function onBeforeInput(e) {
    var input = e.target;
    var digits = input.value.replace(/\D/g, "");

    // если 9 уже есть — дальше не блокируем
    if (digits.indexOf("9") !== -1) return;

    // разрешаем только ввод цифры 9
    if (e.data !== "9") {
      e.preventDefault();
    }
  }

  function onInput(e) {
    var input = e.target;
    var digits = input.value.replace(/\D/g, "");

    // пока номер не начинается с 79 — держим только +7
    if (digits.indexOf("79") !== 0) {
      input.value = "+7 ";
      return;
    }

    input.value = formatPhone(digits);
  }

  function formatPhone(value) {
    var nums = value.substring(1, 11); // убираем первую 7
    var res = "+7";

    if (nums.length > 0) res += " (" + nums.substring(0, 3);
    if (nums.length >= 3) res += ")";
    if (nums.length > 3) res += " " + nums.substring(3, 6);
    if (nums.length > 6) res += "-" + nums.substring(6, 8);
    if (nums.length > 8) res += "-" + nums.substring(8, 10);

    return res;
  }

  // Выпадающий список городов
  var citySelectors = document.querySelectorAll('.header__top__city_selected');
  
  citySelectors.forEach(function(selector) {
    selector.addEventListener('click', function(e) {
      e.stopPropagation();
      var parent = this.closest('.header__top__city');
      var list = parent.querySelector('.header__top__city__list');
      
      if (list) {
        list.classList.toggle('active');
      }
    });
  });

  function updateSelectedCity(cityName) {
    if (!cityName) return;
    localStorage.setItem('selectedCity', cityName);

    var selectedLabels = document.querySelectorAll('.header__top__city_selected span');
    selectedLabels.forEach(function(label) {
      label.textContent = cityName;
    });

    var allItems = document.querySelectorAll('.header__top__city__item, .header__top__city__burger__item');
    allItems.forEach(function(item) {
      var itemText = item.textContent.trim();
      if (itemText === cityName) {
        item.classList.add('header__top__city__item_checked');
      } else {
        item.classList.remove('header__top__city__item_checked');
      }
    });

    updateCityText(cityName);
    updateAddressText(cityName);
    updateServicePrices(cityName);
    updateMainCity(cityName);
  }

  var cityTextOriginals = new WeakMap();
  var cityTitleOriginal = null;

  function getCityForms(cityName) {
    var forms = {
      "Саратов": {
        nom: "Саратов",
        gen: "Саратова",
        prep: "Саратове",
        dat: "Саратову",
        acc: "Саратов",
        inst: "Саратовом",
        adjFemNom: "Саратовская",
        adjFemGen: "Саратовской",
        adjFemAcc: "Саратовскую",
        regionAdjFemNom: "Саратовская",
        regionAdjFemGen: "Саратовской",
        regionAdjFemAcc: "Саратовскую",
        regionAdjFemPrep: "Саратовской"
      },
      "Энгельс": {
        nom: "Энгельс",
        gen: "Энгельса",
        prep: "Энгельсе",
        dat: "Энгельсу",
        acc: "Энгельс",
        inst: "Энгельсом",
        adjFemNom: "Энгельсская",
        adjFemGen: "Энгельсской",
        adjFemAcc: "Энгельсскую",
        regionAdjFemNom: "Саратовская",
        regionAdjFemGen: "Саратовской",
        regionAdjFemAcc: "Саратовскую",
        regionAdjFemPrep: "Саратовской"
      },
      "Ульяновск": {
        nom: "Ульяновск",
        gen: "Ульяновска",
        prep: "Ульяновске",
        dat: "Ульяновску",
        acc: "Ульяновск",
        inst: "Ульяновском",
        adjFemNom: "Ульяновская",
        adjFemGen: "Ульяновской",
        adjFemAcc: "Ульяновскую",
        regionAdjFemNom: "Ульяновская",
        regionAdjFemGen: "Ульяновской",
        regionAdjFemAcc: "Ульяновскую",
        regionAdjFemPrep: "Ульяновской"
      },
      "Тольятти": {
        nom: "Тольятти",
        gen: "Тольятти",
        prep: "Тольятти",
        dat: "Тольятти",
        acc: "Тольятти",
        inst: "Тольятти",
        adjFemNom: "Тольяттинская",
        adjFemGen: "Тольяттинской",
        adjFemAcc: "Тольяттинскую",
        regionAdjFemNom: "Самарская",
        regionAdjFemGen: "Самарской",
        regionAdjFemAcc: "Самарскую",
        regionAdjFemPrep: "Самарской"
      },
      "Пенза": {
        nom: "Пенза",
        gen: "Пензы",
        prep: "Пензе",
        dat: "Пензе",
        acc: "Пензу",
        inst: "Пензой",
        adjFemNom: "Пензенская",
        adjFemGen: "Пензенской",
        adjFemAcc: "Пензенскую",
        regionAdjFemNom: "Пензенская",
        regionAdjFemGen: "Пензенской",
        regionAdjFemAcc: "Пензенскую",
        regionAdjFemPrep: "Пензенской"
      },
      "Ярославль": {
        nom: "Ярославль",
        gen: "Ярославля",
        prep: "Ярославле",
        dat: "Ярославлю",
        acc: "Ярославль",
        inst: "Ярославлем",
        adjFemNom: "Ярославская",
        adjFemGen: "Ярославской",
        adjFemAcc: "Ярославскую",
        regionAdjFemNom: "Ярославская",
        regionAdjFemGen: "Ярославской",
        regionAdjFemAcc: "Ярославскую",
        regionAdjFemPrep: "Ярославской"
      },
      "Омск": {
        nom: "Омск",
        gen: "Омска",
        prep: "Омске",
        dat: "Омску",
        acc: "Омск",
        inst: "Омском",
        adjFemNom: "Омская",
        adjFemGen: "Омской",
        adjFemAcc: "Омскую",
        regionAdjFemNom: "Омская",
        regionAdjFemGen: "Омской",
        regionAdjFemAcc: "Омскую",
        regionAdjFemPrep: "Омской"
      }
    };

    return forms[cityName] || forms["Саратов"];
  }

  function replaceCityTokens(text, forms) {
    var nbspSpace = "[\\s\\u00A0]+";
    var result = text;

    var regionReplacements = [
      { pattern: new RegExp("[Пп]одмосковье", "g"), value: forms.regionAdjFemPrep.toLowerCase() === forms.regionAdjFemPrep ? forms.regionAdjFemPrep + " области" : forms.regionAdjFemPrep + " области" },
      { pattern: new RegExp("[Пп]одмосковья", "g"), value: forms.regionAdjFemGen + " области" },
      { pattern: new RegExp("[Пп]одмосковью", "g"), value: forms.regionAdjFemPrep + " области" },
      { pattern: new RegExp("Саратовской" + nbspSpace + "области", "g"), value: forms.regionAdjFemGen + " области" },
      { pattern: new RegExp("Саратовскую" + nbspSpace + "область", "g"), value: forms.regionAdjFemAcc + " область" },
      { pattern: new RegExp("Саратовская" + nbspSpace + "область", "g"), value: forms.regionAdjFemNom + " область" },
      { pattern: new RegExp("Энгельсской" + nbspSpace + "области", "g"), value: "Саратовской области" },
      { pattern: new RegExp("Энгельсскую" + nbspSpace + "область", "g"), value: "Саратовскую область" },
      { pattern: new RegExp("Энгельсская" + nbspSpace + "область", "g"), value: "Саратовская область" },
      { pattern: new RegExp("Ульяновской" + nbspSpace + "области", "g"), value: forms.regionAdjFemGen + " области" },
      { pattern: new RegExp("Ульяновскую" + nbspSpace + "область", "g"), value: forms.regionAdjFemAcc + " область" },
      { pattern: new RegExp("Ульяновская" + nbspSpace + "область", "g"), value: forms.regionAdjFemNom + " область" },
      { pattern: new RegExp("Тольяттинской" + nbspSpace + "области", "g"), value: forms.regionAdjFemGen + " области" },
      { pattern: new RegExp("Тольяттинскую" + nbspSpace + "область", "g"), value: forms.regionAdjFemAcc + " область" },
      { pattern: new RegExp("Тольяттинская" + nbspSpace + "область", "g"), value: forms.regionAdjFemNom + " область" },
      { pattern: new RegExp("Пензенской" + nbspSpace + "области", "g"), value: forms.regionAdjFemGen + " области" },
      { pattern: new RegExp("Пензенскую" + nbspSpace + "область", "g"), value: forms.regionAdjFemAcc + " область" },
      { pattern: new RegExp("Пензенская" + nbspSpace + "область", "g"), value: forms.regionAdjFemNom + " область" },
      { pattern: new RegExp("Ярославской" + nbspSpace + "области", "g"), value: forms.regionAdjFemGen + " области" },
      { pattern: new RegExp("Ярославскую" + nbspSpace + "область", "g"), value: forms.regionAdjFemAcc + " область" },
      { pattern: new RegExp("Ярославская" + nbspSpace + "область", "g"), value: forms.regionAdjFemNom + " область" },
      { pattern: new RegExp("Омской" + nbspSpace + "области", "g"), value: forms.regionAdjFemGen + " области" },
      { pattern: new RegExp("Омскую" + nbspSpace + "область", "g"), value: forms.regionAdjFemAcc + " область" },
      { pattern: new RegExp("Омская" + nbspSpace + "область", "g"), value: forms.regionAdjFemNom + " область" },
      { pattern: new RegExp("Московской" + nbspSpace + "области", "g"), value: forms.regionAdjFemGen + " области" },
      { pattern: new RegExp("Московскую" + nbspSpace + "область", "g"), value: forms.regionAdjFemAcc + " область" },
      { pattern: new RegExp("Московская" + nbspSpace + "область", "g"), value: forms.regionAdjFemNom + " область" }
    ];

    regionReplacements.forEach(function(item) {
      result = result.replace(item.pattern, item.value);
    });

    function replaceTokenSafe(value, replacement, avoidRegion) {
      var suffix = avoidRegion ? "(?![А-Яа-яЁё]|" + nbspSpace + "област)" : "(?![А-Яа-яЁё])";
      var pattern = new RegExp("(?<![А-Яа-яЁё])" + value + suffix, "g");
      result = result.replace(pattern, replacement);
    }

    var replacements = [
      { from: "Саратовской области", to: forms.regionAdjFemGen + " области" },
      { from: "Саратовскую область", to: forms.regionAdjFemAcc + " область" },
      { from: "Саратовская область", to: forms.regionAdjFemNom + " область" },
      { from: "Энгельсской области", to: "Саратовской области" },
      { from: "Энгельсскую область", to: "Саратовскую область" },
      { from: "Энгельсская область", to: "Саратовская область" },
      { from: "Ульяновской области", to: forms.regionAdjFemGen + " области" },
      { from: "Ульяновскую область", to: forms.regionAdjFemAcc + " область" },
      { from: "Ульяновская область", to: forms.regionAdjFemNom + " область" },
      { from: "Тольяттинской области", to: forms.regionAdjFemGen + " области" },
      { from: "Тольяттинскую область", to: forms.regionAdjFemAcc + " область" },
      { from: "Тольяттинская область", to: forms.regionAdjFemNom + " область" },
      { from: "Пензенской области", to: forms.regionAdjFemGen + " области" },
      { from: "Пензенскую область", to: forms.regionAdjFemAcc + " область" },
      { from: "Пензенская область", to: forms.regionAdjFemNom + " область" },
      { from: "Ярославской области", to: forms.regionAdjFemGen + " области" },
      { from: "Ярославскую область", to: forms.regionAdjFemAcc + " область" },
      { from: "Ярославская область", to: forms.regionAdjFemNom + " область" },
      { from: "Омской области", to: forms.regionAdjFemGen + " области" },
      { from: "Омскую область", to: forms.regionAdjFemAcc + " область" },
      { from: "Омская область", to: forms.regionAdjFemNom + " область" },
      { from: "Московской области", to: forms.regionAdjFemGen + " области" },
      { from: "Московскую область", to: forms.regionAdjFemAcc + " область" },
      { from: "Московская область", to: forms.regionAdjFemNom + " область" },
      { from: "Московской", to: forms.adjFemGen, avoidRegion: true },
      { from: "Московскую", to: forms.adjFemAcc, avoidRegion: true },
      { from: "Московская", to: forms.adjFemNom, avoidRegion: true },
      { from: "Москвой", to: forms.inst },
      { from: "Москву", to: forms.acc || forms.nom },
      { from: "Москве", to: forms.prep },
      { from: "Москвы", to: forms.gen },
      { from: "Москва", to: forms.nom },
      { from: "Москвичей", to: "Жителей" },
      { from: "москвичей", to: "жителей" },
      { from: "Москвичам", to: "Жителям" },
      { from: "москвичам", to: "жителям" },
      { from: "Москвичами", to: "Жителями" },
      { from: "москвичами", to: "жителями" },
      { from: "Москвичи", to: "Жители" },
      { from: "москвичи", to: "жители" },
      { from: "Москвич", to: "Житель" },
      { from: "москвич", to: "житель" },
      { from: "Саратовская", to: forms.adjFemNom, avoidRegion: true },
      { from: "Саратовской", to: forms.adjFemGen, avoidRegion: true },
      { from: "Саратовскую", to: forms.adjFemAcc, avoidRegion: true },
      { from: "Саратовом", to: forms.inst },
      { from: "Саратову", to: forms.dat },
      { from: "Саратове", to: forms.prep },
      { from: "Саратова", to: forms.gen },
      { from: "Саратов", to: forms.nom }
    ];

    replacements.forEach(function(item) {
      replaceTokenSafe(item.from, item.to, item.avoidRegion);
    });

    return result;
  }

  function updateCityText(cityName) {
    var forms = getCityForms(cityName);

    var titleEl = document.querySelector("title");
    if (titleEl) {
      if (!cityTitleOriginal) {
        cityTitleOriginal = titleEl.textContent;
      }
      titleEl.textContent = replaceCityTokens(cityTitleOriginal, forms);
    }

    var metaTags = document.querySelectorAll('meta[name="description"], meta[property^="og:"]');
    metaTags.forEach(function(meta) {
      var content = meta.getAttribute("content");
      if (!content) return;
      if (!meta.dataset.cityOriginal) {
        meta.dataset.cityOriginal = content;
      }
      meta.setAttribute("content", replaceCityTokens(meta.dataset.cityOriginal, forms));
    });

    var textWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var node;
    while ((node = textWalker.nextNode())) {
      var parent = node.parentElement;
      if (!parent) continue;
      if (parent.closest(".header__top__city")) continue;
      if (parent.closest(".header__top__city__list")) continue;
      if (parent.closest(".header__top__city__list__burger")) continue;
      if (parent.closest(".about-us-page__branches-list")) continue;
      if (parent.closest("script, style, noscript")) continue;

      var originalText = node.nodeValue;
      if (!originalText || !originalText.trim()) {
        continue;
      }

      if (!cityTextOriginals.has(node)) {
        cityTextOriginals.set(node, originalText);
      }

      var baseText = cityTextOriginals.get(node);
      node.nodeValue = replaceCityTokens(baseText, forms);
    }
  }

  function getCityAddress(cityName) {
    var addresses = {
      "Саратов": "ул. Чернышевского, д. 88",
      "Энгельс": "Набережная им. Рудченко, 14",
      "Ульяновск": "Улица Островского, 6",
      "Тольятти": "Улица Автостроителей, 59",
      "Пенза": "Улица Славы, 4",
      "Ярославль": "Московский проспект, 12",
      "Омск": "Улица Конева, 14"
    };

    return addresses[cityName] || addresses["Саратов"];
  }

  function updateAddressText(cityName) {
    var address = getCityAddress(cityName);

    var headerAddresses = document.querySelectorAll(".header__top__address-info");
    headerAddresses.forEach(function(el) {
      el.textContent = address;
    });

    var footerDescrs = document.querySelectorAll(".footer__logo-contact-descr");
    footerDescrs.forEach(function(el) {
      if (!el.dataset.addressOriginal) {
        el.dataset.addressOriginal = el.innerHTML;
      }
      var html = el.dataset.addressOriginal;
      var updated = html.replace(/Адрес:\s*[^<]+/g, "Адрес: " + address);
      el.innerHTML = updated;
    });
  }

  function updateMainCity(cityName) {
    var main = document.querySelector("main");
    if (main) {
      main.setAttribute("data-city", cityName);
    }
  }

  function getCityPrices(cityName) {
    var prices = {
      "Саратов": { verify: "500 ₽", replace: "от 1800 ₽", install: "от 2100 ₽" },
      "Энгельс": { verify: "500 ₽", replace: "от 1800 ₽", install: "от 2100 ₽" },
      "Ульяновск": { verify: "500 ₽", replace: "от 1800 ₽", install: "от 2100 ₽" },
      "Тольятти": { verify: "500 ₽", replace: "от 1800 ₽", install: "от 2100 ₽" },
      "Пенза": { verify: "500 ₽", replace: "от 1800 ₽", install: "от 2100 ₽" },
      "Ярославль": { verify: "500 ₽", replace: "от 1800 ₽", install: "от 2100 ₽" },
      "Омск": { verify: "500 ₽", replace: "от 1800 ₽", install: "от 2100 ₽" }
    };

    return prices[cityName] || prices["Саратов"];
  }

  function normalizeText(value) {
    return value
      .toLowerCase()
      .replace(/ё/g, "е")
      .replace(/\s+/g, " ")
      .trim();
  }

  function updateServicePrices(cityName) {
    var priceSet = getCityPrices(cityName);
    var items = document.querySelectorAll(".services__item");

    items.forEach(function(item) {
      var titleEl = item.querySelector(".services__item__title");
      var priceEl = item.querySelector(".services__prices__new_price");
      if (!titleEl || !priceEl) return;

      var title = normalizeText(titleEl.textContent);
      if (title.indexOf("поверка счетчика воды") !== -1 || title.indexOf("поверка счетчиков воды") !== -1) {
        priceEl.textContent = priceSet.verify;
        return;
      }

      if (title.indexOf("замена счетчика воды") !== -1 || title.indexOf("замена счетчиков воды") !== -1) {
        priceEl.textContent = priceSet.replace;
        return;
      }

      if (title.indexOf("установка счетчика воды") !== -1 || title.indexOf("установка счетчиков воды") !== -1) {
        priceEl.textContent = priceSet.install;
      }
    });
  }

  function getCityFromSubdomain() {
    var host = (window.location.hostname || "").toLowerCase();
    if (!host || host === "localhost" || host === "127.0.0.1") {
      return null;
    }
    var parts = host.split(".");
    if (parts.length < 3) {
      return null;
    }
    var subdomain = parts[0];
    var map = {
      sar: "Саратов",
      eng: "Энгельс",
      oms: "Омск",
      pnz: "Пенза",
      tol: "Тольятти",
      uly: "Ульяновск",
      yar: "Ярославль"
    };
    return map[subdomain] || null;
  }

  var subdomainCity = getCityFromSubdomain();
  var storedCity = localStorage.getItem('selectedCity');
  if (subdomainCity) {
    updateSelectedCity(subdomainCity);
  } else if (storedCity) {
    updateSelectedCity(storedCity);
  } else {
    updateSelectedCity("Саратов");
  }

  document.documentElement.classList.add("city-ready");
  clearTimeout(revealTimer);

  function getSubdomainByCity(cityName) {
    var map = {
      "Саратов": "sar",
      "Энгельс": "eng",
      "Омск": "oms",
      "Пенза": "pnz",
      "Тольятти": "tol",
      "Ульяновск": "uly",
      "Ярославль": "yar"
    };
    return map[cityName] || null;
  }

  function buildCityUrl(cityName) {
    var host = window.location.hostname;
    var protocol = window.location.protocol;
    var port = window.location.port ? ":" + window.location.port : "";
    var subdomain = getSubdomainByCity(cityName);

    if (!subdomain || !host) return null;

    var baseHost = host;
    if (host.split(".").length >= 3) {
      baseHost = host.split(".").slice(1).join(".");
    }

    var newHost = subdomain + "." + baseHost;
    return protocol + "//" + newHost + port + window.location.pathname + window.location.search + window.location.hash;
  }

  function handleCityLinkEvent(e) {
    var target = e.target;
    if (!target || !target.closest) return;

    var link = target.closest(".header__top__city__list a, .header__top__city__list__burger a");
    if (!link) return;

    var cityName = link.textContent.trim();
    
    // Всегда строим URL с сохранением текущего пути страницы
    var targetUrl = buildCityUrl(cityName);
    
    // Если не удалось построить URL (например, localhost), используем href из ссылки
    if (!targetUrl) {
      targetUrl = link.getAttribute("href");
    }

    if (targetUrl) {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = targetUrl;
    }
  }

  document.addEventListener("click", handleCityLinkEvent, true);
  document.addEventListener("touchstart", handleCityLinkEvent, true);

  // Закрытие списка при клике вне его
  document.addEventListener('click', function() {
    var lists = document.querySelectorAll('.header__top__city__list');
    lists.forEach(function(list) {
      list.classList.remove('active');
    });
  });


  // Выпадающий список "Услуги" в навигации
  var servicesSelectors = document.querySelectorAll('.header__bottom__navigation__item_selected');
  
  servicesSelectors.forEach(function(selector) {
    selector.addEventListener('click', function(e) {
      e.stopPropagation();
      var parent = this.closest('.header__bottom__selected__wrapper');
      var list = parent.querySelector('.header__bottom__services__list');
      
      if (list) {
        list.classList.toggle('active');
      }
    });
  });

  // Закрытие списка услуг при клике вне его
  document.addEventListener('click', function() {
    var lists = document.querySelectorAll('.header__bottom__services__list');
    lists.forEach(function(list) {
      list.classList.remove('active');
    });
  });

  // Выпадающий список в форме
  var formSelects = document.querySelectorAll('.about-form-select');
  
  formSelects.forEach(function(select) {
    var list = select.querySelector('.about-form-select__list');
    
    // Открытие/закрытие списка при клике на контейнер
    select.addEventListener('click', function(e) {
      e.stopPropagation();
      
      var currentFirstItem = list.querySelector('.about-form-select__item:first-child');
      
      // Если список закрыт - открываем при любом клике
      if (!this.classList.contains('open')) {
        this.classList.add('open');
        return;
      }
      
      // Если список открыт и клик по первому элементу или вне элементов списка - закрываем
      if (e.target === currentFirstItem || !e.target.classList.contains('about-form-select__item')) {
        this.classList.remove('open');
      }
    });

    // Обработка клика по элементам списка
    select.addEventListener('click', function(e) {
      if (!e.target.classList.contains('about-form-select__item')) return;
      
      var currentFirstItem = list.querySelector('.about-form-select__item:first-child');
      
      // Если клик по первому элементу - не делаем ничего (уже обрабатывается выше)
      if (e.target === currentFirstItem) return;
      
      // Убираем класс checked у всех элементов
      var items = list.querySelectorAll('.about-form-select__item');
      items.forEach(function(i) {
        i.classList.remove('about-form-select__checked');
      });
      
      // Добавляем класс checked к выбранному элементу
      e.target.classList.add('about-form-select__checked');
      
      // Перемещаем выбранный элемент в начало списка
      list.insertBefore(e.target, list.firstChild);
      
      // Закрываем список
      select.classList.remove('open');
    });
  });

  // Закрытие выпадающего списка формы при клике вне его
  document.addEventListener('click', function() {
    formSelects.forEach(function(select) {
      select.classList.remove('open');
    });
  });

  function normalizeMasterTitleSpacing() {
    var titleSelectors = ".about-form__title, .application-form__title, .modal-form__title, .header-form__title";
    var titles = document.querySelectorAll(titleSelectors);

    titles.forEach(function(title) {
      var span = title.querySelector("span");
      if (!span) return;

      span.textContent = span.textContent.trim();

      var textNode = null;
      for (var i = 0; i < title.childNodes.length; i++) {
        var node = title.childNodes[i];
        if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim()) {
          textNode = node;
        }
        if (node === span) break;
      }

      if (textNode && !/\s$/.test(textNode.nodeValue)) {
        textNode.nodeValue = textNode.nodeValue + " ";
      }
    });
  }

  normalizeMasterTitleSpacing();

  function normalizeFooterServiceLinks() {
    var linkMap = {
      "поверка счетчиков воды": "index.html",
      "замена счетчиков воды": "zamena-schetchikov-vody.html",
      "установка счетчиков воды": "ustanovka-schetchikov-vody.html",
      "поверка счетчиков тепла": "index.html",
      "замена счетчиков тепла": "zamena-teploschetchikov.html",
      "установка счетчиков тепла": "ustanovka-teploschetchikov.html",
      "техобслуживание": "tehnicheskoe-obsluzhivanie.html",
      "сантехнические услуги": "vyzov-santehnika.html",
      "умные счетчики": "ustanovka-umnyh-schetchikov-vody.html",
      "услуги для бизнеса": "uslugi-dlya-biznesa.html"
    };

    var footerLinks = document.querySelectorAll(".footer__services__list a");
    footerLinks.forEach(function(link) {
      var text = normalizeText(link.textContent);
      if (!text) return;

      link.classList.remove("headerForm");
      if (linkMap[text]) {
        link.setAttribute("href", linkMap[text]);
      }
    });
  }

  normalizeFooterServiceLinks();

  function initSwiperIfNeeded(selector, navRoot) {
    if (typeof Swiper === "undefined") return;
    var el = document.querySelector(selector);
    if (!el || el.classList.contains("swiper-initialized")) return;

    new Swiper(selector, {
      speed: 500,
      spaceBetween: 0,
      centeredSlides: false,
      allowTouchMove: true,
      slidesPerView: "auto",
      autoplay: false,
      loop: false,
      disableOnInteraction: true,
      navigation: {
        nextEl: navRoot + " .swiper-button-next",
        prevEl: navRoot + " .swiper-button-prev"
      }
    });
  }

  function ensureSwiperLoaded(callback) {
    if (typeof Swiper !== "undefined") {
      callback();
      return;
    }

    if (window.__swiperLoading) {
      window.__swiperCallbacks.push(callback);
      return;
    }

    window.__swiperLoading = true;
    window.__swiperCallbacks = [callback];

    var script = document.createElement("script");
    script.src = "css/swiper.min.js";
    script.onload = function() {
      var callbacks = window.__swiperCallbacks || [];
      callbacks.forEach(function(cb) {
        cb();
      });
      window.__swiperCallbacks = [];
      window.__swiperLoading = false;
    };
    document.body.appendChild(script);
  }

  ensureSwiperLoaded(function() {
    initSwiperIfNeeded(".about-advantages__swiper", ".about-advantages");
    initSwiperIfNeeded(".advantages__swiper", ".advantages");
    initSwiperIfNeeded(".masters__swiper", ".masters");
    initSwiperIfNeeded(".certificate__swiper", ".certificate");
    initSwiperIfNeeded(".thanks__swiper", ".thanks");
  });

  function normalizeCertificateButtonLink() {
    var buttons = document.querySelectorAll(".certificate__btn");
    buttons.forEach(function(btn) {
      btn.classList.remove("headerForm");
      btn.setAttribute("href", "sertifikaty.html");
    });
  }

  normalizeCertificateButtonLink();

  function normalizeThanksButtonLink() {
    var buttons = document.querySelectorAll(".thanks__btn");
    buttons.forEach(function(btn) {
      btn.classList.remove("headerForm");
      btn.setAttribute("href", "blagodarnosti.html");
    });
  }

  normalizeThanksButtonLink();

  function normalizeArticlesLinks() {
    var articleLinks = document.querySelectorAll(".articles__link");
    var articleHrefs = [
      "poryadok-zameny-schetchika-vody.html",
      "pravilnaya-ustanovka-schetchika.html",
      "pravila-poverki-schetchikov-vody-v-moskve.html",
      "akkreditovannye-kompanii-po-ustanovke-schetchikov-vody.html"
    ];

    articleLinks.forEach(function(link, index) {
      link.classList.remove("headerForm");
      if (articleHrefs[index]) {
        link.setAttribute("href", articleHrefs[index]);
      }
    });

    var allArticlesBtn = document.querySelectorAll(".articles__btnblue");
    allArticlesBtn.forEach(function(btn) {
      btn.classList.remove("headerForm");
      btn.setAttribute("href", "pressa.html");
    });
  }

  normalizeArticlesLinks();

  function normalizeEmail() {
    var oldEmail = "info@gcur.ru";
    var newEmail = "info@rusvodokanal.ru";

    var mailLinks = document.querySelectorAll('a[href^="mailto:"]');
    mailLinks.forEach(function(link) {
      var href = link.getAttribute("href") || "";
      if (href.toLowerCase().includes(oldEmail)) {
        link.setAttribute("href", "mailto:" + newEmail);
      }
      if (link.textContent && link.textContent.toLowerCase().includes(oldEmail)) {
        link.textContent = newEmail;
      }
    });
  }

  normalizeEmail();

  function normalizePolicySpacing() {
    var policySelectors = ".about-form__policy, .application-form__policy, .modal-form__policy, .header-form__policy";
    var policyBlocks = document.querySelectorAll(policySelectors);

    policyBlocks.forEach(function(block) {
      var link = block.querySelector("a");
      if (!link) return;

      var prev = link.previousSibling;
      if (prev && prev.nodeType === Node.TEXT_NODE) {
        if (!/\s$/.test(prev.nodeValue)) {
          prev.nodeValue = prev.nodeValue + " ";
        }
      } else {
        block.insertBefore(document.createTextNode(" "), link);
      }

      link.textContent = link.textContent.trim();
    });
  }

  normalizePolicySpacing();

  // Открытие модального окна "Перезвоните мне!"
  var headerFormButtons = document.querySelectorAll('.headerForm, .order');
  var headerFormModal = document.querySelector('.header-form');
  var headerFormCloseBtn = document.querySelector('.header-form__btn-close');
  var headerFormWrapper = document.querySelector('.header-form__wrapper');

  // Открытие модального окна при клике на кнопки "Перезвоните мне!"
  headerFormButtons.forEach(function(button) {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      if (headerFormModal) {
        headerFormModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Блокируем прокрутку страницы
      }
    });
  });

  // Закрытие модального окна при клике на кнопку закрытия
  if (headerFormCloseBtn) {
    headerFormCloseBtn.addEventListener('click', function() {
      if (headerFormModal) {
        headerFormModal.classList.remove('active');
        document.body.style.overflow = ''; // Возвращаем прокрутку страницы
      }
    });
  }

  // Закрытие модального окна при клике на затемненный фон
  if (headerFormWrapper) {
    headerFormWrapper.addEventListener('click', function(e) {
      if (e.target === headerFormWrapper) {
        if (headerFormModal) {
          headerFormModal.classList.remove('active');
          document.body.style.overflow = ''; // Возвращаем прокрутку страницы
        }
      }
    });
  }

  // Карусель партнеров
  if (typeof Swiper !== "undefined" && document.querySelector(".partners__swiper")) {
    new Swiper('.partners__swiper', {
      slidesPerView: 'auto',
      spaceBetween: 30,
      loop: true,
      autoplay: {
        delay: 0,
        disableOnInteraction: false,
      },
      speed: 3000,
      freeMode: true,
      freeModeMomentum: false,
    });
  }

  // FAQ - раскрытие вопросов
  var faqTabs = document.querySelectorAll('.faq__tab');
  
  faqTabs.forEach(function(tab) {
    var title = tab.querySelector('.tab__title');
    var content = tab.querySelector('.tab__content');
    var svg = tab.querySelector('.svg');
    
    if (title && content) {
      title.style.cursor = 'pointer';
      
      title.addEventListener('click', function() {
        // Переключаем класс open на контенте
        content.classList.toggle('open');
        
        // Переключаем класс open на svg для поворота стрелки
        if (svg) {
          svg.classList.toggle('open');
        }
      });
    }
  });

}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCustomScripts);
} else {
  initCustomScripts();
}

