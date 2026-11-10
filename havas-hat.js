/* Artvin Rehberi — Havaş hattı: Artvin'den havalimanına giden otobüslerin tahmini yeri (yatay şerit).
   Saatler Havaş'ın durak kalkış saatlerinden zincirlenir (Artvin 04:45 → Borçka 05:15 → Hopa 05:45 …).
   Canlı veri gelince window.hvHatVeri(j.gidis) ile güncellenir. Konumlar tahminidir, GPS değildir. */
(function () {
  'use strict';
  var kutu = document.getElementById('hvHat'); if (!kutu) return;
  var DUR = [
    { k: 'artvin', ad: 'Artvin', tam: 'Artvin Otogar', km: 113 },
    { k: 'borcka', ad: 'Borçka', tam: 'Borçka', km: 84 },
    { k: 'hopa', ad: 'Hopa', tam: 'Hopa Maliye Önü', km: 58 },
    { k: 'arhavi', ad: 'Arhavi', tam: 'Arhavi', km: 47 },
    { k: 'findikli', ad: 'Fındıklı', tam: 'Fındıklı', km: 30 },
    { k: 'ardesen', ad: 'Ardeşen', tam: 'Ardeşen', km: 12 }
  ];
  var SURE = { artvin: 140, borcka: 100, hopa: 60, arhavi: 45, findikli: 30, ardesen: 15 };
  var SAAT = {
    artvin: ['04:45', '13:15', '15:15', '18:30'],
    borcka: ['05:15', '13:45', '15:45', '19:00'],
    hopa: ['05:45', '07:15', '08:15', '14:30', '16:30', '18:15', '19:45', '21:00'],
    arhavi: ['06:00', '07:30', '08:30', '14:45', '16:45', '18:30', '20:00', '21:15'],
    findikli: ['06:15', '07:45', '08:45', '15:00', '17:00', '18:45', '20:15', '21:30'],
    ardesen: ['06:30', '08:00', '09:00', '15:15', '17:15', '19:00', '20:30', '21:45']
  };
  var N = DUR.length; // havalimanı N. düğüm
  var SEFER = [], secili = null, elle = null, zaman;

  function dk(s) { var p = s.split(':'); return +p[0] * 60 + +p[1]; }
  function yaz(m) { m = ((Math.round(m) % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }
  function simdiDk() { var d = new Date(Date.now() + 3 * 3600e3); return d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60; }
  function x(i) { return 5 + i * (90 / N); } // yüzde

  /* Durak saatlerini seferlere zincirle. Bir sonraki durakta, iki durak arasındaki beklenen süreye
     (Havaş'ın havalimanına süre farkı) EN YAKIN boş saat aynı otobüs sayılır; makul aralıkta saat yoksa o durak atlanır.
     Böylece ek sefer ya da saat değişikliği olsa bile otobüsler birbirine karışmaz. */
  function bek(a, b) { return Math.max(10, (SURE[DUR[a].k] || 0) - (SURE[DUR[b].k] || 0)); }
  function zincirle() {
    var kul = {}, L = DUR.map(function (d) { return (SAAT[d.k] || []).map(dk).sort(function (a, b) { return a - b; }); });
    SEFER = [];
    for (var i = 0; i < N; i++) {
      L[i].forEach(function (t, n) {
        if (kul[i + '-' + n]) return;
        kul[i + '-' + n] = 1;
        var s = [{ i: i, t: t }], son = t, sonI = i;
        for (var j = i + 1; j < N; j++) {
          var e = bek(sonI, j), alt = Math.max(5, e * 0.5), ust = e * 1.6 + 10, bul = -1, en = 1e9;
          for (var m = 0; m < L[j].length; m++) { var f = L[j][m] - son; if (!kul[j + '-' + m] && f >= alt && f <= ust && Math.abs(f - e) < en) { en = Math.abs(f - e); bul = m; } }
          if (bul < 0) continue;
          kul[j + '-' + bul] = 1; son = L[j][bul]; sonI = j; s.push({ i: j, t: son });
        }
        var sn = s[s.length - 1];
        s.push({ i: N, t: sn.t + (SURE[DUR[sn.i].k] || 15) });
        SEFER.push(s);
      });
    }
    SEFER.sort(function (a, b) { return a[0].t - b[0].t; });
  }

  /* t anında seferin yeri: düğüm sırası cinsinden (ör. 2.4 = Hopa ile Arhavi arası) ya da null */
  function yer(s, t) {
    if (t < s[0].t || t > s[s.length - 1].t) return null;
    for (var a = 0; a < s.length - 1; a++) {
      var A = s[a], B = s[a + 1];
      if (t >= A.t && t <= B.t) return A.i + (B.i - A.i) * (B.t === A.t ? 0 : (t - A.t) / (B.t - A.t));
    }
    return null;
  }
  function arasi(p) {
    var a = Math.floor(p), b = Math.min(N, a + 1);
    if (p - a < 0.08) return (DUR[a] ? DUR[a].ad : 'Havalimanı') + ' civarı';
    if (b - p < 0.08) return (DUR[b] ? DUR[b].ad : 'Havalimanı') + "'na yaklaşıyor";
    return (DUR[a] ? DUR[a].ad : '') + '–' + (DUR[b] ? DUR[b].ad : 'Havalimanı') + ' arası';
  }
  function seferAdi(s) { return DUR[s[0].i].ad + ' ' + yaz(s[0].t); }
  function rota(s) {
    return s.map(function (d, n) { return (d.i === N ? '✈️ ~' : (DUR[d.i].ad + ' ')) + '<b>' + yaz(d.t) + '</b>'; }).join(' <i>›</i> ');
  }

  kutu.innerHTML =
    '<div class="hh-ust"><span class="hh-bas">Havaş şu an nerede?</span><button type="button" class="hh-canli" id="hhCanli" aria-live="polite"></button></div>' +
    '<div class="hh-serit" id="hhSerit"><div class="hh-cizgi"></div><div class="hh-dolu" id="hhDolu"></div>' +
    DUR.map(function (d, i) { return '<button type="button" class="hh-d" data-i="' + i + '" style="left:' + x(i) + '%" aria-label="' + d.tam + ' durağı"><i></i><span class="hh-ad">' + d.ad + '</span><span class="hh-sn" id="hhSn' + i + '"></span></button>'; }).join('') +
    '<button type="button" class="hh-d hh-hl" data-i="' + N + '" style="left:' + x(N) + '%" aria-label="Rize-Artvin Havalimanı"><i>✈</i><span class="hh-ad">Havalimanı</span><span class="hh-sn"></span></button>' +
    '<div id="hhOto"></div></div>' +
    '<div class="hh-bilgi" id="hhBilgi"></div>' +
    '<div class="hh-kay"><span id="hhKs">04:00</span><input type="range" id="hhRange" min="240" max="1425" step="5" aria-label="Saati kaydır: otobüslerin o saatteki yerini gör"><span>23:45</span></div>' +
    '<p class="hh-not">Otobüsün Havaş saat tablosuna göre <b>olması gereken yeri</b>dir; GPS değildir, trafik ve havaya göre birkaç dakika sapabilir. Kaydırıcıyla günün herhangi bir saatine bak; otobüse ya da durağa dokun.</p>' +
    '<div class="hh-havas"><a href="https://www.havas.net/otobus-hizmetleri" target="_blank" rel="noopener">🚌 havas.net — resmi sefer saatleri ↗</a><a href="tel:08502220487">📞 0850 222 0 487</a></div>';

  var $ = function (i) { return document.getElementById(i); };
  var oto = $('hhOto'), bilgi = $('hhBilgi'), rng = $('hhRange'), canliBtn = $('hhCanli');

  function ciz() {
    var t = elle == null ? simdiDk() : elle;
    canliBtn.innerHTML = elle == null ? '<span class="hh-nok"></span>Canlı · ' + yaz(t) : '⏸ ' + yaz(t) + ' · <u>Şimdiye dön</u>';
    canliBtn.classList.toggle('elle', elle != null);
    if (document.activeElement !== rng) rng.value = Math.max(240, Math.min(1425, t));
    $('hhKs').textContent = '04:00';
    var yolda = [];
    SEFER.forEach(function (s, n) { var p = yer(s, t); if (p != null) yolda.push({ s: s, p: p, n: n }); });
    oto.innerHTML = yolda.map(function (o) {
      return '<button type="button" class="hh-o' + (secili === o.n ? ' sec' : '') + '" data-n="' + o.n + '" style="left:' + (5 + o.p * (90 / N)) + '%" aria-label="' + seferAdi(o.s) + ' seferi, ' + arasi(o.p) + '"><span>🚌</span><em>' + yaz(o.s[0].t) + '</em></button>';
    }).join('');
    // dolu çizgi: seçili (ya da en önde giden) otobüsün kat ettiği yol
    var izle = yolda.filter(function (o) { return o.n === secili; })[0] || yolda[yolda.length - 1];
    var dolu = $('hhDolu');
    if (izle) { var bas = x(izle.s[0].i); dolu.style.left = bas + '%'; dolu.style.width = Math.max(0, 5 + izle.p * (90 / N) - bas) + '%'; } else dolu.style.width = '0';
    // durakların üstünde sıradaki kalkış
    DUR.forEach(function (d, i) {
      var L = (SAAT[d.k] || []).map(dk), s = L.filter(function (v) { return v >= t - 0.5; })[0], e = $('hhSn' + i);
      e.textContent = s != null ? yaz(s) : '—'; e.className = 'hh-sn' + (s != null && s - t <= 30 ? ' yakin' : '');
    });
    [].forEach.call(kutu.querySelectorAll('.hh-d'), function (b) { b.classList.toggle('sec', b.getAttribute('data-i') === bilgi.dataset.durak); });
    // bilgi satırı
    var sec = secili != null && SEFER[secili];
    if (sec) {
      var p = yer(sec, t);
      bilgi.innerHTML = '<b class="hh-et">' + seferAdi(sec) + ' seferi</b> ' + (p != null ? '· şu an <b>' + arasi(p) + '</b>' : t < sec[0].t ? '· ' + Math.round(sec[0].t - t) + ' dk sonra kalkacak' : '· havalimanına vardı') + '<div class="hh-rota">' + rota(sec) + '</div>';
    } else if (bilgi.dataset.durak != null) {
      durakBilgi(+bilgi.dataset.durak, t);
    } else if (yolda.length) {
      bilgi.innerHTML = '<b class="hh-et">Yolda ' + yolda.length + ' otobüs</b> · ' + yolda.map(function (o) { return seferAdi(o.s) + ' seferi <b>' + arasi(o.p) + '</b>'; }).join(' · ') + '<div class="hh-ip">Ayrıntı için otobüse dokun.</div>';
    } else {
      var sonr = SEFER.filter(function (s) { return s[0].t > t; })[0];
      bilgi.innerHTML = sonr ? '<b class="hh-et">Şu an yolda Havaş yok.</b> Sıradaki: <b>' + seferAdi(sonr) + '</b> (' + kalan(sonr[0].t - t) + ' sonra)<div class="hh-rota">' + rota(sonr) + '</div>'
        : '<b class="hh-et">Bugünkü seferler bitti.</b> İlk sefer yarın sabah ' + (SEFER[0] ? '<b>' + seferAdi(SEFER[0]) + '</b>' : '') + '.';
    }
  }
  function kalan(m) { m = Math.round(m); return m >= 60 ? Math.floor(m / 60) + ' sa ' + (m % 60) + ' dk' : m + ' dk'; }
  function durakBilgi(i, t) {
    if (i === N) {
      var gel = SEFER.map(function (s) { return s[s.length - 1].t; }).filter(function (v) { return v >= t; })[0];
      bilgi.innerHTML = '<b class="hh-et">Rize-Artvin Havalimanı</b> · ' + (gel != null ? 'sıradaki Havaş varışı <b>~' + yaz(gel) + '</b>' : 'bugün başka varış yok') + '<div class="hh-ip">Havalimanından dönüş seferleri uçuşlara göre kalkar; saat için Havaş: 0850 222 0 487</div>';
      return;
    }
    var d = DUR[i], L = (SAAT[d.k] || []).map(dk), s = L.filter(function (v) { return v >= t - 0.5; });
    var gelen = s.length && SEFER.filter(function (z) { return z[0].i < i && z.some(function (a) { return a.i === i && a.t === s[0]; }); })[0];
    bilgi.innerHTML = '<b class="hh-et">' + d.tam + '</b> · ' + (s.length ? 'sıradaki kalkış <b>' + yaz(s[0]) + '</b> (' + kalan(s[0] - t) + ' sonra)' : 'bugünkü kalkışlar bitti') +
      (gelen ? ' · ' + DUR[gelen[0].i].ad + ' çıkışlı ' + yaz(gelen[0].t) + ' seferi' : '') +
      '<div class="hh-rota">Bugün: ' + (L.map(yaz).join(' · ') || '—') + ' · Havalimanına ~' + SURE[d.k] + ' dk · ' + d.km + ' km</div>';
  }

  kutu.addEventListener('click', function (e) {
    var o = e.target.closest('.hh-o'), d = e.target.closest('.hh-d');
    if (o) { secili = +o.getAttribute('data-n') === secili ? null : +o.getAttribute('data-n'); delete bilgi.dataset.durak; }
    else if (d) { secili = null; var i = d.getAttribute('data-i'); if (bilgi.dataset.durak === i) delete bilgi.dataset.durak; else bilgi.dataset.durak = i; }
    else if (e.target.closest('#hhCanli')) { elle = null; }
    else return;
    ciz();
  });
  rng.addEventListener('input', function () { elle = +rng.value; ciz(); });

  window.hvHatVeri = function (g) {
    if (!g) return;
    var deg = false;
    DUR.forEach(function (d) { var v = g[d.k]; if (v && v.hizmet !== false && v.saatler && v.saatler.length) { SAAT[d.k] = v.saatler.slice(); deg = true; } var m = v && v.sure && parseInt(v.sure, 10); if (m) SURE[d.k] = m; });
    if (deg) { secili = null; zincirle(); ciz(); }
  };
  window.hvHatSeferler = function () { return SEFER.map(function (z) { return z.map(function (a) { return (DUR[a.i] ? DUR[a.i].ad : 'HL') + ' ' + yaz(a.t); }).join(' > '); }); };
  zincirle(); ciz();
  if (window.HV_GIDIS) window.hvHatVeri(window.HV_GIDIS);
  zaman = setInterval(function () { if (!document.hidden) ciz(); }, 15000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) ciz(); });
})();
