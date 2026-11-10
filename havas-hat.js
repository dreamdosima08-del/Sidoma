/* Artvin Rehberi — "Havaş şu an nerede?" (sade sürüm)
   Artvin → Borçka → Hopa → Arhavi → Havalimanı hattında, bugünkü Havaş saatlerine göre otobüsün olması gereken yer.
   Saatler sayfadan gelir: window.HV_GIDIS (ilk yükleme) ve window.hvHatVeri(gidis) (canlı veri). GPS değildir. */
(function () {
  'use strict';
  var kutu = document.getElementById('hvHat'); if (!kutu) return;
  var DUR = [
    { k: 'artvin', ad: 'Artvin', e: "Artvin'e" },
    { k: 'borcka', ad: 'Borçka', e: "Borçka'ya" },
    { k: 'hopa', ad: 'Hopa', e: "Hopa'ya" },
    { k: 'arhavi', ad: 'Arhavi', e: "Arhavi'ye" }
  ];
  var N = DUR.length, SURE = { artvin: 140, borcka: 100, hopa: 60, arhavi: 45 }, SAAT = {}, SEFER = [];

  function dk(s) { var p = s.split(':'); return +p[0] * 60 + +p[1]; }
  function yaz(m) { m = ((Math.round(m) % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); }
  function simdiDk() { var d = new Date(Date.now() + 3 * 3600e3); return d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60; }
  function x(i) { return 6 + i * (88 / N); }

  /* Her durağın saatini, bir sonraki durakta beklenen süreye en yakın saatle eşleştirip tek otobüs yapar */
  function zincirle() {
    var kul = {}, L = DUR.map(function (d) { return (SAAT[d.k] || []).map(dk).sort(function (a, b) { return a - b; }); });
    SEFER = [];
    for (var i = 0; i < N; i++) L[i].forEach(function (t, n) {
      if (kul[i + '-' + n]) return; kul[i + '-' + n] = 1;
      var s = [{ i: i, t: t }], son = t, sonI = i;
      for (var j = i + 1; j < N; j++) {
        var e = Math.max(10, SURE[DUR[sonI].k] - SURE[DUR[j].k]), alt = Math.max(5, e * 0.5), ust = e * 1.6 + 10, bul = -1, en = 1e9;
        for (var m = 0; m < L[j].length; m++) { var f = L[j][m] - son; if (!kul[j + '-' + m] && f >= alt && f <= ust && Math.abs(f - e) < en) { en = Math.abs(f - e); bul = m; } }
        if (bul < 0) continue;
        kul[j + '-' + bul] = 1; son = L[j][bul]; sonI = j; s.push({ i: j, t: son });
      }
      s.push({ i: N, t: son + SURE[DUR[sonI].k] });
      SEFER.push(s);
    });
    SEFER.sort(function (a, b) { return a[0].t - b[0].t; });
  }
  function yer(s, t) {
    if (t < s[0].t || t > s[s.length - 1].t) return null;
    for (var a = 0; a < s.length - 1; a++) { var A = s[a], B = s[a + 1]; if (t >= A.t && t <= B.t) return A.i + (B.i - A.i) * ((t - A.t) / Math.max(1, B.t - A.t)); }
    return null;
  }
  function nerede(p) {
    var a = Math.floor(p), b = a + 1;
    if (p - a < 0.1) return DUR[a] ? '<b>' + DUR[a].ad + '</b> durağında' : '<b>havalimanında</b>';
    if (b - p < 0.15) return DUR[b] ? '<b>' + DUR[b].e + '</b> varmak üzere' : '<b>havalimanına</b> varmak üzere';
    return '<b>' + DUR[a].ad + ' ile ' + (DUR[b] ? DUR[b].ad : 'havalimanı') + '</b> arasında';
  }
  function ad(s) { return yaz(s[0].t) + ' ' + DUR[s[0].i].ad + ' otobüsü'; }

  kutu.innerHTML =
    '<div class="hh-ust"><span class="hh-bas">Havaş şu an nerede?</span><span class="hh-saat" id="hhSaat"></span></div>' +
    '<div class="hh-serit"><div class="hh-cizgi"></div><div class="hh-dolu" id="hhDolu"></div>' +
    DUR.map(function (d, i) { return '<div class="hh-d" style="left:' + x(i) + '%"><i></i><span class="hh-ad">' + d.ad + '</span></div>'; }).join('') +
    '<div class="hh-d hh-hl" style="left:' + x(N) + '%"><i>✈</i><span class="hh-ad">Havalimanı</span></div><div id="hhOto"></div></div>' +
    '<div class="hh-bilgi" id="hhBilgi" aria-live="polite"></div>' +
    '<p class="hh-not">Havaş saat tablosuna göre tahmini yerdir, GPS değildir.</p>' +
    '<div class="hh-havas"><a href="https://www.havas.net/otobus-hizmetleri" target="_blank" rel="noopener">🚌 havas.net — resmi sefer saatleri ↗</a><a href="tel:08502220487">📞 0850 222 0 487</a></div>';

  function ciz() {
    var t = simdiDk(), yolda = [];
    document.getElementById('hhSaat').textContent = 'Saat ' + yaz(t);
    SEFER.forEach(function (s) { var p = yer(s, t); if (p != null) yolda.push({ s: s, p: p }); });
    document.getElementById('hhOto').innerHTML = yolda.map(function (o) { return '<span class="hh-o" style="left:' + (6 + o.p * (88 / N)) + '%" title="' + ad(o.s) + '">🚌</span>'; }).join('');
    var on = yolda[0], dolu = document.getElementById('hhDolu');
    if (on) { var b = x(on.s[0].i); dolu.style.left = b + '%'; dolu.style.width = Math.max(0, 6 + on.p * (88 / N) - b) + '%'; } else dolu.style.width = '0';
    var B = document.getElementById('hhBilgi');
    if (yolda.length) {
      B.innerHTML = yolda.map(function (o) { return '🚌 ' + ad(o.s) + ' şu an ' + nerede(o.p) + ' · havalimanına ~' + yaz(o.s[o.s.length - 1].t); }).join('<br>');
    } else {
      var sonr = SEFER.filter(function (s) { return s[0].t > t; })[0];
      B.innerHTML = sonr ? 'Şu an yolda Havaş yok. Sıradaki: <b>' + ad(sonr) + '</b> (' + Math.round(sonr[0].t - t) + ' dk sonra)'
        : 'Bugünkü Havaş seferleri bitti. Yarının saatleri aşağıdaki kutularda.';
      if (sonr && sonr[0].t - t >= 60) B.innerHTML = B.innerHTML.replace(/\((\d+) dk sonra\)/, function (_, m) { m = +m; return '(' + Math.floor(m / 60) + ' sa ' + (m % 60) + ' dk sonra)'; });
    }
  }

  window.hvHatVeri = function (g) {
    if (!g) return;
    DUR.forEach(function (d) { var v = g[d.k]; if (v && v.hizmet !== false && v.saatler && v.saatler.length) SAAT[d.k] = v.saatler.slice(); });
    zincirle(); ciz();
  };
  window.hvHatSeferler = function () { return SEFER.map(function (z) { return z.map(function (a) { return (DUR[a.i] ? DUR[a.i].ad : 'HL') + ' ' + yaz(a.t); }).join(' > '); }); };
  if (window.HV_GIDIS) window.hvHatVeri(window.HV_GIDIS); else ciz();
  setInterval(function () { if (!document.hidden) ciz(); }, 20000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) ciz(); });
})();
