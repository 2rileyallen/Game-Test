// --- DOM Elements ---
// Resources
const manaShardsCountSpan = document.getElementById('mana-shards-count');
const glimmerCountSpan = document.getElementById('glimmer-count');
const glimmerRateSpan = document.getElementById('glimmer-rate');
const aetherCountSpan = document.getElementById('aether-count');
const aetherRateSpan = document.getElementById('aether-rate');

// Main Actions
const gatherManaShardsButton = document.getElementById('gather-mana-shards');
const openWorkshopBtn = document.getElementById('open-workshop-btn');

// Building Slots
const buildingSlots = [
    document.getElementById('slot-1'),
    document.getElementById('slot-2'),
    document.getElementById('slot-3'),
    document.getElementById('slot-4'),
];

// Workshop Modal
const workshopModal = document.getElementById('workshop-modal');
const closeWorkshopBtn = document.querySelector('.close-btn');
const buildManaCondenserBtn = document.getElementById('build-mana-condenser-btn');
const buildGlimmerWeaverBtn = document.getElementById('build-glimmer-weaver-btn');
const upgradeCondenserBtn = document.getElementById('upgrade-condenser-btn');
const unlockSlot2Btn = document.getElementById('unlock-slot-2-btn');
const unlockSlot3Btn = document.getElementById('unlock-slot-3-btn');
const unlockSlot4Btn = document.getElementById('unlock-slot-4-btn');

// Combat Screen
const combatScreen = document.getElementById('combat-screen');
const mainScreenElements = [
    document.getElementById('resources'),
    document.getElementById('main-actions'),
    document.getElementById('building-slots-container')
];
const enterCombatBtn = document.getElementById('enter-combat-btn');
const exitCombatBtn = document.getElementById('exit-combat-btn');
const combatGrid = document.getElementById('combat-grid');
const playerHpSpan = document.getElementById('player-hp');
const enemyHpSpan = document.getElementById('enemy-hp');


// --- Game State ---
let gameState = {
    manaShards: 0,
    glimmer: 0,
    aether: 0,
    slots: ['empty', 'locked', 'locked', 'locked'], // States: 'locked', 'empty', 'condenser', 'weaver'
    condenser: {
        buildCost: 10,
        efficiency: 1, // Glimmer per second per condenser
        upgradeCost: 25,
        upgradeLevel: 0,
    },
    weaver: {
        buildCost: 100, // Glimmer
        consumes: 2, // Glimmer per second
        produces: 1, // Aether per second
    },
    slotCosts: {
        2: 50,
        3: 150,
        4: 300,
    },
    combat: {
        isActive: false,
        enterCost: 10,
        player: {
            x: 1, // 0-2 for player side
            y: 1, // 0-2
            hp: 100,
            lastShotTime: 0,
        },
        shotCooldown: 500, // milliseconds for player
        enemyShotCooldown: 1500, // milliseconds for enemy
        bulletDamage: 10,
        enemy: {
            x: 4, // 3-5 for enemy side
            y: 1,
            hp: 100,
            lastShotTime: 0,
            moveDirection: 'down',
            lastMoveTime: 0,
            moveCooldown: 750, // ms
        },
        bullets: [],
    }
};

// --- UI Functions ---
function updateUI() {
    // Update resource displays
    manaShardsCountSpan.textContent = gameState.manaShards;
    glimmerCountSpan.textContent = Math.floor(gameState.glimmer); // Show whole numbers
    aetherCountSpan.textContent = gameState.aether;

    const condenserCount = gameState.slots.filter(s => s === 'condenser').length;
    const weaverCount = gameState.slots.filter(s => s === 'weaver').length;

    const glimmerRate = (condenserCount * gameState.condenser.efficiency) - (weaverCount * gameState.weaver.consumes);
    glimmerRateSpan.textContent = glimmerRate;

    const aetherRate = weaverCount * gameState.weaver.produces;
    aetherRateSpan.textContent = aetherRate;

    // Update building slots display
    gameState.slots.forEach((status, index) => {
        const slot = buildingSlots[index];
        slot.className = 'slot'; // Reset classes
        slot.classList.add(status); // Add the specific status class ('locked', 'empty', 'condenser', 'weaver')

        // If it's a machine, also add the generic 'occupied' class for styling
        if (status === 'condenser' || status === 'weaver') {
            slot.classList.add('occupied');
        }

        // Now set the text content
        if (status === 'condenser') {
            slot.textContent = 'Mana Condenser';
        } else if (status === 'weaver') {
            slot.textContent = 'Glimmer Weaver';
        } else if (status === 'empty') {
            slot.textContent = 'Empty Slot';
        } else {
            slot.textContent = `Slot ${index + 1} (Locked)`;
        }
    });

    // Update workshop button states
    const hasEmptySlot = gameState.slots.includes('empty');
    buildManaCondenserBtn.disabled = gameState.manaShards < gameState.condenser.buildCost || !hasEmptySlot;
    buildGlimmerWeaverBtn.disabled = gameState.glimmer < gameState.weaver.buildCost || !hasEmptySlot;

    upgradeCondenserBtn.disabled = gameState.glimmer < gameState.condenser.upgradeCost;
    if (gameState.condenser.upgradeLevel > 0) {
        upgradeCondenserBtn.style.display = 'none';
    } else {
        upgradeCondenserBtn.style.display = 'block';
    }

    unlockSlot2Btn.disabled = gameState.glimmer < gameState.slotCosts[2];
    if (gameState.slots[1] !== 'locked') unlockSlot2Btn.style.display = 'none'; else unlockSlot2Btn.style.display = 'block';

    unlockSlot3Btn.disabled = gameState.glimmer < gameState.slotCosts[3];
    if (gameState.slots[2] !== 'locked') unlockSlot3Btn.style.display = 'none'; else unlockSlot3Btn.style.display = 'block';

    unlockSlot4Btn.disabled = gameState.glimmer < gameState.slotCosts[4];
    if (gameState.slots[3] !== 'locked') unlockSlot4Btn.style.display = 'none'; else unlockSlot4Btn.style.display = 'block';

    // Update combat button state
    enterCombatBtn.disabled = gameState.aether < gameState.combat.enterCost;
}

function openWorkshop() {
    workshopModal.className = 'modal';
}

function closeWorkshop() {
    workshopModal.className = 'modal-hidden';
}

// --- Combat Functions ---
function drawCombatGrid() {
    combatGrid.innerHTML = ''; // Clear previous state

    // Draw grid cells, player, and enemy
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 6; x++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.x = x;
            cell.dataset.y = y;
            combatGrid.appendChild(cell);
        }
    }
    const playerCell = combatGrid.querySelector(`[data-x='${gameState.combat.player.x}'][data-y='${gameState.combat.player.y}']`);
    if (playerCell) {
        const playerDiv = document.createElement('div');
        playerDiv.className = 'player';
        playerCell.appendChild(playerDiv);
    }
    const enemyCell = combatGrid.querySelector(`[data-x='${gameState.combat.enemy.x}'][data-y='${gameState.combat.enemy.y}']`);
    if (enemyCell) {
        const enemyDiv = document.createElement('div');
        enemyDiv.className = 'enemy';
        enemyCell.appendChild(enemyDiv);
    }

    // Draw bullets separately, not attached to cells, for smooth movement
    gameState.combat.bullets.forEach(bullet => {
        const bulletDiv = document.createElement('div');
        bulletDiv.className = 'bullet';
        const cellWidth = combatGrid.offsetWidth / 6;
        const cellHeight = combatGrid.offsetHeight / 3;
        bulletDiv.style.left = `${bullet.x * cellWidth}px`;
        bulletDiv.style.top = `${bullet.y * cellHeight + (cellHeight / 2) - 4}px`; // Center bullet vertically
        combatGrid.appendChild(bulletDiv);
    });
}

function handleCombatInput(event) {
    if (!gameState.combat.isActive) return;

    const key = event.key.toLowerCase();

    // Handle Movement
    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        let { x, y } = gameState.combat.player;

        if (key === 'w' || key === 'arrowup') y--;
        if (key === 's' || key === 'arrowdown') y++;
        if (key === 'a' || key === 'arrowleft') x--;
        if (key === 'd' || key === 'arrowright') x++;

        // Clamp to player's side of the grid (0-2 on both axes)
        x = Math.max(0, Math.min(x, 2));
        y = Math.max(0, Math.min(y, 2));

        gameState.combat.player.x = x;
        gameState.combat.player.y = y;
    }

    // Handle Shooting
    if (key === ' ') {
        event.preventDefault(); // Prevent spacebar from scrolling
        playerShoot();
    }
}

function playerShoot() {
    const now = Date.now();
    if (now - gameState.combat.player.lastShotTime >= gameState.combat.shotCooldown) {
        gameState.combat.player.lastShotTime = now;
        gameState.combat.bullets.push({
            x: gameState.combat.player.x + 0.5,
            y: gameState.combat.player.y,
            owner: 'player',
            speed: 0.2
        });
    }
}

function enemyShoot() {
    const now = Date.now();
    const timeSinceLastShot = now - gameState.combat.enemy.lastShotTime;

    if (timeSinceLastShot >= gameState.combat.enemyShotCooldown) {
        gameState.combat.enemy.lastShotTime = now;
        gameState.combat.bullets.push({
            x: gameState.combat.enemy.x - 0.5, // Start from the left edge of the enemy
            y: gameState.combat.enemy.y,
            owner: 'enemy',
            speed: 0.1 // Slower than player for now
        });
    }
}

function moveEnemy() {
    const now = Date.now();
    if (now - gameState.combat.enemy.lastMoveTime > gameState.combat.enemy.moveCooldown) {
        gameState.combat.enemy.lastMoveTime = now;
        let { y, moveDirection } = gameState.combat.enemy;

        if (moveDirection === 'down') {
            y++;
            if (y > 2) {
                y = 1;
                gameState.combat.enemy.moveDirection = 'up';
            }
        } else { // 'up'
            y--;
            if (y < 0) {
                y = 1;
                gameState.combat.enemy.moveDirection = 'down';
            }
        }
        gameState.combat.enemy.y = y;
    }
}

let combatLoopId = null;

function combatLoop() {
    if (!gameState.combat.isActive) return;

    // --- Enemy Actions ---
    enemyShoot();
    moveEnemy();

    // --- Update bullet positions and check for collisions ---
    for (let i = gameState.combat.bullets.length - 1; i >= 0; i--) {
        const bullet = gameState.combat.bullets[i];

        if (bullet.owner === 'player') {
            bullet.x += bullet.speed;
        } else {
            bullet.x -= bullet.speed;
        }

        let hit = false;
        if (bullet.owner === 'player' && Math.floor(bullet.x) === gameState.combat.enemy.x && bullet.y === gameState.combat.enemy.y) {
            gameState.combat.enemy.hp -= gameState.combat.bulletDamage;
            hit = true;
        } else if (bullet.owner === 'enemy' && Math.floor(bullet.x) === gameState.combat.player.x && bullet.y === gameState.combat.player.y) {
            gameState.combat.player.hp -= gameState.combat.bulletDamage;
            hit = true;
        }

        if (hit || bullet.x < 0 || bullet.x >= 6) {
            gameState.combat.bullets.splice(i, 1);
        }
    }

    // --- Update UI ---
    playerHpSpan.textContent = gameState.combat.player.hp;
    enemyHpSpan.textContent = gameState.combat.enemy.hp;
    drawCombatGrid();

    // --- Check for win/loss conditions ---
    if (gameState.combat.enemy.hp <= 0) {
        alert("You win!");
        gameState.glimmer += 50; // Reward
        gameState.aether += 25;  // Reward
        exitCombat();
        return; // Stop the loop
    }

    if (gameState.combat.player.hp <= 0) {
        alert("You lose!");
        exitCombat();
        return; // Stop the loop
    }

    // --- Continue the loop ---
    combatLoopId = requestAnimationFrame(combatLoop);
}

function enterCombat() {
    if (gameState.aether >= gameState.combat.enterCost) {
        gameState.aether -= gameState.combat.enterCost;
        gameState.combat.isActive = true;

        // Reset combat state for a fresh fight
        gameState.combat.player.hp = 100;
        gameState.combat.enemy.hp = 100;
        gameState.combat.player.x = 1;
        gameState.combat.player.y = 1;
        gameState.combat.enemy.x = 4;
        gameState.combat.enemy.y = 1;
        gameState.combat.enemy.moveDirection = 'down';

        // Initialize cooldowns relative to the start of combat
        const startTime = Date.now();
        gameState.combat.player.lastShotTime = startTime;
        gameState.combat.enemy.lastShotTime = startTime;

        mainScreenElements.forEach(el => el.classList.add('hidden'));
        combatScreen.classList.remove('hidden');

        // Start the combat loop
        combatLoopId = requestAnimationFrame(combatLoop);
        updateUI();
    }
}

function exitCombat() {
    gameState.combat.isActive = false;
    cancelAnimationFrame(combatLoopId);

    combatScreen.classList.add('hidden');
    mainScreenElements.forEach(el => el.classList.remove('hidden'));

    // Clear bullets when exiting
    gameState.combat.bullets = [];
    updateUI();
}

// --- Action Functions ---
function gatherManaShards() {
    gameState.manaShards++;
    updateUI();
}

function buildCondenser() {
    const emptySlotIndex = gameState.slots.findIndex(s => s === 'empty');
    if (emptySlotIndex !== -1 && gameState.manaShards >= gameState.condenser.buildCost) {
        gameState.manaShards -= gameState.condenser.buildCost;
        gameState.slots[emptySlotIndex] = 'condenser';
        updateUI();
    }
}

function buildWeaver() {
    const emptySlotIndex = gameState.slots.findIndex(s => s === 'empty');
    if (emptySlotIndex !== -1 && gameState.glimmer >= gameState.weaver.buildCost) {
        gameState.glimmer -= gameState.weaver.buildCost;
        gameState.slots[emptySlotIndex] = 'weaver';
        updateUI();
    }
}

function upgradeCondenser() {
    if (gameState.glimmer >= gameState.condenser.upgradeCost && gameState.condenser.upgradeLevel === 0) {
        gameState.glimmer -= gameState.condenser.upgradeCost;
        gameState.condenser.efficiency = 2; // Double efficiency
        gameState.condenser.upgradeLevel = 1;
        updateUI();
    }
}

function unlockSlot(slotNumber) {
    const slotIndex = slotNumber - 1;
    if (gameState.slots[slotIndex] === 'locked' && gameState.glimmer >= gameState.slotCosts[slotNumber]) {
        gameState.glimmer -= gameState.slotCosts[slotNumber];
        gameState.slots[slotIndex] = 'empty';
        updateUI();
    }
}

// --- Persistence ---
function saveGame() {
    localStorage.setItem('magicalAlchemistSave_v4', JSON.stringify(gameState));
}

function loadGame() {
    const savedGame = localStorage.getItem('magicalAlchemistSave_v4');
    if (savedGame) {
        const loadedState = JSON.parse(savedGame);
        // A simple merge that will handle new top-level properties but not deep-nested ones.
        // Good enough for this stage of development.
        gameState = { ...gameState, ...loadedState };
    }
}

// --- Event Listeners ---
gatherManaShardsButton.addEventListener('click', gatherManaShards);
openWorkshopBtn.addEventListener('click', openWorkshop);
closeWorkshopBtn.addEventListener('click', closeWorkshop);
window.addEventListener('click', (event) => {
    if (event.target === workshopModal) {
        closeWorkshop();
    }
});

buildManaCondenserBtn.addEventListener('click', buildCondenser);
buildGlimmerWeaverBtn.addEventListener('click', buildWeaver);
upgradeCondenserBtn.addEventListener('click', upgradeCondenser);
unlockSlot2Btn.addEventListener('click', () => unlockSlot(2));
unlockSlot3Btn.addEventListener('click', () => unlockSlot(3));
unlockSlot4Btn.addEventListener('click', () => unlockSlot(4));

// Combat Listeners
enterCombatBtn.addEventListener('click', enterCombat);
exitCombatBtn.addEventListener('click', exitCombat);
window.addEventListener('keydown', handleCombatInput);

// --- Game Loops ---
// Production loop (every second)
setInterval(() => {
    if (gameState.combat.isActive) return; // Pause automation during combat

    let glimmerProduced = 0;
    let glimmerConsumed = 0;
    let aetherProduced = 0;

    // 1. Calculate Glimmer production
    const condenserCount = gameState.slots.filter(s => s === 'condenser').length;
    glimmerProduced = condenserCount * gameState.condenser.efficiency;
    gameState.glimmer += glimmerProduced;

    // 2. Calculate Glimmer consumption and Aether production
    const weaverCount = gameState.slots.filter(s => s === 'weaver').length;
    glimmerConsumed = weaverCount * gameState.weaver.consumes;

    if (weaverCount > 0) {
        if (gameState.glimmer >= glimmerConsumed) {
            gameState.glimmer -= glimmerConsumed;
            aetherProduced = weaverCount * gameState.weaver.produces;
            gameState.aether += aetherProduced;
        }
    }

    // 3. Update the UI only if resources have changed
    if (glimmerProduced > 0 || glimmerConsumed > 0 || aetherProduced > 0) {
        updateUI();
    }
}, 1000);

// Autosave loop (every 3 seconds)
setInterval(() => {
    if (gameState.combat.isActive) return; // Pause saving during combat
    saveGame();
}, 3000);

// --- Initial Setup ---
loadGame();
updateUI();