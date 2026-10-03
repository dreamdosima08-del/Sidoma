#!/usr/bin/env python3
"""Site içi arama dizini: kök klasördeki tüm .html sayfalarını tarar, /arama.json üretir.
GitHub Actions her push'ta çalıştırır; elle de çalıştırılabilir:  python3 araclar/arama_indeks.py
"""
import glob, html, json, os, re

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Aramaya girmeyecek sayfalar (yönetim, yasal metinler, eski kopyalar)
HARIC = {
    '404', 'offline', 'index', 'artvin-sorular-1', 'Reflex', 'acukampus-yonetim', 'ikinci-el-yonetim', 'etkinlik-admin',
    'aydinlatma-metni', 'ikinci-el-aydinlatma', 'ikinci-el-kosullar', 'imece-kvkk', 'kvkk',
    'cerez-politikasi', 'gizlilik-politikasi', 'kullanim-sartlari', 'reklam', 'eczane-rehber-1',
    'kelime-avi-', 'artvin-ilce-testi-',
}

# Dosya adına göre simge (ilk eşleşen)
SIMGE = [
    ('bugun-artvin', '❤️'), ('havas', '🛫'), ('havalimani', '✈️'), ('sarp', '🛂'), ('hava', '🌦️'), ('eczane', '💊'), ('hastane', '🏥'), ('acil', '🚨'),
    ('yol-', '🚧'), ('dolmus', '🚐'), ('otobus', '🚌'), ('taksi', '🚕'), ('havas', '🛫'),
    ('havalimani', '✈️'), ('sarp', '🛂'), ('misafirhane', '🏠'), ('otel', '🏨'), ('namaz', '🕌'),
    ('ikinci-el', '🏷️'), ('imece', '🤝'), ('kayip', '🔍'), ('etkinlik', '🎪'), ('galeri', '📷'),
    ('harita', '🗺️'), ('mesafe', '📏'), ('rakim', '⛰️'), ('ilce', '📍'), ('koyler', '🏘️'),
    ('acu', '🎓'), ('kampus', '🎓'), ('wordle', '🧩'), ('kelime', '🧩'), ('quiz', '❓'),
    ('soru', '❓'), ('reflex', '⚡'), ('oyun', '🎮'), ('test', '🧪'), ('goc', '📊'),
    ('artvinmetre', '📊'), ('haber', '📰'), ('forum', '💬'), ('gezi', '🧭'), ('tarih', '📜'),
    ('numeroloji', '✨'), ('kart', '🃏'), ('blog', '📖'),
]

TUR = [  # sonuç altında gösterilen kısa tür etiketi
    ('blog', 'Blog yazısı'), ('yol-', 'Yol durumu'), ('ilce-', 'İlçe rehberi'), ('hava-durumu', 'Hava durumu'),
    ('wordle', 'Oyun'), ('kelime-avi', 'Oyun'), ('quiz', 'Oyun'), ('reflex', 'Oyun'), ('oyun', 'Oyun'),
    ('test', 'Test'), ('acu', 'Üniversite'), ('kampus', 'Üniversite'),
]

SONEK = re.compile(r'\s*[|–—-]\s*(Artvin Rehber[iı]?|artvinrehber\.com|ArtvinRehber)\s*$', re.I)


def temiz(t):
    t = re.sub(r'<[^>]+>', ' ', t)
    t = html.unescape(t)
    return re.sub(r'\s+', ' ', t).strip()


def meta(s, ad):
    m = re.search(r'<meta[^>]+(?:name|property)=["\']%s["\'][^>]*content=["\']([^"\']*)' % ad, s, re.I) \
        or re.search(r'<meta[^>]+content=["\']([^"\']*)["\'][^>]*(?:name|property)=["\']%s["\']' % ad, s, re.I)
    return temiz(m.group(1)) if m else ''


def main():
    sayfalar = {os.path.basename(p)[:-5] for p in glob.glob(os.path.join(KOK, '*.html'))}
    cikti = []
    for ad in sorted(sayfalar):
        if ad in HARIC:
            continue
        # "x-1", "x-4" gibi kopyalar: aslı varsa atla
        m = re.match(r'^(.*)-\d$', ad)
        if m and m.group(1) in sayfalar:
            continue
        s = open(os.path.join(KOK, ad + '.html'), encoding='utf-8', errors='ignore').read()
        if re.search(r'<meta[^>]+name=["\']robots["\'][^>]*noindex', s, re.I):
            continue
        # başka sayfaya yönlendiren / kanonik başka sayfa olan kopyaları atla
        kn = re.search(r'rel=["\']canonical["\'][^>]*href=["\']https?://[^/]+/([^"\'#?]*)', s, re.I)
        if kn and kn.group(1) not in ('', ad + '.html', ad) and kn.group(1)[:-5] in sayfalar:
            continue
        tm = re.search(r'<title[^>]*>(.*?)</title>', s, re.S | re.I)
        baslik = temiz(tm.group(1)) if tm else ''
        for _ in range(2):
            baslik = SONEK.sub('', baslik)
        if not baslik:
            h1 = re.search(r'<h1[^>]*>(.*?)</h1>', s, re.S | re.I)
            baslik = temiz(h1.group(1)) if h1 else ad
        aciklama = meta(s, 'description') or meta(s, 'og:description')
        anahtar = meta(s, 'keywords')
        basliklar = ' '.join(temiz(x) for x in re.findall(r'<h[23][^>]*>(.*?)</h[23]>', s, re.S | re.I))
        k = (anahtar + ' ' + basliklar).strip()
        if len(k) > 450:
            k = k[:450].rsplit(' ', 1)[0]
        url = '/' if ad == 'index' else '/' + ad + '.html'
        simge = next((i for p, i in SIMGE if p in ad), '📄')
        tur = 'Hava durumu' if ad == 'hava' else next((t for p, t in TUR if p in ad), '')
        kayit = {'u': url, 'i': simge, 'b': baslik[:110], 'a': aciklama[:160], 'k': k}
        if tur:
            kayit['t'] = tur
        cikti.append(kayit)
    yol = os.path.join(KOK, 'arama.json')
    with open(yol, 'w', encoding='utf-8') as f:
        json.dump(cikti, f, ensure_ascii=False, separators=(',', ':'))
    print('arama.json: %d sayfa, %.1f KB' % (len(cikti), os.path.getsize(yol) / 1024))


if __name__ == '__main__':
    main()
