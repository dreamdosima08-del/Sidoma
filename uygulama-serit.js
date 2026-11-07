/* Android tarayıcıdan gelenlere Artvin Rehber uygulaması önerisi.
   Uygulamanın içinde, iPhone'da, masaüstünde ve kapatanlara gösterilmez.
   Üstten iner, ara ara kendini gösterir. × 3 gün, Yükle 14 gün gizler. */
(function () {
  try {
    var ua = navigator.userAgent || '';
    if (!/Android/i.test(ua)) return;
    if (/ArtvinRehberApp|; wv\)/i.test(ua)) return;
    try { if ((document.referrer || '').indexOf('android-app://') === 0) sessionStorage.setItem('ar_twa', '1'); if (sessionStorage.getItem('ar_twa')) return; } catch (e) {}
    if (window.matchMedia && matchMedia('(display-mode: standalone)').matches) return;
    var K = 'ar_uyg_serit';
    try { var z = +localStorage.getItem(K) || 0; if (Date.now() - z < 1000 * 60 * 60 * 24 * 14) return; } catch (e) {}
    var sayfa = (location.pathname.split('/').pop() || 'index').replace('.html', '');
    var mesaj = {
      havas: 'Havaş geri sayımı cebinde olsun',
      dolmus: 'İlçe dolmuşları cebinde olsun',
      'sehirici-dolmus': 'Dolmuş durağa gelmeden haberin olsun',
      taksi: 'Taksi ücretleri cebinde olsun',
      'yol-durumu': 'Yol kapanınca ilk sen öğren',
      'eczane-rehber': 'Nöbetçi eczane cebinde olsun',
      hava: 'Artvin havası cebinde olsun',
      otobus: 'Otobüs ve ulaşım cebinde olsun'
    }[sayfa] || 'Artvin Rehber cebinde olsun';
    var url = 'https://play.google.com/store/apps/details?id=com.artvinrehber.mobil&referrer=' +
      encodeURIComponent('utm_source=site&utm_medium=serit&utm_campaign=' + sayfa);
    var st = document.createElement('style');
    st.textContent = '#uygSerit{position:fixed;left:8px;right:8px;top:calc(8px + env(safe-area-inset-top));z-index:9998;display:flex;align-items:center;gap:10px;padding:8px 8px 8px 10px;border-radius:16px;background:#0f2a1c;border:1px solid #b8913a;box-shadow:0 10px 30px rgba(0,0,0,.45);font:500 13.5px/1.3 system-ui,-apple-system,"Segoe UI",sans-serif;color:#eef3ee;transform:translateY(calc(-100% - 30px));transition:transform .5s cubic-bezier(.2,.9,.3,1.15);max-width:560px;margin:0 auto}' +
      '#uygSerit.ac{transform:none}#uygSerit img{width:38px;height:38px;border-radius:10px;flex:none}' +
      '#uygSerit b{display:block;color:#f2c14e;font-size:14px}#uygSerit .m{flex:1;min-width:0}' +
      '#uygSerit a{flex:none;background:#f2c14e;color:#1d1400;font-weight:800;text-decoration:none;padding:9px 14px;border-radius:999px}' +
      '#uygSerit button{flex:none;background:none;border:0;color:#a9bdb0;font-size:22px;line-height:1;padding:4px 6px;cursor:pointer}' +
      '@media (prefers-reduced-motion:reduce){#uygSerit{transition:none}}';
    document.head.appendChild(st);
    var d = document.createElement('div'); d.id = 'uygSerit'; d.setAttribute('role', 'complementary');
    d.innerHTML = '<img src="/icon-192.png" alt="" onerror="this.remove()"><div class="m"><b>' + mesaj + '</b>Ücretsiz · Google Play</div>' +
      '<a href="' + url + '" rel="noopener">Yükle</a><button aria-label="Kapat">×</button>';
    /* Üstten iner, 9 sn kalır, çekilir; 30 sn sonra tekrar. Bir sayfada en fazla 3 kez. */
    var KALIS = 9000, ARA = 30000, ENCOK = 3, kez = 0, bitti = false, z1, z2;
    function kaydet(gun) { try { localStorage.setItem(K, Date.now() - 1000 * 60 * 60 * 24 * (14 - gun)); } catch (e) {} }
    function bitir() { bitti = true; clearTimeout(z1); clearTimeout(z2); d.classList.remove('ac'); setTimeout(function () { d.remove(); }, 600); }
    d.querySelector('button').onclick = function () { kaydet(3); bitir(); };
    d.querySelector('a').addEventListener('click', function () { kaydet(14); bitir(); });
    function mesgul() { var a = document.activeElement; return document.hidden || (a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)); }
    function goster() {
      if (bitti) return;
      if (mesgul()) { z1 = setTimeout(goster, 5000); return; }
      if (!d.parentNode) document.body.appendChild(d);
      kez++; setTimeout(function () { d.classList.add('ac'); }, 50);
      z2 = setTimeout(function () { d.classList.remove('ac'); if (kez < ENCOK) z1 = setTimeout(goster, ARA); }, KALIS);
    }
    z1 = setTimeout(goster, 6000);
  } catch (x) {}
})();
