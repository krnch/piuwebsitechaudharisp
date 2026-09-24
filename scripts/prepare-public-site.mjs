// Package public content only; keep all original source/admin files in Git.
import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, '.public-site');
if (existsSync(output)) throw new Error('Remove the previous generated .public-site directory before packaging again.');
const files = ['index.html', '404.html', 'blog.html', 'case-studies.html', 'projects.html', 'resume.html', 'Priyanka_Chaudhari_Resume.pdf'];
const directories = ['css', 'js', '_data', 'blog', 'projects'];
const extensions = new Set(['.html', '.css', '.js', '.json', '.yml', '.yaml', '.pdf', '.docx', '.xml', '.thmx', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.woff', '.woff2', '.ttf', '.mp4', '.webm']);
const manifest = [];

function inspect(relative) {
  const source = join(root, relative);
  const stat = lstatSync(source);
  if (stat.isSymbolicLink()) throw new Error(`Refusing symbolic link: ${relative}`);
  if (stat.isDirectory()) {
    for (const entry of readdirSync(source).sort()) {
      if (!entry.startsWith('.')) inspect(join(relative, entry));
    }
  } else if (stat.isFile() && extensions.has(extname(relative).toLowerCase())) {
    manifest.push(relative);
  }
}
for (const relative of [...files, ...directories]) inspect(relative);
const configPath = join(root, 'deploy/public.staticwebapp.config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));
if (config.auth || config.navigationFallback) throw new Error('Public deployment must not require custom auth or bypass deny rules via fallback.');
for (const route of ['/admin*', '/api*', '/.auth*', '/.auth/login/aad', '/.auth/login/github']) {
  if (!config.routes.some(rule => rule.route === route && rule.statusCode === 404)) throw new Error(`Missing deny rule: ${route}`);
}
mkdirSync(output);
for (const relative of manifest) {
  const destination = join(output, relative);
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(join(root, relative), destination);
}
cpSync(configPath, join(output, 'staticwebapp.config.json'));
console.log(`Prepared ${manifest.length} public files plus Free-compatible configuration in .public-site. No admin, API, credentials or repository metadata included.`);