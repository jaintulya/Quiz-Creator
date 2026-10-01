const https = require('https');

const url = 'https://fjlqmdixajqrxsxqioum.supabase.co/rest/v1/';
const key = 'sb_publishable_O2ZFkWR5JUqB5wrcg8tFyg_GTivcOIG';

const req = https.get(url, {
  timeout: 8000,
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
}, (res) => {
  console.log('STATUS:', res.statusCode);
  if (res.statusCode === 200 || res.statusCode === 401) {
    console.log('✅ Supabase is ALIVE and reachable!');
  } else {
    console.log('⚠️ Unexpected status, but server responded');
  }
});

req.on('error', (e) => {
  if (e.code === 'ENOTFOUND') {
    console.error('❌ Still not reachable - DNS not resolved yet. Wait 1-2 more minutes and try again.');
  } else {
    console.error('❌ ERROR:', e.message);
  }
});

req.on('timeout', () => {
  console.error('❌ Timed out - project still waking up, wait a bit more.');
  req.destroy();
});
