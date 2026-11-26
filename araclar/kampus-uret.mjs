// AÇÜ Kampüs Forum: Firestore'daki konulardan Google'ın okuyabileceği statik sayfalar üretir.
// Üretilenler: kampus/konu/*.html, kampus/oda/*.html, kampus/konular.json, sitemap-kampus.xml
// ve acukampus.html içindeki <!--KF:...--> işaretli bölümler.
// Kullanım: node araclar/kampus-uret.mjs            (Firestore'dan okur; okuyamazsa hiçbir şeyi silmeden durur)
//           node araclar/kampus-uret.mjs --cevrimdisi  (Firestore'a gitmez; yalnızca sabit rehber konularıyla üretir)
import fs from 'node:fs';
import path from 'node:path';

const KOK = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SITE = 'https://www.artvinrehber.com';
const CEVRIMDISI = process.argv.includes('--cevrimdisi');

const ODALAR = [
  { k: 'soru', ad: 'Soru ve yardım', ik: '❓', c: 'var(--c-soru)', ac: 'Ders kaydı, yurt, burs, sınav; aklına takılan her şey' },
  { k: 'ders', ad: 'Ders ve not', ik: '🎓', c: 'var(--c-ders)', ac: 'Ders notu, vize-final, ödev ve hoca yorumları' },
  { k: 'ilan', ad: 'İlan', ik: '🏘️', c: 'var(--c-ilan)', ac: 'Ev arkadaşı, kiralık, iş ve kayıp-buluntu' },
  { k: 'kitap', ad: 'İkinci el kitap', ik: '📚', c: 'var(--c-kitap)', ac: 'Ders kitabı al, sat, takas et' },
  { k: 'etkinlik', ad: 'Etkinlik', ik: '📢', c: 'var(--c-etkinlik)', ac: 'Kulüp, konser, turnuva ve kampüs duyuruları' },
  { k: 'mizah', ad: 'Mizah', ik: '😂', c: 'var(--c-mizah)', ac: 'Kampüs hayatının komik hâlleri' },
  { k: 'itiraf', ad: 'İtiraf ve dertleşme', ik: '🤫', c: 'var(--c-itiraf)', ac: 'İçini dök; paylaşımlar önce incelenir' }
];
const GRUPLAR = [['bolum_bilgisayar','💻','Bilgisayar Mühendisliği'],['bolum_yazilim','💻','Yazılım Mühendisliği'],['bolum_elektrik','⚡','Elektrik-Elektronik Müh.'],['bolum_cevre','🌿','Çevre Mühendisliği'],['bolum_harita','🗺️','Harita Mühendisliği'],['bolum_orman','🌲','Orman Mühendisliği'],['bolum_orman_end','🌲','Orman Endüstrisi Müh.'],['bolum_egitim','📚','Eğitim Fakültesi'],['bolum_hemsire','🏥','Hemşirelik'],['bolum_saglik','💊','Sağlık Bilimleri'],['bolum_turizm','🏨','Turizm Fakültesi'],['bolum_iktisat','📊','İktisat'],['bolum_isletme','💼','İşletme'],['bolum_mimarlik','🏛️','Mimarlık'],['bolum_peyzaj','🌺','Peyzaj Mimarlığı'],['bolum_spor','⚽','Spor Bilimleri'],['bolum_sosyoloji','📖','Sosyoloji'],['bolum_turk_dili','📖','Türk Dili ve Edebiyatı'],['bolum_ilahiyat','🕌','İlahiyat'],['prog_muhasebe','📋','Muhasebe'],['prog_bilisim','💻','Bilişim Teknolojileri'],['prog_tibbi','🏥','Tıbbi Görüntüleme'],['prog_turizm_otel','🏨','Turizm ve Otel'],['prog_insaat','🏗️','İnşaat Teknolojisi'],['prog_elektrik_p','⚡','Elektrik Programı'],['prog_cocuk','👶','Çocuk Gelişimi'],['prog_saglik','💊','Sağlık Hizmetleri'],['prog_yuksek','🎓','Lisansüstü']];
function oda(k) {
  const o = ODALAR.find(x => x.k === k); if (o) return o;
  const g = GRUPLAR.find(x => x[0] === k);
  if (g) return { k, ad: g[2], ik: g[1], c: 'var(--c-bolum)', ac: `${g[2]} öğrencilerinin odası` };
  return null;
}

/* ── yardımcılar ── */
const metinHtml = s => esc(s).replace(/https:\/\/(www\.artvinrehber\.com|drive\.google\.com|docs\.google\.com)\/[^\s<]{1,300}/g, u => { const x = u.replace(/[.,;:!?)]+$/, ''); return `<a href="${x}"${/artvinrehber/.test(x) ? '' : ' rel="noopener nofollow ugc" target="_blank"'}>${x.length > 60 ? x.slice(0, 57) + '…' : x}</a>${u.slice(x.length)}`; });
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hue = s => { let n = 0; s = String(s || ''); for (const ch of s) n = (n * 31 + ch.charCodeAt(0)) % 360; return n; };
function ayir(m) {
  m = String(m || '').replace(/\r/g, '').trim(); const i = m.indexOf('\n');
  let b = (i < 0 ? m : m.slice(0, i)).trim(), g = (i < 0 ? '' : m.slice(i + 1)).trim();
  if (b.length > 90) { let k = b.lastIndexOf(' ', 86); if (k < 40) k = 86; g = b.slice(k).trim() + (g ? '\n\n' + g : ''); b = b.slice(0, k).trim() + '…'; }
  return { b, g };
}
function slug(girdi) {
  const t = String(girdi).toLocaleLowerCase('tr').replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/â/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  let s = t; if (s.length > 60) { s = s.slice(0, 60).replace(/-[^-]*$/, ''); }
  return s || 'konu';
}
const AYLAR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
function tarih(d) { if (!d) return ''; const x = new Date(new Date(d).getTime() + 3 * 3600e3); return `${x.getUTCDate()} ${AYLAR[x.getUTCMonth()]} ${x.getUTCFullYear()}`; }
const kisalt = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; };

/* ── forum verisi (Cloudflare Worker) ── */
const API = 'https://acukampus.dreamdosima08.workers.dev';
async function konulariOku() {
  const r = await fetch(`${API}/api/disa`, { headers: { 'user-agent': 'kampus-uret' } });
  if (!r.ok) throw new Error('API ' + r.status);
  const j = await r.json();
  if (!Array.isArray(j.konular)) throw new Error('API yanıtı beklenmedik');
  return j.konular.filter(d => oda(d.oda));
}

/* ── sayfa kabuğu ── */
function kabuk({ baslik, aciklama, url, govde, ld = [], noindex = false, js = '' }) {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(baslik)}</title>
<meta name="description" content="${esc(aciklama)}">
<meta name="robots" content="${noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">
<link rel="canonical" href="${SITE}${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Artvin Rehberi">
<meta property="og:locale" content="tr_TR">
<meta property="og:title" content="${esc(baslik)}">
<meta property="og:description" content="${esc(aciklama)}">
<meta property="og:url" content="${SITE}${url}">
<meta property="og:image" content="${SITE}/img/acu-kampus-forum.jpg">
<meta name="theme-color" content="#0e6f73">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">
${ld.map(x => `<script type="application/ld+json">${JSON.stringify(x).replace(/</g, '\\u003c')}</script>`).join('\n')}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Figtree:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/kampus/forum.css">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5859270127915377" crossorigin="anonymous"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-TX994TW4PJ"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-TX994TW4PJ');</script>
</head>
<body>
${cubuk()}
<main class="w">
${govde}
</main>
${altBilgi()}
<script src="/kampus/forum.js"></script>
<script>KF.cubukBagla();${js}</script>
<script src="/uygulama-serit.js?v=3" defer></script>
</body>
</html>
`;
}
function cubuk() {
  return `<header class="bar"><div class="w">
<a class="mark" href="/acukampus.html" aria-label="AÇÜ Kampüs Forum ana sayfa">AÇÜ</a>
<a class="ad" href="/acukampus.html">AÇÜ Kampüs<small>Artvin Çoruh Üniversitesi öğrenci forumu</small></a>
<span class="sp"></span>
<span class="rumuz-c" id="btnRumuz" style="display:none"></span>
<button class="nbtn p" id="btnYeni" type="button" onclick="KF.yazAc(window.KF_ODA||'')">＋ Konu aç</button>
</div></header>`;
}
function altBilgi() {
  return `<footer class="alt"><div class="w">
<a href="/acukampus.html">AÇÜ Kampüs Forum</a> · <a href="/blog42-acu-rehberi.html">AÇÜ Rehberi</a> · <a href="/acu-tercih-rehberi.html">Tercih Rehberi</a> · <a href="/acu-ders-notu.html">Ders Notu Arşivi</a> · <a href="/artvin-kampus-ulasim.html">Kampüs Ulaşım</a><br>
AÇÜ Kampüs, Artvin Çoruh Üniversitesi ile resmi bağlantısı olmayan bağımsız bir öğrenci forumudur. Paylaşımlar yazarlarına aittir.<br>
<a href="/">Artvin Rehberi</a> · <a href="/ikinci-el-kosullar.html">Kullanım Koşulları</a> · <a href="/gizlilik.html">Gizlilik</a> · © 2026 artvinrehber.com
</div></footer>`;
}

/* ── parçalar ── */
function satir(k) {
  const r = oda(k.kategori);
  return `<a class="ks${k.sabit ? ' sb' : ''}" href="${k.url}" style="--rc:${r.c}"><span class="ik">${k.sabit ? '📌' : r.ik}</span><span class="ic"><h3>${k.sabit ? '<span class="pin">Rehber ·</span>' : ''}${esc(k.baslik)}</h3>${k.ozet ? `<p>${esc(k.ozet)}</p>` : ''}<span class="mt"><span class="oc">${esc(r.ad)}</span>${k.sabit || k.editor ? '<span class="ed">Artvin Rehberi</span>' : '<span>@' + esc(k.nick) + '</span>'}${k.tarih ? `<time datetime="${esc(k.tarihIso)}">${esc(k.tarih)}</time>` : ''}</span></span>${k.sabit ? '' : `<span class="say${k.yanit ? '' : ' yok'}"><b>${k.yanit}</b><small>yanıt</small></span>`}</a>`;
}
function konuGovde(k) {
  const r = oda(k.kategori);
  const av = (n, ed) => ed ? '<span class="av ed">AR</span>' : `<span class="av" style="--h:${hue(n)}">${esc(n.charAt(0).toLocaleUpperCase('tr'))}</span>`;
  const kim = (n, ed) => ed ? '<b>Artvin Rehberi</b> <span class="ed-et">Editör</span>' : `<b>${esc(n)}</b>`;
  const Y = k.yorumlar.map(y => `<div class="yo">${av(y.nick, y.editor)}<div class="ic">${kim(y.nick, y.editor)}<time datetime="${esc(y.olusturma || '')}">${esc(tarih(y.olusturma))}</time><p>${metinHtml(y.metin)}</p></div></div>`).join('');
  const link = (k.link && /^https:\/\/(drive|docs)\.google\.com\//.test(k.link)) ? `<a class="lnk" href="${esc(k.link)}" target="_blank" rel="noopener nofollow ugc"><span>📎</span><span>Google Drive dosyası<small>${esc(k.link.replace(/^https:\/\//, '').slice(0, 60))}</small></span></a>` : '';
  return `<article class="konu" style="--rc:${r.c}"><a class="oda-et" href="/kampus/oda/${k.kategori}.html">${r.ik} ${esc(r.ad)}</a><h1>${esc(k.baslik)}</h1>
<div class="yazar">${av(k.nick, k.editor)}<span>${kim(k.nick, k.editor)}<br><time datetime="${esc(k.tarihIso)}">${esc(k.tarih)}</time></span></div>
${k.govde ? `<div class="govde">${metinHtml(k.govde)}</div>` : ''}${link}</article>
<section class="yanitlar"><h2>${k.yorumlar.length ? k.yorumlar.length + ' yanıt' : 'Henüz yanıt yok'}</h2>${Y || '<p style="color:var(--dim);font-size:.92rem">İlk yanıtı sen yaz; bildiklerin başka bir öğrencinin işine yarar.</p>'}</section>`;
}
function yol(parcalar) { return `<nav class="yol" aria-label="Konum">${parcalar.map((p, i) => i < parcalar.length - 1 ? `<a href="${p[1]}">${esc(p[0])}</a><span>›</span>` : `<span>${esc(p[0])}</span>`).join('')}</nav>`; }
function yolLd(parcalar) { return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: parcalar.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p[0], item: SITE + p[1] })) }; }
function cagri(k) {
  return `<div class="cagri"><p><b>Aradığını bulamadın mı?</b>Sorunu ${esc(oda(k).ad)} odasında sor; AÇÜ öğrencileri yanıtlasın.</p><button class="btn-y" type="button" onclick="KF.yazAc('${k}')">＋ Yeni konu aç</button></div>`;
}

/* ── üretim ── */
async function main() {
  const sabitler = JSON.parse(fs.readFileSync(path.join(KOK, 'kampus/sabit.json'), 'utf8'));
  let ham = [];
  const veriArg = process.argv.find(a => a.startsWith('--veri='));
  if (veriArg) ham = JSON.parse(fs.readFileSync(veriArg.slice(7), 'utf8')); // yalnızca yerel deneme için
  else if (!CEVRIMDISI) ham = await konulariOku(); // hata olursa süreç durur ve hiçbir dosya silinmez
  const iso = ms => ms ? new Date(ms).toISOString() : '';
  const K = ham.map(d => {
    const y = (d.yanitlar || []).map(x => ({ metin: x.metin, olusturma: iso(x.olusturma), nick: x.editor ? 'Artvin Rehberi' : (x.rumuz || 'Anonim'), editor: !!x.editor }));
    const url = `/kampus/konu/${slug(d.baslik)}-${d.id}.html`;
    const uz = (d.baslik + (d.metin || '')).length + y.reduce((a, c) => a + c.metin.length, 0);
    return { id: d.id, url, kategori: d.oda, baslik: d.baslik, govde: d.metin || '', ozet: kisalt(d.metin, 150), nick: d.editor ? 'Artvin Rehberi' : (d.rumuz || 'Anonim'), editor: !!d.editor, link: d.link || '', begeni: d.begeni || 0, yanit: y.length, yorumlar: y,
      tarih: tarih(d.olusturma), tarihIso: iso(d.olusturma), son: iso(d.son || d.olusturma), noindex: d.oda === 'itiraf' || uz < 100 };
  });
  const S = sabitler.map(s => ({ ...s, sabit: true, url: `/kampus/konu/${slug(s.baslik)}.html`, ozet: kisalt(s.metin, 150), nick: 'Artvin Rehberi', yanit: 0, yorumlar: [], tarih: '', tarihIso: '' }));

  // eski üretilmiş sayfaları temizle (yalnızca okuma başarılıysa buraya gelinir)
  for (const dz of ['kampus/konu', 'kampus/oda']) { const p = path.join(KOK, dz); fs.mkdirSync(p, { recursive: true }); for (const f of fs.readdirSync(p)) if (f.endsWith('.html')) fs.unlinkSync(path.join(p, f)); }
  const yaz = (u, h) => fs.writeFileSync(path.join(KOK, u.replace(/^\//, '')), h);
  const harita = [];

  // konu sayfaları
  for (const k of K) {
    const r = oda(k.kategori), y = [['Artvin Rehberi', '/'], ['AÇÜ Kampüs', '/acukampus.html'], [r.ad, `/kampus/oda/${k.kategori}.html`], [k.baslik, k.url]];
    const ilgili = K.filter(x => x.kategori === k.kategori && x.id !== k.id).slice(0, 5);
    const ld = [yolLd(y), { '@context': 'https://schema.org', '@type': 'DiscussionForumPosting', headline: k.baslik, text: (k.baslik + (k.govde ? '\n' + k.govde : '')).slice(0, 5000), url: SITE + k.url, datePublished: k.tarihIso, inLanguage: 'tr',
      author: k.editor ? { '@type': 'Organization', name: 'Artvin Rehberi', url: SITE + '/' } : { '@type': 'Person', name: k.nick }, isPartOf: { '@type': 'WebPage', name: 'AÇÜ Kampüs Forum', url: SITE + '/acukampus.html' },
      interactionStatistic: [{ '@type': 'InteractionCounter', interactionType: 'https://schema.org/CommentAction', userInteractionCount: k.yanit }, { '@type': 'InteractionCounter', interactionType: 'https://schema.org/LikeAction', userInteractionCount: k.begeni }],
      comment: k.yorumlar.map(c => ({ '@type': 'Comment', text: c.metin, datePublished: c.olusturma, author: c.editor ? { '@type': 'Organization', name: 'Artvin Rehberi', url: SITE + '/' } : { '@type': 'Person', name: c.nick || 'Anonim' } })) }];
    const govde = `${yol(y)}<div class="shell"><div><div id="konuKap">${konuGovde(k)}</div>${cagri(k.kategori)}${ilgili.length ? `<div class="kutu" style="margin-top:1rem"><div class="kutu-b"><h2>${esc(r.ad)} odasından</h2><a href="/kampus/oda/${k.kategori}.html">Tümü →</a></div>${ilgili.map(satir).join('')}</div>` : ''}</div>${yanSutun()}</div>`;
    const js = `window.KF_ODA=${JSON.stringify(k.kategori)};KF.konuGetir(${k.id}).then(function(j){if(!j||!j.konu){if(j&&j.hata==='Konu bulunamadı')document.getElementById('konuKap').insertAdjacentHTML('afterbegin','<p class="uy">Bu konu kaldırılmış ya da incelemede.</p>');return;}KF.konuBagla(document.getElementById('konuKap'),j.konu,j.yanitlar,{url:${JSON.stringify(SITE + k.url)}});});`;
    yaz(k.url, kabuk({ baslik: `${k.baslik} — AÇÜ Kampüs`, aciklama: kisalt(k.govde ? `${k.baslik}. ${k.govde}` : `${k.baslik}. AÇÜ öğrencilerinin ${r.ad} odasında ${k.yanit ? k.yanit + ' yanıtlı' : 'yanıt bekleyen'} konu.`, 155), url: k.url, govde, ld, noindex: k.noindex, js }));
    if (!k.noindex) harita.push([k.url, (k.son || k.tarihIso || '').slice(0, 10)]);
  }
  // sabit rehber konuları
  for (const s of S) {
    const r = oda(s.kategori), y = [['Artvin Rehberi', '/'], ['AÇÜ Kampüs', '/acukampus.html'], [r.ad, `/kampus/oda/${s.kategori}.html`], [s.baslik, s.url]];
    const son = K.filter(x => x.kategori === s.kategori).slice(0, 5);
    const ld = [yolLd(y), { '@context': 'https://schema.org', '@type': 'Article', headline: s.baslik, url: SITE + s.url, inLanguage: 'tr', author: { '@type': 'Organization', name: 'Artvin Rehberi', url: SITE + '/' }, publisher: { '@type': 'Organization', name: 'Artvin Rehberi', url: SITE + '/' }, dateModified: '2026-11-26' }];
    const govde = `${yol(y)}<div class="shell"><div><article class="konu" style="--rc:var(--c-sabit)"><a class="oda-et" href="/kampus/oda/${s.kategori}.html">📌 Rehber konu · ${esc(r.ad)}</a><h1>${esc(s.baslik)}</h1>
<div class="yazar"><span class="av ed">AR</span><span><b>Artvin Rehberi</b><br>Editör</span></div><div class="govde">${esc(s.metin)}</div>
<div class="ilgili">${s.baglanti.map(b => `<a href="${b[1]}">${esc(b[0])}</a>`).join('')}</div></article>${cagri(s.kategori)}
${son.length ? `<div class="kutu" style="margin-top:1rem"><div class="kutu-b"><h2>${esc(r.ad)} odasındaki son konular</h2><a href="/kampus/oda/${s.kategori}.html">Tümü →</a></div>${son.map(satir).join('')}</div>` : ''}</div>${yanSutun()}</div>`;
    yaz(s.url, kabuk({ baslik: `${s.baslik} — AÇÜ Kampüs`, aciklama: kisalt(s.metin, 155), url: s.url, govde, ld, js: `window.KF_ODA=${JSON.stringify(s.kategori)};` }));
    harita.push([s.url, '2026-11-26']);
  }
  // oda sayfaları: ana odaların hepsi + konusu olan bölüm odaları
  const odaK = [...ODALAR.map(o => o.k), ...new Set(K.map(k => k.kategori).filter(k => !ODALAR.some(o => o.k === k)))];
  for (const ok of odaK) {
    const r = oda(ok), url = `/kampus/oda/${ok}.html`, y = [['Artvin Rehberi', '/'], ['AÇÜ Kampüs', '/acukampus.html'], [r.ad, url]];
    const L = [...S.filter(s => s.kategori === ok), ...K.filter(k => k.kategori === ok)];
    const gercek = K.filter(k => k.kategori === ok && !k.noindex).length;
    const govde = `${yol(y)}<div class="shell"><div><div class="kapak" style="margin-top:.8rem"><span class="rz"><i></i>AÇÜ Kampüs odası</span><h1>${r.ik} ${esc(r.ad)}</h1><p>${esc(r.ac)}. ${K.filter(k => k.kategori === ok).length} konu.</p><div class="btns"><button class="yeni" type="button" onclick="KF.yazAc('${ok}')">＋ Bu odada konu aç</button><a href="/acukampus.html">Tüm odalar</a></div></div>
<div class="kutu" style="margin-top:1rem"><div class="kutu-b"><h2>Konular</h2></div><div id="odaListe">${L.length ? L.map(satir).join('') : '<div class="bosmsj"><b>Bu odada henüz konu yok</b>İlk konuyu sen aç.</div>'}</div></div></div>${yanSutun()}</div>`;
    const ld = [yolLd(y), { '@context': 'https://schema.org', '@type': 'CollectionPage', name: `${r.ad} — AÇÜ Kampüs Forum`, url: SITE + url, inLanguage: 'tr', hasPart: L.slice(0, 50).map(k => ({ '@type': k.sabit ? 'Article' : 'DiscussionForumPosting', headline: k.baslik, url: SITE + k.url })) }];
    const noindex = ok === 'itiraf' || (gercek === 0 && !S.some(s => s.kategori === ok));
    yaz(url, kabuk({ baslik: `${r.ad} — AÇÜ Kampüs Forum | Artvin Çoruh Üniversitesi`, aciklama: kisalt(`Artvin Çoruh Üniversitesi öğrencilerinin ${r.ad} odası: ${r.ac}. Soru sor, yanıtla, paylaş.`, 155), url, govde, ld, noindex, js: `window.KF_ODA=${JSON.stringify(ok)};` }));
    if (!noindex) harita.push([url, (K.find(k => k.kategori === ok)?.son || '2026-11-26').slice(0, 10)]);
  }

  // ana sayfa verisi ve işaretli bölümler
  const ozet = { k: K.slice(0, 500).map(k => ({ i: k.id, u: k.url })), s: S.map(s => ({ b: s.baslik, u: s.url, k: s.kategori, o: s.ozet })) };
  fs.writeFileSync(path.join(KOK, 'kampus/konular.json'), JSON.stringify(ozet));
  const anaYol = path.join(KOK, 'acukampus.html');
  let ana = fs.readFileSync(anaYol, 'utf8');
  const say = {}; K.forEach(k => { say[k.kategori] = (say[k.kategori] || 0) + 1; });
  const odalarHtml = ODALAR.map(o => { const son = K.find(k => k.kategori === o.k); return `<a class="oda-s" href="/kampus/oda/${o.k}.html" style="--rc:${o.c}"><span class="ik">${o.ik}</span><span class="ic"><b>${esc(o.ad)}</b><small>${son ? esc(son.baslik) : esc(o.ac)}</small></span><span class="n">${say[o.k] || 0}<br><small>konu</small></span></a>`; }).join('');
  const sonHtml = [...S, ...K.slice(0, 20)].map(satir).join('');
  const toplamY = K.reduce((a, k) => a + k.yanit, 0);
  const degis = (ad, ic) => { const re = new RegExp(`(<!--KF:${ad}-->)[\\s\\S]*?(<!--/KF:${ad}-->)`); if (!re.test(ana)) throw new Error('acukampus.html içinde işaret yok: ' + ad); ana = ana.replace(re, (_, a, b) => a + ic + b); };
  degis('ODALAR', odalarHtml); degis('SON', sonHtml); degis('SAYI', `<div><b>${K.length}</b>konu</div><div><b>${toplamY}</b>yanıt</div><div><b>${ODALAR.length + GRUPLAR.length}</b>oda</div>`);
  fs.writeFileSync(anaYol, ana);

  // site haritası
  const sm = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${harita.map(([u, d]) => `  <url><loc>${SITE}${u}</loc>${d ? `<lastmod>${d}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`;
  fs.writeFileSync(path.join(KOK, 'sitemap-kampus.xml'), sm);
  console.log(`konu ${K.length} · sabit ${S.length} · oda ${odaK.length} · haritada ${harita.length} adres · yanıt ${toplamY}`);
}
function yanSutun() {
  return `<aside class="yan-s"><div class="kutu"><div class="kutu-b"><h2>Odalar</h2><a href="/acukampus.html">Forum →</a></div>${ODALAR.map(o => `<a class="oda-s" href="/kampus/oda/${o.k}.html" style="--rc:${o.c}"><span class="ik">${o.ik}</span><span class="ic"><b>${esc(o.ad)}</b><small>${esc(o.ac)}</small></span></a>`).join('')}</div>
<div class="kutu lnk-l" style="margin-top:1rem"><div class="kutu-b"><h2>Öğrenci rehberleri</h2></div><a href="/acu-tercih-rehberi.html">🎯 Tercih rehberi<small>Taban puanlar ve sıralamalar</small></a><a href="/acu-ders-notu.html">📚 Ders notu arşivi<small>Vize, final, ders notu</small></a><a href="/artvin-kampus-ulasim.html">🚌 Kampüs ulaşım<small>Yurtlar ve kampüslere nasıl gidilir</small></a><a href="/sehirici-dolmus.html">🚐 Şehir içi dolmuş<small>Canlı durak takibi</small></a></div></aside>`;
}
main().catch(e => { console.error(e); process.exit(1); });
