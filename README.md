# Fresh Organic Kesar Mangoes

A small, reusable static storefront for a mango farm. It shows a catalogue, checks a delivery PIN against a configured service area, and lets a visitor prepare a plain-text availability enquiry.

**An enquiry is a local draft. Nothing is sent, no stock is reserved, and no order is confirmed.**

A preview of the enquiry workflow using synthetic customer details appears below.

The example is based on JADHAVS MANGOES: a family farm in Panvel with a distribution point in CBD Belapur, Navi Mumbai. Pratik Jadhav (@praks802) maintains the project. The software can be adapted for another farm; it does not verify farming practices or organic certification.

## Run it

Open `index.html` in a modern browser. Keep `config.js` and `app.js` beside it. There is no build step, package installation, account, or server requirement.

If you prefer to serve the files locally, from this directory run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Then visit <http://127.0.0.1:8000>. Stop the server with Ctrl+C. This optional command only serves the project files; it does not add enquiry processing.

## What works

- Catalogue cards for Kesar, Alphonso, and Payari mangoes.
- A PIN-code checker using an explicit list of service areas.
- An enquiry form with a name, catalogue variety, whole-dozen quantity, and delivery PIN. Quantity is limited to 1–50 dozen in the example configuration.
- A plain-text draft that can be copied or downloaded for the visitor to send separately. If browser clipboard access is unavailable, select the draft and copy it manually.
- A static ripening guide. This is guidance, not a tracker of an actual batch.

The supplied service areas are:

| PIN | Area |
| --- | --- |
| 400614 | CBD Belapur |
| 410206 | Panvel |
| 400706 | Nerul |
| 410210 | Kharghar |

A supported PIN means it appears in the configuration. It does not establish current delivery capacity or availability.

## Prepare an enquiry

1. Check your delivery PIN.
2. Fill in your name, choose a variety, enter a whole number of dozens, and enter a supported PIN in the enquiry form.
3. Generate the draft and review its contents.
4. Copy or download the text. Share it with the farm yourself through a contact method you trust.

Availability, prices, delivery arrangements, and any eventual purchase must be agreed separately. There is no price or inventory data in this application.

## Adapt it for another farm

Edit `config.js`, which exposes `window.FARM_CONFIG` in the browser and `module.exports` in CommonJS tests:

| Key | Purpose | Example |
| --- | --- | --- |
| `farmName` | Business name shown in the page and draft | `"Panvel Organic Mangoes"` |
| `products` | Catalogue objects with unique `id` and display `label` | `{id: "kesar", label: "Organic Kesar"}` |
| `deliveryAreas` | Six-digit PIN strings mapped to area names | `"400614": "CBD Belapur"` |
| `maxDozens` | Maximum whole-dozen quantity per enquiry | `50` |

Update these values together, then reload the page and run the tests. Keep product identifiers unique and stable. The catalogue options and enquiry validation use the same configuration.

Update the visible farm context and ripening guidance in `index.html` if it differs from your business. The default catalogue labels and service areas describe the example farm; do not publish them as your own verified offering.

## Scope and privacy

This is an early static enquiry prototype. There is no backend, payment collection, confirmed checkout, order database, pricing, inventory, delivery-route planning, harvest-batch management, or live ripening tracking.

The application keeps form values and generated drafts in browser memory. Its code does not send enquiries, make network requests, use analytics, or save data to cookies or browser storage. Copying places the text on your device's clipboard; downloading creates a local text file. Those copies remain under your control. A web host or browser may independently keep access logs, browsing history, or form autofill data.

Client-side validation makes the draft easier to use; it does not replace server validation or secure processing if someone adds a backend later. No security audit or organic certification is claimed.

## Checks

With Node.js installed, run the dependency-free automated tests from the repository directory:

```sh
node --test tests/*.test.cjs
```

These tests cover the application logic using synthetic inputs. They do not establish that native clipboard permissions, downloads, layout, or accessibility work in every browser.

For a manual browser check, open the page and try a supported and unsupported PIN, valid and invalid quantities, a generated draft, copy and download, and a narrow viewport. Confirm that the form explains nothing is sent. Record the browser and results separately from the automated test output.

See [verification notes](docs/verification.md) for checks performed on this change and their limits.

## Contributing and reuse

See [CONTRIBUTING.md](CONTRIBUTING.md) for useful changes and verification guidance. Reports from real farms adapting the code, accessibility feedback, and reproducible defects are welcome.

Downloads, downstream dependents, external adoption, and other ecosystem-impact metrics have not been established. Forkability is a feature of the licence, not evidence that others depend on this project. Publish adoption figures only when they can be supported by real evidence.

## Maintainer and licence

- Maintainer: [Pratik Jadhav (@praks802)](https://github.com/praks802).
- Example business: JADHAVS MANGOES, Panvel farm / CBD Belapur distribution, Navi Mumbai, Maharashtra.
- [MIT licence](LICENSE), copyright © 2026 Pratik Jadhav (praks802). Retain the licence and copyright notice when redistributing the software.

## Preview

<img width="1348" height="2613" alt="clipboard" src="https://github.com/user-attachments/assets/127aac26-88ab-40c1-ae01-f5962cd61e15" />
