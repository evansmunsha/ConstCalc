// ==================== UNIT CONVERTER ====================

// Conversion factors
const CONVERSIONS = {
    cement: {
        // 1 bag of 50kg cement = 0.05 tonnes
        toBase: 0.05,
        fromLabel: 'Cement Bags (50kg)',
        toLabel: 'Tonnes'
    },
    volume: {
        // 1 cubic meter = 1000 litres
        toBase: 1000,
        fromLabel: 'Cubic Meters (m³)',
        toLabel: 'Litres (L)'
    },
    area: {
        // 1 hectare = 10,000 square meters
        toBase: 0.0001,
        fromLabel: 'Square Meters (m²)',
        toLabel: 'Hectares (ha)'
    },
    length: {
        // 1 meter = 3.28084 feet
        toBase: 3.28084,
        fromLabel: 'Meters (m)',
        toLabel: 'Feet (ft)'
    }
};

// Update labels when conversion type changes
function updateConverterLabels() {
    const type = document.getElementById('converter-type').value;
    const conversion = CONVERSIONS[type];
    
    if (conversion) {
        document.getElementById('converter-from-label').textContent = conversion.fromLabel;
        document.getElementById('converter-to-label').textContent = conversion.toLabel;
        
        // Clear inputs
        document.getElementById('converter-from').value = '';
        document.getElementById('converter-to').value = '';
    }
}

// Convert unit
function convertUnit() {
    const type = document.getElementById('converter-type').value;
    const fromValue = parseFloat(document.getElementById('converter-from').value);
    const toInput = document.getElementById('converter-to');
    
    if (!fromValue || fromValue < 0) {
        toInput.value = '';
        return;
    }
    
    const conversion = CONVERSIONS[type];
    if (!conversion) return;
    
    const result = fromValue * conversion.toBase;
    toInput.value = result.toFixed(4);
}

// ==================== LABOR COST CALCULATOR ====================

function calculateLabor() {
    const workers = parseInt(document.getElementById('labor-workers').value);
    const dailyRate = parseFloat(document.getElementById('labor-daily-rate').value);
    const days = parseInt(document.getElementById('labor-days').value);
    
    if (!workers || !dailyRate || !days || workers < 1 || dailyRate < 0 || days < 1) {
        const resultDiv = document.getElementById('labor-result');
        resultDiv.innerHTML = `
            <div style="background: #fee2e2; color: #991b1b; padding: 16px; border-radius: 8px; text-align: center; margin-top: 20px;">
                Please fill in all fields with valid values
            </div>
        `;
        return;
    }
    
    // Calculate costs
    const dailyCost = workers * dailyRate;
    const totalCost = dailyCost * days;
    
    // Calculate breakdown
    const weeklyDays = Math.min(days, 7);
    const weeklyCost = dailyCost * weeklyDays;
    
    const result = {
        'Workers': `${workers} people`,
        'Daily Rate': `ZMW ${dailyRate.toFixed(2)} per worker`,
        'Duration': `${days} days`,
        '--- COSTS ---': '',
        'Daily Labor Cost': `ZMW ${dailyCost.toFixed(2)}`,
        'Weekly Cost': `ZMW ${weeklyCost.toFixed(2)} (${weeklyDays} days)`,
        'TOTAL COST': `ZMW ${totalCost.toFixed(2)}`
    };
    
    showResult('labor-result', result);
}

// ==================== QUICK CALCULATIONS ====================

// Calculate materials needed for different wall thicknesses
function calculateWallMaterials(length, height, wallType) {
    const wallTypes = {
        'single': { thickness: 0.11, bricksPerM2: 55 },
        'cavity': { thickness: 0.23, bricksPerM2: 110 },
        'double': { thickness: 0.23, bricksPerM2: 110 }
    };
    
    const wall = wallTypes[wallType];
    if (!wall) return null;
    
    const area = length * height;
    const bricks = Math.ceil(area * wall.bricksPerM2 * 1.05); // Add 5% wastage
    
    return {
        area: area,
        bricks: bricks,
        thickness: wall.thickness
    };
}

// Calculate concrete volume for different shapes
function calculateConcreteVolume(shape, dimensions) {
    let volume = 0;
    
    switch(shape) {
        case 'slab':
            volume = dimensions.length * dimensions.width * dimensions.thickness;
            break;
        case 'footing':
            volume = dimensions.length * dimensions.width * dimensions.depth;
            break;
        case 'column':
            volume = dimensions.width * dimensions.depth * dimensions.height;
            break;
    }
    
    return volume;
}

// Initialize tools tab
document.addEventListener('DOMContentLoaded', () => {
    // Set up initial converter labels
    setTimeout(() => {
        updateConverterLabels();
    }, 100);
});
