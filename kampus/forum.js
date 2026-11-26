/* AÇÜ Kampüs Forum çekirdeği: okuma (REST), giriş/rumuz, konu açma, yanıt, faydalı, bildir, sil.
   Hem /acukampus.html hem de /kampus/konu/*.html sayfaları kullanır.
   Yönetici işlemleri (gizleme, onay, silme) /acukampus-yonetim.html sayfasındadır. */
(function(){
'use strict';
var CFG={apiKey:'AIzaSyBCUemvYsklmdfHqhgq7D5hZwquKDUZVC0',authDomain:'acu-kampus.firebaseapp.com',projectId:'acu-kampus',storageBucket:'acu-kampus.firebasestorage.app',messagingSenderId:'356152793085',appId:'1:356152793085:web:38a6ae1ad911880cb2ab94'};
var DOCS='https://firestore.googleapis.com/v1/projects/'+CFG.projectId+'/databases/(default)/documents';
var BEKLEME=20000, MAKS=800;
var uygIci=/(Instagram|FBAN|FBAV|FB_IAB|Line\/|Twitter|Snapchat|MicroMessenger|TikTok|musical_ly)/i.test(navigator.userAgent);

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
function az(d){if(!d)return '';if(!(d instanceof Date))d=new Date(d);var s=Math.floor((Date.now()-d.getTime())/1000);if(s<60)return 'az önce';if(s<3600)return Math.floor(s/60)+' dk önce';if(s<86400)return Math.floor(s/3600)+' sa önce';if(s<2592000)return Math.floor(s/86400)+' gün önce';return d.toLocaleDateString('tr-TR',{day:'numeric',month:'long',year:'numeric'});}
// Konu başlığı = metnin ilk satırı (en çok 90 karakter); gövde = kalanı
function ayir(m){
  m=String(m||'').replace(/\r/g,'').trim(); var i=m.indexOf('\n'), b=(i<0?m:m.slice(0,i)).trim(), g=(i<0?'':m.slice(i+1)).trim();
  if(b.length>90){var k=b.lastIndexOf(' ',86);if(k<40)k=86;g=(b.slice(k).trim()+(g?'\n\n'+g:''));b=b.slice(0,k).trim()+'…';}
  return {b:b,g:g};
}
function toast(t){var e=$('kfToast');if(!e){e=document.createElement('div');e.id='kfToast';e.className='toast';document.body.appendChild(e);}e.textContent=t;e.classList.add('ac');clearTimeout(toast._t);toast._t=setTimeout(function(){e.classList.remove('ac');},2600);}
function ac(id){$(id).classList.add('ac');document.body.style.overflow='hidden';}
function kapat(id){var e=$(id);if(e)e.classList.remove('ac');if(!document.querySelector('.ort.ac'))document.body.style.overflow='';}
var IK={
 yukari:'<svg viewBox="0 0 24 24"><path d="M12 4l8 9h-5v7H9v-7H4z"/></svg>',
 yorum:'<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></svg>',
 paylas:'<svg viewBox="0 0 24 24"><path d="M4 12v7h16v-7M12 3v12M7 8l5-5 5 5"/></svg>',
 bayrak:'<svg viewBox="0 0 24 24"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
 sil:'<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
 kapat:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>'
};

/* ── okuma: SDK gerekmez, REST ── */
function fv(f){if(!f)return null;if('stringValue' in f)return f.stringValue;if('integerValue' in f)return Number(f.integerValue);if('doubleValue' in f)return f.doubleValue;if('booleanValue' in f)return f.booleanValue;if('timestampValue' in f)return new Date(f.timestampValue);return null;}
function dobj(d){var o={id:d.name.split('/').pop()},f=d.fields||{};for(var k in f)o[k]=fv(f[k]);o._ts=f.olusturma&&f.olusturma.timestampValue||null;return o;}
function rq(parent,sq){
  return fetch(DOCS+(parent?'/'+parent:'')+':runQuery?key='+CFG.apiKey,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({structuredQuery:sq})})
   .then(function(r){return r.json();}).then(function(a){if(a&&a.error)throw new Error(a.error.message||'hata');return (a||[]).filter(function(x){return x.document;}).map(function(x){return dobj(x.document);});});
}
function eq(f,v){return {fieldFilter:{field:{fieldPath:f},op:'EQUAL',value:{stringValue:v}}};}
function konuGetir(id){return fetch(DOCS+'/acukampus/'+encodeURIComponent(id)+'?key='+CFG.apiKey).then(function(r){return r.ok?r.json():null;}).then(function(d){return d?dobj(d):null;});}
function yorumlarGetir(id){
  return rq('acukampus/'+id,{from:[{collectionId:'yorumlar'}],orderBy:[{field:{fieldPath:'olusturma'},direction:'ASCENDING'}],limit:300})
   .then(function(a){return a.filter(function(y){return y.durum!=='gizli'&&y.durum!=='bekliyor';});});
}

/* ── oturum ── */
var kul=null, profil=null, oy={}, sik={}, auth=null, db=null, sdkP=null, bekle=[], bekleyenU=null, authHazir=null, authOk=null, girisMod='giris', sonYaz=0, girisBekliyor=false, dinleyici=[];
function degisti(){dinleyici.forEach(function(f){try{f();}catch(e){}});}
function sdk(){
  if(sdkP) return sdkP;
  var v='https://www.gstatic.com/firebasejs/10.12.0/';
  function y(s){return new Promise(function(ok,no){var e=document.createElement('script');e.src=v+s;e.onload=ok;e.onerror=function(){no(new Error('sdk'));};document.head.appendChild(e);});}
  authHazir=new Promise(function(ok){authOk=ok;});
  sdkP=y('firebase-app-compat.js').then(function(){return Promise.all([y('firebase-auth-compat.js'),y('firebase-firestore-compat.js')]);}).then(function(){
    if(!firebase.apps.length) firebase.initializeApp(CFG);
    auth=firebase.auth(); auth.languageCode='tr'; db=firebase.firestore();
    auth.onAuthStateChanged(function(u){
      bekleyenU=(u&&!u.emailVerified)?u:null; kul=(u&&u.emailVerified)?u:null; profil=null;
      try{localStorage.setItem('acuGiris',kul?'1':'');}catch(e){}
      if(!kul){ oy={}; sik={}; navCiz(); degisti(); authOk(); return; }
      db.collection('profiller').doc(kul.uid).get().then(function(d){
        profil=d.exists?d.data():null; navCiz();
        if(profil){ tamamla(); benimDurum(); } else if(bekle.length||girisBekliyor){ rumuzAc(); }
        authOk(); degisti();
      }).catch(function(){ navCiz(); authOk(); });
    });
    return true;
  }).catch(function(e){sdkP=null;toast('Bağlantı kurulamadı, tekrar dene.');throw e;});
  return sdkP;
}
function tamamla(){var b=bekle;bekle=[];girisBekliyor=false;kapat('oGiris');b.forEach(function(f){f();});}
function gerek(){
  return sdk().then(function(){return authHazir;}).then(function(){
    if(kul&&profil) return;
    return new Promise(function(ok){ bekle.push(ok); if(!kul){ if(bekleyenU) dogrulaAc(); else girisAc(); } else rumuzAc(); });
  });
}
function benimDurum(){
  db.collection('kampus_oy').where('uid','==',kul.uid).get().then(function(s){oy={};s.forEach(function(d){oy[d.data().post]=true;});degisti();}).catch(function(){});
  db.collection('kampus_sikayet').where('uid','==',kul.uid).get().then(function(s){sik={};s.forEach(function(d){sik[d.data().post]=true;});}).catch(function(){});
  db.collection('acukampus').where('uid','==',kul.uid).where('durum','==','bekliyor').get().then(function(s){
    var b=$('bekleyen'); if(!b)return; if(s.size){b.style.display='block';b.textContent='İncelemede bekleyen '+s.size+' paylaşımın var. Onaylanınca yayınlanır.';} else b.style.display='none';
  }).catch(function(){});
}
function navCiz(){
  var g=$('btnGiris'), a=$('btnAv'); if(!g||!a) return;
  if(kul&&profil){
    g.style.display='none'; a.style.display='grid'; a.style.setProperty('--h',hue(profil.nick)); a.textContent=profil.nick.charAt(0).toLocaleUpperCase('tr');
    var n=$('mNick'); if(n) n.textContent='@'+profil.nick;
  } else { g.style.display=''; a.style.display='none'; }
}

/* ── pencereler (her sayfaya bir kez eklenir) ── */
function pencereler(){
  if($('oGiris')) return;
  var h='<div class="ort" id="oGiris" role="dialog" aria-modal="true" aria-label="Giriş"><div class="sheet" id="girisIc"></div></div>'+
  '<div class="ort" id="oYaz" role="dialog" aria-modal="true" aria-labelledby="yazBaslik"><div class="sheet">'+
   '<button class="kapat" data-kapat type="button" aria-label="Kapat">'+IK.kapat+'</button><h2 id="yazBaslik">Yeni konu aç</h2><p class="alt" id="yazNick"></p>'+
   '<label class="fl">Oda</label><div class="secim" id="yOdalar"></div><button class="nbtn" id="bolumSec" type="button" style="margin-top:.5rem">🏛️ Bölüm veya program odası seç</button>'+
   '<div class="uy" id="yItiraf" style="display:none">İtiraf ve dertleşme paylaşımları yayından önce incelenir. Kimsenin adını, bölümünü ya da tanınmasını sağlayacak bilgiyi yazma.</div>'+
   '<label class="fl" for="yBaslik">Başlık</label><input class="fi" id="yBaslik" maxlength="90" placeholder="Örn: Seyitler\'e akşam son dolmuş kaçta?">'+
   '<label class="fl" for="yMetin">Mesajın</label><textarea class="fta" id="yMetin" maxlength="700" placeholder="Ayrıntıları yaz. Ne kadar açık yazarsan o kadar iyi yanıt alırsın."></textarea><div class="say-n" id="ySay">0/700</div>'+
   '<label class="fl" for="yLink">Google Drive bağlantısı (isteğe bağlı, ders notu için)</label><input class="fi" id="yLink" type="url" inputmode="url" placeholder="https://drive.google.com/…">'+
   '<div class="hata" id="yHata" role="alert"></div><button class="btn p" id="yGonder" type="button">Konuyu aç</button></div></div>'+
  '<div class="ort" id="oBolum" role="dialog" aria-modal="true" aria-label="Bölüm seç"><div class="sheet">'+
   '<button class="kapat" data-kapat type="button" aria-label="Kapat">'+IK.kapat+'</button><h2>Bölüm ve programlar</h2><p class="alt">Bir odaya dokun.</p><div class="grp" id="bolumListe" style="max-height:62vh;margin-top:.6rem"></div></div></div>';
  var d=document.createElement('div'); d.innerHTML=h; while(d.firstChild) document.body.appendChild(d.firstChild);
  $('yOdalar').addEventListener('click',function(e){var b=e.target.closest('[data-yo]');if(!b)return;yOda=b.getAttribute('data-yo');yOdaCiz();});
  $('bolumSec').onclick=function(){bolumAc(function(k){yOda=k;yOdaCiz();});};
  $('yMetin').addEventListener('input',function(){$('ySay').textContent=this.value.length+'/700';});
  $('yGonder').onclick=konuGonder;
  $('bolumListe').addEventListener('click',function(e){var b=e.target.closest('[data-g]');if(!b)return;kapat('oBolum');if(bolumCb)bolumCb(b.getAttribute('data-g'));});
  document.addEventListener('click',function(e){
    if(e.target.closest('[data-kapat]')){var o=e.target.closest('.ort');if(o){if(o.id==='oGiris'){bekle=[];girisBekliyor=false;}kapat(o.id);}}
    else if(e.target.classList&&e.target.classList.contains('ort')){if(e.target.id==='oGiris'){bekle=[];girisBekliyor=false;}kapat(e.target.id);}
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){[].forEach.call(document.querySelectorAll('.ort.ac'),function(o){kapat(o.id);});}});
}
var bolumCb=null;
function bolumAc(cb){
  pencereler(); bolumCb=cb;
  $('bolumListe').innerHTML='<h3>Bölümler</h3>'+BOLUMLER.map(function(x){return '<button type="button" data-g="'+x[0]+'"><span>'+x[1]+'</span><span>'+esc(x[2])+'</span></button>';}).join('')+'<h3>Programlar (MYO)</h3>'+PROGRAMLAR.map(function(x){return '<button type="button" data-g="'+x[0]+'"><span>'+x[1]+'</span><span>'+esc(x[2])+'</span></button>';}).join('');
  ac('oBolum');
}

/* ── giriş ve rumuz ── */
function hataMesaj(e){
  var m={'auth/invalid-email':'E-posta adresi geçersiz.','auth/user-not-found':'Bu e-posta ile kayıtlı hesap yok.','auth/wrong-password':'Şifre hatalı.','auth/invalid-credential':'E-posta veya şifre hatalı.','auth/email-already-in-use':'Bu e-posta zaten kayıtlı, giriş yapmayı dene.','auth/weak-password':'Şifre en az 8 karakter olmalı.','auth/too-many-requests':'Çok fazla deneme, biraz bekle.','auth/network-request-failed':'Bağlantı hatası.','auth/operation-not-allowed':'Bu giriş yöntemi henüz etkin değil.','auth/unauthorized-domain':'Bu alan adı Firebase\'de yetkili değil.','auth/operation-not-supported-in-this-environment':'Bu tarayıcı Google girişini desteklemiyor; Chrome veya Safari\'de aç ya da e-posta ile devam et.','auth/account-exists-with-different-credential':'Bu e-posta başka bir yöntemle kayıtlı.'};
  return m[e&&e.code]||('İşlem yapılamadı.'+(e&&e.code?' ('+e.code+')':''));
}
function girisAc(){
  pencereler();
  var ic=$('girisIc'), kay=girisMod==='kayit';
  ic.innerHTML='<button class="kapat" data-kapat type="button" aria-label="Kapat">'+IK.kapat+'</button><h2>Giriş yap</h2><p class="alt">Konu açmak, yanıt yazmak ve faydalı işaretlemek için giriş gerekir. Bu, spam ve sahte hesapları azaltır. Gerçek adın görünmez, rumuz seçersin.</p>'+
   (uygIci?'<div class="uy">Instagram ve Facebook içindeki tarayıcıda Google girişi çalışmaz. E-posta ile devam et ya da sayfayı Chrome/Safari\'de aç.</div>':'<button class="btn p" id="bG" type="button" style="margin-top:.9rem">Google ile devam et</button><div class="ayrac">veya e-posta ile</div>')+
   '<div class="sk"><button type="button" data-m="giris" class="'+(kay?'':'a')+'">Giriş yap</button><button type="button" data-m="kayit" class="'+(kay?'a':'')+'">Hesap oluştur</button></div>'+
   '<form id="epF" novalidate><label class="fl" for="gM">E-posta</label><input class="fi" id="gM" type="email" autocomplete="email" inputmode="email"><label class="fl" for="gS">Şifre'+(kay?' (en az 8 karakter)':'')+'</label><input class="fi" id="gS" type="password" autocomplete="'+(kay?'new-password':'current-password')+'"><div class="hata" id="gH" role="alert"></div><button class="btn p" type="submit">'+(kay?'Hesap oluştur':'Giriş yap')+'</button>'+(kay?'':'<button class="nbtn" id="gU" type="button" style="margin-top:.6rem;border:0;color:var(--brand)">Şifremi unuttum</button>')+'</form>'+
   '<p class="not">Giriş yaparak <a href="/ikinci-el-kosullar.html" target="_blank" rel="noopener">Kullanım Koşulları</a>\'nı kabul etmiş olursun. Kişisel verilerin işlenmesi için <a href="/ikinci-el-aydinlatma.html" target="_blank" rel="noopener">Aydınlatma Metni</a>\'ne bak.</p>';
  ac('oGiris');
  var g=$('bG'); if(g) g.onclick=function(){var p=new firebase.auth.GoogleAuthProvider();auth.signInWithPopup(p).catch(function(e){if(e&&e.code==='auth/popup-blocked'){auth.signInWithRedirect(p);return;}if(e&&(e.code==='auth/popup-closed-by-user'||e.code==='auth/cancelled-popup-request'))return;$('gH').textContent=hataMesaj(e);});};
  [].forEach.call(ic.querySelectorAll('[data-m]'),function(b){b.onclick=function(){girisMod=b.getAttribute('data-m');girisAc();};});
  var u=$('gU'); if(u) u.onclick=function(){var m=$('gM').value.trim();if(!m){$('gH').textContent='Önce e-posta adresini yaz.';return;}auth.sendPasswordResetEmail(m).then(function(){toast('Şifre yenileme bağlantısı gönderildi');}).catch(function(e){$('gH').textContent=hataMesaj(e);});};
  $('epF').onsubmit=function(ev){
    ev.preventDefault(); var m=$('gM').value.trim(), s=$('gS').value, btn=ev.target.querySelector('button[type=submit]');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m)){$('gH').textContent='Geçerli bir e-posta yaz.';return;}
    if(kay){ if(s.length<8){$('gH').textContent='Şifre en az 8 karakter olmalı.';return;} btn.disabled=true;
      auth.createUserWithEmailAndPassword(m,s).then(function(c){return c.user.sendEmailVerification();}).then(function(){bekleyenU=auth.currentUser;dogrulaAc();}).catch(function(e){btn.disabled=false;$('gH').textContent=hataMesaj(e);});
    } else { if(!s){$('gH').textContent='Şifreni yaz.';return;} btn.disabled=true;
      auth.signInWithEmailAndPassword(m,s).then(function(c){if(!c.user.emailVerified){bekleyenU=c.user;dogrulaAc();}}).catch(function(e){btn.disabled=false;$('gH').textContent=hataMesaj(e);});
    }
  };
}
function dogrulaAc(){
  pencereler();
  var u=auth.currentUser, ic=$('girisIc');
  ic.innerHTML='<button class="kapat" data-kapat type="button" aria-label="Kapat">'+IK.kapat+'</button><h2>E-postanı doğrula</h2><p class="alt"><b>'+esc(u?u.email:'')+'</b> adresine bir doğrulama bağlantısı gönderdik. Bağlantıya dokunduktan sonra buraya dönüp “Doğruladım”a bas. Gelmediyse spam klasörüne bak.</p><div class="hata" id="gH" role="alert"></div><button class="btn p" id="gD" type="button">Doğruladım</button><button class="btn" id="gT" type="button">Bağlantıyı tekrar gönder</button>';
  ac('oGiris');
  $('gD').onclick=function(){u.reload().then(function(){ if(auth.currentUser.emailVerified){ return auth.currentUser.getIdToken(true).then(function(){ location.reload(); }); } $('gH').textContent='Henüz doğrulanmamış görünüyor. Bağlantıya dokunduğundan emin ol.'; });};
  $('gT').onclick=function(){u.sendEmailVerification().then(function(){$('gH').style.color='var(--ok)';$('gH').textContent='Gönderildi.';}).catch(function(e){$('gH').textContent=hataMesaj(e);});};
}
var RESERVE=['admin','yonetici','moderator','kampus','acu','artvin','artvinrehber','destek','sistem','artvinrehberi'];
function anahtar(n){return String(n||'').toLocaleLowerCase('tr').replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ş/g,'s').replace(/ü/g,'u').replace(/[^a-z0-9_]/g,'');}
function rumuzAc(){
  pencereler();
  var ic=$('girisIc');
  ic.innerHTML='<button class="kapat" data-kapat type="button" aria-label="Kapat">'+IK.kapat+'</button><h2>Rumuzunu seç</h2><p class="alt">Konu ve yanıtlarında bu isim görünür. Gerçek adın ve e-postan görünmez. Rumuz sonradan değiştirilemez, dikkatli seç.</p><form id="rF" novalidate><label class="fl" for="rI">Rumuz (3–20 karakter; harf, rakam, alt çizgi)</label><input class="fi" id="rI" maxlength="20" autocomplete="off" autocapitalize="off" placeholder="örn. coruh_kedisi"><div class="hata" id="rH" role="alert"></div><button class="btn p" type="submit">Rumuzu kaydet</button></form>';
  ac('oGiris');
  $('rF').onsubmit=function(ev){
    ev.preventDefault(); var n=$('rI').value.trim(), k=anahtar(n), btn=ev.target.querySelector('button');
    if(!/^[A-Za-zÇĞİÖŞÜçğıöşü0-9_]{3,20}$/.test(n)||k.length<3){$('rH').textContent='3–20 karakter; sadece harf, rakam ve alt çizgi.';return;}
    if(RESERVE.indexOf(k)>-1){$('rH').textContent='Bu rumuz kullanılamaz.';return;}
    btn.disabled=true;
    db.collection('rumuzlar').doc(k).get().then(function(d){
      if(d.exists){btn.disabled=false;$('rH').textContent='Bu rumuz alınmış, başka bir tane dene.';return;}
      var b=db.batch(); b.set(db.collection('rumuzlar').doc(k),{uid:kul.uid});
      b.set(db.collection('profiller').doc(kul.uid),{nick:n,nickKey:k,olusturma:firebase.firestore.FieldValue.serverTimestamp()});
      return b.commit().then(function(){profil={nick:n,nickKey:k};navCiz();tamamla();benimDurum();toast('Hoş geldin '+n+'!');degisti();});
    }).catch(function(){btn.disabled=false;$('rH').textContent='Kaydedilemedi, tekrar dene.';});
  };
}

/* ── konu açma ── */
var yOda='';
function yOdaCiz(){
  $('yOdalar').innerHTML=ODALAR.map(function(o){return '<button type="button" data-yo="'+o.k+'" class="'+(yOda===o.k?'ak':'')+'">'+o.ik+' '+esc(o.ad)+'</button>';}).join('');
  var ozel=yOda&&!ODALAR.some(function(o){return o.k===yOda;});
  $('bolumSec').textContent=ozel?('✓ '+oda(yOda).ad):'🏛️ Bölüm veya program odası seç';
  $('bolumSec').classList.toggle('p',!!ozel);
  $('yItiraf').style.display=(yOda==='itiraf')?'block':'none';
}
function yazAc(varsayilan){
  pencereler();
  gerek().then(function(){
    yOda=varsayilan||''; $('yazNick').textContent='@'+profil.nick+' rumuzuyla açılacak.'; $('yHata').textContent=''; yOdaCiz(); ac('oYaz'); setTimeout(function(){$('yBaslik').focus();},60);
  }).catch(function(){});
}
function konuGonder(){
  var bas=$('yBaslik').value.replace(/\s+/g,' ').trim(), m=$('yMetin').value.trim(), l=$('yLink').value.trim(), h=$('yHata'), b=$('yGonder');
  if(!yOda){h.textContent='Bir oda seç.';return;}
  if(bas.length<8){h.textContent='Başlık en az 8 karakter olsun; ne sorduğunu ya da paylaştığını özetle.';return;}
  if(l&&!/^https:\/\/(drive|docs)\.google\.com\//.test(l)){h.textContent='Sadece Google Drive bağlantısı ekleyebilirsin.';return;}
  var tel=/(\+?90|0)?\s*5\d{2}[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}/;
  if(tel.test(bas)||tel.test(m)){h.textContent='Telefon numarası paylaşma; gizliliğin için kaldırıp tekrar dene.';return;}
  if(Date.now()-sonYaz<BEKLEME){h.textContent='Biraz bekleyip tekrar dene.';return;}
  var metin=(bas+(m?'\n'+m:'')).slice(0,MAKS);
  h.textContent=''; b.disabled=true;
  var veri={kategori:yOda,metin:metin,nick:profil.nick,uid:kul.uid,durum:(yOda==='itiraf'?'bekliyor':'aktif'),begeni:0,yorumSayi:0,bildirim:0,olusturma:firebase.firestore.FieldValue.serverTimestamp()};
  if(l) veri.link=l;
  db.collection('acukampus').add(veri).then(function(r){
    sonYaz=Date.now(); b.disabled=false; $('yBaslik').value=''; $('yMetin').value=''; $('yLink').value=''; $('ySay').textContent='0/700'; kapat('oYaz');
    try{gtag('event','kampus_konu',{oda:veri.kategori});}catch(e){}
    if(veri.durum==='aktif'){ toast('Konun açıldı'); setTimeout(function(){location.href='/acukampus.html?g='+encodeURIComponent(r.id);},500); }
    else { toast('Paylaşımın incelemeye alındı'); benimDurum(); }
  }).catch(function(){b.disabled=false;h.textContent='Gönderilemedi. Giriş yaptığından emin ol ve tekrar dene.';});
}

/* ── konu görünümü (pencere ve statik sayfa ortak) ── */
function konuHtml(d,yorumlar,opt){
  opt=opt||{}; var r=oda(d.kategori), t=ayir(d.metin), nick=d.nick||'Anonim', benim=kul&&d.uid&&d.uid===kul.uid, oyd=!!oy[d.id];
  var link=(d.link&&/^https:\/\/(drive|docs)\.google\.com\//.test(d.link))?'<a class="lnk" href="'+esc(d.link)+'" target="_blank" rel="noopener nofollow ugc"><span>📎</span><span>Google Drive dosyası<small>'+esc(d.link.replace(/^https:\/\//,'').slice(0,60))+'</small></span></a>':'';
  var Y=(yorumlar||[]).map(function(y){var n=y.nick||'Anonim',b2=kul&&y.uid&&y.uid===kul.uid;
    return '<div class="yo" data-y="'+esc(y.id)+'"><span class="av" style="--h:'+hue(n)+'">'+esc(n.charAt(0).toLocaleUpperCase('tr'))+'</span><div class="ic"><b>'+esc(n)+'</b><time>'+esc(az(y.olusturma))+'</time><p>'+esc(y.metin)+'</p><button class="mini" data-ya="yanit" data-n="'+esc(n)+'" type="button">Yanıtla</button>'+(b2?'<button class="mini" data-ya="sil" type="button">Sil</button>':'')+'</div></div>';}).join('');
  return '<article class="konu" style="--rc:'+r.c+'"><a class="oda-et" href="/kampus/oda/'+esc(d.kategori)+'.html">'+r.ik+' '+esc(r.ad)+'</a>'+
   (opt.h1===false?'<h2 style="font-size:1.5rem;font-weight:800;margin:.6rem 0 .7rem;overflow-wrap:anywhere">'+esc(t.b)+'</h2>':'<h1>'+esc(t.b)+'</h1>')+
   '<div class="yazar"><span class="av" style="--h:'+hue(nick)+'">'+esc(nick.charAt(0).toLocaleUpperCase('tr'))+'</span><span><b>'+esc(nick)+'</b><br>'+esc(az(d.olusturma))+'</span></div>'+
   (t.g?'<div class="govde">'+esc(t.g)+'</div>':'')+link+
   '<div class="eylem"><button class="ab'+(oyd?' on':'')+'" data-a="oy" type="button">'+IK.yukari+'<span>'+(d.begeni>0?d.begeni+' faydalı':'Faydalı')+'</span></button>'+
   '<button class="ab" data-a="yanitla" type="button">'+IK.yorum+'<span>Yanıtla</span></button><button class="ab" data-a="paylas" type="button">'+IK.paylas+'<span>Paylaş</span></button>'+
   '<span class="ab sag" style="padding:0">'+(benim?'<button class="ab tehl" data-a="sil" type="button" aria-label="Sil">'+IK.sil+'</button>':'')+'<button class="ab tehl" data-a="sik" type="button" aria-label="Uygunsuz bildir">'+IK.bayrak+'</button></span></div></article>'+
   '<section class="yanitlar"><h2>'+((yorumlar||[]).length?(yorumlar.length+' yanıt'):'Henüz yanıt yok')+'</h2>'+(Y||'<p style="color:var(--dim);font-size:.92rem">İlk yanıtı sen yaz; bildiklerin başka bir öğrencinin işine yarar.</p>')+
   '<div class="yf"><textarea maxlength="500" placeholder="Yanıtını yaz…" aria-label="Yanıt yaz"></textarea><button type="button" data-ya="gonder">Gönder</button></div></section>';
}
// Bir kapsayıcıyı canlı konu görünümüne bağla
function konuBagla(kap,d,yorumlar,opt){
  var durum={d:d,y:yorumlar||[]};
  function ciz(){var t=kap.querySelector('.yf textarea'),v=t?t.value:'';kap.innerHTML=konuHtml(durum.d,durum.y,opt);if(v)kap.querySelector('.yf textarea').value=v;}
  ciz(); dinleyici.push(ciz);
  kap.addEventListener('click',function(e){
    var b=e.target.closest('[data-a],[data-ya]'); if(!b) return; var a=b.getAttribute('data-a')||b.getAttribute('data-ya'), d=durum.d;
    if(a==='paylas'){var u=opt&&opt.url||location.href;if(navigator.share){navigator.share({title:ayir(d.metin).b,url:u}).catch(function(){});}else if(navigator.clipboard){navigator.clipboard.writeText(u).then(function(){toast('Bağlantı kopyalandı');});}}
    else if(a==='yanitla'){var tx=kap.querySelector('.yf textarea');tx.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(function(){tx.focus();},300);}
    else if(a==='oy'){gerek().then(function(){
      var ref=db.collection('kampus_oy').doc(kul.uid+'_'+d.id), pr=db.collection('acukampus').doc(d.id), w=db.batch(), v=!!oy[d.id];
      if(v){w.delete(ref);w.update(pr,{begeni:firebase.firestore.FieldValue.increment(-1)});}
      else{w.set(ref,{uid:kul.uid,post:d.id,zaman:firebase.firestore.FieldValue.serverTimestamp()});w.update(pr,{begeni:firebase.firestore.FieldValue.increment(1)});}
      return w.commit().then(function(){if(v){delete oy[d.id];d.begeni=Math.max(0,(d.begeni||0)-1);}else{oy[d.id]=true;d.begeni=(d.begeni||0)+1;}ciz();});
    }).catch(function(){toast('İşlem yapılamadı, tekrar dene.');});}
    else if(a==='sik'){gerek().then(function(){
      if(sik[d.id]){toast('Bu konuyu zaten bildirdin');return;}
      if(!confirm('Bu konu uygunsuz olarak bildirilsin mi?'))return;
      var w=db.batch(); w.set(db.collection('kampus_sikayet').doc(kul.uid+'_'+d.id),{uid:kul.uid,post:d.id,zaman:firebase.firestore.FieldValue.serverTimestamp()});
      w.update(db.collection('acukampus').doc(d.id),{bildirim:firebase.firestore.FieldValue.increment(1)});
      return w.commit().then(function(){sik[d.id]=true;toast('Bildirildi, teşekkürler');});
    }).catch(function(){toast('Bildirilemedi, tekrar dene.');});}
    else if(a==='sil'&&!b.closest('.yo')){ if(!confirm('Bu konu silinsin mi?'))return;
      sdk().then(function(){return authHazir;}).then(function(){return db.collection('acukampus').doc(d.id).delete();}).then(function(){toast('Silindi');setTimeout(function(){location.href='/acukampus.html';},700);}).catch(function(){toast('Silinemedi.');});}
    else if(a==='sil'){var yid=b.closest('.yo').getAttribute('data-y'); if(!confirm('Yanıt silinsin mi?'))return;
      sdk().then(function(){return authHazir;}).then(function(){return db.collection('acukampus').doc(d.id).collection('yorumlar').doc(yid).delete();}).then(function(){durum.y=durum.y.filter(function(y){return y.id!==yid;});ciz();}).catch(function(){toast('Silinemedi.');});}
    else if(a==='yanit'){var t=kap.querySelector('.yf textarea');t.value='@'+b.getAttribute('data-n')+' ';t.focus();}
    else if(a==='gonder'){yanitGonder();}
  });
  function yanitGonder(){
    var t=kap.querySelector('.yf textarea'), m=t.value.trim(), d=durum.d;
    if(m.length<2) return;
    if(/(https?:\/\/|www\.)/i.test(m)){toast('Yanıtlarda bağlantı paylaşılamaz.');return;}
    if(/(\+?90|0)?\s*5\d{2}[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}/.test(m)){toast('Telefon numarası paylaşma.');return;}
    if(Date.now()-sonYaz<8000){toast('Biraz bekleyip tekrar dene.');return;}
    gerek().then(function(){
      var w=db.batch(), ref=db.collection('acukampus').doc(d.id).collection('yorumlar').doc();
      w.set(ref,{metin:m,nick:profil.nick,uid:kul.uid,durum:'aktif',olusturma:firebase.firestore.FieldValue.serverTimestamp()});
      w.update(db.collection('acukampus').doc(d.id),{yorumSayi:firebase.firestore.FieldValue.increment(1)});
      return w.commit().then(function(){sonYaz=Date.now();t.value='';durum.y=durum.y.concat([{id:ref.id,uid:kul.uid,nick:profil.nick,metin:m,olusturma:new Date()}]);d.yorumSayi=(d.yorumSayi||0)+1;ciz();try{gtag('event','kampus_yanit',{oda:d.kategori});}catch(e){}});
    }).catch(function(){toast('Yanıt gönderilemedi, tekrar dene.');});
  }
  return {yenile:function(y){durum.y=y;ciz();}};
}

/* ── üst çubuk düğmeleri ── */
function cubukBagla(){
  var g=$('btnGiris'), a=$('btnAv'), m=$('menu'), c=$('mCikis');
  if(g) g.onclick=function(){girisBekliyor=true;pencereler();gerek();};
  if(a) a.onclick=function(e){e.stopPropagation();m.classList.toggle('ac');};
  document.addEventListener('click',function(e){if(m&&!e.target.closest('#menu'))m.classList.remove('ac');});
  if(c) c.onclick=function(){m.classList.remove('ac');if(auth)auth.signOut().then(function(){toast('Çıkış yapıldı');});};
  try{ if(localStorage.getItem('acuGiris')==='1'){ (window.requestIdleCallback||function(f){setTimeout(f,2500);})(function(){sdk().catch(function(){});}); } }catch(e){}
}

window.KF={ODALAR:ODALAR,BOLUMLER:BOLUMLER,PROGRAMLAR:PROGRAMLAR,oda:oda,esc:esc,hue:hue,az:az,ayir:ayir,toast:toast,rq:rq,eq:eq,konuGetir:konuGetir,yorumlarGetir:yorumlarGetir,
  yazAc:yazAc,bolumAc:bolumAc,konuBagla:konuBagla,cubukBagla:cubukBagla,pencereler:pencereler,dinle:function(f){dinleyici.push(f);},ac:ac,kapat:kapat,IK:IK};
})();
