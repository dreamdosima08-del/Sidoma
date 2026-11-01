/* Artvin Rehberi — masaüstü ana sayfa katmanı
   Sadece geniş ekranda (1100 px ve üstü) çalışır; telefonda hiçbir şeye dokunmaz.
   Var olan öğeleri (arama, kur bandı, saat) yerinden taşır, ekran daralınca geri koyar. */
(function(){
'use strict';
var MQ=window.matchMedia('(min-width:1100px)');
var hc=document.querySelector('.hero-content'); if(!hc) return;
var KOK=document.documentElement, acik=false, tasinan=[], eklenen=[];

function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e;}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function tasi(n,hedef,once){ if(!n||!hedef) return; var yer=document.createComment('mu');n.parentNode.insertBefore(yer,n);tasinan.push([n,yer]);
  if(once) hedef.insertBefore(n,once); else hedef.appendChild(n); }
function ekle(n,hedef,once){ if(once) hedef.insertBefore(n,once); else hedef.appendChild(n); eklenen.push(n); return n; }

var KISA={'Ulaşım ve yol':'Ulaşım','Gez, gör, konakla':'Gez ve konakla','Sağlık ve acil':'Sağlık','Şehir ve yaşam':'Şehir ve yaşam','Topluluk ve eğlence':'Topluluk'};

function ustBar(){
  var bar=el('header','mu-ust'); bar.id='muUst';
  var menu='';
  document.querySelectorAll('#raflar .raf').forEach(function(r,i){
    var ad=(r.querySelector('h3')||{}).textContent||''; if(!ad) return;
    var lk=''; r.querySelectorAll('a.rk').forEach(function(a){
      var ik=a.querySelector('.rk-ik'),b=a.querySelector('b'),s=a.querySelector('small');
      lk+='<a href="'+esc(a.getAttribute('href'))+'"><i>'+(ik?ik.textContent:'')+'</i><span><b>'+esc(b?b.textContent:'')+'</b>'+(s?'<small>'+esc(s.textContent)+'</small>':'')+'</span></a>';
    });
    menu+='<div class="mu-m"><button type="button" aria-expanded="false" aria-controls="muAc'+i+'">'+esc(KISA[ad]||ad)+'<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="mu-ac" id="muAc'+i+'" style="--rk:'+(r.style.getPropertyValue('--rk')||'#f0c040')+'">'+lk+'</div></div>';
  });
  bar.innerHTML='<a class="mu-logo" href="/"><img src="/img/1778614783558-27mw4l16.webp" alt="" width="34" height="34"><span>ARTVİN REHBERİ</span></a>'+
    '<nav class="mu-menu" aria-label="Ana menü">'+menu+'<a class="mu-d" href="/artvin-oyunlar.html">Oyunlar</a><a class="mu-d" href="/artvin-blog.html">Blog</a></nav>'+
        '<a class="mu-play" href="https://play.google.com/store/apps/details?id=com.artvinrehber.mobil" target="_blank" rel="noopener"><svg width="14" height="15" viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256zm278.3 234.3L104.6 13l280.8 161.2zm0 43.4L104.6 499l280.8-161.2zm136.5-84.1L403.8 160l-63.4 96 63.4 96 59.2-33.6c17.7-14.1 17.7-50.1-1.2-64.8z"/></svg>Uygulamayı indir</a>';
  ekle(bar,document.body,document.body.firstChild);
  bar.querySelectorAll('.mu-m>button').forEach(function(b){
    b.addEventListener('click',function(){ var a=b.getAttribute('aria-expanded')==='true';
      bar.querySelectorAll('.mu-m>button').forEach(function(x){x.setAttribute('aria-expanded','false');});
      b.setAttribute('aria-expanded',a?'false':'true'); });
  });
  document.addEventListener('click',kapatMenu); document.addEventListener('keydown',escMenu);
}
function kapatMenu(e){ if(e.target.closest&&e.target.closest('.mu-m')) return; document.querySelectorAll('.mu-m>button').forEach(function(x){x.setAttribute('aria-expanded','false');}); }
function escMenu(e){ if(e.key==='Escape') kapatMenu({target:document.body}); }

/* Bugün Artvin'de paneli: hikâye halkalarının verisini kullanır */
var SATIR=[[0,'Hava','hava'],[2,'Sıradaki Havaş','havas'],[1,'Nöbetçi eczane','eczane'],[3,'Son haber','haber'],[4,'Günün kelimesi','kelime']];
var BOS={0:'Artvin merkez, saatlik tahmin',1:'Merkez ve ilçelerde nöbetçi eczaneler',2:'Artvin Otogar ve diğer duraklar',3:'Artvin\'den son haberler',4:'Artvin ağzından bir kelime'};
function panelCiz(){
  var p=document.getElementById('muPanel'); if(!p) return;
  var L=(window.ARHikaye&&window.ARHikaye.liste())||[];
  p.querySelector('.mu-sat').innerHTML=SATIR.map(function(s){
    var h=L[s[0]]||{}, sag=h.deger?'<em>'+esc(h.deger)+'</em>':(h.rozet?'<span class="mu-roz">'+esc(h.rozet)+'</span>':'<em class="ok">›</em>');
    return '<button type="button" class="mu-bs" data-i="'+s[0]+'"><img src="/img/ikon/'+s[2]+'.webp" alt="" width="44" height="44"><span><b>'+s[1]+'</b><small>'+esc(h.ozet||BOS[s[0]])+'</small></span>'+sag+'</button>';
  }).join('');
}
function panel(){
  var GUN=['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'],AY=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],d=new Date();
  var p=el('aside','mu-panel','<h2>Bugün Artvin\'de<small>'+d.getDate()+' '+AY[d.getMonth()]+' '+GUN[d.getDay()]+'</small></h2><div class="mu-sat"></div><div class="mu-kur"></div>');
  p.id='muPanel'; p.setAttribute('aria-label','Bugün Artvin\'de');
  ekle(p,hc,hc.firstChild);
  tasi(document.querySelector('#dovizBant .kur-sira'),p.querySelector('.mu-kur'));
  p.addEventListener('click',function(e){ var b=e.target.closest('.mu-bs'); if(b&&window.ARHikaye) window.ARHikaye.ac(+b.getAttribute('data-i')); });
  panelCiz(); document.addEventListener('hikaye-guncel',panelCiz);
}

var h1=hc.querySelector('.hero-sub'), h1Eski=h1?h1.innerHTML:'';
function kahraman(){
  if(h1){ h1.innerHTML='Artvin\'in <span>dijital rehberi</span>'; }
  var alt=el('p','mu-alt','Havaş saatleri, nöbetçi eczane, dolmuşlar, gezilecek yerler. Artvin\'de ihtiyacın olan her şey tek yerde.');
  ekle(alt,hc,h1?h1.nextSibling:null);
  tasi(document.querySelector('.arama-wrap'),hc,alt.nextSibling);
  var on=el('div','mu-oneri','<a href="/blog33.html">Borçka Karagöl</a><a href="/havas.html">Havaş saatleri</a><a href="/dolmus.html">İlçe dolmuşları</a><a href="/sarp-sinir-kapisi.html">Sarp sınır kapısı</a><a href="/oteller.html">Oteller</a><a href="/gezi.html">Gezilecek yerler</a>');
  var aw=hc.querySelector('.arama-wrap'); ekle(on,hc,aw?aw.nextSibling:null);
  var rf=document.getElementById('raflar');
  if(rf) ekle(el('h2','mu-dizin','Tüm rehberler<a href="/artvin-blog.html">Tüm yazılar</a>'),hc,rf);
}

function ac(){
  if(acik) return; acik=true;
  try{ ustBar(); panel(); kahraman(); KOK.classList.add('mu'); }catch(e){ kapa(); }
}
function kapa(){
  if(!acik) return; acik=false;
  KOK.classList.remove('mu');
  document.removeEventListener('click',kapatMenu); document.removeEventListener('keydown',escMenu); document.removeEventListener('hikaye-guncel',panelCiz);
  tasinan.reverse().forEach(function(t){ if(t[1].parentNode){ t[1].parentNode.insertBefore(t[0],t[1]); t[1].remove(); } }); tasinan=[];
  eklenen.forEach(function(n){ if(n.parentNode) n.parentNode.removeChild(n); }); eklenen=[];
  if(h1) h1.innerHTML=h1Eski;
}
function bak(){ if(MQ.matches) ac(); else kapa(); }
if(MQ.addEventListener) MQ.addEventListener('change',bak); else if(MQ.addListener) MQ.addListener(bak);
bak();
})();
