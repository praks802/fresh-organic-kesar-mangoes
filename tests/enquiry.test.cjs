"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const config = require("../config.js");
const { checkDeliveryPin, validateEnquiry, buildEnquiry } = require("../app.js");

function example(overrides = {}) {
  return {
    name: "Synthetic Grower",
    productId: config.products[0].id,
    dozens: "2",
    pin: "400614",
    ...overrides,
  };
}

test("each configured delivery area is recognised", () => {
  for (const [pin, area] of Object.entries(config.deliveryAreas)) {
    assert.deepEqual(checkDeliveryPin(pin), { ok: true, pin, area });
  }
});

test("delivery PIN input tolerates surrounding spaces", () => {
  assert.deepEqual(checkDeliveryPin(" 400614 "), {
    ok: true,
    pin: "400614",
    area: config.deliveryAreas["400614"],
  });
});

test("malformed PINs and unsupported six-digit PINs explain different problems", () => {
  const malformed = checkDeliveryPin("40061");
  const unsupported = checkDeliveryPin("999999");
  assert.equal(malformed.ok, false);
  assert.equal(unsupported.ok, false);
  assert.equal(typeof malformed.message, "string");
  assert.equal(typeof unsupported.message, "string");
  assert.notEqual(malformed.message, unsupported.message);
});

test("PIN lookup rejects non-string and malformed input without coercion", () => {
  const values = [undefined, null, 400614, true, {}, [], "", "4006140", "40 0614", "40061a", "__proto__"];
  for (const value of values) {
    assert.equal(checkDeliveryPin(value).ok, false, String(value));
  }
});

test("a complete enquiry becomes a normalised value", () => {
  const result = validateEnquiry(example({ name: "  Synthetic Grower  ", pin: " 400614 " }));
  assert.deepEqual(result, {
    ok: true,
    value: {
      name: "Synthetic Grower",
      productId: config.products[0].id,
      productLabel: config.products[0].label,
      dozens: 2,
      pin: "400614",
      area: config.deliveryAreas["400614"],
    },
  });
});

test("an empty enquiry reports all fields so users can fix them together", () => {
  const result = validateEnquiry({ name: "", productId: "", dozens: "", pin: "" });
  assert.equal(result.ok, false);
  assert.deepEqual(Object.keys(result.errors).sort(), ["dozens", "name", "pin", "productId"]);
});

test("names may contain Unicode and normal punctuation", () => {
  for (const name of ["प्रतिक जाधव", "李", "O’Connor", "A-B Grower"]) {
    const result = validateEnquiry(example({ name }));
    assert.equal(result.ok, true, name);
    assert.equal(result.value.name, name);
  }
});

test("names cannot inject additional lines into the enquiry", () => {
  for (const name of ["Synthetic\nAccepted", "Synthetic\rAccepted", "Synthetic\tGrower", "Synthetic\u0000Grower"]) {
    const result = validateEnquiry(example({ name }));
    assert.equal(result.ok, false);
    assert.ok(result.errors.name);
  }
});

test("blank and overly long names are rejected", () => {
  for (const name of ["   ", "S".repeat(81)]) {
    const result = validateEnquiry(example({ name }));
    assert.equal(result.ok, false);
    assert.ok(result.errors.name);
  }
  assert.equal(validateEnquiry(example({ name: "S".repeat(80) })).ok, true);
});

test("only configured product IDs can be selected", () => {
  for (const productId of ["not-a-product", "__proto__", "", undefined, { id: config.products[0].id }]) {
    const result = validateEnquiry(example({ productId }));
    assert.equal(result.ok, false);
    assert.ok(result.errors.productId);
  }
  for (const product of config.products) {
    assert.equal(validateEnquiry(example({ productId: product.id })).ok, true);
  }
});

test("quantity boundaries permit one through the configured maximum dozens", () => {
  assert.equal(validateEnquiry(example({ dozens: "1" })).ok, true);
  assert.equal(validateEnquiry(example({ dozens: String(config.maxDozens) })).ok, true);
  const result = validateEnquiry(example({ dozens: String(config.maxDozens + 1) }));
  assert.equal(result.ok, false);
  assert.ok(result.errors.dozens);
});

test("quantity rejects fractions, zero, negatives and alternate numeric syntax", () => {
  for (const dozens of ["", "0", "-1", "1.5", "1e1", "0x10", "+2", "NaN", "Infinity", "2 dozen", "99999999999999999999999999"]) {
    const result = validateEnquiry(example({ dozens }));
    assert.equal(result.ok, false, dozens);
    assert.ok(result.errors.dozens, dozens);
  }
});

test("unsupported delivery area prevents creating an enquiry", () => {
  const result = validateEnquiry(example({ pin: "999999" }));
  assert.equal(result.ok, false);
  assert.ok(result.errors.pin);
});

test("enquiry text contains the actual validated details and no confirmed-order claim", () => {
  const result = validateEnquiry(example());
  assert.equal(result.ok, true);
  const text = buildEnquiry(result.value);
  for (const part of [config.farmName, result.value.name, result.value.productLabel, String(result.value.dozens), result.value.pin, result.value.area]) {
    assert.ok(text.includes(part), part);
  }
  assert.match(text, /not a confirmed order/i);
  assert.doesNotMatch(text, /₹|\bINR\s*\d|\bRs\.?\s*\d/);
});

test("HTML-like names remain inert text rather than being interpreted", () => {
  const name = '<img src=x onerror="globalThis.__enquiryInjected=true">';
  delete globalThis.__enquiryInjected;
  const result = validateEnquiry(example({ name }));
  assert.equal(result.ok, true);
  assert.ok(buildEnquiry(result.value).includes(name));
  assert.equal(globalThis.__enquiryInjected, undefined);
});

test("another grower can configure products and service areas without changing logic", () => {
  const otherFarm = Object.freeze({
    farmName: "Synthetic Orchard",
    products: Object.freeze([Object.freeze({ id: "seasonal", label: "Seasonal fruit" })]),
    deliveryAreas: Object.freeze({ "411001": "Synthetic Area" }),
    maxDozens: 3,
  });
  const input = Object.freeze({ name: "Test Customer", productId: "seasonal", dozens: "3", pin: "411001" });
  const result = validateEnquiry(input, otherFarm);
  assert.equal(result.ok, true);
  assert.equal(result.value.productLabel, "Seasonal fruit");
  assert.equal(result.value.area, "Synthetic Area");
  assert.match(buildEnquiry(result.value, otherFarm), /Synthetic Orchard/);
  assert.equal(validateEnquiry({ ...input, dozens: "4" }, otherFarm).ok, false);
  assert.equal(checkDeliveryPin("400614", otherFarm).ok, false);
});

test("delivery lookup ignores inherited object properties", () => {
  const inheritedAreas = Object.create({ "411001": "Inherited area" });
  inheritedAreas["400614"] = "Synthetic explicit area";
  const localConfig = { ...config, deliveryAreas: inheritedAreas };
  assert.equal(checkDeliveryPin("411001", localConfig).ok, false);
  assert.equal(checkDeliveryPin("400614", localConfig).ok, true);
});

test("normalisation does not mutate supplied form values", () => {
  const input = Object.freeze(example({ name: "  Synthetic Grower  ", pin: " 400614 " }));
  const before = JSON.stringify(input);
  const result = validateEnquiry(input);
  assert.equal(result.ok, true);
  assert.equal(JSON.stringify(input), before);
});
