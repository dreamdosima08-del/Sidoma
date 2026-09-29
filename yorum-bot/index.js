// Artvin Rehberi — yeni yorum Telegram bildirimi (Cloudflare Worker)
// Her dakika çalışır, son 1 dakikada yazılan yorumları Telegram'dan yollar.
// Gerekli ayarlar (Settings > Variables and Secrets):
//   TELEGRAM_TOKEN  (Secret)  -> BotFather'ın verdiği token
//   CHAT_ID         (Text)    -> senin sohbet numaran
const PROJE = 'artvin-imece';
const API_KEY = 'AIzaSyDPPh1T_PLdfbuQdYbP-HXrnc3a5Nb1nzI';

async function yeniYorumlar(bas, son) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJE}/databases/(default)/documents:runQuery?key=${API_KEY}`;
  const govde = { structuredQuery: {
    from: [{ collectionId: 'sayfa_yorum' }],
    where: { compositeFilter: { op: 'AND', filters: [
      { fieldFilter: { field: { fieldPath: 'zaman' }, op: 'GREATER_THAN', value: { timestampValue: new Date(bas).toISOString() } } },
      { fieldFilter: { field: { fieldPath: 'zaman' }, op: 'LESS_THAN_OR_EQUAL', value: { timestampValue: new Date(son).toISOString() } } }
    ] } },
    orderBy: [{ field: { fieldPath: 'zaman' }, direction: 'ASCENDING' }],
    limit: 20 } };
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(govde) });
  if (!r.ok) throw new Error('Firestore ' + r.status);
  const a = await r.json();
  return a.filter(x => x.document).map(x => {
    const f = x.document.fields || {};
    return { ad: (f.ad || {}).stringValue || 'Ziyaretçi', sayfa: (f.sayfa || {}).stringValue || '', metin: (f.metin || {}).stringValue || '' };
  });
}

async function telegram(env, metin) {
  const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: env.CHAT_ID, text: metin, disable_web_page_preview: true })
  });
  if (!r.ok) throw new Error('Telegram ' + r.status);
}

export default {
  async scheduled(event, env, ctx) {
    const son = event.scheduledTime;
    const liste = await yeniYorumlar(son - 60000, son);
    for (const y of liste) {
      const sayfa = y.sayfa ? `https://artvinrehber.com/${y.sayfa}.html#yorumlar` : '';
      await telegram(env, `💬 Yeni yorum\n👤 ${y.ad}\n📄 ${y.sayfa}\n\n${y.metin}\n\n${sayfa}`);
    }
  },
  // Tarayıcıdan worker adresini açınca: sohbet numaranı bulmana yardım eder (bir kere kullan)
  async fetch(request, env) {
    const u = new URL(request.url);
    if (u.pathname === '/chatid') {
      const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/getUpdates`);
      const j = await r.json();
      const idler = [...new Set((j.result || []).map(x => x.message && x.message.chat && x.message.chat.id).filter(Boolean))];
      return new Response(idler.length ? 'Sohbet numaran: ' + idler.join(', ') : 'Bulunamadı. Botuna Telegram\'dan bir mesaj yaz, sonra sayfayı yenile.');
    }
    if (u.pathname === '/test') {
      await telegram(env, '✅ Yorum botu çalışıyor.');
      return new Response('Test mesajı gönderildi.');
    }
    return new Response('Yorum botu çalışıyor.');
  }
};
