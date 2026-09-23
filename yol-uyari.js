/* Artvin Yol Durumu — canlı uyarı şeridi
   Kullanım: <script src="/yol-uyari.js" data-yollar="hopa-sarp,hopa-arhavi" defer></script>
   data-yollar verilmezse tüm yollara bakar. Sadece "kapalı" veya "dikkat" durumunda görünür. */
(function(){
  var betik = document.currentScript;
  var filtre = betik && betik.getAttribute('data-yollar');
  var ilgili = filtre ? filtre.split(',').map(function(s){return s.trim();}) : null;
  try{ if (sessionStorage.getItem('yolUyariKapat')==='1') return; }catch(e){}

  function yukle(src, cb){ var s=document.createElement('script'); s.src=src; s.onload=cb; document.head.appendChild(s); }
  function basla(){
    var Y=window.YOL; if(!Y) return;
    Y.restGetir().then(function(raporlar){
      var yollar = Y.YOLLAR.filter(function(y){ return !ilgili || ilgili.indexOf(y.id)>-1; });
      var sorun = yollar.map(function(y){ return {y:y, d:Y.durumHesapla(raporlar, y.id)}; })
                        .filter(function(o){ return o.d.kod==='kapali'||o.d.kod==='dikkat'; });
      if (!sorun.length) return;
      sorun.sort(function(a,b){ return (a.d.kod==='kapali'?0:1)-(b.d.kod==='kapali'?0:1); });
      var kapali = sorun.some(function(o){return o.d.kod==='kapali';});
      var metin, hedef;
      if (sorun.length===1){
        var o=sorun[0], r=o.d.rapor;
        metin = (o.d.kod==='kapali'?'⛔ ':'⚠️ ')+'<b>'+Y.esc(o.y.ad)+'</b> yolu '+(o.d.kod==='kapali'?'kapalı':'dikkat')+' bildirildi'+
                (r&&r.sebep&&Y.SEBEP[r.sebep]?' ('+Y.esc(Y.SEBEP[r.sebep].toLowerCase())+')':'')+' · '+Y.once(Y.zamanMs(r));
        hedef = '/yol-durumu.html?yol='+o.y.id;
      } else {
        metin = (kapali?'⛔ ':'⚠️ ')+'<b>'+sorun.length+' yolda sorun var:</b> '+sorun.slice(0,3).map(function(o){return Y.esc(o.y.kisa);}).join(', ');
        hedef = '/yol-durumu.html';
      }
      var renk = kapali ? ['#3a1414','#f25555','rgba(242,85,85,.45)'] : ['#3a2a0c','#f5a524','rgba(245,165,36,.45)'];
      var d = document.createElement('div');
      d.setAttribute('role','alert');
      d.style.cssText='position:relative;z-index:120;background:'+renk[0]+';border-bottom:1px solid '+renk[2]+';color:#fff;font:600 13px/1.4 system-ui,sans-serif;padding:10px 40px 10px 14px;padding-top:calc(10px + env(safe-area-inset-top,0px))';
      d.innerHTML = '<a href="'+hedef+'" style="color:#fff;text-decoration:none;display:block">'+metin+' <span style="color:'+renk[1]+';font-weight:800;white-space:nowrap">Canlı durum →</span></a>'+
        '<button aria-label="Kapat" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:0;color:rgba(255,255,255,.6);font-size:18px;cursor:pointer;padding:6px">✕</button>';
      d.querySelector('button').onclick=function(){ d.remove(); try{sessionStorage.setItem('yolUyariKapat','1');}catch(e){} };
      document.body.insertBefore(d, document.body.firstChild);
    }).catch(function(){});
  }
  if (window.YOL) basla(); else yukle('/yol-ortak.js', basla);
})();
