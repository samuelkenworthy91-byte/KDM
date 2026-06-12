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
    'Exec=/home/deck/Games/KDM/KDM.AppImage' \
    'Icon=/home/deck/Games/KDM/kdm-icon.png' \
    'Terminal=false' \
    'Categories=Game;' > "${launcher_path}"

  chmod +x "${launcher_path}"
}

write_launcher "${DESKTOP_LAUNCHER}"
write_launcher "${APPLICATION_LAUNCHER}"

echo "KDM installed at ${INSTALL_DIR}/KDM.AppImage"
