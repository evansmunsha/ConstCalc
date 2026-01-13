// ==================== ZAMBIAN MATERIAL PRICE DATABASE ====================

// Material prices by city (in ZMW)
const ZAMBIAN_PRICES = {
    'Lusaka': {
        cement: 120,
        sand: 350,
        aggregate: 400,
        brick: 1.5,
        mortar: 800
    },
    'Kitwe': {
        cement: 125,
        sand: 320,
        aggregate: 380,
        brick: 1.4,
        mortar: 750
    },
    'Ndola': {
        cement: 122,
        sand: 330,
        aggregate: 390,
        brick: 1.45,
        mortar: 760
    },
    'Kabwe': {
        cement: 118,
        sand: 340,
        aggregate: 395,
        brick: 1.5,
        mortar: 780
    },
    'Livingstone': {
        cement: 130,
        sand: 370,
        aggregate: 420,
        brick: 1.6,
        mortar: 820
    },
    'Solwezi': {
        cement: 135,
        sand: 360,
        aggregate: 410,
        brick: 1.55,
        mortar: 800
    },
    'Chipata': {
        cement: 128,
        sand: 340,
        aggregate: 400,
        brick: 1.5,
        mortar: 790
    },
    'Chingola': {
        cement: 124,
        sand: 325,
        aggregate: 385,
        brick: 1.45,
        mortar: 755
    },
    'Mufulira': {
        cement: 123,
        sand: 328,
        aggregate: 388,
        brick: 1.43,
        mortar: 758
    },
    'Kasama': {
        cement: 132,
        sand: 355,
        aggregate: 405,
        brick: 1.52,
        mortar: 795
    }
};

// Get prices for a specific city
function getCityPrices(city) {
    return ZAMBIAN_PRICES[city] || null;
}

// Get all available cities
function getAvailableCities() {
    return Object.keys(ZAMBIAN_PRICES).sort();
}

// Apply prices to input fields
function applyPricesFromCity(city) {
    const prices = getCityPrices(city);
    if (!prices) return false;
    
    // Apply to cement calculator
    const cementPriceInput = document.getElementById('cement-price');
    const sandPriceInput = document.getElementById('sand-price');
    const aggregatePriceInput = document.getElementById('aggregate-price');
    
    if (cementPriceInput) cementPriceInput.value = prices.cement;
    if (sandPriceInput) sandPriceInput.value = prices.sand;
    if (aggregatePriceInput) aggregatePriceInput.value = prices.aggregate;
    
    // Apply to brick calculator
    const brickPriceInput = document.getElementById('brick-price');
    const mortarPriceInput = document.getElementById('mortar-price');
    
    if (brickPriceInput) brickPriceInput.value = prices.brick;
    if (mortarPriceInput) mortarPriceInput.value = prices.mortar;
    
    // Save all prices to database
    saveMaterialPrice('cement', prices.cement, 'ZMW');
    saveMaterialPrice('sand', prices.sand, 'ZMW');
    saveMaterialPrice('aggregate', prices.aggregate, 'ZMW');
    saveMaterialPrice('brick', prices.brick, 'ZMW');
    saveMaterialPrice('mortar', prices.mortar, 'ZMW');
    
    return true;
}

// Load saved city preference
function loadSavedCity() {
    return localStorage.getItem('selectedCity') || '';
}

// Save city preference
function saveCityPreference(city) {
    localStorage.setItem('selectedCity', city);
}

// Show city selector modal
function showCitySelector() {
    const cities = getAvailableCities();
    const currentCity = loadSavedCity();
    
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'city-selector-modal';
    
    const cityOptions = cities.map(city => {
        const prices = getCityPrices(city);
        const selected = city === currentCity ? 'selected' : '';
        return `
            <div class="city-option ${selected}" onclick="selectCity('${city}')">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 16px; font-weight: 600; color: #1f2937;">${city}</div>
                        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
                            Cement: ZMW ${prices.cement} | Bricks: ZMW ${prices.brick}
                        </div>
                    </div>
                    ${selected ? '<div style="color: #10b981; font-size: 20px;">✓</div>' : ''}
                </div>
            </div>
        `;
    }).join('');
    
    modal.innerHTML = `
        <div class="modal-content">
            <h2>📍 Select Your City</h2>
            <p class="modal-subtitle">Get local material prices for your area</p>
            
            <div style="max-height: 400px; overflow-y: auto; margin: 20px 0;">
                ${cityOptions}
            </div>
            
            <button onclick="closeCitySelector()" class="cancel-btn">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Select a city and apply prices
function selectCity(city) {
    const success = applyPricesFromCity(city);
    if (success) {
        saveCityPreference(city);
        
        // Update UI to show selected city
        updateCityDisplay(city);
        
        alert(`✓ Prices updated for ${city}!`);
        closeCitySelector();
    }
}

// Close city selector
function closeCitySelector() {
    const modal = document.getElementById('city-selector-modal');
    if (modal) modal.remove();
}

// Update display to show current city
function updateCityDisplay(city) {
    const displays = document.querySelectorAll('.current-city-display');
    displays.forEach(display => {
        display.textContent = city || 'Not selected';
    });
}

// Initialize city selector button in UI
function initializeCitySelector() {
    // Wait for DOM
    const savedCity = loadSavedCity();
    
    // If there's a saved city, auto-apply prices
    if (savedCity) {
        applyPricesFromCity(savedCity);
        updateCityDisplay(savedCity);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initializeCitySelector();
    }, 200);
});
