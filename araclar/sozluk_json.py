"""Artvin Sözlük sayfasındaki kelimeleri küçük bir JSON'a çıkarır (ana sayfadaki 'Günün kelimesi' hikâyesi için).
Sıra sayfadakiyle aynıdır; böylece ana sayfa ile sözlük sayfası aynı günde aynı kelimeyi gösterir."""
import re, json, html
s = open('artvin-sozluk.html', encoding='utf-8').read()
kel = []
for sec in re.finditer(r'<section class="harf" id="([^"]+)"[^>]*>(.*?)</section>', s, re.S):
    if sec.group(1) == 'okur': continue
    for m in re.finditer(r'<div class="m" id="([^"]+)"><dt>(.*?)</dt><dd>(.*?)</dd>', sec.group(2), re.S):
        t = lambda x: html.unescape(re.sub(r'<[^>]+>', '', x)).strip()
        kel.append([t(m.group(2)), t(m.group(3)), m.group(1)])
assert len(kel) > 100, len(kel)
json.dump({'k': kel}, open('veri/sozluk.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(len(kel), 'kelime')
