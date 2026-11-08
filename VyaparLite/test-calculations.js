// Node ESM calculation tester
const TAX_RATES = {
  NONE: 0,
  GST5: 500,
  GST12: 1200,
  GST18: 1800,
  GST28: 2800,
};

function multiplyPaise(paise, quantity) {
  return Math.round(paise * quantity);
}

function applyBpsTax(basePaise, taxRateBps) {
  return Math.round((basePaise * taxRateBps) / 10000);
}

function applyPercentDiscount(basePaise, percent) {
  return Math.round((basePaise * percent) / 100);
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function calculateBill(lines, billDiscountType, billDiscountValue) {
  let subtotalPaise = 0;
  let lineDiscountTotalPaise = 0;
  let lineDiscountedTotalPaise = 0;

  const items = lines.map((line) => {
    const lineSubtotalPaise = multiplyPaise(line.unitPricePaise, line.quantity);
    const lineDiscount = clamp(line.lineDiscountPaise, 0, lineSubtotalPaise);
    const lineDiscountedPaise = lineSubtotalPaise - lineDiscount;
    subtotalPaise += lineSubtotalPaise;
    lineDiscountTotalPaise += lineDiscount;
    lineDiscountedTotalPaise += lineDiscountedPaise;

    return {
      productId: line.productId,
      productName: line.productName,
      unit: line.unit,
      unitPricePaise: line.unitPricePaise,
      quantity: line.quantity,
      taxCategory: line.taxCategory,
      lineTaxRateBps: TAX_RATES[line.taxCategory],
      lineDiscountPaise: lineDiscount,
      lineSubtotalPaise,
      lineDiscountedPaise,
      lineTaxPaise: 0,
      lineTotalPaise: 0,
    };
  });

  let billDiscountPaise = 0;
  if (billDiscountType === 'AMOUNT') {
    billDiscountPaise = clamp(billDiscountValue, 0, lineDiscountedTotalPaise);
  } else {
    billDiscountPaise = applyPercentDiscount(lineDiscountedTotalPaise, clamp(billDiscountValue, 0, 100));
  }

  let taxablePaise = 0;
  let taxPaise = 0;

  items.forEach((item) => {
    let allocatedBillDiscount = 0;
    if (lineDiscountedTotalPaise > 0) {
      allocatedBillDiscount = Math.round((item.lineDiscountedPaise / lineDiscountedTotalPaise) * billDiscountPaise);
    }
    const lineAfterBillDiscount = item.lineDiscountedPaise - allocatedBillDiscount;
    const lineTax = applyBpsTax(lineAfterBillDiscount, item.lineTaxRateBps);
    item.lineTaxPaise = lineTax;
    item.lineTotalPaise = lineAfterBillDiscount + lineTax;
    taxablePaise += lineAfterBillDiscount;
    taxPaise += lineTax;
  });

  const grandTotalPaise = taxablePaise + taxPaise;

  return {
    subtotalPaise,
    lineDiscountTotalPaise,
    billDiscountPaise,
    taxablePaise,
    taxPaise,
    grandTotalPaise,
    items,
  };
}

const testCases = [
  {
    name: 'Fixture 1: Single item, zero discount, tax-exempt (2 x Rice @ Rs 50)',
    lines: [
      { productId: 1, productName: 'Rice', unit: 'kg', unitPricePaise: 5000, taxCategory: 'NONE', quantity: 2, lineDiscountPaise: 0 },
    ],
    billDiscountType: 'PERCENT',
    billDiscountValue: 0,
    expected: {
      subtotalPaise: 10000,
      lineDiscountTotalPaise: 0,
      billDiscountPaise: 0,
      taxablePaise: 10000,
      taxPaise: 0,
      grandTotalPaise: 10000,
    },
  },
  {
    name: 'Fixture 2: Line discount + single item GST 5% (3 x Sugar @ Rs 40, Rs 10 off)',
    lines: [
      { productId: 2, productName: 'Sugar', unit: 'kg', unitPricePaise: 4000, taxCategory: 'GST5', quantity: 3, lineDiscountPaise: 1000 },
    ],
    billDiscountType: 'PERCENT',
    billDiscountValue: 0,
    expected: {
      subtotalPaise: 12000,
      lineDiscountTotalPaise: 1000,
      billDiscountPaise: 0,
      taxablePaise: 11000,
      taxPaise: 550,
      grandTotalPaise: 11550,
    },
  },
  {
    name: 'Fixture 3: Multi-item mixed GST (Oil 5% + Detergent 18%)',
    lines: [
      { productId: 3, productName: 'Cooking Oil', unit: 'litre', unitPricePaise: 15000, taxCategory: 'GST5', quantity: 1, lineDiscountPaise: 0 },
      { productId: 4, productName: 'Detergent', unit: 'packet', unitPricePaise: 8000, taxCategory: 'GST18', quantity: 2, lineDiscountPaise: 0 },
    ],
    billDiscountType: 'PERCENT',
    billDiscountValue: 0,
    expected: {
      subtotalPaise: 31000,
      lineDiscountTotalPaise: 0,
      billDiscountPaise: 0,
      taxablePaise: 31000,
      taxPaise: 3630,
      grandTotalPaise: 34630,
    },
  },
  {
    name: 'Fixture 4: Line discount + 10% bill discount with mixed GST (Ghee 12% + Soap 18%)',
    lines: [
      { productId: 5, productName: 'Pure Ghee', unit: 'kg', unitPricePaise: 50000, taxCategory: 'GST12', quantity: 1, lineDiscountPaise: 5000 },
      { productId: 6, productName: 'Bathing Soap', unit: 'pcs', unitPricePaise: 3000, taxCategory: 'GST18', quantity: 2, lineDiscountPaise: 0 },
    ],
    billDiscountType: 'PERCENT',
    billDiscountValue: 10,
    expected: {
      subtotalPaise: 56000,
      lineDiscountTotalPaise: 5000,
      billDiscountPaise: 5100,
      taxablePaise: 45900,
      taxPaise: 5832,
      grandTotalPaise: 51732,
    },
  },
  {
    name: 'Fixture 5: Decimal quantities (1.75 kg & 0.5 kg) + Flat Rs 75 bill discount',
    lines: [
      { productId: 7, productName: 'Almonds', unit: 'kg', unitPricePaise: 80000, taxCategory: 'GST12', quantity: 1.75, lineDiscountPaise: 0 },
      { productId: 8, productName: 'Premium Tea', unit: 'kg', unitPricePaise: 45000, taxCategory: 'GST5', quantity: 0.5, lineDiscountPaise: 0 },
    ],
    billDiscountType: 'AMOUNT',
    billDiscountValue: 7500,
    expected: {
      subtotalPaise: 162500,
      lineDiscountTotalPaise: 0,
      billDiscountPaise: 7500,
      taxablePaise: 155000,
      taxPaise: 17098,
      grandTotalPaise: 172098,
    },
  },
];

console.log('================================================================');
console.log('🧪 VERIFYING 5 HAND-CALCULATED BILLS WITH INTEGER PAISE ENGINE');
console.log('================================================================\n');

let passCount = 0;
testCases.forEach((tc, idx) => {
  const res = calculateBill(tc.lines, tc.billDiscountType, tc.billDiscountValue);
  const exp = tc.expected;

  const ok =
    res.subtotalPaise === exp.subtotalPaise &&
    res.lineDiscountTotalPaise === exp.lineDiscountTotalPaise &&
    res.billDiscountPaise === exp.billDiscountPaise &&
    res.taxablePaise === exp.taxablePaise &&
    res.taxPaise === exp.taxPaise &&
    res.grandTotalPaise === exp.grandTotalPaise;

  if (ok) {
    passCount++;
    console.log(`[PASS] ${tc.name}`);
    console.log(`   Subtotal : ₹${(res.subtotalPaise/100).toFixed(2)} (${res.subtotalPaise}p)`);
    console.log(`   Discounts: -₹${((res.lineDiscountTotalPaise + res.billDiscountPaise)/100).toFixed(2)}`);
    console.log(`   Taxable  : ₹${(res.taxablePaise/100).toFixed(2)} (${res.taxablePaise}p)`);
    console.log(`   GST Tax  : +₹${(res.taxPaise/100).toFixed(2)} (${res.taxPaise}p)`);
    console.log(`   TOTAL    : ₹${(res.grandTotalPaise/100).toFixed(2)} (${res.grandTotalPaise}p)`);
    console.log('----------------------------------------------------------------');
  } else {
    console.error(`[FAIL] ${tc.name}`);
    console.error('Expected:', exp);
    console.error('Received:', res);
  }
});

console.log(`\nRESULTS: ${passCount}/${testCases.length} PASS`);
if (passCount === testCases.length) {
  console.log('SUCCESS: All 5 hand-calculated bills match exactly down to the paise!');
}
