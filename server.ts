// SERVER EXPRESS DENGAN VITE MIDDLEWARE & PROXY API TERINTEGRASI
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const Site = 'https://whatsapp.com';
const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'id,id-ID;q=0.9,en-US;q=0.8,en;q=0.7',
  'Cache-Control': 'no-cache',
};

// FUNGSI NORMALISASI FORMAT URL WHATSAPP
function normalizeUrl(input: string): string {
  const s = String(input || '').trim();
  if (!s) return 'https://whatsapp.com/channel/0029VbCz8aUHAdNOPaBL1P3j';
  if (/^https?:\/\//i.test(s)) {
    return s.replace(/["'\s]+$/, '').replace(/\/+$/, '');
  }
  return `${Site}/channel/${s.replace(/^@/, '')}`;
}

// PARSER METADATA SALURAN DAN GRUP WHATSAPP
function parseWhatsAppResource(html: string, url: string) {
  const $ = cheerio.load(html);
  const og = (p: string) => $(`meta[property="og:${p}"]`).attr('content') || null;
  const nm = (n: string) => $(`meta[name="${n}"]`).attr('content') || null;

  const isGroup = url.includes('chat.whatsapp.com') || html.includes('Undangan Grup WhatsApp') || html.includes('WhatsApp Group Invite');

  let name = og('title') || $('title').text().trim() || null;
  const rawDesc = og('description') || nm('description') || null;
  let profileImage = og('image') || null;

  let channelType = isGroup ? 'Grup WhatsApp' : 'Saluran';
  let followers: string | null = isGroup ? 'Komunitas Aktif' : null;
  let description: string | null = null;
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

// CACHE IN-MEMORY DENGAN TTL 180 DETIK (HEMAT BANDWIDTH & RESPONSE CEPAT)
const CACHE_TTL_MS = 180 * 1000;
const cache: Record<string, { data: any; timestamp: number }> = {};

// ENDPOINT INFORMASI SALURAN DAN GRUP WHATSAPP
app.get(['/api/whatsapp-channel', '/api/whatsapp-info'], async (req, res) => {
  const rawUrl = (req.query.url as string) || 'https://whatsapp.com/channel/0029VbCz8aUHAdNOPaBL1P3j';
  const targetUrl = normalizeUrl(rawUrl);

  const existingCache = cache[targetUrl];
  if (existingCache && (Date.now() - existingCache.timestamp < CACHE_TTL_MS)) {
    return res.json({
      success: true,
      cached: true,
      ...existingCache.data
    });
  }

  try {
    const response = await axios.get(targetUrl, {
      headers: HEADERS,
      timeout: 7000,
      validateStatus: () => true,
    });

    if (response.status !== 200) {
      if (existingCache) {
        return res.json({
          success: true,
          cached: true,
          ...existingCache.data
        });
      }
      return res.status(response.status).json({
        success: false,
        error: `WhatsApp returned HTTP ${response.status}`,
        url: targetUrl
      });
    }

    const parsed = parseWhatsAppResource(response.data, targetUrl);
    const result = {
      url: targetUrl,
      ...parsed,
      last_updated: new Date().toISOString()
    };

    cache[targetUrl] = {
      data: result,
      timestamp: Date.now()
    };

    return res.json({
      success: true,
      cached: false,
      ...result
    });
  } catch (err: any) {
    if (existingCache) {
      return res.json({
        success: true,
        cached: true,
        ...existingCache.data
      });
    }
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch WhatsApp info',
      url: targetUrl
    });
  }
});

// ENDPOINT LIVE STATISTIK SERVER DISCORD (ONLINE & TOTAL MEMBER DENGAN CACHE)
app.get('/api/discord-info', async (req, res) => {
  const code = (req.query.code as string) || 'aDmrbdKanG';
  const cacheKey = `discord_${code}`;

  const existingCache = cache[cacheKey];
  if (existingCache && (Date.now() - existingCache.timestamp < CACHE_TTL_MS)) {
    return res.json(existingCache.data);
  }

  try {
    const response = await axios.get(`https://discord.com/api/v10/invites/${code}?with_counts=true`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        Accept: 'application/json',
      },
      timeout: 6000,
      validateStatus: () => true,
    });

    if (response.status === 200 && response.data) {
      const data = response.data;
      const guild = data.guild || {};
      const iconUrl = guild.id && guild.icon
        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=128`
        : null;

      const payload = {
        success: true,
        name: guild.name || 'DANS HUB',
        description: guild.description || 'Komunitas Discord DANS HUB resmi untuk voice chat, diskusi coding, mabar, dan sharing project.',
        online: data.approximate_presence_count || 0,
        members: data.approximate_member_count || 0,
        icon: iconUrl,
        inviteUrl: `https://discord.gg/${code}`,
        verified: Array.isArray(guild.features) && guild.features.includes('VERIFIED')
      };

      cache[cacheKey] = {
        data: payload,
        timestamp: Date.now()
      };

      return res.json(payload);
    }

    if (existingCache) {
      return res.json(existingCache.data);
    }

    return res.status(response.status).json({
      success: false,
      error: `Discord returned HTTP ${response.status}`,
    });
  } catch (err: any) {
    if (existingCache) {
      return res.json(existingCache.data);
    }
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to fetch Discord info',
    });
  }
});

// ENDPOINT PROXY GAMBAR DENGAN HEADER CACHING 24 JAM
app.get('/api/image-proxy', async (req, res) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) {
    return res.status(400).send('Invalid image URL');
  }

  try {
    const imgRes = await axios.get(imageUrl, {
      headers: {
        'User-Agent': HEADERS['User-Agent'],
        Accept: 'image/*,*/*',
      },
      responseType: 'arraybuffer',
      timeout: 12000,
      validateStatus: () => true,
    });

    if (imgRes.status === 200) {
      const contentType = imgRes.headers['content-type'] || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(Buffer.from(imgRes.data));
    }
    return res.status(imgRes.status).send('Failed to fetch image');
  } catch (err) {
    return res.status(500).send('Error proxying image');
  }
});

// INISIALISASI SERVER EXPRESS DAN MOUNT VITE MIDDLEWARES
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
