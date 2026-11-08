// Build UPI payment URI
// Format: upi://pay?pa=<upiId>&pn=<name>&am=<amount>&cu=INR&tn=<note>
export function buildUpiUri(params: {
  upiId: string;
  payeeName: string;
  amountPaise: number;
  transactionNote?: string;
}): string {
  const amount = (params.amountPaise / 100).toFixed(2);
  const urlParams = new URLSearchParams({
    pa: params.upiId,
    pn: params.payeeName,
    am: amount,
    cu: 'INR',
    tn: params.transactionNote || 'Bill Payment',
  });
  return `upi://pay?${urlParams.toString()}`;
}

export function isValidUpiId(upiId: string): boolean {
  return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiId.trim());
}
