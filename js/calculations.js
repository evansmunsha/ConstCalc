// CEMENT CALCULATOR
function calculateCement() {
    const length = parseFloat(document.getElementById('cement-length').value);
    const width = parseFloat(document.getElementById('cement-width').value);
    const thickness = parseFloat(document.getElementById('cement-thickness').value);
    const ratio = document.getElementById('cement-ratio').value;
    
    if (!length || !width || !thickness) {
        showError('cement-result', 'Please fill in all fields');
        return;
    }
    
    // Convert thickness from mm to meters
    const thicknessM = thickness / 1000;
    
    // Calculate wet volume
    const wetVolume = length * width * thicknessM;
    
    // Add 54% for dry volume (accounts for voids and wastage)
    const dryVolume = wetVolume * 1.54;
    
    // Parse mix ratio (e.g., "1:2:4" means 1 cement : 2 sand : 4 aggregate)
    const [cementPart, sandPart, aggregatePart] = ratio.split(':').map(Number);
    const totalParts = cementPart + sandPart + aggregatePart;
    
    // Calculate individual volumes
    const cementVolume = (dryVolume * cementPart) / totalParts;
    const sandVolume = (dryVolume * sandPart) / totalParts;
    const aggregateVolume = (dryVolume * aggregatePart) / totalParts;
    
    // Convert cement volume to bags (1 bag = 50kg = 0.035 m³)
    const cementBags = Math.ceil(cementVolume / 0.035);
    
    // Get material prices if provided
    const cementPriceInput = document.getElementById('cement-price');
    const sandPriceInput = document.getElementById('sand-price');
    const aggregatePriceInput = document.getElementById('aggregate-price');
    
    const cementPrice = cementPriceInput ? parseFloat(cementPriceInput.value) || 0 : 0;
    const sandPrice = sandPriceInput ? parseFloat(sandPriceInput.value) || 0 : 0;
    const aggregatePrice = aggregatePriceInput ? parseFloat(aggregatePriceInput.value) || 0 : 0;
    
    // Calculate costs
    const cementCost = cementPrice * cementBags;
    const sandCost = sandPrice * sandVolume;
    const aggregateCost = aggregatePrice * aggregateVolume;
    const totalCost = cementCost + sandCost + aggregateCost;
    
    const result = {
        'Volume': `${wetVolume.toFixed(3)} m³`,
        'Cement Bags': `${cementBags} bags (50kg)`,
        'Sand': `${sandVolume.toFixed(3)} m³`,
        'Aggregate': `${aggregateVolume.toFixed(3)} m³`
    };
    
    // Add cost breakdown if prices are provided
    if (totalCost > 0) {
        result['--- COSTS ---'] = '';
        if (cementCost > 0) result['Cement Cost'] = `ZMW ${cementCost.toFixed(2)}`;
        if (sandCost > 0) result['Sand Cost'] = `ZMW ${sandCost.toFixed(2)}`;
        if (aggregateCost > 0) result['Aggregate Cost'] = `ZMW ${aggregateCost.toFixed(2)}`;
        result['TOTAL COST'] = `ZMW ${totalCost.toFixed(2)}`;
    }
    
    // Store results globally for saving
    window.lastCementResults = result;
    
    showResult('cement-result', result);
    
    // Show save project button after successful calculation
    const saveBtn = document.getElementById('save-cement-project');
    if (saveBtn) saveBtn.style.display = 'block';
    
    // Save to IndexedDB
    saveCalculation({
        type: 'cement',
        timestamp: Date.now(),
        inputs: { length, width, thickness, ratio },
        results: result
    });
}

// BRICK CALCULATOR
function calculateBrick() {
    const length = parseFloat(document.getElementById('brick-length').value);
    const height = parseFloat(document.getElementById('brick-height').value);
    const mortarThickness = parseFloat(document.getElementById('brick-mortar').value);
    
    if (!length || !height || !mortarThickness) {
        showError('brick-result', 'Please fill in all fields');
        return;
    }
    
    // Standard Zambian brick dimensions in meters
    const brickLength = 0.230; // 230mm
    const brickHeight = 0.076; // 76mm
    const mortarM = mortarThickness / 1000; // Convert mm to m
    
    // Calculate wall area
    const wallArea = length * height;
    
    // Calculate area covered by one brick including mortar
    const brickWithMortarLength = brickLength + mortarM;
    const brickWithMortarHeight = brickHeight + mortarM;
    const areaPerBrick = brickWithMortarLength * brickWithMortarHeight;
    
    // Calculate number of bricks needed
    const bricksNeeded = Math.ceil(wallArea / areaPerBrick);
    
    // Add 5% wastage for breakage and cutting
    const bricksWithWastage = Math.ceil(bricksNeeded * 1.05);
    
    // Calculate mortar volume
    const wallThickness = 0.110; // Standard single brick wall (110mm)
    const wallVolume = length * height * wallThickness;
    const totalBrickVolume = bricksNeeded * (0.230 * 0.110 * 0.076);
    const mortarVolume = wallVolume - totalBrickVolume;
    
    // Get material prices if provided
    const brickPriceInput = document.getElementById('brick-price');
    const mortarPriceInput = document.getElementById('mortar-price');
    
    const brickPrice = brickPriceInput ? parseFloat(brickPriceInput.value) || 0 : 0;
    const mortarPrice = mortarPriceInput ? parseFloat(mortarPriceInput.value) || 0 : 0;
    
    // Calculate costs
    const brickCost = brickPrice * bricksWithWastage;
    const mortarCost = mortarPrice * mortarVolume;
    const totalCost = brickCost + mortarCost;
    
    const result = {
        'Wall Area': `${wallArea.toFixed(2)} m²`,
        'Bricks Needed': `${bricksWithWastage} pieces`,
        'Mortar Volume': `${mortarVolume.toFixed(3)} m³`
    };
    
    // Add cost breakdown if prices are provided
    if (totalCost > 0) {
        result['--- COSTS ---'] = '';
        if (brickCost > 0) result['Bricks Cost'] = `ZMW ${brickCost.toFixed(2)}`;
        if (mortarCost > 0) result['Mortar Cost'] = `ZMW ${mortarCost.toFixed(2)}`;
        result['TOTAL COST'] = `ZMW ${totalCost.toFixed(2)}`;
    }
    
    // Store results globally for saving
    window.lastBrickResults = result;
    
    showResult('brick-result', result);
    
    // Show save project button after successful calculation
    const saveBtn = document.getElementById('save-brick-project');
    if (saveBtn) saveBtn.style.display = 'block';
    
    saveCalculation({
        type: 'brick',
        timestamp: Date.now(),
        inputs: { length, height, mortarThickness },
        results: result
    });
}

// AREA CALCULATOR
function calculateArea() {
    const shape = document.getElementById('area-shape').value;
    const length = parseFloat(document.getElementById('area-length').value);
    const width = parseFloat(document.getElementById('area-width').value);
    
    if (!length) {
        showError('area-result', 'Please fill in all fields');
        return;
    }
    
    let area = 0;
    
    switch(shape) {
        case 'rectangle':
            if (!width) {
                showError('area-result', 'Please fill in all fields');
                return;
            }
            area = length * width;
            break;
        case 'triangle':
            if (!width) {
                showError('area-result', 'Please fill in all fields');
                return;
            }
            area = (length * width) / 2;
            break;
        case 'circle':
            area = Math.PI * Math.pow(length, 2);
            break;
    }
    
    const result = {
        'Area': `${area.toFixed(2)} m²`,
        'Area in Hectares': `${(area / 10000).toFixed(4)} ha`
    };
    
    showResult('area-result', result);
    
    saveCalculation({
        type: 'area',
        timestamp: Date.now(),
        inputs: { shape, length, width },
        results: result
    });
}

// VOLUME CALCULATOR
function calculateVolume() {
    const shape = document.getElementById('volume-shape').value;
    const length = parseFloat(document.getElementById('vol-length').value);
    const width = parseFloat(document.getElementById('vol-width').value);
    const height = parseFloat(document.getElementById('vol-height').value);
    
    let volume = 0;
    
    switch(shape) {
        case 'cube':
            if (!length) {
                showError('volume-result', 'Please fill in all fields');
                return;
            }
            volume = length * length * length;
            break;
        case 'cuboid':
            if (!length || !width || !height) {
                showError('volume-result', 'Please fill in all fields');
                return;
            }
            volume = length * width * height;
            break;
        case 'cylinder':
            if (!length || !height) {
                showError('volume-result', 'Please fill in all fields');
                return;
            }
            // For cylinder, length is used as radius
            volume = Math.PI * Math.pow(length, 2) * height;
            break;
    }
    
    const result = {
        'Volume': `${volume.toFixed(3)} m³`,
        'Volume in Litres': `${(volume * 1000).toFixed(2)} L`
    };
    
    showResult('volume-result', result);
    
    saveCalculation({
        type: 'volume',
        timestamp: Date.now(),
        inputs: { shape, length, width, height },
        results: result
    });
}

// DISPLAY RESULTS
function showResult(elementId, data) {
    const resultDiv = document.getElementById(elementId);
    const items = Object.entries(data).map(([label, value]) => {
        // Special styling for cost section
        if (label === '--- COSTS ---') {
            return `<div style="grid-column: 1 / -1; border-top: 2px solid #f97316; margin: 8px 0; padding-top: 12px;"></div>`;
        }
        
        // Highlight total cost
        const isTotalCost = label === 'TOTAL COST';
        const itemClass = isTotalCost ? 'result-item-total' : 'result-item';
        
        return `
            <div class="${itemClass}">
                <div class="result-label">${label}</div>
                <div class="result-value" style="${isTotalCost ? 'font-size: 28px; color: #059669;' : ''}">${value}</div>
            </div>
        `;
    }).join('');
    
    // Only show shopping list button for construction calculators (not tools)
    const showShoppingList = ['cement-result', 'brick-result', 'area-result', 'volume-result'].includes(elementId);
    
    resultDiv.innerHTML = `
        <div class="result-grid">
            <div class="result-title">Results</div>
            <div class="result-items">${items}</div>
            ${showShoppingList ? `<button onclick="generateShoppingList('${elementId}')" class="shopping-list-btn">
                📝 Generate Shopping List
            </button>` : ''}
        </div>
    `;
}

// DISPLAY ERROR
function showError(elementId, message) {
    const resultDiv = document.getElementById(elementId);
    resultDiv.innerHTML = `
        <div style="background: #fee2e2; color: #991b1b; padding: 16px; border-radius: 8px; text-align: center; margin-top: 20px;">
            ${message}
        </div>
    `;
}

// ==================== SHOPPING LIST GENERATION ====================

// Generate shopping list from results
function generateShoppingList(resultElementId) {
    const resultDiv = document.getElementById(resultElementId);
    if (!resultDiv) return;
    
    // Determine calculator type from element ID
    const type = resultElementId.replace('-result', '');
    
    // Get project name
    const projectNameInput = document.getElementById(`${type}-project-name`);
    const projectName = projectNameInput && projectNameInput.value ? projectNameInput.value : `${type.charAt(0).toUpperCase() + type.slice(1)} Project`;
    
    // Get results from the global stored results
    let results = {};
    if (type === 'cement') {
        results = window.lastCementResults || {};
    } else if (type === 'brick') {
        results = window.lastBrickResults || {};
    } else if (type === 'area') {
        results = window.lastAreaResults || {};
    } else if (type === 'volume') {
        results = window.lastVolumeResults || {};
    }
    
    if (Object.keys(results).length === 0) {
        alert('No results to generate shopping list. Please calculate first.');
        return;
    }
    
    // Build shopping list text
    let shoppingList = `📋 SHOPPING LIST\n`;
    shoppingList += `Project: ${projectName}\n`;
    shoppingList += `Date: ${new Date().toLocaleDateString('en-GB')}\n`;
    shoppingList += `\n--- MATERIALS NEEDED ---\n`;
    
    // Add quantities (skip cost items)
    Object.entries(results).forEach(([label, value]) => {
        if (!label.includes('COST') && !label.includes('---')) {
            shoppingList += `• ${label}: ${value}\n`;
        }
    });
    
    // Add cost summary if available
    const totalCost = results['TOTAL COST'];
    if (totalCost) {
        shoppingList += `\n--- BUDGET ---\n`;
        Object.entries(results).forEach(([label, value]) => {
            if (label.includes('Cost') || label === 'TOTAL COST') {
                shoppingList += `• ${label}: ${value}\n`;
            }
        });
    }
    
    shoppingList += `\n🏗️ Generated by Construction Calculator Pro`;
    
    // Show share modal
    showShareModal(shoppingList, projectName);
}

// Show share modal with options
function showShareModal(text, projectName) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.id = 'share-modal';
    
    modal.innerHTML = `
        <div class="modal-content">
            <h2>📤 Share Shopping List</h2>
            <p class="modal-subtitle">${projectName}</p>
            
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0; max-height: 300px; overflow-y: auto;">
                <pre style="white-space: pre-wrap; font-size: 14px; margin: 0; font-family: inherit;">${text}</pre>
            </div>
            
            <div style="display: grid; gap: 12px;">
                <button onclick="shareViaWhatsApp()" class="purchase-btn" style="background: #25D366;">
                    <span style="font-size: 20px;">📱</span> Share via WhatsApp
                </button>
                <button onclick="copyToClipboard()" class="purchase-btn" style="background: #3b82f6;">
                    <span style="font-size: 20px;">📋</span> Copy to Clipboard
                </button>
                <button onclick="shareViaSMS()" class="purchase-btn" style="background: #8b5cf6;">
                    <span style="font-size: 20px;">💬</span> Share via SMS
                </button>
            </div>
            
            <button onclick="closeShareModal()" class="cancel-btn" style="margin-top: 12px;">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Store the text globally for sharing functions
    window.currentShoppingList = text;
}

// Close share modal
function closeShareModal() {
    const modal = document.getElementById('share-modal');
    if (modal) {
        modal.remove();
    }
}

// Share via WhatsApp
function shareViaWhatsApp() {
    const text = encodeURIComponent(window.currentShoppingList || '');
    const url = `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
}

// Share via SMS
function shareViaSMS() {
    const text = encodeURIComponent(window.currentShoppingList || '');
    const url = `sms:?body=${text}`;
    window.location.href = url;
}

// Copy to clipboard
function copyToClipboard() {
    const text = window.currentShoppingList || '';
    
    // Modern Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            alert('✓ Shopping list copied to clipboard!');
            closeShareModal();
        }).catch(err => {
            // Fallback method
            fallbackCopyTextToClipboard(text);
        });
    } else {
        // Fallback for older browsers
        fallbackCopyTextToClipboard(text);
    }
}

// Fallback copy method
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            alert('✓ Shopping list copied to clipboard!');
            closeShareModal();
        } else {
            alert('❌ Failed to copy. Please copy manually.');
        }
    } catch (err) {
        alert('❌ Failed to copy. Please copy manually.');
    }
    
    document.body.removeChild(textArea);
}