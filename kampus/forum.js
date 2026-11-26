/* AÇÜ Kampüs Forum çekirdeği (girişsiz). Hem /acukampus.html hem de /kampus/konu|oda/*.html kullanır.
   Arka uç: Cloudflare Worker (acukampus). Süzgeçler sunucuda çalışır; buradaki kontroller yalnızca hızlı geri bildirim içindir. */
(function(){
'use strict';
var API='https://acukampus.dreamdosima08.workers.dev';
var ODALAR=[
 {k:'soru',ad:'Soru ve yardım',ik:'❓',c:'var(--c-soru)',ac:'Ders kaydı, yurt, burs, sınav; aklına takılan her şey'},
 {k:'ders',ad:'Ders ve not',ik:'🎓',c:'var(--c-ders)',ac:'Ders notu, vize-final, ödev ve hoca yorumları'},
 {k:'ilan',ad:'İlan',ik:'🏘️',c:'var(--c-ilan)',ac:'Ev arkadaşı, kiralık, iş ve kayıp-buluntu'},
 {k:'kitap',ad:'İkinci el kitap',ik:'📚',c:'var(--c-kitap)',ac:'Ders kitabı al, sat, takas et'},
 {k:'etkinlik',ad:'Etkinlik',ik:'📢',c:'var(--c-etkinlik)',ac:'Kulüp, konser, turnuva ve kampüs duyuruları'},
 {k:'mizah',ad:'Mizah',ik:'😂',c:'var(--c-mizah)',ac:'Kampüs hayatının komik hâlleri'},
 {k:'itiraf',ad:'İtiraf ve dertleşme',ik:'🤫',c:'var(--c-itiraf)',ac:'İçini dök; paylaşımlar önce incelenir'}
];
var BOLUMLER=[['bolum_bilgisayar','💻','Bilgisayar Mühendisliği'],['bolum_yazilim','💻','Yazılım Mühendisliği'],['bolum_elektrik','⚡','Elektrik-Elektronik Müh.'],['bolum_cevre','🌿','Çevre Mühendisliği'],['bolum_harita','🗺️','Harita Mühendisliği'],['bolum_orman','🌲','Orman Mühendisliği'],['bolum_orman_end','🌲','Orman Endüstrisi Müh.'],['bolum_egitim','📚','Eğitim Fakültesi'],['bolum_hemsire','🏥','Hemşirelik'],['bolum_saglik','💊','Sağlık Bilimleri'],['bolum_turizm','🏨','Turizm Fakültesi'],['bolum_iktisat','📊','İktisat'],['bolum_isletme','💼','İşletme'],['bolum_mimarlik','🏛️','Mimarlık'],['bolum_peyzaj','🌺','Peyzaj Mimarlığı'],['bolum_spor','⚽','Spor Bilimleri'],['bolum_sosyoloji','📖','Sosyoloji'],['bolum_turk_dili','📖','Türk Dili ve Edebiyatı'],['bolum_ilahiyat','🕌','İlahiyat']];
var PROGRAMLAR=[['prog_muhasebe','📋','Muhasebe'],['prog_bilisim','💻','Bilişim Teknolojileri'],['prog_tibbi','🏥','Tıbbi Görüntüleme'],['prog_turizm_otel','🏨','Turizm ve Otel'],['prog_insaat','🏗️','İnşaat Teknolojisi'],['prog_elektrik_p','⚡','Elektrik Programı'],['prog_cocuk','👶','Çocuk Gelişimi'],['prog_saglik','💊','Sağlık Hizmetleri'],['prog_yuksek','🎓','Lisansüstü']];
function oda(k){
  for(var i=0;i<ODALAR.length;i++) if(ODALAR[i].k===k) return ODALAR[i];
  var g=BOLUMLER.concat(PROGRAMLAR).filter(function(x){return x[0]===k;})[0];
  if(g) return {k:k,ad:g[2],ik:g[1],c:'var(--c-bolum)',ac:g[2]+' öğrencilerinin odası'};
  return {k:k,ad:'Genel',ik:'📌',c:'var(--soft)',ac:''};
}

/* ── yardımcılar ── */
function $(i){return document.getElementById(i);}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function hue(s){var n=0;s=String(s||'');for(var i=0;i<s.length;i++)n=(n*31+s.charCodeAt(i))%360;return n;}
function az(d){if(!d)return '';d=new Date(d);var s=Math.floor((Date.now()-d.getTime())/1000);if(s<60)return 'az önce';if(s<3600)return Math.floor(s/60)+' dk önce';if(s<86400)return Math.floor(s/3600)+' sa önce';if(s<2592000)return Math.floor(s/86400)+' gün önce';return d.toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'});}
// Kullanıcı metni → güvenli HTML (yalnızca kendi sitemize ve Google Drive'a giden bağlantılar tıklanır)
function metinHtml(s){
  return esc(s).replace(/https:\/\/(www\.artvinrehber\.com|drive\.google\.com|docs\.google\.com)\/[^\s<]{1,300}/g,function(u){var t=u.replace(/[.,;:!?)]+$/,''),k=u.slice(t.length);return '<a href="'+t+'" rel="noopener'+(/artvinrehber/.test(t)?'':' nofollow ugc')+'"'+(/artvinrehber/.test(t)?'':' target="_blank"')+'>'+(t.length>60?t.slice(0,57)+'…':t)+'</a>'+k;});
}
function toast(t){var e=$('kfToast');if(!e){e=document.createElement('div');e.id='kfToast';e.className='toast';e.setAttribute('role','status');document.body.appendChild(e);}e.textContent=t;e.classList.add('ac');clearTimeout(toast._t);toast._t=setTimeout(function(){e.classList.remove('ac');},3200);}
function ac(id){$(id).classList.add('ac');document.body.style.overflow='hidden';}
function kapat(id){var e=$(id);if(e)e.classList.remove('ac');if(!document.querySelector('.ort.ac'))document.body.style.overflow='';}
var IK={
 yukari:'<svg viewBox="0 0 24 24"><path d="M12 4l8 9h-5v7H9v-7H4z"/></svg>',
 yorum:'<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></svg>',
 paylas:'<svg viewBox="0 0 24 24"><path d="M4 12v7h16v-7M12 3v12M7 8l5-5 5 5"/></svg>',
 bayrak:'<svg viewBox="0 0 24 24"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
 kapat:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>'
};

/* ── kimlik: girişsiz; ilk yazıda sunucu bir jeton verir ── */
var JETON=null,RUMUZ=null,OYLAR={};
try{JETON=localStorage.getItem('acuJeton');RUMUZ=localStorage.getItem('acuRumuz');}catch(e){}
function jetonKaydet(j,r){if(j){JETON=j;try{localStorage.setItem('acuJeton',j);}catch(e){}}if(r){RUMUZ=r;try{localStorage.setItem('acuRumuz',r);}catch(e){}}}
function api(yol,govde){
  var h={'content-type':'application/json'}; if(JETON) h['x-jeton']=JETON;
  return fetch(API+yol,govde?{method:'POST',headers:h,body:JSON.stringify(govde)}:{headers:JETON?{'x-jeton':JETON}:{}})
   .then(function(r){return r.json().catch(function(){return {hata:'Sunucuya ulaşılamadı.'};}).then(function(j){if(!r.ok&&!j.hata)j.hata='Bir sorun oldu, tekrar dene.';return j;});})
   .catch(function(){return {hata:'Bağlantı kurulamadı; internetini kontrol edip tekrar dene.'};});
}
function benYukle(){ if(!JETON) return Promise.resolve(); return api('/api/ben').then(function(j){ if(j&&j.uye){RUMUZ=j.uye.rumuz;OYLAR={};(j.oylar||[]).forEach(function(i){OYLAR[i]=1;});} else if(j&&j.uye===null){JETON=null;try{localStorage.removeItem('acuJeton');}catch(e){}} }); }
var benP=benYukle();

/* ── pencereler ── */
function pencereler(){
  if($('oYaz')) return;
  var h='<div class="ort" id="oYaz" role="dialog" aria-modal="true" aria-labelledby="yazBaslik"><div class="sheet">'+
   '<button class="kapat" data-kapat type="button" aria-label="Kapat">'+IK.kapat+'</button><h2 id="yazBaslik">Yeni konu aç</h2><p class="alt">Üyelik gerekmez. Gerçek adını yazma; bir rumuz seç ya da önerilenle devam et.</p>'+
   '<div id="yRumuzKut"><label class="fl" for="yRumuz">Rumuzun</label><div style="display:flex;gap:.4rem"><input class="fi" id="yRumuz" maxlength="20" autocomplete="off" autocapitalize="off" placeholder="örn. coruh_kartali"><button class="nbtn" id="yZar" type="button" title="Başka bir öneri">🎲</button></div><div class="say-n" style="text-align:left">Rumuz bu cihaza bağlanır, sonradan değişmez.</div></div>'+
   '<div id="yRumuzVar" class="alt" style="display:none"></div>'+
   '<label class="fl">Oda</label><div class="secim" id="yOdalar"></div><button class="nbtn" id="bolumSec" type="button" style="margin-top:.5rem">🏛️ Bölüm veya program odası seç</button>'+
   '<div class="uy" id="yItiraf" style="display:none">İtiraf ve dertleşme paylaşımları yayından önce incelenir. Kimsenin adını, bölümünü ya da tanınmasını sağlayacak bilgiyi yazma.</div>'+
   '<label class="fl" for="yBaslik">Başlık</label><input class="fi" id="yBaslik" maxlength="90" placeholder="Örn: Seyitler\'e akşam son dolmuş kaçta?">'+
   '<label class="fl" for="yMetin">Mesajın</label><textarea class="fta" id="yMetin" maxlength="1500" placeholder="Ayrıntıları yaz. Ne kadar açık yazarsan o kadar iyi yanıt alırsın."></textarea><div class="say-n" id="ySay">0/1500</div>'+
   '<label class="fl" for="yLink">Google Drive bağlantısı (isteğe bağlı, ders notu için)</label><input class="fi" id="yLink" type="url" inputmode="url" placeholder="https://drive.google.com/…">'+
   '<input type="text" id="yWeb" name="web" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">'+
   '<p class="not">Konu açarak <a href="/acukampus.html#kurallar">topluluk kurallarını</a> kabul etmiş olursun. Küfür, hakaret, telefon ve kişisel bilgi içeren yazılar yayınlanmaz; bağlantı içerenler kısa bir kontrolden sonra yayınlanır.</p>'+
   '<div class="hata" id="yHata" role="alert"></div><button class="btn p" id="yGonder" type="button">Konuyu aç</button></div></div>'+
  '<div class="ort" id="oBolum" role="dialog" aria-modal="true" aria-label="Bölüm seç"><div class="sheet">'+
   '<button class="kapat" data-kapat type="button" aria-label="Kapat">'+IK.kapat+'</button><h2>Bölüm ve programlar</h2><p class="alt">Bir odaya dokun.</p><div class="grp" id="bolumListe" style="max-height:62vh;margin-top:.6rem"></div></div></div>';
  var d=document.createElement('div'); d.innerHTML=h; while(d.firstChild) document.body.appendChild(d.firstChild);
  $('yOdalar').addEventListener('click',function(e){var b=e.target.closest('[data-yo]');if(!b)return;yOda=b.getAttribute('data-yo');yOdaCiz();});
  $('bolumSec').onclick=function(){bolumAc(function(k){yOda=k;yOdaCiz();});};
  $('yMetin').addEventListener('input',function(){$('ySay').textContent=this.value.length+'/1500';});
  $('yZar').onclick=rumuzOner;
  $('yGonder').onclick=konuGonder;
  $('bolumListe').addEventListener('click',function(e){var b=e.target.closest('[data-g]');if(!b)return;kapat('oBolum');if(bolumCb)bolumCb(b.getAttribute('data-g'));});
}
document.addEventListener('click',function(e){
  if(e.target.closest('[data-kapat]')){var o=e.target.closest('.ort');if(o)kapat(o.id);}
  else if(e.target.classList&&e.target.classList.contains('ort')){kapat(e.target.id);}
});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){[].forEach.call(document.querySelectorAll('.ort.ac'),function(o){kapat(o.id);});}});
var bolumCb=null;
function bolumAc(cb){
  pencereler(); bolumCb=cb;
  $('bolumListe').innerHTML='<h3>Bölümler</h3>'+BOLUMLER.map(function(x){return '<button type="button" data-g="'+x[0]+'"><span>'+x[1]+'</span><span>'+esc(x[2])+'</span></button>';}).join('')+'<h3>Programlar (MYO)</h3>'+PROGRAMLAR.map(function(x){return '<button type="button" data-g="'+x[0]+'"><span>'+x[1]+'</span><span>'+esc(x[2])+'</span></button>';}).join('');
  ac('oBolum');
}
var oneriler=[];
function rumuzOner(){
  if(oneriler.length){$('yRumuz').value=oneriler.shift();return;}
  api('/api/rumuz-oner').then(function(j){oneriler=(j&&j.oneriler)||[];if(oneriler.length)$('yRumuz').value=oneriler.shift();});
}
function rumuzAlaniCiz(){
  var var_=!!(JETON&&RUMUZ);
  $('yRumuzKut').style.display=var_?'none':'block';
  $('yRumuzVar').style.display=var_?'block':'none';
  if(var_) $('yRumuzVar').innerHTML='<b>@'+esc(RUMUZ)+'</b> rumuzuyla yazıyorsun.';
  else if(!$('yRumuz').value) rumuzOner();
}

/* ── konu açma ── */
var yOda='', acilis=0;
function yOdaCiz(){
  $('yOdalar').innerHTML=ODALAR.map(function(o){return '<button type="button" data-yo="'+o.k+'" class="'+(yOda===o.k?'ak':'')+'">'+o.ik+' '+esc(o.ad)+'</button>';}).join('');
  var ozel=yOda&&!ODALAR.some(function(o){return o.k===yOda;});
  $('bolumSec').textContent=ozel?('✓ '+oda(yOda).ad):'🏛️ Bölüm veya program odası seç';
  $('bolumSec').classList.toggle('p',!!ozel);
  $('yItiraf').style.display=(yOda==='itiraf')?'block':'none';
}
function yazAc(varsayilan){
  pencereler(); yOda=varsayilan||''; $('yHata').textContent=''; yOdaCiz(); acilis=Date.now();
  benP.then(rumuzAlaniCiz); ac('oYaz'); setTimeout(function(){$('yBaslik').focus();},80);
  try{gtag('event','kampus_yaz_ac');}catch(e){}
}
var TEL=/(\+?90|0)?\s*5\d{2}[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}/;
function konuGonder(){
  var bas=$('yBaslik').value.replace(/\s+/g,' ').trim(), m=$('yMetin').value.trim(), l=$('yLink').value.trim(), h=$('yHata'), b=$('yGonder');
  if(!yOda){h.textContent='Bir oda seç.';return;}
  if(bas.length<8){h.textContent='Başlık en az 8 karakter olsun; ne sorduğunu ya da paylaştığını özetle.';return;}
  if(l&&!/^https:\/\/(drive|docs)\.google\.com\//.test(l)){h.textContent='Yalnızca Google Drive bağlantısı ekleyebilirsin.';return;}
  if(TEL.test(bas)||TEL.test(m)){h.textContent='Telefon numarası paylaşma; gizliliğin için kaldırıp tekrar dene.';return;}
  h.textContent=''; b.disabled=true; b.textContent='Gönderiliyor…';
  api('/api/konu',{oda:yOda,baslik:bas,metin:m,link:l,rumuz:(JETON?'':$('yRumuz').value.trim()),web:$('yWeb').value,sure:Date.now()-acilis}).then(function(j){
    b.disabled=false; b.textContent='Konuyu aç';
    if(!j||j.hata){h.textContent=(j&&j.hata)||'Gönderilemedi.';return;}
    jetonKaydet(j.jeton,j.rumuz);
    $('yBaslik').value='';$('yMetin').value='';$('yLink').value='';$('ySay').textContent='0/1500'; kapat('oYaz');
    try{gtag('event','kampus_konu',{oda:yOda,durum:j.durum});}catch(e){}
    if(j.durum==='yayinda'){toast('Konun açıldı 🎉');setTimeout(function(){location.href='/acukampus.html?g='+j.id;},600);}
    else toast('Konun kısa bir kontrolden sonra yayınlanacak.');
  });
}

/* ── konu görünümü (pencere ve statik sayfa ortak) ── */
function konuHtml(d,Y,opt){
  opt=opt||{}; var r=oda(d.oda), nick=d.rumuz||'Anonim', oyd=!!OYLAR[d.id];
  var link=(d.link&&/^https:\/\/(drive|docs)\.google\.com\//.test(d.link))?'<a class="lnk" href="'+esc(d.link)+'" target="_blank" rel="noopener nofollow ugc"><span>📎</span><span>Google Drive dosyası<small>'+esc(d.link.replace(/^https:\/\//,'').slice(0,60))+'</small></span></a>':'';
  var av=function(n,ed){return ed?'<span class="av ed">AR</span>':'<span class="av" style="--h:'+hue(n)+'">'+esc(n.charAt(0).toLocaleUpperCase('tr'))+'</span>';};
  var kim=function(n,ed){return ed?'<b>Artvin Rehberi</b> <span class="ed-et">Editör</span>':'<b>'+esc(n)+'</b>';};
  var YH=(Y||[]).map(function(y){var n=y.rumuz||'Anonim';
    return '<div class="yo" id="y'+y.id+'" data-y="'+y.id+'">'+av(n,y.editor)+'<div class="ic">'+kim(n,y.editor)+'<time>'+esc(az(y.olusturma))+'</time><p>'+metinHtml(y.metin)+'</p><button class="mini" data-ya="yanit" data-n="'+esc(n)+'" type="button">Yanıtla</button><button class="mini" data-ya="bildir" type="button">Bildir</button></div></div>';}).join('');
  return '<article class="konu" style="--rc:'+r.c+'"><a class="oda-et" href="/kampus/oda/'+esc(d.oda)+'.html">'+r.ik+' '+esc(r.ad)+'</a>'+
   (opt.h1===false?'<h2 style="font-size:1.5rem;font-weight:800;margin:.6rem 0 .7rem;overflow-wrap:anywhere">'+esc(d.baslik)+'</h2>':'<h1>'+esc(d.baslik)+'</h1>')+
   '<div class="yazar">'+av(nick,d.editor)+'<span>'+kim(nick,d.editor)+'<br>'+esc(az(d.olusturma))+'</span></div>'+
   (d.metin?'<div class="govde">'+metinHtml(d.metin)+'</div>':'')+link+
   '<div class="eylem"><button class="ab'+(oyd?' on':'')+'" data-a="oy" type="button">'+IK.yukari+'<span>'+(d.begeni>0?d.begeni+' faydalı':'Faydalı')+'</span></button>'+
   '<button class="ab" data-a="yanitla" type="button">'+IK.yorum+'<span>Yanıtla</span></button><button class="ab" data-a="paylas" type="button">'+IK.paylas+'<span>Paylaş</span></button>'+
   '<span class="ab sag" style="padding:0"><button class="ab tehl" data-a="bildir" type="button" aria-label="Uygunsuz bildir">'+IK.bayrak+'</button></span></div></article>'+
   '<section class="yanitlar"><h2>'+((Y||[]).length?(Y.length+' yanıt'):'Henüz yanıt yok')+'</h2>'+(YH||'<p style="color:var(--dim);font-size:.92rem">İlk yanıtı sen yaz; bildiklerin başka bir öğrencinin işine yarar.</p>')+
   '<div class="yf-kut"><div class="yf"><textarea maxlength="1000" placeholder="Yanıtını yaz… (üyelik gerekmez)" aria-label="Yanıt yaz"></textarea><button type="button" data-ya="gonder">Gönder</button></div>'+
   '<input type="text" class="yweb" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0">'+
   '<p class="yf-not">'+(JETON&&RUMUZ?'<b>@'+esc(RUMUZ)+'</b> olarak yazıyorsun.':'İlk yanıtında sana otomatik bir rumuz verilir. Küfür, hakaret ve kişisel bilgi içeren yanıtlar yayınlanmaz.')+'</p></div></section>';
}
function konuBagla(kap,d,Y,opt){
  var durum={d:d,y:Y||[]}, acildi=Date.now();
  function ciz(){var t=kap.querySelector('.yf textarea'),v=t?t.value:'';kap.innerHTML=konuHtml(durum.d,durum.y,opt);if(v)kap.querySelector('.yf textarea').value=v;}
  ciz(); benP.then(ciz);
  kap.addEventListener('click',function(e){
    var b=e.target.closest('[data-a],[data-ya]'); if(!b) return; var a=b.getAttribute('data-a')||b.getAttribute('data-ya'), d=durum.d;
    if(a==='paylas'){var u=opt&&opt.url||location.href;if(navigator.share){navigator.share({title:d.baslik,url:u}).catch(function(){});}else if(navigator.clipboard){navigator.clipboard.writeText(u).then(function(){toast('Bağlantı kopyalandı');});}}
    else if(a==='yanitla'){var tx=kap.querySelector('.yf textarea');tx.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(function(){tx.focus();},300);}
    else if(a==='oy'){
      if(!JETON){toast('Faydalı işaretlemek için önce bir yanıt ya da konu yaz.');return;}
      api('/api/oy',{konu:d.id}).then(function(j){if(j.hata){toast(j.hata);return;}if(j.oy)OYLAR[d.id]=1;else delete OYLAR[d.id];d.begeni=j.begeni;ciz();});
    }
    else if(a==='bildir'){
      var yo=b.closest('.yo'), tur=yo?'yanit':'konu', id=yo?+yo.getAttribute('data-y'):d.id;
      if(!confirm('Bu '+(tur==='konu'?'konu':'yanıt')+' uygunsuz olarak bildirilsin mi?'))return;
      api('/api/bildir',{tur:tur,id:id}).then(function(){toast('Bildirildi, teşekkürler. İnceleyeceğiz.');});
    }
    else if(a==='yanit'){var t=kap.querySelector('.yf textarea');t.value='@'+b.getAttribute('data-n')+' ';t.focus();}
    else if(a==='gonder'){gonder(b);}
  });
  function gonder(btn){
    var t=kap.querySelector('.yf textarea'), m=t.value.trim(), d=durum.d;
    if(m.length<2) return;
    if(TEL.test(m)){toast('Telefon numarası paylaşma.');return;}
    btn.disabled=true;
    api('/api/yanit',{konu:d.id,metin:m,web:(kap.querySelector('.yweb')||{}).value||'',sure:Date.now()-acildi}).then(function(j){
      btn.disabled=false;
      if(!j||j.hata){toast((j&&j.hata)||'Gönderilemedi.');return;}
      jetonKaydet(j.jeton,j.rumuz); t.value='';
      try{gtag('event','kampus_yanit',{oda:d.oda,durum:j.durum});}catch(e){}
      if(j.durum==='yayinda'){durum.y=durum.y.concat([j.yanit]);d.yanit=(d.yanit||0)+1;ciz();toast('Yanıtın eklendi');}
      else toast('Yanıtın kısa bir kontrolden sonra yayınlanacak.');
    });
  }
  return {yenile:function(y){durum.y=y;ciz();}};
}
function konuGetir(id){return api('/api/konu/'+encodeURIComponent(id));}
function konularGetir(p){var q=[];for(var k in p)if(p[k]!==''&&p[k]!=null)q.push(k+'='+encodeURIComponent(p[k]));return api('/api/konular?'+q.join('&'));}

window.KF={API:API,ODALAR:ODALAR,BOLUMLER:BOLUMLER,PROGRAMLAR:PROGRAMLAR,oda:oda,esc:esc,hue:hue,az:az,toast:toast,api:api,konuGetir:konuGetir,konularGetir:konularGetir,
  yazAc:yazAc,bolumAc:bolumAc,konuBagla:konuBagla,pencereler:pencereler,ac:ac,kapat:kapat,IK:IK,metinHtml:metinHtml,
  rumuz:function(){return JETON?RUMUZ:null;},cubukBagla:function(){var r=$('btnRumuz');if(r)benP.then(function(){if(JETON&&RUMUZ){r.textContent='@'+RUMUZ;r.style.display='';}});}};
})();
