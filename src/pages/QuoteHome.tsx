import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type Quote = {
  quoteNumber: number;
  createdAt: string;
};

export default function QuoteHome() {
  const navigate = useNavigate();
  const [recentQuotes, setRecentQuotes] = useState<Quote[]>([]);

  // Load recent quotes
  useEffect(() => {
    const loadQuotes = async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("quote_number, created_at")
        .order("quote_number", { ascending: false })
        .limit(10);

      if (!error && data) {
        setRecentQuotes(
          data.map((q: any) => ({
            quoteNumber: q.quote_number,
            createdAt: new Date(q.created_at).toLocaleString("en-GB"),
          })),
        );
      }
    };

    loadQuotes();
  }, []);

  const createNewQuote = async () => {
    const stored = Number(localStorage.getItem("quoteCounter"));
    const base = Number.isFinite(stored) && stored >= 7000 ? stored : 7000;
    const newNo = base + 1;
    localStorage.setItem("quoteCounter", String(newNo));

    const { error } = await supabase.from("quotes").insert({
      quote_number: newNo,
      items: [],
      vat_percent: 0,
      sales_consultant: "",
      valid_until: null,
    });

    if (error) {
      alert("Failed to create quote");
      return;
    }

    navigate(`/quotations/${newNo}`);
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
        Quotations
      </h1>

      {/* Create Quote Tile */}
      <div
        onClick={createNewQuote}
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
        <div style={{ marginTop: 8, fontWeight: 600 }}>Create New Quote</div>
      </div>

      {/* Recent Quotes */}
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>
        Recent Quotes
      </h2>

      {recentQuotes.length === 0 ? (
        <p>No quotes created yet.</p>
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
              <th style={th}>Quote Number</th>
              <th style={th}>Created At</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentQuotes.map((q) => (
              <tr key={q.quoteNumber}>
                <td style={td}>QT-{q.quoteNumber}</td>
                <td style={td}>{q.createdAt}</td>
                <td style={td}>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();

                      const fileName = `Quotation-${q.quoteNumber}.pdf`;

                      const { data, error } = await supabase.storage
                        .from("quotes-pdf")
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
                      navigate(`/quotations/${q.quoteNumber}`);
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
