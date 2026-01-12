const DB_NAME = 'ConstructionCalcDB';
const DB_VERSION = 1;
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
            
            if (!db.objectStoreNames.contains('purchases')) {
                db.createObjectStore('purchases', { keyPath: 'id' });
            }
            
            if (!db.objectStoreNames.contains('calculations')) {
                const calcStore = db.createObjectStore('calculations', { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
                calcStore.createIndex('type', 'type', { unique: false });
                calcStore.createIndex('timestamp', 'timestamp', { unique: false });
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

initDB().catch(console.error);