
document.addEventListener("DOMContentLoaded", function () {

  var phoneIds = ["phone-about", "phone"];

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

});

