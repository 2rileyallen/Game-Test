// --- DOM Elements ---
const manaShardsCountSpan = document.getElementById('mana-shards-count');
const glimmerCountSpan = document.getElementById('glimmer-count');
const gatherManaShardsButton = document.getElementById('gather-mana-shards');
const buildManaCondenserButton = document.getElementById('build-mana-condenser');

// --- Game State ---
let gameState = {
    manaShards: 0,
    glimmer: 0,
    manaCondenser: {
        owned: 0,
        cost: 10,
        productionRate: 1, // Glimmer per second
    }
};

// --- Game Logic ---

// Function to update the entire UI based on the current game state
function updateUI() {
    // Update resource counts
    manaShardsCountSpan.textContent = gameState.manaShards;
    glimmerCountSpan.textContent = gameState.glimmer;

    // Update button states
    buildManaCondenserButton.disabled = gameState.manaShards < gameState.manaCondenser.cost;

    // Hide the build button if a condenser is already owned
    if (gameState.manaCondenser.owned > 0) {
        buildManaCondenserButton.style.display = 'none';
    } else {
        buildManaCondenserButton.style.display = 'inline-block';
    }
}

// Function to gather Mana Shards manually
function gatherManaShards() {
    gameState.manaShards++;
    updateUI();
}

// Function to build a Mana Condenser
function buildManaCondenser() {
    if (gameState.manaShards >= gameState.manaCondenser.cost) {
        gameState.manaShards -= gameState.manaCondenser.cost;
        gameState.manaCondenser.owned++;
        updateUI();
    }
}

// --- Game Logic ---

// Function to save the game state to Local Storage
function saveGame() {
    localStorage.setItem('magicalAlchemistSave', JSON.stringify(gameState));
}

// Function to load the game state from Local Storage
function loadGame() {
    const savedGame = localStorage.getItem('magicalAlchemistSave');
    if (savedGame) {
        gameState = JSON.parse(savedGame);
    }
}

// --- Event Listeners ---
gatherManaShardsButton.addEventListener('click', gatherManaShards);
buildManaCondenserButton.addEventListener('click', buildManaCondenser);


// --- Game Loops ---
// This loop runs every second for resource generation
setInterval(() => {
    // If the player owns a Mana Condenser, generate Glimmer
    if (gameState.manaCondenser.owned > 0) {
        gameState.glimmer += gameState.manaCondenser.productionRate;
        updateUI();
    }
}, 1000);

// This loop runs every 3 seconds for saving
setInterval(() => {
    saveGame();
}, 3000);


// --- Initial Setup ---
// Load saved game data, then update the UI to reflect the loaded state
loadGame();
updateUI();