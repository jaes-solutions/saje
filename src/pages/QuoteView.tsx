import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type QuoteItem = {
  qty: number;
  desc: string;
  unit: number;
};

type Quote = {
  quote_number: number;
  items: QuoteItem[];
  vat_percent: number;
  sales_consultant: string;
  valid_until: string | null;
  created_at: string;
};

export default function QuoteView() {
  const { quoteNumber } = useParams<{ quoteNumber: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    if (!quoteNumber) return;

    const loadQuote = async () => {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("quote_number", Number(quoteNumber))
        .single();

      if (error) {
        console.error(error);
        return;
      }

      const normalizedQuote = {
        ...data,
        items: Array.isArray(data.items)
          ? data.items
          : JSON.parse(data.items ?? "[]"),
      };

      setQuote(normalizedQuote);
    };

    loadQuote();
  }, [quoteNumber]);

  if (!quote) return <p>Loading…</p>;

  return (
    <div style={{ padding: 24, background: "#eef7f5" }}>
      <div
        style={{
          width: "210mm",
          background: "#ffffff",
          padding: "20mm",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 12,
          color: "#000",
          margin: "0 auto",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: 20 }}>
          QUOTATION – QT-{quote.quote_number}
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            rowGap: 8,
            marginBottom: 16,
          }}
        >
          <div>
            <strong>Sales Consultant:</strong> {quote.sales_consultant || "—"}
          </div>
          <div>
            <strong>Valid Until:</strong> {quote.valid_until || "—"}
          </div>
          <div>
            <strong>VAT:</strong> {quote.vat_percent}%
          </div>
        </div>

        <h3>Items</h3>
        <table
          style={{ borderCollapse: "collapse", width: "100%", marginTop: 12 }}
        >
          <thead>
            <tr>
              <th style={th}>Qty</th>
              <th style={th}>Description</th>
              <th style={th}>Unit Price</th>
              <th style={th}>Total</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((i, idx) => (
              <tr key={idx}>
                <td style={td}>{i.qty}</td>
                <td style={td}>{i.desc}</td>
                <td style={td}>{i.unit}</td>
                <td style={td}>{i.qty * i.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div
          style={{
            marginTop: 24,
            display: "flex",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: "6px 12px",
              background: "#d0f0ea",
              border: "1px solid #4bb3a7",
              cursor: "pointer",
            }}
          >
            Back
          </button>

          <button
            onClick={() => navigate(`/quotations/${quote.quote_number}`)}
            style={{
              padding: "6px 12px",
              background: "#4bb3a7",
              color: "#000",
              border: "1px solid #4bb3a7",
              cursor: "pointer",
            }}
          >
            Edit Quote
          </button>
        </div>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  border: "1px solid #333",
  padding: 6,
  background: "#e6f6ee",
  textAlign: "left",
};

const td: React.CSSProperties = {
  border: "1px solid #333",
  padding: 6,
};
