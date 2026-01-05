import { CharacterBase } from './types';
import { JASON_ATLAS } from './jasonData';
import { DAVID_ATLAS } from './davidData';
import { DAVE_ATLAS } from './daveData';
import jasonSpriteSheet from './assets/character_sprites_animations/Jason_spritesheet_grid_1080.png';
import davidSpriteSheet from './assets/character_sprites_animations/david_spritesheet_grid_1080.png';
import daveSpriteSheet from './assets/character_sprites_animations/dave_spritesheet_grid_1080.png';
import jasonCard from './assets/character_player_cards/jason_playercard-2.png';
import davidCard from './assets/character_player_cards/david_playercard-3.png';
import daveCard from './assets/character_player_cards/dave_playercard-1.png';
import jayCard from './assets/character_player_cards/jay_playercard.png';
import jaySpriteSheet from './assets/character_sprites_animations/Jay_spritesheet.png';
import { JAY_ATLAS } from './jayData';

// World Backgrounds
import dairyCoolerL0 from './assets/world_backgrounds/outside_the_dairy_cooler/parallax_layer0_inside.png';
import dairyCoolerL1 from './assets/world_backgrounds/outside_the_dairy_cooler/parallax_layer1_background.png';
import dairyCoolerL2 from './assets/world_backgrounds/outside_the_dairy_cooler/parallax_layer2_door.png';
import dairyCoolerL3 from './assets/world_backgrounds/outside_the_dairy_cooler/parallax_layer3_track.png';
import dairyCoolerL4 from './assets/world_backgrounds/outside_the_dairy_cooler/parallax_layer4_hangers.png';

export const WORLD = {
  width: 960,
  height: 540,

  groundY: 500,

  moveSpeed: 330,
  airSpeed: 240,

  jumpSpeed: 820,
  gravity: 2600,
  maxFall: 1600,

  groundAccel: 4200,
  airAccel: 2600,
  friction: 4600,
};

export const CHARACTERS: CharacterBase[] = [
  {
    id: 'jason',
    name: 'Jason',
    color: 0x3b82f6,
    description: 'Balanced fighter with quick jabs.',
    moveSet: { jab: 'jason_jab', special: 'jason_special' },
    moveNames: { jab: 'Furry Fist', special: 'P. SWAYZE R.I.P. Kick' },
    atlasUrl: jasonSpriteSheet,
    atlasData: JASON_ATLAS,
    assets: {
      idle: 'Jason_standingstill-1.png',
      run: 'Jason_walk-6.png',
      jump: 'Jason_jumping-2.png',
      jab: 'Jason_punching-3.png',
      special: 'Jason_kick-4.png',
      block: 'Jason_block-5.png'
    },
    cardImg: jasonCard
  },
  {
    id: 'david',
    name: 'David',
    color: 0xef4444,
    description: 'Heavy hitter, slow but strong.',
    moveSet: { jab: 'david_jab', special: 'david_special' },
    moveNames: { jab: 'Gayitsu Slap', special: 'Ponytail Whip' },
    atlasUrl: davidSpriteSheet,
    atlasData: DAVID_ATLAS,
    assets: {
      idle: 'david_standingstill-7.png',
      jump: 'david_jump-8.png',
      special: 'david_ponytailwhip-9.png',
      run: 'david_moving-10.png',
      jab: 'david_poke-11.png',
      block: 'david_block-12.png'
    },
    facingRight: false,
    cardImg: davidCard
  },
  {
    id: 'drunk_dave',
    name: 'Drunk Dave',
    color: 0x22c55e,
    description: 'Unpredictable and erratic.',
    moveSet: { jab: 'drunk_jab', special: 'drunk_special' },
    moveNames: { jab: 'Call it in', special: 'Game Day Tackle' },
    atlasUrl: daveSpriteSheet,
    atlasData: DAVE_ATLAS,
    assets: {
      idle: 'dave_standing-13.png',
      jump: 'dave_jump-14.png',
      special: 'dave_tackle-16.png',
      run: 'dave_move-18.png',
      jab: 'dave_gottocallthisin-15.png', // Using "call it in" frame for jab
      block: 'dave_block-17.png'
    },
    cardImg: daveCard
  },
  {
    id: 'jay',
    name: 'Jay "The Rock"',
    color: 0xeab308,
    description: 'WWE Enthusiast... only the shirtless stuff.',
    moveSet: { jab: 'jay_jab', special: 'jay_special' },
    moveNames: { jab: 'The People\'s Elbow', special: 'Smolder' },
    atlasUrl: jaySpriteSheet,
    atlasData: JAY_ATLAS,
    assets: {
      idle: 'Jay_idle.png',
      run: 'Jay_walk.png',
      jump: 'Jay_jump.png',
      jab: 'Jay_jab.png',
      special: 'Jay_special.png',
      block: 'Jay_block.png'
    },
    cardImg: jayCard
  },
];

import dairyCoolerPreview from './assets/ui/stage_dairy_cooler_preview.png';

export const WORLDS = [
  {
    id: 'dairy_cooler',
    name: 'Outside the Dairy Cooler',
    description: 'A classic battleground of non-perishables.',
    color: 0x1b2027,
    layers: [dairyCoolerL0, dairyCoolerL1, dairyCoolerL2, dairyCoolerL3, dairyCoolerL4],
    previewImg: dairyCoolerPreview
  },
  {
    id: 'frozen',
    name: 'Frozen Foods',
    description: 'Slippery floors and cold hearts.',
    color: 0x0f172a
  },
  {
    id: 'produce',
    name: 'Fresh Produce',
    description: 'Organic chaos.',
    color: 0x14532d
  },
  {
    id: 'bakery',
    name: 'The Bakery',
    description: 'Yeasty brawls.',
    color: 0x78350f
  },
  {
    id: 'checkout',
    name: 'Checkout Lane',
    description: 'Unexpected item in the bagging area.',
    color: 0x312e81
  }
];