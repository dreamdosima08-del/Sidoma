# -*- coding: utf-8 -*-
"""Artvin köylerinin koordinatları: önce Wikidata, bulunamazsa OpenStreetMap (Nominatim).
Girdi: koyler.html içindeki KOYLER listesi. Çıktı: veri/koy-konum.json"""
import json, re, time, urllib.request, urllib.parse, math, os

UA = {'User-Agent': 'artvinrehber.com koy-konum (artvinsehirrehberi@gmail.com)'}
html = open('koyler.html', encoding='utf-8').read()
blok = re.search(r'const KOYLER = \{(.*?)\n\};', html, re.S).group(1)
KOYLER = {m.group(1): json.loads('[' + m.group(2) + ']') for m in re.finditer(r'"([^"]+)":\[(.*?)\]', blok)}
MERKEZ = {'Merkez': (41.1828, 41.8183), 'Ardanuç': (41.127, 42.061), 'Arhavi': (41.3528, 41.2978), 'Borçka': (41.3667, 41.6833),
          'Hopa': (41.4119, 41.4239), 'Kemalpaşa': (41.4829, 41.519), 'Murgul': (41.2811, 41.5578), 'Şavşat': (41.2444, 42.3667),
          'Yusufeli': (40.8167, 41.5333)}
def km(a, b):
    R = 6371; p1, p2 = math.radians(a[0]), math.radians(b[0]); dp = p2 - p1; dl = math.radians(b[1] - a[1])
    return 2 * R * math.asin(math.sqrt(math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2))
def icinde(c): return 40.5 <= c[0] <= 41.65 and 41.1 <= c[1] <= 42.7
def norm(s):
    s = s.replace('İ', 'i').replace('I', 'ı').lower()
    s = re.sub(r',.*$', '', s); s = re.sub(r'\s*\(.*?\)', '', s); s = re.sub(r'\s+(köyü|köy)$', '', s)
    return s.strip()
def al(url, data=None, h=None):
    for d in range(4):
        try:
            req = urllib.request.Request(url, data=data, headers=dict(UA, **(h or {})))
            with urllib.request.urlopen(req, timeout=90) as r: return json.load(r)
        except Exception as e:
            print('tekrar', d, e); time.sleep(5 * (d + 1))
    return None

# 1) Wikidata: Artvin ilindeki, koordinatı olan tüm yerler
q = '''SELECT ?v ?ad ?c ?ilceAd WHERE {
 ?il rdfs:label "Artvin Province"@en .
 ?v wdt:P131+ ?il ; wdt:P625 ?c .
 ?v rdfs:label ?ad . FILTER(lang(?ad)="tr")
 OPTIONAL { ?v wdt:P131 ?ilce . ?ilce rdfs:label ?ilceAd . FILTER(lang(?ilceAd)="tr") }
}'''
wd = al('https://query.wikidata.org/sparql?format=json&query=' + urllib.parse.quote(q), h={'Accept': 'application/sparql-results+json'})
WD = {}
if wd:
    for b in wd['results']['bindings']:
        m = re.match(r'Point\(([-\d.]+) ([-\d.]+)\)', b['c']['value'])
        if not m: continue
        c = (float(m.group(2)), float(m.group(1)))
        WD.setdefault(norm(b['ad']['value']), []).append((c, b.get('ilceAd', {}).get('value', '')))
print('wikidata kayıt', sum(len(v) for v in WD.values()))

sonuc = {}; say = {'wikidata': 0, 'osm': 0, 'yok': 0}
for ilce, koyler in KOYLER.items():
    mz = MERKEZ.get(ilce); sonuc[ilce] = {}
    for koy in koyler:
        bulunan = None
        aday = [x for x in WD.get(norm(koy), []) if icinde(x[0]) and km(x[0], mz) < 45]
        if aday:
            aday.sort(key=lambda x: (0 if norm(ilce) in norm(x[1]) or (ilce == 'Merkez' and 'artvin' in norm(x[1])) else 1, km(x[0], mz)))
            bulunan = [round(aday[0][0][0], 5), round(aday[0][0][1], 5), 'wikidata']; say['wikidata'] += 1
        else:
            for sorgu in [f'{koy}, {ilce}, Artvin', f'{koy} köyü, {ilce}, Artvin', f'{koy}, Artvin']:
                url = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode({'q': sorgu, 'format': 'json', 'limit': 5, 'countrycodes': 'tr', 'viewbox': '41.1,41.65,42.7,40.5', 'bounded': 1})
                r = al(url) or []; time.sleep(1.1)
                r = [(float(x['lat']), float(x['lon'])) for x in r if norm(x.get('display_name', '')).startswith(norm(koy))]
                r = [c for c in r if icinde(c) and km(c, mz) < 45]
                if r:
                    r.sort(key=lambda c: km(c, mz)); bulunan = [round(r[0][0], 5), round(r[0][1], 5), 'osm']; say['osm'] += 1; break
        if not bulunan: say['yok'] += 1
        sonuc[ilce][koy] = bulunan
    print(ilce, sum(1 for v in sonuc[ilce].values() if v), '/', len(koyler))
os.makedirs('veri', exist_ok=True)
json.dump({'kaynak': 'Wikidata ve OpenStreetMap (Nominatim)', 'ozet': say, 'koyler': sonuc}, open('veri/koy-konum.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print(say)
