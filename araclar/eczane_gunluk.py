"""Her gece eczane-rehber.html'in başlık, açıklama ve 'bugün nöbetçi' kutusunu
nobet-eczane.json'daki o günün eczanesiyle günceller. Google arama sonucunda
bugünün eczanesi görünsün diye. Liste yoksa sayfaya dokunmaz."""
import json, re, datetime, html, sys
SAYFA, VERI = 'eczane-rehber.html', 'nobet-eczane.json'
AY = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık']
bugun = (datetime.datetime.utcnow() + datetime.timedelta(hours=3)).date()
yarin = bugun + datetime.timedelta(days=1)
g = json.load(open(VERI, encoding='utf-8')).get('gunler', {})
k, ky = g.get(bugun.isoformat()), g.get(yarin.isoformat())
gun = f'{bugun.day} {AY[bugun.month-1]}'
e = lambda s: html.escape(s, quote=True)
if k:
    baslik = f"Artvin Nöbetçi Eczane Bugün: {k['ad']} ({gun})"
    aciklama = (f"Bugün {gun} Artvin merkez nöbetçi eczane: {k['ad']}, {k['saat']}, tel {k['tel']}."
                + (f" Yarın: {ky['ad']}." if ky else '') + " 8 ilçede 50+ eczane, telefon ve yol tarifi.")
    sss = f"Bugünün ({gun}) nöbetçi eczanesi: {k['ad']}, {k['saat']}, tel {k['tel']}"
    kutu_ad, kutu_saat = k['ad'], f"Bugün nöbetçi · {k['saat']} · {k['tel']}"
else:  # liste bitti: yanlış eczane göstermemek için genel hâle dön
    print('Bugün için liste yok:', bugun)
    baslik = 'Artvin Nöbetçi Eczane 2026 — Bugün Hangi Eczane Açık? Tüm İlçeler'
    aciklama = 'Artvin nöbetçi eczane 2026. Bugün hangi eczane açık? Artvin merkez ve 8 ilçede 50+ eczane telefon, adres ve yol tarifi. GPS ile en yakın eczaneyi hemen bul.'
    sss = 'Bugünün nöbetçi eczanesi sayfanın üstündeki kutuda gösterilir'
    kutu_ad, kutu_saat, ky = 'Artvin Merkez Nöbetçi', 'Güncel bilgi için tıklayın', None
s = open(SAYFA, encoding='utf-8').read(); eski = s
def deg(desen, yeni):
    global s
    s2, n = re.subn(desen, lambda m: yeni, s, count=1)
    if n != 1: print('Bulunamadı:', desen); sys.exit(1)
    s = s2
deg(r'<title>[^<]*</title>', f'<title>{e(baslik)}</title>')
deg(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{e(aciklama)}">')
deg(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{e(baslik)}">')
deg(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{e(aciklama)}">')
deg(r'"dateModified": *"[^"]*"', f'"dateModified": "{bugun.isoformat()}"')
s = re.sub(r'Bugünün[^"]*nöbetçi eczanesi[^"]*"', lambda m: sss + '"', s, count=1)
deg(r'<div class="bugun-ec" id="nbAd">[^<]*</div>', f'<div class="bugun-ec" id="nbAd">{e(kutu_ad)}</div>')
deg(r'<div class="bugun-saat" id="nbSaat">[^<]*</div>', f'<div class="bugun-saat" id="nbSaat">{e(kutu_saat)}</div>')
s = re.sub(r'(<div class="bugun-saat" id="nbYarin"[^>]*>)[^<]*(</div>)', lambda m: m.group(1) + (e(f"Yarın: {ky['ad']} ({ky['saat']})") if ky else '') + m.group(2), s, count=1)
if s != eski:
    open(SAYFA, 'w', encoding='utf-8').write(s); print('Güncellendi:', baslik)
else:
    print('Değişiklik yok')
