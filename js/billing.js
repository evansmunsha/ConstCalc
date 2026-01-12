// Google Play Billing Integration

class BillingManager {
    constructor() {
        this.isPro = false;
        this.isProcessing = false;
        this.loadProStatus();
    }
    
    // Load pro status from localStorage
    loadProStatus() {
        const saved = localStorage.getItem('isPro');
        this.isPro = saved === 'true';
        this.updateUI();
    }
    
    // Save pro status
    saveProStatus() {
        localStorage.setItem('isPro', this.isPro.toString());
    }
    
    // Check if Digital Goods API is available
    isDigitalGoodsSupported() {
        return 'getDigitalGoodsService' in window;
    }
    
    // Initialize Google Play Billing
    async initializeBilling() {
        if (!this.isDigitalGoodsSupported()) {
            console.log('Digital Goods API not supported - using simulation mode');
            return false;
        }
        
        try {
            this.service = await window.getDigitalGoodsService('https://play.google.com/billing');
            console.log('Billing service initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize billing:', error);
            return false;
        }
    }
    
    // Purchase pro version
    async purchasePro() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        this.showLoading(true);
        
        try {
            // Check if running in TWA/Android
            if (this.isDigitalGoodsSupported()) {
                await this.purchaseViaPlayBilling();
            } else {
                // Fallback for testing/web
                await this.simulatePurchase();
            }
        } catch (error) {
            console.error('Purchase failed:', error);
            alert('Purchase failed. Please try again.');
        } finally {
            this.isProcessing = false;
            this.showLoading(false);
        }
    }
    
    // Real Google Play purchase
    async purchaseViaPlayBilling() {
        if (!this.service) {
            await this.initializeBilling();
        }
        
        try {
            // Get product details
            const details = await this.service.getDetails(['pro_version']);
            const item = details[0];
            
            if (!item) {
                throw new Error('Product not found');
            }
            
            // Request payment
            const paymentRequest = new PaymentRequest(
                [{
                    supportedMethods: 'https://play.google.com/billing',
                    data: {
                        sku: 'pro_version'
                    }
                }],
                {
                    total: {
                        label: 'Construction Calculator Pro',
                        amount: {
                            currency: 'USD',
                            value: '4.99'
                        }
                    }
                }
            );
            
            const paymentResponse = await paymentRequest.show();
            await paymentResponse.complete('success');
            
            // Acknowledge purchase
            await this.acknowledgePurchase(paymentResponse);
            
            // Activate pro
            this.activatePro();
            
        } catch (error) {
            if (error.name !== 'AbortError') {
                throw error;
            }
        }
    }
    
    // Acknowledge purchase with Google Play
    async acknowledgePurchase(paymentResponse) {
        const token = paymentResponse.details.token;
        
        // In production, send this to your backend
        // Your backend should verify with Google Play and acknowledge
        console.log('Purchase token:', token);
        
        // For now, acknowledge client-side (not recommended for production)
        if (this.service && this.service.acknowledge) {
            await this.service.acknowledge(token, 'onetime');
        }
    }
    
    // Simulate purchase for testing
    async simulatePurchase() {
        return new Promise((resolve) => {
            setTimeout(() => {
                this.activatePro();
                resolve();
            }, 2000);
        });
    }
    
    // Activate pro features
    activatePro() {
        this.isPro = true;
        this.saveProStatus();
        this.updateUI();
        this.hideUpgradeModal();
        alert('🎉 Welcome to Pro! All features unlocked.');
    }
    
    // Update UI based on pro status
    updateUI() {
        const upgradeBtn = document.getElementById('upgrade-btn');
        const proBadge = document.getElementById('pro-badge-active');
        const adBanner = document.getElementById('ad-banner');
        const bottomAd = document.getElementById('bottom-ad');
        const proOverlays = document.querySelectorAll('.pro-overlay');
        
        if (this.isPro) {
            // Hide ads and upgrade button
            if (upgradeBtn) upgradeBtn.classList.add('hidden');
            if (proBadge) proBadge.classList.remove('hidden');
            if (adBanner) adBanner.classList.add('hidden');
            if (bottomAd) bottomAd.classList.add('hidden');
            
            // Remove pro overlays
            proOverlays.forEach(overlay => overlay.remove());
            
            // Enable pro features
            this.enableProFeatures();
        }
    }
    
    // Enable all pro features
    enableProFeatures() {
        // Enable brick calculator
        const brickLength = document.getElementById('brick-length');
        const brickHeight = document.getElementById('brick-height');
        const brickThickness = document.getElementById('brick-thickness');
        
        if (brickLength) brickLength.disabled = false;
        if (brickHeight) brickHeight.disabled = false;
        if (brickThickness) brickThickness.disabled = false;
        
        document.querySelectorAll('#brick-tab .calculate-btn').forEach(btn => btn.disabled = false);
        
        // Enable area calculator
        const areaShape = document.getElementById('area-shape');
        const areaLength = document.getElementById('area-length');
        const areaWidth = document.getElementById('area-width');
        
        if (areaShape) areaShape.disabled = false;
        if (areaLength) areaLength.disabled = false;
        if (areaWidth) areaWidth.disabled = false;
        
        document.querySelectorAll('#area-tab .calculate-btn').forEach(btn => btn.disabled = false);
        
        // Enable volume calculator
        const volLength = document.getElementById('vol-length');
        const volWidth = document.getElementById('vol-width');
        const volHeight = document.getElementById('vol-height');
        
        if (volLength) volLength.disabled = false;
        if (volWidth) volWidth.disabled = false;
        if (volHeight) volHeight.disabled = false;
        
        document.querySelectorAll('#volume-tab .calculate-btn').forEach(btn => btn.disabled = false);
    }
    
    // Show/hide loading spinner
    showLoading(show) {
        const spinner = document.getElementById('loading-spinner');
        const purchaseBtn = document.getElementById('purchase-btn');
        
        if (spinner && purchaseBtn) {
            if (show) {
                spinner.style.display = 'block';
                purchaseBtn.disabled = true;
            } else {
                spinner.style.display = 'none';
                purchaseBtn.disabled = false;
            }
        }
    }
    
    // Show upgrade modal
    showUpgradeModal() {
        const modal = document.getElementById('upgrade-modal');
        if (modal) modal.classList.add('show');
    }
    
    // Hide upgrade modal
    hideUpgradeModal() {
        const modal = document.getElementById('upgrade-modal');
        if (modal) modal.classList.remove('show');
    }
    
    // Restore purchases (for users who reinstall)
    async restorePurchases() {
        if (!this.service) {
            await this.initializeBilling();
        }
        
        if (!this.service) return;
        
        try {
            const purchases = await this.service.listPurchases();
            const proPurchase = purchases.find(p => p.itemId === 'pro_version');
            
            if (proPurchase) {
                this.activatePro();
            }
        } catch (error) {
            console.error('Failed to restore purchases:', error);
        }
    }
}

// Initialize billing manager
const billing = new BillingManager();

// Export for use in other scripts
window.billing = billing;