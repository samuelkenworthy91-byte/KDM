# Play Without Codespace

KDM can be played from a committed browser build or as a local SteamOS AppImage. Neither route needs a Codespace dev server after setup.

## Browser via GitHack

Build the static browser version:

```bash
npm run build
```

Commit and push the generated `dist` files:

```bash
git add -A
git commit -m "Build playable browser version"
git push origin main
```

Play the committed build:

```text
https://raw.githack.com/samuelkenworthy91-byte/KDM/main/dist/index.html?v=<commit-hash>
```

GitHack is online, but it serves the committed `dist/index.html` directly and does not need Codespace running.

## Browser via GitHub Pages

The GitHub Pages workflow builds and deploys `dist` on pushes to `main`.

After the workflow finishes, the game should be available at:

```text
https://samuelkenworthy91-byte.github.io/KDM/
```

Vite is configured with `base: './'`, so the same build remains compatible with GitHack and GitHub Pages.

## Local Steam Deck

On Steam Deck Desktop Mode, open a terminal in the project folder and run:

```bash
chmod +x tools/install-steamos.sh tools/uninstall-steamos.sh
./tools/install-steamos.sh
```

Installed app location:

```text
~/Games/KDM/KDM.AppImage
```

Add to Steam:

1. Open Steam in Desktop Mode.
2. Choose Games.
3. Choose Add a Non-Steam Game.
4. Browse.
5. Select `~/Games/KDM/KDM.AppImage`.

Once installed, KDM does not need Codespace, a browser, or an internet connection.

## Uninstall

```bash
./tools/uninstall-steamos.sh
```
