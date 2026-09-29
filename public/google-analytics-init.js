(function () {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", "G-MYXG8PKQR3");

  if (!document.getElementById("google-analytics-loader")) {
    var analyticsScript = document.createElement("script");
    analyticsScript.id = "google-analytics-loader";
    analyticsScript.async = true;
    analyticsScript.src = "https://www.googletagmanager.com/gtag/js?id=G-MYXG8PKQR3";
    document.head.appendChild(analyticsScript);
  }
})();
