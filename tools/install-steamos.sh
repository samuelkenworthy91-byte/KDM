#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INSTALL_DIR="${HOME}/Games/KDM"
DESKTOP_LAUNCHER="${HOME}/Desktop/KDM.desktop"
APPLICATION_LAUNCHER="${HOME}/.local/share/applications/KDM.desktop"

cd "${PROJECT_DIR}"

if [[ ! -f "public/icons/kdm-icon.png" ]]; then
  echo "Missing required icon: public/icons/kdm-icon.png" >&2
  exit 1
fi

npm install
npm run dist:linux

if [[ ! -f "dist-desktop/KDM.AppImage" ]]; then
  echo "Packaging failed: dist-desktop/KDM.AppImage was not created." >&2
  echo "Run npm run dist:linux and review the electron-builder output above." >&2
  exit 1
fi

mkdir -p "${INSTALL_DIR}" "${HOME}/Desktop" "${HOME}/.local/share/applications"
cp "dist-desktop/KDM.AppImage" "${INSTALL_DIR}/KDM.AppImage"
cp "public/icons/kdm-icon.png" "${INSTALL_DIR}/kdm-icon.png"
chmod +x "${INSTALL_DIR}/KDM.AppImage"

write_launcher() {
  local launcher_path="$1"

  printf '%s\n' \
    '[Desktop Entry]' \
    'Type=Application' \
    'Name=KDM' \
    "Exec=${HOME}/Games/KDM/KDM.AppImage" \
    "Icon=${HOME}/Games/KDM/kdm-icon.png" \
    'Terminal=false' \
    'Categories=Game;' > "${launcher_path}"

  chmod +x "${launcher_path}"
}

write_launcher "${DESKTOP_LAUNCHER}"
write_launcher "${APPLICATION_LAUNCHER}"

cat <<EOF
KDM installed successfully.

Installed AppImage:
  ${INSTALL_DIR}/KDM.AppImage

Desktop Mode launchers:
  ${DESKTOP_LAUNCHER}
  ${APPLICATION_LAUNCHER}

Launch from Desktop Mode:
  Double-click KDM on the desktop, or open it from the Games application menu.

Add as a Non-Steam Game:
  1. Open Steam in Desktop Mode.
  2. Choose Games > Add a Non-Steam Game to My Library.
  3. Click Browse.
  4. Select ${INSTALL_DIR}/KDM.AppImage.
  5. Add it, then launch it from SteamOS Gaming Mode.
EOF
