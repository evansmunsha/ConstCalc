class BillingManager {
    constructor() {
        this.isPro = false;
        this.isProcessing = false;
        this.loadProStatus();
    }
    
    loadProStatus() {
        const saved = localStorage.getItem('isPro');
        this.isPro = saved === 'true';
        this.updateUI();
    }
    
    saveProStatus() {
        localStorage.setItem('isPro', this.isPro.toString());
    }
    
    isDigitalGoodsSupported() {
        return 'getDigitalGoodsService' in window;
    }
    
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
    
    async purchasePro() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        this.showLoading(true);
        
        try {
            if (this.isDigitalGoodsSupported()) {
                await this.purchaseViaPlayBilling();
            } else {
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
    
    async purchaseViaPlayBilling() {
        if (!this.service) {
            await this.initializeBilling();
        }
        
        try {
            const details = await this.service.getDetails(['pro_version']);
            const item = details[0];
            
            if (!item) {
                throw new Error('Product not found');
            }
            
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
            
            await this.acknowledgePurchase(paymentResponse);
            
            this.activatePro();
            
        } catch (error) {
            if (error.name !== 'AbortError') {
                throw error;
            }
        }
    }
    
    async acknowledgePurchase(paymentResponse) {
        const token = paymentResponse.details.token;
        
        const purchaseData = {
            id: 'pro_version',
            token: token,
            timestamp: Date.now(),
            status: 'purchased'
        };
        
        await savePurchase(purchaseData);
        console.log('Purchase acknowledged:', token);
    }
    
    async simulatePurchase() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const purchaseData = {
                    id: 'pro_version',
                    token: 'SIMULATED_' + Date.now(),
                    timestamp: Date.now(),
                    status: 'purchased'
                };
                
                savePurchase(purchaseData).then(() => {
                    this.activatePro();
                    resolve();
                });
            }, 2000);
        });
    }
    
    activatePro() {
        this.isPro = true;
        this.saveProStatus();
        this.updateUI();
        this.hideUpgradeModal();
        alert('🎉 Welcome to Pro! All features unlocked.');
    }
    
    updateUI() {
        const upgradeBtn = document.getElementById('upgrade-btn');
        const proBadge = document.getElementById('pro-badge-active');
        const adBanner = document.getElementById('ad-banner');
        const bottomAd = document.getElementById('bottom-ad');
        const proOverlays = document.querySelectorAll('.pro-overlay');
        
        if (this.isPro) {
            if (upgradeBtn) upgradeBtn.classList.add('hidden');
            if (proBadge) proBadge.classList.remove('hidden');
            if (adBanner) adBanner.classList.add('hidden');
            if (bottomAd) bottomAd.classList.add('hidden');
            
            proOverlays.forEach(overlay => overlay.remove());
            
            this.enableProFeatures();
        }
    }
    
    enableProFeatures() {
        const brickLength = document.getElementById('brick-length');
        const brickHeight = document.getElementById('brick-height');
        const brickThickness = document.getElementById('brick-thickness');
        
        if (brickLength) brickLength.disabled = false;
        if (brickHeight) brickHeight.disabled = false;
        if (brickThickness) brickThickness.disabled = false;
        
        document.querySelectorAll('#brick-tab .calculate-btn').forEach(btn => btn.disabled = false);
        
        const areaShape = document.getElementById('area-shape');
        const areaLength = document.getElementById('area-length');
        const areaWidth = document.getElementById('area-width');
        
        if (areaShape) areaShape.disabled = false;
        if (areaLength) areaLength.disabled = false;
        if (areaWidth) areaWidth.disabled = false;
        
        document.querySelectorAll('#area-tab .calculate-btn').forEach(btn => btn.disabled = false);
        
        const volLength = document.getElementById('vol-length');
        const volWidth = document.getElementById('vol-width');
        const volHeight = document.getElementById('vol-height');
        
        if (volLength) volLength.disabled = false;
        if (volWidth) volWidth.disabled = false;
        if (volHeight) volHeight.disabled = false;
        
        document.querySelectorAll('#volume-tab .calculate-btn').forEach(btn => btn.disabled = false);
    }
    
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
    
    showUpgradeModal() {
        const modal = document.getElementById('upgrade-modal');
        if (modal) modal.classList.add('show');
    }
    
    hideUpgradeModal() {
        const modal = document.getElementById('upgrade-modal');
        if (modal) modal.classList.remove('show');
    }
    
    async restorePurchases() {
        try {
            const purchase = await getPurchase('pro_version');
            if (purchase && purchase.status === 'purchased') {
                this.activatePro();
            }
        } catch (error) {
            console.log('No previous purchase found');
        }
    }
}

const billing = new BillingManager();
window.billing = billing;