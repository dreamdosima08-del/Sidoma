# -*- coding: utf-8 -*-
"""havalimani-sarp-batum.html üretir (TR / EN / KA). Çalıştır: python3 araclar/sarp_batum_uret.py"""
import json, os, html as H

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL = 'https://www.artvinrehber.com/havalimani-sarp-batum.html'
TARIH = '2026-10-02'

def L(tr, en, ka, tag='span'):
    return ''.join('<%s data-l="%s" lang="%s">%s</%s>' % (tag, k, k, v, tag) for k, v in (('tr', tr), ('en', en), ('ka', ka)))

# ── Gerçek bilgiler (Sana + site) ──
HAVAS = '320 ₺'
TAKSI_GIT = '3.500 ₺'
TAKSI_DON = '4.500 ₺'

SSS = [
 (("Rize-Artvin Havalimanı'ndan Sarp Sınır Kapısı'na nasıl gidilir?",
   "En ekonomik yol: havalimanından Havaş ile Hopa'ya (320 ₺, yaklaşık 60 dakika), Hopa Maliye Önü'nden 5–7 dakika yürüyüp Sarp dolmuşuna binmek (yaklaşık 15–20 dakika). En pratik yol: havalimanından Sarp'a taksi, 3.500 ₺."),
  ("How do I get from Rize-Artvin Airport to the Sarp border crossing?",
   "Cheapest: take the Havaş airport bus to Hopa (320 TRY, about 60 minutes), walk 5–7 minutes from the Maliye Önü stop to the Sarp minibus stop and ride about 15–20 minutes to the border. Easiest: a taxi from the airport to Sarp costs 3,500 TRY."),
  ("როგორ მივიდე რიზე-ართვინის აეროპორტიდან სარფის საზღვრამდე?",
   "ყველაზე იაფი: აეროპორტიდან Havaş-ის ავტობუსით ჰოფამდე (320 ლირა, დაახლოებით 60 წუთი), შემდეგ Maliye Önü-ს გაჩერებიდან 5–7 წუთი ფეხით სარფის მიკროავტობუსამდე (დაახლოებით 15–20 წუთი). ყველაზე მარტივი: ტაქსი აეროპორტიდან სარფამდე — 3 500 ლირა.")),
 (("Havaş havalimanından ne zaman kalkar?",
   "Havaş, havalimanına inen her uçaktan yaklaşık 45 dakika ile 1 saat sonra kalkar."),
  ("When does the Havaş bus leave the airport?",
   "Havaş leaves the airport about 45 minutes to 1 hour after each arriving flight."),
  ("როდის გადის Havaş-ის ავტობუსი აეროპორტიდან?",
   "Havaş-ის ავტობუსი გადის ყოველი ჩამოფრენიდან დაახლოებით 45 წუთიდან 1 საათამდე.")),
 (("Hopa–Sarp dolmuşu gece çalışır mı?",
   "Hayır, Hopa–Sarp dolmuşu gece çalışmaz. Gece saatlerinde taksi tercih edin."),
  ("Does the Hopa–Sarp minibus run at night?",
   "No. The Hopa–Sarp minibus does not run at night; take a taxi instead."),
  ("მუშაობს თუ არა ჰოფა–სარფის მიკროავტობუსი ღამით?",
   "არა, ღამით არ მუშაობს. ღამით ტაქსით წადით.")),
 (("Havalimanından Sarp'a taksi ne kadar?",
   "Havalimanından Sarp'a taksi 3.500 ₺'dir (Rize tarifesi). Sarp'tan havalimanına dönüş 4.500 ₺'dir (Artvin tarifesi); iki ilin taksi tarifesi farklı olduğu için ücretler farklıdır."),
  ("How much is a taxi from the airport to Sarp?",
   "3,500 TRY from the airport to Sarp (Rize tariff). The return from Sarp to the airport is 4,500 TRY (Artvin tariff); the two provinces use different taxi tariffs."),
  ("რა ღირს ტაქსი აეროპორტიდან სარფამდე?",
   "აეროპორტიდან სარფამდე — 3 500 ლირა (რიზეს ტარიფი). სარფიდან აეროპორტამდე — 4 500 ლირა (ართვინის ტარიფი); ორ პროვინციას სხვადასხვა ტარიფი აქვს.")),
 (("Sarp'tan Batum kaç km?",
   "Sarp Sınır Kapısı'ndan Batum'a yaklaşık 20 km, Hopa'dan Batum'a yaklaşık 37 km'dir."),
  ("How far is Batumi from Sarp?",
   "About 20 km from the Sarp border crossing, and about 37 km from Hopa."),
  ("რამდენი კილომეტრია სარფიდან ბათუმამდე?",
   "სარფის საზღვრიდან ბათუმამდე დაახლოებით 20 კმ-ია, ჰოფიდან — დაახლოებით 37 კმ.")),
]

def sss_html():
    out = []
    for (tq, ta), (eq, ea), (kq, ka) in SSS:
        out.append('<details class="q"><summary>%s</summary><p>%s</p></details>' % (L(tq, eq, kq), L(ta, ea, ka)))
    return '\n'.join(out)

LD = [
 {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":t[0],"acceptedAnswer":{"@type":"Answer","text":t[1]}} for t,_,_ in SSS]+
   [{"@type":"Question","name":e[0],"acceptedAnswer":{"@type":"Answer","text":e[1]}} for _,e,_ in SSS[:3]]},
 {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
   {"@type":"ListItem","position":1,"name":"Ana Sayfa","item":"https://www.artvinrehber.com/"},
   {"@type":"ListItem","position":2,"name":"Sarp Sınır Kapısı","item":"https://www.artvinrehber.com/sarp-sinir-kapisi.html"},
   {"@type":"ListItem","position":3,"name":"Havalimanından Sarp ve Batum'a","item":URL}]},
 {"@context":"https://schema.org","@type":"WebPage","name":"Rize-Artvin Havalimanı'ndan Sarp ve Batum'a Nasıl Gidilir?","url":URL,
  "inLanguage":["tr","en","ka"],"datePublished":TARIH,"dateModified":TARIH,
  "about":[{"@type":"Airport","name":"Rize-Artvin Havalimanı","iataCode":"RZV"},{"@type":"Place","name":"Sarp Sınır Kapısı"},{"@type":"City","name":"Batum"}]}
]

def durak(ikon, ad, alt, cls=''):
    return '<li class="durak %s"><span class="nok">%s</span><div><b>%s</b><small>%s</small></div></li>' % (cls, ikon, ad, alt)

def ara(ikon, govde):
    return '<li class="ara"><span class="ik">%s</span><div>%s</div></li>' % (ikon, govde)

GIDIS = ''.join([
 durak('✈️', L('Rize-Artvin Havalimanı','Rize-Artvin Airport','რიზე-ართვინის აეროპორტი'), L('Pazar, Rize · RZV','Pazar, Rize · RZV','ფაზარი, რიზე · RZV'), 'ilk'),
 ara('🚌', L('<b>Havaş ile Hopa\'ya:</b> %s, yaklaşık 60 dk. Her uçak indikten <b>45 dk – 1 saat sonra</b> kalkar.' % HAVAS,
             '<b>Havaş bus to Hopa:</b> 320 TRY, about 60 min. Leaves <b>45 min – 1 hour after each landing</b>.',
             '<b>Havaş-ით ჰოფამდე:</b> 320 ლირა, დაახლოებით 60 წუთი. გადის <b>ყოველი ჩამოფრენიდან 45 წუთიდან 1 საათამდე</b>.')
          + '<p class="alt">' + L('Alternatif: Havalimanından ana yola çıkıp Hopa\'ya giden şehirlerarası otobüslere binebilirsiniz; Artvin ve Hopa otobüsleri sık geçer, ama yol kenarında beklemek gerekebilir.',
             'Alternative: walk out to the main road and flag down an intercity bus to Hopa; Artvin and Hopa buses pass often, but you may need to wait at the roadside.',
             'ალტერნატივა: გადით მთავარ გზაზე და გააჩერეთ ჰოფისკენ მიმავალი ავტობუსი; ართვინისა და ჰოფის ავტობუსები ხშირად გადის, თუმცა გზის პირას ლოდინი შეიძლება მოგიწიოთ.') + '</p>'),
 durak('📍', L('Hopa · Maliye Önü','Hopa · Maliye Önü stop','ჰოფა · Maliye Önü'), L('Havaş burada indirir','Havaş drops you here','Havaş აქ ჩამოგსვამთ')),
 ara('🚶', L('Sarp dolmuşunun kalktığı durağa <b>5–7 dakika yürüyün</b>.','<b>Walk 5–7 minutes</b> to the Sarp minibus stop.','სარფის მიკროავტობუსის გაჩერებამდე <b>5–7 წუთი ფეხით</b>.')),
 durak('🚐', L('Hopa → Kemalpaşa · Sarp dolmuş durağı','Hopa → Kemalpaşa · Sarp minibus stop','ჰოფა → ქემალფაშა · სარფის მიკროავტობუსი'), L('Tel: 0466 351 57 75','Tel: +90 466 351 57 75','ტელ: +90 466 351 57 75')),
 ara('🚐', L('<b>Dolmuşla Sarp\'a:</b> yaklaşık 15–20 dk, sık kalkar. <b>Gece çalışmaz.</b> Güncel ücreti durakta sorun.',
             '<b>Minibus to Sarp:</b> about 15–20 min, frequent. <b>No service at night.</b> Ask the fare at the stop.',
             '<b>მიკროავტობუსით სარფამდე:</b> დაახლოებით 15–20 წუთი, ხშირად გადის. <b>ღამით არ მუშაობს.</b> ფასი გაჩერებაზე იკითხეთ.')),
 durak('🛂', L('Sarp Sınır Kapısı','Sarp border crossing','სარფის საზღვარი'), L('7/24 açık · yaya geçilir','Open 24/7 · cross on foot','24/7 · ფეხით გადასვლა')),
 ara('🚶', L('Sınırı <b>yaya</b> geçersiniz. Gürcistan tarafı <b>Sarpi</b>\'dir.','You cross the border <b>on foot</b>. The Georgian side is <b>Sarpi</b>.','საზღვარს <b>ფეხით</b> კვეთთ. საქართველოს მხარეა <b>სარფი</b>.')),
 durak('🇬🇪', L('Sarpi (Gürcistan)','Sarpi (Georgia)','სარფი (საქართველო)'), L('Marşrutka ve taksi var','Marshrutkas and taxis available','მარშრუტკა და ტაქსი')),
 ara('🚌', L('<b>Batum\'a yaklaşık 20 km.</b> Gürcistan tarafında marşrutka (minibüs) veya taksiyle gidilir; ücret lari (GEL) iledir.',
             '<b>About 20 km to Batumi</b> by marshrutka (minibus) or taxi; fares are in lari (GEL).',
             '<b>ბათუმამდე დაახლოებით 20 კმ</b> — მარშრუტკით ან ტაქსით; ფასი ლარშია.')),
 durak('🏙️', L('Batum','Batumi','ბათუმი'), L('Hopa\'dan ~37 km','~37 km from Hopa','ჰოფიდან ~37 კმ'), 'son'),
])

DONUS = ''.join([
 durak('🏙️', L('Batum','Batumi','ბათუმი'), L('Sarpi\'ye ~20 km','~20 km to Sarpi','სარფამდე ~20 კმ'), 'ilk'),
 ara('🚌', L('Marşrutka veya taksiyle <b>Sarpi</b> sınırına.','Marshrutka or taxi to the <b>Sarpi</b> border.','მარშრუტკით ან ტაქსით <b>სარფის</b> საზღვრამდე.')),
 durak('🛂', L('Sarp Sınır Kapısı','Sarp border crossing','სარფის საზღვარი'), L('Yaya geçiş','Cross on foot','ფეხით გადასვლა')),
 ara('🚐', L('<b>Sarp → Hopa dolmuşu</b> Sarp Camii yanından kalkar; sabit saati yok, sık kalkar. Gece çalışmaz.',
             '<b>Sarp → Hopa minibus</b> leaves from next to the Sarp Mosque; no fixed timetable, frequent. No night service.',
             '<b>სარფი → ჰოფა მიკროავტობუსი</b> გადის სარფის მეჩეთთან; ფიქსირებული განრიგი არ აქვს, ხშირად გადის. ღამით არ მუშაობს.')),
 durak('📍', L('Hopa · Maliye Önü','Hopa · Maliye Önü stop','ჰოფა · Maliye Önü'), L('Dolmuş durağından 5–7 dk yürüyüş','5–7 min walk from the minibus stop','5–7 წუთი ფეხით')),
 ara('🚌', L('<b>Havaş ile havalimanına:</b> %s, ~60 dk. Kalkış saatleri: <b>06:00 · 07:30 · 12:00 · 17:45 · 19:45 · 21:30</b>' % HAVAS,
             '<b>Havaş to the airport:</b> 320 TRY, ~60 min. Departures: <b>06:00 · 07:30 · 12:00 · 17:45 · 19:45 · 21:30</b>',
             '<b>Havaş აეროპორტამდე:</b> 320 ლირა, ~60 წუთი. გასვლის დრო: <b>06:00 · 07:30 · 12:00 · 17:45 · 19:45 · 21:30</b>')
          + '<p class="alt">' + L('Saatler değişebilir; uçuştan önce Havaş sayfasından kontrol edin.','Times may change; check before your flight.','დრო შეიძლება შეიცვალოს; ფრენამდე გადაამოწმეთ.') + '</p>'),
 durak('✈️', L('Rize-Artvin Havalimanı','Rize-Artvin Airport','რიზე-ართვინის აეროპორტი'), L('Taksiyle Sarp\'tan doğrudan: %s' % TAKSI_DON,'Direct taxi from Sarp: 4,500 TRY','ტაქსი სარფიდან პირდაპირ: 4 500 ლირა'), 'son'),
])

UYRUK = {
 'tr': [L('Yeni tip <b>çipli kimlik</b> ya da pasaport yeterli; Gürcistan\'a vize gerekmez. Eski tip nüfus cüzdanı kabul edilmez.','A new chip ID card or passport is enough; no visa for Georgia. Old-style ID booklets are not accepted.','საკმარისია ახალი ჩიპიანი პირადობის მოწმობა ან პასპორტი; ვიზა არ არის საჭირო.'),
        L('Türkiye\'den çıkışta <b>yurt dışı çıkış harcı 1.250 ₺</b> (7 yaş altı muaf). Sınıra varmadan ödeyin.','Turkish citizens pay a <b>1,250 TRY exit fee</b> (under 7s exempt). Pay before you reach the border.','თურქეთის მოქალაქეები იხდიან <b>1 250 ლირა გასვლის მოსაკრებელს</b> (7 წლამდე — უფასოდ).'),
        L('Gürcistan\'a girişte en az 30.000 GEL teminatlı <b>seyahat sağlık sigortası</b> zorunlu.','Georgia requires <b>travel health insurance</b> with at least 30,000 GEL cover.','საქართველოში შესვლისას სავალდებულოა <b>სამოგზაურო დაზღვევა</b> (მინიმუმ 30 000 ლარი).'),
        L('Çocukların kimliğinde <b>fotoğraf</b> olmalı.','Children\'s ID cards must have a <b>photo</b>.','ბავშვების პირადობის მოწმობაზე <b>ფოტო</b> უნდა იყოს.')],
 'ge': [L('Kendi ülkenize dönüyorsunuz: Gürcistan tarafında giriş için geçerli <b>pasaportunuz ya da kimliğiniz</b> yeterli.','You are going home: your valid <b>Georgian passport or ID card</b> is enough on the Georgian side.','სახლში ბრუნდებით: საქართველოს მხარეს საკმარისია თქვენი მოქმედი <b>პასპორტი ან პირადობის მოწმობა</b>.'),
        L('Türkiye\'nin <b>çıkış harcı yalnızca Türk vatandaşlarından</b> alınır; sizden alınmaz.','The Turkish <b>exit fee applies only to Turkish citizens</b>, not to you.','თურქეთის <b>გასვლის მოსაკრებელი მხოლოდ თურქეთის მოქალაქეებს</b> ეხებათ.'),
        L('Türkiye\'deki kalış sürenizin <b>izin verilen gün sınırını aşmadığından</b> emin olun.','Make sure your stay in Türkiye has <b>not exceeded the permitted period</b>.','დარწმუნდით, რომ თურქეთში ყოფნის <b>ნებადართული ვადა არ გადაგიცილებიათ</b>.')],
 'diger': [L('Gürcistan\'a giriş kuralları <b>uyruğunuza göre değişir</b>; seyahatten önce vize gerekip gerekmediğini kontrol edin.','Entry rules for Georgia <b>depend on your nationality</b>; check whether you need a visa before travelling.','საქართველოში შესვლის წესები <b>მოქალაქეობაზეა დამოკიდებული</b>; წინასწარ გადაამოწმეთ ვიზის საკითხი.'),
           L('Gürcistan 2026\'dan itibaren yabancı ziyaretçilerden en az 30.000 GEL teminatlı <b>seyahat sigortası</b> istiyor.','Since 2026 Georgia requires foreign visitors to hold <b>travel insurance</b> with at least 30,000 GEL cover.','2026 წლიდან საქართველო უცხოელებისგან ითხოვს <b>სამოგზაურო დაზღვევას</b> (მინიმუმ 30 000 ლარი).'),
           L('Türkiye\'nin çıkış harcı yabancılardan alınmaz. <b>Pasaportunuzu</b> yanınızda tutun.','The Turkish exit fee does not apply to foreigners. Keep your <b>passport</b> at hand.','თურქეთის გასვლის მოსაკრებელი უცხოელებს არ ეხებათ. <b>პასპორტი</b> თან იქონიეთ.')],
}

def liste(xs): return '<ul class="ul">' + ''.join('<li>%s</li>' % x for x in xs) + '</ul>'

SECIM_JS = {
 # anahtarlar: sonuç kodları
 'taksi_gece': {'tr':['Taksi','Gece dolmuş çalışmaz. Havalimanından Sarp\'a taksi 3.500 ₺.'],
                'en':['Taxi','Minibuses don\'t run at night. Airport → Sarp taxi: 3,500 TRY.'],
                'ka':['ტაქსი','ღამით მიკროავტობუსი არ მუშაობს. ტაქსი აეროპორტიდან სარფამდე: 3 500 ლირა.']},
 'taksi_grup': {'tr':['Taksi','Kalabalıksanız taksi bölüşülünce mantıklı: 3.500 ₺ toplam, kişi başı çok düşer. Kapıdan kapıya.'],
                'en':['Taxi','For a group, sharing a taxi makes sense: 3,500 TRY in total, much less per person. Door to door.'],
                'ka':['ტაქსი','ჯგუფისთვის ტაქსის გაყოფა მომგებიანია: სულ 3 500 ლირა, ერთ ადამიანზე გაცილებით ნაკლები.']},
 'taksi_bagaj':{'tr':['Taksi','Çok bagajla aktarma yapmak yorucu; taksi sizi doğrudan sınıra bırakır: 3.500 ₺.'],
                'en':['Taxi','With a lot of luggage, transfers are tiring; a taxi takes you straight to the border: 3,500 TRY.'],
                'ka':['ტაქსი','ბევრი ბარგით გადაჯდომა დამღლელია; ტაქსი პირდაპირ საზღვრამდე მიგიყვანთ: 3 500 ლირა.']},
 'taksi_hiz':  {'tr':['Taksi','En hızlısı: Havaş\'ın kalkmasını beklemezsiniz, aktarma yok. 3.500 ₺.'],
                'en':['Taxi','Fastest: no waiting for Havaş, no transfers. 3,500 TRY.'],
                'ka':['ტაქსი','ყველაზე სწრაფი: არ ელოდებით Havaş-ს, გადაჯდომა არ არის. 3 500 ლირა.']},
 'havas':      {'tr':['Havaş + dolmuş','En ekonomik yol: Havaş ile Hopa (320 ₺), 5–7 dk yürüyüş, dolmuşla Sarp. Toplam süre bekleme dahil yaklaşık 2–2,5 saat.'],
                'en':['Havaş + minibus','Cheapest: Havaş to Hopa (320 TRY), a 5–7 min walk, then minibus to Sarp. About 2–2.5 hours including waiting.'],
                'ka':['Havaş + მიკროავტობუსი','ყველაზე იაფი: Havaş ჰოფამდე (320 ლირა), 5–7 წუთი ფეხით, შემდეგ მიკროავტობუსით სარფამდე. ლოდინის ჩათვლით დაახლოებით 2–2,5 საათი.']},
}

UI_JS = {
 'tr': {'oneri':'Önerimiz'}, 'en': {'oneri':'Our suggestion'}, 'ka': {'oneri':'ჩვენი რჩევა'}
}

def secim_grup(ad, secenekler):
    return '<div class="sg" data-g="%s">%s</div>' % (ad, ''.join('<button type="button" data-v="%s"%s>%s</button>' % (v, ' class="on"' if i == 0 else '', lab) for i, (v, lab) in enumerate(secenekler)))

SECICI = ''.join([
 '<div class="sor">', L('Ne zaman iniyorsunuz?','When do you land?','როდის ჩამოფრინდებით?'), '</div>',
 secim_grup('saat', [('gunduz', L('Gündüz','Daytime','დღისით')), ('gece', L('Akşam geç / gece','Late evening / night','გვიან საღამოს / ღამით'))]),
 '<div class="sor">', L('Kaç kişisiniz?','How many of you?','რამდენი ხართ?'), '</div>',
 secim_grup('kisi', [('az', L('1–2 kişi','1–2 people','1–2 ადამიანი')), ('cok', L('3 kişi ve üzeri','3 or more','3 ან მეტი'))]),
 '<div class="sor">', L('Bagajınız?','Luggage?','ბარგი?'), '</div>',
 secim_grup('bagaj', [('hafif', L('Hafif','Light','მსუბუქი')), ('agir', L('Çok / ağır','A lot / heavy','ბევრი / მძიმე'))]),
 '<div class="sor">', L('Önceliğiniz?','Your priority?','თქვენი პრიორიტეტი?'), '</div>',
 secim_grup('oncelik', [('ucuz', L('Ucuz olsun','Cheapest','იაფი')), ('hizli', L('Hızlı olsun','Fastest','სწრაფი'))]),
])

def sayfa():
    lds = ''.join('<script type="application/ld+json">%s</script>\n' % json.dumps(x, ensure_ascii=False) for x in LD)
    return '''<!DOCTYPE html>
<html lang="tr" data-lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Rize-Artvin Havalimanı'ndan Sarp ve Batum'a Nasıl Gidilir? Havaş, Dolmuş, Taksi 2026</title>
<meta name="description" content="Rize-Artvin Havalimanı'ndan Sarp Sınır Kapısı ve Batum'a ulaşım: Havaş ile Hopa 320 ₺, Hopa–Sarp dolmuşu, havalimanı–Sarp taksi 3.500 ₺. Adım adım rota, dönüş saatleri. Türkçe, English, ქართული.">
<meta name="keywords" content="rize artvin havalimanı sarp, havalimanından batuma nasıl gidilir, rize havalimanı sarp sınır kapısı taksi ücreti, hopa sarp dolmuş, rize airport to batumi, rize artvin airport batumi, how to get from rize airport to batumi, sarp border batumi">
<link rel="canonical" href="%(url)s">
<meta property="og:type" content="article">
<meta property="og:title" content="Rize-Artvin Havalimanı'ndan Sarp ve Batum'a — Adım Adım Rota">
<meta property="og:description" content="Havaş + dolmuş mu, taksi mi? Ücretler, süreler ve sınır notları. Türkçe · English · ქართული">
<meta property="og:image" content="https://www.artvinrehber.com/otogar-foto-3.jpg">
<meta property="og:url" content="%(url)s">
<meta property="og:locale" content="tr_TR">
<meta property="og:locale:alternate" content="en_US">
<meta property="og:locale:alternate" content="ka_GE">
<meta name="twitter:card" content="summary_large_image">
<meta name="geo.region" content="TR-08">
<meta name="geo.placename" content="Sarp, Kemalpaşa, Artvin">
<meta name="geo.position" content="41.5167;41.5469">
<meta name="ICBM" content="41.5167, 41.5469">
<meta name="theme-color" content="#0c2a3a">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&family=Noto+Sans+Georgian:wght@400;600;700&display=swap" rel="stylesheet">
%(lds)s<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5859270127915377" crossorigin="anonymous"></script>
<style>
:root{--deniz:#0c2a3a;--deniz2:#123b50;--dalga:#1f7a8c;--kum:#f5eedf;--kum2:#ebe1cc;--kirmizi:#d7263d;--yazi:#16222b;--sol:#5a6a75;--yesil:#1e8a5a;--altin:#e9b44c}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:'Figtree','Noto Sans Georgian',system-ui,sans-serif;background:var(--kum);color:var(--yazi);line-height:1.6;overflow-x:hidden}
[lang="ka"]{font-family:'Noto Sans Georgian','Figtree',sans-serif}
html[data-lang="tr"] [data-l]:not([data-l="tr"]),html[data-lang="en"] [data-l]:not([data-l="en"]),html[data-lang="ka"] [data-l]:not([data-l="ka"]){display:none!important}
.wrap{max-width:720px;margin:0 auto;padding:0 18px}
a{color:var(--dalga)}
.ust{background:var(--deniz);color:#fff;position:sticky;top:0;z-index:30;border-bottom:1px solid rgba(255,255,255,.08)}
.ust .wrap{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:10px;padding-bottom:10px}
.ust a.logo{color:#fff;text-decoration:none;font-weight:800;font-size:.95rem;letter-spacing:.02em}
.dil{display:flex;background:rgba(255,255,255,.1);border-radius:999px;padding:3px}
.dil button{font:inherit;font-size:.8rem;font-weight:700;color:#cfe3ea;background:none;border:0;border-radius:999px;padding:6px 11px;cursor:pointer}
.dil button.on{background:#fff;color:var(--deniz)}
.hero{background:linear-gradient(180deg,var(--deniz) 0%%,var(--deniz2) 100%%);color:#fff;padding:26px 0 70px;position:relative;overflow:hidden}
.hero:after{content:"";position:absolute;left:-10%%;right:-10%%;bottom:-2px;height:60px;background:var(--kum);border-radius:50%% 50%% 0 0/100%% 100%% 0 0}
.hero .kat{display:inline-flex;gap:6px;align-items:center;font-size:.78rem;font-weight:700;background:rgba(255,255,255,.12);border-radius:999px;padding:4px 12px;margin-bottom:12px}
.hero h1{font-size:clamp(1.7rem,6.5vw,2.5rem);line-height:1.12;font-weight:800;letter-spacing:-.01em;margin-bottom:10px}
.hero p{color:#cfe3ea;font-size:1.02rem;max-width:56ch}
.cizgi{display:flex;align-items:center;margin-top:22px;gap:0}
.cizgi span{flex:none;font-size:1.25rem;width:40px;height:40px;border-radius:50%%;background:#fff;color:var(--deniz);display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 4px rgba(255,255,255,.15)}
.cizgi i{flex:1;height:3px;background:repeating-linear-gradient(90deg,#fff 0 8px,transparent 8px 14px);opacity:.6}
.cizgi-ad{display:flex;justify-content:space-between;font-size:.72rem;color:#cfe3ea;margin-top:6px}
.rakam{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:-40px 0 0;position:relative;z-index:2}
.rakam div{background:#fff;border-radius:14px;padding:12px 10px;text-align:center;box-shadow:0 6px 20px rgba(12,42,58,.1)}
.rakam b{display:block;font-size:1.35rem;font-weight:800;color:var(--deniz)}
.rakam small{font-size:.74rem;color:var(--sol);line-height:1.3;display:block}
section{padding:30px 0 6px}
h2{font-size:1.45rem;line-height:1.2;font-weight:800;color:var(--deniz);margin-bottom:6px}
.lead{color:var(--sol);margin-bottom:14px;font-size:.98rem}
/* seçici */
.secici{background:#fff;border-radius:18px;padding:16px;box-shadow:0 4px 16px rgba(12,42,58,.07)}
.sor{font-size:.86rem;font-weight:700;color:var(--deniz);margin:10px 0 6px}
.sor:first-child{margin-top:0}
.sg{display:flex;gap:6px;flex-wrap:wrap}
.sg button{font:inherit;font-size:.9rem;font-weight:600;border:1.5px solid #cfdde3;background:#fff;color:var(--yazi);border-radius:12px;padding:9px 14px;cursor:pointer}
.sg button.on{background:var(--deniz);border-color:var(--deniz);color:#fff}
.sonuc{margin-top:16px;border-radius:14px;padding:14px 16px;background:linear-gradient(135deg,#e7f4f1,#f1f8fb);border:1.5px solid #b9dcd3}
.sonuc small{display:block;font-size:.74rem;font-weight:700;color:var(--yesil)}
.sonuc b{display:block;font-size:1.3rem;color:var(--deniz);margin:2px 0 4px}
.sonuc p{font-size:.95rem}
/* karşılaştırma */
.kars{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.kk{background:#fff;border-radius:16px;padding:14px;border-top:5px solid var(--dalga);box-shadow:0 4px 16px rgba(12,42,58,.07)}
.kk.t{border-top-color:var(--altin)}
.kk h3{font-size:1.02rem;margin-bottom:8px;color:var(--deniz)}
.kk dl{display:grid;gap:6px}
.kk dt{font-size:.72rem;color:var(--sol);font-weight:600}
.kk dd{font-size:.95rem;font-weight:700;line-height:1.3}
.kk dd small{display:block;font-weight:500;font-size:.78rem;color:var(--sol)}
/* rota */
.yon{display:inline-flex;background:#fff;border-radius:999px;padding:4px;margin-bottom:14px;box-shadow:0 2px 8px rgba(12,42,58,.08)}
.yon button{font:inherit;font-weight:700;font-size:.88rem;border:0;background:none;border-radius:999px;padding:8px 16px;cursor:pointer;color:var(--sol)}
.yon button.on{background:var(--kirmizi);color:#fff}
.rota{list-style:none;position:relative;padding-left:4px}
.rota:before{content:"";position:absolute;left:23px;top:20px;bottom:20px;width:3px;background:linear-gradient(var(--dalga),var(--kirmizi));border-radius:2px}
.durak{display:flex;gap:12px;align-items:center;position:relative;padding:4px 0}
.nok{flex:none;width:42px;height:42px;border-radius:50%%;background:#fff;border:3px solid var(--dalga);display:flex;align-items:center;justify-content:center;font-size:1.1rem;z-index:1}
.durak.son .nok{border-color:var(--kirmizi)}
.durak b{display:block;font-size:1.02rem;color:var(--deniz);line-height:1.25}
.durak small{font-size:.8rem;color:var(--sol)}
.ara{display:flex;gap:12px;padding:6px 0 6px 0}
.ara .ik{flex:none;width:42px;text-align:center;font-size:.95rem;padding-top:12px;z-index:1}
.ara > div{background:#fff;border-radius:14px;padding:11px 13px;font-size:.93rem;box-shadow:0 2px 10px rgba(12,42,58,.06);flex:1}
.ara .alt{margin-top:7px;font-size:.84rem;color:var(--sol);border-top:1px dashed #dde6ea;padding-top:7px}
/* uyruk */
.uy{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.uy button{font:inherit;font-weight:700;font-size:.9rem;border:1.5px solid #cfdde3;background:#fff;border-radius:999px;padding:8px 14px;cursor:pointer}
.uy button.on{background:var(--deniz);border-color:var(--deniz);color:#fff}
.uyk{background:#fff;border-radius:16px;padding:6px 16px;box-shadow:0 4px 16px rgba(12,42,58,.07)}
.ul{list-style:none}
.ul li{padding:10px 0 10px 26px;position:relative;font-size:.95rem;border-bottom:1px dashed #e2e9ec}
.ul li:last-child{border:0}
.ul li:before{content:"✓";position:absolute;left:2px;top:10px;color:var(--yesil);font-weight:800}
.ip{background:#fff7e3;border:1px solid #f0d58f;border-radius:14px;padding:13px 15px;font-size:.92rem;margin-top:12px}
details.q{background:#fff;border-radius:12px;margin-bottom:8px;border:1px solid #e0e8eb}
details.q summary{cursor:pointer;padding:13px 15px;font-weight:700;font-size:.97rem;list-style:none;display:flex;justify-content:space-between;gap:10px}
details.q summary::-webkit-details-marker{display:none}
details.q summary:after{content:"+";font-weight:400;font-size:1.3rem;color:var(--sol)}
details.q[open] summary:after{content:"−"}
details.q p{padding:0 15px 13px;font-size:.94rem}
.linkler{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}
.linkler a{background:#fff;border-radius:12px;padding:12px;text-decoration:none;color:var(--deniz);font-weight:700;font-size:.9rem;border:1px solid #e0e8eb}
.not{font-size:.78rem;color:var(--sol);margin-top:10px}
footer{text-align:center;font-size:.8rem;color:var(--sol);padding:30px 18px}
button:focus-visible,a:focus-visible,summary:focus-visible{outline:3px solid var(--altin);outline-offset:2px}
@media(max-width:380px){.kars{grid-template-columns:1fr}.rakam b{font-size:1.15rem}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
</style>
</head>
<body>
<div class="ust"><div class="wrap"><a class="logo" href="/">ARTVİN REHBERİ</a>
<div class="dil" role="group" aria-label="Dil / Language"><button data-dil="tr" class="on">TR</button><button data-dil="en">EN</button><button data-dil="ka">ქარ</button></div></div></div>

<header class="hero"><div class="wrap">
<span class="kat">✈️ → 🛂 → 🇬🇪 %(kat)s</span>
<h1>%(h1)s</h1>
<p>%(alt)s</p>
<div class="cizgi" aria-hidden="true"><span>✈️</span><i></i><span>🚐</span><i></i><span>🛂</span><i></i><span>🏙️</span></div>
<div class="cizgi-ad" aria-hidden="true"><span>RZV</span><span>%(hopa)s</span><span>%(sarp)s</span><span>%(batum)s</span></div>
</div></header>

<div class="wrap">
<div class="rakam">
<div><b>76 km</b><small>%(r1)s</small></div>
<div><b>20 km</b><small>%(r2)s</small></div>
<div><b>7/24</b><small>%(r3)s</small></div>
</div>

<section id="secici">
<h2>%(s_h)s</h2>
<p class="lead">%(s_l)s</p>
<div class="secici">%(secici)s
<div class="sonuc" id="sonuc" aria-live="polite"><small id="sonucUst"></small><b id="sonucAd"></b><p id="sonucMetin"></p></div>
</div>
</section>

<section>
<h2>%(k_h)s</h2>
<div class="kars">
<div class="kk"><h3>🚌 %(k1)s</h3><dl>
<dt>%(ucret)s</dt><dd>320 ₺ <small>%(k1u)s</small></dd>
<dt>%(sure)s</dt><dd>%(k1s)s</dd>
<dt>%(dikkat)s</dt><dd><small>%(k1d)s</small></dd></dl></div>
<div class="kk t"><h3>🚕 %(k2)s</h3><dl>
<dt>%(ucret)s</dt><dd>3.500 ₺ <small>%(k2u)s</small></dd>
<dt>%(sure)s</dt><dd>%(k2s)s</dd>
<dt>%(dikkat)s</dt><dd><small>%(k2d)s</small></dd></dl></div>
</div>
<p class="not">%(k_not)s</p>
</section>

<section id="rota">
<h2>%(r_h)s</h2>
<div class="yon" role="tablist"><button data-yon="gidis" class="on">%(gidis)s</button><button data-yon="donus">%(donus)s</button></div>
<ol class="rota" id="rGidis">%(gidisL)s</ol>
<ol class="rota" id="rDonus" hidden>%(donusL)s</ol>
</section>

<section id="sinir">
<h2>%(u_h)s</h2>
<p class="lead">%(u_l)s</p>
<div class="uy" role="tablist"><button data-u="tr" class="on">🇹🇷 %(u1)s</button><button data-u="ge">🇬🇪 %(u2)s</button><button data-u="diger">🌍 %(u3)s</button></div>
<div class="uyk"><div data-uk="tr">%(uk_tr)s</div><div data-uk="ge" hidden>%(uk_ge)s</div><div data-uk="diger" hidden>%(uk_diger)s</div></div>
<div class="ip">%(ip)s</div>
</section>

<section id="sss">
<h2>%(sss_h)s</h2>
%(sss)s
<div class="linkler">
<a href="/havas.html">🚌 %(l1)s</a><a href="/sarp-sinir-kapisi.html">🛂 %(l2)s</a>
<a href="/taksi.html">🚕 %(l3)s</a><a href="/yol-hopa-sarp.html">🚧 %(l4)s</a>
</div>
<p class="not">%(guncel)s</p>
</section>
</div>
<footer>© 2026 Artvin Rehber · artvinrehber.com</footer>
<script>
(function(){
var S=%(secimjs)s, U=%(uijs)s;
var root=document.documentElement, dil='tr';
function setDil(d){ if(!U[d]) d='tr'; dil=d; root.setAttribute('data-lang',d); root.lang=d;
  [].forEach.call(document.querySelectorAll('.dil button'),function(b){b.classList.toggle('on',b.getAttribute('data-dil')===d);});
  try{localStorage.setItem('sbDil',d);}catch(e){} hesapla(); }
document.querySelector('.dil').addEventListener('click',function(e){var b=e.target.closest('button');if(b)setDil(b.getAttribute('data-dil'));});
var sec={saat:'gunduz',kisi:'az',bagaj:'hafif',oncelik:'ucuz'};
[].forEach.call(document.querySelectorAll('.sg'),function(g){g.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
  [].forEach.call(g.children,function(x){x.classList.toggle('on',x===b);}); sec[g.getAttribute('data-g')]=b.getAttribute('data-v'); hesapla();});});
function hesapla(){
  var k = sec.saat==='gece'?'taksi_gece': sec.kisi==='cok'?'taksi_grup': sec.bagaj==='agir'?'taksi_bagaj': sec.oncelik==='hizli'?'taksi_hiz':'havas';
  var r=S[k][dil]; document.getElementById('sonucUst').textContent=U[dil].oneri; document.getElementById('sonucAd').textContent=r[0]; document.getElementById('sonucMetin').textContent=r[1];
}
document.querySelector('.yon').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var y=b.getAttribute('data-yon');
  [].forEach.call(this.children,function(x){x.classList.toggle('on',x===b);}); document.getElementById('rGidis').hidden=y!=='gidis'; document.getElementById('rDonus').hidden=y!=='donus';});
document.querySelector('.uy').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var u=b.getAttribute('data-u');
  [].forEach.call(this.children,function(x){x.classList.toggle('on',x===b);}); [].forEach.call(document.querySelectorAll('[data-uk]'),function(x){x.hidden=x.getAttribute('data-uk')!==u;});});
var q=(location.search.match(/[?&]lang=(tr|en|ka)/)||[])[1], s=null; try{s=localStorage.getItem('sbDil');}catch(e){}
var n=(navigator.language||'').slice(0,2);
setDil(q||s||(n==='ka'?'ka':n==='tr'?'tr':(n?'en':'tr')));
if((q||s||n)==='ka'){var gb=document.querySelector('.uy [data-u="ge"]'); if(gb) gb.click();}
})();
</script>
<script src="/yorum.js" defer></script>
</body>
</html>''' % dict(
        url=URL, lds=lds,
        kat=L('Ulaşım rehberi','Transfer guide','გზამკვლევი'),
        h1=L("Rize-Artvin Havalimanı'ndan Sarp ve Batum'a nasıl gidilir?","Rize-Artvin Airport to Sarp and Batumi","რიზე-ართვინის აეროპორტიდან სარფსა და ბათუმამდე"),
        alt=L("Havaş + dolmuş mu, taksi mi? Ücret, süre ve sınır notları; adım adım rota. Türkçe, English, ქართული.",
              "Bus + minibus or taxi? Prices, times and border notes, step by step.",
              "ავტობუსი და მიკროავტობუსი თუ ტაქსი? ფასები, დრო და საზღვრის შესახებ — ნაბიჯ-ნაბიჯ."),
        hopa=L('Hopa','Hopa','ჰოფა'), sarp=L('Sarp','Sarp','სარფი'), batum=L('Batum','Batumi','ბათუმი'),
        r1=L('Havalimanı – Sarp','Airport – Sarp','აეროპორტი – სარფი'),
        r2=L('Sarp – Batum','Sarp – Batumi','სარფი – ბათუმი'),
        r3=L('Sınır kapısı açık','Border open','საზღვარი ღიაა'),
        s_h=L('Hangisi bana uygun?','Which option suits me?','რომელი მერგება?'),
        s_l=L('Dört soruya dokunun, size uygun yolu gösterelim.','Tap four quick answers and we\'ll suggest the best way.','უპასუხეთ ოთხ კითხვას და გირჩევთ საუკეთესო გზას.'),
        secici=SECICI,
        k_h=L('Yan yana: Havaş + dolmuş ya da taksi','Side by side: bus + minibus or taxi','შედარება: ავტობუსი + მიკროავტობუსი თუ ტაქსი'),
        k1=L('Havaş + dolmuş','Havaş + minibus','Havaş + მიკრო'), k2=L('Taksi','Taxi','ტაქსი'),
        ucret=L('Ücret','Price','ფასი'), sure=L('Süre','Time','დრო'), dikkat=L('Dikkat','Note','შენიშვნა'),
        k1u=L('Havaş · + Hopa–Sarp dolmuşu (ücreti durakta sorun)','Havaş · + Hopa–Sarp minibus (ask fare at stop)','Havaş · + ჰოფა–სარფის მიკრო (ფასი იკითხეთ)'),
        k1s=L('~2–2,5 saat <small>bekleme ve aktarma dahil</small>','~2–2.5 h <small>incl. waiting and transfer</small>','~2–2,5 სთ <small>ლოდინის ჩათვლით</small>'),
        k1d=L('Havaş, uçak indikten 45 dk – 1 saat sonra kalkar. Dolmuş gece çalışmaz.','Havaş leaves 45 min – 1 h after landing. No minibus at night.','Havaş გადის ჩამოფრენიდან 45 წთ – 1 სთ-ში. ღამით მიკრო არ მუშაობს.'),
        k2u=L('Havalimanı → Sarp (Rize tarifesi)','Airport → Sarp (Rize tariff)','აეროპორტი → სარფი (რიზეს ტარიფი)'),
        k2s=L('~1–1,5 saat <small>76 km, aktarma yok</small>','~1–1.5 h <small>76 km, no transfer</small>','~1–1,5 სთ <small>76 კმ, გადაჯდომის გარეშე</small>'),
        k2d=L('Dönüşte Sarp → havalimanı 4.500 ₺ (Artvin tarifesi). İki ilin tarifesi farklıdır.','Return Sarp → airport is 4,500 TRY (Artvin tariff); the provinces\' tariffs differ.','უკან სარფი → აეროპორტი 4 500 ლირა (ართვინის ტარიფი).'),
        k_not=L('Süreler yaklaşıktır; trafik, uçuş saati ve sınır yoğunluğuna göre değişir.','Times are approximate and depend on traffic, flight times and border queues.','დრო მიახლოებითია და დამოკიდებულია მოძრაობასა და საზღვარზე რიგზე.'),
        r_h=L('Adım adım rota','Step by step','ნაბიჯ-ნაბიჯ'),
        gidis=L('Havalimanı → Batum','Airport → Batumi','აეროპორტი → ბათუმი'), donus=L('Batum → Havalimanı','Batumi → Airport','ბათუმი → აეროპორტი'),
        gidisL=GIDIS, donusL=DONUS,
        u_h=L('Sınırda neye dikkat?','At the border','საზღვარზე'),
        u_l=L('Uyruğunuzu seçin.','Choose your nationality.','აირჩიეთ მოქალაქეობა.'),
        u1=L('Türk vatandaşı','Turkish citizen','თურქეთის მოქალაქე'), u2=L('Gürcistan vatandaşı','Georgian citizen','საქართველოს მოქალაქე'), u3=L('Diğer','Other','სხვა'),
        uk_tr=liste(UYRUK['tr']), uk_ge=liste(UYRUK['ge']), uk_diger=liste(UYRUK['diger']),
        ip=L('💡 Sınırda Setur Duty Free, market, ATM ve sigorta acentesi var. Yaz ve bayramlarda kuyruk uzayabilir; gece ve hafta içi geçiş daha hızlıdır.',
             '💡 The border has duty-free shops, a market, ATMs and an insurance agent. Queues get long in summer and on holidays; nights and weekdays are faster.',
             '💡 საზღვარზე არის Duty Free, მაღაზია, ბანკომატი და სადაზღვევო აგენტი. ზაფხულსა და დღესასწაულებზე რიგი გრძელია; ღამით და სამუშაო დღეებში უფრო სწრაფია.'),
        sss_h=L('Sık sorulanlar','FAQ','ხშირი კითხვები'), sss=sss_html(),
        l1=L('Havaş saatleri','Havaş timetable','Havaş-ის განრიგი'), l2=L('Sarp Sınır Kapısı rehberi','Sarp border guide','სარფის საზღვარი'),
        l3=L('Taksi ücretleri','Taxi fares','ტაქსის ფასები'), l4=L('Hopa–Sarp yolu','Hopa–Sarp road','ჰოფა–სარფის გზა'),
        guncel=L('Son güncelleme: 2 Ekim 2026. Ücretler değişebilir; yola çıkmadan teyit edin.','Last updated: 2 October 2026. Prices may change; confirm before you travel.','ბოლო განახლება: 2026 წლის 2 ოქტომბერი. ფასები შეიძლება შეიცვალოს.'),
        secimjs=json.dumps(SECIM_JS, ensure_ascii=False), uijs=json.dumps(UI_JS, ensure_ascii=False),
    )

open(os.path.join(KOK, 'havalimani-sarp-batum.html'), 'w', encoding='utf-8').write(sayfa())
print('yazıldı havalimani-sarp-batum.html')
