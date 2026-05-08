import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type ProFormaInvoice = {
  proFormaInvoiceNumber: number;
  createdAt: string;
};

export default function ProFormaHome() {
  const navigate = useNavigate();
  const [recentInvoices, setRecentInvoices] = useState<ProFormaInvoice[]>([]);

  const formatProFormaNumber = (num: number) => {
    const year = new Date().getFullYear().toString().slice(-2);
    return `${year}-PF-${String(num).padStart(6, "0")}`;
  };

  // Load recent pro forma invoices
  useEffect(() => {
    const loadInvoices = async () => {
      const { data, error } = await supabase
        .from("proforma_invoices")
        .select("proforma_invoice_number, created_at")
        .order("proforma_invoice_number", { ascending: false })
        .limit(10);

      if (error) {
        console.error("ProFormaHome Supabase error:", error);
        setRecentInvoices([]);
        return;
      }

      if (data) {
        setRecentInvoices(
          data.map((n: any) => ({
            proFormaInvoiceNumber: n.proforma_invoice_number,
            createdAt: n.created_at
              ? new Date(n.created_at).toLocaleString("en-GB")
              : "—",
          })),
        );
      }
    };

    loadInvoices();
  }, []);

  const createNewProForma = async () => {
    const stored = Number(localStorage.getItem("proFormaCounter"));
    const base = Number.isFinite(stored) && stored >= 4000 ? stored : 4000;
    const newNo = base + 1;
    localStorage.setItem("proFormaCounter", String(newNo));

    const { error } = await supabase.from("proforma_invoices").insert({
      proforma_invoice_number: newNo,
      items: [],
    });

    if (error) {
      alert("Failed to create pro forma invoice");
      return;
    }

    navigate("/proforma/new");
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
        Pro Forma Invoices
      </h1>

      {/* Create Pro Forma Tile */}
      <div
        onClick={createNewProForma}
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
        <div style={{ marginTop: 8, fontWeight: 600 }}>
          Create New Pro Forma Invoice
        </div>
      </div>

      {/* Recent Pro Forma Invoices */}
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>
        Recent Pro Forma Invoices
      </h2>

      {recentInvoices.length === 0 ? (
        <p>No pro forma invoices created yet.</p>
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
              <th style={th}>Pro Forma Number</th>
              <th style={th}>Created At</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentInvoices.map((n) => (
              <tr key={n.proFormaInvoiceNumber}>
                <td style={td}>
                  {formatProFormaNumber(n.proFormaInvoiceNumber)}
                </td>
                <td style={td}>{n.createdAt}</td>
                <td style={td}>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();

                      const fileName = `ProForma-${n.proFormaInvoiceNumber}.pdf`;

                      const { data, error } = await supabase.storage
                        .from("proforma-invoices-pdf")
                        .createSignedUrl(fileName, 60 * 5);

                      if (error || !data?.signedUrl) {
                        alert("PDF not found. Please generate the PDF first.");
                        return;
                      }

                      window.open(data.signedUrl, "_blank");
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

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/proforma/${n.proFormaInvoiceNumber}`);
                    }}
                    style={{
                      padding: "6px 12px",
                      border: "1px solid rgba(255,255,255,0.3)",
                      background: "#000",
                      color: "#fff",
                      cursor: "pointer",
                      marginLeft: 8,
                    }}
                  >
                    Edit
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