(function () {
  try {
    var theme = localStorage.getItem("ctt-theme");
    if (theme === "light" || theme === "dark") {
      document.documentElement.dataset.theme = theme;
    }
  } catch {}
})();
