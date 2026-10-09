// ENDPOINT SERVERLESS UNTUK MENGAMBIL METADATA SALURAN DAN GRUP WHATSAPP
import axios from 'axios';
import * as cheerio from 'cheerio';

const Site = 'https://whatsapp.com';
const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'id,id-ID;q=0.9,en-US;q=0.8,en;q=0.7',
  'Cache-Control': 'no-cache',
};

function normalizeUrl(input) {
  const s = String(input || '').trim();
  if (!s) return 'https://whatsapp.com/channel/0029VbCz8aUHAdNOPaBL1P3j';
  if (/^https?:\/\//i.test(s)) {
    return s.replace(/["'\s]+$/, '').replace(/\/+$/, '');
  }
  return `${Site}/channel/${s.replace(/^@/, '')}`;
}

function parseWhatsAppResource(html, url) {
  const $ = cheerio.load(html);
  const og = (p) => $(`meta[property="og:${p}"]`).attr('content') || null;
  const nm = (n) => $(`meta[name="${n}"]`).attr('content') || null;

  const isGroup = url.includes('chat.whatsapp.com') || html.includes('Undangan Grup WhatsApp') || html.includes('WhatsApp Group Invite');

  let name = og('title') || $('title').text().trim() || null;
  const rawDesc = og('description') || nm('description') || null;
  let profileImage = og('image') || null;

  let channelType = isGroup ? 'Grup WhatsApp' : 'Saluran';
  let followers = isGroup ? 'Komunitas Aktif' : null;
  let description = null;
  let verified = false;

  if (isGroup) {
    if (name) {
      name = name.replace(/\s*\|\s*WhatsApp.*$/i, '').trim();
      if (name === 'WhatsApp Group Invite' || name === 'Undangan Grup WhatsApp') {
        const h3 = $('h3').first().text().trim();
        const h1 = $('h1').first().text().trim();
        if (h3) name = h3;
        else if (h1) name = h1;
      }
    }
    description = (rawDesc && rawDesc !== 'Undangan Grup WhatsApp' && rawDesc !== 'WhatsApp Group Invite') 
      ? rawDesc 
      : 'Grup WhatsApp resmi untuk diskusi, sharing, dan komunikasi bersama.';
    
    const partMatch = html.match(/(\d+[\d.,]*)\s*(peserta|participants|members|anggota)/i);
    if (partMatch) {
      followers = `${partMatch[1]} Peserta`;
    }
  } else {
    if (rawDesc) {
      const hm = rawDesc.match(
        /^(Channel|Community|Group|Saluran|Komunitas|Grup)\s*[•·]\s*([\d.,]+[KMB]?)\s*(followers?|pengikut)/i
      );
      if (hm) {
        channelType = hm[1];
        followers = hm[2];
        description = rawDesc.slice(hm[0].length).replace(/^[\s•·\-–—]+/, '').trim() || null;
      } else {
        const fm = rawDesc.match(/([\d.,]+[KMB]?)\s*(followers?|pengikut)/i);
        if (fm) followers = fm[1];
        description =
          rawDesc
            .replace(/^(Channel|Community|Group|Saluran|Komunitas|Grup)\s*[•·][^•·]*[•·]?\s*/i, '')
            .trim() || null;
      }
      if (description) description = description.replace(/\s+/g, ' ').trim();
    }

    if (rawDesc && /verified/i.test(rawDesc)) verified = true;
    if (
      html.includes('verified_badge') ||
      html.includes('"verified":true') ||
      html.includes('"is_verified":true') ||
      html.includes('Verified channel') ||
      html.includes('Saluran terverifikasi')
    ) verified = true;
    if ($('[aria-label*="erified" i]').length > 0) verified = true;

    if (name && /^whatsapp\b/i.test(name.trim()) && description) {
      const h1 = $('h1').first().text().trim();
      if (h1) name = h1;
    }

    if (name) {
      name = name.replace(/\s*\|\s*WhatsApp.*$/i, '').trim();
    }
  }

  return {
    name: name || (isGroup ? 'Grup WhatsApp' : 'Saluran WhatsApp'),
    description: description || (isGroup ? 'Undangan grup WhatsApp' : 'Official WhatsApp Channel'),
    followers: followers || (isGroup ? 'Komunitas' : 'Terverifikasi'),
    channel_type: channelType,
    is_group: isGroup,
    profile_image: profileImage,
    verified,
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawUrl = req.query.url || 'https://whatsapp.com/channel/0029VbCz8aUHAdNOPaBL1P3j';
  const targetUrl = normalizeUrl(rawUrl);

  try {
    const response = await axios.get(targetUrl, {
      headers: HEADERS,
      timeout: 10000,
      validateStatus: () => true,
    });

    if (response.status !== 200) {
      return res.status(response.status).json({
        success: false,
        error: `WhatsApp returned HTTP ${response.status}`,
        url: targetUrl
      });
    }

    const parsed = parseWhatsAppResource(response.data, targetUrl);
    return res.status(200).json({
      success: true,
      url: targetUrl,
      ...parsed,
      last_updated: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch WhatsApp info',
      url: targetUrl
    });
  }
}
