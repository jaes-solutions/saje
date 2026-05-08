import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Documents from "./pages/Documents";
import Quotations from "./pages/Quotations";
import QuoteHome from "./pages/QuoteHome";
import QuoteView from "./pages/QuoteView";
import InvoiceHome from "./pages/InvoiceHome";
import Invoices from "./pages/Invoices";
import DeliveryHome from "./pages/DeliveryHome";
import DeliveryNotes from "./pages/DeliveryNotes";
import ProformaInvoice from "./pages/ProformaInvoice";
import PurchaseOrder from "./pages/PurchaseOrder";
import ProtectedRoute from "./pages/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Home Page */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Dashboard Layout (Protected after login later) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div
                className="app-layout"
                style={{ display: "flex", height: "100vh" }}
              >
                <Sidebar />
                <div style={{ flex: 1 }}>
                  <Navbar />
                  <Dashboard />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <div
                className="app-layout"
                style={{ display: "flex", height: "100vh" }}
              >
                <Sidebar />
                <div style={{ flex: 1 }}>
                  <Navbar />
                  <Documents />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotes"
          element={
            <ProtectedRoute>
              <div
                className="app-layout"
                style={{ display: "flex", height: "100vh" }}
              >
                <Sidebar />
                <div style={{ flex: 1 }}>
                  <Navbar />
                  <QuoteHome />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery"
          element={
            <ProtectedRoute>
              <div
                className="app-layout"
                style={{ display: "flex", height: "100vh" }}
              >
                <Sidebar />
                <div style={{ flex: 1 }}>
                  <Navbar />
                  <DeliveryHome />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery/new"
          element={
            <ProtectedRoute>
              <div
                className="app-layout"
                style={{ display: "flex", height: "100vh" }}
              >
                <Sidebar />
                <div style={{ flex: 1 }}>
                  <Navbar />
                  <DeliveryNotes />
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/delivery/:deliveryNoteNumber"
          element={
            <ProtectedRoute>
              <div
                className="app-layout"
                style={{ display: "flex", height: "100vh" }}
              >
                <Sidebar />
                <div style={{ flex: 1 }}>
                  <Navbar />
                  <DeliveryNotes />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoice"
          element={
            <ProtectedRoute>
              <div
                className="app-layout"
                style={{ display: "flex", height: "100vh" }}
              >
                <Sidebar />
                <div style={{ flex: 1 }}>
                  <Navbar />
                  <InvoiceHome />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotation"
          element={
            <ProtectedRoute>
              <div
                className="app-layout"
                style={{ display: "flex", height: "100vh" }}
              >
                <Sidebar />
                <div style={{ flex: 1 }}>
                  <Navbar />
                  <Quotations />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotations/:quoteNumber"
          element={
            <ProtectedRoute>
              <div
                className="app-layout"
                style={{ display: "flex", height: "100vh" }}
              >
                <Sidebar />
                <div style={{ flex: 1 }}>
                  <Navbar />
                  <Quotations />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices/:invoiceNumber"
          element={
            <ProtectedRoute>
              <div
                className="app-layout"
                style={{ display: "flex", height: "100vh" }}
              >
                <Sidebar />
                <div style={{ flex: 1 }}>
                  <Navbar />
                  <Invoices />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/proforma"
          element={
            <ProtectedRoute>
              <div
                className="app-layout"
                style={{ display: "flex", height: "100vh" }}
              >
                <Sidebar />
                <div style={{ flex: 1 }}>
                  <Navbar />
                  <ProformaInvoice />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/proforma/:proformaNumber"
          element={
            <ProtectedRoute>
              <div
                className="app-layout"
                style={{ display: "flex", height: "100vh" }}
              >
                <Sidebar />
                <div style={{ flex: 1 }}>
                  <Navbar />
                  <ProformaInvoice />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase-order"
          element={
            <ProtectedRoute>
              <div
                className="app-layout"
                style={{ display: "flex", height: "100vh" }}
              >
                <Sidebar />
                <div style={{ flex: 1 }}>
                  <Navbar />
                  <PurchaseOrder />
                </div>
              </div>
            </ProtectedRoute>
          }
        />

        <Route
          path="/purchase-order/:poNumber"
          element={
            <ProtectedRoute>
              <div
                className="app-layout"
                style={{ display: "flex", height: "100vh" }}
              >
                <Sidebar />
                <div style={{ flex: 1 }}>
                  <Navbar />
                  <PurchaseOrder />
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotes/view/:quoteNumber"
          element={
            <ProtectedRoute>
              <QuoteView />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
