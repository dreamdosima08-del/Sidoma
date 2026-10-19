/* Kopyalanan uzun metnin sonuna kaynak bağlantısı ekler.
   Kısa kopyalar (telefon, adres, saat) ve form alanları olduğu gibi kalır. */
(function () {
  var ESIK = 120; // karakter: bundan kısa seçimlere dokunma
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  document.addEventListener('copy', function (e) {
    try {
      var el = document.activeElement;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      var sec = window.getSelection ? window.getSelection() : null;
      if (!sec || sec.isCollapsed) return;
      var metin = sec.toString();
      if (metin.replace(/\s+/g, ' ').trim().length < ESIK || !e.clipboardData) return;
      var url = location.origin + location.pathname;
      var baslik = (document.title || 'Artvin Rehberi').split('|')[0].trim();
      var kap = document.createElement('div');
      for (var i = 0; i < sec.rangeCount; i++) kap.appendChild(sec.getRangeAt(i).cloneContents());
      e.clipboardData.setData('text/plain', metin.replace(/\s+$/, '') + '\n\nKaynak: ' + url);
      e.clipboardData.setData('text/html', kap.innerHTML + '<p>Kaynak: <a href="' + esc(url) + '">' + esc(baslik) + ' – artvinrehber.com</a></p>');
      e.preventDefault();
    } catch (x) { /* bir şey ters giderse normal kopyalama devam etsin */ }
  });
})();
