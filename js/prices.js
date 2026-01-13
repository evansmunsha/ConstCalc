// ==================== MATERIAL PRICE MANAGEMENT ====================

// Load saved prices into inputs
async function loadSavedPrices() {
    try {
        const prices = await getAllMaterialPrices();
        
        if (prices && prices.length > 0) {
            prices.forEach(priceData => {
                const inputId = `${priceData.material}-price`;
                const input = document.getElementById(inputId);
                if (input) {
                    input.value = priceData.price;
                }
            });
        }
    } catch (error) {
        console.error('Failed to load prices:', error);
    }
}

// Save price when user changes input
async function savePriceFromInput(material) {
    const input = document.getElementById(`${material}-price`);
    if (input && input.value) {
        const price = parseFloat(input.value);
        if (price > 0) {
            try {
                await saveMaterialPrice(material, price, 'ZMW');
                console.log(`Saved ${material} price: ZMW ${price}`);
            } catch (error) {
                console.error(`Failed to save ${material} price:`, error);
            }
        }
    }
}

// Initialize price management
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for database
    let retries = 0;
    while (!db && retries < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retries++;
    }
    
    if (!db) {
        console.error('Database not ready for prices');
        return;
    }
    
    // Load saved prices
    await loadSavedPrices();
    
    // Add listeners to save prices when changed
    const priceInputs = [
        'cement',
        'sand',
        'aggregate',
        'brick',
        'mortar'
    ];
    
    priceInputs.forEach(material => {
        const input = document.getElementById(`${material}-price`);
        if (input) {
            // Save on blur (when user leaves the input)
            input.addEventListener('blur', () => savePriceFromInput(material));
            
            // Also save on Enter key
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    savePriceFromInput(material);
                }
            });
        }
    });
});

// Show a price management UI (optional enhancement)
function showPriceManager() {
    // This could be expanded to show a dedicated price management screen
    const modal = document.getElementById('project-modal');
    if (modal) {
        modal.classList.add('show');
        // Customize modal content for price management
    }
}
