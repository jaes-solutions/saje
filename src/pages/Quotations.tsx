import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Quotations() {
  const { quoteNumber: routeQuoteNumber } = useParams<{
    quoteNumber: string;
  }>();
  const pdfRef = useRef<HTMLDivElement | null>(null);
  const page1Ref = useRef<HTMLDivElement | null>(null);
  const page2Ref = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = React.useState<1 | 2>(1);

  const [isExportingPdf, setIsExportingPdf] = React.useState(false);

  const [quoteNumber] = React.useState(() => {
    // Editing existing quote → keep number from route
    if (routeQuoteNumber) return Number(routeQuoteNumber);

    // Hard floor: never go below 7001
    const stored = Number(localStorage.getItem("lastQuoteNo"));
    const safeLast = Number.isFinite(stored) && stored >= 7000 ? stored : 7000;

    const next = safeLast + 1;
    localStorage.setItem("lastQuoteNo", String(next));
    return next;
  });
  const activeQuoteNumber = quoteNumber;

  const today = new Date().toLocaleDateString("en-GB");

  const [validUntil, setValidUntil] = React.useState("");
  const [salesConsultant, setSalesConsultant] = React.useState("");
  const contactNumber = "+44 1279 217307";

  const [items, setItems] = React.useState([{ qty: 1, desc: "", unit: 0 }]);
  const [invoiceAddress, setInvoiceAddress] = React.useState("");
  const [deliveryAddress, setDeliveryAddress] = React.useState("");
  const [page2Notes, setPage2Notes] = React.useState("");

  useEffect(() => {
    if (!activeQuoteNumber) return;

    const loadQuote = async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("quote_number", activeQuoteNumber)
        .maybeSingle();

      if (error) {
        console.error("Load error:", error);
        return;
      }

      if (!data) return;

      const normalizedItems = (
        Array.isArray(data.items) ? data.items : JSON.parse(data.items ?? "[]")
      ).map((item: any) => ({
        qty: Number(item.qty ?? 0),
        desc: item.desc ?? "",
        unit: Number(item.unit ?? 0),
      }));

      setItems(normalizedItems);
      setVatPercent(Number(data.vat_percent ?? 0));
      setSalesConsultant(data.sales_consultant ?? "");
      setValidUntil(data.valid_until ?? "");
      setInvoiceAddress(data.invoice_address ?? invoiceAddress);
      setDeliveryAddress(data.delivery_address ?? deliveryAddress);
      setPage2Notes(data.page2_notes ?? "");
      setCurrency((data.currency as any) ?? "GBP");
      setShippingCost(Number(data.shipping_cost ?? 0));
    };

    loadQuote();
  }, [activeQuoteNumber]);

  const addRow = () => {
    setItems((prev) => [...prev, { qty: 1, desc: "", unit: 0 }]);
  };

  const removeRow = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const [vatPercent, setVatPercent] = React.useState(20);
  const [currency, setCurrency] = React.useState<"GBP" | "USD" | "AED">("GBP");
  const [shippingCost, setShippingCost] = React.useState(0);

  const currencySymbolMap: Record<"GBP" | "USD" | "AED", string> = {
    GBP: "£",
    USD: "$",
    AED: "د.إ",
  };
  const saveQuoteToCloud = async () => {
    if (!activeQuoteNumber) return;

    const payload = {
      quote_number: activeQuoteNumber,
      items: items, // send directly, Supabase jsonb-safe
      vat_percent: vatPercent,
      currency: currency,
      shipping_cost: shippingCost,
      sales_consultant: salesConsultant || null,
      valid_until: validUntil || null, // MUST be string (YYYY-MM-DD) or null
      invoice_address: invoiceAddress || null,
      delivery_address: deliveryAddress || null,
      page2_notes: page2Notes || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("quotes").upsert(payload, {
      onConflict: "quote_number",
    });

    if (error) {
      console.error("Supabase save error:", error);
      alert("Failed to save quote. Check console.");
    } else {
      alert("Quote saved successfully");
      await downloadPDF();
    }
  };

  const downloadPDF = async () => {
    if (!page1Ref.current || !page2Ref.current) {
      console.error("PDF pages not ready");
      return;
    }
    setIsExportingPdf(true);
    await new Promise((r) => setTimeout(r, 50)); // allow DOM repaint
    // (duplicate null-check removed)
    const page1 = page1Ref.current;
    const page2 = page2Ref.current;

    // Save original display states
    const page1Display = page1.style.display;
    const page2Display = page2.style.display;

    // Force both pages visible for capture
    page1.style.display = "block";
    page2.style.display = "block";

    try {
      const pdf = new jsPDF("p", "mm", "a4");

      const capture = async (el: HTMLElement, pdf: jsPDF) => {
        const canvas = await html2canvas(el, {
          scale: 3,
          backgroundColor: "#ffffff",
          useCORS: true,
          windowWidth: el.scrollWidth,
          windowHeight: el.scrollHeight,
        });

        const imgData = canvas.toDataURL("image/png");

        const pageWidth = 210; // A4 mm
        const pageHeight = 297; // A4 mm
        const margin = 15;

        const usableWidth = pageWidth - margin * 2;

        const imgHeight = (canvas.height * usableWidth) / canvas.width;

        pdf.addImage(
          imgData,
          "PNG",
          margin,
          margin,
          usableWidth,
          imgHeight,
          undefined,
          "FAST",
        );
      };

      await capture(page1, pdf);
      pdf.addPage();
      await capture(page2, pdf);

      // Generate PDF as Blob and upload to Supabase Storage, then download
      const pdfBlob = pdf.output("blob");

      const fileName = `Quotation-${activeQuoteNumber}.pdf`;
      console.log("Uploading PDF:", fileName);
      const { error: uploadError } = await supabase.storage
        .from("quotes-pdf")
        .upload(fileName, pdfBlob, {
          contentType: "application/pdf",
          upsert: true,
        });
      console.log("Upload error:", uploadError);
      if (uploadError) {
        console.error("PDF upload failed:", uploadError);
      } else {
        console.log("PDF uploaded to Supabase:", fileName);
        // Optionally store PDF path in DB if column exists
        await supabase
          .from("quotes")
          .update({ pdf_path: fileName })
          .eq("quote_number", activeQuoteNumber);
      }
      pdf.save(fileName);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("PDF generation failed. Check console.");
    } finally {
      setIsExportingPdf(false);
      // Restore original visibility
      page1.style.display = page1Display;
      page2.style.display = page2Display;
    }
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
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
          onClick={saveQuoteToCloud}
          style={{
            padding: "8px 16px",
            background: "#16a34a",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Save Quote
        </button>

        <button
          onClick={() => setPage(1)}
          style={{
            padding: "6px 12px",
            background: page === 1 ? "#4bb3a7" : "#d0f0ea",
            color: "#000",
            border: "1px solid #4bb3a7",
            cursor: "pointer",
          }}
        >
          Page 1
        </button>

        <button
          onClick={() => setPage(2)}
          style={{
            padding: "6px 12px",
            background: page === 2 ? "#4bb3a7" : "#d0f0ea",
            color: "#000",
            border: "1px solid #4bb3a7",
            cursor: "pointer",
          }}
        >
          Page 2
        </button>
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
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

          <div
            ref={page1Ref}
            style={{
              display: page === 1 ? "block" : "none",
              position: "relative",
            }}
          >
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
                  alt="JAES Solutions"
                  style={{ width: 140, marginBottom: 8 }}
                />
                <h1 style={{ margin: 0, fontSize: 22 }}>QUOTATION</h1>
                <p style={{ margin: "6px 0" }}>
                  Quote Number: <b>{activeQuoteNumber}</b>
                  <br />
                  Quote Date: <b>{today}</b>
                  <br />
                  Valid Until:{" "}
                  {isExportingPdf ? (
                    <span style={{ fontWeight: 600 }}>{validUntil}</span>
                  ) : (
                    <input
                      type="date"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      style={{
                        marginLeft: 6,
                        width: 160,
                        padding: "4px 6px",
                        border: "1px solid #333",
                        fontSize: 12,
                      }}
                    />
                  )}
                  <br />
                  Sales Consultant:{" "}
                  {isExportingPdf ? (
                    <span style={{ fontWeight: 600 }}>
                      {salesConsultant || "—"}
                    </span>
                  ) : (
                    <input
                      value={salesConsultant}
                      onChange={(e) => setSalesConsultant(e.target.value)}
                      style={{
                        marginLeft: 6,
                        width: 160,
                        padding: "4px 6px",
                        border: "1px solid #333",
                        fontSize: 12,
                      }}
                    />
                  )}
                  <br />
                  Contact no: <b>{contactNumber}</b>
                  <br />
                  Currency:{" "}
                  {isExportingPdf ? (
                    <span style={{ fontWeight: 600 }}>{currency}</span>
                  ) : (
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as any)}
                      style={{
                        marginLeft: 6,
                        padding: "4px 6px",
                        border: "1px solid #333",
                        fontSize: 12,
                      }}
                    >
                      <option value="GBP">GBP (£)</option>
                      <option value="USD">USD ($)</option>
                      <option value="AED">AED (د.إ)</option>
                    </select>
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
                <b>Invoice Address</b>
                {isExportingPdf ? (
                  <p style={{ whiteSpace: "pre-line" }}>
                    {invoiceAddress || "—"}
                  </p>
                ) : (
                  <textarea
                    value={invoiceAddress}
                    onChange={(e) => setInvoiceAddress(e.target.value)}
                    rows={5}
                    style={{
                      width: 260,
                      padding: 6,
                      border: "1px solid #333",
                      fontSize: 12,
                      resize: "none",
                    }}
                  />
                )}
              </div>

              <div>
                <b>Delivery Address</b>
                {isExportingPdf ? (
                  <p style={{ whiteSpace: "pre-line" }}>
                    {deliveryAddress || "—"}
                  </p>
                ) : (
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    rows={5}
                    style={{
                      width: 260,
                      padding: 6,
                      border: "1px solid #333",
                      fontSize: 12,
                      resize: "none",
                    }}
                  />
                )}
              </div>
            </div>

            <hr style={{ margin: "18px 0" }} />

            {/* ITEMS TABLE */}
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
                  <th style={{ ...th, width: "12%" }}>Quantity</th>
                  <th style={{ ...th, width: "44%" }}>Description</th>
                  <th style={{ ...th, width: "22%" }}>Unit Price</th>
                  <th style={{ ...th, width: "22%" }}>Total Price</th>
                  {!isExportingPdf && <th style={th}>Action</th>}
                </tr>
              </thead>
              <tbody>
                {items.map((row, i) => {
                  const total = row.qty * row.unit;
                  return (
                    <tr
                      key={i}
                      style={
                        i === 0 ? { borderTop: "2px solid #000" } : undefined
                      }
                    >
                      <td style={td}>
                        {isExportingPdf ? (
                          <span>{row.qty}</span>
                        ) : (
                          <input
                            type="number"
                            value={row.qty}
                            onChange={(e) => {
                              const v = [...items];
                              v[i].qty = Math.max(0, Number(e.target.value));
                              setItems(v);
                            }}
                            style={{
                              width: 60,
                              padding: "4px",
                              border: "1px solid #333",
                              fontSize: 12,
                            }}
                          />
                        )}
                      </td>
                      <td style={td}>
                        {isExportingPdf ? (
                          <span>{row.desc || "—"}</span>
                        ) : (
                          <input
                            value={row.desc}
                            onChange={(e) => {
                              const v = [...items];
                              v[i].desc = e.target.value;
                              setItems(v);
                            }}
                            style={{
                              width: "100%",
                              padding: "4px",
                              border: "1px solid #333",
                              fontSize: 12,
                            }}
                          />
                        )}
                      </td>
                      <td style={td}>
                        {isExportingPdf ? (
                          <span>
                            {currencySymbolMap[currency]}
                            {row.unit.toFixed(2)}
                          </span>
                        ) : (
                          <input
                            type="number"
                            value={row.unit}
                            onChange={(e) => {
                              const v = [...items];
                              v[i].unit = Math.max(0, Number(e.target.value));
                              setItems(v);
                            }}
                            style={{
                              width: 100,
                              padding: "4px",
                              border: "1px solid #333",
                              fontSize: 12,
                            }}
                          />
                        )}
                      </td>
                      <td style={td}>
                        {currencySymbolMap[currency]}
                        {total.toFixed(2)}
                      </td>
                      <td style={td}>
                        {!isExportingPdf && (
                          <button
                            onClick={() => removeRow(i)}
                            style={{
                              padding: "2px 6px",
                              background: "#ffd6d6",
                              border: "1px solid #cc0000",
                              cursor: "pointer",
                            }}
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ marginBottom: 12 }}>
              {!isExportingPdf && (
                <button
                  onClick={addRow}
                  style={{
                    padding: "6px 12px",
                    background: "#d0f0ea",
                    border: "1px solid #4bb3a7",
                    cursor: "pointer",
                  }}
                >
                  + Add Item
                </button>
              )}
            </div>

            {/* TOTALS */}
            {(() => {
              const subtotal = items.reduce((s, r) => s + r.qty * r.unit, 0);
              const vatAmount = (subtotal * vatPercent) / 100;
              const total = subtotal + vatAmount + shippingCost;

              return (
                <div
                  style={{
                    width: 280,
                    marginLeft: "auto",
                    background: "#f7fbf9",
                    padding: 10,
                    borderRadius: 4,
                    border: "1px solid #cde7dc",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 90px",
                      rowGap: 6,
                      columnGap: 8,
                      alignItems: "center",
                      fontSize: 11,
                    }}
                  >
                    <span>Subtotal ({currency})</span>
                    <b>
                      {currencySymbolMap[currency]}
                      {subtotal.toFixed(2)}
                    </b>

                    <span>VAT (%)</span>
                    {isExportingPdf ? (
                      <b>{vatPercent}%</b>
                    ) : (
                      <input
                        type="number"
                        min={0}
                        value={vatPercent}
                        onChange={(e) =>
                          setVatPercent(Math.max(0, Number(e.target.value)))
                        }
                        style={{
                          width: 56,
                          padding: "2px 4px",
                          fontSize: 11,
                          border: "1px solid #333",
                          textAlign: "right",
                        }}
                      />
                    )}

                    <span>VAT Amount</span>
                    <b>
                      {currencySymbolMap[currency]}
                      {vatAmount.toFixed(2)}
                    </b>

                    <span>Shipping</span>
                    {isExportingPdf ? (
                      <b>
                        {currencySymbolMap[currency]}
                        {shippingCost.toFixed(2)}
                      </b>
                    ) : (
                      <input
                        type="number"
                        min={0}
                        value={shippingCost}
                        onChange={(e) =>
                          setShippingCost(Math.max(0, Number(e.target.value)))
                        }
                        style={{
                          width: 70,
                          padding: "2px 4px",
                          fontSize: 11,
                          border: "1px solid #333",
                          textAlign: "right",
                        }}
                      />
                    )}
                  </div>

                  <hr style={{ margin: "8px 0", borderColor: "#cde7dc" }} />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    <span>Total Inc‑VAT</span>
                    <span>
                      {currencySymbolMap[currency]}
                      {total.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })()}

            <hr style={{ margin: "18px 0" }} />

            {/* TERMS */}
            <p style={{ fontSize: 11, lineHeight: 1.4 }}>
              PRICES SUBJECT TO CHANGE – PRICES BASED UPON TOTAL PURCHASE – ALL
              DELIVERY, TRAINING OR CONSULTING SERVICES TO BE BILLED AT
              PUBLISHED RATES FOR EACH ACTIVITY INVOLVED – GENERALLY ALL
              HARDWARE COMPONENTS PROPOSED ABOVE ARE COVERED BY A LIMITED
              WARRANTY, COVERING PARTS AND LABOUR FOR HARDWARE ONLY AND ON A
              DEPOT BASIS – WE SPECIFICALLY DISCLAIM ANY AND ALL WARRANTIES,
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY IMPLIED
              WARRANTIES. WE SHALL NOT BE LIABLE FOR ANY LOSS OF PROFITS,
              BUSINESS, GOODWILL, DATA, INTERRUPTION OF BUSINESS. ALL PRICES
              INCLUDING VAT. CUSTOMER UNDERSTANDS THAT ONCE GOODS HAVE BEEN
              PLACED THE ORDER WITH THE VENDOR A NON-CANCELLATION AND
              NON-RETURNABLE POLICY WILL APPLY.
            </p>
          </div>

          <div
            ref={page2Ref}
            style={{
              minHeight: 900,
              display: page === 2 ? "block" : "none",
              position: "relative",
            }}
          >
            <div
              style={{ height: 6, background: "#b9e5ff", marginBottom: 16 }}
            />
            <img
              src="/assets/watermark.png"
              alt="Watermark"
              style={watermarkStyle}
            />
            <h2 style={{ fontSize: 18, marginBottom: 12 }}>Item Breakdown</h2>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                tableLayout: "fixed",
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
                  <th style={th}>Quantity</th>
                  <th style={th}>Description</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, i) => (
                  <tr key={i}>
                    <td style={td}>
                      {isExportingPdf ? (
                        <span>{row.qty}</span>
                      ) : (
                        <input
                          type="number"
                          value={row.qty}
                          onChange={(e) => {
                            const v = [...items];
                            v[i].qty = Math.max(0, Number(e.target.value));
                            setItems(v);
                          }}
                          style={{
                            width: 80,
                            padding: "4px",
                            border: "1px solid #333",
                            fontSize: 12,
                          }}
                        />
                      )}
                    </td>

                    <td style={td}>
                      {isExportingPdf ? (
                        <span>{row.desc || "—"}</span>
                      ) : (
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <input
                            value={row.desc}
                            onChange={(e) => {
                              const v = [...items];
                              v[i].desc = e.target.value;
                              setItems(v);
                            }}
                            style={{
                              width: "100%",
                              padding: "4px",
                              border: "1px solid #333",
                              fontSize: 12,
                            }}
                          />

                          {!isExportingPdf && (
                            <button
                              onClick={() => removeRow(i)}
                              title="Delete row"
                              style={{
                                padding: "2px 6px",
                                background: "#ffd6d6",
                                border: "1px solid #cc0000",
                                cursor: "pointer",
                              }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              {!isExportingPdf && (
                <button
                  onClick={addRow}
                  style={{
                    padding: "6px 12px",
                    background: "#d0f0ea",
                    border: "1px solid #4bb3a7",
                    cursor: "pointer",
                  }}
                >
                  + Add Item
                </button>
              )}
            </div>

            <hr style={{ margin: "20px 0" }} />

            <div>
              <h2 style={{ fontSize: 18, marginBottom: 12 }}>
                Additional Information
              </h2>
              {isExportingPdf ? (
                <p style={{ whiteSpace: "pre-line", minHeight: 200 }}>
                  {page2Notes || "—"}
                </p>
              ) : (
                <textarea
                  value={page2Notes}
                  onChange={(e) => setPage2Notes(e.target.value)}
                  rows={10}
                  style={{
                    width: "100%",
                    minHeight: 220,
                    marginTop: 8,
                    padding: 10,
                    border: "1px solid #333",
                    fontSize: 12,
                    resize: "vertical",
                  }}
                />
              )}
            </div>

            <div style={{ marginTop: 20, fontSize: 11, textAlign: "right" }}>
              Page 2 of 2
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
