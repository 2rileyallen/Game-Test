// --- DOM Elements ---
// Resources
const manaShardsCountSpan = document.getElementById('mana-shards-count');
const glimmerCountSpan = document.getElementById('glimmer-count');
const glimmerRateSpan = document.getElementById('glimmer-rate');

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
const upgradeCondenserBtn = document.getElementById('upgrade-condenser-btn');
const unlockSlot2Btn = document.getElementById('unlock-slot-2-btn');
const unlockSlot3Btn = document.getElementById('unlock-slot-3-btn');
const unlockSlot4Btn = document.getElementById('unlock-slot-4-btn');


// --- Game State ---
let gameState = {
    manaShards: 0,
    glimmer: 0,
    slots: ['empty', 'locked', 'locked', 'locked'], // States: 'locked', 'empty', 'occupied'
    condenser: {
        buildCost: 10,
        efficiency: 1, // Glimmer per second per condenser
        upgradeCost: 25,
        upgradeLevel: 0,
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
    glimmerCountSpan.textContent = gameState.glimmer;
    const occupiedSlots = gameState.slots.filter(s => s === 'occupied').length;
    const currentRate = occupiedSlots * gameState.condenser.efficiency;
    glimmerRateSpan.textContent = currentRate;

    // Update building slots display
    gameState.slots.forEach((status, index) => {
        const slot = buildingSlots[index];
        slot.className = 'slot'; // Reset classes
        slot.classList.add(status);
        if (status === 'occupied') {
            slot.textContent = 'Mana Condenser';
        } else if (status === 'empty') {
            slot.textContent = 'Empty Slot';
        } else {
            slot.textContent = `Slot ${index + 1} (Locked)`;
        }
    });

    // Update workshop button states
    const hasEmptySlot = gameState.slots.includes('empty');
    buildManaCondenserBtn.disabled = gameState.manaShards < gameState.condenser.buildCost || !hasEmptySlot;

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
        gameState.slots[emptySlotIndex] = 'occupied';
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
    // Using a new key for the new game state structure to avoid conflicts
    localStorage.setItem('magicalAlchemistSave_v3', JSON.stringify(gameState));
}

function loadGame() {
    const savedGame = localStorage.getItem('magicalAlchemistSave_v3');
    if (savedGame) {
        const loadedState = JSON.parse(savedGame);
        // Use Object.assign to merge loaded state, preventing errors if new properties are added to the default state later.
        Object.assign(gameState, loadedState);
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
upgradeCondenserBtn.addEventListener('click', upgradeCondenser);
unlockSlot2Btn.addEventListener('click', () => unlockSlot(2));
unlockSlot3Btn.addEventListener('click', () => unlockSlot(3));
unlockSlot4Btn.addEventListener('click', () => unlockSlot(4));

// --- Game Loops ---
// Production loop (every second)
setInterval(() => {
    const occupiedSlots = gameState.slots.filter(s => s === 'occupied').length;
    if (occupiedSlots > 0) {
        gameState.glimmer += occupiedSlots * gameState.condenser.efficiency;
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