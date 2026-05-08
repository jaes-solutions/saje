import React, { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useNavigate, useParams } from "react-router-dom";

type Item = {
  item: string;
  desc: string;
  qty: number;
  unit: number;
};

export default function PurchaseOrder() {
  const { poNumber: routePONumber } = useParams<{ poNumber: string }>();
  const navigate = useNavigate();

  const pdfRef = useRef<HTMLDivElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  /* ---------------- PO NUMBER ---------------- */
  const [poNumber] = useState(() => {
    if (routePONumber) return routePONumber;

    const year = new Date().getFullYear().toString().slice(-2);
    const key = `lastPO-${year}`;
    const stored = Number(localStorage.getItem(key));
    const next = Number.isFinite(stored) ? stored + 1 : 1;
    localStorage.setItem(key, String(next));

    return `${year}-PO-${String(next).padStart(6, "0")}`;
  });

  const today = new Date().toLocaleDateString("en-GB");

  /* ---------------- STATE ---------------- */
  const [vendor, setVendor] = useState("");
  const [shipTo, setShipTo] = useState("");
  const [paymentTerm, setPaymentTerm] = useState("");
  const [vendorRef, setVendorRef] = useState("");
  const [comments, setComments] = useState("");

  const [items, setItems] = useState<Item[]>([
    { item: "", desc: "", qty: 1, unit: 0 },
  ]);

  const [vat, setVat] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [other, setOther] = useState(0);

  /* ---------------- CALCULATIONS ---------------- */
  const subtotal = items.reduce((s, i) => s + i.qty * i.unit, 0);
  const total = subtotal + vat + shipping + other;

  /* ---------------- ROWS ---------------- */
  const addRow = () =>
    setItems((p) => [...p, { item: "", desc: "", qty: 1, unit: 0 }]);

  const removeRow = (i: number) =>
    setItems((p) => p.filter((_, idx) => idx !== i));

  /* ---------------- PDF ---------------- */
  const downloadPDF = async () => {
    if (!pageRef.current) return;

    setIsExportingPdf(true);
    await new Promise((r) => setTimeout(r, 50));

    const canvas = await html2canvas(pageRef.current, {
      scale: 3,
      backgroundColor: "#ffffff",
      useCORS: true,
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const margin = 15;
    const usableWidth = 210 - margin * 2;
    const imgHeight = (canvas.height * usableWidth) / canvas.width;

    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      margin,
      margin,
      usableWidth,
      imgHeight,
    );

    pdf.save(`Purchase-Order-${poNumber}.pdf`);
    setIsExportingPdf(false);
  };

  /* ---------------- UI ---------------- */
  return (
    <div style={pageWrapper}>
      <div style={actionBar}>
        <button onClick={() => navigate("/dashboard")}>← Back</button>
        <button onClick={downloadPDF} style={blueBtn}>
          Download PDF
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <div ref={pdfRef} style={pdfCanvas}>
          <div ref={pageRef} style={{ position: "relative" }}>
            <img src="/assets/watermark.png" style={watermarkStyle} />

            {/* HEADER */}
            <div style={header}>
              <div>
                <img src="/assets/jaes-logo.png" style={{ width: 140 }} />
                <p style={{ fontSize: 11 }}>
                  JAES Solutions LTD
                  <br />
                  Devonshire House, 582 Honeypot Lane
                  <br />
                  Stanmore HA7 1JS UK
                  <br />
                  Phone: 01279 217307
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <h1>PURCHASE ORDER</h1>
                <p>
                  Date: {today}
                  <br />
                  PO#: <b>{poNumber}</b>
                  <br />
                  Vendor Ref: {input(vendorRef, setVendorRef)}
                  <br />
                  Payment Term:{" "}
                  {select(paymentTerm, setPaymentTerm, [
                    "30 Day Credit",
                    "60 Day Credit",
                    "Advance",
                  ])}
                </p>
              </div>
            </div>

            <hr style={hr} />

            {/* ADDRESSES */}
            <div style={twoCols}>
              <div>
                <b>Vendor</b>
                {textarea(vendor, setVendor)}
              </div>
              <div>
                <b>Ship To</b>
                {textarea(shipTo, setShipTo)}
              </div>
            </div>

            <hr style={hr} />

            {/* ITEMS */}
            <table style={table}>
              <thead>
                <tr style={thead}>
                  <th style={th}>Item #</th>
                  <th style={th}>Description</th>
                  <th style={th}>Qty</th>
                  <th style={th}>Unit Price</th>
                  <th style={th}>Total</th>
                  {!isExportingPdf && <th style={th}>✕</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((r, i) => {
                  const lineTotal = r.qty * r.unit;
                  return (
                    <tr key={i}>
                      <td style={td}>
                        {textInput(r.item, (v) => update(i, "item", v))}
                      </td>
                      <td style={td}>
                        {textInput(r.desc, (v) => update(i, "desc", v))}
                      </td>
                      <td style={td}>
                        {numInput(r.qty, (v) => update(i, "qty", v))}
                      </td>
                      <td style={td}>
                        {numInput(r.unit, (v) => update(i, "unit", v))}
                      </td>
                      <td style={td}>{lineTotal.toFixed(2)}</td>
                      {!isExportingPdf && (
                        <td style={td}>
                          <button onClick={() => removeRow(i)}>✕</button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!isExportingPdf && (
              <button onClick={addRow} style={addBtn}>
                + Add Item
              </button>
            )}

            <hr style={hr} />

            {/* TOTALS */}
            <div style={totalsBox}>
              <div>Subtotal</div>
              <b>{subtotal.toFixed(2)}</b>
              <div>VAT</div>
              {numInput(vat, setVat)}
              <div>Shipping</div>
              {numInput(shipping, setShipping)}
              <div>Other</div>
              {numInput(other, setOther)}
              <hr />
              <div>
                <b>TOTAL</b>
              </div>
              <b>{total.toFixed(2)}</b>
            </div>

            <hr style={hr} />

            <b>Comments</b>
            {textarea(comments, setComments, true)}
          </div>
        </div>
      </div>
    </div>
  );

  function update(i: number, k: keyof Item, v: string | number) {
    const copy = [...items];
    // @ts-ignore
    copy[i][k] = v;
    setItems(copy);
  }
}

/* ---------------- STYLES ---------------- */
const pageWrapper: React.CSSProperties = {
  padding: 24,
  marginLeft: 256,
  minHeight: "100vh",
  background: "#000",
};

const pdfCanvas: React.CSSProperties = {
  width: "210mm",
  background: "#fff",
  padding: "20mm",
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: 12,
};

const actionBar: React.CSSProperties = {
  display: "flex",
  gap: 12,
  marginBottom: 20,
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
};

const twoCols: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
};

const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginBottom: 12,
};

const thead: React.CSSProperties = {
  background: "#2f477a",
  color: "#fff",
};

const th: React.CSSProperties = {
  border: "1px solid #000",
  padding: 6,
};

const td: React.CSSProperties = {
  border: "1px solid #000",
  padding: 6,
};

const hr: React.CSSProperties = { margin: "18px 0" };

const addBtn: React.CSSProperties = {
  padding: "6px 12px",
  background: "#d0f0ea",
  border: "1px solid #4bb3a7",
};

const blueBtn: React.CSSProperties = {
  padding: "8px 16px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
};

const totalsBox: React.CSSProperties = {
  width: 260,
  marginLeft: "auto",
  display: "grid",
  gridTemplateColumns: "1fr 90px",
  gap: 6,
  background: "#f7fbf9",
  padding: 10,
  border: "1px solid #cde7dc",
};

const watermarkStyle: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  opacity: 0.06,
  width: "70%",
  pointerEvents: "none",
};

/* ---------------- INPUT HELPERS ---------------- */
const input = (v: string, s: (v: string) => void) => (
  <input value={v} onChange={(e) => s(e.target.value)} style={iStyle} />
);
const iStyle: React.CSSProperties = {
  padding: "4px 6px",
  border: "1px solid #333",
  fontSize: 12,
};

const textInput = (v: string, s: (v: string) => void) => (
  <input value={v} onChange={(e) => s(e.target.value)} style={iStyle} />
);

const numInput = (v: number, s: (v: number) => void) => (
  <input
    type="number"
    value={v}
    onChange={(e) => s(Number(e.target.value))}
    style={iStyle}
  />
);

const textarea = (v: string, s: (v: string) => void, full?: boolean) => (
  <textarea
    value={v}
    onChange={(e) => s(e.target.value)}
    rows={4}
    style={{ ...iStyle, width: full ? "100%" : 260, resize: "none" }}
  />
);

const select = (v: string, s: (v: string) => void, opts: string[]) => (
  <select value={v} onChange={(e) => s(e.target.value)} style={iStyle}>
    <option value="">Select</option>
    {opts.map((o) => (
      <option key={o} value={o}>
        {o}
      </option>
    ))}
  </select>
);
