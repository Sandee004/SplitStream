import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SplashPage from "./components/merchants/splash";
import Setup from "./components/merchants/setup";
import DashboardPage from "./components/merchants/dashboard";
import SettingsPage from "./components/merchants/settings";
import LoginPage from "./components/merchants/login";
import ActiveStreams from "./components/merchants/active-streams";
import DashboardLayout from "./components/merchants/dashboard-layout";
import History from "./components/merchants/history";
import Storefront from "./components/users/storefront";

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

        <Route path="/store/:slug" element={<Storefront />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

function NotFoundPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#f5f5f5] text-[#1a3a2a]">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl mt-4">Page not found</p>
      <a
        href="/dashboard"
        className="mt-6 px-4 py-2 bg-[#1a3a2a] text-[#a8e6cf] rounded"
      >
        Go Back Home
      </a>
    </div>
  );
}
