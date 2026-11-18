import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const baseline = 'https://cutprompt.vercel.app';
const origin = (process.env.VITE_PUBLIC_SITE_URL || baseline).replace(/\/$/, '');
if (!/^https:\/\/[a-z\d.-]+(?::\d+)?$/i.test(origin)) {
  throw new Error('VITE_PUBLIC_SITE_URL must be an HTTPS origin without a path.');
}
for (const relative of ['index.html', 'robots.txt', 'sitemap.xml', '404.html', '500.html', '503.html']) {
  const file = join('dist', relative);
  const data = await readFile(file, 'utf8');
  await writeFile(file, data.replaceAll(baseline, origin));
}
console.log('Public SEO URLs use', origin);
