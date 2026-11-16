(function (root) {
    'use strict';
    // Edit this file to adapt the storefront for another grower.
    const config = {
        farmName: 'Panvel Organic Mangoes',
        products: [
            { id: 'kesar', label: 'Organic Kesar' },
            { id: 'alphonso', label: 'Organic Alphonso' },
            { id: 'payari', label: 'Organic Payari' }
        ],
        deliveryAreas: {
            '400614': 'CBD Belapur', '410206': 'Panvel',
            '400706': 'Nerul', '410210': 'Kharghar'
        },
        // Enquiry quantity limit; this does not represent available stock.
        maxDozens: 50
    };
    if (typeof module === 'object' && module.exports) module.exports = config;
    else root.FARM_CONFIG = config;
}(typeof globalThis !== 'undefined' ? globalThis : this));
