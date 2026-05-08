import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

type Party = {
  name: string;
  address: string;
  phone: string;
};

type Item = {
  item: string;
  description: string;
  qty: number;
  price: number;
};

type HistoryOption = {
  label: string;
  vendor: Party;
  shipTo: Party;
};

export default function Invoices() {
  const { invoiceNumber } = useParams<{ invoiceNumber: string }>();
  const pageRef = useRef<HTMLDivElement | null>(null);
  const savingRef = useRef(false);

  /* =========================
     STATE
  ========================= */
  const [currency, setCurrency] = useState<"USD" | "GBP" | "INR">("USD");
  const [poNumber, setPoNumber] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("30 days");
  const [vendor, setVendor] = useState<Party>({
    name: "",
    address: "",
    phone: "",
  });
  const [shipTo, setShipTo] = useState<Party>({
    name: "",
    address: "",
    phone: "",
  });
  const [items, setItems] = useState<Item[]>([
    { item: "", description: "", qty: 1, price: 0 },
  ]);
  const [comments, setComments] = useState("");
  const [vat, setVat] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [other, setOther] = useState(0);
  const [, setHistory] = useState<HistoryOption[]>([]);

  /* =========================
     LOAD EXISTING INVOICE (by invoiceNumber)
  ========================= */
  useEffect(() => {
    if (!invoiceNumber) return;

    const loadInvoice = async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("invoice_number", Number(invoiceNumber))
        .maybeSingle();

      if (error) {
        console.error("Failed to load invoice:", error);
        return;
      }
      if (!data) return;

      setCurrency(data.currency ?? "USD");
      setPoNumber(data.po_number ?? "");
      setPaymentTerms(data.payment_terms ?? "30 days");

      setVendor({
        name: data.vendor_name ?? "",
        address: data.vendor_address ?? "",
        phone: data.vendor_phone ?? "",
      });

      setShipTo({
        name: data.ship_to_name ?? "",
        address: data.ship_to_address ?? "",
        phone: data.ship_to_phone ?? "",
      });

      setItems(
        Array.isArray(data.items) && data.items.length
          ? data.items
          : [{ item: "", description: "", qty: 1, price: 0 }],
      );

      setComments(data.comments ?? "");
      setVat(data.vat ?? 0);
      setShipping(data.shipping ?? 0);
      setOther(data.other ?? 0);
    };

    loadInvoice();
  }, [invoiceNumber]);

  /* =========================
     LOAD HISTORY (Q + I)
  ========================= */
  useEffect(() => {
    const loadHistory = async () => {
      const opts: HistoryOption[] = [];

      const { data: quotes } = await supabase
        .from("quotes")
        .select("quote_number")
        .limit(20);

      quotes?.forEach((q: any) => {
        opts.push({
          label: `Q-${q.quote_number}`,
          vendor: { name: "", address: "", phone: "" },
          shipTo: { name: "", address: "", phone: "" },
        });
      });

      const { data: invoices } = await supabase
        .from("invoices")
        .select("invoice_number")
        .limit(20);

      invoices?.forEach((i: any) => {
        opts.push({
          label: `I-${i.invoice_number}`,
          vendor: { name: "", address: "", phone: "" },
          shipTo: { name: "", address: "", phone: "" },
        });
      });

      setHistory(opts);
    };

    loadHistory();
  }, []);

  /* =========================
     TOTALS
  ========================= */
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + Number(i.qty) * Number(i.price || 0), 0),
    [items],
  );

  const currencySymbol = useMemo(() => {
    switch (currency) {
      case "GBP":
        return "£";
      case "INR":
        return "₹";
      default:
        return "$";
    }
  }, [currency]);

  const vatAmount = useMemo(() => {
    return subtotal * (Number(vat) / 100);
  }, [subtotal, vat]);

  const grandTotal = useMemo(() => {
    return subtotal + vatAmount + Number(shipping) + Number(other);
  }, [subtotal, vatAmount, shipping, other]);

  // =========================
  //   DISPLAY INVOICE NUMBER
  // =========================
  const displayInvoiceNumber = useMemo(() => {
    const year = new Date().getFullYear().toString().slice(-2);
    const num = String(invoiceNumber ?? "").padStart(6, "0");
    return `${year}-INV-${num}`;
  }, [invoiceNumber]);

  /* =========================
     SAVE (UPSERT + PDF)
  ========================= */
  const saveInvoice = async () => {
    if (!invoiceNumber || savingRef.current) return;
    savingRef.current = true;

    try {
      await supabase.from("invoices").upsert(
        {
          invoice_number: Number(invoiceNumber),
          currency,
          po_number: poNumber,
          payment_terms: paymentTerms,
          vendor_name: vendor.name,
          vendor_address: vendor.address,
          vendor_phone: vendor.phone,
          ship_to_name: shipTo.name,
          ship_to_address: shipTo.address,
          ship_to_phone: shipTo.phone,
          items,
          comments,
          vat,
          shipping,
          other,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "invoice_number" },
      );

      document.body.classList.add("pdf-mode");
      const canvas = await html2canvas(pageRef.current!, { scale: 2 });
      document.body.classList.remove("pdf-mode");

      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "px", "a4");
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(img, "PNG", 0, 0, w, h);

      const blob = pdf.output("blob");
      const fileName = `Invoice-${invoiceNumber}.pdf`;

      await supabase.storage.from("invoices").upload(fileName, blob, {
        upsert: true,
        contentType: "application/pdf",
      });

      await supabase
        .from("invoices")
        .update({ pdf_path: fileName })
        .eq("invoice_number", Number(invoiceNumber));
    } finally {
      savingRef.current = false;
    }
  };

  /* =========================
     RENDER
  ========================= */
  const addRow = () => {
    setItems([...items, { item: "", description: "", qty: 1, price: 0 }]);
  };

  const removeRow = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div style={{ background: "#000", padding: 10 }}>
      <style>{`
  .invoice-page {
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    position: relative;
    font-size: 12px;
    line-height: 1.35;
  }

  .lb {
    background: #eaf2ff;
    color: #1f3a8a;
  }

  .btn-lb {
    background: #2563eb;
    color: #fff;
    border: none;
    padding: 8px 14px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
  }
  .btn-lb:hover {
    background: #1d4ed8;
  }

  .editable {
    background: rgba(255, 255, 255, 0.4);
    border: 1px solid #d0d7e2;
    border-radius: 6px;
    padding: 6px 8px;
    outline: none;
  }

  .editable:focus {
    border-color: #60a5fa;
  }

  /* Hide borders ONLY during PDF generation */
  body.pdf-mode .editable {
    border: none !important;
  }

  body.pdf-mode .hide-pdf {
    display: none !important;
  }

  body.pdf-mode button {
    display: none !important;
  }

  table th,
  table td {
    vertical-align: middle;
  }

  .invoice-page > * {
    position: relative;
    z-index: 1;
  }
`}</style>
      <div
        className="hide-pdf"
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          width: "210mm",
          margin: "0 auto",
        }}
      >
        <button
          className="btn-lb"
          onClick={async () => {
            document.body.classList.add("pdf-mode");
            const canvas = await html2canvas(pageRef.current!, {
              scale: 2,
            });
            document.body.classList.remove("pdf-mode");

            const img = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "px", "a4");
            const w = pdf.internal.pageSize.getWidth();
            const h = (canvas.height * w) / canvas.width;

            pdf.addImage(img, "PNG", 0, 0, w, h);
            pdf.save(`Invoice-${invoiceNumber}.pdf`);
          }}
        >
          Download PDF
        </button>
        <button className="btn-lb" onClick={saveInvoice}>
          Save Invoice
        </button>
      </div>

      <div
        ref={pageRef}
        className="invoice-page"
        style={{
          width: "210mm",
          minHeight: "297mm",
          margin: "6px auto",
          background: "#fff",
          padding: "10mm",
          overflow: "hidden",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          borderRadius: 8,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/assets/watermark.png')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "70%",
            opacity: 0.18,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <img
              src="/assets/jaes-logo.png"
              alt="JAES"
              style={{ width: 120, marginBottom: 4 }}
            />
            <div style={{ textAlign: "left" }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                INVOICE
              </h2>
              <p
                style={{
                  display: "inline-block",
                  borderRadius: 6,
                  margin: "4px 0",
                }}
              >
                <strong>Invoice Number: </strong>
                {displayInvoiceNumber}
              </p>

              <p>
                <strong>PO#:</strong>{" "}
                <input
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="editable"
                />
              </p>
              <p>
                <strong>Date:</strong> {new Date().toLocaleDateString()}
              </p>
              <p>
                <strong>Payment:</strong>{" "}
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="editable"
                >
                  <option>30 days</option>
                  <option>60 days</option>
                  <option>90 days</option>
                </select>
              </p>
              <p>
                <strong>Currency:</strong>{" "}
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="editable"
                >
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </p>
            </div>
          </div>
          <div style={{ textAlign: "right", minWidth: 220 }}>
            <p>
              <strong>JAES Solutions LTD</strong>
            </p>
            <div style={{ fontSize: 11, marginTop: 2, lineHeight: 1.2 }}>
              <p>Devonshire House, 582 Honeypot Lane,</p>
              <p>Stanmore, England, HA7 1JS, UK</p>
              <p>Email: info@jaessolutions.com</p>
              <p>Phone: 01279 213707</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 4 }} />

        <hr />
        <div style={{ marginTop: 4 }} />
        {/* VENDOR / SHIP TO */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              Vendor
            </div>
            <textarea
              value={[vendor.name, vendor.address, vendor.phone]
                .filter(Boolean)
                .join("\n")}
              onChange={(e) =>
                setVendor({
                  name: e.target.value,
                  address: "",
                  phone: "",
                })
              }
              style={{
                width: 260,
                height: 80,
                padding: 4,
                border: "1px solid #333",
                fontSize: 12,
                lineHeight: 1.35,
                resize: "none",
              }}
              className="editable"
            />
          </div>

          <div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
              Ship To
            </div>
            <textarea
              value={[shipTo.name, shipTo.address, shipTo.phone]
                .filter(Boolean)
                .join("\n")}
              onChange={(e) =>
                setShipTo({
                  name: e.target.value,
                  address: "",
                  phone: "",
                })
              }
              style={{
                width: 260,
                height: 80,
                padding: 4,
                border: "1px solid #333",
                fontSize: 12,
                lineHeight: 1.35,
                resize: "none",
              }}
              className="editable"
            />
          </div>
        </div>

        <div style={{ height: 4 }} />

        {/* ITEMS TABLE */}
        <table
          border={1}
          cellPadding={6}
          style={{
            borderCollapse: "collapse",
            tableLayout: "fixed",
            width: "100%",
            border: "1px solid #000",
            fontSize: 11,
            lineHeight: 1.35,
          }}
        >
          <thead
            style={{
              background: "#d9f1ff",
              borderTop: "2px solid #000",
              borderBottom: "2px solid #000",
            }}
          >
            <tr>
              <th style={{ width: "12%", border: "1px solid #000" }}>ITEM</th>
              <th style={{ width: "33%", border: "1px solid #000" }}>
                DESCRIPTION
              </th>
              <th style={{ width: "10%", border: "1px solid #000" }}>QTY</th>
              <th style={{ width: "18%", border: "1px solid #000" }}>
                UNIT PRICE
              </th>
              <th style={{ width: "17%", border: "1px solid #000" }}>TOTAL</th>
              <th style={{ width: "10%", border: "1px solid #000" }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx} style={{ background: "transparent" }}>
                <td style={{ border: "1px solid #000" }}>
                  <input
                    value={it.item}
                    onChange={(e) => {
                      const c = [...items];
                      c[idx].item = e.target.value;
                      setItems(c);
                    }}
                    className="editable"
                    style={{ width: "100%" }}
                  />
                </td>
                <td style={{ border: "1px solid #000" }}>
                  <input
                    value={it.description}
                    onChange={(e) => {
                      const c = [...items];
                      c[idx].description = e.target.value;
                      setItems(c);
                    }}
                    className="editable"
                    style={{ width: "100%" }}
                  />
                </td>
                <td style={{ border: "1px solid #000" }}>
                  <input
                    type="number"
                    value={it.qty}
                    onChange={(e) => {
                      const c = [...items];
                      c[idx].qty = Math.max(0, Number(e.target.value));
                      setItems(c);
                    }}
                    min={0}
                    className="editable"
                    style={{ width: "100%" }}
                  />
                </td>
                <td style={{ border: "1px solid #000" }}>
                  <input
                    type="number"
                    value={it.price}
                    onChange={(e) => {
                      const c = [...items];
                      c[idx].price = Math.max(0, Number(e.target.value));
                      setItems(c);
                    }}
                    min={0}
                    className="editable"
                    style={{ width: "100%" }}
                  />
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: 500,
                    border: "1px solid #000",
                  }}
                >
                  {currencySymbol}
                  {(it.qty * it.price).toFixed(2)}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    textAlign: "center",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    className="btn-lb"
                    style={{
                      padding: "4px 10px",
                      background: "#d0f0ea",
                      color: "#166534",
                      border: "1px solid #4bb3a7",
                      borderRadius: 6,
                      fontWeight: 600,
                    }}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div
          style={{
            marginTop: 6,
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          <button
            type="button"
            onClick={addRow}
            className="btn-lb"
            style={{
              background: "#d0f0ea",
              color: "#166534",
              border: "1px solid #4bb3a7",
              fontWeight: 600,
            }}
          >
            + Add Item
          </button>
        </div>

        <div style={{ height: 6 }} />

        {/* TOTALS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 420px",
            columnGap: 10,
            rowGap: 6,
            alignItems: "start",
          }}
        >
          <div>
            <div
              style={{
                background: "#eef2ff",
                color: "#1e3a8a",
                fontWeight: 600,
                fontSize: 18,
                padding: 6,
              }}
            >
              Comments or Special Instructions
            </div>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              style={{ width: "100%", minHeight: 60 }}
              className="editable"
            />
          </div>

          <div>
            <table
              width="100%"
              cellPadding={8}
              style={{
                borderCollapse: "separate",
                borderSpacing: 0,
                border: "1px solid #cde7dc",
                background: "#f7fbf9",
                borderRadius: 10,
                overflow: "hidden",
                padding: 4,
                fontSize: 11,
                lineHeight: 1.35,
              }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      padding: "4px 8px",
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    Subtotal ({currency})
                  </td>
                  <td
                    style={{
                      padding: "4px 8px",
                      textAlign: "right",
                      fontSize: 12,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {currencySymbol}
                    {subtotal.toFixed(2)}
                  </td>
                </tr>

                <tr>
                  <td
                    style={{
                      padding: "4px 8px",
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    VAT (%)
                  </td>
                  <td
                    style={{
                      padding: "4px 8px",
                      textAlign: "right",
                    }}
                  >
                    <input
                      type="number"
                      value={vat}
                      onChange={(e) =>
                        setVat(Math.max(0, Number(e.target.value)))
                      }
                      min={0}
                      style={{
                        background: "#fff",
                        width: 110,
                        textAlign: "right",
                        height: 32,
                        border: "1px solid #888",
                        borderRadius: 0,
                        fontSize: 12,
                        paddingRight: 8,
                      }}
                      className="editable"
                    />
                  </td>
                </tr>

                <tr>
                  <td
                    style={{
                      padding: "4px 8px",
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    VAT Amount
                  </td>
                  <td
                    style={{
                      padding: "4px 8px",
                      textAlign: "right",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {currencySymbol}
                    {vatAmount.toFixed(2)}
                  </td>
                </tr>

                <tr>
                  <td
                    style={{
                      padding: "4px 8px",
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    Shipping
                  </td>
                  <td
                    style={{
                      padding: "4px 8px",
                      textAlign: "right",
                    }}
                  >
                    <input
                      type="number"
                      value={shipping}
                      onChange={(e) =>
                        setShipping(Math.max(0, Number(e.target.value)))
                      }
                      min={0}
                      style={{
                        background: "#fff",
                        width: 110,
                        textAlign: "right",
                        height: 32,
                        border: "1px solid #888",
                        borderRadius: 0,
                        fontSize: 12,
                        paddingRight: 8,
                      }}
                      className="editable"
                    />
                  </td>
                </tr>

                <tr>
                  <td
                    colSpan={2}
                    style={{
                      paddingTop: 6,
                      paddingLeft: 12,
                      paddingRight: 12,
                      paddingBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        borderTop: "1px solid #cde7dc",
                        paddingTop: 6,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 16,
                        fontWeight: 700,
                      }}
                    >
                      <span>Total Inc-VAT</span>
                      <span>
                        {currencySymbol}
                        {grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ height: 4 }} />

        {/* BANK DETAILS */}
        <div>
          <div
            style={{
              background: "#d9f1ff",
              color: "#1e3a8a",
              fontWeight: 600,
              fontSize: 18,
              padding: 6,
            }}
          >
            Bank Details
          </div>
          <p>Account name: JAES SOLUTIONS LTD</p>
          <p>Bank: NatWest Bank</p>
          <p>Sort Code: 60-10-05</p>
          <p>Account number: 84694467</p>
          <p>BIC: NWBKGB2L</p>
          <p>IBAN: GB47NWBK60100584694467</p>
        </div>
      </div>
    </div>
  );
}
