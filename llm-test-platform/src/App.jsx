import { Routes, Route } from "react-router-dom";
import RequirementsPage from "./pages/RequirementsPage";
import RequirementDetailsPage from "./pages/RequirementDetailsPage";
import StatisticsPage from "./pages/StatisticsPage";
import StatusWidget from "./components/StatusWidget";
import DeletedRequirementsPage from "./pages/DeletedRequirementsPage";
import FirefoxPage from "./pages/FirefoxPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<RequirementsPage />} />
        <Route path="/requirements/:id" element={<RequirementDetailsPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/trash" element={<DeletedRequirementsPage />} />
        <Route path="/firefox" element={<FirefoxPage />} />
      </Routes>

      <StatusWidget />
    </>
  );
}

export default App;
