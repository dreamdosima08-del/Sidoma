/* ============================================================
   Artvin Rehber — Reklam Yonetimi (Adsterra Native Banner)
   ------------------------------------------------------------
   TEK NOKTADAN YONETIM:
   - Reklami kaldirmak icin: AKTIF = false yap
   - Reklam kodunu degistirmek icin: SCRIPT_URL ve CONTAINER_ID guncelle
   - Bu dosyayi degistirince TUM site guncellenri (her sayfa bunu cagirir)
   ============================================================ */

(function () {
  "use strict";

  /* ---- AYARLAR (buradan yonet) ---- */
  var AKTIF = true; // reklami kapatmak icin false yap
  var SCRIPT_URL = "https://pl30308504.effectivecpmnetwork.com/44e951961847cdf306af5e408ff838b5/invoke.js";
  var CONTAINER_ID = "container-44e951961847cdf306af5e408ff838b5";

  if (!AKTIF) return;

  /* ---- Reklam kutusunun gorunumu (tasarimi bozmaz) ---- */
  function reklamKutusuOlustur() {
    var wrap = document.createElement("div");
    wrap.className = "ar-reklam-wrap";
    wrap.setAttribute("aria-label", "Reklam");

    // Ince "Reklam" etiketi (seffaflik icin, kullanici bilsin)
    var etiket = document.createElement("div");
    etiket.className = "ar-reklam-etiket";
    etiket.textContent = "Reklam";
    wrap.appendChild(etiket);

    // Adsterra container
    var container = document.createElement("div");
    container.id = CONTAINER_ID;
    wrap.appendChild(container);

    return wrap;
  }

  /* ---- Adsterra scriptini bir kez yukle ---- */
  var scriptYuklendi = false;
  function scriptYukle() {
    if (scriptYuklendi) return;
    scriptYuklendi = true;
    var s = document.createElement("script");
    s.async = true;
    s.setAttribute("data-cfasync", "false");
    s.src = SCRIPT_URL;
    document.body.appendChild(s);
  }

  /* ---- CSS'i bir kez enjekte et ---- */
  function stilEkle() {
    if (document.getElementById("ar-reklam-stil")) return;
    var st = document.createElement("style");
    st.id = "ar-reklam-stil";
    st.textContent =
      ".ar-reklam-wrap{margin:1.8rem auto;max-width:100%;padding:0;text-align:center;clear:both;overflow:hidden}" +
      ".ar-reklam-etiket{font-size:.58rem;letter-spacing:.08em;text-transform:uppercase;color:#9ca3af;opacity:.6;margin-bottom:.35rem;text-align:left;padding-left:.2rem}" +
      ".ar-reklam-wrap > div[id^='container-']{min-height:1px}";
    document.head.appendChild(st);
  }

  /* ---- Reklami belirtilen konuma yerlestir ---- */
  function reklamYerlestir() {
    stilEkle();

    var yerlesti = false;

    // 1) Blog/makale sayfasi: ilk paragraftan SONRA
    //    (article veya icerik container icindeki ilk uzun <p>)
    var makale =
      document.querySelector("article") ||
      document.querySelector(".icerik-wrap") ||
      document.querySelector(".yazi") ||
      document.querySelector(".makale") ||
      document.querySelector(".blog-icerik");

    if (makale) {
      var paragraflar = makale.querySelectorAll(":scope > p, :scope p");
      // Yeterince uzun ilk paragrafi bul (kisa spike'lari atla)
      var hedefP = null;
      for (var i = 0; i < paragraflar.length; i++) {
        if ((paragraflar[i].textContent || "").trim().length > 80) {
          hedefP = paragraflar[i];
          break;
        }
      }
      if (hedefP && hedefP.parentNode) {
        var kutu = reklamKutusuOlustur();
        hedefP.parentNode.insertBefore(kutu, hedefP.nextSibling);
        yerlesti = true;
      }
    }

    // 2) Ana sayfa: blog kartlari ARASINA (belirli bir siradan sonra)
    if (!yerlesti) {
      var grid = document.querySelector(".blog-grid, #blogGrid");
      if (grid) {
        var kartlar = grid.querySelectorAll(":scope > .blog-card, :scope > a.blog-card, :scope > .card, :scope > a");
        // 4. karttan sonra yerlestir (uste degil, akisin icinde)
        if (kartlar.length >= 4) {
          var kutu = reklamKutusuOlustur();
          kutu.style.gridColumn = "1 / -1"; // grid'de tam genislik kaplasin
          kartlar[3].parentNode.insertBefore(kutu, kartlar[3].nextSibling);
          yerlesti = true;
        }
      }
    }

    // 3) Reklam icin ayrilmis ozel yer (istersen sayfaya <div class="ar-reklam-slot"></div> koy)
    if (!yerlesti) {
      var slot = document.querySelector(".ar-reklam-slot");
      if (slot) {
        slot.appendChild(reklamKutusuOlustur());
        yerlesti = true;
      }
    }

    if (yerlesti) scriptYukle();
  }

  /* ---- DOM hazir olunca calistir ---- */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", reklamYerlestir);
  } else {
    reklamYerlestir();
  }
})();
