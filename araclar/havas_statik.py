"""Havaş saatleri değişince havas.html'in Google'ın gördüğü (statik) hâlini günceller.
Kaynak: havas-saat Worker (havas.net'ten çekiyor). Değişiklik yoksa sadece
'kontrol edildi' tarihini yeniler. Ağ hatasında sayfaya dokunmaz."""
import json, re, sys, datetime, urllib.request
SAYFA, KAYIT = 'havas.html', 'veri/havas-degisiklik.json'
URL = 'https://havas-saat.dreamdosima08.workers.dev/'
AY = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık']
AD = {'artvin':'Artvin Otogar','borcka':'Borçka','hopa':'Hopa','arhavi':'Arhavi','rize':'Rize Merkez','cayeli':'Çayeli',
      'ardesen':'Ardeşen','findikli':'Fındıklı','pazar':'Pazar','tip':'Tıp Fakültesi','gundogdu':'Gündoğdu',
      'of':'Of','kendirli':'Kalkandere','saraykoy':'Sarayköy','derepazari':'Derepazarı'}
ANA = ['artvin','borcka','hopa','arhavi']
bugun = (datetime.datetime.utcnow() + datetime.timedelta(hours=3)).date()
tarih_yazi = f'{bugun.day} {AY[bugun.month-1]} {bugun.year}'
try:
    if len(sys.argv) > 1: j = json.load(open(sys.argv[1]))  # test için
    else:
     req = urllib.request.Request(URL, headers={'Origin': 'https://www.artvinrehber.com', 'User-Agent': 'artvinrehber-guncelleyici'})
     j = json.load(urllib.request.urlopen(req, timeout=30))
    g = j.get('gidis') or (j.get('govde') or {}).get('gidis')
    assert g and all(g.get(k, {}).get('saatler') for k in ANA)
except Exception as e:
    print('Worker okunamadı, dokunulmadı:', e); sys.exit(0)
s = open(SAYFA, encoding='utf-8').read(); bas = s
deg = []  # (ad, eski, yeni)
def uygun(d): return d and d.get('hizmet') and d.get('saatler') and all(re.fullmatch(r'\d\d:\d\d', t) for t in d['saatler'])
def metin_degistir(eski, yeni):
    global s
    for ayr in (', ',):
        a, b = ayr.join(eski), ayr.join(yeni)
        if len(eski) >= 2: s = s.replace(a, b)
    if len(eski) >= 2:
        a = ', '.join(eski[:-1]) + ' ve ' + eski[-1]; b = ', '.join(yeni[:-1]) + ' ve ' + yeni[-1]
        s = s.replace(a, b)
    for f in (', '.join(yeni), ', '.join(yeni[:-1]) + ' ve ' + yeni[-1]):
        s = re.sub(r'günde \d+( sefer[^.:(]{0,40}[:(]\s*)' + re.escape(f), lambda mm: f'günde {len(yeni)}' + mm.group(1) + f, s)
# 1) Ana 4 durak: SEFERLER + saat kartları + fiyat rozeti
m = re.search(r'var SEFERLER = \{(.*?)\n\};', s, re.S)
for k in ANA:
    km = re.search(k + r': \[(.*?)\]', m.group(1), re.S)
    eski = re.findall(r"saat:'(\d\d:\d\d)'", km.group(1)); d = g[k]
    if not uygun(d) or eski == d['saatler']: continue
    yeni = d['saatler']; deg.append((AD[k], eski, yeni))
    blok = ',\n'.join(f"    {{saat:'{t}', ad:'{n+1}. Sefer'}}" for n, t in enumerate(yeni))
    s = s.replace(km.group(0), f"{k}: [\n{blok}\n  ]", 1)
    metin_degistir(eski, yeni)
# saat-grid'ler sayfadaki sırayla artvin, borcka, hopa, arhavi
gridler = list(re.finditer(r'(<div class="saat-grid">)(.*?)(\n      </div>\n      <a class="maps-btn")', s, re.S))
for k, gm in reversed(list(zip(ANA, gridler))):
    d = g[k]
    if not uygun(d): continue
    simdiki = re.findall(r'<div class="saat-deger">(\d\d:\d\d)</div>', gm.group(2))
    if simdiki == d['saatler']: continue
    ic = ''.join(f'\n        <div class="saat-kart">\n          <div class="saat-label">{n+1}. Sefer</div>\n          <div class="saat-deger">{t}</div>\n        </div>' for n, t in enumerate(d['saatler']))
    s = s[:gm.start(2)] + ic + s[gm.end(2):]
# 2) Diğer duraklar (data-hv)
def hv(mm):
    k = mm.group(2); d = g.get(k)
    if not uygun(d): return mm.group(0)
    eski = re.findall(r'\d\d:\d\d', mm.group(3))
    yeni_ic = ' · '.join(d['saatler']) + (f' · <b style="color:#34d399">{d["fiyat"]} ₺</b>' if d.get('fiyat') else '')
    if eski != d['saatler']:
        deg.append((AD.get(k, k), eski, d['saatler'])); sonra.append((eski, d['saatler']))
    return mm.group(1) + yeni_ic + mm.group(4)
sonra = []
s = re.sub(r'(<div data-hv="([a-z]+)"[^>]*>)(.*?)(</div>)', hv, s)
for e_, y_ in sonra: metin_degistir(e_, y_)
# 3) Tarihler
s = re.sub(r'(Fiyatlar ve sefer saatleri kontrol edildi · )(?:<time datetime="[^"]*">[^<]*</time>|[^<]*)', lambda mm: mm.group(1) + f'<time datetime="{bugun.isoformat()}">{tarih_yazi}</time>', s, count=1)
s = re.sub(r'(Havaş verisiyle )\d+ \S+ \d{4}( tarihinde kontrol edildi)', lambda mm: mm.group(1) + tarih_yazi + mm.group(2), s, count=1)
kayit = {}
try: kayit = json.load(open(KAYIT, encoding='utf-8'))
except Exception: pass
if deg:
    kayit = {'tarih': bugun.isoformat(), 'yazi': tarih_yazi, 'degisiklik': [{'durak': a, 'eski': e, 'yeni': y} for a, e, y in deg]}
    json.dump(kayit, open(KAYIT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    s = re.sub(r'"dateModified": *"[^"]*"', f'"dateModified": "{bugun.isoformat()}"', s, count=1)
    s = re.sub(r'(Son güncelleme: <time datetime=")[^"]*(">)[^<]*', lambda mm: mm.group(1) + bugun.isoformat() + mm.group(2) + tarih_yazi, s)
    s = re.sub(r'(<meta name="description" content="[^"]*?)(?: Saatler \d+ \S+ \d{4} tarihinde güncellendi\.)?(">)',
               lambda mm: mm.group(1) + f' Saatler {tarih_yazi} tarihinde güncellendi.' + mm.group(2), s, count=1)
# 4) "Saatler değişti" kutusu (14 gün görünür)
kutu = ''
if kayit.get('tarih') and (bugun - datetime.date.fromisoformat(kayit['tarih'])).days <= 14:
    ARTVIN = {'Artvin Otogar', 'Borçka', 'Hopa', 'Arhavi'}
    ad = lambda x: AD.get(x, x)
    ana = [c for c in kayit['degisiklik'] if ad(c['durak']) in ARTVIN]
    diger = [ad(c['durak']) for c in kayit['degisiklik'] if ad(c['durak']) not in ARTVIN]
    satir = ''.join(f'<li><b>{ad(c["durak"])}:</b> <s style="opacity:.55">{" · ".join(c["eski"])}</s> → <b style="color:#f0c040">{" · ".join(c["yeni"])}</b></li>' for c in ana)
    if diger: satir += f'<li style="opacity:.8">Rize tarafındaki {len(diger)} durağın saatleri de değişti ({", ".join(diger)}); güncel hâlleri aşağıdaki tabloda.</li>'
    kutu = ('<div style="margin:.9rem max(1rem,calc(50% - 320px)) 0;padding:.85rem 1rem;border-radius:14px;background:rgba(240,192,64,.1);'
            'border:1px solid rgba(240,192,64,.45);color:#fff;font-size:.82rem;line-height:1.55;text-align:left">'
            f'<div style="font-weight:800;color:#f0c040;margin-bottom:.35rem">🔔 Havaş saatleri {kayit["yazi"]} tarihinde değişti</div>'
            f'<ul style="margin:0;padding-left:1.1rem">{satir}</ul></div>')
s = re.sub(r'<!--HV-DEGISIKLIK-->.*?<!--/HV-DEGISIKLIK-->', lambda mm: '<!--HV-DEGISIKLIK-->' + kutu + '<!--/HV-DEGISIKLIK-->', s, count=1, flags=re.S)
if s != bas:
    open(SAYFA, 'w', encoding='utf-8').write(s)
print('Değişen durak:', len(deg), [d[0] for d in deg] or '-', '| kontrol tarihi:', tarih_yazi)
