/* Sosyal medya kartı üretici (Artvin Rehber)
   Kullanım: KartUret.ekle({ hedef: '#kutu', konum: 'after'|'before'|'append', veri: function(){ return {
     kat:'💊 Nöbetçi Eczane', baslik:'Bugün Artvin merkez', buyuk:'Ömür Eczanesi', alt:'18:00–08:00 · 0466 212 77 88',
     satirlar:[['Yarın','Yağmur Eczanesi']], not:'...', renk:'#3ddb8a', dosya:'nobetci-eczane' } } })  */
(function () {
  var MAVI = '#0b2417';
  function el(t, a, h) { var e = document.createElement(t); if (a) for (var k in a) e.setAttribute(k, a[k]); if (h != null) e.innerHTML = h; return e; }
  function sar(ctx, metin, gen) { var k = String(metin).split(' '), s = [], c = ''; k.forEach(function (w) { var d = c ? c + ' ' + w : w; if (ctx.measureText(d).width > gen && c) { s.push(c); c = w; } else c = d; }); if (c) s.push(c); return s; }
  function yuvarlak(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  var logo = new Image(); logo.src = '/icon-192.png';
  function ciz(v, bicim) {
    var W = 1080, H = bicim === 'hikaye' ? 1920 : 1350, P = 84, renk = v.renk || '#3ddb8a';
    var c = document.createElement('canvas'); c.width = W; c.height = H; var x = c.getContext('2d');
    var F = 'Inter, "Segoe UI", system-ui, -apple-system, Roboto, sans-serif';
    var g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#123826'); g.addColorStop(.55, MAVI); g.addColorStop(1, '#050f09'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    var r = x.createRadialGradient(W * .85, 120, 10, W * .85, 120, 700); r.addColorStop(0, renk + '55'); r.addColorStop(1, renk + '00'); x.fillStyle = r; x.fillRect(0, 0, W, H);
    // dağ silueti
    x.fillStyle = 'rgba(255,255,255,.035)'; x.beginPath(); x.moveTo(0, H); [[0, H - 260], [160, H - 420], [300, H - 300], [470, H - 520], [640, H - 330], [800, H - 470], [960, H - 310], [W, H - 380], [W, H]].forEach(function (p) { x.lineTo(p[0], p[1]); }); x.fill();
    // çapraz filigran
    x.save(); x.translate(W / 2, H / 2); x.rotate(-Math.PI / 7); x.font = '700 46px ' + F; x.fillStyle = 'rgba(255,255,255,.035)'; x.textAlign = 'center';
    for (var yy = -H; yy < H; yy += 230) for (var xx = -W; xx < W * 1.2; xx += 620) x.fillText('artvinrehber.com', xx + (yy / 230 % 2 ? 310 : 0), yy); x.restore();
    var y = P + 10;
    // başlık şeridi
    if (logo.complete && logo.naturalWidth) { x.save(); x.beginPath(); x.arc(P + 44, y + 44, 44, 0, Math.PI * 2); x.clip(); x.drawImage(logo, P, y, 88, 88); x.restore(); }
    x.fillStyle = '#fff'; x.font = '800 40px ' + F; x.textBaseline = 'middle'; x.fillText('ARTVİN REHBERİ', P + 112, y + 30);
    x.fillStyle = 'rgba(255,255,255,.55)'; x.font = '500 28px ' + F; x.fillText('artvinrehber.com', P + 112, y + 70);
    y += 150; x.textBaseline = 'alphabetic';
    // kategori çipi
    if (v.kat) { x.font = '800 32px ' + F; var kw = x.measureText(v.kat).width + 56; yuvarlak(x, P, y, kw, 66, 33); x.fillStyle = renk + '2a'; x.fill(); x.strokeStyle = renk + '88'; x.lineWidth = 2; x.stroke(); x.fillStyle = renk; x.fillText(v.kat, P + 28, y + 45); y += 112; }
    var gen = W - 2 * P, bas = y, alan = H - P - 190;
    function icerikCiz(y, ciz) {
      var x2 = ciz ? x : { fillText: function () {}, measureText: x.measureText.bind(x), set font(v) { x.font = v; }, get font() { return x.font; }, set fillStyle(v) {}, set strokeStyle(v) {}, set lineWidth(v) {}, set textAlign(v) {}, fill: function () {}, stroke: function () {}, fillRect: function () {}, beginPath: function () {}, moveTo: function () {}, arcTo: function () {}, closePath: function () {} };
      var X = x2;
      if (v.baslik && !v.alinti) { X.fillStyle = '#fff'; X.font = '800 ' + (bicim === 'hikaye' ? 70 : 62) + 'px ' + F; sar(x, v.baslik, gen).slice(0, 3).forEach(function (s) { X.fillText(s, P, y + 60); y += (bicim === 'hikaye' ? 84 : 74); }); y += 18; }
      if (v.gorsel) { var gc = v.gorsel, gw = gen, gh = gc.height * gen / gc.width, mh = alan - y - (v.not ? 90 : 20); if (gh > mh) { gh = mh; gw = gc.width * mh / gc.height; } var gx = P + (gen - gw) / 2;
        if (ciz) { x.save(); yuvarlak(x, gx, y, gw, gh, 24); x.clip(); x.fillStyle = '#fff'; x.fillRect(gx, y, gw, gh); x.drawImage(gc, gx, y, gw, gh); x.restore(); yuvarlak(x, gx, y, gw, gh, 24); x.strokeStyle = 'rgba(255,255,255,.15)'; x.lineWidth = 3; x.stroke(); }
        y += gh + 30; }
      if (v.alinti) { var bo = v.alinti.length, fs = bo < 80 ? 76 : bo < 160 ? 62 : bo < 280 ? 50 : 42; if (bicim !== 'hikaye') fs = Math.round(fs * .85);
        X.font = '900 ' + (fs * 2.2) + 'px Georgia, serif'; X.fillStyle = renk; X.fillText('“', P - 6, y + fs * 1.6); y += fs * 1.2;
        X.font = '700 ' + fs + 'px ' + F; X.fillStyle = '#fff'; var sat = sar(x, v.alinti, gen), mx = Math.floor((alan - y - 160) / (fs * 1.3));
        if (sat.length > mx) { sat = sat.slice(0, mx); sat[mx - 1] += '…'; }
        sat.forEach(function (t) { X.fillText(t, P, y + fs); y += fs * 1.3; }); y += 30; }
      if (v.alinti && v.baslik) { X.font = '600 38px ' + F; X.fillStyle = renk; sar(x, '— ' + v.baslik, gen).slice(0, 2).forEach(function (t) { X.fillText(t, P, y + 38); y += 50; }); y += 20; }
      if (v.buyuk) { var bs = v.buyuk.length > 18 ? (bicim === 'hikaye' ? 92 : 80) : (bicim === 'hikaye' ? 132 : 112); X.font = '900 ' + bs + 'px ' + F; X.fillStyle = renk; sar(x, v.buyuk, gen).slice(0, 2).forEach(function (s) { X.fillText(s, P, y + bs * .85); y += bs * 1.05; }); y += 14; }
      if (v.alt) { var ab = v.altBuyuk ? (bicim === 'hikaye' ? 58 : 50) : 40, al = v.altBuyuk ? 6 : 3; X.font = (v.altBuyuk ? '700 ' : '500 ') + ab + 'px ' + F; X.fillStyle = v.altBuyuk ? '#fff' : 'rgba(255,255,255,.82)'; sar(x, v.alt, gen).slice(0, al).forEach(function (s) { X.fillText(s, P, y + ab); y += ab * 1.35; }); y += 26; }
      var S = (v.satirlar || []).slice(0, bicim === 'hikaye' ? 9 : 5);
      if (S.length) {
        var yuks = S.map(function (s) { if (s[3] !== 'blok') return 92; X.font = '800 36px ' + F; return 70 + Math.min(2, sar(x, String(s[1]), gen - 64).length) * 46; }), ph = yuks.reduce(function (a, b) { return a + b; }, 0) + 24;
        yuvarlak(X, P, y, gen, ph, 28); X.fillStyle = 'rgba(0,0,0,.28)'; X.fill(); X.strokeStyle = 'rgba(255,255,255,.08)'; X.lineWidth = 2; X.stroke();
        var sy = y + 12;
        S.forEach(function (s, i) {
          if (i) { X.fillStyle = 'rgba(255,255,255,.07)'; X.fillRect(P + 28, sy, gen - 56, 2); }
          if (s[3] === 'blok') {
            X.font = '600 30px ' + F; X.fillStyle = 'rgba(255,255,255,.6)'; X.fillText(s[0], P + 32, sy + 46);
            X.font = '800 36px ' + F; X.fillStyle = s[2] || '#fff'; sar(x, String(s[1]), gen - 64).slice(0, 2).forEach(function (t, j) { X.fillText(t, P + 32, sy + 96 + j * 46); });
          } else {
            X.font = '500 36px ' + F; X.fillStyle = 'rgba(255,255,255,.62)'; var sol = s[0]; while (x.measureText(sol).width > gen * .5 && sol.length > 4) sol = sol.slice(0, -2) + '…'; X.fillText(sol, P + 32, sy + 58);
            X.font = '800 38px ' + F; X.fillStyle = s[2] || '#fff'; X.textAlign = 'right'; var sag = String(s[1]); while (x.measureText(sag).width > gen * .46 && sag.length > 4) sag = sag.slice(0, -2) + '…'; X.fillText(sag, W - P - 32, sy + 58); X.textAlign = 'left';
          }
          sy += yuks[i];
        });
        y += ph + 30;
      }
      if (v.not) { X.font = '500 30px ' + F; X.fillStyle = 'rgba(255,255,255,.5)'; sar(x, v.not, gen).slice(0, 3).forEach(function (s) { X.fillText(s, P, y + 30); y += 42; }); }
      return y;
    }
    var son = icerikCiz(bas, false), bos = alan - son;
    icerikCiz(bas + (bicim === 'hikaye' && bos > 0 ? Math.min(bos * .42, 260) : 0), true);
    // alt bilgi
    var t = new Date(), ay = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    var ts = t.getDate() + ' ' + ay[t.getMonth()] + ' ' + t.getFullYear() + (v.saat === false ? '' : ' · ' + String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0'));
    var fy = H - P - 70; yuvarlak(x, P, fy - 20, gen, 108, 54); x.fillStyle = renk; x.fill();
    x.fillStyle = '#06130c'; x.font = '900 38px ' + F; x.fillText('artvinrehber.com', P + 40, fy + 47);
    x.font = '700 30px ' + F; x.textAlign = 'right'; x.fillText('@artvinrehber', W - P - 40, fy + 46); x.textAlign = 'left';
    x.fillStyle = 'rgba(255,255,255,.5)'; x.font = '500 28px ' + F; x.fillText(ts, P, fy - 46);
    return c;
  }
  var stil = false;
  function stilEkle() {
    if (stil) return; stil = true;
    document.head.appendChild(el('style', null, '.kart-btn{display:inline-flex;align-items:center;gap:.4rem;font:700 .82rem/1 inherit;font-family:inherit;color:#06130c;background:#f0c040;border:0;border-radius:999px;padding:.65rem 1rem;cursor:pointer;margin:.6rem 0;box-shadow:0 4px 14px rgba(240,192,64,.25)}' +
      '.kart-btn:focus-visible{outline:2px solid #fff;outline-offset:2px}.kart-ov{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;padding:14px}' +
      '.kart-md{background:#0f2a1c;border:1px solid rgba(255,255,255,.12);border-radius:18px;max-width:440px;width:100%;max-height:96vh;display:flex;flex-direction:column;gap:.6rem;padding:.9rem;font-family:system-ui,sans-serif;color:#fff}' +
      '.kart-md img{width:100%;max-height:62vh;object-fit:contain;border-radius:12px;background:#000}.kart-sec{display:flex;gap:.4rem}.kart-sec button,.kart-act a,.kart-act button{flex:1;font:700 .85rem system-ui,sans-serif;border-radius:12px;padding:.7rem;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:#fff;cursor:pointer;text-align:center;text-decoration:none}' +
      '.kart-sec button[aria-pressed=true]{background:#fff;color:#0f2a1c}.kart-act{display:flex;gap:.4rem}.kart-act .ana{background:#f0c040;color:#06130c;border-color:#f0c040}.kart-ip{font-size:.72rem;color:rgba(255,255,255,.55);text-align:center}'));
  }
  function ac(o) {
    var v; try { v = o.veri(); } catch (e) { v = null; }
    if (!v) { alert('Kart için bilgi henüz yüklenmedi, birkaç saniye sonra tekrar deneyin.'); return; }
    var bicim = 'hikaye', ov = el('div', { class: 'kart-ov', role: 'dialog', 'aria-label': 'Sosyal medya kartı' });
    ov.innerHTML = '<div class="kart-md"><div class="kart-sec"><button type="button" data-b="hikaye" aria-pressed="true">Hikâye</button><button type="button" data-b="gonderi" aria-pressed="false">Gönderi</button></div><img alt="Kart önizleme"><div class="kart-act"><a class="ana" download>⬇️ İndir</a><button type="button" class="pay">📤 Paylaş</button><button type="button" class="kap">Kapat</button></div><div class="kart-ip">Görseli indirip Instagram\'da hikâye veya gönderi olarak paylaşabilirsin.</div></div>';
    document.body.appendChild(ov);
    var img = ov.querySelector('img'), a = ov.querySelector('a'), cv;
    function yap() { cv = ciz(v, bicim); var u = cv.toDataURL('image/png'); img.src = u; a.href = u; a.download = (v.dosya || 'artvinrehber-kart') + '-' + bicim + '.png'; }
    ov.querySelectorAll('.kart-sec button').forEach(function (b) { b.onclick = function () { bicim = b.dataset.b; ov.querySelectorAll('.kart-sec button').forEach(function (z) { z.setAttribute('aria-pressed', z === b ? 'true' : 'false'); }); yap(); }; });
    var pay = ov.querySelector('.pay');
    pay.onclick = function () { cv.toBlob(function (bl) { var f = new File([bl], a.download, { type: 'image/png' }); if (navigator.canShare && navigator.canShare({ files: [f] })) navigator.share({ files: [f], text: (v.paylasMetni || v.baslik || '') + ' · artvinrehber.com' }).catch(function () {}); else a.click(); }); };
    ov.querySelector('.kap').onclick = function () { ov.remove(); };
    ov.addEventListener('click', function (e) { if (e.target === ov) ov.remove(); });
    document.addEventListener('keydown', function k(e) { if (e.key === 'Escape') { ov.remove(); document.removeEventListener('keydown', k); } });
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { if (logo.complete) yap(); else { logo.onload = logo.onerror = yap; } });
  }
  window.KartUret = {
    ekle: function (o) {
      stilEkle();
      var h = typeof o.hedef === 'string' ? document.querySelector(o.hedef) : o.hedef; if (!h) return;
      var b = el('button', { type: 'button', class: 'kart-btn' }, o.yazi || '📸 Kart üret'); b.onclick = function () { ac(o); };
      if (o.stil) b.setAttribute('style', o.stil);
      var k = o.konum || 'after'; if (k === 'append') h.appendChild(b); else if (k === 'before') h.parentNode.insertBefore(b, h); else h.parentNode.insertBefore(b, h.nextSibling);
      return b;
    },
    ciz: ciz,
    goster: function (v) { stilEkle(); ac({ veri: function () { return v; } }); }
  };
})();
