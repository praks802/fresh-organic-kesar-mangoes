# Verification notes

Checked on 17 November 2026 using synthetic details only.

## Automated logic checks

`node --test tests/*.test.cjs`: 18 passed, none failed or skipped.

Coverage includes configured delivery areas, malformed and unsupported PINs, inherited-property rejection, blank and Unicode names, control characters, unknown products, quantity limits and invalid number syntax, plain-text enquiry output, alternate farm settings, and input preservation. JavaScript syntax checks and `git diff --check` also passed.

## Browser observations

The page was inspected in the development environment's desktop Chrome browser, at a viewport width of 1363 CSS pixels. These were UI interactions, separate from the Node tests:

- Catalogue and delivery areas render from the shared configuration.
- An unsupported PIN shows an explanation; a supported PIN identifies the configured area without promising delivery.
- Submitting the empty enquiry shows field errors and focuses the first invalid field.
- Synthetic customer details create the expected enquiry. Pressing Enter in the name field also prepares it.
- Copy places the exact enquiry text on the clipboard and explains that nothing was sent.
- Download creates a text file; its contents were inspected and matched the enquiry.
- Changing the quantity to 51 hides the old draft and shows the configured maximum of 50 on submission.
- Clear form removes customer details and hides the generated draft.
- No horizontal overflow was observed at the inspected desktop width.

The [preview in the README](../README.md#preview) shows synthetic example details, not an actual customer or order.

## Limits

No production deployment, mobile viewport inspection, screen-reader audit, cross-browser testing, native clipboard-denial test, or direct `file://` browser walkthrough was performed. The browser inspection used a local development preview. Manual copying remains the documented fallback if clipboard access is denied. Source inspection confirms the page has no enquiry transport or persistence implementation; no external order-processing service was tested.
