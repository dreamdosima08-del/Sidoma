/* Artvin Rehberi — "Bugün Artvin nasıl?" davet balonu
   Sayfanın köşesinde kibar bir balon: günde bir kez, öğleden sonra, oy vermemiş ziyaretçiye.
   Kullanım: <script src="/nabiz-davet.js" defer></script>  (yorum.js bunu kendisi de yükler) */
(function(){
'use strict';
if(window.__nbzDavet) return; window.__nbzDavet=1;
if(/bugun-artvin/.test(location.pathname)) return;
if(location.pathname==='/'||/\/index\.html$/.test(location.pathname)) return;   // ana sayfada kart zaten var
function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } }
function p2(x){ return String(x).padStart(2,'0'); }
var d=new Date(), gun=d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate()), saat=d.getHours();
var dilim=saat>=5&&saat<12?'s':saat>=12&&saat<18?'o':'a';
if(saat<10) return;                                         // sabah erken rahatsız etme
if(ls('baOy_'+gun+'_'+dilim)) return;                       // bu dilimde zaten oy vermiş
if(ls('nbzDavetKapat')===gun) return;                       // bugün kapatmış
var gosterildi=ls('nbzDavetGoster');
if(gosterildi===gun+'_'+dilim) return;                      // bu dilimde bir kez gösterildi
var SORU=dilim==='o'?'Şu an Artvin nasıl?':dilim==='a'?'Bugün Artvin nasıldı?':'Artvin bugün nasıl?';

function kur(){
  var st=document.createElement('style');
  st.textContent='.nbz{position:fixed;left:50%;bottom:calc(86px + env(safe-area-inset-bottom,0px));transform:translate(-50%,140%);z-index:2147482000;width:min(360px,calc(100vw - 24px));'+
   'background:linear-gradient(155deg,#1d4a33,#10291c);color:#fff;border:1.5px solid rgba(255,206,107,.6);border-radius:20px;padding:12px 12px 12px 14px;box-shadow:0 18px 44px rgba(0,0,0,.55);'+
   'font:600 14px/1.3 system-ui,-apple-system,"Segoe UI",sans-serif;transition:transform .45s cubic-bezier(.2,.8,.25,1),opacity .3s;opacity:0}'+
   '.nbz.ac{transform:translate(-50%,0);opacity:1}'+
   '.nbz-ust{display:flex;align-items:center;gap:8px;padding-right:26px}'+
   '.nbz-ust b{font-size:15px;font-weight:800}'+
   '.nbz-ust i{flex:none;width:8px;height:8px;border-radius:50%;background:#53d39a;box-shadow:0 0 0 0 rgba(83,211,154,.6);animation:nbzN 1.8s infinite}'+
   '@keyframes nbzN{70%{box-shadow:0 0 0 7px rgba(83,211,154,0)}100%{box-shadow:0 0 0 0 rgba(83,211,154,0)}}'+
   '.nbz-alt{font-size:12px;color:rgba(255,255,255,.7);margin:3px 0 10px;font-weight:600}'+
   '.nbz-yuz{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}'+
   '.nbz-yuz a{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 2px 6px;border-radius:12px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.14);color:#fff;text-decoration:none;font-size:11px;font-weight:800;line-height:1.1;text-align:center}'+
   '.nbz-yuz a:active{transform:scale(.93)}'+
   '.nbz-yuz span{font-size:26px;line-height:1}'+
   '.nbz-x{position:absolute;top:8px;right:8px;width:28px;height:28px;border:0;border-radius:50%;background:rgba(255,255,255,.1);color:rgba(255,255,255,.75);font:700 16px/1 system-ui;cursor:pointer}'+
   '@media(prefers-reduced-motion:reduce){.nbz{transition:none}.nbz-ust i{animation:none}}';
  document.head.appendChild(st);
  var b=document.createElement('div'); b.className='nbz'; b.setAttribute('role','dialog'); b.setAttribute('aria-label','Bugün Artvin nasıl?');
  var y=[[4,'🤩','Harika'],[3,'😊','Keyifli'],[2,'😐','Orta şekerli'],[1,'😒','Can sıkıcı']];
  b.innerHTML='<button class="nbz-x" type="button" aria-label="Kapat">×</button><div class="nbz-ust"><i></i><b>'+SORU+'</b></div>'+
    '<div class="nbz-alt">Tek dokunuş · Artvin\'in günlük nabzını birlikte tutuyoruz</div>'+
    '<div class="nbz-yuz">'+y.map(function(x){ return '<a href="/bugun-artvin.html?m='+x[0]+'&k=davet#nasilsin"><span>'+x[1]+'</span>'+x[2]+'</a>'; }).join('')+'</div>';
  document.body.appendChild(b);
  ls('nbzDavetGoster',gun+'_'+dilim);
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ b.classList.add('ac'); }); });
  b.querySelector('.nbz-x').addEventListener('click',function(){ ls('nbzDavetKapat',gun); b.classList.remove('ac'); setTimeout(function(){ b.remove(); },500); });
}
/* sayfayı biraz okuduktan sonra çıksın: 12 sn ya da sayfanın %35'i, hangisi önce */
var oldu=false;
function tetik(){ if(oldu) return; oldu=true; window.removeEventListener('scroll',kaydir); kur(); }
function kaydir(){ var h=document.documentElement; if((h.scrollTop+innerHeight)/h.scrollHeight>.35) tetik(); }
window.addEventListener('scroll',kaydir,{passive:true});
setTimeout(tetik,12000);
})();
