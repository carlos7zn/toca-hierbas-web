const fs = require('node:fs');
const path = require('node:path');

// Both values are public browser credentials. Never write a service role key here.
const config = {
  url: process.env.SUPABASE_URL || '',
  publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || '',
};

fs.writeFileSync(
  path.join(__dirname, '../public/community-config.js'),
  `window.TOCA_COMMUNITY_CONFIG = ${JSON.stringify(config)};\n`,
);
