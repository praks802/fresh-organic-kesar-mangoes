# Contributing

This project is a buildless static storefront and local availability-enquiry generator. Small, useful improvements backed by reproducible evidence are welcome.

## Start with a concrete need

Check existing issues and pull requests before starting. Good contributions include:

- A reproducible PIN-checking or enquiry-validation bug.
- Keyboard navigation, screen-reader labels, contrast, or mobile-layout improvements.
- Clearer wording that distinguishes a draft enquiry from a confirmed order.
- Easier farm configuration, localisation, or documentation for adapting the storefront.
- A regression test for a real defect, using fictional names and synthetic data.

For larger changes, describe the problem, expected behaviour, and trade-offs in an issue first. A backend, payments, persistent customer records, or external messaging would change the project's scope and privacy model and needs a design discussion before implementation.

## Work locally

1. Fork and clone the repository, then make a branch for one focused change.
2. Open `index.html` directly, or use the optional local server documented in [README.md](README.md).
3. Keep `config.js` as the farm-specific configuration. Preserve its browser and CommonJS exports.
4. Keep browser logic in `app.js`. Do not add a build step or runtime dependency without discussing why it is needed.
5. Run the tests and perform relevant browser checks before opening a pull request.

## Behaviour to preserve

- Enquiries are plain-text drafts prepared locally. Generating, copying, or downloading a draft must never send it, reserve inventory, or confirm an order.
- Variety choices come from the configured catalogue; PIN availability comes from the configured mapping.
- Quantity is a whole number of dozens within the configured limit; reject invalid input rather than silently changing it.
- Show names and enquiry text as text, never executable HTML.
- Do not add tracking, external fonts or scripts, browser storage, or network submission without an explicit design and privacy discussion.
- Do not invent prices, stock levels, harvest status, customer numbers, certification, testimonials, or environmental-impact measurements.
- Use fictional personal details in tests, screenshots, issues, and examples. Never commit customer enquiries, credentials, or private records.

## Verify a change

Run the dependency-free Node tests from the repository directory:

```sh
node --test tests/*.test.cjs
```

Add a regression test when changing validation or draft generation. Make the test describe meaningful observable behaviour, including invalid input and boundary cases where relevant.

Browser checks should cover the parts your change affects: keyboard-only use, a narrow viewport, invalid and valid fields, generated text, clipboard failure/manual copying, and downloading. List the browser and what you actually checked. Automated logic tests and manual browser observations are different evidence; do not report one as the other.

In your pull request, explain the problem, resulting behaviour, and verification performed. Include a screenshot only when it helps review a visible change. State any known limitation.

## Report a defect

Include the browser and version, steps to reproduce, expected behaviour, actual behaviour, and any relevant configuration using fictional data. Screenshots should omit personal details. Keep security-sensitive details out of public reports; do not upload secrets or real customer data.

## Share real reuse

If you adapt the code for a farm, an optional issue describing which parts you used and what needed changing can help improve it. Link a public deployment or fork only if you are comfortable sharing it. Reuse reports should be voluntary and verifiable. Separate measured adoption from planned features and unverified assumptions.

Contributions are made under the existing [MIT licence](LICENSE). Preserve its copyright and permission notice.
