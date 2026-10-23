/* Android tarayıcıdan gelenlere Artvin Rehber uygulaması önerisi.
   Uygulamanın içinde, iPhone'da, masaüstünde ve kapatanlara gösterilmez. */
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
    st.textContent = '#uygSerit{position:fixed;left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom));z-index:9998;display:flex;align-items:center;gap:10px;padding:10px 10px 10px 12px;border-radius:16px;background:#0f2a1c;border:1px solid #b8913a;box-shadow:0 10px 30px rgba(0,0,0,.45);font:500 14px/1.3 system-ui,-apple-system,"Segoe UI",sans-serif;color:#eef3ee;transform:translateY(140%);transition:transform .45s cubic-bezier(.2,.9,.3,1.2)}' +
      '#uygSerit.ac{transform:none}#uygSerit img{width:40px;height:40px;border-radius:50%;flex:none}' +
      '#uygSerit b{display:block;color:#f2c14e;font-size:14.5px}#uygSerit .m{flex:1;min-width:0}' +
      '#uygSerit a{flex:none;background:#f2c14e;color:#1d1400;font-weight:800;text-decoration:none;padding:10px 14px;border-radius:999px}' +
      '#uygSerit button{flex:none;background:none;border:0;color:#a9bdb0;font-size:22px;line-height:1;padding:4px 6px;cursor:pointer}';
    document.head.appendChild(st);
    var d = document.createElement('div'); d.id = 'uygSerit'; d.setAttribute('role', 'complementary');
    d.innerHTML = '<img src="/icon-192.png" alt="" onerror="this.remove()"><div class="m"><b>' + mesaj + '</b>Ücretsiz Android uygulaması</div>' +
      '<a href="' + url + '" rel="noopener">İndir</a><button aria-label="Kapat">×</button>';
    function kapat() { d.classList.remove('ac'); try { localStorage.setItem(K, Date.now()); } catch (e) {} setTimeout(function () { d.remove(); }, 500); }
    d.querySelector('button').onclick = kapat;
    d.querySelector('a').addEventListener('click', function () { try { localStorage.setItem(K, Date.now()); } catch (e) {} });
    function goster() { document.body.appendChild(d); setTimeout(function () { d.classList.add('ac'); }, 50); }
    setTimeout(goster, 6000);
  } catch (x) {}
})();
