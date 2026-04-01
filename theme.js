/* ═══════════════════════════════════════════════════════════════
   ARTVIN REHBERİ — TEMA JS v1.0
   - localStorage'dan tercihi yükle
   - Toggle butonu oluştur ve <body>'e ekle
   - Anında tema değiştir, kaydet
═══════════════════════════════════════════════════════════════ */

(function () {
  var LS_KEY = 'artvin_tema';
  var DARK    = 'dark';
  var LIGHT   = 'light';

  /* Kayıtlı tema — yoksa dark */
  var kayitliTema = localStorage.getItem(LS_KEY) || DARK;

  /* Tema uygula — reflow olmadan */
  function temaUygula(tema) {
    document.documentElement.setAttribute('data-theme', tema);
    var btn = document.getElementById('temaToggle');
    if (btn) {
      btn.textContent = tema === DARK ? '☀️' : '🌙';
      btn.title       = tema === DARK ? 'Aydınlık moda geç' : 'Karanlık moda geç';
      btn.setAttribute('aria-label', btn.title);
    }
  }

  /* Sayfa yüklenmeden önce hemen uygula — flash yok */
  temaUygula(kayitliTema);

  /* DOM hazır olunca toggle butonu oluştur */
  function domHazir() {
    /* Zaten varsa tekrar ekleme */
    if (document.getElementById('temaToggle')) return;

    var btn = document.createElement('button');
    btn.id = 'temaToggle';
    btn.type = 'button';
    temaUygula(kayitliTema); /* ikonu ayarla */

    btn.addEventListener('click', function () {
      var mevcutTema = document.documentElement.getAttribute('data-theme') || DARK;
      var yeniTema   = mevcutTema === DARK ? LIGHT : DARK;
      localStorage.setItem(LS_KEY, yeniTema);
      kayitliTema = yeniTema;
      temaUygula(yeniTema);
    });

    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', domHazir);
  } else {
    domHazir();
  }
})();
