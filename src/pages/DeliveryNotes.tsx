import React, { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function DeliveryNotes() {
  const { deliveryNoteNumber: routeNumber } = useParams<{
    deliveryNoteNumber: string;
  }>();
  const navigate = useNavigate();

  const pdfRef = useRef<HTMLDivElement | null>(null);
  const page1Ref = useRef<HTMLDivElement | null>(null);

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // ---------- Delivery Note Number ----------
  const [deliveryNoteNumber] = useState(() => {
    if (routeNumber) return Number(routeNumber);

    const stored = Number(localStorage.getItem("lastDeliveryNoteNo"));
    const safeLast = Number.isFinite(stored) && stored >= 3000 ? stored : 3000;
    const next = safeLast + 1;
    localStorage.setItem("lastDeliveryNoteNo", String(next));
    return next;
  });

  const today = new Date().toLocaleDateString("en-GB");

  // ---------- State ----------
  const [poNumber, setPoNumber] = useState("");
  const [refNumber, setRefNumber] = useState("");
  const [vendor, setVendor] = useState("");
  const [shipTo, setShipTo] = useState("");
  const [comments, setComments] = useState("");

  const [items, setItems] = useState([{ qty: 1, desc: "" }]);

  // ---------- Load existing ----------
  useEffect(() => {
    if (!routeNumber) return;

    const load = async () => {
      const { data, error } = await supabase
        .from("delivery_notes")
        .select("*")
        .eq("delivery_note_number", Number(routeNumber))
        .maybeSingle();

      if (error || !data) return;

      setPoNumber(data.po_number ?? "");
      setRefNumber(data.ref_number ?? "");
      setVendor(data.vendor ?? "");
      setShipTo(data.ship_to ?? "");
      setComments(data.comments ?? "");

      const parsedItems = Array.isArray(data.items)
        ? data.items
        : JSON.parse(data.items ?? "[]");

      setItems(
        parsedItems.map((i: any) => ({
          qty: Number(i.qty ?? 0),
          desc: i.desc ?? "",
        })),
      );
    };

    load();
  }, [routeNumber]);

  // ---------- Rows ----------
  const addRow = () => setItems((p) => [...p, { qty: 1, desc: "" }]);
  const removeRow = (i: number) =>
    setItems((p) => p.filter((_, idx) => idx !== i));

  // ---------- Save ----------
  const saveDeliveryNote = async () => {
    const payload = {
      delivery_note_number: deliveryNoteNumber,
      po_number: poNumber || null,
      ref_number: refNumber || null,
      vendor: vendor || null,
      ship_to: shipTo || null,
      comments: comments || null,
      items: JSON.stringify(items),
    };

    const { error } = await supabase
      .from("delivery_notes")
      .upsert(payload, { onConflict: "delivery_note_number" });

    if (error) {
      console.error(error);
      alert("Failed to save delivery note");
      return;
    }

    await downloadPDF();
  };

  // ---------- PDF ----------
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
    const pageWidth = 210;
    const margin = 15;
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

    const fileName = `Delivery-Note-${deliveryNoteNumber}.pdf`;

    const blob = pdf.output("blob");
    await supabase.storage
      .from("delivery-pdf")
      .upload(fileName, blob, { upsert: true });

    pdf.save(fileName);
    setIsExportingPdf(false);
  };

  return (
    <div
      style={{
        padding: 24,
        marginLeft: 256,
        minHeight: "100vh",
        background: "#000",
      }}
    >
      {/* ACTIONS */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => navigate("/delivery")}
          style={{ padding: "8px 16px" }}
        >
          ← Back
        </button>
        <button
          onClick={downloadPDF}
          style={{
            padding: "8px 16px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Download PDF
        </button>
        <button
          onClick={saveDeliveryNote}
          style={{
            padding: "8px 16px",
            background: "#16a34a",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Save Delivery Note
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          ref={pdfRef}
          style={{
            width: "210mm",
            background: "#ffffff",
            padding: "20mm",
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: 12,
            color: "#000",
            boxSizing: "border-box",
            lineHeight: 1.35,
          }}
        >
          <div style={{ height: 6, background: "#b9e5ff", marginBottom: 16 }} />

          <div ref={page1Ref} style={{ position: "relative" }}>
            <img
              src="/assets/watermark.png"
              alt="Watermark"
              style={watermarkStyle}
            />

            {/* HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <img
                  src="/assets/jaes-logo.png"
                  style={{ width: 140, marginBottom: 8 }}
                />
                <h1 style={{ margin: 0, fontSize: 22 }}>DELIVERY NOTE</h1>
                <p style={{ margin: "6px 0" }}>
                  Delivery Note No: <b>{deliveryNoteNumber}</b>
                  <br />
                  Date: <b>{today}</b>
                  <br />
                  PO#:{" "}
                  {isExportingPdf ? (
                    <b>{poNumber || "—"}</b>
                  ) : (
                    <input
                      value={poNumber}
                      onChange={(e) => setPoNumber(e.target.value)}
                      style={inputStyle}
                    />
                  )}
                  <br />
                  Ref No#:{" "}
                  {isExportingPdf ? (
                    <b>{refNumber || "—"}</b>
                  ) : (
                    <input
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value)}
                      style={inputStyle}
                    />
                  )}
                </p>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: "bold" }}>JAES SOLUTIONS LTD</div>
                <div>
                  Devonshire House, 582 Honeypot Lane,
                  <br />
                  Stanmore, England, HA7 1JS, UK
                </div>
                <div style={{ fontSize: 11, marginTop: 6 }}>
                  VAT Reg No: 158 9915 51
                  <br />
                  Company Reg No: 8452633
                </div>
              </div>
            </div>

            <hr style={{ margin: "18px 0" }} />

            {/* ADDRESSES */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <b>Vendor</b>
                {isExportingPdf ? (
                  <p>{vendor || "—"}</p>
                ) : (
                  <textarea
                    rows={5}
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    style={textareaStyle}
                  />
                )}
              </div>

              <div>
                <b>Ship To</b>
                {isExportingPdf ? (
                  <p>{shipTo || "—"}</p>
                ) : (
                  <textarea
                    rows={5}
                    value={shipTo}
                    onChange={(e) => setShipTo(e.target.value)}
                    style={textareaStyle}
                  />
                )}
              </div>
            </div>

            <hr style={{ margin: "18px 0" }} />

            {/* ITEMS */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                tableLayout: "fixed",
                marginBottom: 16,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#d9f1ff",
                    borderTop: "2px solid #000",
                    borderBottom: "2px solid #000",
                  }}
                >
                  <th style={{ ...th, width: "20%" }}>Quantity</th>
                  <th style={{ ...th, width: "70%" }}>Description</th>
                  {!isExportingPdf && <th style={th}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((row, i) => (
                  <tr key={i}>
                    <td style={td}>
                      {isExportingPdf ? (
                        row.qty
                      ) : (
                        <input
                          type="number"
                          value={row.qty}
                          onChange={(e) => {
                            const v = [...items];
                            v[i].qty = Math.max(0, Number(e.target.value));
                            setItems(v);
                          }}
                          style={qtyInput}
                        />
                      )}
                    </td>
                    <td style={td}>
                      {isExportingPdf ? (
                        row.desc || "—"
                      ) : (
                        <input
                          value={row.desc}
                          onChange={(e) => {
                            const v = [...items];
                            v[i].desc = e.target.value;
                            setItems(v);
                          }}
                          style={descInput}
                        />
                      )}
                    </td>
                    {!isExportingPdf && (
                      <td style={td}>
                        <button onClick={() => removeRow(i)} style={deleteBtn}>
                          ✕
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {!isExportingPdf && (
              <button onClick={addRow} style={addBtn}>
                + Add Item
              </button>
            )}

            <hr style={{ margin: "18px 0" }} />

            {/* COMMENTS */}
            <b>Comments or Special Instructions</b>
            {isExportingPdf ? (
              <p>{comments || "—"}</p>
            ) : (
              <textarea
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                style={{ ...textareaStyle, width: "100%" }}
              />
            )}

            <hr style={{ margin: "18px 0" }} />

            {/* SIGNATURE */}
            <b>Customer Representative</b>
            <p>Name:</p>
            <p>Signature:</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- styles ---------- */

const inputStyle: React.CSSProperties = {
  marginLeft: 6,
  width: 160,
  padding: "4px 6px",
  border: "1px solid #333",
  fontSize: 12,
};

const textareaStyle: React.CSSProperties = {
  width: 260,
  padding: 6,
  border: "1px solid #333",
  fontSize: 12,
  resize: "none",
};

const th: React.CSSProperties = {
  border: "1px solid #000",
  padding: "6px 8px",
  textAlign: "left",
  verticalAlign: "middle",
  fontWeight: 600,
};

const td: React.CSSProperties = {
  border: "1px solid #000",
  padding: "6px 8px",
  verticalAlign: "top",
};

const qtyInput: React.CSSProperties = {
  width: 60,
  padding: "4px",
  border: "1px solid #333",
  fontSize: 12,
};

const descInput: React.CSSProperties = {
  width: "100%",
  padding: "4px",
  border: "1px solid #333",
  fontSize: 12,
};

const addBtn: React.CSSProperties = {
  padding: "6px 12px",
  background: "#d0f0ea",
  border: "1px solid #4bb3a7",
  cursor: "pointer",
};

const deleteBtn: React.CSSProperties = {
  padding: "2px 6px",
  background: "#ffd6d6",
  border: "1px solid #cc0000",
  cursor: "pointer",
};

const watermarkStyle: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  opacity: 0.08,
  width: "70%",
  pointerEvents: "none",
  zIndex: 0,
};
