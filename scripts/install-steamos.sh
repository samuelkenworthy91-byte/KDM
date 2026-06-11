#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_APPIMAGE="${1:-$ROOT_DIR/dist-desktop/LanternDeckbuilder.AppImage}"
APPLICATIONS_DIR="$HOME/Applications"
DESKTOP_DIR="$HOME/.local/share/applications"
TARGET_APPIMAGE="$APPLICATIONS_DIR/LanternDeckbuilder.AppImage"
DESKTOP_FILE="$DESKTOP_DIR/lantern-deckbuilder.desktop"

if [[ ! -f "$SOURCE_APPIMAGE" ]]; then
  printf 'AppImage not found: %s\n' "$SOURCE_APPIMAGE" >&2
  printf 'Build it first with: npm run package:steamos\n' >&2
  exit 1
fi

mkdir -p "$APPLICATIONS_DIR" "$DESKTOP_DIR"
cp "$SOURCE_APPIMAGE" "$TARGET_APPIMAGE"
chmod +x "$TARGET_APPIMAGE"

cat > "$DESKTOP_FILE" <<EOF
[Desktop Entry]
Type=Application
Name=Lantern Deckbuilder
Comment=Offline survivor deckbuilder
Exec=$TARGET_APPIMAGE
Terminal=false
Categories=Game;
Icon=application-x-executable
EOF

chmod +x "$DESKTOP_FILE"

printf 'Installed Lantern Deckbuilder to %s\n' "$TARGET_APPIMAGE"
printf 'Created desktop launcher: %s\n\n' "$DESKTOP_FILE"
printf 'Add it to Steam:\n'
printf '1. Open Steam in Desktop Mode\n'
printf '2. Open Games\n'
printf '3. Choose Add a Non-Steam Game\n'
printf '4. Browse to %s\n' "$TARGET_APPIMAGE"
printf '5. Choose Add Selected Programs\n'
