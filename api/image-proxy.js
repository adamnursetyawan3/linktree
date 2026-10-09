// ENDPOINT PROXY GAMBAR UNTUK MENGHINDARI CORS DAN MEMPERCEPAT CACHING
import axios from 'axios';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'image/*,*/*',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const imageUrl = req.query.url;
  if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) {
    return res.status(400).send('Invalid image URL');
  }

  try {
    const imgRes = await axios.get(imageUrl, {
      headers: HEADERS,
      responseType: 'arraybuffer',
      timeout: 10000,
      validateStatus: () => true,
    });

    if (imgRes.status === 200) {
      const contentType = imgRes.headers['content-type'] || 'image/jpeg';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
      return res.status(200).send(Buffer.from(imgRes.data));
    }
    return res.status(imgRes.status).send('Failed to fetch image');
  } catch (err) {
    return res.status(500).send('Error proxying image');
  }
}
