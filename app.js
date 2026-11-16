(function (root) {
    'use strict';
    const isNode = typeof module === 'object' && module.exports;
    const defaultConfig = isNode ? require('./config.js') : root.FARM_CONFIG;
    const owns = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

    function checkDeliveryPin(value, config = defaultConfig) {
        const pin = typeof value === 'string' ? value.trim() : '';
        if (!/^[0-9]{6}$/.test(pin)) return { ok: false, message: 'Enter a six-digit delivery PIN code.' };
        if (!owns(config.deliveryAreas, pin)) return { ok: false, message: 'This PIN is outside the listed delivery areas.' };
        return { ok: true, pin, area: config.deliveryAreas[pin] };
    }

    function validateEnquiry(input, config = defaultConfig) {
        input = input && typeof input === 'object' ? input : {};
        const errors = {};
        const rawName = typeof input.name === 'string' ? input.name : '';
        const name = rawName.trim();
        if (!name || name.length > 80 || /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/u.test(rawName)) {
            errors.name = 'Enter a name of 1–80 characters on one line.';
        }
        const product = config.products.find(item => item.id === input.productId);
        if (!product) errors.productId = 'Choose a mango variety from the list.';
        const rawDozens = typeof input.dozens === 'string' ? input.dozens.trim()
            : (typeof input.dozens === 'number' ? String(input.dozens) : '');
        const dozens = /^[0-9]+$/.test(rawDozens) ? Number(rawDozens) : NaN;
        if (!Number.isSafeInteger(dozens) || dozens < 1 || dozens > config.maxDozens) {
            errors.dozens = `Enter a whole number from 1 to ${config.maxDozens}.`;
        }
        const delivery = checkDeliveryPin(input.pin, config);
        if (!delivery.ok) errors.pin = delivery.message;
        if (Object.keys(errors).length) return { ok: false, errors };
        return { ok: true, value: { name, productId: product.id, productLabel: product.label, dozens, pin: delivery.pin, area: delivery.area } };
    }

    function buildEnquiry(value, config = defaultConfig) {
        return [
            'Mango availability enquiry', `Farm: ${config.farmName}`,
            `Name: ${value.name}`, `Variety: ${value.productLabel}`,
            `Quantity: ${value.dozens} ${value.dozens === 1 ? 'dozen' : 'dozens'}`,
            `Delivery area: ${value.area} (${value.pin})`, '',
            'Please confirm availability, price and delivery arrangements.',
            'This is an enquiry, not a confirmed order.'
        ].join('\n');
    }

    function mount(config) {
        const byId = id => document.getElementById(id);
        const form = byId('enquiry-form');
        const summary = byId('enquiry-summary');
        const summaryText = byId('enquiry-text');
        const status = byId('summary-status');
        const fields = { name: byId('customer-name'), productId: byId('product'), dozens: byId('dozens'), pin: byId('delivery-pin') };
        document.title = `${config.farmName} — Farm-to-Home`;
        byId('farm-name').textContent = config.farmName;
        byId('catalogue').replaceChildren();
        for (const product of config.products) {
            const card = document.createElement('article');
            card.className = 'card';
            const heading = document.createElement('h3');
            heading.textContent = product.label;
            const detail = document.createElement('p');
            detail.textContent = 'Ask about current availability and prices.';
            card.append(heading, detail);
            byId('catalogue').append(card);
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.label;
            fields.productId.append(option);
        }
        byId('delivery-areas').textContent = Object.entries(config.deliveryAreas).map(([pin, area]) => `${area} (${pin})`).join(' · ');
        fields.dozens.maxLength = String(config.maxDozens).length;
        byId('quantity-hint').textContent = `Whole dozens, from 1 to ${config.maxDozens}. Availability must be confirmed.`;

        function hideSummary() { summary.hidden = true; summaryText.value = ''; status.textContent = ''; }
        function clearErrors() {
            for (const [key, field] of Object.entries(fields)) {
                field.removeAttribute('aria-invalid');
                byId(`${key}-error`).textContent = '';
            }
        }
        function readInput() { return Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.value])); }
        function currentSummary() {
            const result = validateEnquiry(readInput(), config);
            return result.ok ? buildEnquiry(result.value, config) : null;
        }
        form.addEventListener('submit', event => {
            event.preventDefault(); hideSummary(); clearErrors();
            const result = validateEnquiry(readInput(), config);
            if (!result.ok) {
                for (const [key, message] of Object.entries(result.errors)) {
                    fields[key].setAttribute('aria-invalid', 'true');
                    byId(`${key}-error`).textContent = message;
                }
                fields[Object.keys(result.errors)[0]].focus();
                return;
            }
            summaryText.value = buildEnquiry(result.value, config);
            summary.hidden = false;
            byId('summary-heading').focus();
        });
        form.addEventListener('input', hideSummary);
        form.addEventListener('change', hideSummary);
        form.addEventListener('reset', () => { hideSummary(); clearErrors(); });
        byId('pin-form').addEventListener('submit', event => {
            event.preventDefault();
            const field = byId('pincode');
            const result = checkDeliveryPin(field.value, config);
            field.setAttribute('aria-invalid', String(!result.ok));
            byId('pin-result').textContent = result.ok
                ? `${result.area} is a listed delivery area. Confirm availability with the grower.` : result.message;
        });
        byId('pincode').addEventListener('input', () => { byId('pin-result').textContent = ''; byId('pincode').removeAttribute('aria-invalid'); });
        byId('copy-enquiry').addEventListener('click', async () => {
            const text = currentSummary();
            if (!text || summary.hidden) return;
            summaryText.value = text;
            try {
                if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
                await navigator.clipboard.writeText(text);
                if (summary.hidden || summaryText.value !== text) return;
                status.textContent = 'Enquiry copied. Nothing has been sent.';
            } catch {
                if (summary.hidden || summaryText.value !== text) return;
                summaryText.focus(); summaryText.select();
                status.textContent = 'Automatic copy is unavailable. Copy the selected text using your device’s copy command.';
            }
        });
        byId('download-enquiry').addEventListener('click', () => {
            const text = currentSummary();
            if (!text || summary.hidden) return;
            const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
            const link = document.createElement('a');
            link.href = url; link.download = 'mango-enquiry.txt';
            document.body.append(link); link.click(); link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            status.textContent = 'Enquiry download prepared. Nothing has been sent.';
        });
        // Enable only after all handlers are bound, so scripts cannot fail into native form submission.
        byId('enquiry-fields').disabled = false;
        byId('pin-fields').disabled = false;
        byId('loading-note').hidden = true;
    }
    const api = { checkDeliveryPin, validateEnquiry, buildEnquiry };
    if (isNode) module.exports = api;
    else { root.MangoEnquiry = api; mount(defaultConfig); }
}(typeof globalThis !== 'undefined' ? globalThis : this));
