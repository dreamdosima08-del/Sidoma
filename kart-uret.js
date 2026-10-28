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
  var VARSAYILAN_FOTO = '/img/mg-20260327-wa0089-jr5dl3yv.webp';
  var fontlar = null;
  function fontYukle() {
    if (fontlar) return fontlar;
    var L = 'U+0000-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+FEFF,U+FFFD', E = 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+1E00-1E9F';
    var ff = [new FontFace('KartSerif', 'url(/fonts/instrument-italic-latin.woff2)', { style: 'italic', unicodeRange: L }), new FontFace('KartSerif', 'url(/fonts/instrument-italic-latin-ext.woff2)', { style: 'italic', unicodeRange: E }),
      new FontFace('KartSans', 'url(/fonts/bricolage-latin.woff2)', { weight: '200 800', unicodeRange: L }), new FontFace('KartSans', 'url(/fonts/bricolage-latin-ext.woff2)', { weight: '200 800', unicodeRange: E })];
    fontlar = Promise.all(ff.map(function (f) { return f.load().then(function (x) { document.fonts.add(x); }).catch(function () {}); }));
    return fontlar;
  }
  var fotoOnbellek = {};
  function fotoYukle(u) { if (fotoOnbellek[u]) return fotoOnbellek[u]; fotoOnbellek[u] = new Promise(function (ok) { var i = new Image(); i.onload = function () { ok(i); }; i.onerror = function () { ok(null); }; i.src = u; }); return fotoOnbellek[u]; }
  function ciz(v, bicim) {
    var W = 1080, H = bicim === 'hikaye' ? 1920 : 1350, P = 96, renk = v.renk || '#e7c77b', ALTIN = '#e7c77b';
    var c = document.createElement('canvas'); c.width = W; c.height = H; var x = c.getContext('2d');
    var SANS = 'KartSans, "Segoe UI", system-ui, sans-serif', SERIF = 'KartSerif, Georgia, serif';
    x.fillStyle = '#0b1510'; x.fillRect(0, 0, W, H);
    // fotoğraf
    var fh = Math.round(H * (bicim === 'hikaye' ? .44 : .38)), img = v._foto;
    if (img) { var o = Math.max(W / img.width, fh / img.height), iw = img.width * o, ih = img.height * o; x.globalAlpha = .92; x.drawImage(img, (W - iw) / 2, (fh - ih) / 2, iw, ih); x.globalAlpha = 1; }
    var g = x.createLinearGradient(0, 0, 0, fh + 4); g.addColorStop(0, 'rgba(11,21,16,.55)'); g.addColorStop(.35, 'rgba(11,21,16,.15)'); g.addColorStop(.78, 'rgba(11,21,16,.78)'); g.addColorStop(1, '#0b1510'); x.fillStyle = g; x.fillRect(0, 0, W, fh + 4);
    // kontur çizgileri (topografya)
    x.save(); x.strokeStyle = 'rgba(231,199,123,.06)'; x.lineWidth = 2;
    for (var k = 0; k < 14; k++) { x.beginPath(); var by = fh + 60 + k * ((H - fh) / 14); for (var xx = 0; xx <= W; xx += 20) { var yy = by + Math.sin(xx / 140 + k * .7) * 18 + Math.sin(xx / 53 + k) * 6; xx ? x.lineTo(xx, yy) : x.moveTo(xx, yy); } x.stroke(); }
    x.restore();
    // vinyet
    var vg = x.createRadialGradient(W / 2, H * .55, H * .2, W / 2, H * .55, H * .8); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.45)'); x.fillStyle = vg; x.fillRect(0, 0, W, H);
    // vurgu ışığı
    var r = x.createRadialGradient(W * .9, fh, 10, W * .9, fh, 620); r.addColorStop(0, renk + '30'); r.addColorStop(1, renk + '00'); x.fillStyle = r; x.fillRect(0, 0, W, H);
    // altın çerçeve
    x.strokeStyle = 'rgba(231,199,123,.55)'; x.lineWidth = 2; x.strokeRect(40, 40, W - 80, H - 80);
    x.strokeStyle = 'rgba(231,199,123,.18)'; x.lineWidth = 1; x.strokeRect(52, 52, W - 104, H - 104);
    // dikey filigran
    x.save(); x.translate(W - 20, H / 2); x.rotate(Math.PI / 2); x.font = '600 18px ' + SANS; x.fillStyle = 'rgba(231,199,123,.55)'; x.textAlign = 'center'; if ('letterSpacing' in x) x.letterSpacing = '8px'; x.fillText('ARTVINREHBER.COM', 0, 6); x.restore();
    if ('letterSpacing' in x) x.letterSpacing = '0px';
    // üst bilgi
    var y = P + 4;
    if (logo.complete && logo.naturalWidth) { x.save(); x.beginPath(); x.arc(P + 36, y + 36, 36, 0, Math.PI * 2); x.clip(); x.drawImage(logo, P, y, 72, 72); x.restore(); x.beginPath(); x.arc(P + 36, y + 36, 38, 0, Math.PI * 2); x.strokeStyle = ALTIN; x.lineWidth = 2.5; x.stroke(); }
    x.textBaseline = 'middle'; x.fillStyle = '#fff'; x.font = '700 26px ' + SANS; if ('letterSpacing' in x) x.letterSpacing = '7px'; x.fillText('ARTVİN REHBERİ', P + 96, y + 36);
    var kat = String(v.kat || '').replace(/^[^A-Za-zÇĞİÖŞÜçğıöşü0-9]+/, '').trim().toLocaleUpperCase('tr');
    if (kat) { x.font = '700 22px ' + SANS; x.fillStyle = ALTIN; x.textAlign = 'right'; x.fillText(kat, W - P, y + 36); x.textAlign = 'left'; }
    if ('letterSpacing' in x) x.letterSpacing = '0px'; x.textBaseline = 'alphabetic';
    var gen = W - 2 * P, alan = H - P - 170;
    var t = new Date(), AY = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'], GN = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    var tarih = (t.getDate() + ' ' + AY[t.getMonth()] + ' ' + t.getFullYear() + ' · ' + GN[t.getDay()] + (v.saat === false ? '' : ' · ' + String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0'))).toLocaleUpperCase('tr');
    function icerikCiz(y, ciz) {
      var Q = ciz ? x : null;
      function yaz(t, X2, Y2) { if (Q) Q.fillText(t, X2, Y2); }
      // tarih satırı
      x.font = '600 24px ' + SANS; if ('letterSpacing' in x) x.letterSpacing = '5px'; if (Q) { x.fillStyle = ALTIN; } yaz(tarih, P, y + 24); if ('letterSpacing' in x) x.letterSpacing = '0px'; y += 64;
      if (v.baslik && !v.alinti) { var bs = bicim === 'hikaye' ? 88 : 76; x.font = 'italic 400 ' + bs + 'px ' + SERIF; if (Q) x.fillStyle = '#fff'; sar(x, v.baslik, gen).slice(0, 3).forEach(function (s) { yaz(s, P, y + bs * .82); y += bs * 1.04; }); y += 18;
        if (Q) { x.fillStyle = ALTIN; x.fillRect(P, y, 84, 3); } y += 40; }
      if (v.gorsel) { var gc = v.gorsel, gw = gen, gh = gc.height * gen / gc.width, mh = alan - y - (v.not ? 90 : 20); if (gh > mh) { gh = mh; gw = gc.width * mh / gc.height; } var gx = P + (gen - gw) / 2;
        if (Q) { x.save(); x.shadowColor = 'rgba(0,0,0,.5)'; x.shadowBlur = 40; x.shadowOffsetY = 16; yuvarlak(x, gx, y, gw, gh, 18); x.fillStyle = '#fff'; x.fill(); x.restore(); x.save(); yuvarlak(x, gx, y, gw, gh, 18); x.clip(); x.drawImage(gc, gx, y, gw, gh); x.restore(); yuvarlak(x, gx, y, gw, gh, 18); x.strokeStyle = 'rgba(231,199,123,.6)'; x.lineWidth = 2; x.stroke(); }
        y += gh + 40; }
      if (v.alinti) { var bo = v.alinti.length, fs = bo < 80 ? 84 : bo < 160 ? 70 : bo < 280 ? 56 : 46; if (bicim !== 'hikaye') fs = Math.round(fs * .85);
        x.font = 'italic 400 ' + Math.round(fs * 2.6) + 'px ' + SERIF; if (Q) x.fillStyle = ALTIN; yaz('“', P - 8, y + fs * 1.9); y += fs * 1.35;
        x.font = 'italic 400 ' + fs + 'px ' + SERIF; if (Q) x.fillStyle = '#fff'; var sat = sar(x, v.alinti, gen), mx = Math.max(2, Math.floor((alan - y - 170) / (fs * 1.22)));
        if (sat.length > mx) { sat = sat.slice(0, mx); sat[mx - 1] += '…'; }
        sat.forEach(function (s) { yaz(s, P, y + fs); y += fs * 1.22; }); y += 36;
        if (v.baslik) { if (Q) { x.fillStyle = ALTIN; x.fillRect(P, y, 60, 3); } y += 30; x.font = '600 32px ' + SANS; if (Q) x.fillStyle = 'rgba(255,255,255,.85)'; sar(x, v.baslik, gen).slice(0, 2).forEach(function (s) { yaz(s, P, y + 32); y += 44; }); y += 16; } }
      if (v.buyuk) { var bb = v.buyuk.length > 18 ? (bicim === 'hikaye' ? 96 : 84) : (bicim === 'hikaye' ? 140 : 118); x.font = '800 ' + bb + 'px ' + SANS; if (Q) x.fillStyle = renk; sar(x, v.buyuk, gen).slice(0, 2).forEach(function (s) { yaz(s, P - 4, y + bb * .8); y += bb * .98; }); y += 22; }
      if (v.alt) { var ab = v.altBuyuk ? (bicim === 'hikaye' ? 62 : 54) : 38, al = v.altBuyuk ? 6 : 3; x.font = v.altBuyuk ? 'italic 400 ' + ab + 'px ' + SERIF : '400 ' + ab + 'px ' + SANS; if (Q) x.fillStyle = v.altBuyuk ? '#fff' : 'rgba(255,255,255,.78)'; sar(x, v.alt, gen).slice(0, al).forEach(function (s) { yaz(s, P, y + ab); y += ab * 1.32; }); y += 30; }
      var S = (v.satirlar || []).slice(0, bicim === 'hikaye' ? 9 : 5);
      if (S.length) {
        if (Q) { x.fillStyle = 'rgba(231,199,123,.35)'; x.fillRect(P, y, gen, 1.5); }
        S.forEach(function (s) {
          if (s[3] === 'blok') {
            x.font = '600 26px ' + SANS; if ('letterSpacing' in x) x.letterSpacing = '3px'; if (Q) x.fillStyle = ALTIN; yaz(String(s[0]).toLocaleUpperCase('tr'), P, y + 50); if ('letterSpacing' in x) x.letterSpacing = '0px';
            x.font = '700 36px ' + SANS; if (Q) x.fillStyle = s[2] || '#fff'; var l = sar(x, String(s[1]), gen).slice(0, 2); l.forEach(function (tt, j) { yaz(tt, P, y + 102 + j * 46); }); y += 70 + l.length * 46 + 14;
          } else {
            x.font = '400 34px ' + SANS; if (Q) x.fillStyle = 'rgba(255,255,255,.66)'; var sol = String(s[0]); while (x.measureText(sol).width > gen * .52 && sol.length > 4) sol = sol.slice(0, -2) + '…'; yaz(sol, P, y + 62);
            x.font = '700 36px ' + SANS; if (Q) { x.fillStyle = s[2] || '#fff'; x.textAlign = 'right'; } var sag = String(s[1]); while (x.measureText(sag).width > gen * .46 && sag.length > 4) sag = sag.slice(0, -2) + '…'; yaz(sag, W - P, y + 62); if (Q) x.textAlign = 'left';
            y += 96;
          }
          if (Q) { x.fillStyle = 'rgba(231,199,123,.16)'; x.fillRect(P, y, gen, 1); }
        });
        y += 34;
      }
      if (v.not) { x.font = '400 28px ' + SANS; if (Q) x.fillStyle = 'rgba(255,255,255,.5)'; sar(x, v.not, gen).slice(0, 3).forEach(function (s) { yaz(s, P, y + 28); y += 40; }); }
      return y;
    }
    var bas = Math.max(y + 60, fh - (bicim === 'hikaye' ? 230 : 170));
    var son = icerikCiz(bas, false);
    if (son > alan) bas = Math.max(y + 60, bas - (son - alan));
    icerikCiz(bas, true);
    // alt bilgi
    var fy = H - P - 70; x.fillStyle = 'rgba(231,199,123,.55)'; x.fillRect(P, fy, gen, 1.5);
    x.font = '700 34px ' + SANS; x.fillStyle = '#fff'; x.fillText('artvinrehber.com', P, fy + 62);
    x.font = '600 30px ' + SANS; x.fillStyle = ALTIN; x.textAlign = 'right'; x.fillText('@artvinrehber', W - P, fy + 61); x.textAlign = 'left';
    // film dokusu
    var tane = x.getImageData(0, 0, W, H), d = tane.data; for (var i = 0; i < d.length; i += 4) { var n = (Math.random() - .5) * 14; d[i] += n; d[i + 1] += n; d[i + 2] += n; } x.putImageData(tane, 0, 0);
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
    Promise.all([fontYukle(), fotoYukle(v.foto || VARSAYILAN_FOTO), new Promise(function (ok) { if (logo.complete) ok(); else { logo.onload = logo.onerror = ok; } })]).then(function (r) { v._foto = r[1]; yap(); });
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
