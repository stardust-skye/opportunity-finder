import { Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer.jsx";
import Navbar from "./components/Navbar.jsx";
import ExplorePage from "./pages/ExplorePage.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import OpportunityDetailsPage from "./pages/OpportunityDetailsPage.jsx";
import OpportunityFormPage from "./pages/OpportunityFormPage.jsx";
import ProfessorDashboardPage from "./pages/ProfessorDashboardPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

function App() {
  const { pathname } = useLocation();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Navbar />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/opportunities" element={<ExplorePage />} />
          <Route path="/opportunities/:id" element={<OpportunityDetailsPage />} />
          <Route path="/professor/dashboard" element={<ProfessorDashboardPage />} />
          <Route path="/professor/opportunities/new" element={<OpportunityFormPage />} />
          <Route path="/professor/opportunities/:id/edit" element={<OpportunityFormPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

export default App;
