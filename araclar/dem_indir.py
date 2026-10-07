#!/usr/bin/env python3
"""Artvin için gerçek yükseklik verisi (AWS Terrain Tiles, Terrarium formatı, açık veri) indirir,
birleştirir ve 3D ilçe haritası için küçük bir yükseklik haritası üretir: /veri/artvin-dem.png
Terrarium kodlaması korunur: yükseklik = R*256 + G + B/256 - 32768 (metre)."""
import math, io, os, urllib.request
from PIL import Image
Z=10; LAT0,LAT1,LON0,LON1=40.55,41.62,41.15,42.65
def tx(lon): return (lon+180)/360*2**Z
def ty(lat): r=math.radians(lat); return (1-math.log(math.tan(r)+1/math.cos(r))/math.pi)/2*2**Z
x0,x1=int(tx(LON0)),int(tx(LON1)); y0,y1=int(ty(LAT1)),int(ty(LAT0))
W=(x1-x0+1)*256; H=(y1-y0+1)*256; mo=Image.new('RGB',(W,H))
for x in range(x0,x1+1):
    for y in range(y0,y1+1):
        u='https://s3.amazonaws.com/elevation-tiles-prod/terrarium/%d/%d/%d.png'%(Z,x,y)
        im=Image.open(io.BytesIO(urllib.request.urlopen(u,timeout=60).read())).convert('RGB')
        mo.paste(im,((x-x0)*256,(y-y0)*256))
# bbox'a kırp (piksel koordinatı)
px=lambda lon:(tx(lon)-x0)*256; py=lambda lat:(ty(lat)-y0)*256
mo=mo.crop((int(px(LON0)),int(py(LAT1)),int(px(LON1)),int(py(LAT0))))
# 512 genişliğe indir (en yakın komşu: kodlama bozulmasın)
w=512; h=round(mo.height*w/mo.width); mo=mo.resize((w,h),Image.NEAREST)
os.makedirs('veri',exist_ok=True); mo.save('veri/artvin-dem.png',optimize=True)
open('veri/artvin-dem.json','w').write('{"lat0":%s,"lat1":%s,"lon0":%s,"lon1":%s,"w":%d,"h":%d,"kaynak":"AWS Terrain Tiles (Terrarium), Mapzen/Tilezen açık verisi"}'%(LAT0,LAT1,LON0,LON1,w,h))
print('tamam',w,h)
