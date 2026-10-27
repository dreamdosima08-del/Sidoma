/* Yol buzlanma göstergesi: yol sayfasındaki #buzlanma kutusunun data-n niteliğindeki
   noktalar için Open-Meteo'dan anlık hava ve önümüzdeki 12 saati alır, risk hesaplar.
   data-n biçimi: "Ad|enlem|boylam; Ad|enlem|boylam; ..."  */
(function () {
  var kok = document.getElementById('buzlanma'); if (!kok) return;
  var N = kok.getAttribute('data-n').split(';').map(function (x) { var p = x.trim().split('|'); return { ad: p[0], lat: +p[1], lon: +p[2] }; });
  var css = document.createElement('style');
  css.textContent = '#buzlanma{margin:1rem 0 1.25rem;border:1px solid var(--border,rgba(255,255,255,.1));border-radius:16px;padding:1rem;background:rgba(255,255,255,.035);font-family:inherit}' +
    '#buzlanma .bz-ust{font-size:.62rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--dim,#9aa)}' +
    '#buzlanma .bz-ozet{display:flex;align-items:center;gap:.7rem;margin:.55rem 0 .85rem}' +
    '#buzlanma .bz-isik{width:14px;height:14px;border-radius:50%;flex:none;box-shadow:0 0 0 4px rgba(255,255,255,.06)}' +
    '#buzlanma .bz-baslik{font-size:1.02rem;font-weight:800;color:#fff;line-height:1.35}' +
    '#buzlanma .bz-liste{display:grid;gap:.45rem}' +
    '#buzlanma .bz-n{display:grid;grid-template-columns:1fr auto;gap:.15rem .6rem;align-items:center;background:rgba(0,0,0,.22);border-radius:12px;padding:.6rem .75rem;border-left:4px solid #8a9a90}' +
    '#buzlanma .bz-ad{font-weight:700;color:#fff;font-size:.88rem}#buzlanma .bz-ad small{font-weight:500;color:var(--dim,#9aa);margin-left:.35rem}' +
    '#buzlanma .bz-t{font-size:1.3rem;font-weight:800;color:#fff;text-align:right;grid-row:span 2}' +
    '#buzlanma .bz-ac{font-size:.76rem;color:var(--dim,#9aa);line-height:1.45}' +
    '#buzlanma .bz-not{font-size:.68rem;color:var(--soluk,#788);margin-top:.7rem;line-height:1.5}';
  document.head.appendChild(css);
  var R = { 2: ['YÜKSEK', '#f25555'], 1: ['ORTA', '#f5a524'], 0: ['DÜŞÜK', '#3ddb8a'] };
  function durum(c) { return c >= 71 && c <= 77 || c === 85 || c === 86 ? 'kar' : c >= 51 && c <= 67 || c >= 80 && c <= 82 ? 'yağmur' : c >= 95 ? 'fırtına' : c === 45 || c === 48 ? 'sis' : c <= 1 ? 'açık' : 'bulutlu'; }
  function yuvar(v) { return Math.round(v).toString().replace('-', '−'); }
  kok.innerHTML = '<div class="bz-ust">🌡️ Yol üzerinde buzlanma riski · canlı</div><div class="bz-ozet"><span class="bz-isik" style="background:#8a9a90"></span><span class="bz-baslik">Hava verisi yükleniyor…</span></div><div class="bz-liste"></div>';
  var q = 'https://api.open-meteo.com/v1/forecast?latitude=' + N.map(function (n) { return n.lat; }).join(',') + '&longitude=' + N.map(function (n) { return n.lon; }).join(',') +
    '&current=temperature_2m,precipitation,snowfall,weather_code&hourly=temperature_2m,precipitation,snowfall&forecast_hours=12&timezone=Europe%2FIstanbul';
  fetch(q).then(function (r) { return r.json(); }).then(function (d) {
    if (!Array.isArray(d)) d = [d];
    var enKotu = -1, enKotuAd = '', html = '';
    d.forEach(function (x, i) {
      var c = x.current, h = x.hourly, n = N[i];
      var minT = Math.min.apply(null, h.temperature_2m), kar12 = h.snowfall.reduce(function (a, b) { return a + b; }, 0), yag12 = h.precipitation.reduce(function (a, b) { return a + b; }, 0);
      var islak = c.precipitation > 0 || c.snowfall > 0, r = 0;
      if ((c.temperature_2m <= 1 && islak) || kar12 >= 0.5 || (minT <= 0 && yag12 >= 0.5)) r = 2;
      else if (minT <= 2 || (c.temperature_2m <= 3 && islak) || kar12 > 0) r = 1;
      var ac = 'Şu an ' + durum(c.weather_code) + '. ';
      ac += kar12 > 0 ? 'Önümüzdeki 12 saatte ' + (Math.round(kar12 * 10) / 10).toString().replace('.', ',') + ' cm kar bekleniyor. ' : yag12 >= 0.5 ? 'Önümüzdeki 12 saatte yağış var. ' : '';
      ac += 'En düşük ' + yuvar(minT) + '°.';
      if (r > enKotu) { enKotu = r; enKotuAd = n.ad; }
      html += '<div class="bz-n" style="border-left-color:' + R[r][1] + '"><div class="bz-ad">' + n.ad + '<small>' + Math.round(x.elevation) + ' m</small></div><div class="bz-t">' + yuvar(c.temperature_2m) + '°</div><div class="bz-ac">Risk: <b style="color:' + R[r][1] + '">' + R[r][0] + '</b> · ' + ac + '</div></div>';
    });
    var b = kok.querySelector('.bz-baslik'), i = kok.querySelector('.bz-isik');
    b.textContent = enKotu === 2 ? enKotuAd + ' civarında buzlanma riski YÜKSEK. Zincir ve kış lastiği olmadan çıkmayın.' :
      enKotu === 1 ? enKotuAd + ' civarında gece ve sabah don olabilir; dikkatli sürün.' : 'Yol boyunca şu an buzlanma riski düşük.';
    i.style.background = R[enKotu][1];
    kok.querySelector('.bz-liste').innerHTML = html;
    kok.insertAdjacentHTML('beforeend', '<div class="bz-not">Otomatik hesap: Open-Meteo hava verisi, sayfa her açıldığında yenilenir. Yolun açık ya da kapalı olduğunu göstermez; resmi bilgi için e-Devlet "Trafiğe Kapalı Yol Sorgulama".</div>');
  }).catch(function () { kok.querySelector('.bz-baslik').textContent = 'Hava verisi şu an alınamadı.'; });
})();
