// App initialization and UI management

let deferredPrompt;

// Service Worker Registration
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

// PWA Install Prompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBanner();
});

function showInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) {
        banner.style.display = 'block';
    }
}

// Install button handler
document.addEventListener('DOMContentLoaded', () => {
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response: ${outcome}`);
                deferredPrompt = null;
                const banner = document.getElementById('install-banner');
                if (banner) banner.style.display = 'none';
            }
        });
    }
    
    const dismissBtn = document.getElementById('dismiss-install');
    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            const banner = document.getElementById('install-banner');
            if (banner) banner.style.display = 'none';
        });
    }
});

// Tab Navigation
document.addEventListener('DOMContentLoaded', () => {
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
});

// Close Ad Banner
document.addEventListener('DOMContentLoaded', () => {
    const closeAdBtn = document.getElementById('close-ad');
    if (closeAdBtn) {
        closeAdBtn.addEventListener('click', () => {
            const adBanner = document.getElementById('ad-banner');
            if (adBanner) adBanner.style.display = 'none';
        });
    }
});

// Calculator button handlers
document.addEventListener('DOMContentLoaded', () => {
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
});

// Upgrade modal handlers
document.addEventListener('DOMContentLoaded', () => {
    // Show upgrade modal buttons
    const upgradeBtn = document.getElementById('upgrade-btn');
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', () => {
            if (window.billing) window.billing.showUpgradeModal();
        });
    }
    
    // All upgrade overlay buttons
    document.querySelectorAll('.upgrade-btn-overlay').forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.billing) window.billing.showUpgradeModal();
        });
    });
    
    // Bottom ad upgrade button
    document.querySelectorAll('.show-upgrade-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            if (window.billing) window.billing.showUpgradeModal();
        });
    });
    
    // Purchase button
    const purchaseBtn = document.getElementById('purchase-btn');
    if (purchaseBtn) {
        purchaseBtn.addEventListener('click', () => {
            if (window.billing) window.billing.purchasePro();
        });
    }
    
    // Cancel button
    const cancelBtn = document.querySelector('.cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (window.billing) window.billing.hideUpgradeModal();
        });
    }
});

// Initialize billing on load
window.addEventListener('load', () => {
    if (window.billing) {
        window.billing.initializeBilling();
        window.billing.restorePurchases();
    }
});

// Check for updates
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
        registration.update();
    });
}

// Offline/Online status
window.addEventListener('online', () => {
    console.log('Back online');
});

window.addEventListener('offline', () => {
    console.log('Gone offline');
});

// Analytics (optional - add your tracking code)
function trackEvent(category, action, label) {
    // Add your analytics tracking here
    console.log('Event:', category, action, label);
}

// Track calculator usage
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.calculate-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const calculator = e.target.dataset.calculator;
            if (calculator) {
                trackEvent('Calculator', 'Calculate', calculator);
            }
        });
    });
});

console.log('Construction Calculator Pro loaded');