let deferredPrompt;

// SERVICE WORKER REGISTRATION
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered:', registration);
            })
            .catch((error) => {
                console.log('SW registration failed:', error);
            });
    });
}

// PWA INSTALL PROMPT
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const banner = document.getElementById('install-banner');
    if (banner) {
        banner.style.display = 'block';
    }
});

// INITIALIZE ON PAGE LOAD
document.addEventListener('DOMContentLoaded', () => {
    
    // TAB NAVIGATION
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            // Remove active class from all tabs and contents
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const tabContent = document.getElementById(`${tabName}-tab`);
            if (tabContent) tabContent.classList.add('active');
        });
    });
    
    // CLOSE AD BANNER
    const closeAdBtn = document.getElementById('close-ad');
    if (closeAdBtn) {
        closeAdBtn.addEventListener('click', () => {
            const adBanner = document.getElementById('ad-banner');
            if (adBanner) adBanner.style.display = 'none';
        });
    }
    
    // CALCULATOR BUTTONS
    document.querySelectorAll('.calculate-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const calculator = e.target.dataset.calculator;
            if (calculator) {
                switch(calculator) {
                    case 'cement':
                        calculateCement();
                        break;
                    case 'brick':
                        calculateBrick();
                        break;
                    case 'area':
                        calculateArea();
                        break;
                    case 'volume':
                        calculateVolume();
                        break;
                }
            }
        });
    });
    
    // UPGRADE BUTTON (HEADER)
    const upgradeBtn = document.getElementById('upgrade-btn');
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', () => {
            if (window.billing) window.billing.showUpgradeModal();
        });
    }
    
    // UPGRADE OVERLAY BUTTONS
    document.querySelectorAll('.upgrade-btn-overlay').forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.billing) window.billing.showUpgradeModal();
        });
    });
    
    // BOTTOM AD UPGRADE BUTTON
    document.querySelectorAll('.show-upgrade-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.billing) window.billing.showUpgradeModal();
        });
    });
    
    // PURCHASE BUTTON
    const purchaseBtn = document.getElementById('purchase-btn');
    if (purchaseBtn) {
        purchaseBtn.addEventListener('click', () => {
            if (window.billing) window.billing.purchasePro();
        });
    }
    
    // CANCEL BUTTON (MODAL)
    const cancelBtn = document.querySelector('.cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (window.billing) window.billing.hideUpgradeModal();
        });
    }
    
    // INSTALL BUTTON
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log('User response to install prompt:', outcome);
                deferredPrompt = null;
                const banner = document.getElementById('install-banner');
                if (banner) banner.style.display = 'none';
            }
        });
    }
    
    // DISMISS INSTALL BUTTON
    const dismissBtn = document.getElementById('dismiss-install');
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            const banner = document.getElementById('install-banner');
            if (banner) banner.style.display = 'none';
        });
    }
    
    // AUTO-CALCULATE ON CEMENT TAB LOAD (with default values)
    calculateCement();
});

// INITIALIZE BILLING ON LOAD
window.addEventListener('load', () => {
    if (window.billing) {
        window.billing.initializeBilling();
        window.billing.restorePurchases();
    }
});

// CHECK FOR SERVICE WORKER UPDATES
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
        registration.update();
    });
}

// ONLINE/OFFLINE STATUS
window.addEventListener('online', () => {
    console.log('Back online');
});

window.addEventListener('offline', () => {
    console.log('Gone offline');
});

console.log('Construction Calculator Pro loaded');