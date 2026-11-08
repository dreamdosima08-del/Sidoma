/* Artvin Rehberi — 16 günlük kar tahmini (Open-Meteo). Kar sayfası, hava sayfası ve kar notu yönetim sayfası kullanır.
   Python tarafı (araclar/kar_sayfa.py) aynı noktaları ve eşiği kullanır; birini değiştirirsen ikisini de değiştir. */
(function(){
'use strict';
var YER=[
  {k:'merkez',ad:'Artvin merkez',lat:41.1828,lon:41.8183,m:550},
  {k:'kafkasor',ad:'Kafkasör Yaylası',lat:41.1633,lon:41.7946,m:1250},
  {k:'atabari',ad:'Atabarı Kayak Merkezi',lat:41.1404,lon:41.7680,m:1800},
  {k:'savsat',ad:'Şavşat',lat:41.2444,lon:42.3667,m:1000},
  {k:'ardanuc',ad:'Ardanuç',lat:41.127,lon:42.061,m:500},
  {k:'yusufeli',ad:'Yusufeli',lat:40.8167,lon:41.5333,m:720},
  {k:'macahel',ad:'Macahel Geçidi (yol)',lat:41.4166,lon:41.8531,m:1850},
  {k:'borcka_karagol',ad:'Borçka Karagöl',lat:41.3852,lon:41.8542,m:1450},
  {k:'savsat_karagol',ad:'Şavşat Karagöl',lat:41.3081,lon:42.4840,m:1600}
];
var ESIK=0.5; // cm: bu kadar ve üstü "kar yağışı" sayılır
var AY=['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'], GUN=['Paz','Pzt','Sal','Çar','Per','Cum','Cmt'];
function gunYaz(g){ var d=new Date(g+'T12:00:00Z'); return d.getUTCDate()+' '+AY[d.getUTCMonth()]+' '+GUN[d.getUTCDay()]; }
function cm(x){ return x<1?'<1':(Math.round(x*10)/10).toLocaleString('tr-TR'); }
function tahmin(){
  try{ var c=JSON.parse(sessionStorage.getItem('karTahmin')||'null'); if(c&&Date.now()-c.z<3*36e5) return Promise.resolve(c.v); }catch(e){}
  var u='https://api.open-meteo.com/v1/forecast?latitude='+YER.map(function(y){return y.lat;}).join(',')+'&longitude='+YER.map(function(y){return y.lon;}).join(',')+
    '&elevation='+YER.map(function(y){return y.m;}).join(',')+'&daily=snowfall_sum,temperature_2m_min,temperature_2m_max,precipitation_probability_max&forecast_days=16&timezone=Europe%2FIstanbul';
  return fetch(u).then(function(r){ if(!r.ok) throw 0; return r.json(); }).then(function(j){
    var A=Array.isArray(j)?j:[j];
    var v=YER.map(function(y,i){
      var d=A[i].daily, gunler=d.time.map(function(t,n){ return {t:t,cm:d.snowfall_sum[n]||0,min:d.temperature_2m_min[n],max:d.temperature_2m_max[n],olas:d.precipitation_probability_max[n]}; }).filter(function(g){ return g.min!=null; });
      var ilk=null,top=0; gunler.forEach(function(g){ top+=g.cm; if(!ilk&&g.cm>=ESIK) ilk=g; });
      return {k:y.k,ad:y.ad,m:y.m,gunler:gunler,ilk:ilk,toplam:top,
        ozet:ilk?gunYaz(ilk.t)+' · ~'+cm(ilk.cm)+' cm':'16 günde kar yok'};
    });
    try{ sessionStorage.setItem('karTahmin',JSON.stringify({z:Date.now(),v:v})); }catch(e){}
    return v;
  });
}
window.KarVeri={YER:YER,ESIK:ESIK,tahmin:tahmin,gunYaz:gunYaz,cm:cm};
})();
