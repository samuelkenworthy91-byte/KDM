# Lantern Deckbuilder Art Pack V1

This art pack is a first pass collection of illustrated placeholders for the Lantern deckbuilder browser game.
All images follow a dark fantasy survival horror aesthetic built on a palette of bone, hide and lantern tones.

## Installation

Copy the contents of the `public/assets/` directory into your project. The recommended usage is to place them under the same path so the game can reference them via `/assets/...`.

## File Organisation

- **title/** – artwork for the main menu and save slots.
- **settlement/** – backgrounds for settlement views and building/innovation icons.
- **map/** – hunt map background and node icons.
- **ui/** – user interface components including cards, panels, tabs and buttons.
- **survivors/** – survivor bases, traits and condition icons.
- **creatures/** – quarry and nemesis art, including portraits, combat sprites, silhouettes and tell icons.
- **resources/** – icons representing generic and creature specific resources.
- **gear/** – icons for craftable gear items.
- **cards/** – placeholder card art for starting deck actions.
- **events/** and **timeline/** – illustrated backgrounds for random events and lantern year timeline entries.
- **icons/** – status, survival and save slot icons.

## Referencing Assets

Use the paths listed in `manifest.json` to reference assets in your code. The `manifest.json` file contains entries with `id`, `path`, `width`, `height`, `transparent` and `use` fields. Paths are relative to the `public/` directory, so you can load an image via e.g. `new Image().src = "/assets/gear/boneBlade.png"`.

All icons have transparent backgrounds, while full screen backgrounds and portraits use opaque backgrounds for consistency.

Creature folders are named using IDs that match those in your game data. Each creature folder contains `portrait.png`, `combat.png`, `silhouette.png` and `tell.png`.

Resource and gear filenames mirror their IDs used in data files to simplify lookup.
