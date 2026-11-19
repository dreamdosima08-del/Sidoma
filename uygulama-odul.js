/* Artvin Rehber Android uygulaması: ödüllü reklam köprüsü.
   Tarayıcıda (sitede) hiçbir şey yapmaz; yalnızca uygulamanın içinde ve uygulama ödüllü reklam
   açıkken (window.ARTVIN_ODUL) teklif gösterir. Reklam her zaman oyuncunun kendi seçimidir.
   <script src="/uygulama-odul.js" data-banner="gizle"></script> → bu sayfada alttaki banner gizlenir
   (oyun düğmelerine yanlışlıkla dokunulmasın diye). */
(function () {
  'use strict';
  var UA = /ArtvinRehberApp/.test(navigator.userAgent);
  var bekleyen = {}, sayac = 0;
  var betik = document.currentScript;
  var bannerGizle = !!(betik && betik.getAttribute('data-banner') === 'gizle');

  function kanal() { return UA && window.ArtvinApp && typeof window.ArtvinApp.postMessage === 'function'; }
  function gonder(o) { try { if (kanal()) window.ArtvinApp.postMessage(JSON.stringify(o)); } catch (e) {} }
  function ev(n, o) { try { if (window.gtag) window.gtag('event', n, o || {}); } catch (e) {} }

  window.artvinOdulSonuc = function (id, ok) { var f = bekleyen[id]; delete bekleyen[id]; if (f) f(!!ok); };

  function stil() {
    if (document.getElementById('ao-stil')) return;
    var s = document.createElement('style'); s.id = 'ao-stil';
    s.textContent = '.ao-perde{position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:18px;animation:aoGel .18s ease-out}' +
      '.ao-kutu{background:#fff;color:#0f172a;border-radius:22px;max-width:360px;width:100%;padding:22px 18px 16px;text-align:center;box-shadow:0 24px 60px -20px rgba(0,0,0,.5);font-family:inherit}' +
      '.ao-kutu .ao-e{font-size:46px;line-height:1}.ao-kutu h3{margin:8px 0 4px;font-size:21px}.ao-kutu p{margin:0 0 14px;color:#475569;line-height:1.5;font-size:15px}' +
      '.ao-kutu button{display:block;width:100%;border:0;border-radius:14px;padding:13px;font-weight:800;font-size:15.5px;font-family:inherit;cursor:pointer;margin-top:8px}' +
      '.ao-izle{background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff}.ao-vaz{background:#f1f5f9;color:#475569}' +
      '.ao-not{font-size:11.5px;color:#94a3b8;margin-top:10px}' +
      '.ao-tost{position:fixed;left:50%;top:22px;transform:translateX(-50%);z-index:100000;background:#0f172a;color:#fff;padding:10px 15px;border-radius:12px;font:700 14px system-ui,sans-serif;max-width:90vw;text-align:center}' +
      '@keyframes aoGel{from{opacity:0}}';
    document.head.appendChild(s);
  }

  var AO = {
    // Uygulamada mıyız ve ödüllü reklam açık mı?
    var: function () { return !!(UA && window.ARTVIN_ODUL && kanal()); },
    uygulama: function () { return UA; },
    tost: function (m) { stil(); var t = document.createElement('div'); t.className = 'ao-tost'; t.setAttribute('role', 'status'); t.textContent = m; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2600); },
    // Reklamı iste: izlenip ödül hak edilirse odul(), değilse olmaz()
    iste: function (tur, odul, olmaz) {
      if (!AO.var()) { if (olmaz) olmaz(); return; }
      var id = ++sayac;
      bekleyen[id] = function (ok) {
        if (ok) { ev('odul_kazan', { tur: tur }); odul(); }
        else { AO.tost('Şu an reklam yok, biraz sonra tekrar dene'); if (olmaz) olmaz(); }
      };
      ev('odul_iste', { tur: tur });
      gonder({ t: 'odul', id: id, tur: tur });
    },
    // Teklif penceresi: {e, baslik, metin, dugme, tur, odul, vaz}
    teklif: function (o) {
      if (!AO.var()) { if (o.vaz) o.vaz(); return; }
      stil();
      var p = document.createElement('div'); p.className = 'ao-perde';
      p.innerHTML = '<div class="ao-kutu" role="dialog" aria-modal="true"><div class="ao-e">' + (o.e || '🎁') + '</div><h3></h3><p></p>' +
        '<button class="ao-izle" type="button"></button><button class="ao-vaz" type="button">Vazgeç</button><div class="ao-not">Kısa bir reklam izlersin, ödülün hemen verilir.</div></div>';
      p.querySelector('h3').textContent = o.baslik || '';
      p.querySelector('p').textContent = o.metin || '';
      p.querySelector('.ao-izle').textContent = '🎬 ' + (o.dugme || 'Reklam izle');
      document.body.appendChild(p);
      p.querySelector('.ao-izle').onclick = function () { p.remove(); AO.iste(o.tur || 'odul', o.odul, o.vaz); };
      p.querySelector('.ao-vaz').onclick = function () { p.remove(); if (o.vaz) o.vaz(); };
    },
    banner: function (goster) { gonder({ t: 'banner', g: goster ? 1 : 0 }); }
  };
  window.ArtvinOdul = AO;

  if (UA && bannerGizle) {
    AO.banner(false);
    window.addEventListener('load', function () { AO.banner(false); });
  }
})();
