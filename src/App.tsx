import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
  import Register from "./pages/Signup";
import EventsPage from "./pages/EventsPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import CreateEventPage from "./pages/CreateEventPage";
import MyEventsPage from "./pages/MyEventsPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Register />} />
      <Route path="/eventos" element={<EventsPage />} />
      <Route path="/eventos/:id" element={<EventDetailsPage />} />j
      <Route path="/criar-evento" element={<CreateEventPage />} />
      <Route path="/meus-eventos" element={<MyEventsPage />} />
      <Route path="/opcoes" element={<SettingsPage />} />
    </Routes>
  );
}

export default App;
