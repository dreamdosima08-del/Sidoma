/* ============================================================
   ARTVİN YOL DURUMU — ORTAK MODÜL
   yol-durumu.html, /yol/*.html sayfaları ve yol-uyari.js bunu kullanır.
   ============================================================ */
(function(){
  var SAAT = 3600*1000;
  var PROJE = 'artvin-imece';
  var API_KEY = 'AIzaSyDPPh1T_PLdfbuQdYbP-HXrnc3a5Nb1nzI';

  // Web push anahtarı: Firebase Console > Proje Ayarları > Cloud Messaging > Web Push sertifikaları
  // Boş kaldıkça "Kapanınca haber ver" butonu görünmez.
  var VAPID_KEY = '';

  var YOLLAR = [
    {id:'artvin-savsat',  ad:'Artvin – Şavşat',             kisa:'Şavşat yolu',          alt:'Çoruh vadisi · heyelan riskli',  bolge:'ic',    lat:41.22, lon:42.10},
    {id:'savsat-ardahan', ad:'Şavşat – Ardahan',            kisa:'Sahara Geçidi',        alt:'Sahara Geçidi · kışın kar',       bolge:'ic',    lat:41.20, lon:42.55},
    {id:'artvin-yusufeli',ad:'Artvin – Yusufeli – Erzurum', kisa:'Yusufeli-Erzurum yolu',alt:'Deriner tünelleri güzergahı',     bolge:'ic',    lat:40.98, lon:41.65},
    {id:'artvin-ardanuc', ad:'Artvin – Ardanuç',            kisa:'Ardanuç yolu',         alt:'Ardanuç yolu',                   bolge:'ic',    lat:41.14, lon:41.96},
    {id:'artvin-borcka',  ad:'Artvin – Borçka',             kisa:'Borçka yolu',          alt:'Çoruh boyu',                      bolge:'ic',    lat:41.28, lon:41.72},
    {id:'borcka-hopa',    ad:'Borçka – Hopa',               kisa:'Borçka-Hopa yolu',     alt:'Cankurtaran güzergahı',           bolge:'ic',    lat:41.39, lon:41.55},
    {id:'borcka-camili',  ad:'Borçka – Macahel (Camili)',   kisa:'Macahel yolu',         alt:'Köy/yayla yolu',                  bolge:'ic',    lat:41.43, lon:41.90},
    {id:'borcka-murgul',  ad:'Borçka – Murgul',             kisa:'Murgul yolu',          alt:'Murgul yolu',                     bolge:'ic',    lat:41.27, lon:41.58},
    {id:'artvin-kafkasor',ad:'Artvin – Kafkasör Yaylası',   kisa:'Kafkasör yolu',        alt:'Yayla yolu',                      bolge:'ic',    lat:41.19, lon:41.76},
    {id:'hopa-arhavi',    ad:'Hopa – Arhavi – Rize sınırı', kisa:'Sahil yolu (Arhavi)',  alt:'Karadeniz Sahil Yolu · Kıyıcık',   bolge:'sahil', lat:41.37, lon:41.35},
    {id:'hopa-sarp',      ad:'Hopa – Kemalpaşa – Sarp',     kisa:'Sarp yolu',            alt:'Sahil yolu · sınır kapısı',       bolge:'sahil', lat:41.47, lon:41.49}
  ];
  var SEBEP = {heyelan:'Heyelan / kaya', kar:'Kar / buzlanma', kaza:'Kaza', calisma:'Yol çalışması', sel:'Sel / su', diger:'Diğer'};
  var ETIKET = {kapali:'Kapalı', dikkat:'Dikkat', acik:'Açıldı', yok:'Bildirim yok'};

  function zamanMs(r){
    if (!r) return 0;
    if (typeof r.zamanMs === 'number') return r.zamanMs;
    if (r.zaman && r.zaman.toMillis) return r.zaman.toMillis();
    return r._yerel || Date.now();
  }
  function once(ms){
    var dk = Math.max(0, Math.round((Date.now()-ms)/60000));
    if (dk < 1) return 'az önce';
    if (dk < 60) return dk+' dk önce';
    return Math.floor(dk/60)+' sa önce';
  }
  function saatStr(ms){ var d=new Date(ms); return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2); }
  function esc(s){ return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }

  // Bildirimin görünür kalma süresi: onaylandıkça uzar
  function omur(r){
    if (r.durum==='acildi') return 6*SAAT;
    var base = r.kaynak==='editor' ? 12*SAAT : 4*SAAT;
    return Math.min(24*SAAT, base + (r.onay||0)*2*SAAT);
  }
  function aktifler(raporlar, yolId){
    var simdi = Date.now();
    return raporlar.filter(function(r){ return r.yol===yolId && (simdi - zamanMs(r)) < omur(r); })
                   .sort(function(a,b){ return zamanMs(b)-zamanMs(a); });
  }
  function durumHesapla(raporlar, yolId){
    var a = aktifler(raporlar, yolId);
    if (!a.length) return {kod:'yok', rapor:null, liste:a};
    var ust = a[0];
    if (ust.durum==='acildi') return {kod:'acik', rapor:ust, liste:a};
    if ((ust.acildiOy||0) > (ust.onay||0)) return {kod:'acik', rapor:ust, liste:a, onaylaAcildi:true};
    return {kod:ust.durum, rapor:ust, liste:a};
  }
  function yolBul(id){ for (var i=0;i<YOLLAR.length;i++) if (YOLLAR[i].id===id) return YOLLAR[i]; return null; }

  // Firebase SDK yüklemeden, hafif REST okuması (uyarı şeridi ve yol sayfaları için)
  function restGetir(){
    var url = 'https://firestore.googleapis.com/v1/projects/'+PROJE+'/databases/(default)/documents:runQuery?key='+API_KEY;
    var sinir = new Date(Date.now()-24*SAAT).toISOString();
    var govde = {structuredQuery:{
      from:[{collectionId:'yol_bildirim'}],
      where:{fieldFilter:{field:{fieldPath:'zaman'},op:'GREATER_THAN_OR_EQUAL',value:{timestampValue:sinir}}},
      orderBy:[{field:{fieldPath:'zaman'},direction:'DESCENDING'}],
      limit:300
    }};
    return fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(govde)})
      .then(function(r){ return r.json(); })
      .then(function(sat){
        return (Array.isArray(sat)?sat:[]).filter(function(s){return s.document;}).map(function(s){
          var f = s.document.fields||{}, g=function(k){ var v=f[k]; if(!v) return undefined; return v.stringValue!==undefined?v.stringValue:(v.integerValue!==undefined?+v.integerValue:(v.booleanValue!==undefined?v.booleanValue:(v.timestampValue||undefined))); };
          return {id:s.document.name.split('/').pop(), yol:g('yol'), durum:g('durum'), sebep:g('sebep'), not:g('not'),
                  onay:g('onay')||0, acildiOy:g('acildiOy')||0, kaynak:g('kaynak'), foto:!!g('foto'),
                  zamanMs: g('zaman') ? Date.parse(g('zaman')) : Date.now()};
        });
      });
  }

  function havaGetir(yollar){
    var lat = yollar.map(function(y){return y.lat;}).join(','), lon = yollar.map(function(y){return y.lon;}).join(',');
    return fetch('https://api.open-meteo.com/v1/forecast?latitude='+lat+'&longitude='+lon+'&current=temperature_2m,precipitation,snowfall&timezone=Europe%2FIstanbul')
      .then(function(r){ return r.json(); })
      .then(function(j){
        var arr = Array.isArray(j)?j:[j], out={};
        arr.forEach(function(o,i){ if(o&&o.current&&yollar[i]) out[yollar[i].id]={sicaklik:o.current.temperature_2m, yagis:o.current.precipitation||0, kar:o.current.snowfall||0}; });
        return out;
      });
  }
  function havaChip(h){
    if (!h) return '';
    if (h.kar > 0) return '<span class="hava-chip kar">❄️ Şu an kar yağışı · '+Math.round(h.sicaklik)+'°</span>';
    if (h.yagis >= 0.3) return '<span class="hava-chip yagis">🌧 Şu an yağışlı · '+h.yagis.toFixed(1)+' mm</span>';
    return '<span class="hava-chip">🌤 '+Math.round(h.sicaklik)+'° · yağış yok</span>';
  }

  // ─── INSTAGRAM HİKAYE KARTI (1080x1920) ───
  // satirlar: [{yol, kod, sebep, not, zamanMs}]
  function hikayeKarti(satirlar, baslik){
    var W=1080, H=1920, c=document.createElement('canvas'); c.width=W; c.height=H;
    var x=c.getContext('2d');
    var renk={kapali:'#f25555', dikkat:'#f5a524', acik:'#3ddb8a', yok:'#8a9a90'};
    var hazir = (document.fonts && document.fonts.load) ? Promise.all([document.fonts.load('120px "Bebas Neue"'), document.fonts.load('700 40px "DM Sans"')]).catch(function(){}) : Promise.resolve();
    return hazir.then(function(){
      var g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,'#0f2a1d'); g.addColorStop(1,'#07140d'); x.fillStyle=g; x.fillRect(0,0,W,H);
      // dağ silüeti
      x.fillStyle='rgba(45,90,69,.55)'; x.beginPath(); x.moveTo(0,1500);
      [[90,1380],[210,1450],[330,1280],[450,1400],[560,1230],[690,1380],[800,1300],[930,1420],[1080,1320]].forEach(function(p){x.lineTo(p[0],p[1]);});
      x.lineTo(W,H); x.lineTo(0,H); x.fill();
      x.fillStyle='rgba(10,26,18,.95)'; x.beginPath(); x.moveTo(0,1640);
      for (var i=0;i<=W;i+=40){ x.lineTo(i,1620+Math.sin(i/70)*18); x.lineTo(i+20,1570+Math.sin(i/50)*20); }
      x.lineTo(W,H); x.lineTo(0,H); x.fill();

      x.fillStyle='#3ddb8a'; x.font='700 40px "DM Sans", sans-serif'; x.fillText('● CANLI YOL DURUMU', 90, 170);
      x.fillStyle='#fff'; x.font='150px "Bebas Neue", sans-serif'; x.fillText('ARTVİN', 90, 330);
      x.fillStyle='#f0c040'; var bs=150; x.font=bs+'px "Bebas Neue", sans-serif'; while(x.measureText(baslik||'YOL DURUMU').width>W-180 && bs>70){ bs-=6; x.font=bs+'px "Bebas Neue", sans-serif'; } x.fillText(baslik||'YOL DURUMU', 90, 470);

      var y=620;
      satirlar.slice(0,4).forEach(function(s){
        var yol=yolBul(s.yol)||{ad:s.yol}; var r=renk[s.kod]||renk.yok;
        var kutuH = s.not ? 330 : 270;
        x.fillStyle='rgba(255,255,255,.06)'; roundRect(x,70,y,W-140,kutuH,34); x.fill();
        x.fillStyle=r; roundRect(x,70,y,22,kutuH,11); x.fill();
        x.fillStyle=r; x.font='92px "Bebas Neue", sans-serif'; x.fillText((ETIKET[s.kod]||'').toUpperCase(), 130, y+105);
        x.fillStyle='#fff'; x.font='700 52px "DM Sans", sans-serif'; x.fillText(kes(x, yol.ad, W-260), 130, y+180);
        x.fillStyle='rgba(232,237,233,.7)'; x.font='500 38px "DM Sans", sans-serif';
        var alt = (s.kod!=='acik' && s.sebep && SEBEP[s.sebep] ? SEBEP[s.sebep]+' · ' : '') + (s.zamanMs ? 'saat '+saatStr(s.zamanMs) : '');
        x.fillText(kes(x, alt, W-260), 130, y+240);
        if (s.not){ x.fillStyle='rgba(232,237,233,.55)'; x.font='italic 500 34px "DM Sans", sans-serif'; x.fillText(kes(x,'“'+s.not+'”', W-260), 130, y+295); }
        y += kutuH + 40;
      });

      x.fillStyle='rgba(240,192,64,.95)'; x.font='700 40px "DM Sans", sans-serif';
      x.fillText('Canlı durum ve bildir:', 90, 1760);
      x.fillStyle='#fff'; x.font='800 54px "DM Sans", sans-serif'; x.fillText('artvinrehber.com/yol-durumu', 90, 1830);
      x.fillStyle='rgba(232,237,233,.45)'; x.font='500 28px "DM Sans", sans-serif'; x.fillText('Vatandaş bildirimi · resmi bilgi değildir · Acil: 112', 90, 1885);
      return c;
    });
  }
  function roundRect(x,a,b,w,h,r){ x.beginPath(); x.moveTo(a+r,b); x.arcTo(a+w,b,a+w,b+h,r); x.arcTo(a+w,b+h,a,b+h,r); x.arcTo(a,b+h,a,b,r); x.arcTo(a,b,a+w,b,r); x.closePath(); }
  function kes(x,t,max){ t=String(t||''); if (x.measureText(t).width<=max) return t; while(t.length>3 && x.measureText(t+'…').width>max) t=t.slice(0,-1); return t+'…'; }

  function kartPaylas(canvas, dosyaAdi){
    return new Promise(function(coz){
      canvas.toBlob(function(blob){
        var dosya = new File([blob], dosyaAdi||'artvin-yol-durumu.png', {type:'image/png'});
        if (navigator.canShare && navigator.canShare({files:[dosya]})){
          navigator.share({files:[dosya], title:'Artvin Yol Durumu', text:'Canlı durum: artvinrehber.com/yol-durumu.html'}).then(function(){coz('paylasildi');}).catch(function(){coz('iptal');});
        } else {
          var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=dosya.name; document.body.appendChild(a); a.click(); a.remove();
          coz('indirildi');
        }
      }, 'image/png');
    });
  }

  window.YOL = {SAAT:SAAT, PROJE:PROJE, API_KEY:API_KEY, VAPID_KEY:VAPID_KEY, YOLLAR:YOLLAR, SEBEP:SEBEP, ETIKET:ETIKET,
    zamanMs:zamanMs, once:once, saatStr:saatStr, esc:esc, omur:omur, aktifler:aktifler, durumHesapla:durumHesapla, yolBul:yolBul,
    restGetir:restGetir, havaGetir:havaGetir, havaChip:havaChip, hikayeKarti:hikayeKarti, kartPaylas:kartPaylas};
})();
