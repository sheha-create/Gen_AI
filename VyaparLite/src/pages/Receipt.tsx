import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, type Bill } from '../db/database';
import { formatRupees } from '../utils/money';
import { buildUpiUri, isValidUpiId } from '../utils/upi';
import QRCode from 'qrcode';
import { SerratedEdge } from '../components/SerratedEdge';
import {
  ArrowLeft,
  Share2,
  Download,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Copy,
} from 'lucide-react';

export default function Receipt() {
  const { billId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [bill, setBill] = useState<Bill | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [receiptDataUrl, setReceiptDataUrl] = useState<string>('');
  const [paymentNote, setPaymentNote] = useState<'Not noted' | 'I checked my bank app'>('Not noted');
  const [showVoidSheet, setShowVoidSheet] = useState(false);
  const [voidReason, setVoidReason] = useState('Customer cancelled');
  const [customVoidReason, setCustomVoidReason] = useState('');
  const [sharing, setSharing] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    if (!billId) return;
    db.bills.get(parseInt(billId)).then((b) => {
      if (b) {
        setBill(b);
        setPaymentNote(b.paymentNote || 'Not noted');
      }
    });
  }, [billId]);

  const isDemoUpi = bill?.shopSnapshot.upiId === 'demo-shop@upi' || bill?.shopSnapshot.upiId === 'demo@upi';
  const hasValidUpi = bill?.shopSnapshot.upiId && isValidUpiId(bill.shopSnapshot.upiId);

  // Generate UPI QR code locally
  useEffect(() => {
    if (!bill || bill.grandTotalPaise <= 0 || !hasValidUpi) return;

    const uri = buildUpiUri({
      upiId: bill.shopSnapshot.upiId,
      payeeName: bill.shopSnapshot.shopName || 'Sri Murugan Stores',
      amountPaise: bill.grandTotalPaise,
      transactionNote: `Bill ${bill.billNumber}`,
    });

    QRCode.toDataURL(uri, {
      width: 280,
      margin: 2,
      color: { dark: '#0F1A4A', light: '#FFFFFF' },
    })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [bill, hasValidUpi]);

  // Render high-res receipt to Canvas (3x width: 1152px)
  useEffect(() => {
    if (!bill) return;
    renderReceiptToCanvas();
  }, [bill, qrDataUrl, paymentNote]);

  const renderReceiptToCanvas = async () => {
    if (!canvasRef.current || !bill) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 384 * 3; // 1152 px wide export
    const scale = 3;
    const lineH = 20 * scale;

    const itemsCount = bill.items.length;
    const estHeight = (180 + itemsCount * 36 + 260 + (qrDataUrl && bill.status !== 'VOID' ? 260 : 60)) * scale;
    canvas.width = W;
    canvas.height = estHeight;

    // Background: pure paper white
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, W, estHeight);

    // Ink text color
    ctx.fillStyle = '#0F1A4A';
    ctx.textAlign = 'center';

    let y = 30 * scale;
    ctx.font = `bold ${16 * scale}px "IBM Plex Mono", monospace`;
    ctx.fillText((bill.shopSnapshot.shopName || 'SRI MURUGAN STORES').toUpperCase(), W / 2, y);

    y += 18 * scale;
    ctx.font = `${11 * scale}px "IBM Plex Mono", monospace`;
    ctx.fillStyle = '#3A4470';
    if (bill.shopSnapshot.address) {
      ctx.fillText(bill.shopSnapshot.address, W / 2, y);
      y += 14 * scale;
    }
    if (bill.shopSnapshot.phone) {
      ctx.fillText(`Ph: ${bill.shopSnapshot.phone}`, W / 2, y);
      y += 16 * scale;
    }

    // Dashed divider
    y += 8 * scale;
    ctx.strokeStyle = '#9AA3C0';
    ctx.setLineDash([4 * scale, 4 * scale]);
    ctx.beginPath();
    ctx.moveTo(16 * scale, y);
    ctx.lineTo(W - 16 * scale, y);
    ctx.stroke();
    ctx.setLineDash([]);
    y += 18 * scale;

    // Bill Number and Date
    ctx.fillStyle = '#0F1A4A';
    ctx.textAlign = 'left';
    ctx.font = `bold ${12 * scale}px "IBM Plex Mono", monospace`;
    ctx.fillText(`BILL #${bill.billNumber}`, 16 * scale, y);
    ctx.textAlign = 'right';
    ctx.font = `${11 * scale}px "IBM Plex Mono", monospace`;
    ctx.fillText(new Date(bill.timestamp).toLocaleString('en-IN'), W - 16 * scale, y);

    y += 18 * scale;
    ctx.setLineDash([4 * scale, 4 * scale]);
    ctx.beginPath();
    ctx.moveTo(16 * scale, y);
    ctx.lineTo(W - 16 * scale, y);
    ctx.stroke();
    ctx.setLineDash([]);
    y += 20 * scale;

    // Items
    bill.items.forEach((item) => {
      ctx.fillStyle = '#0F1A4A';
      ctx.textAlign = 'left';
      ctx.font = `bold ${12 * scale}px "IBM Plex Mono", monospace`;
      ctx.fillText(item.productName, 16 * scale, y);

      ctx.textAlign = 'right';
      ctx.font = `${12 * scale}px "IBM Plex Mono", monospace`;
      ctx.fillText(formatRupees(item.lineTotalPaise), W - 16 * scale, y);

      y += 15 * scale;
      ctx.font = `${10 * scale}px "IBM Plex Mono", monospace`;
      ctx.fillStyle = '#5F678F';
      ctx.textAlign = 'left';
      const taxRate = item.taxCategory === 'NONE' ? '0%' : item.taxCategory.replace('GST', '') + '%';
      ctx.fillText(`${item.quantityDisplay} ${item.unit} × ${formatRupees(item.unitPricePaise)}  (Tax ${taxRate})`, 16 * scale, y);

      if (item.lineDiscountPaise > 0) {
        ctx.textAlign = 'right';
        ctx.fillStyle = '#B0245A';
        ctx.fillText(`Disc: -${formatRupees(item.lineDiscountPaise)}`, W - 16 * scale, y);
      }
      y += 18 * scale;
    });

    // Divider
    ctx.strokeStyle = '#9AA3C0';
    ctx.setLineDash([4 * scale, 4 * scale]);
    ctx.beginPath();
    ctx.moveTo(16 * scale, y);
    ctx.lineTo(W - 16 * scale, y);
    ctx.stroke();
    ctx.setLineDash([]);
    y += 18 * scale;

    // Totals Block
    const drawRow = (label: string, value: string, isBold = false) => {
      ctx.fillStyle = '#0F1A4A';
      ctx.font = isBold ? `bold ${13 * scale}px "IBM Plex Mono", monospace` : `${11 * scale}px "IBM Plex Mono", monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(label, 16 * scale, y);
      ctx.textAlign = 'right';
      ctx.fillText(value, W - 16 * scale, y);
      y += 16 * scale;
    };

    drawRow('Subtotal', formatRupees(bill.subtotalPaise));
    if (bill.billDiscountPaise > 0) {
      drawRow('Bill discount', `-${formatRupees(bill.billDiscountPaise)}`);
    }
    drawRow('Taxable', formatRupees(bill.taxablePaise));
    drawRow('Tax', `+${formatRupees(bill.taxPaise)}`);

    // Double rule
    y += 4 * scale;
    ctx.strokeStyle = '#0F1A4A';
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.moveTo(16 * scale, y);
    ctx.lineTo(W - 16 * scale, y);
    ctx.moveTo(16 * scale, y + 4 * scale);
    ctx.lineTo(W - 16 * scale, y + 4 * scale);
    ctx.stroke();
    y += 24 * scale;

    ctx.font = `bold ${18 * scale}px "IBM Plex Mono", monospace`;
    ctx.textAlign = 'left';
    ctx.fillText('TOTAL', 16 * scale, y);
    ctx.textAlign = 'right';
    ctx.fillText(formatRupees(bill.grandTotalPaise), W - 16 * scale, y);
    y += 28 * scale;

    // QR section inside receipt canvas
    if (qrDataUrl && bill.status !== 'VOID') {
      ctx.textAlign = 'center';
      ctx.font = `bold ${11 * scale}px "IBM Plex Mono", monospace`;
      ctx.fillStyle = '#3A4470';
      ctx.fillText(`Scan to pay ${formatRupees(bill.grandTotalPaise)}`, W / 2, y);
      y += 12 * scale;

      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      await new Promise((resolve) => {
        qrImg.onload = resolve;
      });

      const qrRenderSize = 140 * scale;
      ctx.drawImage(qrImg, (W - qrRenderSize) / 2, y, qrRenderSize, qrRenderSize);
      y += qrRenderSize + 15 * scale;

      ctx.font = `${10 * scale}px "IBM Plex Mono", monospace`;
      ctx.fillStyle = '#5F678F';
      ctx.fillText(`Payee: ${bill.shopSnapshot.upiId}`, W / 2, y);
      y += 18 * scale;
    }

    // Owner payment note
    if (paymentNote === 'I checked my bank app') {
      ctx.textAlign = 'center';
      ctx.font = `bold ${10 * scale}px "IBM Plex Mono", monospace`;
      ctx.fillStyle = '#1E7A4F';
      ctx.fillText('Payment noted by shop', W / 2, y);
      y += 16 * scale;
    }

    // VOID Stamp
    if (bill.status === 'VOID') {
      ctx.save();
      ctx.translate(W / 2, y - 80 * scale);
      ctx.rotate((-8 * Math.PI) / 180);
      ctx.strokeStyle = '#B0245A';
      ctx.lineWidth = 3 * scale;
      ctx.strokeRect(-120 * scale, -24 * scale, 240 * scale, 48 * scale);
      ctx.fillStyle = '#B0245A';
      ctx.font = `bold ${18 * scale}px "IBM Plex Mono", monospace`;
      ctx.fillText('VOID', 0, 8 * scale);
      ctx.restore();
      y += 20 * scale;
    }

    // Footer
    y += 10 * scale;
    ctx.textAlign = 'center';
    ctx.font = `${10 * scale}px "IBM Plex Mono", monospace`;
    ctx.fillStyle = '#5F678F';
    ctx.fillText(bill.shopSnapshot.receiptFooter || 'Thank you. Visit again.', W / 2, y);

    setReceiptDataUrl(canvas.toDataURL('image/png'));
  };

  const handleUpdatePaymentNote = async (note: 'Not noted' | 'I checked my bank app') => {
    setPaymentNote(note);
    if (bill?.id) {
      await db.bills.update(bill.id, { paymentNote: note });
    }
  };

  const handleShare = async () => {
    if (!receiptDataUrl || !bill) return;
    setSharing(true);
    try {
      const response = await fetch(receiptDataUrl);
      const blob = await response.blob();
      const dateStr = new Date(bill.timestamp).toISOString().split('T')[0];
      const filename = `bill-${bill.billNumber}-${dateStr}.png`;
      const file = new File([blob], filename, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Bill ${bill.billNumber}`,
          text: `Bill from ${bill.shopSnapshot.shopName}: ${formatRupees(bill.grandTotalPaise)}`,
        });
      } else {
        downloadReceipt();
      }
    } catch {
      downloadReceipt();
    } finally {
      setSharing(false);
    }
  };

  const downloadReceipt = () => {
    if (!receiptDataUrl || !bill) return;
    const dateStr = new Date(bill.timestamp).toISOString().split('T')[0];
    const a = document.createElement('a');
    a.href = receiptDataUrl;
    a.download = `bill-${bill.billNumber}-${dateStr}.png`;
    a.click();
  };

  const handleConfirmVoid = async () => {
    if (!bill?.id) return;
    const reason = voidReason === 'Other' ? (customVoidReason.trim() || 'Other') : voidReason;
    await db.bills.update(bill.id, { status: 'VOID', voidReason: reason });
    setBill({ ...bill, status: 'VOID', voidReason: reason });
    setShowVoidSheet(false);
  };

  if (!bill) {
    return (
      <div className="p-8 text-center text-xs text-[var(--ink-3)] font-ui">
        Loading bill...
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4 pb-12 font-ui select-none">
      {/* 5.6 Header: ← Bill 0129 saved */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs font-bold text-[var(--ink-2)] hover:text-[var(--ink)]"
        >
          <ArrowLeft size={16} />
          <span>Bill {bill.billNumber} saved</span>
        </button>

        {bill.status === 'VOID' && (
          <span className="stamp-void text-xs">VOID</span>
        )}
      </div>

      {/* 5.6 Amount to collect */}
      <div className="text-center py-1">
        <p className="text-xs font-medium text-[var(--ink-2)]">Amount to collect</p>
        <p className="text-[44px] sm:text-[56px] font-black text-[var(--ink)] leading-none font-ui mt-1">
          {formatRupees(bill.grandTotalPaise)}
        </p>
      </div>

      {/* 5.6 QR Card (min 240px) */}
      {bill.status !== 'VOID' && (
        <div className="bg-[#FFFFFF] p-5 rounded-[4px] border border-[var(--line)] shadow-xs flex flex-col items-center relative overflow-hidden">
          {/* Demo Ribbon if demo UPI */}
          {isDemoUpi && (
            <div className="w-full bg-[var(--tally)] text-[#0F1A4A] py-1 text-center font-bold text-[11px] mb-3 rounded-sm uppercase tracking-wider">
              Demo UPI ID. Not a real shop
            </div>
          )}

          {hasValidUpi && qrDataUrl ? (
            <div className="p-2 bg-white rounded">
              <img
                src={qrDataUrl}
                alt="UPI Payment QR Code"
                className="w-60 h-60 min-w-[240px] block"
              />
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[var(--ink-2)] space-y-2">
              <AlertTriangle className="mx-auto text-[var(--stamp)]" size={32} />
              <p className="font-bold">Add your UPI ID to show a QR</p>
              <button
                onClick={() => navigate('/shop/settings')}
                className="text-[var(--ballpoint)] font-semibold underline text-xs"
              >
                Open UPI settings
              </button>
            </div>
          )}

          <div className="text-center mt-3 font-tape">
            <p className="text-xs text-[var(--ink-2)]">Pay to</p>
            <p className="font-bold text-sm text-[var(--ink)]">{bill.shopSnapshot.shopName}</p>
            <p className="text-xs text-[var(--ink-3)] font-mono">{bill.shopSnapshot.upiId}</p>
          </div>

          <p className="text-[11px] font-ui text-[var(--ink-2)] text-center mt-3 pt-3 border-t border-[var(--line)] leading-relaxed">
            Ask the customer to check their UPI app shows this name and{' '}
            <strong className="text-[var(--ink)]">{formatRupees(bill.grandTotalPaise)}</strong> before paying.
          </p>
        </div>
      )}

      {/* 5.6 Payment Note (Owner's own note) */}
      <div className="bg-[var(--well)] p-3.5 rounded-[10px] space-y-2 text-xs">
        <p className="font-bold text-[var(--ink-2)]">Payment note (yours to set)</p>
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="paymentNote"
              checked={paymentNote === 'Not noted'}
              onChange={() => handleUpdatePaymentNote('Not noted')}
              className="accent-[var(--ballpoint)]"
            />
            <span>Not noted</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="paymentNote"
              checked={paymentNote === 'I checked my bank app'}
              onChange={() => handleUpdatePaymentNote('I checked my bank app')}
              className="accent-[var(--ballpoint)]"
            />
            <span>I checked my bank app</span>
          </label>
        </div>
      </div>

      {/* Hidden Canvas used for high-res PNG export */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Receipt Preview */}
      <div className="bg-[#FFFFFF] rounded-t-[10px] border border-[var(--line)] shadow-xs overflow-hidden">
        <div className="p-3 border-b border-[var(--line)] flex justify-between items-center text-xs text-[var(--ink-2)]">
          <span className="font-bold">Receipt Preview</span>
          <span className="font-mono text-[11px]">3× High-Res</span>
        </div>
        {receiptDataUrl ? (
          <img src={receiptDataUrl} alt="Bill Receipt" className="w-full object-contain" />
        ) : (
          <div className="p-8 text-center text-xs text-[var(--ink-3)]">Rendering receipt...</div>
        )}
        <SerratedEdge color="#FFFFFF" direction="down" />
      </div>

      {/* Share / Download Actions (5.6 & 5.8) */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleShare}
          disabled={!receiptDataUrl || sharing}
          className="h-14 bg-[var(--ballpoint)] hover:opacity-95 active:scale-[0.99] text-white font-bold rounded-[10px] flex items-center justify-center gap-2 text-sm disabled:opacity-50 transition"
        >
          <Share2 size={18} />
          <span>{sharing ? 'Opening…' : 'Share receipt'}</span>
        </button>

        <button
          onClick={downloadReceipt}
          disabled={!receiptDataUrl}
          className="h-14 bg-[var(--well)] hover:bg-[#C9D0CC] active:scale-[0.99] text-[var(--ink)] font-bold rounded-[10px] border border-[var(--line)] flex items-center justify-center gap-2 text-sm transition"
        >
          <Download size={18} />
          <span>Download</span>
        </button>
      </div>

      {/* Done Button (Returns to Home) */}
      <button
        onClick={() => navigate('/')}
        className="w-full h-14 bg-[#FFFFFF] hover:bg-[var(--well)] active:scale-[0.99] text-[var(--ink)] font-bold rounded-[10px] border border-[var(--line)] text-sm transition"
      >
        Done
      </button>

      {/* Void Action */}
      {bill.status === 'SAVED' && (
        <div className="pt-2">
          <button
            onClick={() => setShowVoidSheet(true)}
            className="w-full py-3 text-xs font-semibold text-[var(--stamp)] hover:underline text-center"
          >
            Void bill
          </button>
        </div>
      )}

      {/* Void Reason Sheet (5.7) */}
      {showVoidSheet && (
        <div className="fixed inset-0 bg-black/40 z-50 flex flex-col justify-end">
          <div className="bg-[var(--desk)] rounded-t-[20px] p-5 space-y-4 max-h-[85vh] overflow-y-auto border-t border-[var(--line)] shadow-2xl">
            <h3 className="font-bold text-base text-[var(--stamp)]">Void bill #{bill.billNumber}</h3>
            <p className="text-xs text-[var(--ink-2)] leading-relaxed">
              Voiding stamps VOID on the receipt and removes it from daily sales totals while retaining the historical audit record forever.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--ink)] block">Required Reason</label>
              <div className="flex flex-wrap gap-2">
                {['Wrong items', 'Customer cancelled', 'Duplicate bill', 'Other'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setVoidReason(r)}
                    className={`h-10 px-3.5 rounded-full text-xs font-semibold transition ${
                      voidReason === r
                        ? 'bg-[var(--ballpoint-wash)] text-[var(--ballpoint)] border-2 border-[var(--ballpoint)]'
                        : 'bg-[var(--well)] text-[var(--ink)]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {voidReason === 'Other' && (
                <input
                  type="text"
                  placeholder="Type cancellation reason..."
                  value={customVoidReason}
                  onChange={(e) => setCustomVoidReason(e.target.value)}
                  className="w-full h-11 px-3 bg-[var(--well)] border border-[var(--line)] rounded-[10px] text-xs font-ui mt-2 focus:outline-none focus:border-[var(--ballpoint)]"
                />
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowVoidSheet(false)}
                className="flex-1 h-12 bg-[var(--well)] text-[var(--ink-2)] font-bold text-xs rounded-[10px]"
              >
                Go back
              </button>
              <button
                onClick={handleConfirmVoid}
                className="flex-1 h-12 bg-[var(--stamp)] text-white font-bold text-xs rounded-[10px]"
              >
                Confirm void
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
