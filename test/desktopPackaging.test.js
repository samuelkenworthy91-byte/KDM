import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync(
  new URL('../package.json', import.meta.url),
  'utf8'
));

test('browser and SteamOS package scripts remain available', () => {
  assert.equal(packageJson.scripts.dev, 'vite --host 0.0.0.0');
  assert.equal(packageJson.scripts.build, 'vite build');
  assert.equal(packageJson.scripts['build:web'], 'vite build');
  assert.equal(packageJson.scripts.preview, 'vite preview --host 0.0.0.0');
  assert.ok(packageJson.scripts.desktop);
  assert.ok(packageJson.scripts['desktop:dev']);
  assert.ok(packageJson.scripts['dist:linux']);
  assert.equal(packageJson.scripts['desktop:linux'], 'npm run dist:linux');
  assert.equal(packageJson.scripts['package:steamos'], 'npm run desktop:linux');
  assert.equal(packageJson.build.linux.artifactName, 'KDM.AppImage');
  assert.equal(packageJson.build.linux.icon, 'public/icons/kdm-icon.png');
});

test('legacy SteamOS installer path delegates to the maintained installer', () => {
  const installer = readFileSync(
    new URL('../scripts/install-steamos.sh', import.meta.url),
    'utf8'
  );
  assert.match(installer, /tools\/install-steamos\.sh/);
});

test('electron main loads dev server or built dist file', () => {
  const main = readFileSync(
    new URL('../electron/main.js', import.meta.url),
    'utf8'
  );
  assert.match(main, /process\.env\.VITE_DEV_SERVER_URL/);
  assert.match(main, /mainWindow\.loadURL\(DEV_SERVER_URL\)/);
  assert.match(main, /mainWindow\.loadFile\(path\.join\(__dirname,\s*'\.\.',\s*'dist',\s*'index\.html'\)\)/);
});

test('Vite keeps relative base for GitHack and Pages', () => {
  const viteConfig = readFileSync(
    new URL('../vite.config.js', import.meta.url),
    'utf8'
  );
  assert.match(viteConfig, /base:\s*['"]\.\/['"]/);
});

test('SteamOS installer packages, copies AppImage, and writes HOME-relative launchers', () => {
  const installer = readFileSync(
    new URL('../tools/install-steamos.sh', import.meta.url),
    'utf8'
  );
  assert.match(installer, /npm run dist:linux/);
  assert.match(installer, /dist-desktop\/KDM\.AppImage/);
  assert.match(installer, /cp "dist-desktop\/KDM\.AppImage" "\$\{INSTALL_DIR\}\/KDM\.AppImage"/);
  assert.match(installer, /Desktop\/KDM\.desktop/);
  assert.match(installer, /\.local\/share\/applications\/KDM\.desktop/);
  assert.match(installer, /Exec=\$\{HOME\}\/Games\/KDM\/KDM\.AppImage/);
  assert.match(installer, /Icon=\$\{HOME\}\/Games\/KDM\/kdm-icon\.png/);
  assert.doesNotMatch(installer, /\/home\/deck/);
});

test('dist index uses relative asset paths for GitHack and Pages', () => {
  const html = readFileSync(
    new URL('../dist/index.html', import.meta.url),
    'utf8'
  );
  assert.doesNotMatch(html, /src="\/KDM\/assets\//);
  assert.doesNotMatch(html, /href="\/KDM\/assets\//);
  assert.doesNotMatch(html, /src="\/assets\//);
  assert.doesNotMatch(html, /href="\/assets\//);
  assert.match(html, /src="\.\/assets\/index-[^"]+\.js"/);
  assert.match(html, /href="\.\/assets\/index-[^"]+\.css"/);
});

test('GitHub Pages workflow builds and deploys dist', () => {
  const workflow = readFileSync(
    new URL('../.github/workflows/pages.yml', import.meta.url),
    'utf8'
  );
  assert.match(workflow, /actions\/checkout@v4/);
  assert.match(workflow, /actions\/setup-node@v4/);
  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /actions\/upload-pages-artifact@v3/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /npm run test/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /path: dist/);
});
