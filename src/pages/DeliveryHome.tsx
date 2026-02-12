import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type DeliveryNote = {
  deliveryNoteNumber: number;
  createdAt: string;
};

export default function DeliveryHome() {
  const navigate = useNavigate();
  const [recentNotes, setRecentNotes] = useState<DeliveryNote[]>([]);

  const formatDeliveryNoteNumber = (num: number) => {
    const year = new Date().getFullYear().toString().slice(-2);
    return `${year}-DN-${String(num).padStart(6, "0")}`;
  };

  // Load recent delivery notes
  useEffect(() => {
    const loadNotes = async () => {
      const { data, error } = await supabase
        .from("delivery_notes")
        .select("delivery_note_number, created_at")
        .order("delivery_note_number", { ascending: false })
        .limit(10);

      if (error) {
        console.error("DeliveryHome Supabase error:", error);
        setRecentNotes([]);
        return;
      }

      if (data) {
        setRecentNotes(
          data.map((n: any) => ({
            deliveryNoteNumber: n.delivery_note_number,
            createdAt: n.created_at
              ? new Date(n.created_at).toLocaleString("en-GB")
              : "—",
          })),
        );
      }
    };

    loadNotes();
  }, []);

  const createNewDeliveryNote = async () => {
    const stored = Number(localStorage.getItem("deliveryNoteCounter"));
    const base = Number.isFinite(stored) && stored >= 3000 ? stored : 3000;
    const newNo = base + 1;
    localStorage.setItem("deliveryNoteCounter", String(newNo));

    const { error } = await supabase.from("delivery_notes").insert({
      delivery_note_number: newNo,
      items: [],
    });

    if (error) {
      alert("Failed to create delivery note");
      return;
    }

    navigate("/delivery/new");
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
        Delivery Notes
      </h1>

      {/* Create Delivery Note Tile */}
      <div
        onClick={createNewDeliveryNote}
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
          Create New Delivery Note
        </div>
      </div>

      {/* Recent Delivery Notes */}
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>
        Recent Delivery Notes
      </h2>

      {recentNotes.length === 0 ? (
        <p>No delivery notes created yet.</p>
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
              <th style={th}>Delivery Note Number</th>
              <th style={th}>Created At</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentNotes.map((n) => (
              <tr key={n.deliveryNoteNumber}>
                <td style={td}>
                  {formatDeliveryNoteNumber(n.deliveryNoteNumber)}
                </td>
                <td style={td}>{n.createdAt}</td>
                <td style={td}>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();

                      const fileName = `DeliveryNote-${n.deliveryNoteNumber}.pdf`;

                      const { data, error } = await supabase.storage
                        .from("delivery-notes-pdf")
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
                      navigate(`/delivery/${n.deliveryNoteNumber}`);
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
