import {createHash} from 'node:crypto';
import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const manifestName = 'RELEASE_MANIFEST.json';
// These files must be upgraded together. Downloads and build outputs are generated.
const releaseFiles = [
  'package.json', 'BUILD_INFO.json', '.github/workflows/deploy-pages.yml',
  'public/index.html', 'public/app.js', 'public/core.js', 'public/rules.js',
  'public/recipe.js', 'public/theme-init.js', 'public/tutorial.js', 'public/catalog.js', 'public/catalog.css',
  'public/styles.css', 'public/pokemon-theme.css', 'public/portal-theme.css', 'public/tutorial.css',
  'public/data/cards.json', 'public/data/cards.json.gz', 'public/data/meta.json', 'public/data/example.json',
  'public/templates/recipe-template-2026.json', 'public/templates/recipe-template-2026.xlsx',
  'scripts/build.mjs', 'scripts/verify-build.mjs', 'scripts/verify-release.mjs', 'scripts/package-source.py',
  'tests/deck.test.mjs', 'tests/formats-recipe.test.mjs', 'tests/tutorial.test.mjs', 'tests/catalog.test.mjs'
];

function digest(bytes, name) {
  // A Windows checkout may use CRLF; this is not a different application release.
  const content = /\.(?:json|js|mjs|css|html|yml|py)$/.test(name)
    ? bytes.toString('utf8').replace(/\r\n/g, '\n') : bytes;
  return createHash('sha256').update(content).digest('hex');
}

export async function verifyRelease(root = projectRoot) {
  let manifest;
  try { manifest = JSON.parse(await readFile(path.join(root, manifestName), 'utf8')); }
  catch { throw new Error('RELEASE_MANIFEST.json is missing or invalid. ZIP 전체를 풀고 기존 파일을 모두 교체해 주세요.'); }
  if (manifest.schemaVersion !== 1 || typeof manifest.version !== 'string' || !manifest.files)
    throw new Error('Unsupported release manifest. Use all files from the same release ZIP.');
  const issues = [];
  for (const name of releaseFiles) {
    const expected = manifest.files[name];
    if (typeof expected !== 'string' || !/^[a-f0-9]{64}$/.test(expected)) {
      issues.push(`${name}: checksum missing from manifest`); continue;
    }
    try {
      const bytes = await readFile(path.join(root, name));
      if (digest(bytes, name) !== expected) issues.push(`${name}: different release or locally modified`);
    } catch { issues.push(`${name}: missing`); }
  }
  if (issues.length) {
    throw new Error([
      `Mixed or incomplete PTCG Canvas release (expected v${manifest.version}).`,
      ...issues.map(issue => `  - ${issue}`),
      '',
      '서로 다른 버전의 파일이 섞였거나 파일이 누락·수정되었습니다.',
      '새 ZIP의 package.json, public/, scripts/, tests/, .github/, RELEASE_MANIFEST.json을 함께 덮어쓰고 커밋/push하세요.',
      'GitHub의 Re-run jobs는 기존 커밋을 다시 실행합니다. 수정 파일을 먼저 새 커밋으로 올려 주세요.',
      'See UPGRADE_FROM_OLD_VERSION.md. Keep .git and any unrelated files.'
    ].join('\n'));
  }
  return {version: manifest.version, files: releaseFiles.length};
}

async function writeManifest() {
  const pkg = JSON.parse(await readFile(path.join(projectRoot, 'package.json'), 'utf8'));
  const files = {};
  for (const name of releaseFiles) files[name] = digest(await readFile(path.join(projectRoot, name)), name);
  await writeFile(path.join(projectRoot, manifestName), JSON.stringify({schemaVersion: 1, version: pkg.version, files}, null, 2) + '\n');
  console.log(`Recorded v${pkg.version}: ${releaseFiles.length} release files.`);
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    if (process.argv.includes('--write')) await writeManifest();
    else {
      const result = await verifyRelease();
      console.log(`Verified PTCG Canvas v${result.version}: ${result.files} matching release files.`);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
