# Lantern Deckbuilder on SteamOS and Linux

The browser game remains the primary build. Desktop packaging is an additional offline Electron wrapper around the same Vite output.

## Browser build

```bash
npm install
npm run dev
npm run build
```

The browser production files are written to `dist/`.

## Build the AppImage

Build on an x64 Linux machine:

```bash
npm install
npm run package:steamos
```

The AppImage is written to:

```text
dist-desktop/LanternDeckbuilder.AppImage
```

Codespaces and containers may lack the system support needed by `electron-builder`. The browser build can still be verified there; build the AppImage on a local Linux machine or Linux CI if packaging cannot finish in the container.

## Run and install

Run directly:

```bash
chmod +x dist-desktop/LanternDeckbuilder.AppImage
./dist-desktop/LanternDeckbuilder.AppImage
```

Install for the current SteamOS/Linux user without `sudo`:

```bash
./scripts/install-steamos.sh
```

The installer copies the AppImage to `~/Applications/LanternDeckbuilder.AppImage` and creates a launcher under `~/.local/share/applications`.

## Add to Steam Deck

1. Open Steam in Desktop Mode.
2. Open **Games**.
3. Choose **Add a Non-Steam Game**.
4. Browse to `~/Applications/LanternDeckbuilder.AppImage`.
5. Choose **Add Selected Programs**.

Return to Gaming Mode and launch it from the Non-Steam library.

## Troubleshooting

- If the AppImage is not executable, run `chmod +x ~/Applications/LanternDeckbuilder.AppImage`.
- If Steam cannot see the file, use **Browse** and enter the full path `/home/deck/Applications/LanternDeckbuilder.AppImage`.
- If FUSE is unavailable, try `./LanternDeckbuilder.AppImage --appimage-extract-and-run`.
- No internet connection is required after packaging.
- Desktop saves use Electron's local application storage. They are separate from saves in a web browser and remain local to that desktop user.
