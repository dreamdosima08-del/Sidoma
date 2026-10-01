/* Artvin Rehber — Instagram tarzı hikâye halkaları
   Kullanım: <div id="hikayeler"></div> + <script src="/hikaye.js" defer></script>
   Elle güncellenen hikâyeler: aşağıdaki SABIT dizisi. Hava ve ikinci el canlı gelir. */
(function(){
'use strict';
var KOK=document.getElementById('hikayeler'); if(!KOK) return;

/* ───── İçerik ───── */
var DURAK='https://i.ibb.co/tMg1kRyj/file-00000000d578720a9f914ec28f759bcf.png';
var SABIT=[
 {id:'guncel-2026-10-01',ad:'Güncel',ikon:'📰',kapak:'/kis-merkez-panorama.jpg',kareler:[
   {foto:'/kis-merkez-panorama.jpg',ust:'Yeni rehber',baslik:'Artvin Kış Rehberi yayında',metin:'Kar ne zaman yağar, hangi yollar kapanır? Rakım kaydırıcısı ve yol kartlarıyla.',link:'/blog56-artvin-kis-rehberi.html',dugme:'Rehberi aç'},
   {foto:'/otogar-foto-3.jpg',ust:'Ulaşım haberi',baslik:'İlçeler arası dolmuş ücretleri güncellendi',metin:'22 Eylül 2026 tarifesi: eski ve yeni ücretler bir arada.',link:'/blog55-dolmus-ucretleri-guncellendi.html',dugme:'Haberi oku'}
 ]},
 {id:'ilce-dolmus-2026-09-22',ad:'İlçe Dolmuş',ikon:'🚐',kapak:'/otogar-foto-3.jpg',kareler:[
   {foto:'/otogar-foto-3.jpg',ust:'22 Eylül 2026 tarifesi',baslik:'Borçka 250 ₺ · Murgul 330 ₺ · Ardanuç 350 ₺',metin:'Artvin merkezden ilçelere tek yön ücretler.',link:'/dolmus.html',dugme:'Tüm tarife'},
   {foto:'/otogar-foto-3.jpg',ust:'22 Eylül 2026 tarifesi',baslik:'Hopa · Şavşat · Yusufeli 400 ₺',metin:'Arhavi ve Kemalpaşa 450 ₺.',link:'/dolmus.html',dugme:'Tüm tarife'},
   {foto:'/otogar-foto-3.jpg',ust:'Nereden binilir?',baslik:'İki ayrı kalkış noktası var',metin:'Hopa, Arhavi, Şavşat, Yusufeli: terminal yanındaki durak. Borçka, Ardanuç, Murgul: Artrium AVM alt virajı.',link:'/dolmus.html',dugme:'Duraklar ve telefonlar'}
 ]},
 {id:'sehirici-2026-08',ad:'Şehir İçi',ikon:'🚌',kapak:DURAK,kareler:[
   {foto:DURAK,ust:'Ağustos 2026 tarifesi',baslik:'Tam 40 ₺ · Öğrenci 30 ₺',metin:'İndi-bindi 30 ₺.',link:'/sehirici-dolmus.html',dugme:'Ücret ve saatler'},
   {foto:DURAK,ust:'Günde 243 sefer',baslik:'Ortalama 4 dakikada bir dolmuş',metin:'Terminal → Üst Geçit → Sigorta → Gökorman → AVM → Öğretmenevi. Sonra Orköy, İskebe, Balcıoğlu, M.E. Lojmanları.',link:'/sehirici-dolmus.html',dugme:'Sıradaki dolmuşu gör'}
 ]},
 {id:'oyun-2026',ad:'Oyunlar',ikon:'🎮',renk:'#8a3ffc,#e6337a',kareler:[
   {emoji:'🔤',renk:'#16a34a,#064e3b',ust:'Popüler',baslik:'Artvin Wordle',metin:'Her gün yeni bir Artvin kelimesi. 6 denemede bulabilir misin?',link:'/wordle.html',dugme:'Oyna'},
   {emoji:'🧭',renk:'#f59e0b,#9a3412',ust:'Popüler',baslik:'Sen hangi Artvin ilçesisin?',metin:'Hopa mı, Şavşat mı, Yusufeli mi? Kişiliğine göre öğren.',link:'/artvin-ilce-testi.html',dugme:'Testi çöz'},
   {emoji:'🧠',renk:'#2563eb,#1e1b4b',ust:'Bilgi yarışması',baslik:'Artvin’i ne kadar tanıyorsun?',metin:'Sorularla kendini test et.',link:'/quiz.html',dugme:'Başla'},
   {emoji:'⚡',renk:'#e6337a,#4c1d95',ust:'Yeni',baslik:'Refleks oyunu',metin:'Hızlı mısın? Rekorunu kır.',link:'/reflex.html',dugme:'Oyna'}
 ]}
];

/* ───── Stil ───── */
var css=''+
'#hikayeler{background:linear-gradient(180deg,#1f6b43 0%,#16502f 55%,#0f3622 100%);border-bottom:1px solid rgba(240,192,64,.28);box-shadow:0 6px 18px rgba(0,0,0,.25)}'+
'.hk-sira{display:flex;gap:.55rem;overflow-x:auto;padding:.7rem .8rem .55rem;scrollbar-width:none;max-width:900px;margin:0 auto}'+
'.hk-sira::-webkit-scrollbar{display:none}'+
'.hk{flex:none;width:76px;background:none;border:0;padding:0;cursor:pointer;color:#fff;font:inherit;text-align:center}'+
'.hk-h{display:block;width:66px;height:66px;border-radius:50%;padding:3px;margin:0 auto;background:conic-gradient(from 210deg,#f5c542,#ff6a3d,#e6337a,#8a3ffc,#f5c542)}'+
'.hk.gor .hk-h{background:rgba(255,255,255,.35)}'+
'.hk-i{width:100%;height:100%;border-radius:50%;border:3px solid #17553a;background:#123224 center/cover no-repeat;display:flex;align-items:center;justify-content:center;flex-direction:column;overflow:hidden;line-height:1.05}'+
'.hk-i b{font-size:1.05rem;font-weight:800;color:#fff}.hk-i em{font-style:normal;font-size:1.25rem}'+
'.hk-a{display:block;font-family:inherit;font-size:.68rem;font-weight:600;color:#fff;margin-top:.3rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
'.hk-ov{position:fixed;inset:0;z-index:2147483000;background:#000;display:flex;align-items:center;justify-content:center;touch-action:none}'+
'.hk-kt{font-family:\'DM Sans\',system-ui,sans-serif;position:relative;width:100%;height:100%;max-width:480px;max-height:860px;background:#111;overflow:hidden;user-select:none;-webkit-user-select:none}'+
'@media(min-width:520px){.hk-kt{border-radius:14px;height:92vh}}'+
'.hk-bg{position:absolute;inset:0;background:#123224 center/cover no-repeat}'+
'.hk-bg:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,0) 22%,rgba(0,0,0,0) 45%,rgba(0,0,0,.82) 100%)}'+
'.hk-bar{position:absolute;top:10px;left:10px;right:10px;display:flex;gap:4px;z-index:3}'+
'.hk-bar i{flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.35);overflow:hidden}'+
'.hk-bar i s{display:block;height:100%;width:0;background:#fff}'+
'.hk-ust{position:absolute;top:22px;left:12px;right:12px;display:flex;align-items:center;gap:.55rem;z-index:3;color:#fff}'+
'.hk-ust .m{width:34px;height:34px;border-radius:50%;background:#123224 center/cover;border:2px solid rgba(255,255,255,.8);display:flex;align-items:center;justify-content:center;font-size:1rem}'+
'.hk-ust b{font-size:.9rem;font-weight:700}.hk-ust small{font-size:.75rem;opacity:.75;margin-left:.2rem}'+
'.hk-x{margin-left:auto;background:none;border:0;color:#fff;font-size:1.9rem;line-height:1;cursor:pointer;padding:0 .2rem}'+
'.hk-ic{position:absolute;left:0;right:0;bottom:0;padding:0 20px 28px;z-index:3;color:#fff}'+
'.hk-ic .u{display:inline-block;font-size:.75rem;font-weight:700;background:#f5c542;color:#1d1400;border-radius:12px;padding:3px 10px;margin-bottom:10px}'+
'.hk-ic h3{font-size:1.65rem;line-height:1.15;font-weight:800;margin-bottom:8px;text-shadow:0 2px 12px rgba(0,0,0,.5)}'+
'.hk-ic p{font-size:1rem;line-height:1.5;opacity:.95;margin-bottom:16px}'+
'.hk-go{display:inline-flex;align-items:center;gap:.4rem;background:#fff;color:#0a1a12;text-decoration:none;font-weight:800;font-size:.95rem;padding:12px 22px;border-radius:26px;position:relative;z-index:5}'+
'.hk-sol,.hk-sag{position:absolute;top:70px;bottom:120px;z-index:2}.hk-sol{left:0;width:33%}.hk-sag{right:0;width:67%}'+
'.hk-hava{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;color:#fff;padding:90px 20px 150px;z-index:1}'+
'.hk-hava .bi{font-size:5rem;line-height:1}.hk-hava .bd{font-size:4.6rem;font-weight:800;line-height:1;margin:.3rem 0}'+
'.hk-hava .bt{font-size:1.25rem;font-weight:700}.hk-hava .bm{font-size:1rem;opacity:.9;margin-top:.4rem}'+
'.hk-gun{display:flex;flex-direction:column;gap:10px;width:100%;max-width:330px}'+
'.hk-gun div{display:grid;grid-template-columns:1fr auto;grid-template-rows:auto auto;column-gap:12px;align-items:center;background:rgba(255,255,255,.14);border-radius:14px;padding:12px 16px;text-align:left}'+
'.hk-gun div span:first-child{font-size:1.05rem;font-weight:700}.hk-gun div em{font-style:normal;font-size:1.9rem;grid-row:1/3;grid-column:2;text-align:right}.hk-gun div span:nth-child(3){font-size:.9rem;opacity:.85}.hk-gun div b{font-size:1.05rem;font-weight:700;grid-column:1}'+
'@media(prefers-reduced-motion:reduce){.hk-bar i s{transition:none!important}}';
var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

/* ───── Yardımcılar ───── */
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function gorulen(){try{return JSON.parse(localStorage.getItem('hkGor')||'{}');}catch(e){return {};}}
function gorIsaretle(id){try{var g=gorulen();g[id]=1;localStorage.setItem('hkGor',JSON.stringify(g));}catch(e){}}
var GUN=['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
function wmo(c,gunduz){
  var g=gunduz!==0;
  if(c===0) return {t:'Açık',i:g?'☀️':'🌙',r:g?'#f59e0b,#0ea5e9':'#1e293b,#0f172a'};
  if(c===1) return {t:'Az bulutlu',i:g?'🌤️':'🌙',r:'#38bdf8,#0369a1'};
  if(c===2) return {t:'Parçalı bulutlu',i:'⛅',r:'#60a5fa,#334155'};
  if(c===3) return {t:'Kapalı',i:'☁️',r:'#64748b,#1e293b'};
  if(c===45||c===48) return {t:'Sisli',i:'🌫️',r:'#94a3b8,#334155'};
  if(c>=51&&c<=67) return {t:c>=63&&c<=65?'Yağmurlu':'Hafif yağmur',i:'🌧️',r:'#3b82f6,#1e1b4b'};
  if(c>=71&&c<=77||c===85||c===86) return {t:c===75?'Yoğun kar':'Karlı',i:'🌨️',r:'#93c5fd,#1e3a8a'};
  if(c>=80&&c<=82) return {t:'Sağanak yağış',i:'🌧️',r:'#2563eb,#1e1b4b'};
  if(c>=95) return {t:'Gök gürültülü',i:'⛈️',r:'#6d28d9,#111827'};
  return {t:'—',i:'🌡️',r:'#0f766e,#064e3b'};
}
var R=Math.round;

/* ───── Canlı: hava ───── */
function havaYukle(){
  var u='https://api.open-meteo.com/v1/forecast?latitude=41.183&longitude=41.822&current=temperature_2m,weather_code,is_day,apparent_temperature&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Europe%2FIstanbul&forecast_days=4';
  return fetch(u).then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(d){
    var c=d.current,w=wmo(c.weather_code,c.is_day),dy=d.daily,bugun=new Date().toISOString().slice(0,10);
    var gunler='';
    for(var i=1;i<dy.time.length;i++){var g=wmo(dy.weather_code[i],1),dt=new Date(dy.time[i]+'T12:00:00');
      gunler+='<div><span>'+(i===1?'Yarın':GUN[dt.getDay()])+' · '+R(dy.temperature_2m_max[i])+'° / '+R(dy.temperature_2m_min[i])+'°</span><em>'+g.i+'</em><span>'+esc(g.t)+(dy.precipitation_probability_max[i]!=null?' · yağış %'+dy.precipitation_probability_max[i]:'')+'</span></div>';}
    var y=wmo(dy.weather_code[1],1);
    return {id:'hava-'+bugun,ad:'Hava '+R(c.temperature_2m)+'°',ikon:w.i,metinHalka:R(c.temperature_2m)+'°',renk:w.r,kareler:[
      {renk:w.r,ust:'Artvin Merkez · şimdi',hava:'<div class="bi">'+w.i+'</div><div class="bd">'+R(c.temperature_2m)+'°</div><div class="bt">'+esc(w.t)+'</div><div class="bm">Hissedilen '+R(c.apparent_temperature)+'° · Bugün en yüksek '+R(dy.temperature_2m_max[0])+'°, en düşük '+R(dy.temperature_2m_min[0])+'°'+(dy.precipitation_probability_max[0]!=null?' · Yağış ihtimali %'+dy.precipitation_probability_max[0]:'')+'</div>',link:'/hava.html',dugme:'İlçe ilçe hava'},
      {renk:y.r,ust:'Önümüzdeki günler',hava:'<div class="hk-gun">'+gunler+'</div>',link:'/hava.html',dugme:'Saatlik tahmin'}
    ]};
  });
}

/* ───── Canlı: ikinci el ───── */
function ikinciElYukle(){
  var REST='https://firestore.googleapis.com/v1/projects/artvin-imece/databases/(default)/documents',KEY='AIzaSyDPPh1T_PLdfbuQdYbP-HXrnc3a5Nb1nzI';
  var q={structuredQuery:{from:[{collectionId:'ikinci_el_yayin'}],orderBy:[{field:{fieldPath:'yayinZaman'},direction:'DESCENDING'}],limit:8}};
  function dec(v){if(!v)return null;if('stringValue' in v)return v.stringValue;if('integerValue' in v)return +v.integerValue;if('doubleValue' in v)return v.doubleValue;if('booleanValue' in v)return v.booleanValue;if('timestampValue' in v)return v.timestampValue;return null;}
  return fetch(REST+':runQuery?key='+KEY,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(q)})
   .then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(a){
    var simdi=Date.now(),k=[];
    a.forEach(function(x){if(!x.document)return;var f=x.document.fields||{},o={};for(var n in f)o[n]=dec(f[n]);o.id=x.document.name.split('/').pop();
      if(o.satildi)return; if(o.bitis&&Date.parse(o.bitis)<simdi)return;
      var foto=(typeof o.kapak==='string'&&/^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(o.kapak))?o.kapak:'';
      if(k.length<5)k.push({foto:foto,renk:'#7c3aed,#0f172a',ust:'Yeni ilan'+(o.ilce?' · '+o.ilce:''),baslik:o.baslik||'İlan',metin:(Number(o.fiyat)?Number(o.fiyat).toLocaleString('tr-TR')+' ₺':''),link:'/ikinci-el.html?ilan='+encodeURIComponent(o.id),dugme:'İlanı gör'});});
    if(!k.length)return null;
    return {id:'ie-'+k.map(function(x){return x.link;}).join('').length+'-'+k[0].link.slice(-8),ad:'İkinci el',ikon:'🛒',kapak:k[0].foto,kareler:k};
  });
}

/* ───── Halka satırı ───── */
var LISTE=[],sira=document.createElement('div');sira.className='hk-sira';sira.setAttribute('role','list');KOK.appendChild(sira);
function ciz(){
  var g=gorulen();
  sira.innerHTML=LISTE.map(function(h,i){
    var ic=h.metinHalka?'<em>'+h.ikon+'</em><b>'+esc(h.metinHalka)+'</b>':(h.kapak?'':'<em>'+h.ikon+'</em>');
    var bg=h.kapak?' style="background-image:url(\''+h.kapak.replace(/'/g,'%27')+'\')"':(h.renk?' style="background:linear-gradient(160deg,'+h.renk+')"':'');
    return '<button class="hk'+(g[h.id]?' gor':'')+'" data-i="'+i+'" role="listitem" aria-label="'+esc(h.ad)+' hikâyesini aç"><span class="hk-h"><span class="hk-i"'+bg+'>'+ic+'</span></span><span class="hk-a">'+esc(h.ad)+'</span></button>';
  }).join('');
}
sira.addEventListener('click',function(e){var b=e.target.closest('.hk');if(b)ac(+b.getAttribute('data-i'),0);});

/* ───── Görüntüleyici ───── */
var ov=null,hi=0,ki=0,zam=null,bas=0,kalan=0,SURE=6000,dur=false;
function ac(h,k){
  hi=h;ki=k;
  if(!ov){ov=document.createElement('div');ov.className='hk-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');document.body.appendChild(ov);
    document.addEventListener('keydown',tus);}
  document.documentElement.style.overflow='hidden';
  kare();
}
function kapat(){clearTimeout(zam);if(ov){ov.remove();ov=null;}document.removeEventListener('keydown',tus);document.documentElement.style.overflow='';ciz();}
function tus(e){if(e.key==='Escape')kapat();else if(e.key==='ArrowRight')ileri();else if(e.key==='ArrowLeft')geri();}
function kare(){
  clearTimeout(zam);var h=LISTE[hi],x=h.kareler[ki];gorIsaretle(h.id);
  var bars=h.kareler.map(function(_,i){return '<i><s style="width:'+(i<ki?100:0)+'%"></s></i>';}).join('');
  var bg=x.foto?'background-image:url(\''+x.foto.replace(/'/g,'%27')+'\')':'background:linear-gradient(160deg,'+(x.renk||h.renk||'#0f766e,#064e3b')+')';
  var govde=x.hava?'<div class="hk-hava">'+x.hava+'</div>':(x.emoji?'<div class="hk-hava"><div class="bi">'+x.emoji+'</div></div>':'');
  var alt='<div class="hk-ic">'+(x.ust&&!x.hava?'<span class="u">'+esc(x.ust)+'</span>':'')+(x.baslik?'<h3>'+esc(x.baslik)+'</h3>':'')+(x.metin?'<p>'+esc(x.metin)+'</p>':'')+(x.link?'<a class="hk-go" href="'+esc(x.link)+'">'+esc(x.dugme||'Sayfaya git')+' ›</a>':'')+'</div>';
  var m=h.kapak?'<span class="m" style="background-image:url(\''+h.kapak.replace(/'/g,'%27')+'\')"></span>':'<span class="m">'+h.ikon+'</span>';
  ov.innerHTML='<div class="hk-kt"><div class="hk-bg" style="'+bg+'"></div>'+govde+'<div class="hk-bar">'+bars+'</div><div class="hk-ust">'+m+'<b>'+esc(h.ad)+'</b><small>'+esc(x.hava?x.ust:'')+'</small><button class="hk-x" aria-label="Kapat">×</button></div><div class="hk-sol"></div><div class="hk-sag"></div>'+alt+'</div>';
  ov.querySelector('.hk-x').onclick=kapat;
  var sol=ov.querySelector('.hk-sol'),sag=ov.querySelector('.hk-sag'),kt=ov.querySelector('.hk-kt');
  sol.onclick=geri;sag.onclick=ileri;
  kt.addEventListener('pointerdown',function(e){if(e.target.closest('a,button'))return;durdur();});
  kt.addEventListener('pointerup',devam);kt.addEventListener('pointercancel',devam);
  var y0=null;kt.addEventListener('touchstart',function(e){y0=e.touches[0].clientY;},{passive:true});
  kt.addEventListener('touchend',function(e){if(y0!=null&&e.changedTouches[0].clientY-y0>90)kapat();y0=null;});
  ov.onclick=function(e){if(e.target===ov)kapat();};
  kalan=SURE;dur=false;baslat();
}
function cubuk(){return ov&&ov.querySelectorAll('.hk-bar s')[ki];}
function baslat(){var s=cubuk();if(!s)return;bas=Date.now();
  var yuzde=100-(kalan/SURE*100);s.style.transition='none';s.style.width=yuzde+'%';void s.offsetWidth;
  s.style.transition='width '+kalan+'ms linear';s.style.width='100%';zam=setTimeout(ileri,kalan);}
function durdur(){if(dur)return;dur=true;clearTimeout(zam);kalan=Math.max(300,kalan-(Date.now()-bas));var s=cubuk();if(s){var w=getComputedStyle(s).width;s.style.transition='none';s.style.width=w;}}
function devam(){if(!dur)return;dur=false;baslat();}
function ileri(){var h=LISTE[hi];if(ki<h.kareler.length-1){ki++;kare();}else if(hi<LISTE.length-1){hi++;ki=0;kare();}else kapat();}
function geri(){if(ki>0){ki--;kare();}else if(hi>0){hi--;ki=LISTE[hi].kareler.length-1;kare();}else kare();}

/* ───── Başlat ───── */
var yerHava={id:'hava-yukleniyor',ad:'Hava',ikon:'🌤️',renk:'#0ea5e9,#0f766e',kareler:[{renk:'#0ea5e9,#0f766e',ust:'Artvin',hava:'<div class="bi">🌤️</div><div class="bt">Hava durumu yükleniyor…</div>',link:'/hava.html',dugme:'Hava durumu'}]};
LISTE=[yerHava].concat(SABIT);ciz();
havaYukle().then(function(h){LISTE[0]=h;if(!ov)ciz();}).catch(function(){});

})();
