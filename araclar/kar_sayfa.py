"""Kar sayfasını (artvin-kar-ne-zaman-yagacak.html) ve hava sayfasındaki kar kutusunu
güncel tahmin + yönetici notuyla doldurur. Google'ın okuduğu kalıcı metin budur; ziyaretçi tarafında
aynı veriler sayfa açılınca kar-veri.js ile canlı yenilenir. GitHub Actions'ta 3 saatte bir çalışır.
Noktalar ve eşik kar-veri.js ile aynı olmalı."""
import json, re, html, datetime, urllib.request, urllib.parse, sys

YER = [
  ('merkez', 'Artvin merkez', 41.1828, 41.8183, 550),
  ('kafkasor', 'Kafkasör Yaylası', 41.1633, 41.7946, 1250),
  ('atabari', 'Atabarı Kayak Merkezi', 41.1404, 41.7680, 1800),
  ('savsat', 'Şavşat', 41.2444, 42.3667, 1000),
  ('ardanuc', 'Ardanuç', 41.127, 42.061, 500),
  ('yusufeli', 'Yusufeli', 40.8167, 41.5333, 720),
  ('macahel', 'Macahel Geçidi (yol)', 41.4166, 41.8531, 1850),
  ('borcka_karagol', 'Borçka Karagöl', 41.3852, 41.8542, 1450),
  ('savsat_karagol', 'Şavşat Karagöl', 41.3081, 42.4840, 1600),
]
ESIK = 0.5
AY = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara']
AYU = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık']
GUN = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz']
e = lambda s: html.escape(str(s), quote=True)
TR = datetime.timezone(datetime.timedelta(hours=3))
simdi = datetime.datetime.now(TR)

def gun_yaz(t):
    d = datetime.date.fromisoformat(t); return '%d %s %s' % (d.day, AY[d.month-1], GUN[d.weekday()])
def cm(x):
    return '<1' if x < 1 else ('%.1f' % x).replace('.0', '').replace('.', ',')

def getir(u, t=40):
    req = urllib.request.Request(u, headers={'User-Agent': 'artvinrehber-kar/1.0'})
    with urllib.request.urlopen(req, timeout=t) as r: return json.loads(r.read().decode())

u = ('https://api.open-meteo.com/v1/forecast?latitude=' + ','.join(str(y[2]) for y in YER) + '&longitude=' + ','.join(str(y[3]) for y in YER) +
     '&elevation=' + ','.join(str(y[4]) for y in YER) + '&daily=snowfall_sum,temperature_2m_min,temperature_2m_max,precipitation_probability_max&forecast_days=16&timezone=Europe%2FIstanbul')
try:
    A = getir(u); A = A if isinstance(A, list) else [A]
except Exception as ex:
    print('Tahmin alınamadı, sayfaya dokunulmadı:', ex); sys.exit(0)
L = []
for (k, ad, la, lo, m), a in zip(YER, A):
    d = a['daily']; gunler = [dict(t=t, cm=d['snowfall_sum'][i] or 0, mn=d['temperature_2m_min'][i]) for i, t in enumerate(d['time'])]
    ilk = next((g for g in gunler if g['cm'] >= ESIK), None)
    L.append(dict(k=k, ad=ad, m=m, gunler=gunler, ilk=ilk, top=sum(g['cm'] for g in gunler)))

# yönetici notu
NOT, NOTZ = '', None
try:
    f = getir('https://firestore.googleapis.com/v1/projects/artvin-imece/databases/(default)/documents/site_notlar/kar?key=AIzaSyDPPh1T_PLdfbuQdYbP-HXrnc3a5Nb1nzI').get('fields', {})
    NOT = (f.get('metin', {}).get('stringValue') or '').strip()
    z = f.get('zaman', {}); z = z.get('integerValue') or z.get('doubleValue')
    if z: NOTZ = datetime.datetime.fromtimestamp(int(float(z))/1000, TR)
except Exception as ex:
    print('Not okunamadı (yok olabilir):', ex)

def zaman_yaz(dt): return '%d %s %02d:%02d' % (dt.day, AYU[dt.month-1], dt.hour, dt.minute)

# kısa cevap
mer = L[0]; vars_ = [x for x in L if x['ilk']]
if not vars_:
    kisa = "Önümüzdeki 16 günde Artvin'de, yüksek yaylalar dahil, kayda değer kar yağışı beklenmiyor."
else:
    kisa = ('Artvin merkezde ilk kar <b>%s</b> günü bekleniyor (~%s cm).' % (gun_yaz(mer['ilk']['t']), cm(mer['ilk']['cm']))) if mer['ilk'] else "Önümüzdeki 16 günde Artvin şehir merkezinde kar beklenmiyor."
    y = sorted([x for x in vars_ if x['k'] != 'merkez'], key=lambda x: x['ilk']['t'])
    if y: kisa += ' En erken kar <b>%s</b> için <b>%s</b> görünüyor.' % (e(y[0]['ad']), gun_yaz(y[0]['ilk']['t']))
kisa_duz = re.sub(r'<[^>]+>', '', kisa)
tarih = '%d %s %d, %02d:%02d' % (simdi.day, AYU[simdi.month-1], simdi.year, simdi.hour, simdi.minute)
OZET = '<p>%s</p><div class="gun">Tahmin: %s</div>' % (kisa, tarih)
NOTH = ('<small>📝 Artvin Rehberi\'nin notu</small><p>%s</p>%s' % (e(NOT), ('<div class="gun">Güncellendi: %s</div>' % zaman_yaz(NOTZ)) if NOTZ else '')) if NOT else ''
satir = ''
for x in L:
    g = ''
    for d in x['gunler']:
        c = 'g k2' if d['cm'] >= 5 else ('g k' if d['cm'] >= ESIK else 'g')
        ik = '❄️' if d['cm'] >= ESIK else ('🥶' if d['mn'] <= 0 else '·')
        b = cm(d['cm']) if d['cm'] >= ESIK else '%d°' % round(d['mn'])
        g += '<div class="%s">%d<i>%s</i><b>%s</b></div>' % (c, int(d['t'][8:]), ik, b)
    ilk = ('❄️ %s<em>ilk kar · ~%s cm</em>' % (gun_yaz(x['ilk']['t']), cm(x['ilk']['cm']))) if x['ilk'] else 'Kar yok<em>16 gün</em>'
    rk = '~%s m' % format(x['m'], ',').replace(',', '.') + ((' · 16 günde toplam ~%s cm' % cm(x['top'])) if x['top'] >= ESIK else '')
    satir += ('<div class="sat" data-k="%s"><button type="button" aria-expanded="false"><span><b>%s</b><span class="rk">%s</span></span><span class="ilk %s">%s</span></button>'
              '<div class="serit"><div class="gunler">%s</div></div></div>') % (x['k'], e(x['ad']), rk, 'var' if x['ilk'] else 'yok', ilk, g)

ilkler = '; '.join('%s: %s' % (x['ad'], (gun_yaz(x['ilk']['t']) + ', ~' + cm(x['ilk']['cm']) + ' cm') if x['ilk'] else '16 günde kar yok') for x in L)
SSS = [
  ("Artvin'e kar ne zaman yağacak?", kisa_duz + (' Yerel not: ' + NOT if NOT else '') + ' (Tahmin tarihi: %s.)' % tarih),
  ("Kafkasör ve Atabarı'na kar ne zaman yağacak?", 'Güncel 16 günlük tahmine göre ' + '; '.join('%s: %s' % (x['ad'], (gun_yaz(x['ilk']['t']) + ' (~' + cm(x['ilk']['cm']) + ' cm)') if x['ilk'] else '16 günde kar beklenmiyor') for x in L if x['k'] in ('kafkasor', 'atabari')) + '. Kafkasör yaklaşık 1.250, Atabarı yaklaşık 1.800 metrede olduğu için şehirden önce kar alır.'),
  ("Artvin'de ilk kar genelde ne zaman düşer?", "Yerel gözlemlere göre yüksek yaylalara Ekim–Kasım'da, şehir merkezine ise genellikle Kasım ortasından sonra ilk kar düşer. Ana kar dönemi Aralık–Şubat'tır; son yıllarda kar daha çok Ocak–Şubat'a kaymıştır."),
  ("Artvin'de kar ne kadar yağar, ne kadar kalır?", "Şehir merkezinde (yaklaşık 550 m) iyi soğuk yapan yıllarda 1–1,5 metre kar yağdığı görülür ama kar çoğunlukla on gün yerde kalmaz. Şavşat (1.000 m), Kafkasör (1.250 m) ve Atabarı (1.800 m) gibi yüksek yerlerde kar daha erken başlar ve uzun kalır."),
  ("Kar yağınca hangi yollar kapanır?", "Artvin–Ardahan yolundaki Sahara Geçidi, Macahel Geçidi ve Cankurtaran kar yağınca ilk kapanan yollardır. Yola çıkmadan canlı yol durumuna bakmak, zincir ve kış lastiği bulundurmak gerekir."),
]
sss_html = ''.join('<details><summary><h3>%s</h3></summary><p>%s</p></details>' % (e(q), e(a)) for q, a in SSS)
iso = simdi.isoformat(timespec='minutes')
LD = ('<script type="application/ld+json">' + json.dumps({"@context": "https://schema.org", "@type": "Article", "headline": "Artvin'e Kar Ne Zaman Yağacak? 16 Günlük Kar Tahmini",
      "description": kisa_duz, "url": "https://www.artvinrehber.com/artvin-kar-ne-zaman-yagacak.html", "image": "https://www.artvinrehber.com/kis-mahalle-kar.jpg",
      "datePublished": "2026-11-03", "dateModified": iso, "inLanguage": "tr-TR",
      "author": {"@type": "Person", "name": "Onur Demir", "url": "https://www.artvinrehber.com/hakkimizda.html"},
      "publisher": {"@type": "Organization", "name": "Artvin Rehberi", "url": "https://www.artvinrehber.com", "logo": {"@type": "ImageObject", "url": "https://www.artvinrehber.com/icon-192.png"}}}, ensure_ascii=False) + '</script>\n'
      '<script type="application/ld+json">' + json.dumps({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in SSS]}, ensure_ascii=False) + '</script>')

def koy(s, ad, icerik):
    s2, n = re.subn(r'(<!--%s-->).*?(<!--/%s-->)' % (ad, ad), lambda m: m.group(1) + icerik + m.group(2), s, count=1, flags=re.S)
    if n != 1: sys.exit('İşaret bulunamadı: ' + ad)
    return s2

def yaz(yol, s_yeni, s_eski):
    # sadece saat damgası değiştiyse yazma (gereksiz commit olmasın)
    temiz = lambda s: re.sub(r'Tahmin: [^<]*|"dateModified": "[^"]*"|Son güncelleme: [^<]*|\(Tahmin tarihi: [^)]*\)', '', s)
    if temiz(s_yeni) != temiz(s_eski):
        open(yol, 'w', encoding='utf-8').write(s_yeni); print('Güncellendi:', yol); return True
    print('Değişiklik yok:', yol); return False

P = 'artvin-kar-ne-zaman-yagacak.html'
s = open(P, encoding='utf-8').read(); eski = s
s = koy(s, 'KAR-LD', LD); s = koy(s, 'KAR-OZET', OZET); s = koy(s, 'KAR-NOT', NOTH); s = koy(s, 'KAR-TABLO', satir)
s = koy(s, 'KAR-SSS', sss_html); s = koy(s, 'KAR-TARIH', 'Son güncelleme: ' + tarih + '.')
s = re.sub(r'<div class="not" id="not"( hidden)?>', '<div class="not" id="not"%s>' % ('' if NOT else ' hidden'), s, count=1)
yaz(P, s, eski)

# hava sayfası kutusu
H = 'hava.html'
h = open(H, encoding='utf-8').read(); eski = h
not_kisa = (NOT[:220] + ('…' if len(NOT) > 220 else '')) if NOT else ''
KUTU = ('<a class="kar-kutu" href="/artvin-kar-ne-zaman-yagacak.html"><span class="kk-ust">❄️ Artvin\'e kar ne zaman yağacak?</span>'
        '<span class="kk-cevap" id="kkCevap">%s</span>%s<span class="kk-git">16 günlük kar tahmini ve yerel not →</span></a>') % (kisa, ('<span class="kk-not" id="kkNot">📝 %s</span>' % e(not_kisa)) if not_kisa else '<span class="kk-not" id="kkNot" hidden></span>')
h = koy(h, 'KAR-KUTU', KUTU)
yaz(H, h, eski)
