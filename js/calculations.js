function calculateCement() {
    const length = parseFloat(document.getElementById('cement-length').value);
    const width = parseFloat(document.getElementById('cement-width').value);
    const thickness = parseFloat(document.getElementById('cement-thickness').value);
    const ratio = document.getElementById('cement-ratio').value;
    
    if (!length || !width || !thickness) {
        showError('cement-result', 'Please fill in all fields');
        return;
    }
    
    const thicknessM = thickness / 1000;
    const volume = length * width * thicknessM;
    const dryVolume = volume * 1.54;
    
    let cementBags, sand, aggregate;
    
    switch(ratio) {
        case '1:2:4':
            cementBags = (dryVolume * 1) / 7 / 0.035;
            sand = (dryVolume * 2) / 7;
            aggregate = (dryVolume * 4) / 7;
            break;
        case '1:3:6':
            cementBags = (dryVolume * 1) / 10 / 0.035;
            sand = (dryVolume * 3) / 10;
            aggregate = (dryVolume * 6) / 10;
            break;
        case '1:1.5:3':
            cementBags = (dryVolume * 1) / 5.5 / 0.035;
            sand = (dryVolume * 1.5) / 5.5;
            aggregate = (dryVolume * 3) / 5.5;
            break;
    }
    
    const result = {
        'Volume': `${volume.toFixed(2)} m³`,
        'Cement Bags': Math.ceil(cementBags),
        'Sand': `${sand.toFixed(2)} m³`,
        'Aggregate': `${aggregate.toFixed(2)} m³`
    };
    
    showResult('cement-result', result);
    
    saveCalculation({
        type: 'cement',
        timestamp: Date.now(),
        inputs: { length, width, thickness, ratio },
        results: result
    });
}

function calculateBrick() {
    const length = parseFloat(document.getElementById('brick-length').value);
    const height = parseFloat(document.getElementById('brick-height').value);
    const thickness = parseFloat(document.getElementById('brick-thickness').value);
    
    if (!length || !height) {
        showError('brick-result', 'Please fill in all fields');
        return;
    }
    
    const area = length * height;
    const bricksPerSqM = thickness === 115 ? 57 : 114;
    const totalBricks = Math.ceil(area * bricksPerSqM);
    const mortar = area * (thickness / 1000) * 0.25;
    
    const result = {
        'Wall Area': `${area.toFixed(2)} m²`,
        'Bricks Needed': totalBricks,
        'Mortar': `${mortar.toFixed(2)} m³`
    };
    
    showResult('brick-result', result);
    
    saveCalculation({
        type: 'brick',
        timestamp: Date.now(),
        inputs: { length, height, thickness },
        results: result
    });
}

function calculateArea() {
    const length = parseFloat(document.getElementById('area-length').value);
    const width = parseFloat(document.getElementById('area-width').value);
    const shape = document.getElementById('area-shape').value;
    
    if (!length || (!width && shape !== 'circle')) {
        showError('area-result', 'Please fill in all fields');
        return;
    }
    
    let area;
    switch(shape) {
        case 'rectangle':
            area = length * width;
            break;
        case 'triangle':
            area = (length * width) / 2;
            break;
        case 'circle':
            area = Math.PI * Math.pow(length, 2);
            break;
    }
    
    const result = {
        'Square Meters': `${area.toFixed(2)} m²`,
        'Square Feet': `${(area * 10.764).toFixed(2)} ft²`
    };
    
    showResult('area-result', result);
    
    saveCalculation({
        type: 'area',
        timestamp: Date.now(),
        inputs: { length, width, shape },
        results: result
    });
}

function calculateVolume() {
    const length = parseFloat(document.getElementById('vol-length').value);
    const width = parseFloat(document.getElementById('vol-width').value);
    const height = parseFloat(document.getElementById('vol-height').value);
    
    if (!length || !width || !height) {
        showError('volume-result', 'Please fill in all fields');
        return;
    }
    
    const volume = length * width * height;
    
    const result = {
        'Cubic Meters': `${volume.toFixed(2)} m³`,
        'Cubic Feet': `${(volume * 35.315).toFixed(2)} ft³`,
        'Liters': `${(volume * 1000).toFixed(2)} L`
    };
    
    showResult('volume-result', result);
    
    saveCalculation({
        type: 'volume',
        timestamp: Date.now(),
        inputs: { length, width, height },
        results: result
    });
}

function showResult(elementId, data) {
    const resultDiv = document.getElementById(elementId);
    const items = Object.entries(data).map(([label, value]) => `
        <div class="result-item">
            <div class="result-label">${label}</div>
            <div class="result-value">${value}</div>
        </div>
    `).join('');
    
    resultDiv.innerHTML = `
        <div class="result-grid">
            <div class="result-title">Results</div>
            <div class="result-items">${items}</div>
        </div>
    `;
}

function showError(elementId, message) {
    const resultDiv = document.getElementById(elementId);
    resultDiv.innerHTML = `
        <div style="background: #fee2e2; color: #991b1b; padding: 16px; border-radius: 8px; text-align: center;">
            ${message}
        </div>
    `;
}