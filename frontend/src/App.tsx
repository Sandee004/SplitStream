import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SplashPage from "./components/merchants/splash";
import Setup from "./components/merchants/setup";
import DashboardPage from "./components/merchants/dashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}
