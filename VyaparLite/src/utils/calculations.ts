import { type BillItem, type TaxCategory, TAX_RATES } from '../db/database';
import { multiplyPaise, applyBpsTax, applyPercentDiscount, clamp } from './money';

export interface CartLine {
  productId: number;
  productName: string;
  productSku?: string;
  unit: string;
  unitPricePaise: number;
  taxCategory: TaxCategory;
  quantity: number;
  lineDiscountPaise: number;
}

export interface BillTotals {
  subtotalPaise: number;
  lineDiscountTotalPaise: number;
  billDiscountPaise: number;
  taxablePaise: number;
  taxPaise: number;
  grandTotalPaise: number;
  items: BillItem[];
}

export function calculateBill(
  lines: CartLine[],
  billDiscountType: 'AMOUNT' | 'PERCENT',
  billDiscountValue: number,
): BillTotals {
  let subtotalPaise = 0;
  let lineDiscountTotalPaise = 0;
  let lineDiscountedTotalPaise = 0;

  const items: BillItem[] = lines.map((line) => {
    const lineSubtotalPaise = multiplyPaise(line.unitPricePaise, line.quantity);
    const lineDiscount = clamp(line.lineDiscountPaise, 0, lineSubtotalPaise);
    const lineDiscountedPaise = lineSubtotalPaise - lineDiscount;
    subtotalPaise += lineSubtotalPaise;
    lineDiscountTotalPaise += lineDiscount;
    lineDiscountedTotalPaise += lineDiscountedPaise;

    return {
      productId: line.productId,
      productName: line.productName,
      productSku: line.productSku,
      unit: line.unit,
      unitPricePaise: line.unitPricePaise,
      quantity: line.quantity,
      quantityDisplay: line.quantity.toString(),
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
