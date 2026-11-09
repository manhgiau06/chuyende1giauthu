import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const srcComponentsDir = path.join(rootDir, 'frontend', 'src', 'components');
const destComponentsDir = path.join(rootDir, 'frontend-next', 'src', 'components');
const srcAppFile = path.join(rootDir, 'frontend', 'src', 'App.jsx');
const destLibraryAppFile = path.join(destComponentsDir, 'LibraryApp.jsx');

function ensureUseClient(code) {
  const normalized = code.replace(/^\uFEFF/, '');
  if (normalized.trimStart().startsWith("'use client'") || normalized.trimStart().startsWith('"use client"')) {
    return normalized;
  }
  return `'use client';\n${normalized}`;
}

async function main() {
  const files = await fs.readdir(srcComponentsDir);
  let syncedCount = 0;

  for (const file of files) {
    if (!file.endsWith('.jsx') && !file.endsWith('.js')) continue;
    const srcPath = path.join(srcComponentsDir, file);
    const destPath = path.join(destComponentsDir, file);
    const content = await fs.readFile(srcPath, 'utf8');
    await fs.writeFile(destPath, ensureUseClient(content), 'utf8');
    syncedCount++;
  }

  // Sync App.jsx -> LibraryApp.jsx (adjusting relative paths from ./components/X to ./X and ./api to ../api)
  const appContent = await fs.readFile(srcAppFile, 'utf8');
  const libraryAppContent = appContent
    .replace(/from\s+['"]\.\/api['"]/g, "from '../api'")
    .replace(/from\s+['"]\.\/components\//g, "from './")
    .replace(/import\(\s*['"]\.\/components\//g, "import('./");

  await fs.writeFile(destLibraryAppFile, ensureUseClient(libraryAppContent), 'utf8');
  console.log(`✅ Đã đồng bộ ${syncedCount} components + LibraryApp.jsx từ frontend -> frontend-next (UTF-8 chuẩn).`);
}

main().catch((err) => {
  console.error('Lỗi đồng bộ UI:', err);
  process.exit(1);
});
