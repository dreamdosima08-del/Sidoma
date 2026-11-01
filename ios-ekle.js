/* Artvin Rehberi — iPhone'da "ana ekrana ekle" rehberi + günlük cihaz sayacı
   iPhone/iPad'de (uygulama olarak açılmamışsa) altta küçük bir kart çıkar, "Nasıl?" 3 adımı gösterir.
   Sayaç: cihaz başına günde bir kez ios / android / diger / ios_ekli / android_ekli artar (Firestore cihaz_sayac). */
(function(){
'use strict';
var ua=navigator.userAgent||'';
var IOS=/iPhone|iPad|iPod/i.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1);
var ANDROID=/Android/i.test(ua);
var EKLI=(window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true||document.referrer.indexOf('android-app://')===0;
function oku(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function yaz(k,v){try{localStorage.setItem(k,v);}catch(e){}}

/* ── sayaç ── */
(function(){
  var d=new Date(Date.now()+3*36e5).toISOString().slice(0,10);
  if(oku('cihazSay')===d) return;
  var alan=IOS?(EKLI?'ios_ekli':'ios'):(ANDROID?(EKLI?'android_ekli':'android'):'diger');
  var B='projects/artvin-imece/databases/(default)';
  try{
    fetch('https://firestore.googleapis.com/v1/'+B+'/documents:commit?key=AIzaSyDPPh1T_PLdfbuQdYbP-HXrnc3a5Nb1nzI',{method:'POST',headers:{'Content-Type':'application/json'},keepalive:true,
      body:JSON.stringify({writes:[{transform:{document:B+'/documents/cihaz_sayac/'+d,fieldTransforms:[{fieldPath:alan,increment:{integerValue:'1'}}]}}]})})
    .then(function(r){ if(r.ok) yaz('cihazSay',d); }).catch(function(){});
  }catch(e){}
})();

if(!IOS||EKLI) return;
if(Date.now()<(+oku('iosEkle')||0)) return;
var CHROME=/CriOS/i.test(ua), FIREFOX=/FxiOS/i.test(ua);

var css=''+
'.ie-kart{position:fixed;left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom));z-index:900;display:flex;align-items:center;gap:.7rem;padding:.7rem .75rem;border-radius:18px;background:linear-gradient(160deg,rgba(20,44,32,.97),rgba(9,22,16,.98));border:1px solid rgba(240,192,64,.45);box-shadow:0 14px 34px rgba(0,0,0,.5);font-family:"DM Sans",system-ui,sans-serif;color:#f3efe2;transform:translateY(140%);transition:transform .35s cubic-bezier(.2,.8,.3,1);max-width:520px;margin:0 auto}'+
'.ie-kart.acik{transform:none}'+
'.ie-kart img{width:44px;height:44px;border-radius:11px;flex:none;box-shadow:0 4px 10px rgba(0,0,0,.35)}'+
'.ie-kart b{display:block;font-size:.86rem;line-height:1.25}.ie-kart span{display:block;font-size:.72rem;color:rgba(243,239,226,.62);margin-top:.12rem}'+
'.ie-kart .ie-m{flex:1;min-width:0}'+
'.ie-nasil{flex:none;font:800 .8rem "DM Sans",system-ui,sans-serif;background:#f0c040;color:#1a1405;border:0;border-radius:11px;padding:.6rem .85rem;cursor:pointer}'+
'.ie-x{flex:none;background:none;border:0;color:rgba(243,239,226,.45);font-size:1.15rem;padding:.2rem .3rem;cursor:pointer}'+
'.ie-ort{position:fixed;inset:0;z-index:2147482500;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;font-family:"DM Sans",system-ui,sans-serif}'+
'.ie-sayfa{width:100%;max-width:520px;background:#0d2219;color:#f3efe2;border-radius:22px 22px 0 0;border-top:1px solid rgba(240,192,64,.4);padding:1.1rem 1.1rem calc(1.1rem + env(safe-area-inset-bottom));box-shadow:0 -10px 30px rgba(0,0,0,.4);animation:ieYuk .3s ease}'+
'@keyframes ieYuk{from{transform:translateY(40%);opacity:.4}to{transform:none;opacity:1}}'+
'.ie-sayfa h3{font:400 1.7rem/1 "Bebas Neue",Impact,sans-serif;letter-spacing:.04em;color:#f0c040;text-transform:uppercase}'+
'.ie-sayfa .ie-alt{font-size:.82rem;color:rgba(243,239,226,.62);margin:.35rem 0 .9rem}'+
'.ie-adim{display:grid;grid-template-columns:38px 1fr;gap:.75rem;align-items:center;padding:.65rem 0;border-top:1px solid rgba(255,255,255,.07)}'+
'.ie-adim i{width:38px;height:38px;border-radius:11px;background:rgba(240,192,64,.14);display:grid;place-items:center;color:#f0c040;font-style:normal}'+
'.ie-adim i svg{width:21px;height:21px}'+
'.ie-adim p{font-size:.88rem;line-height:1.5}.ie-adim p b{color:#fff}.ie-adim p small{display:block;font-size:.74rem;color:rgba(243,239,226,.55);margin-top:.15rem}'+
'.ie-tamam{width:100%;margin-top:.9rem;font:800 .92rem "DM Sans",system-ui,sans-serif;background:#f0c040;color:#1a1405;border:0;border-radius:13px;padding:.85rem;cursor:pointer}'+
'.ie-nasil:focus-visible,.ie-x:focus-visible,.ie-tamam:focus-visible{outline:2px solid #fff;outline-offset:2px}'+
'@media(prefers-reduced-motion:reduce){.ie-kart{transition:none}.ie-sayfa{animation:none}}';
var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

var PAYLAS='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';
var EKLE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
var TAMAM='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
var adim1=CHROME?'<b>Paylaş</b> simgesine dokun.<small>Chrome\'da adres çubuğunun sağında.</small>'
  :(FIREFOX?'Sağ alttaki <b>menüye</b>, sonra <b>Paylaş</b>\'a dokun.':'<b>Paylaş</b> simgesine dokun.<small>Safari\'de alttaki çubukta. Yeni iOS\'ta önce <b>•••</b> düğmesine dokun.</small>');

var kart=document.createElement('div'); kart.className='ie-kart'; kart.setAttribute('role','dialog'); kart.setAttribute('aria-label','Artvin Rehberi\'ni ana ekrana ekle');
kart.innerHTML='<img src="/apple-touch-icon.png" alt="" width="44" height="44"><div class="ie-m"><b>Artvin Rehberi\'ni iPhone\'una ekle</b><span>Uygulama gibi tek dokunuşla açılır, ücretsiz</span></div><button type="button" class="ie-nasil">Nasıl?</button><button type="button" class="ie-x" aria-label="Kapat">✕</button>';
function kapat(gun){ kart.classList.remove('acik'); yaz('iosEkle',String(Date.now()+gun*864e5)); setTimeout(function(){ if(kart.parentNode) kart.remove(); },400); }
kart.querySelector('.ie-x').onclick=function(){ kapat(7); };
kart.querySelector('.ie-nasil').onclick=function(){
  var ort=document.createElement('div'); ort.className='ie-ort';
  ort.innerHTML='<div class="ie-sayfa" role="dialog" aria-modal="true" aria-labelledby="ieBas"><h3 id="ieBas">Ana ekrana ekle</h3><p class="ie-alt">3 adım, 10 saniye. Ana ekranında Artvin Rehberi ikonu olur.</p>'+
    '<div class="ie-adim"><i>'+PAYLAS+'</i><p>'+adim1+'</p></div>'+
    '<div class="ie-adim"><i>'+EKLE+'</i><p>Listeyi aşağı kaydır, <b>Ana Ekrana Ekle</b>\'ye dokun.</p></div>'+
    '<div class="ie-adim"><i>'+TAMAM+'</i><p>Sağ üstte <b>Ekle</b>\'ye dokun. Hepsi bu.</p></div>'+
    '<button type="button" class="ie-tamam">Anladım</button></div>';
  document.body.appendChild(ort);
  var b=ort.querySelector('.ie-tamam'); b.focus();
  function bitir(){ ort.remove(); kapat(30); }
  b.onclick=bitir; ort.onclick=function(e){ if(e.target===ort) bitir(); };
  document.addEventListener('keydown',function k(e){ if(e.key==='Escape'){ document.removeEventListener('keydown',k); if(ort.parentNode) bitir(); } });
};
function goster(){
  var c=document.getElementById('cerezBanner');
  if(c&&c.style.display!=='none'&&c.offsetParent!==null){ setTimeout(goster,4000); return; }
  document.body.appendChild(kart); requestAnimationFrame(function(){ requestAnimationFrame(function(){ kart.classList.add('acik'); }); });
}
setTimeout(goster,6000);
})();
