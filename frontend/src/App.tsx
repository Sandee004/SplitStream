import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SplashPage from "./components/merchants/splash";
import Setup from "./components/merchants/setup";
import DashboardPage from "./components/merchants/dashboard";
import SettingsPage from "./components/merchants/settings";
import LoginPage from "./components/merchants/login";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
}
