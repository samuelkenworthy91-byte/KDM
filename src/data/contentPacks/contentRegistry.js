import emberboundCore from './emberboundCore.js';
import ashenDrake from './ashenDrake.js';
import dawnsworn from './dawnsworn.js';
import mirehorn from './mirehorn.js';
import thornbloom from './thornbloom.js';
import gildedScarab from './gildedScarab.js';
import prideEater from './prideEater.js';
import ironPursuer from './ironPursuer.js';
import paleWatcher from './paleWatcher.js';
import silkHorror from './silkHorror.js';
import solitarySpire from './solitarySpire.js';
import verdantPanoply from './verdantPanoply.js';
import courtlyChimera from './courtlyChimera.js';

export {
  emberboundCore,
  ashenDrake,
  dawnsworn,
  mirehorn,
  thornbloom,
  gildedScarab,
  prideEater,
  ironPursuer,
  paleWatcher,
  silkHorror,
  solitarySpire,
  verdantPanoply,
  courtlyChimera
};

export const contentPacks = [
  emberboundCore,
  ashenDrake,
  dawnsworn,
  mirehorn,
  thornbloom,
  gildedScarab,
  prideEater,
  ironPursuer,
  paleWatcher,
  silkHorror,
  solitarySpire,
  verdantPanoply,
  courtlyChimera
];

export const contentPacksById = Object.fromEntries(
  contentPacks.map(pack => [pack.id, pack])
);
