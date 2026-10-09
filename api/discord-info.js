export default async function handler(req, res) {
  // AKTIFKAN CORS UNTUK SERVERLESS HANDLER
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { code = 'aDmrbdKanG' } = req.query;

  try {
    const response = await fetch(`https://discord.com/api/v10/invites/${code}?with_counts=true`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: `Discord returned HTTP ${response.status}`
      });
    }

    const data = await response.json();
    const guild = data.guild || {};
    const iconUrl = guild.id && guild.icon
      ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=128`
      : null;

    return res.status(200).json({
      success: true,
      name: guild.name || 'DANS HUB',
      description: guild.description || 'Komunitas Discord DANS HUB resmi untuk voice chat, diskusi coding, mabar, dan sharing project.',
      online: data.approximate_presence_count || 0,
      members: data.approximate_member_count || 0,
      icon: iconUrl,
      inviteUrl: `https://discord.gg/${code}`,
      verified: Array.isArray(guild.features) && guild.features.includes('VERIFIED')
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch Discord info'
    });
  }
}
