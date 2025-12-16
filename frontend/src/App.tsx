import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SplashPage from "./components/merchants/splash";
import Setup from "./components/merchants/setup";
import DashboardPage from "./components/merchants/dashboard";
import SettingsPage from "./components/merchants/settings";
import LoginPage from "./components/merchants/login";
import ActiveStreams from "./components/merchants/active-streams";
import DashboardLayout from "./components/merchants/dashboard-layout";
import History from "./components/merchants/history";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ALL DASHBOARD PAGES inside the layout */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="streams" element={<ActiveStreams />} />
          <Route path="history" element={<History />} />
        </Route>
      </Routes>
    </Router>
  );
}
