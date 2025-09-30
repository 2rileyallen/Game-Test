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
}

function openWorkshop() {
    workshopModal.className = 'modal';
}

function closeWorkshop() {
    workshopModal.className = 'modal-hidden';
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

// --- Game Loops ---
// Production loop (every second)
setInterval(() => {
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
    saveGame();
}, 3000);

// --- Initial Setup ---
loadGame();
updateUI();