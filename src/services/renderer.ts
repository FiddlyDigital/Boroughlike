/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { HUBEVENTS, SPRITETYPES } from '../constants/enums';
import { ITEM_SPRITE_INDICES, MONSTER_SPRITE_INDICES, TILE_SPRITE_INDICES } from '../constants/spriteIndices';
import { numTilesInViewport, tileRenderSizePX, refreshRate, imgAssetPath, alternateSpriteTimeMS } from '../constants/values';
import { Hub } from './hub';
import { singleton } from 'tsyringe';
import { ITile } from '../models/tiles/base/ITile';
import { IRenderer } from './interfaces/IRenderer';
import { IActor } from '../models/actors/base/IActor';
import { IMap } from '../models/maps/IMap';
import { Shake } from '../models/shake';
import { StairUpTile, StairDownTile } from '../models/tiles';
import { ISpell } from '../models/spells/ISpell';
import { Dictionary } from '../utilities';
import { Score } from '../models/score';

@singleton()
export class Renderer implements IRenderer {
    shake: Shake;
    monsterSpriteSheet: HTMLImageElement;
    tileSpriteSheet: HTMLImageElement;
    effectSpriteSheet: HTMLImageElement;
    itemSpriteSheet: HTMLImageElement;
    onLoadCompletedCallback: Function | null;
    playerLocationElem: HTMLElement;
    playerBooksElem: HTMLElement;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    lastAlternateSpriteTimeMS: number;
    showAlternateSprites: boolean = false;
    viewportWidth: number = numTilesInViewport;
    viewportHeight: number = numTilesInViewport;
    viewportX: number = 0;
    viewportY: number = 0;
    map: IMap | null = null;

    public constructor() {
        this.lastAlternateSpriteTimeMS = Date.now();

        this.monsterSpriteSheet = new Image();
        this.tileSpriteSheet = new Image();
        this.effectSpriteSheet = new Image();
        this.itemSpriteSheet = new Image();

        this.onLoadCompletedCallback = null;

        const playerLocElemTemp = document.getElementById("playerLocation");
        if (playerLocElemTemp) {
            this.playerLocationElem = playerLocElemTemp;
        } else {
            throw "can't load pleyer location elem";
        }

        const playerBooksElemTemp = document.getElementById("playerBooks")
        if (playerBooksElemTemp) {
            this.playerBooksElem = playerBooksElemTemp;
        } else {
            throw "can't load Player Books elem";
        }

        this.shake = new Shake();

        const canvasTemp = document.querySelector("canvas");
        if (canvasTemp) {
            this.canvas = canvasTemp;
            const ctxtemp = this.canvas.getContext("2d");
            if (ctxtemp) {
                this.ctx = ctxtemp;
            }
            else {
                throw "Ctx can't load";
            }
        } else {
            throw "Canvas can't load";
        }
        this.setupCanvas();

        Hub.getInstance().subscribe(HUBEVENTS.SETSHAKE, this.setShakeAmount.bind(this));
    }

    // TODO: Async
    public initSpriteSheet(callback: Function): void {
        this.onLoadCompletedCallback = callback; // store for later

        this.monsterSpriteSheet.onload = this.checkAllSpriteSheetsLoaded.bind(this);
        this.tileSpriteSheet.onload = this.checkAllSpriteSheetsLoaded.bind(this);
        this.effectSpriteSheet.onload = this.checkAllSpriteSheetsLoaded.bind(this);
        this.itemSpriteSheet.onload = this.checkAllSpriteSheetsLoaded.bind(this);

        this.monsterSpriteSheet.src = imgAssetPath + "monsters1.png"; // "monsters2.png"
        this.tileSpriteSheet.src = imgAssetPath + "library_new.png";
        this.effectSpriteSheet.src = imgAssetPath + "effects.png";
        this.itemSpriteSheet.src = imgAssetPath + "items.png";
    }

    private checkAllSpriteSheetsLoaded(): void {
        if (this.monsterSpriteSheet.complete
            && this.tileSpriteSheet.complete
            && this.effectSpriteSheet.complete
            && this.itemSpriteSheet.complete) {
            if (this.onLoadCompletedCallback !== null) {
                this.onLoadCompletedCallback()
            }
        }
    }

    private setupCanvas(): void {
        if (this.canvas && this.ctx) {
            this.canvas.width = tileRenderSizePX * this.viewportWidth;
            this.canvas.height = tileRenderSizePX * this.viewportHeight;
            this.canvas.style.width = this.canvas.width + 'px';
            this.canvas.style.height = this.canvas.height + 'px';
            this.ctx.imageSmoothingEnabled = false;
            this.ctx.font = "consolas, monospace";
        }
    }

    private getSpriteSheet(spriteType: string): HTMLImageElement {
        switch (spriteType) {
            case SPRITETYPES.MONSTER:
                return this.monsterSpriteSheet;
            case SPRITETYPES.TILE:
                return this.tileSpriteSheet;
            case SPRITETYPES.EFFECTS:
                return this.effectSpriteSheet;
            case SPRITETYPES.ITEMS:
                return this.itemSpriteSheet;
            default:
                throw "Sprite sheet does not exist!";
        }
    }

    private updateViewportPosition(player: IActor): void {
        if (!player.tile || !this.map) return;

        // Calculate the target viewport position (centered on player)
        const targetViewportX = player.tile.x - Math.floor(this.viewportWidth / 2);
        const targetViewportY = player.tile.y - Math.floor(this.viewportHeight / 2);

        // Calculate the maximum viewport positions
        const maxViewportX = this.map.width - this.viewportWidth;
        const maxViewportY = this.map.height - this.viewportHeight;

        // Clamp the viewport position to valid bounds with a small buffer
        // This creates a "dead zone" where the viewport won't move if the player is near the center
        const deadZone = 3; // Number of tiles from center before camera starts moving
        const currentCenterX = this.viewportX + Math.floor(this.viewportWidth / 2);
        const currentCenterY = this.viewportY + Math.floor(this.viewportHeight / 2);
        const playerOffsetX = player.tile.x - currentCenterX;
        const playerOffsetY = player.tile.y - currentCenterY;

        // Only move the viewport if the player is outside the dead zone
        if (Math.abs(playerOffsetX) > deadZone) {
            this.viewportX = Math.max(0, Math.min(maxViewportX, targetViewportX));
        }
        if (Math.abs(playerOffsetY) > deadZone) {
            this.viewportY = Math.max(0, Math.min(maxViewportY, targetViewportY));
        }
    }

    private drawMinimap(): void {
        if (!this.map) return;

        const minimapSize = 150; // pixels
        const padding = 10; // pixels from the edge
        const tileSize = Math.max(2, Math.floor(minimapSize / Math.max(this.map.width, this.map.height))); // minimum 2px per tile
        const minimapWidth = this.map.width * tileSize;
        const minimapHeight = this.map.height * tileSize;

        // Position in top-right corner
        const minimapX = this.canvas.width - minimapWidth - padding;
        const minimapY = padding;

        // Semi-transparent background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(minimapX - padding, minimapY - padding, 
            minimapWidth + padding * 2, minimapHeight + padding * 2);

        // Get stairs for comparison
        const stairsUp = this.map.getStairUpTile();
        const stairsDown = this.map.getStairDownTile();
        
        // Draw tiles
        let seenTiles = 0;
        let wallTiles = 0;
        let stairTiles = 0;

        for (let x = 0; x < this.map.width; x++) {
            for (let y = 0; y < this.map.height; y++) {
                const tile = this.map.getTile(x, y);
                if (!tile) continue;

                if (tile.seen) {
                    seenTiles++;
                    const alpha = tile.visible ? 0.9 : 0.5;
                    
                    if (!tile.passable) {
                        wallTiles++;
                    } 
                    else {
                        switch (typeof(tile).toString()) 
                        {
                            case typeof(StairUpTile):
                            case typeof(StairDownTile): 
                                stairTiles++;
                                break;
                            default:
                                break;
                        }
                    }
                    
                    // Determine tile color based on type
                    if (tile.book) {
                        this.ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
                    }
                    else {
                        this.ctx.fillStyle = tile.getMiniMapColor(alpha);
                    }

                    this.ctx.fillRect(
                        minimapX + x * tileSize,
                        minimapY + y * tileSize,
                        tileSize,
                        tileSize
                    );
                }
            }
        }

        // Draw monsters as red dots
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
        const monsters = this.map.getMonsters();
        for (const monster of monsters) {
            if (!monster.tile || !monster.tile.visible) continue;
            this.ctx.fillRect(
                minimapX + monster.tile.x * tileSize,
                minimapY + monster.tile.y * tileSize,
                tileSize,
                tileSize
            );
        }

        // Draw player as a bright white dot
        const player = this.map.getPlayer();
        if (player && player.tile) {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 1.0)';
            this.ctx.fillRect(
                minimapX + player.tile.x * tileSize,
                minimapY + player.tile.y * tileSize,
                tileSize,
                tileSize
            );
        }

        // Draw viewport rectangle with a more visible outline
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(
            minimapX + this.viewportX * tileSize,
            minimapY + this.viewportY * tileSize,
            this.viewportWidth * tileSize,
            this.viewportHeight * tileSize
        );
    }

    private updateVisibility(): void {
        if (!this.map) return;

        // Reset visibility
        for (let x = 0; x < this.map.width; x++) {
            for (let y = 0; y < this.map.height; y++) {
                const tile = this.map.getTile(x, y);
                if (tile) {
                    tile.visible = false;
                }
            }
        }

        // Get player position
        const player = this.map.getPlayer();
        if (!player || !player.tile) return;

        const px = player.tile.x;
        const py = player.tile.y;
        const viewDistance = 12; // How far the player can see

        // Mark tiles as visible using a simple raycasting algorithm
        for (let x = Math.max(0, px - viewDistance); x < Math.min(this.map.width, px + viewDistance + 1); x++) {
            for (let y = Math.max(0, py - viewDistance); y < Math.min(this.map.height, py + viewDistance + 1); y++) {
                // Skip if outside view distance
                const dx = x - px;
                const dy = y - py;
                if (dx * dx + dy * dy > viewDistance * viewDistance) continue;

                const tile = this.map.getTile(x, y);
                if (!tile) continue;

                // Cast a ray from player to this tile
                let visible = true;
                const steps = Math.max(Math.abs(dx), Math.abs(dy));
                if (steps === 0) {
                    visible = true;
                } else {
                    const stepX = dx / steps;
                    const stepY = dy / steps;

                    // Check each step along the ray
                    for (let i = 1; i < steps; i++) {
                        const checkX = Math.round(px + stepX * i);
                        const checkY = Math.round(py + stepY * i);
                        const checkTile = this.map.getTile(checkX, checkY);
                        
                        if (checkTile && !checkTile.passable) {
                            visible = false;
                            break;
                        }
                    }
                }

                if (visible) {
                    tile.visible = true;
                    tile.seen = true;
                }
            }
        }
    }

    public updateScreen(mapperLevel: IMap): void {
        this.clearCanvas();
        this.screenshake();
        this.map = mapperLevel;

        const newRenderingSecond = Date.now();
        if ((newRenderingSecond - this.lastAlternateSpriteTimeMS) > alternateSpriteTimeMS) {
            this.showAlternateSprites = !this.showAlternateSprites;
            this.lastAlternateSpriteTimeMS = newRenderingSecond;
        }

        const monsters: IActor[] = [];
        const player = mapperLevel.getPlayer();
        
        if (player && player.tile) {
            this.updateViewportPosition(player);
            this.updateVisibility();
        }

        // Only render tiles within the viewport
        for (let i = this.viewportX; i < Math.min(this.viewportX + this.viewportWidth, mapperLevel.width); i++) {
            for (let j = this.viewportY; j < Math.min(this.viewportY + this.viewportHeight, mapperLevel.height); j++) {
                const tile = mapperLevel.getTile(i, j);
                if (!tile) {
                    continue;
                }

                this.drawTile(tile);
                if (tile.monster) {
                    monsters.push(tile.monster);
                }
            }
        }

        // Draw monsters within viewport
        for (let m = 0; m < monsters.length; m++) {
            const monster = monsters[m];
            if (!monster.tile) continue;
            
            const monsterX = monster.tile.x;
            const monsterY = monster.tile.y;
            if (monsterX >= this.viewportX && monsterX < this.viewportX + this.viewportWidth &&
                monsterY >= this.viewportY && monsterY < this.viewportY + this.viewportHeight) {
                this.drawMonster(monster);
            }
        }

        // Draw the minimap last so it overlays everything
        this.drawMinimap();
    }

    private drawTile(tile: ITile): void {
        if (!tile) {
            throw "tile cannot be null";
        }

        // Adjust coordinates relative to viewport
        const screenX = tile.x - this.viewportX;
        const screenY = tile.y - this.viewportY;

        this.drawSprite(SPRITETYPES.TILE, tile.sprite, screenX, screenY);

        if (tile.book) {
            this.drawSprite(SPRITETYPES.ITEMS, ITEM_SPRITE_INDICES.Book, screenX, screenY);
        }

        if (tile.effectCounter > 0) {
            tile.effectCounter--;
            this.drawSprite(SPRITETYPES.EFFECTS, tile.effectIndex, screenX, screenY, tile.effectCounter);
        }
    }

    private drawMonster(monster: IActor): void {
        if (!monster) {
            throw "Monster cannot be null";
        }

        if (!this.map) {
            return;
        }

        // Keep fractional positions for smooth movement
        const screenX = monster.getDisplayX() - this.viewportX;
        const screenY = monster.getDisplayY() - this.viewportY;

        // Use rounded coordinates only for tile visibility checks
        const worldX = Math.floor(monster.getDisplayX());
        const worldY = Math.floor(monster.getDisplayY());
        const tile = this.map.getTile(worldX, worldY);

        // Check target tile if monster is moving
        let targetTile = tile;
        const x = monster.getDisplayX();
        const y = monster.getDisplayY();
        if (x % 1 !== 0) {
            const targetX = Math.ceil(x);
            targetTile = this.map.getTile(targetX, worldY);
        } else if (y % 1 !== 0) {
            const targetY = Math.ceil(y);
            targetTile = this.map.getTile(worldX, targetY);
        }

        // Only proceed if monster is visible or is the player
        const isVisible = monster.isPlayer || (tile?.visible || targetTile?.visible);

        if (monster.teleportCounter > 0) {
            this.drawSprite(SPRITETYPES.MONSTER, MONSTER_SPRITE_INDICES.MonsterLoad, screenX, screenY);
        } else {
            this.drawSprite(SPRITETYPES.MONSTER, monster.sprite, screenX, screenY);

            // Only draw HP if monster is visible or is the player
            if (isVisible) {
                for (let i = 0; i < monster.hp; i++) {
                    const monsterX = screenX + (i % 3) * (5 / 16);
                    const monsterY = screenY - Math.floor(i / 3) * (5 / 16);
                    this.drawSprite(
                        SPRITETYPES.MONSTER,
                        MONSTER_SPRITE_INDICES.HP,
                        monsterX,
                        monsterY
                    );
                }
            }
        }

        monster.offsetX -= Math.sign(monster.offsetX) * (1 / 8);
        monster.offsetY -= Math.sign(monster.offsetY) * (1 / 8)
    }

    private drawSprite(spriteType: string, spriteIdx: Array<number> | null, x: number, y: number, effectCounter: number = 0): void {
        // Handle effects opacity
        if (spriteType === SPRITETYPES.EFFECTS && effectCounter && effectCounter > 0) {
            this.ctx.globalAlpha = effectCounter / refreshRate;
        }

        if (spriteIdx) {
            // Use rounded coordinates only for tile visibility checks
            const worldX = Math.floor(x + this.viewportX);
            const worldY = Math.floor(y + this.viewportY);
            const tile = this.map?.getTile(worldX, worldY);

            // For monsters that are moving, also check the target tile
            let targetTile = tile;
            const rawX = x + this.viewportX;
            const rawY = y + this.viewportY;
            if (spriteType === SPRITETYPES.MONSTER && rawX % 1 !== 0) {
                // If x has a fraction, we're moving horizontally
                const targetX = Math.ceil(rawX);
                targetTile = this.map?.getTile(targetX, worldY);
            } else if (spriteType === SPRITETYPES.MONSTER && rawY % 1 !== 0) {
                // If y has a fraction, we're moving vertically
                const targetY = Math.ceil(rawY);
                targetTile = this.map?.getTile(worldX, targetY);
            }

            // Check if this is the player sprite
            const isPlayerSprite = spriteType === SPRITETYPES.MONSTER && 
                spriteIdx[0] === MONSTER_SPRITE_INDICES.Player[0] && 
                spriteIdx[1] === MONSTER_SPRITE_INDICES.Player[1];

            // Set opacity based on visibility state for tiles
            if (spriteType === SPRITETYPES.TILE || spriteType === SPRITETYPES.ITEMS) {
                if (!tile) {
                    this.ctx.globalAlpha = 0; // Not visible at all
                } else if (tile.visible) {
                    this.ctx.globalAlpha = 1.0; // Fully visible
                } else if (tile.seen) {
                    this.ctx.globalAlpha = 0.6; // Seen but not visible
                } else {
                    this.ctx.globalAlpha = 0; // Not seen at all
                }
            } else if (spriteType === SPRITETYPES.MONSTER) {
                // For monsters, check both current and target tile visibility, except for player
                if (!isPlayerSprite && (!tile || !tile.visible) && (!targetTile || !targetTile.visible)) {
                    return; // Don't render monsters outside line of sight at all
                }
                this.ctx.globalAlpha = 1.0;
            } else {
                // For effects, use full opacity
                this.ctx.globalAlpha = 1.0;
            }

            const spriteXIdx = spriteIdx[0]
            let spriteYIdx = spriteIdx[1];

            // if it's a monster and we should alternate, use the secondary sprite
            if (spriteType === SPRITETYPES.MONSTER && (this.showAlternateSprites)) {
                spriteYIdx = 1;
            }

            // Keep fractional positions for smooth rendering
            this.ctx.drawImage(
                this.getSpriteSheet(spriteType),
                spriteXIdx * 16,
                spriteYIdx * 16,
                16,
                16,
                x * tileRenderSizePX + this.shake.x,
                y * tileRenderSizePX + this.shake.y,
                tileRenderSizePX,
                tileRenderSizePX
            );

            // Reset opacity after drawing
            this.ctx.globalAlpha = 1;
        }
    }

    private clearCanvas(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private screenshake(): void {
        if (this.shake.amount) {
            this.shake.amount--;
        }

        const shakeAngle = Math.random() * Math.PI * 2;
        this.shake.x = Math.round(Math.cos(shakeAngle) * this.shake.amount);
        this.shake.y = Math.round(Math.sin(shakeAngle) * this.shake.amount);
    }

    public hideOverlays(): void {
        const overlays = document.getElementsByClassName("overlay");
        if (overlays) {
            for (let i = 0; i < overlays.length; i++) {
                if (overlays[i]) {
                    const overlay = overlays[i] as HTMLElement;
                    overlay.style.display = "none";
                }
            }
        }
    }

    public showTitle(scores: Array<Score>) {
        const titleOverlay = document.getElementById("TitleOverlay");
        if (titleOverlay) {
            if (scores && scores.length > 0) {
                this.drawScores(scores);
            }
            titleOverlay.style.display = "block";
        }
    }

    public showGameWin(scores: Array<Score>) {
        const gameWinOverlay = document.getElementById("GameWinOverlay");
        if (gameWinOverlay) {
            if (scores && scores.length > 0) {
                this.drawScores(scores);
            }
            gameWinOverlay.style.display = "block";
        }
    }

    public showGameLose(scores: Array<Score>) {
        const gameLoseOverlay = document.getElementById("GameLoseOverlay");
        if (gameLoseOverlay) {
            if (scores && scores.length > 0) {
                this.drawScores(scores);
            }
            gameLoseOverlay.style.display = "block";
        }
    }

    public updateSidebar(level: number, score: number, spells: Dictionary<ISpell> | null): void {
        this.playerBooksElem.innerText = score.toString();
        this.playerLocationElem.innerText = level.toString();

        const spellList = document.getElementById("spells");
        if (spellList) {
            while (spellList.hasChildNodes()) {
                if (spellList.firstChild) {
                    spellList.removeChild(spellList.firstChild);
                }
            }

            const docFrag = document.createDocumentFragment();
            if (spells != null) {
                for (let i = 0; i < Object.keys(spells).length; i++) {
                    const btn = document.createElement('button');
                    btn.className = "spellButton";
                    btn.innerText = "(" + (i + 1) + ") " + (spells[i].name || "");
                    // btn.addEventListener("click", () => {
                    //     this.game.handleInteraction({ key: "" + (i + 1) });
                    // });
                    docFrag.append(btn);
                }
            }
            spellList.appendChild(docFrag)
        }
    }

    private drawScores(scores: Array<Score>): void {
        const newestScore: Score | undefined = scores.pop();
        if (newestScore !== undefined) {
            scores.sort(function (a, b) {
                return b.totalScore - a.totalScore;
            });
            scores.unshift(newestScore);
        }

        const scoreBoards = document.getElementsByClassName("scores");
        for (let i = 0; i < scoreBoards.length; i++) {
            const existingTbodyRows = scoreBoards[i].children[1];
            if (existingTbodyRows) {
                while (existingTbodyRows.hasChildNodes()) {
                    if (existingTbodyRows.firstChild) {
                        existingTbodyRows.removeChild(existingTbodyRows.firstChild);
                    }
                }
            }

            const docFrag = new DocumentFragment();
            for (let i = 0; i < Math.min(10, scores.length); i++) {
                const tr = document.createElement('tr');
                const td1 = document.createElement('td');
                const td2 = document.createElement('td');
                const td3 = document.createElement('td');
                td1.innerHTML = scores[i].run.toString();
                td2.innerHTML = scores[i].score.toString();
                td3.innerHTML = scores[i].totalScore.toString();
                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td3);
                docFrag.appendChild(tr);
            }
            existingTbodyRows.appendChild(docFrag);
        }
    }

    private setShakeAmount(amt: number): void {
        this.shake.amount = amt;
    }
}
