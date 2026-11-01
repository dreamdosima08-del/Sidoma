/* Artvin Rehberi — tek tıkla radyo (Radyo 08, TRT FM, Joy FM)
   Kendiliğinden çalmaz. Telefonda kur bandının sağında, masaüstünde üst menüde küçük bir buton. */
(function(){
'use strict';
var IST=[
  {k:'r08',ad:'Radyo 08',lg:'08',alt:'Artvin\'in yerel radyosu',src:['https://sslyayin.netyayin.net:10931/stream','https://sslyayin.netyayin.net:10931/;']},
  {k:'trtfm',ad:'TRT FM',lg:'TRT',alt:'Türkçe pop',src:['https://trt.radyotvonline.net/trtfm'],hls:'https://radio-trtfm.live.trt.com.tr/master.m3u8'},
  {k:'joy',ad:'Joy FM',lg:'JOY',alt:'Slow ve romantik şarkılar',src:['https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_FM.mp3','https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_FMAAC.aac']}
];
function oku(k,v){try{var x=localStorage.getItem(k);return x==null?v:x;}catch(e){return v;}}
function yaz(k,v){try{localStorage.setItem(k,v);}catch(e){}}

var css=''+
'.rd{position:relative;pointer-events:auto;font-family:"DM Sans",system-ui,sans-serif}'+
'.rd-b{display:inline-flex;align-items:center;gap:.35rem;background:rgba(231,199,123,.12);border:1px solid rgba(231,199,123,.4);color:#f3e2b0;border-radius:999px;padding:.22rem .6rem .22rem .5rem;font:700 .68rem/1 "DM Sans",system-ui,sans-serif;cursor:pointer;white-space:nowrap;letter-spacing:.01em}'+
'.rd-b svg{width:13px;height:13px;flex:none}'+
'.rd-b:focus-visible,.rd-p button:focus-visible{outline:2px solid #f0c040;outline-offset:2px}'+
'.rd.cal .rd-b{background:#f0c040;color:#1a1405;border-color:#f0c040}'+
'.rd-eq{display:none;align-items:flex-end;gap:2px;height:11px}.rd.cal .rd-eq{display:inline-flex}.rd.cal .rd-ik{display:none}'+
'.rd-eq i{width:2.5px;background:currentColor;border-radius:1px;animation:rdEq 1s ease-in-out infinite}'+
'.rd-eq i:nth-child(2){animation-delay:-.35s}.rd-eq i:nth-child(3){animation-delay:-.7s}'+
'@keyframes rdEq{0%,100%{height:3px}50%{height:11px}}'+
'.rd.yuk .rd-eq i{animation-duration:.5s;opacity:.6}'+
'.rd-p{position:fixed;top:0;left:0;width:270px;max-width:calc(100vw - 20px);font-family:"DM Sans",system-ui,sans-serif;z-index:2147482000;background:#0d2219;border:1px solid rgba(240,192,64,.3);border-radius:16px;box-shadow:0 18px 40px rgba(0,0,0,.55);padding:.55rem;z-index:1000;display:none;text-align:left}'+
'.rd-p.acik{display:block}'+
'.rd-p h4{font:800 .72rem "DM Sans",system-ui,sans-serif;color:rgba(243,239,226,.55);letter-spacing:.04em;margin:.2rem .45rem .45rem}'+
'.rd-s{width:100%;display:grid;grid-template-columns:34px 1fr auto;gap:.6rem;align-items:center;padding:.5rem .45rem;border:0;border-radius:11px;background:none;color:#f3efe2;cursor:pointer;text-align:left;font:inherit}'+
'.rd-s:hover{background:rgba(255,255,255,.06)}'+
'.rd-s .rd-l{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;font:800 .68rem "DM Sans",sans-serif;color:#fff;letter-spacing:.02em}'+
'.rd-s b{display:block;font-size:.88rem;font-weight:700}.rd-s small{display:block;font-size:.72rem;color:rgba(243,239,226,.55)}'+
'.rd-s em{font-style:normal;font-size:.68rem;font-weight:800;color:#f0c040}'+
'.rd-s[aria-pressed=true]{background:rgba(240,192,64,.12)}'+
'.rd-alt{display:flex;align-items:center;gap:.55rem;border-top:1px solid rgba(255,255,255,.08);margin-top:.4rem;padding:.55rem .45rem .2rem}'+
'.rd-alt input{flex:1;accent-color:#f0c040}'+
'.rd-dur{border:0;background:rgba(255,255,255,.08);color:#f3efe2;border-radius:8px;padding:.35rem .6rem;font:700 .74rem "DM Sans",sans-serif;cursor:pointer}'+
'.rd-not{font-size:.68rem;color:rgba(243,239,226,.45);margin:.35rem .45rem .1rem;line-height:1.4}'+
'.rd-hata{color:#ff9b9b}'+
'html.mu .rd-b{font-size:.84rem;padding:.55rem .9rem .55rem .75rem;border-radius:10px;gap:.45rem}html.mu .rd-b svg{width:15px;height:15px}'+
'#dovizBant .rd{margin-left:auto;flex:none}'+
'#dovizBant .rd-y{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}'+
'#dovizBant .rd-b{width:26px;height:26px;padding:0;justify-content:center;border-radius:50%}'+
'html.rd-acik #floatShare,html.rd-acik #scroll-nav{visibility:hidden}'+
'@media(prefers-reduced-motion:reduce){.rd-eq i{animation:none;height:8px}}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

var RENK={r08:'#0f766e',trtfm:'#1d4ed8',joy:'#be185d'};
var kok=document.createElement('div');kok.className='rd';
kok.innerHTML='<button type="button" class="rd-b" aria-haspopup="true" aria-expanded="false"><svg class="rd-ik" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="8" width="18" height="12" rx="2.5"/><path d="M7 8 17 3"/><circle cx="15.5" cy="14" r="2.6"/><path d="M6.5 12.5h4M6.5 15.5h4"/></svg><span class="rd-eq" aria-hidden="true"><i></i><i></i><i></i></span><span class="rd-y">Radyo</span></button>'+
 '<div class="rd-p" role="dialog" aria-label="Radyo dinle"><h4>Tek tıkla dinle</h4>'+
 IST.map(function(s,i){return '<button type="button" class="rd-s" data-i="'+i+'" aria-pressed="false"><span class="rd-l" style="background:'+RENK[s.k]+'">'+s.lg+'</span><span><b>'+s.ad+'</b><small>'+s.alt+'</small></span><em></em></button>';}).join('')+
 '<div class="rd-alt"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(243,239,226,.6)" stroke-width="2" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg><input type="range" min="0" max="100" aria-label="Ses düzeyi"><button type="button" class="rd-dur">Durdur</button></div>'+
 '<p class="rd-not" aria-live="polite">Yayınlar radyoların kendi canlı yayınıdır.</p></div>';
var pn=kok.querySelector('.rd-p'); document.body.appendChild(pn);
var btn=kok.querySelector('.rd-b'),yazi=kok.querySelector('.rd-y'),not=pn.querySelector('.rd-not'),ses=pn.querySelector('input'),satir=pn.querySelectorAll('.rd-s');
var au=null,simdi=-1,kaynak=0;
ses.value=oku('rdSes','35');

function sesAyarla(){ if(au) au.volume=Math.max(0,Math.min(1,ses.value/100)); }
ses.addEventListener('input',function(){ sesAyarla(); yaz('rdSes',ses.value); });
function durum(){
  kok.classList.toggle('cal',simdi>=0);
  satir.forEach(function(b,i){ b.setAttribute('aria-pressed',i===simdi?'true':'false'); b.querySelector('em').textContent=i===simdi?'ÇALIYOR':''; });
  yazi.textContent=simdi>=0?IST[simdi].ad:'Radyo';
  btn.setAttribute('aria-label',simdi>=0?IST[simdi].ad+' çalıyor, radyo menüsünü aç':'Radyo dinle');
}
function durdur(){ if(au){ au.pause(); au.removeAttribute('src'); try{au.load();}catch(e){} } simdi=-1; kok.classList.remove('yuk'); durum(); }
function kaynaklar(s){ var a=s.src.slice(); if(s.hls&&document.createElement('audio').canPlayType('application/vnd.apple.mpegurl')) a.push(s.hls); return a; }
function cal(i,k){
  var s=IST[i],l=kaynaklar(s); k=k||0;
  if(k>=l.length){ not.textContent=s.ad+' şu an açılamadı. Birazdan tekrar dene.'; not.classList.add('rd-hata'); durdur(); return; }
  if(!au){ au=new Audio(); au.preload='none';
    au.addEventListener('playing',function(){ kok.classList.remove('yuk'); });
    au.addEventListener('waiting',function(){ kok.classList.add('yuk'); });
    au.addEventListener('error',function(){ if(simdi>=0) cal(simdi,kaynak+1); });
  }
  simdi=i; kaynak=k; not.classList.remove('rd-hata'); not.textContent='Yayınlar radyoların kendi canlı yayınıdır.';
  au.src=l[k]; sesAyarla(); kok.classList.add('yuk'); durum();
  var p=au.play(); if(p&&p.catch) p.catch(function(e){ if(e&&e.name==='NotAllowedError'){ durdur(); } else if(simdi===i) cal(i,k+1); });
  yaz('rdSon',s.k);
}
satir.forEach(function(b){ b.addEventListener('click',function(){ var i=+b.getAttribute('data-i'); if(i===simdi) durdur(); else cal(i,0); }); });
pn.querySelector('.rd-dur').addEventListener('click',durdur);
function konum(){ var r=btn.getBoundingClientRect(), w=pn.offsetWidth||270, x=Math.min(Math.max(10,r.right-w),window.innerWidth-w-10); pn.style.left=x+'px'; pn.style.top=(r.bottom+8)+'px'; }
function panel(ac){ document.documentElement.classList.toggle('rd-acik',ac); pn.classList.toggle('acik',ac); kok.classList.toggle('acik',ac); btn.setAttribute('aria-expanded',ac?'true':'false'); if(ac) konum(); }
window.addEventListener('scroll',function(){ if(pn.classList.contains('acik')) konum(); },{passive:true});
window.addEventListener('resize',function(){ if(pn.classList.contains('acik')) konum(); });
btn.addEventListener('click',function(e){ e.stopPropagation(); panel(!pn.classList.contains('acik')); });
document.addEventListener('click',function(e){ if(!kok.contains(e.target)&&!pn.contains(e.target)) panel(false); });
document.addEventListener('keydown',function(e){ if(e.key==='Escape') panel(false); });
durum();

/* yerleşim: masaüstünde üst menüye, telefonda kur bandına */
function yerles(){
  var ust=document.getElementById('muUst');
  if(document.documentElement.classList.contains('mu')&&ust){ var p=ust.querySelector('.mu-play'); if(kok.parentNode!==ust) ust.insertBefore(kok,p||null); return; }
  var bant=document.getElementById('dovizBant'), saat=document.getElementById('saatGoster');
  if(bant){ var hedef=saat&&saat.parentNode===bant?saat:null; if(kok.parentNode!==bant||kok.nextSibling!==hedef) bant.insertBefore(kok,hedef); }
}
yerles();
new MutationObserver(yerles).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
})();
