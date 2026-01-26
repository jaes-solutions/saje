import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Documents from "./pages/Documents";
import Quotations from "./pages/Quotations";
import QuoteHome from "./pages/QuoteHome";
import QuoteView from "./pages/QuoteView";
import InvoiceHome from "./pages/InvoiceHome";
import Invoices from "./pages/Invoices";

import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Home Page */}
        <Route path="/" element={<Home />} />

        {/* Dashboard Layout (Protected after login later) */}
        <Route
          path="/dashboard"
          element={
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
          }
        />
        <Route
          path="/documents"
          element={
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
          }
        />
        <Route
          path="/quotes"
          element={
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
          }
        />
        <Route
          path="/invoice"
          element={
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
          }
        />
        <Route
          path="/quotation"
          element={
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
          }
        />
        <Route
          path="/quotations/:quoteNumber"
          element={
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
          }
        />
        <Route
          path="/invoices/:invoiceNumber"
          element={
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
          }
        />
        <Route path="/quotes/view/:quoteNumber" element={<QuoteView />} />
      </Routes>
    </Router>
  );
}

export default App;
