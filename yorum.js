/* Artvin Rehberi — sayfa altı yorum kutusu
   Kullanım: sayfanın sonuna <script src="/yorum.js" defer></script> eklenir.
   Yorumlar Firestore'da "sayfa_yorum" koleksiyonunda tutulur. Okumak için giriş gerekmez,
   yazmak için giriş (Google veya doğrulanmış e-posta) gerekir. */
(function(){
'use strict';
if(window.__yrm) return; window.__yrm=1;
(function(){ var d=document.createElement('script'); d.src='/nabiz-davet.js'; d.defer=true; document.head.appendChild(d); })();   // Bugün Artvin davet balonu
var PROJE='artvin-imece';
var CFG={apiKey:'AIzaSyDPPh1T_PLdfbuQdYbP-HXrnc3a5Nb1nzI',authDomain:'artvin-imece.firebaseapp.com',projectId:PROJE,storageBucket:'artvin-imece.firebasestorage.app',messagingSenderId:'30297800879',appId:'1:30297800879:web:a36f3b4ad6ba54d8bed45a'};
var REST='https://firestore.googleapis.com/v1/projects/'+PROJE+'/databases/(default)/documents:runQuery?key='+CFG.apiKey;
var YONETICI='dreamdosima08@gmail.com'; // yalnızca "Sil" düğmesini göstermek için; asıl yetki Firestore kurallarında
var SAYFA=(location.pathname.replace(/\/index\.html$/,'/').replace(/\.html$/,'').replace(/^\/+/,'')||'anasayfa').slice(0,80);
var MAX=600, BEKLEME=30000;
var uygIci=/(Instagram|FBAN|FBAV|FB_IAB|Line\/|Twitter|Snapchat|MicroMessenger|TikTok|musical_ly)/i.test(navigator.userAgent);

function h(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}

/* ── stil ── */
var st=document.createElement('style');
st.textContent='.yrm{max-width:760px;margin:2.5rem auto 1.5rem;padding:1.1rem 1rem 1.2rem;background:#0f2118;color:#e8ede9;border:1px solid rgba(255,255,255,.1);border-radius:18px;font:400 15px/1.6 Inter,"DM Sans",system-ui,sans-serif;box-sizing:border-box;width:calc(100% - 2rem)}'+
'.yrm *{box-sizing:border-box}.yrm h2{font:800 1.25rem/1.2 "Bricolage Grotesque",Inter,system-ui,sans-serif;margin:0 0 .2rem;color:#fff}'+
'.yrm .alt{font-size:.8rem;color:rgba(232,237,233,.6);margin:0 0 .9rem}'+
'.yrm textarea{width:100%;min-height:84px;resize:vertical;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#fff;font:inherit;padding:.7rem .8rem}'+
'.yrm textarea:focus,.yrm input:focus{outline:2px solid #3ddb8a;outline-offset:1px}'+
'.yrm .sat{display:flex;justify-content:space-between;align-items:center;gap:.6rem;margin-top:.5rem;flex-wrap:wrap}'+
'.yrm .say{font-size:.72rem;color:rgba(232,237,233,.5)}'+
'.yrm button{font:inherit;cursor:pointer}.yrm .bt{background:#3ddb8a;color:#062012;border:0;border-radius:11px;padding:.6rem 1.1rem;font-weight:800;font-size:.85rem}'+
'.yrm .bt:disabled{opacity:.5;cursor:default}'+
'.yrm .ln{background:none;border:0;color:#3ddb8a;font-size:.78rem;padding:0;text-decoration:underline}'+
'.yrm .kural{font-size:.72rem;color:rgba(232,237,233,.5);margin-top:.6rem;line-height:1.55}.yrm .kural a{color:#3ddb8a}'+
'.yrm .msj{font-size:.8rem;margin-top:.5rem;color:#f0c040;min-height:1.1em}'+
'.yrm .liste{margin-top:1.1rem;display:grid;gap:.7rem}'+
'.yrm .y{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:.7rem .85rem}'+
'.yrm .y b{font-size:.85rem;color:#fff}.yrm .y time{font-size:.7rem;color:rgba(232,237,233,.45);margin-left:.5rem}'+
'.yrm .y p{margin:.25rem 0 0;font-size:.9rem;color:rgba(232,237,233,.88);white-space:pre-wrap;word-break:break-word}'+
'.yrm .ay{margin-top:.35rem;display:flex;gap:.9rem}.yrm .ay button{background:none;border:0;color:rgba(232,237,233,.45);font-size:.72rem;padding:0}'+
'.yrm .bos{font-size:.85rem;color:rgba(232,237,233,.55);padding:.6rem 0}'+
'.yrm-m{position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.7);display:flex;align-items:flex-end;justify-content:center}'+
'.yrm-m>div{background:#0f2118;color:#e8ede9;width:100%;max-width:420px;max-height:92vh;overflow:auto;border-radius:20px 20px 0 0;padding:1.2rem 1.1rem 1.5rem;font:400 15px/1.55 Inter,system-ui,sans-serif;position:relative}'+
'@media(min-width:600px){.yrm-m{align-items:center}.yrm-m>div{border-radius:20px}}'+
'.yrm-m h3{font:800 1.15rem/1.2 "Bricolage Grotesque",Inter,sans-serif;margin:0 0 .4rem;color:#fff}.yrm-m p{font-size:.84rem;color:rgba(232,237,233,.7);margin:.3rem 0 .8rem}'+
'.yrm-m input{width:100%;margin:.2rem 0 .6rem;border-radius:11px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.07);color:#fff;font:inherit;padding:.65rem .75rem}'+
'.yrm-m label{font-size:.75rem;color:rgba(232,237,233,.65)}'+
'.yrm-m button{font:inherit;cursor:pointer;width:100%;border-radius:11px;padding:.7rem;font-weight:800;border:0;margin-top:.3rem}'+
'.yrm-m .p{background:#3ddb8a;color:#062012}.yrm-m .g{background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.14)}'+
'.yrm-m .k{position:absolute;right:.8rem;top:.7rem;width:auto;background:none;color:#fff;font-size:1.3rem;padding:.2rem .5rem}'+
'.yrm-m .sk{display:flex;gap:.4rem;margin-bottom:.8rem}.yrm-m .sk button{margin:0;background:rgba(255,255,255,.07);color:rgba(232,237,233,.7);padding:.5rem}.yrm-m .sk .a{background:#3ddb8a;color:#062012}'+
'.yrm-m .er{color:#ff8a8a;font-size:.8rem;min-height:1.1em;margin:.2rem 0}.yrm-m .uy{font-size:.78rem;background:rgba(240,192,64,.12);border:1px solid rgba(240,192,64,.35);border-radius:10px;padding:.55rem .7rem;margin-bottom:.7rem;color:#f0c040}';
document.head.appendChild(st);

/* ── kutu ── */
var kok=h('section','yrm'); kok.id='yorumlar'; kok.setAttribute('aria-label','Yorumlar');
var bas=h('h2','', '💬 Yorumlar');
var alt=h('p','alt','Bu sayfayla ilgili güncel bilgi, deneyim ya da sorularını paylaş. Yorumlar herkese açık görünür.');
var alan=h('div');
var msj=h('div','msj'); msj.setAttribute('role','status');
var liste=h('div','liste');
kok.appendChild(bas); kok.appendChild(alt); kok.appendChild(alan); kok.appendChild(msj); kok.appendChild(liste);

var ta=h('textarea'); ta.maxLength=MAX; ta.placeholder='Yorumunu yaz… (bağlantı ve telefon numarası paylaşma)'; ta.setAttribute('aria-label','Yorumun');
var sat=h('div','sat'); var say=h('span','say','0/'+MAX); var gon=h('button','bt','Yorum yaz'); gon.type='button';
sat.appendChild(say); sat.appendChild(gon);
var kural=h('p','kural'); kural.innerHTML='Küfür, hakaret, reklam ve kişisel bilgi içeren yorumlar kaldırılır. Yorum yazarak <a href="/ikinci-el-kosullar.html" target="_blank" rel="noopener">Kullanım Koşulları</a>\'nı ve <a href="/ikinci-el-aydinlatma.html" target="_blank" rel="noopener">Aydınlatma Metni</a>\'ni kabul etmiş olursun. Uygunsuz bir yorum görürsen “Bildir”e dokun.';
alan.appendChild(ta); alan.appendChild(sat); alan.appendChild(kural);
ta.addEventListener('input',function(){say.textContent=ta.value.length+'/'+MAX;});

function yerles(){
  var son=null, f=document.querySelectorAll('footer');
  if(f.length) son=f[f.length-1];
  var hedef=document.getElementById('yorum-alani');
  if(hedef){hedef.appendChild(kok);}
  else if(son && son.parentNode){son.parentNode.insertBefore(kok,son);}
  else document.body.appendChild(kok);
}
yerles();

/* ── yardımcılar ── */
function kisalt(ad){ad=(ad||'').trim(); if(!ad) return 'Ziyaretçi'; var p=ad.split(/\s+/); return p.length>1?p[0]+' '+p[p.length-1].charAt(0).toLocaleUpperCase('tr')+'.':p[0];}
function tarih(d){try{return d.toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'});}catch(e){return '';}}
function bildir(t){msj.textContent=t||'';}

/* ── okuma (SDK gerekmez) ── */
var yorumlar=[], kul=null, sonYazma=0;
function oku(){
  fetch(REST,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({structuredQuery:{from:[{collectionId:'sayfa_yorum'}],where:{fieldFilter:{field:{fieldPath:'sayfa'},op:'EQUAL',value:{stringValue:SAYFA}}},limit:100}})})
  .then(function(r){return r.json();}).then(function(a){
    yorumlar=(a||[]).filter(function(x){return x.document;}).map(function(x){
      var f=x.document.fields||{}, id=x.document.name.split('/').pop();
      return {id:id,uid:(f.uid||{}).stringValue||'',ad:(f.ad||{}).stringValue||'',metin:(f.metin||{}).stringValue||'',zaman:new Date((f.zaman||{}).timestampValue||Date.now())};
    }).sort(function(a,b){return b.zaman-a.zaman;});
    ciz();
  }).catch(function(){liste.innerHTML='';liste.appendChild(h('div','bos','Yorumlar şu an yüklenemedi.'));});
}
function ciz(){
  liste.innerHTML='';
  bas.textContent='💬 Yorumlar'+(yorumlar.length?' ('+yorumlar.length+')':'');
  if(!yorumlar.length){liste.appendChild(h('div','bos','Henüz yorum yok. İlk yorumu sen yaz!'));return;}
  yorumlar.forEach(function(y){
    var k=h('div','y'), b=h('b','',kisalt(y.ad)), t=h('time','',tarih(y.zaman));
    var ust=h('div'); ust.appendChild(b); ust.appendChild(t);
    var p=h('p','',y.metin); var ay=h('div','ay');
    var rap=h('button','','Bildir'); rap.type='button'; rap.onclick=function(){rapor(y,rap);};
    ay.appendChild(rap);
    if(kul && (kul.uid===y.uid || kul.email===YONETICI)){
      var sil=h('button','','Sil'); sil.type='button'; sil.onclick=function(){
        if(!confirm('Bu yorum silinsin mi?')) return;
        db.collection('sayfa_yorum').doc(y.id).delete().then(function(){yorumlar=yorumlar.filter(function(z){return z.id!==y.id;});ciz();}).catch(function(){bildir('Silinemedi, tekrar dene.');});
      };
      ay.appendChild(sil);
    }
    k.appendChild(ust); k.appendChild(p); k.appendChild(ay); liste.appendChild(k);
  });
}

/* ── Firebase (yazma/giriş için, ihtiyaç olunca) ── */
var sdkP=null, auth=null, db=null;
function sdk(){
  if(sdkP) return sdkP;
  var v='https://www.gstatic.com/firebasejs/10.12.0/';
  function y(s){return new Promise(function(ok,no){var e=document.createElement('script');e.src=v+s;e.onload=ok;e.onerror=function(){no(new Error('sdk'));};document.head.appendChild(e);});}
  sdkP=y('firebase-app-compat.js').then(function(){return Promise.all([y('firebase-auth-compat.js'),y('firebase-firestore-compat.js')]);}).then(function(){
    if(!firebase.apps.length) firebase.initializeApp(CFG);
    auth=firebase.auth(); auth.languageCode='tr'; db=firebase.firestore();
    return new Promise(function(ok){
      var ilk=true;
      auth.onAuthStateChanged(function(u){
        kul=(u && u.emailVerified)?u:null;
        try{localStorage.setItem('yrmGiris',kul?'1':'');}catch(e){}
        if(!ilk) ciz();
        if(kul) modalKapat();
        if(ilk){ilk=false;ok();}
      });
    });
  }).catch(function(e){sdkP=null;throw e;});
  return sdkP;
}
try{ if(localStorage.getItem('yrmGiris')==='1'){ var io=('IntersectionObserver' in window)?new IntersectionObserver(function(es){if(es[0].isIntersecting){io.disconnect();sdk().then(ciz).catch(function(){});}}): null; if(io) io.observe(kok); } }catch(e){}

/* ── giriş penceresi ── */
var modal=null, mod='giris';
function modalKapat(){if(modal){modal.remove();modal=null;}}
function hataMesaj(e){
  var m={'auth/invalid-email':'E-posta adresi geçersiz.','auth/user-not-found':'Bu e-posta ile kayıtlı hesap yok.','auth/wrong-password':'Şifre hatalı.','auth/invalid-credential':'E-posta veya şifre hatalı.','auth/email-already-in-use':'Bu e-posta zaten kayıtlı, giriş yapmayı dene.','auth/weak-password':'Şifre en az 8 karakter olmalı.','auth/too-many-requests':'Çok fazla deneme, biraz bekle.','auth/network-request-failed':'Bağlantı hatası.','auth/operation-not-allowed':'Bu giriş yöntemi etkin değil.','auth/unauthorized-domain':'Bu alan adı Firebase\'de yetkili değil.','auth/account-exists-with-different-credential':'Bu e-posta başka yöntemle kayıtlı.'};
  return m[e&&e.code]||('İşlem yapılamadı.'+(e&&e.code?' ('+e.code+')':''));
}
function girisAc(){
  modalKapat();
  var kay=mod==='kayit';
  modal=h('div','yrm-m'); modal.onclick=function(e){if(e.target===modal)modalKapat();};
  var k=h('div'); modal.appendChild(k);
  k.innerHTML='<button class="k" type="button" aria-label="Kapat">×</button><h3>Yorum yazmak için giriş yap</h3><p>Spam ve sahte yorumları azaltmak için giriş istiyoruz. Şifreni görmeyiz.</p>'+
   (uygIci?'<div class="uy">Instagram/Facebook içindeki tarayıcıda Google girişi çalışmaz. E-posta ile devam et ya da sayfayı Chrome/Safari\'de aç.</div>':'<button class="p" type="button" id="yG">Google ile devam et</button><p style="text-align:center;margin:.6rem 0">veya</p>')+
   '<div class="sk"><button type="button" data-m="giris" class="'+(kay?'':'a')+'">Giriş yap</button><button type="button" data-m="kayit" class="'+(kay?'a':'')+'">Hesap oluştur</button></div>'+
   '<form id="yF" novalidate>'+(kay?'<label for="yAd">Adın</label><input id="yAd" autocomplete="name" maxlength="40">':'')+
   '<label for="yM">E-posta</label><input id="yM" type="email" autocomplete="email" inputmode="email"><label for="yS">Şifre'+(kay?' (en az 8 karakter)':'')+'</label><input id="yS" type="password" autocomplete="'+(kay?'new-password':'current-password')+'">'+
   '<div class="er" id="yE" role="alert"></div><button class="p" type="submit">'+(kay?'Hesap oluştur':'Giriş yap')+'</button></form>';
  document.body.appendChild(modal);
  var er=k.querySelector('#yE');
  k.querySelector('.k').onclick=modalKapat;
  [].forEach.call(k.querySelectorAll('[data-m]'),function(b){b.onclick=function(){mod=b.getAttribute('data-m');girisAc();};});
  var g=k.querySelector('#yG');
  if(g) g.onclick=function(){
    var p=new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(p).catch(function(e){
      if(e&&e.code==='auth/popup-blocked'){auth.signInWithRedirect(p);return;}
      if(e&&(e.code==='auth/popup-closed-by-user'||e.code==='auth/cancelled-popup-request'))return;
      er.textContent=hataMesaj(e);
    });
  };
  k.querySelector('#yF').onsubmit=function(ev){
    ev.preventDefault();
    var m=k.querySelector('#yM').value.trim(), s=k.querySelector('#yS').value, btn=ev.target.querySelector('button[type=submit]');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m)){er.textContent='Geçerli bir e-posta yaz.';return;}
    if(kay){
      var ad=k.querySelector('#yAd').value.trim();
      if(ad.length<2){er.textContent='Adını yaz.';return;}
      if(s.length<8){er.textContent='Şifre en az 8 karakter olmalı.';return;}
      btn.disabled=true;
      auth.createUserWithEmailAndPassword(m,s).then(function(c){return c.user.updateProfile({displayName:ad}).then(function(){return c.user.sendEmailVerification();});}).then(dogrula).catch(function(e){btn.disabled=false;er.textContent=hataMesaj(e);});
    } else {
      if(!s){er.textContent='Şifreni yaz.';return;}
      btn.disabled=true;
      auth.signInWithEmailAndPassword(m,s).then(function(c){ if(!c.user.emailVerified){ return dogrula(); } }).catch(function(e){btn.disabled=false;er.textContent=hataMesaj(e);});
    }
  };
}
function dogrula(){
  var u=auth.currentUser; if(!modal) return;
  var k=modal.firstChild;
  k.innerHTML='<button class="k" type="button" aria-label="Kapat">×</button><h3>E-postanı doğrula</h3><p><b>'+(u?u.email:'')+'</b> adresine doğrulama bağlantısı gönderdik. Bağlantıya dokunduktan sonra buraya dönüp “Doğruladım”a bas. Gelmediyse spam klasörüne bak.</p><div class="er" id="yE" role="alert"></div><button class="p" type="button" id="yD">Doğruladım</button><button class="g" type="button" id="yT">Bağlantıyı tekrar gönder</button>';
  k.querySelector('.k').onclick=modalKapat;
  k.querySelector('#yD').onclick=function(){u.reload().then(function(){ if(auth.currentUser.emailVerified){ return auth.currentUser.getIdToken(true).then(function(){kul=auth.currentUser;modalKapat();ciz();bildir('Giriş tamam, şimdi yorumunu yazabilirsin.');}); } k.querySelector('#yE').textContent='Henüz doğrulanmamış görünüyor. Bağlantıya dokunduğundan emin ol.'; });};
  k.querySelector('#yT').onclick=function(){u.sendEmailVerification().then(function(){k.querySelector('#yE').textContent='Gönderildi.';}).catch(function(e){k.querySelector('#yE').textContent=hataMesaj(e);});};
}

/* ── yorum gönder / bildir ── */
gon.onclick=function(){
  bildir('');
  var t=ta.value.trim();
  if(t.length<3){bildir('Yorum en az 3 karakter olmalı.');return;}
  if(/(https?:\/\/|www\.|\.com|\.net|\.org|\.ru)/i.test(t)){bildir('Yorumlarda bağlantı paylaşılamaz.');return;}
  if(/(\+?90|0)?\s*5\d{2}[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}/.test(t)){bildir('Telefon numarası paylaşma; gizliliğin için kaldırıp tekrar dene.');return;}
  if(Date.now()-sonYazma<BEKLEME){bildir('Biraz bekleyip tekrar dene.');return;}
  gon.disabled=true;
  sdk().then(function(){
    if(kul) return kul;
    mod='giris'; girisAc();
    return new Promise(function(ok){var i=setInterval(function(){if(kul){clearInterval(i);ok(kul);} if(!modal && !kul){clearInterval(i);ok(null);}},400);});
  }).then(function(u){
    if(!u){gon.disabled=false;return;}
    return db.collection('sayfa_yorum').add({uid:u.uid,ad:(u.displayName||'').slice(0,40),sayfa:SAYFA,metin:t,zaman:firebase.firestore.FieldValue.serverTimestamp()}).then(function(r){
      sonYazma=Date.now(); ta.value=''; say.textContent='0/'+MAX;
      yorumlar.unshift({id:r.id,uid:u.uid,ad:u.displayName||'',metin:t,zaman:new Date()}); ciz(); bildir('Yorumun yayınlandı, teşekkürler!');
      gon.disabled=false;
    });
  }).catch(function(e){gon.disabled=false;bildir('Yorum gönderilemedi. Giriş yaptığından emin ol ve tekrar dene.');});
};
function rapor(y,btn){
  sdk().then(function(){
    if(!kul){mod='giris';girisAc();return;}
    if(!confirm('Bu yorum uygunsuz olarak bildirilsin mi?')) return;
    return db.collection('ikinci_el_bildirim').add({uid:kul.uid,ilan:('yorum:'+y.id).slice(0,40),baslik:(SAYFA+' | '+y.metin).slice(0,80),neden:'Uygunsuz yorum bildirimi',zaman:firebase.firestore.FieldValue.serverTimestamp()}).then(function(){btn.textContent='Bildirildi';btn.disabled=true;});
  }).catch(function(){bildir('Bildirilemedi, tekrar dene.');});
}

oku();
})();
