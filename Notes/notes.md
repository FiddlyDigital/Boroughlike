# Ideas to implement / Things to do

## General

* Game as a finite state machine
* Turn all remaining IIFE to Classes
* Modularise application
* Bundling and minimisation
* Mobile controls
* Ability to pass turn
* Achevements
  * Pacifist Run, All Books/Branches visited, etc
* Title Screen,
* Game-Win Screen,
* Game Over Screen

## Monster Related

* Monsters are finite state machines
  * State determines their behaviour, status and which sprites to use  
  * Diffearnt AI depending on type
    * Some monsters flee when low on health
    * Others become more aggressive, etc.
  
* Status Icons
  * When a monster is scared, or angry/enraged
  * When the player notices a trap or secret door nearby
  * When player is poisoned, confused or notices a secret

* More Monsters
  * Monsters have a % rate to spawn
  * Stronger monsters have higher % span rate the further down players go
  * Some Monsters only appear in certain books

* Bosses
  * Can't be hurt by bumping, can only be hurt by spells
  * Themed by their books/area

## Mapping

* Persistent Levels
  * Bi-directional travel between levels
* Scrolling Maps
  * Visible area might be 12 x 12, but maps can be 256 x 256.
  * (Requires a Mini-Map!)
* Branching paths, ala DCSS
  * Differant floors of the library have special books/scrolls
  * These act as warp points to new paths in the dungeon.
  * Themed, like Horror, Adventure, Mystery, etc...
  * Contain new tilesets, special items, story events and dungeon mechanics
    * Horror Book: Severly limited Line of Sight
    * Adventure book: need a raft to travel across seas
  * Some of these books are in pieces, and the character has to collect pages/chapters and then fix/bind them together to turn them into warp points
* Tile combinations / variations
  * Corner tiles for when 2 walls meet
  * Variation in wall/floor tiles

## Sound

* FX
  * Game Win
  * Game Over
  * Player Heal
* Background Music
  * Generated
  * Tension based?
  * Differant key depending on Branch/Depth

## RPG Elements

* HP, Mana, Strength, Speed
* Player HP and Mana regen slowly over time
* Statuses
  * Poison - Damage ever X turns until cured
  * Confusion - Controls are reversed for X turns
  * Blindness - Everything is black for X turns
  * Frozen - Unable to move, every keypress advances a turn for X turns
* Element Affinity
  * Lighting bolt wont hurt stone golems, etc...
* Spell Rework
  * Remove the less useful ones (bubble, aura)
* Special items
  * Cards - Single-use, ultra-rare
  * Major Arcana in spanish
  * Pages - collect to later recreate books

## Narrative

* Story development
  * Saving books before they get destroyed? (Raging fire mechanic)
  * Having to defeat Characters from books before you can leave the tower
    * by defeating them, they turn back into 'just' stories
  
* Characters
  * In the Library
    * Monsters
      * Books that were brought to life
      * When defeated, turn back into the book form
    * Grand Mage
      * Caused the magical explosion that brought all of the books to life
    * Trickster
      * Lost all of his cards; asks you to look for them
        * For every x you return, he gives you a gift
        * If you return them all, you get a great gift
        * Instead of returning them, you can use them
        * Single-use, incredibly power items
        * If you use them all, he'll become hostile

* Locations
  * Library
    * Grand Mage's Chambers
    * Private Reading Room
    * Upper Floors
      * Several floors of bookshelves and monsters
    * Lecture Hall
    * Mid Floors
      * Several floors of bookshelves and monsters
    * Common Reading Room
      * One of the floors in the library
      * Central hub of sorts with Key characters
    * Lower Floors
      * Several floors of bookshelves and monsters
    * Entrance Hall
      * Main door Locked until character has fulfilled goals
    * Workshop
      * Used to repair broken books
        * Character can collect chapters/pages from broken books and bind them here
        * Opens new branches
    * The Archives
      * Really old books - very powerful monsters
  *
