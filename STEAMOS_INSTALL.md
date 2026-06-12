# KDM for SteamOS

KDM is packaged as a local Electron desktop application. It launches in its
own window and does not require a web browser or an internet connection after
installation.

## Install on Steam Deck

1. Switch the Steam Deck to Desktop Mode.
2. Open a terminal in this project directory.
3. Run:

   ```bash
   chmod +x tools/install-steamos.sh tools/uninstall-steamos.sh
   ./tools/install-steamos.sh
   ```

The installer runs `npm install`, builds `KDM.AppImage`, and installs these
files:

```text
~/Games/KDM/KDM.AppImage
~/Games/KDM/kdm-icon.png
~/Desktop/KDM.desktop
~/.local/share/applications/KDM.desktop
```

## Launch from the desktop

Double-click **KDM** on the SteamOS desktop. If SteamOS asks whether to execute
the file, choose **Execute**.

KDM also appears in the Desktop Mode application menu under **Games**.

## Add as a Non-Steam Game

1. Open Steam in Desktop Mode.
2. Select **Games > Add a Non-Steam Game to My Library**.
3. Select **Browse**.
4. Choose `/home/deck/Games/KDM/KDM.AppImage`.
5. Select **Add Selected Programs**.

You can then return to Gaming Mode and launch KDM from the Non-Steam section
of the Steam library.

## Uninstall

From the project directory, run:

```bash
./tools/uninstall-steamos.sh
```

This removes the installed AppImage, icon, desktop shortcut, and application
menu entry.
