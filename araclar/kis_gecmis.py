# -*- coding: utf-8 -*-
"""Geçmiş kışlar: Open-Meteo geçmiş hava arşivi (ECMWF ERA5 yeniden analiz) ile
Artvin'de 4 nokta için son kışların kar istatistikleri. Sonuç: veri/kis-gecmis.json
Kar ölçütü: o saat yağış var ve sıcaklık (noktanın rakımına göre düzeltilmiş) <= 1 °C ise yağış kar sayılır.
1 mm su ≈ 1 cm taze kar kabul edilir."""
import json, time, urllib.request, datetime as dt, statistics as st, os

NOKTALAR = [
    ('merkez',   'Artvin Merkez', 41.1828, 41.8183, 550),
    ('kafkasor', 'Kafkasör',      41.1950, 41.7350, 1250),
    ('savsat',   'Şavşat',        41.2444, 42.3667, 1000),
    ('sahara',   'Sahara Geçidi', 41.2000, 42.5500, 2400),
]
BUGUN = dt.date.today()
# son tamamlanmış kış: Ekim–Mayıs
SON_KIS = BUGUN.year - 1 if BUGUN.month >= 6 else BUGUN.year - 2   # kışın başladığı yıl
ILK_KIS = SON_KIS - 9
ESIK_GUN = 1.0   # mm kar suyu ≈ 1 cm

def al(url):
    for d in range(5):
        try:
            with urllib.request.urlopen(url, timeout=120) as r:
                return json.load(r)
        except Exception as e:
            print('tekrar', d, e); time.sleep(10 * (d + 1))
    raise SystemExit('veri alınamadı')

AYLAR = ['Ekim', 'Kasım', 'Aralık', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs']
sonuc = {'kaynak': 'Open-Meteo geçmiş hava arşivi (ECMWF ERA5 / ERA5-Land yeniden analiz)',
         'yontem': 'Saatlik yağış ve noktanın rakımına göre düzeltilmiş sıcaklık; sıcaklık 1 °C ve altındaysa yağış kar sayıldı. Günde en az 1 mm kar suyu (~1 cm taze kar) düşen gün "karlı gün".',
         'olusturma': BUGUN.isoformat(), 'kislar': [f'{y}-{y+1}' for y in range(ILK_KIS, SON_KIS + 1)], 'noktalar': {}}

for kod, ad, lat, lon, h in NOKTALAR:
    url = ('https://archive-api.open-meteo.com/v1/archive?latitude=%s&longitude=%s&elevation=%d'
           '&start_date=%d-10-01&end_date=%d-05-31&hourly=temperature_2m,precipitation'
           '&daily=temperature_2m_min&timezone=Europe%%2FIstanbul') % (lat, lon, h, ILK_KIS, SON_KIS + 1)
    j = al(url)
    H = j['hourly']; gunluk = {}
    for t, T, P in zip(H['time'], H['temperature_2m'], H['precipitation']):
        if T is None or P is None: continue
        g = t[:10]
        gunluk.setdefault(g, 0.0)
        if P > 0 and T <= 1.0: gunluk[g] += P
    tmin = dict(zip(j['daily']['time'], j['daily']['temperature_2m_min']))
    kislar = []
    for y in range(ILK_KIS, SON_KIS + 1):
        bas, son = dt.date(y, 10, 1), dt.date(y + 1, 5, 31)
        gunler = [(dt.date.fromisoformat(g), v) for g, v in gunluk.items() if bas <= dt.date.fromisoformat(g) <= son]
        gunler.sort()
        karli = [g for g, v in gunler if v >= ESIK_GUN]
        ay_top = {}
        for g, v in gunler:
            ay_top[g.month] = ay_top.get(g.month, 0) + v
        en_ay = max(ay_top, key=ay_top.get) if ay_top and max(ay_top.values()) > 0 else None
        ayaz = sum(1 for g, v in tmin.items() if v is not None and bas <= dt.date.fromisoformat(g) <= son and v < 0)
        kislar.append({'kis': f'{y}-{y+1}',
                       'ilk_kar': karli[0].isoformat() if karli else None,
                       'son_kar': karli[-1].isoformat() if karli else None,
                       'karli_gun': len(karli),
                       'toplam_kar_cm': round(sum(v for _, v in gunler)),
                       'en_karli_ay': AYLAR[[10, 11, 12, 1, 2, 3, 4, 5].index(en_ay)] if en_ay else None,
                       'ayazli_gun': ayaz})
    # özet
    def gun_no(s):  # 1 Ekim'den itibaren gün sırası
        d = dt.date.fromisoformat(s); b = dt.date(d.year if d.month >= 10 else d.year - 1, 10, 1)
        return (d - b).days
    ilkler = [gun_no(k['ilk_kar']) for k in kislar if k['ilk_kar']]
    sonlar = [gun_no(k['son_kar']) for k in kislar if k['son_kar']]
    def tarih(n):
        d = dt.date(2001, 10, 1) + dt.timedelta(days=round(n)); return d.strftime('%m-%d')
    sonuc['noktalar'][kod] = {
        'ad': ad, 'rakim': h, 'lat': lat, 'lon': lon,
        'model_rakimi': j.get('elevation'),
        'ozet': {'ort_ilk_kar': tarih(st.mean(ilkler)) if ilkler else None,
                 'en_erken_ilk_kar': min((k['ilk_kar'] for k in kislar if k['ilk_kar']), key=gun_no, default=None),
                 'en_gec_ilk_kar': max((k['ilk_kar'] for k in kislar if k['ilk_kar']), key=gun_no, default=None),
                 'ort_son_kar': tarih(st.mean(sonlar)) if sonlar else None,
                 'ort_karli_gun': round(st.mean(k['karli_gun'] for k in kislar), 1),
                 'ort_toplam_kar_cm': round(st.mean(k['toplam_kar_cm'] for k in kislar)),
                 'karsiz_kis': sum(1 for k in kislar if not k['ilk_kar'])},
        'kislar': kislar}
    print(kod, sonuc['noktalar'][kod]['ozet'])
    time.sleep(3)

os.makedirs('veri', exist_ok=True)
json.dump(sonuc, open('veri/kis-gecmis.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

# MGM resmi istatistik sayfası (varsa) — ham olarak sakla, sonra elle kontrol edilecek
try:
    req = urllib.request.Request('https://www.mgm.gov.tr/veridegerlendirme/il-ve-ilceler-istatistik.aspx?m=ARTVIN',
                                 headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=60) as r:
        open('veri/mgm-artvin-istatistik.html', 'wb').write(r.read())
    print('MGM sayfası alındı')
except Exception as e:
    print('MGM alınamadı', e)
