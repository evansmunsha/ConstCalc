const DB_NAME = 'ConstructionCalcDB';
const DB_VERSION = 2; // Updated for projects and prices
let db;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            
            // Purchases store
            if (!db.objectStoreNames.contains('purchases')) {
                db.createObjectStore('purchases', { keyPath: 'id' });
            }
            
            // Calculations store (legacy - kept for backward compatibility)
            if (!db.objectStoreNames.contains('calculations')) {
                const calcStore = db.createObjectStore('calculations', { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
                calcStore.createIndex('type', 'type', { unique: false });
                calcStore.createIndex('timestamp', 'timestamp', { unique: false });
            }
            
            // Projects store - NEW: Save named projects with all details
            if (!db.objectStoreNames.contains('projects')) {
                const projectStore = db.createObjectStore('projects', { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
                projectStore.createIndex('name', 'name', { unique: false });
                projectStore.createIndex('timestamp', 'timestamp', { unique: false });
                projectStore.createIndex('lastModified', 'lastModified', { unique: false });
            }
            
            // Material prices store - NEW: Store local material prices
            if (!db.objectStoreNames.contains('materialPrices')) {
                const priceStore = db.createObjectStore('materialPrices', { keyPath: 'material' });
            }
        };
    });
}

function savePurchase(purchaseData) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['purchases'], 'readwrite');
        const store = transaction.objectStore('purchases');
        const request = store.put(purchaseData);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function getPurchase(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['purchases'], 'readonly');
        const store = transaction.objectStore('purchases');
        const request = store.get(id);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function saveCalculation(calcData) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['calculations'], 'readwrite');
        const store = transaction.objectStore('calculations');
        const request = store.add(calcData);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function getCalculations(type = null) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['calculations'], 'readonly');
        const store = transaction.objectStore('calculations');
        let request;
        
        if (type) {
            const index = store.index('type');
            request = index.getAll(type);
        } else {
            request = store.getAll();
        }
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// ==================== PROJECT FUNCTIONS ====================

// Save a complete project with name, calculations, and costs
function saveProject(projectData) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        const transaction = db.transaction(['projects'], 'readwrite');
        const store = transaction.objectStore('projects');
        const request = projectData.id ? store.put(projectData) : store.add(projectData);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Get all saved projects
function getAllProjects() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        const transaction = db.transaction(['projects'], 'readonly');
        const store = transaction.objectStore('projects');
        const request = store.getAll();
        
        request.onsuccess = () => {
            const projects = request.result || [];
            // Sort by last modified (most recent first)
            projects.sort((a, b) => b.lastModified - a.lastModified);
            resolve(projects);
        };
        request.onerror = () => reject(request.error);
    });
}

// Get single project by ID
function getProject(id) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        const transaction = db.transaction(['projects'], 'readonly');
        const store = transaction.objectStore('projects');
        const request = store.get(id);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Delete a project
function deleteProject(id) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        const transaction = db.transaction(['projects'], 'readwrite');
        const store = transaction.objectStore('projects');
        const request = store.delete(id);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// ==================== MATERIAL PRICE FUNCTIONS ====================

// Save material price
function saveMaterialPrice(material, price, unit = 'ZMW') {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        const transaction = db.transaction(['materialPrices'], 'readwrite');
        const store = transaction.objectStore('materialPrices');
        const data = { material, price: parseFloat(price), unit, lastUpdated: Date.now() };
        const request = store.put(data);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Get material price
function getMaterialPrice(material) {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        const transaction = db.transaction(['materialPrices'], 'readonly');
        const store = transaction.objectStore('materialPrices');
        const request = store.get(material);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Get all material prices
function getAllMaterialPrices() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized'));
            return;
        }
        const transaction = db.transaction(['materialPrices'], 'readonly');
        const store = transaction.objectStore('materialPrices');
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

// Initialize database
initDB().catch(console.error);