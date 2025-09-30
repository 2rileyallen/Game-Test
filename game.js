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

// Function to update the resource display
function updateResourceDisplay() {
    manaShardsCountSpan.textContent = gameState.manaShards;
    glimmerCountSpan.textContent = gameState.glimmer;
    // Disable build button if not enough resources
    buildManaCondenserButton.disabled = gameState.manaShards < gameState.manaCondenser.cost;
}

// Function to gather Mana Shards manually
function gatherManaShards() {
    gameState.manaShards++;
    updateResourceDisplay();
}

// Function to build a Mana Condenser
function buildManaCondenser() {
    if (gameState.manaShards >= gameState.manaCondenser.cost) {
        gameState.manaShards -= gameState.manaCondenser.cost;
        gameState.manaCondenser.owned++;
        // For this simple version, we'll just hide the button after one is built
        // to prevent building more than one.
        buildManaCondenserButton.style.display = 'none';
        updateResourceDisplay();
    }
}

// --- Event Listeners ---
gatherManaShardsButton.addEventListener('click', gatherManaShards);
buildManaCondenserButton.addEventListener('click', buildManaCondenser);


// --- Game Loop ---
// This loop runs every second (1000 milliseconds)
setInterval(() => {
    // If the player owns a Mana Condenser, generate Glimmer
    if (gameState.manaCondenser.owned > 0) {
        gameState.glimmer += gameState.manaCondenser.productionRate;
        updateResourceDisplay();
    }
}, 1000);

// --- Initial Setup ---
// Initialize the display when the game loads
updateResourceDisplay();