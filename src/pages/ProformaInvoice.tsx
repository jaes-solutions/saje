import React, { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ProformaInvoice() {
  const { proformaNumber: routeNumber } = useParams<{
    proformaNumber: string;
  }>();
  const navigate = useNavigate();

  const pdfRef = useRef<HTMLDivElement | null>(null);
  const page1Ref = useRef<HTMLDivElement | null>(null);

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  /* ---------------- NUMBERING ---------------- */
  const [proformaNumber] = useState(() => {
    if (routeNumber) return routeNumber;

    const year = new Date().getFullYear().toString().slice(-2); // "26"
    const key = `lastProformaNo-${year}`;

    const stored = Number(localStorage.getItem(key));
    const next = Number.isFinite(stored) ? stored + 1 : 1;

    localStorage.setItem(key, String(next));

    return `${year}-PI-${String(next).padStart(6, "0")}`;
  });

  const today = new Date().toLocaleDateString("en-GB");

  /* ---------------- STATE ---------------- */
  const [poNumber, setPoNumber] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [invoiceRef, setInvoiceRef] = useState("");

  const [vendorAddress, setVendorAddress] = useState("");
  const [shipToAddress, setShipToAddress] = useState("");

  const [items, setItems] = useState([{ qty: 1, desc: "", unit: 0 }]);
  const [vatPercent, setVatPercent] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [otherCost, setOtherCost] = useState(0);
  const [comments, setComments] = useState("");

  const currency = "USD";
  const currencySymbol = "$";

  /* ---------------- LOAD EXISTING ---------------- */
  useEffect(() => {
    if (!routeNumber) return;

    const load = async () => {
      const { data } = await supabase
        .from("proforma_invoices")
        .select("*")
        .eq("proforma_number", routeNumber)
        .maybeSingle();

      if (!data) return;

      setPoNumber(data.po_number ?? "");
      setPaymentTerms(data.payment_terms ?? "");
      setInvoiceRef(data.invoice_ref ?? "");
      setVendorAddress(data.vendor_address ?? "");
      setShipToAddress(data.ship_to_address ?? "");
      setVatPercent(Number(data.vat_percent ?? 0));
      setShippingCost(Number(data.shipping_cost ?? 0));
      setOtherCost(Number(data.other_cost ?? 0));
      setComments(data.comments ?? "");

      const parsedItems = Array.isArray(data.items)
        ? data.items
        : JSON.parse(data.items ?? "[]");

      setItems(
        parsedItems.map((i: any) => ({
          qty: Number(i.qty ?? 0),
          desc: i.desc ?? "",
          unit: Number(i.unit ?? 0),
        })),
      );
    };

    load();
  }, [routeNumber]);

  /* ---------------- ITEMS ---------------- */
  const addRow = () => setItems((p) => [...p, { qty: 1, desc: "", unit: 0 }]);
  const removeRow = (i: number) =>
    setItems((p) => p.filter((_, idx) => idx !== i));

  /* ---------------- SAVE ---------------- */
  const saveProforma = async () => {
    const payload = {
      proforma_number: proformaNumber,
      po_number: poNumber,
      payment_terms: paymentTerms,
      invoice_ref: invoiceRef,
      vendor_address: vendorAddress,
      ship_to_address: shipToAddress,
      items: JSON.stringify(items),
      vat_percent: vatPercent,
      shipping_cost: shippingCost,
      other_cost: otherCost,
      comments,
    };

    const { error } = await supabase
      .from("proforma_invoices")
      .upsert(payload, { onConflict: "proforma_number" });

    if (error) {
      console.error(error);
      alert("Failed to save proforma invoice");
      return;
    }

    await downloadPDF();
  };

  /* ---------------- PDF ---------------- */
  const downloadPDF = async () => {
    if (!page1Ref.current) return;

    setIsExportingPdf(true);
    await new Promise((r) => setTimeout(r, 50));

    const canvas = await html2canvas(page1Ref.current, {
      scale: 3,
      backgroundColor: "#ffffff",
      useCORS: true,
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const margin = 15;
    const pageWidth = 210;
    const usableWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * usableWidth) / canvas.width;

    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      margin,
      margin,
      usableWidth,
      imgHeight,
    );

    const fileName = `Proforma-Invoice-${proformaNumber}.pdf`;

    const blob = pdf.output("blob");
    await supabase.storage
      .from("proforma-pdf")
      .upload(fileName, blob, { upsert: true });

    pdf.save(fileName);
    setIsExportingPdf(false);
  };

  /* ---------------- CALCULATIONS ---------------- */
  const subtotal = items.reduce((s, r) => s + r.qty * r.unit, 0);
  const vatAmount = (subtotal * vatPercent) / 100;
  const total = subtotal + vatAmount + shippingCost + otherCost;

  /* ---------------- UI ---------------- */
  return (
    <div
      style={{
        padding: 24,
        marginLeft: 256,
        minHeight: "100vh",
        background: "#000",
      }}
    >
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <button onClick={() => navigate("/documents")}>← Back</button>
        <button onClick={downloadPDF} style={blueBtn}>
          Download PDF
        </button>
        <button onClick={saveProforma} style={greenBtn}>
          Save Proforma
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          ref={pdfRef}
          style={{
            width: "210mm",
            background: "#fff",
            padding: "20mm",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 12,
            lineHeight: 1.35,
          }}
        >
          <div style={{ height: 6, background: "#b9e5ff", marginBottom: 16 }} />

          <div ref={page1Ref} style={{ position: "relative" }}>
            <img src="/assets/watermark.png" style={watermarkStyle} />

            {/* HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <img src="/assets/jaes-logo.png" style={{ width: 140 }} />
                <h1 style={{ margin: "8px 0" }}>PROFORMA INVOICE</h1>
                <p>
                  Proforma No: <b>{proformaNumber}</b>
                  <br />
                  Date: <b>{today}</b>
                  <br />
                  PO#: {input(poNumber, setPoNumber)}
                  <br />
                  Payment: {input(paymentTerms, setPaymentTerms)}
                  <br />
                  INV Ref: {input(invoiceRef, setInvoiceRef)}
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <b>JAES SOLUTIONS LTD</b>
                <div>
                  Devonshire House, 582 Honeypot Lane
                  <br />
                  Stanmore, England, HA7 1JS
                </div>
              </div>
            </div>

            <hr style={hr} />

            {/* ADDRESSES */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <b>Vendor</b>
                {textarea(vendorAddress, setVendorAddress)}
              </div>
              <div>
                <b>Ship To</b>
                {textarea(shipToAddress, setShipToAddress)}
              </div>
            </div>

            <hr style={hr} />

            {/* ITEMS */}
            <table style={table}>
              <thead>
                <tr style={thead}>
                  <th style={th}>Qty</th>
                  <th style={th}>Description</th>
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
                        {numInput(r.qty, (v: number) => update(i, "qty", v))}
                      </td>
                      <td style={td}>
                        {textInput(r.desc, (v: string) => update(i, "desc", v))}
                      </td>
                      <td style={td}>
                        {numInput(r.unit, (v: number) => update(i, "unit", v))}
                      </td>
                      <td style={td}>
                        {currencySymbol}
                        {lineTotal.toFixed(2)}
                      </td>
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
              <b>
                {currencySymbol}
                {subtotal.toFixed(2)}
              </b>
              <div>VAT %</div>
              {numInput(vatPercent, setVatPercent)}
              <div>Shipping</div>
              {numInput(shippingCost, setShippingCost)}
              <div>Other</div>
              {numInput(otherCost, setOtherCost)}
              <hr />
              <div>
                <b>TOTAL {currency}</b>
              </div>
              <b>
                {currencySymbol}
                {total.toFixed(2)}
              </b>
            </div>

            <hr style={hr} />

            <b>Comments</b>
            {textarea(comments, setComments, true)}

            <hr style={hr} />

            <b>Bank Details</b>
            <p>
              Account Name: JAES SOLUTIONS LTD
              <br />
              Bank: NatWest Bank
              <br />
              Sort Code: 60-10-05
              <br />
              Account No: 86494647
              <br />
              IBAN: GB82NWBK60010586494647
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  /* ---------- helpers ---------- */
  function update(i: number, k: keyof (typeof items)[0], v: number | string) {
    const copy = [...items];
    // @ts-ignore
    copy[i][k] = v;
    setItems(copy);
  }
}

/* ---------- styles ---------- */
const hr: React.CSSProperties = { margin: "18px 0" };
const th: React.CSSProperties = { border: "1px solid #000", padding: 6 };
const td: React.CSSProperties = { border: "1px solid #000", padding: 6 };
const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginBottom: 12,
};
const thead: React.CSSProperties = {
  background: "#d9f1ff",
  borderTop: "2px solid #000",
  borderBottom: "2px solid #000",
};
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
const greenBtn: React.CSSProperties = {
  padding: "8px 16px",
  background: "#16a34a",
  color: "#fff",
  border: "none",
};
const totalsBox: React.CSSProperties = {
  width: 280,
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
  opacity: 0.08,
  width: "70%",
  pointerEvents: "none",
};

/* ---------- inputs ---------- */
const input = (v: string, s: any) => (
  <input value={v} onChange={(e) => s(e.target.value)} style={iStyle} />
);
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
const textarea = (v: string, s: any, full?: boolean) => (
  <textarea
    value={v}
    onChange={(e) => s(e.target.value)}
    rows={4}
    style={{ ...iStyle, width: full ? "100%" : 260, resize: "none" }}
  />
);
const iStyle = { padding: "4px 6px", border: "1px solid #333", fontSize: 12 };
