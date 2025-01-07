# To-do

## Features

- Map can be bigger than screen
  - Mini-map
  - Camera Follows player
- Fog of War?
- SMT Dx2 Battle Mechanics?
- Revamp Spells
  - Shape/size/element
    - e.g. FireCross
      - ..X.. 
      - XXXXX
      - ..X.. 
- Remove side-bar and instead overlay over main canvas
  - More responsive view? 
- Improved Enemy AI
  -  Chase Player
  -  diff behaviour based on health?
- More Enemy Types
  - Bosses? 
    - Special Boss Arenas/Maps
- Interactions beyond damage
  - Speaking
  - Actor Aggro 
  - Reading signs
    - Requires modal dialog?
- More Tiles
  - Doors 
  - Torches
  - Traps
    - Blindness
    - Poison
    - Bind  
- Items on tiles
  - no more .book == true
- Separate application rendering from game rendering
  - e.g. something to handle 'views'
  - one of those views is the game view
- ~~Bidirectional Travel~~
  - ~~UP AND Down on staircases~~
- More Levels
  - Static levels?
    - Entrance, Store, archives, etc.
- More level types
  - Library
  - Caves
  - Vaults, etc.
- Branching Paths
  - Collecting pages from story books
    - on completion can journey to that branch
- Mobile controls
  - On-screen buttons? 
- Persistent Sessions
  - Save to LocalStorage   

## Technical

- Update build system
  - Hot reload
  - ~~Public folder~~
- ~~ESlint,~~ Prettier, .etc
- Upgrade typescript? 
  - Can we do this without losing TSyringe?
- ~~Deploy to GitHub Pages~~   
- bitflags 
  - for tile properties (passable, breakable, explored, etc.)
  - for actor properties (IsPlayer, stunned, acted this turn, etc.)
  - Helper properties 
- ~~Absolute paths (@/this/that)~~
  - Not possible with Rollup
- index to re export from Tiles and Actors

## Fixes

- Better reset of overlays, etc. on new level
