# -*- coding: utf-8 -*-
"""hava.html'den yere özel hava durumu sayfaları üretir.
Çalıştır:  python3 araclar/yer_hava_uret.py   (Sidoma klasöründe)
hava.html değişirse bu betiği yeniden çalıştırmak yeterli."""
import re, json, html, os

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KAYNAK = open(os.path.join(KOK, 'hava.html'), encoding='utf-8').read()
TARIH = '2026-10-02'

def e(s): return html.escape(s, quote=True)

YERLER = [
 dict(dosya='macahel-hava-durumu.html', yer='macahel', ad='Macahel',
  title='Macahel Hava Durumu — Saatlik ve 7 Günlük Tahmin, Kar ve Yol Bilgisi',
  desc="Macahel (Camili) hava durumu: saatlik yağış ihtimali, 7 günlük tahmin, sıcaklık ve rüzgar. Kışın Macahel Geçidi'nde kar ve yol durumu, Borçka'dan ulaşım bilgisi.",
  kw='macahel hava durumu, camili hava durumu, borçka macahel hava durumu, macahel yolu açık mı, macahel geçidi kar, macahel 7 günlük hava durumu',
  geo=(41.3667, 42.0333),
  kartlar=[('📍','Konum',"Borçka'ya bağlı Camili havzası, Gürcistan sınırında"),
           ('🛣️','Borçka\'ya uzaklık','Yaklaşık 50–55 km dağ yolu'),
           ('⛰️','Macahel Geçidi','Yaklaşık 1850 m, Karadeniz nemine açık'),
           ('🌿','Statü',"Türkiye'nin ilk UNESCO Biyosfer Rezervi (2005)")],
  uyari="Bu tahmin Camili köyü içindir (vadi tabanı). Yoldaki <b>Macahel Geçidi yaklaşık 1850 metrede</b> olduğu için orada hava çok daha soğuk ve karlı olabilir.",
  makale=[('Kışın Macahel yolu',"Macahel yolu kış aylarında <b>genellikle kapalıdır</b>. Sık sık açılsa da kapanmaya meyillidir. Bunun nedeni, yaklaşık 1850 metredeki Macahel Geçidi'nin Karadeniz'in nemli havasına doğrudan açık olmasıdır; geçitte kar birikimi çok ciddi miktarlara ulaşabilir. Kışın yola çıkmadan mutlaka güncel yol bilgisi alın."),
          ('Neden bu kadar yağış alır?',"Macahel, üç tarafı yüksek dağlarla çevrili, Karadeniz'e bakan bir vadidir. Denizden gelen nemli hava dağlara çarparak yağışa dönüşür. Bu yüzden vadi yemyeşildir ve yılın büyük bölümünde sisli, yağışlı günler görülür.")],
  sss=[('Macahel yolu kışın açık mı?',"Macahel yolu kış aylarında genellikle kapalıdır; sık sık açılsa da kapanmaya meyillidir. Macahel Geçidi yaklaşık 1850 metrede ve Karadeniz'in nemli havasına açık olduğu için geçitte çok kar birikir. Yola çıkmadan güncel yol durumuna bakın."),
       ('Macahel nerede?',"Macahel, Artvin'in Borçka ilçesine bağlı Camili havzasıdır. Gürcistan sınırındadır ve Borçka'ya yaklaşık 50–55 km dağ yoluyla bağlanır."),
       ('Bu sayfadaki Macahel hava durumu nereyi gösteriyor?',"Tahmin Camili köyü için hesaplanır. Yol üzerindeki Macahel Geçidi çok daha yüksekte olduğu için geçitte sıcaklık daha düşük ve kar ihtimali daha yüksektir.")],
  linkler=[('/blog44-macahel-camili.html','🌿','Macahel rehberi'),('/yol-borcka-camili.html','🚧','Borçka–Macahel yolu'),('/blog56-artvin-kis-rehberi.html#yollar','❄️','Kış yol rehberi'),('/hava.html','⛅','Tüm Artvin hava durumu')],
  secenek=[('macahel','Macahel (Camili)'),('borcka','Borçka')]),

 dict(dosya='karagol-hava-durumu.html', yer='borcka-karagol', ad='Karagöl',
  title='Karagöl Hava Durumu — Borçka ve Şavşat Karagöl Saatlik, 7 Günlük Tahmin',
  desc="Artvin Karagöl hava durumu: Borçka Karagöl ve Şavşat Karagöl için saatlik yağış ihtimali, 7 günlük tahmin, sıcaklık ve rüzgar. Göle gitmeden önce yol ve ulaşım bilgisi.",
  kw='karagöl hava durumu, borçka karagöl hava durumu, artvin karagöl hava durumu, şavşat karagöl hava durumu, karagöl artvin hava durumu, karagöl 7 günlük hava durumu',
  geo=(41.2989, 41.7156),
  kartlar=[('🏞️','İki Karagöl var',"Borçka Karagöl ve Şavşat Karagöl ayrı yerlerdir"),
           ('🛣️','Borçka\'dan uzaklık','Borçka Karagöl\'e yaklaşık 23 km'),
           ('🚕','Ulaşım','Borçka\'dan toplu taşıma yok; taksi veya kiralık minibüs'),
           ('🎟️','Giriş','Tabiat parkına giriş araç başına ücretli')],
  uyari="Artvin'de iki Karagöl var. Aşağıdaki düğmelerle <b>Borçka Karagöl</b> ve <b>Şavşat Karagöl</b> arasında geçiş yapabilirsiniz.",
  makale=[('Borçka Karagöl\'e gitmeden önce',"Borçka Karagöl, Borçka ilçe merkezine yaklaşık 23 km uzaklıktadır ve göle toplu taşıma yoktur; taksiyle ya da kalabalık gruplar için kooperatiften kiralanan şoförlü minibüsle gidilir. Karagöl Tabiat Parkı'na giriş araç başına ücretlidir. Yol virajlı ve ormanlıktır; yağışlı havalarda sis ve kaygan zemine dikkat edin."),
          ('Hangi Karagöl?',"Google'da \"Artvin Karagöl\" diye aranan yer çoğunlukla Borçka Karagöl'dür. Şavşat Karagöl ise Şavşat ilçesindedir ve daha iç kesimde, karasal iklimin etkisindedir. Gideceğiniz gölü yukarıdan seçerek doğru tahmine bakın.")],
  sss=[('Artvin Karagöl hava durumu nereden bakılır?',"Bu sayfada Borçka Karagöl ve Şavşat Karagöl için saatlik yağış ihtimali ve 7 günlük tahmin yer alır. Sayfanın üstündeki düğmelerle iki göl arasında geçiş yapabilirsiniz."),
       ('Borçka Karagöl\'e nasıl gidilir?',"Borçka Karagöl, Borçka merkezine yaklaşık 23 km uzaklıktadır. Toplu taşıma bulunmaz; taksi veya kooperatiften kiralanan minibüsle gidilir. Tabiat parkına giriş araç başına ücretlidir."),
       ('Borçka Karagöl ile Şavşat Karagöl aynı yer mi?',"Hayır. Borçka Karagöl Borçka ilçesinde, Şavşat Karagöl ise Şavşat ilçesindedir. İki göl farklı iklim bölgelerinde olduğu için hava durumları da farklıdır.")],
  linkler=[('/blog33.html','🏞️','Borçka Karagöl ulaşım'),('/blog34.html','🌲','Şavşat Karagöl ulaşım'),('/yol-artvin-borcka.html','🚧','Artvin–Borçka yolu'),('/hava.html','⛅','Tüm Artvin hava durumu')],
  secenek=[('borcka-karagol','Borçka Karagöl'),('savsat-karagol','Şavşat Karagöl')]),

 dict(dosya='kafkasor-hava-durumu.html', yer='kafkasor', ad='Kafkasör',
  title='Kafkasör Yaylası Hava Durumu — Saatlik ve 7 Günlük Tahmin, Atabarı Yolu',
  desc="Kafkasör Yaylası hava durumu: saatlik yağış ihtimali, 7 günlük tahmin, sıcaklık ve rüzgar. Artvin merkezine yaklaşık 8 km; kışın Atabarı Kayak Merkezi yolu ve festival bilgisi.",
  kw='kafkasör hava durumu, kafkasör yaylası hava durumu, artvin kafkasör hava durumu, atabarı hava durumu, kafkasör yolu açık mı, kafkasör 7 günlük hava durumu',
  geo=(41.1950, 41.7350),
  kartlar=[('📍','Konum','Artvin merkezine yaklaşık 8 km'),
           ('⛷️','Kışın yol','Atabarı Kayak Merkezi yolu üzerinde, açık tutulur'),
           ('❄️','Dikkat','Kışın yolda kar ve buzlanma görülür'),
           ('🐂','Festival','Kafkasör Festivali her yaz Temmuz ayında')],
  uyari="Kafkasör, şehir merkezinden daha yüksekte olduğu için genellikle birkaç derece <b>daha serindir</b>. Yukarıdan Atabarı Kayak Merkezi'nin tahminine de geçebilirsiniz.",
  makale=[('Kışın Kafkasör',"Kafkasör Yaylası, Artvin'in tek kayak merkezi olan Mersivan'daki Atabarı Kayak Merkezi'nin yolu üzerindedir. Bu yüzden kışın yol <b>sürekli açık tutulur</b>. Yine de kar ve buzlanma görülür; zincir ve kış lastiği kendi güvenliğiniz için araçta bulunmalı. Atabarı kar yağdığı gibi açılır, girişi ücretsizdir."),
          ('Yazın Kafkasör',"Yaz, yayla ve festival mevsimidir. Kafkasör Kültür, Turizm ve Sanat Festivali her yıl Temmuz ayında yaylada düzenlenir ve boğa güreşleriyle ünlüdür. Festival günlerinde yolda yoğun trafik oluşur; erken çıkmak iyi olur.")],
  sss=[('Kafkasör yolu kışın açık mı?',"Kafkasör Yaylası, Atabarı Kayak Merkezi'nin yolu üzerinde olduğu için kışın sürekli açık tutulur. Ancak yolda kar ve buzlanma görülebilir; zincir ve kış lastiği bulundurun."),
       ('Kafkasör Artvin merkeze ne kadar uzak?',"Kafkasör Yaylası Artvin merkezine yaklaşık 8 kilometre uzaklıktadır."),
       ('Kafkasör şehirden daha mı soğuk?',"Evet. Yayla şehir merkezinden daha yüksekte olduğu için genellikle birkaç derece daha serindir ve hava daha değişkendir.")],
  linkler=[('/yol-artvin-kafkasor.html','🚧','Kafkasör yolu açık mı?'),('/blog43-kafkasor-festivali.html','🐂','Kafkasör Festivali'),('/blog56-artvin-kis-rehberi.html#kayak','⛷️','Atabarı kayak bilgisi'),('/hava.html','⛅','Tüm Artvin hava durumu')],
  secenek=[('kafkasor','Kafkasör Yaylası'),('atabari','Atabarı Kayak'),('merkez','Artvin Merkez')]),
]

EK_CSS = '''
/* yere özel sayfa */
.yer-gizli{display:none}
.yer-sec{display:flex;gap:.45rem;flex-wrap:wrap;justify-content:center;margin:.9rem 0 .2rem}
.yer-not{margin-top:.9rem;font-size:.82rem;line-height:1.5;color:var(--dim);background:var(--cam);border:1px solid var(--kenar);border-left:3px solid var(--gold);border-radius:14px;padding:.75rem .9rem}
.yer-not b{color:#fff}
.kunye{display:grid;grid-template-columns:1fr 1fr;gap:.55rem}
.kunye div{background:var(--cam);border:1px solid var(--kenar);border-radius:16px;padding:.75rem .8rem;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
.kunye i{font-style:normal;font-size:1.2rem}
.kunye b{display:block;font-size:.66rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--soluk);margin:.25rem 0 .15rem}
.kunye span{font-size:.84rem;line-height:1.35}
.tum-link{display:block;text-align:center;margin-top:.8rem;font-size:.8rem;color:var(--gold);font-weight:600}
'''

def uret(c):
    t = KAYNAK
    url = 'https://www.artvinrehber.com/' + c['dosya']
    # head
    t = re.sub(r'<title>.*?</title>', '<title>%s</title>' % e(c['title']), t, 1)
    t = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="%s">' % e(c['desc']), t, 1)
    t = re.sub(r'<meta name="keywords" content="[^"]*">', '<meta name="keywords" content="%s">' % e(c['kw']), t, 1)
    t = t.replace('<link rel="canonical" href="https://www.artvinrehber.com/hava.html">', '<link rel="canonical" href="%s">' % url)
    t = re.sub(r'<meta property="og:title" content="[^"]*">', '<meta property="og:title" content="%s">' % e(c['title']), t, 1)
    t = re.sub(r'<meta property="og:description" content="[^"]*">', '<meta property="og:description" content="%s">' % e(c['desc']), t, 1)
    t = t.replace('<meta property="og:url" content="https://www.artvinrehber.com/hava.html">', '<meta property="og:url" content="%s">' % url)
    la, lo = c['geo']
    t = re.sub(r'<meta name="geo.position" content="[^"]*">', '<meta name="geo.position" content="%s;%s">' % (la, lo), t, 1)
    t = re.sub(r'<meta name="ICBM" content="[^"]*">', '<meta name="ICBM" content="%s, %s">' % (la, lo), t, 1)
    t = re.sub(r'<meta name="geo.placename" content="[^"]*">', '<meta name="geo.placename" content="%s, Artvin">' % e(c['ad']), t, 1)
    # JSON-LD: hepsini kaldır, yenilerini ekle
    t = re.sub(r'<script type="application/ld\+json">.*?</script>\s*', '', t, flags=re.S)
    ld = [
      {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}} for q,a in c['sss']]},
      {"@context":"https://schema.org","@type":"WebPage","name":c['ad']+" Hava Durumu","url":url,"inLanguage":"tr","dateModified":TARIH,"datePublished":TARIH,
       "about":{"@type":"Place","name":c['ad'],"address":{"@type":"PostalAddress","addressRegion":"Artvin","addressCountry":"TR"},"geo":{"@type":"GeoCoordinates","latitude":la,"longitude":lo}}},
      {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
        {"@type":"ListItem","position":1,"name":"Ana Sayfa","item":"https://www.artvinrehber.com/"},
        {"@type":"ListItem","position":2,"name":"Artvin Hava Durumu","item":"https://www.artvinrehber.com/hava.html"},
        {"@type":"ListItem","position":3,"name":c['ad']+" Hava Durumu","item":url}]}]
    lds = ''.join('<script type="application/ld+json">%s</script>\n' % json.dumps(x, ensure_ascii=False) for x in ld)
    t = t.replace('</head>', lds + '</head>', 1)
    t = t.replace('</style>', EK_CSS + '</style>', 1)
    # üstteki büyük yer çubuklarını gizle (kod çalışmaya devam etsin diye silmiyoruz)
    t = t.replace('<div class="yer-grup">İlçeler</div>', '<div class="yer-gizli"><div class="yer-grup">İlçeler</div>', 1)
    t = t.replace('<div class="yer-bar" id="barDoga" role="tablist" aria-label="Yayla veya doğa noktası seç"></div>',
                  '<div class="yer-bar" id="barDoga" role="tablist" aria-label="Yayla veya doğa noktası seç"></div></div>', 1)
    # h1
    assert '<h1>Artvin Hava Durumu</h1>' in t
    t = t.replace('<h1>Artvin Hava Durumu</h1>', '<h1>%s Hava Durumu</h1>' % e(c['ad']), 1)
    # yer seçici + not: hero bitince
    sec = '<div class="yer-sec">' + ''.join('<button class="yb" data-id="%s">%s</button>' % (i, e(a)) for i, a in c['secenek']) + '</div>'
    kartlar = '<div class="kunye">' + ''.join('<div><i>%s</i><b>%s</b><span>%s</span></div>' % (ik, e(b), e(s)) for ik, b, s in c['kartlar']) + '</div>'
    blok = sec + '<div class="yer-not">%s</div>' % c['uyari']
    assert '<div class="uyarilar" id="uyarilar"></div>' in t
    t = t.replace('<div class="uyarilar" id="uyarilar"></div>', blok + '\n  <div class="uyarilar" id="uyarilar"></div>', 1)
    # "Yola Çıkmadan" bağlantıları → yere özel
    t = re.sub(r'<section class="sec">\s*<div class="sec-b"><h2>Yola Çıkmadan</h2></div>\s*<div class="baglanti">.*?</div>\s*</section>',
               '<section class="sec">\n    <div class="sec-b"><h2>%s: Bilmeniz Gerekenler</h2></div>\n    %s\n  </section>\n\n  <section class="sec">\n    <div class="sec-b"><h2>Yola Çıkmadan</h2></div>\n    <div class="baglanti">%s</div>\n  </section>'
               % (e(c['ad']), kartlar, ''.join('<a href="%s"><span>%s</span>%s</a>' % (h, ik, e(a)) for h, ik, a in c['linkler'])), t, 1, flags=re.S)
    # İklim makalesi + SSS → yere özel
    mak = ''.join('<h3>%s</h3><p>%s</p>' % (e(b), p) for b, p in c['makale'])
    t = re.sub(r'<section class="sec">\s*<div class="sec-b"><h2>Artvin\'in İklimi</h2></div>\s*<article class="makale">.*?</article>\s*</section>',
               '<section class="sec">\n    <div class="sec-b"><h2>%s Hakkında</h2></div>\n    <article class="makale">%s</article>\n  </section>' % (e(c['ad']), mak), t, 1, flags=re.S)
    sss = ''.join('<details class="q"><summary>%s</summary><p>%s</p></details>' % (e(q), e(a)) for q, a in c['sss'])
    t = re.sub(r'(<div class="sec-b"><h2>Sıkça Sorulan Sorular</h2></div>\s*<div class="makale">).*?(</div>\s*</section>\s*</div>\s*<footer>)',
               lambda m: m.group(1) + sss + '<a class="tum-link" href="/hava.html">Artvin\'in tüm ilçeleri ve yaylaları için hava durumu ›</a>' + m.group(2), t, 1, flags=re.S)
    # footer
    t = t.replace('Artvin Hava Durumu · <time datetime="2026-09-25">Son güncelleme: 25 Eylül 2026</time>',
                  '%s Hava Durumu · <time datetime="%s">Son güncelleme: 2 Ekim 2026</time>' % (e(c['ad']), TARIH))
    # JS: varsayılan yer + ilçe kartları hava.html'e gitsin
    t = t.replace("var b = e.target.closest('.yb[data-id],.ik[data-id]'); if (!b) return;", "var b = e.target.closest('.yb[data-id]'); if (!b) return;", 1)
    t = t.replace("href=\"?yer='+y.id+'\"", "href=\"/hava.html?yer='+y.id+'\"", 1)
    t = t.replace("history.replaceState(null,'', y.id==='merkez' ? location.pathname : '?yer='+y.id);",
                  "history.replaceState(null,'', y.id==='%s' ? location.pathname : '?yer='+y.id);" % c['yer'], 1)
    t = t.replace("YERLER.some(function(y){return y.id===p;}) ? p : 'merkez', false);",
                  "YERLER.some(function(y){return y.id===p;}) ? p : '%s', false);" % c['yer'], 1)
    for chk in ["'.yb[data-id]'", "'%s', false);" % c['yer'], '/hava.html?yer=']:
        assert chk in t, (c['dosya'], chk)
    open(os.path.join(KOK, c['dosya']), 'w', encoding='utf-8').write(t)
    print('yazıldı', c['dosya'])

for c in YERLER: uret(c)
