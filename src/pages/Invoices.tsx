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
     LOAD HISTORY (Q + I)
  ========================= */
  useEffect(() => {
    const loadHistory = async () => {
      const opts: HistoryOption[] = [];

      const { data: quotes } = await supabase
        .from("quotes")
        .select(
          "quote_number, vendor_name, vendor_address, vendor_phone, ship_to_name, ship_to_address, ship_to_phone",
        )
        .limit(20);

      quotes?.forEach((q: any) => {
        opts.push({
          label: `Q-${q.quote_number}`,
          vendor: {
            name: q.vendor_name || "",
            address: q.vendor_address || "",
            phone: q.vendor_phone || "",
          },
          shipTo: {
            name: q.ship_to_name || "",
            address: q.ship_to_address || "",
            phone: q.ship_to_phone || "",
          },
        });
      });

      const { data: invoices } = await supabase
        .from("invoices")
        .select(
          "invoice_number, vendor_name, vendor_address, vendor_phone, ship_to_name, ship_to_address, ship_to_phone",
        )
        .limit(20);

      invoices?.forEach((i: any) => {
        opts.push({
          label: `I-${i.invoice_number}`,
          vendor: {
            name: i.vendor_name || "",
            address: i.vendor_address || "",
            phone: i.vendor_phone || "",
          },
          shipTo: {
            name: i.ship_to_name || "",
            address: i.ship_to_address || "",
            phone: i.ship_to_phone || "",
          },
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
  return (
    <div style={{ background: "#000", padding: 24 }}>
      <style>{`
  .invoice-page {
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    position: relative;
  }

  .lb {
    background: #eaf2ff;
    color: #1f3a8a;
  }

  .editable {
    background: #ffffff;
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

  .invoice-page > * {
    position: relative;
    z-index: 1;
  }
`}</style>
      <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
        <button className="btn-lb">Download PDF</button>
        <button className="btn-lb" onClick={saveInvoice}>
          Save Invoice
        </button>
      </div>

      <div
        ref={pageRef}
        className="invoice-page"
        style={{
          width: 794,
          margin: "24px auto",
          background: "#fff",
          backgroundImage: "url('/assets/watermark.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "70%",
          padding: 32,
          overflow: "hidden",
        }}
      >
        {/* HEADER */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <div>
            <img src="/logo.png" alt="JAES" style={{ height: 48 }} />
            <p>
              <strong>JAES Solutions LTD</strong>
            </p>
            <p>Devonshire House,</p>
            <p>582 Honeypot Lane HA7 1JS Stanmore UK</p>
            <p>Phone: 01279 213707</p>
            <p>Email: info@jaessolutions.com</p>
          </div>

          <div style={{ textAlign: "right" }}>
            <h2 style={{ color: "#4c5d8a" }}>INVOICE</h2>
            <p>
              <strong>Date:</strong> {new Date().toLocaleDateString()}
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
            <p
              style={{
                background: "#eaf2ff",
                color: "#1f3a8a",
                padding: 6,
                display: "inline-block",
                borderRadius: 6,
                fontWeight: 600,
              }}
            >
              INV: I-{invoiceNumber}
            </p>
          </div>
        </div>

        <hr />

        {/* VENDOR / SHIP TO */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <div>
            <div
              style={{ background: "#eaf2ff", color: "#1f3a8a", padding: 6 }}
            >
              VENDOR
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
              style={{ width: "100%", minHeight: 120, background: "#ffffff" }}
              className="editable"
            />
          </div>

          <div>
            <div
              style={{ background: "#eaf2ff", color: "#1f3a8a", padding: 6 }}
            >
              SHIP TO
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
              style={{ width: "100%", minHeight: 120, background: "#ffffff" }}
              className="editable"
            />
          </div>
        </div>

        <br />

        {/* ITEMS TABLE */}
        <table
          border={1}
          cellPadding={6}
          style={{
            borderCollapse: "collapse",
            tableLayout: "fixed",
            width: "100%",
          }}
        >
          <thead style={{ background: "#eaf2ff", color: "#1f3a8a" }}>
            <tr>
              <th style={{ width: "15%" }}>ITEM</th>
              <th style={{ width: "35%" }}>DESCRIPTION</th>
              <th style={{ width: "10%" }}>QTY</th>
              <th style={{ width: "20%" }}>UNIT PRICE</th>
              <th style={{ width: "20%" }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => (
              <tr key={idx} style={{ background: "#ffffff" }}>
                <td>
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
                <td>
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
                <td>
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
                <td>
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
                <td style={{ textAlign: "right", fontWeight: 500 }}>
                  {(it.qty * it.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={() =>
            setItems([
              ...items,
              { item: "", description: "", qty: 1, price: 0 },
            ])
          }
        >
          + Add Item
        </button>

        <br />
        <br />

        {/* TOTALS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            columnGap: 16,
            rowGap: 16,
          }}
        >
          <div>
            <div
              style={{ background: "#eaf2ff", color: "#1f3a8a", padding: 6 }}
            >
              Comments or Special Instructions
            </div>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              style={{ width: "100%" }}
              className="editable"
            />
          </div>

          <div>
            <table width="100%" border={1} cellPadding={6}>
              <tbody>
                <tr>
                  <td>Subtotal</td>
                  <td>{subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>VAT</td>
                  <td>
                    <input
                      type="number"
                      value={vat}
                      onChange={(e) =>
                        setVat(Math.max(0, Number(e.target.value)))
                      }
                      min={0}
                      style={{ background: "#ffffff", width: "100%" }}
                      className="editable"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Shipping</td>
                  <td>
                    <input
                      type="number"
                      value={shipping}
                      onChange={(e) =>
                        setShipping(Math.max(0, Number(e.target.value)))
                      }
                      min={0}
                      style={{ background: "#ffffff", width: "100%" }}
                      className="editable"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Other</td>
                  <td>
                    <input
                      type="number"
                      value={other}
                      onChange={(e) =>
                        setOther(Math.max(0, Number(e.target.value)))
                      }
                      min={0}
                      style={{ background: "#ffffff", width: "100%" }}
                      className="editable"
                    />
                  </td>
                </tr>
                <tr style={{ fontWeight: "bold", background: "#d9d9d9" }}>
                  <td>TOTAL {currency}</td>
                  <td>{(subtotal + vat + shipping + other).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <br />

        {/* BANK DETAILS */}
        <div>
          <div style={{ background: "#eaf2ff", color: "#1f3a8a", padding: 6 }}>
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
