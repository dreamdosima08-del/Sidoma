/* Seç → kart: (1) yazı seçince "Kart yap" düğmesi, (2) kart modu: sayfadaki herhangi bir kutuya dokun, görüntüsü kart olsun.
   Kart modu düğmesi ?kart=1 ile açılır (bu tarayıcıda hatırlanır), ?kart=0 ile kapanır. */
(function () {
  if (window.__kartSec) return; window.__kartSec = 1;
  function yukle(src, cb) { var s = document.createElement('script'); s.src = src; s.onload = cb; s.onerror = function () { alert('Kart aracı yüklenemedi, bağlantını kontrol et.'); }; document.head.appendChild(s); }
  function hazir(cb) { if (window.KartUret && KartUret.goster) cb(); else yukle('/kart-uret.js', cb); }
  function sayfaAdi() { var h = document.querySelector('h1'); var t = (h ? h.innerText : document.title).replace(/\s+/g, ' ').split('|')[0].trim(); return t.length > 70 ? t.slice(0, 68) + '…' : t; }
  var yol = location.pathname.replace(/^\//, '').replace(/\.html$/, '') || 'anasayfa';
  var st = document.createElement('style');
  st.textContent = '.ks-btn{position:fixed;z-index:9990;left:50%;transform:translateX(-50%);bottom:calc(84px + env(safe-area-inset-bottom));font:700 14px system-ui,sans-serif;color:#06130c;background:#f0c040;border:0;border-radius:999px;padding:12px 18px;box-shadow:0 8px 24px rgba(0,0,0,.35);cursor:pointer}' +
    '.ks-fab{position:fixed;z-index:9989;right:14px;bottom:calc(150px + env(safe-area-inset-bottom));width:52px;height:52px;border-radius:50%;border:0;background:#f0c040;color:#06130c;font-size:22px;box-shadow:0 8px 24px rgba(0,0,0,.35);cursor:pointer}' +
    '.ks-ipucu{position:fixed;z-index:9991;left:12px;right:12px;top:12px;background:#0f2a1c;color:#fff;border:1px solid #f0c040;border-radius:14px;padding:12px 14px;font:600 14px system-ui,sans-serif;display:flex;gap:8px;align-items:center;justify-content:space-between;box-shadow:0 8px 24px rgba(0,0,0,.4)}' +
    '.ks-ipucu button{font:700 13px system-ui,sans-serif;border:0;border-radius:10px;padding:9px 12px;cursor:pointer}.ks-ipucu .e{background:#f0c040;color:#06130c}.ks-ipucu .g{background:rgba(255,255,255,.12);color:#fff}' +
    '.ks-isaret{outline:3px solid #f0c040!important;outline-offset:3px;box-shadow:0 0 0 9999px rgba(0,0,0,.35)!important;position:relative;z-index:2}';
  document.head.appendChild(st);

  /* 1) Yazı seç → kart */
  var btn = null, secili = '';
  function btnKaldir() { if (btn) { btn.remove(); btn = null; } }
  document.addEventListener('selectionchange', function () {
    clearTimeout(window.__ksT); window.__ksT = setTimeout(function () {
      var sel = window.getSelection(), t = sel ? sel.toString().replace(/\s+/g, ' ').trim() : '';
      var ae = document.activeElement; if (ae && /INPUT|TEXTAREA/.test(ae.tagName)) t = '';
      if (t.length < 15 || t.length > 700) { btnKaldir(); return; }
      secili = t;
      if (!btn) { btn = document.createElement('button'); btn.type = 'button'; btn.className = 'ks-btn'; btn.textContent = '📸 Seçimi kart yap';
        btn.addEventListener('mousedown', function (e) { e.preventDefault(); });
        btn.addEventListener('click', function () { var t2 = secili; btnKaldir(); hazir(function () { KartUret.goster({ kat: '📖 Artvin Rehber', baslik: sayfaAdi(), alinti: t2, renk: '#f0c040', dosya: 'alinti-' + yol, saat: false, not: 'Devamı: artvinrehber.com/' + (yol === 'anasayfa' ? '' : yol) }); }); });
        document.body.appendChild(btn); }
    }, 250);
  });

  /* 2) Kart modu: kutu seç */
  var q = new URLSearchParams(location.search).get('kart');
  try { if (q === '1') localStorage.setItem('kartModu', '1'); if (q === '0') localStorage.removeItem('kartModu'); } catch (e) {}
  var acik = false; try { acik = localStorage.getItem('kartModu') === '1'; } catch (e) {}
  if (!acik) return;
  var fab = document.createElement('button'); fab.type = 'button'; fab.className = 'ks-fab'; fab.title = 'Kutu seçip kart yap'; fab.textContent = '📸';
  document.body.appendChild(fab);
  var secim = null, ipucu = null, modda = false;
  function uygun(el) { while (el && el !== document.body) { var r = el.getBoundingClientRect(); if (r.width >= 160 && r.height >= 60 && !/^(A|SPAN|B|STRONG|EM|I|SMALL|IMG|BUTTON)$/.test(el.tagName)) return el; el = el.parentElement; } return null; }
  function isaretle(el) { if (secim) secim.classList.remove('ks-isaret'); secim = el; if (el) el.classList.add('ks-isaret'); ipucuYaz(); }
  function ipucuYaz() {
    if (!ipucu) { ipucu = document.createElement('div'); ipucu.className = 'ks-ipucu'; document.body.appendChild(ipucu); }
    ipucu.innerHTML = secim ? '<span>Bu kutu seçili</span><span style="display:flex;gap:6px"><button class="g" data-a="ust">⬆️ Daha geniş</button><button class="e" data-a="yap">✅ Kart yap</button><button class="g" data-a="iptal">✖</button></span>'
      : '<span>Kart yapmak istediğin kutuya dokun</span><button class="g" data-a="iptal">Vazgeç</button>';
    ipucu.querySelectorAll('button').forEach(function (b) { b.onclick = function (e) { e.stopPropagation(); var a = b.dataset.a;
      if (a === 'iptal') kapat(); else if (a === 'ust' && secim && secim.parentElement && secim.parentElement !== document.body) isaretle(secim.parentElement); else if (a === 'yap') yap(); }; });
  }
  function tikla(e) { if (!modda || (ipucu && ipucu.contains(e.target)) || e.target === fab) return; e.preventDefault(); e.stopPropagation(); isaretle(uygun(e.target)); }
  function kapat() { modda = false; if (secim) secim.classList.remove('ks-isaret'); secim = null; if (ipucu) { ipucu.remove(); ipucu = null; } document.removeEventListener('click', tikla, true); }
  fab.onclick = function () { if (modda) { kapat(); return; } modda = true; ipucuYaz(); setTimeout(function () { document.addEventListener('click', tikla, true); }, 50); };
  function yap() {
    var el = secim; if (!el) return; el.classList.remove('ks-isaret'); ipucu.innerHTML = '<span>Kart hazırlanıyor…</span>';
    var basla = function () {
      var arka = getComputedStyle(document.body).backgroundColor;
      html2canvas(el, { scale: 2, useCORS: true, backgroundColor: arka && arka !== 'rgba(0, 0, 0, 0)' ? arka : '#0a1a12', logging: false }).then(function (cv) {
        kapat(); hazir(function () { KartUret.goster({ kat: '📖 Artvin Rehber', baslik: sayfaAdi(), gorsel: cv, renk: '#f0c040', dosya: 'kart-' + yol, saat: false, not: 'Tamamı: artvinrehber.com/' + (yol === 'anasayfa' ? '' : yol) }); });
      }).catch(function () { kapat(); alert('Bu kutunun görüntüsü alınamadı, başka bir kutu dene.'); });
    };
    if (window.html2canvas) basla(); else yukle('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', basla);
  }
})();
