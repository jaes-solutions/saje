import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type Invoice = {
  invoiceNumber: number;
  createdAt: string;
};

export default function InvoiceHome() {
  const navigate = useNavigate();
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);

  // Load recent invoices
  useEffect(() => {
    const loadInvoices = async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("invoice_number, created_at")
        .order("invoice_number", { ascending: false })
        .limit(10);

      if (!error && data) {
        setRecentInvoices(
          data.map((i: any) => ({
            invoiceNumber: i.invoice_number,
            createdAt: new Date(i.created_at).toLocaleString("en-GB"),
          })),
        );
      }
    };

    loadInvoices();
  }, []);

  const createNewInvoice = async () => {
    const stored = Number(localStorage.getItem("invoiceCounter"));
    const base = Number.isFinite(stored) && stored >= 9000 ? stored : 9000;
    const newNo = base + 1;
    localStorage.setItem("invoiceCounter", String(newNo));

    const { error } = await supabase
      .from("invoices")
      .upsert({ invoice_number: newNo }, { onConflict: "invoice_number" });

    if (error) {
      alert("Failed to create invoice");
      return;
    }

    // Create empty placeholder file in Storage → invoices folder
    const fileName = `Invoice-${newNo}.pdf`;
    const emptyFile = new Blob([""], { type: "application/pdf" });

    const { error: storageError } = await supabase.storage
      .from("invoices")
      .upload(fileName, emptyFile, {
        upsert: false,
        contentType: "application/pdf",
      });

    if (storageError) {
      console.warn("Invoice created but storage file failed:", storageError);
    }

    navigate(`/invoices/${newNo}`);
  };

  return (
    <div
      style={{
        padding: 32,
        marginLeft: 256,
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
      }}
    >
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32 }}>
        Invoices
      </h1>

      {/* Create Invoice Tile */}
      <div
        onClick={createNewInvoice}
        style={{
          width: 260,
          height: 150,
          border: "1px dashed rgba(255,255,255,0.25)",
          borderRadius: 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          marginBottom: 48,
          background: "rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ fontSize: 42, lineHeight: 1, color: "#fff" }}>＋</div>
        <div style={{ marginTop: 8, fontWeight: 600 }}>Create New Invoice</div>
      </div>

      {/* Recent Invoices */}
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>
        Recent Invoices
      </h2>

      {recentInvoices.length === 0 ? (
        <p>No invoices created yet.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            maxWidth: 600,
          }}
        >
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.08)" }}>
              <th style={th}>Invoice Number</th>
              <th style={th}>Created At</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentInvoices.map((i) => (
              <tr key={i.invoiceNumber}>
                <td style={td}>INV-{i.invoiceNumber}</td>
                <td style={td}>{i.createdAt}</td>
                <td style={td}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/invoices/${i.invoiceNumber}`);
                    }}
                    style={{
                      padding: "6px 12px",
                      border: "1px solid rgba(255,255,255,0.3)",
                      background: "rgba(255,255,255,0.08)",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th: React.CSSProperties = {
  borderBottom: "1px solid rgba(255,255,255,0.15)",
  padding: 10,
  textAlign: "left",
  color: "#ccc",
};

const td: React.CSSProperties = {
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  padding: 10,
};
