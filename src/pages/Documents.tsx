import {
  FileSignature,
  FileText,
  FileArchive,
  FileSpreadsheet,
  FileInput,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Documents() {
  const [recentDocs, setRecentDocs] = useState<
    { id: string; type: string; number: number; created_at: string }[]
  >([]);
  const navigate = useNavigate();
  const items = [
    { label: "Quotation", path: "/quotes" },
    { label: "Invoice", path: "/invoice" },
    { label: "Delivery Note", path: "/delivery" },
    { label: "Proforma Invoice", path: "/proforma-invoice" },
    { label: "Purchase Order", path: "/purchase-order" },
  ];

  const icons = [
    <FileSignature size={64} />,
    <FileText size={64} />,
    <FileArchive size={64} />,
    <FileSpreadsheet size={64} />,
    <FileInput size={64} />,
  ];

  useEffect(() => {
    const fetchRecentDocuments = async () => {
      const queries = await Promise.all([
        supabase
          .from("quotes")
          .select("id, quote_number, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("invoices")
          .select("id, invoice_number, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const [quotes, invoices] = queries;

      const normalized = [
        ...(quotes.data || []).map((q) => ({
          id: q.id,
          number: q.quote_number,
          type: "Quotation",
          created_at: q.created_at,
        })),
        ...(invoices.data || []).map((i) => ({
          id: i.id,
          number: i.invoice_number,
          type: "Invoice",
          created_at: i.created_at,
        })),
      ];

      normalized.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      setRecentDocs(normalized.slice(0, 6));
    };

    fetchRecentDocuments();
  }, []);

  return (
    <div className="flex-1 p-10 overflow-auto bg-black text-white relative ml-64">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_60%)]"></div>
      <h1 className="relative text-4xl font-extrabold mb-12 tracking-tight">
        Documents
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {items.map((item, i) => (
          <div
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center group cursor-pointer"
            key={item.label}
          >
            {/* Card */}
            <div
              className="w-48 h-48 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl
                            flex items-center justify-center
                            group-hover:scale-105 group-hover:bg-white/10 transition-all duration-300"
            >
              <div className="text-gray-400 group-hover:text-white transition">
                {icons[i]}
              </div>
            </div>

            {/* Label */}
            <p className="mt-4 text-lg font-semibold text-gray-200 group-hover:text-white transition">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="mt-16 border-t border-white/10"></div>

      {/* Recent Documents */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-100 mb-6">
          Recent Documents
        </h2>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-4">
          {recentDocs.length === 0 ? (
            <p className="text-gray-400 text-sm">
              You haven’t created any documents yet.
            </p>
          ) : (
            recentDocs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between text-sm text-gray-200"
              >
                <div>
                  <p className="font-medium">
                    {doc.type} #{doc.number}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {new Date(doc.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
          <h3 className="text-lg font-semibold text-gray-100 mb-2">
            Quick Tip
          </h3>
          <p className="text-gray-400 text-sm">
            Use saved clients to generate invoices faster and avoid re‑entering
            details every time.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
          <h3 className="text-lg font-semibold text-gray-100 mb-2">
            Did You Know?
          </h3>
          <p className="text-gray-400 text-sm">
            Proforma invoices help clients approve costs before final billing.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Documents;
