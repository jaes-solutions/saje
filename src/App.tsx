import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "/Users/sangeethaluke/invoicer/src/components/Navbar.tsx";
import Sidebar from "/Users/sangeethaluke/invoicer/src/components/Sidebar.tsx";
import Dashboard from "/Users/sangeethaluke/invoicer/src/pages/Dashboard.tsx";
import Home from "/Users/sangeethaluke/invoicer/src/pages/Home.tsx";
import Documents from "/Users/sangeethaluke/invoicer/src/pages/Documents.tsx";
import Quotations from "/Users/sangeethaluke/invoicer/src/pages/Quotations.tsx";
import QuoteHome from "/Users/sangeethaluke/invoicer/src/pages/QuoteHome.tsx";
import QuoteView from "./pages/QuoteView";

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
        <Route path="/quotes/view/:quoteNumber" element={<QuoteView />} />
      </Routes>
    </Router>
  );
}

export default App;
