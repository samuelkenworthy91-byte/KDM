#!/usr/bin/env bash
set -euo pipefail

rm -rf "${HOME}/Games/KDM"
rm -f "${HOME}/Desktop/KDM.desktop"
rm -f "${HOME}/.local/share/applications/KDM.desktop"

echo "KDM has been removed."
