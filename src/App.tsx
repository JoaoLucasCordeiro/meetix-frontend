import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
  import Register from "./pages/Signup";
import EventsPage from "./pages/EventsPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import CreateEventPage from "./pages/CreateEventPage";
import MyEventsPage from "./pages/MyEventsPage";
import SettingsPage from "./pages/SettingsPage";
import EventManagePage from "./pages/EventManagePage";
import CheckoutPage from "./pages/CheckoutPage";
import MyTicketOrdersPage from "./pages/MyTicketOrdersPage";
import MyTicketsPage from "./pages/MyTicketsPage";
import CheckInScannerPage from "./pages/CheckInScannerPage";
import FeedbackFormPage from "./pages/FeedbackFormPage";
import NotificationsPage from "./pages/NotificationsPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/eventos" element={<EventsPage />} />
        <Route path="/eventos/:id" element={<EventDetailsPage />} />
        <Route path="/eventos/:id/gerenciar" element={<EventManagePage />} />
        <Route path="/eventos/:eventId/check-in" element={<CheckInScannerPage />} />
        <Route path="/eventos/:eventId/feedback" element={<FeedbackFormPage />} />
        <Route path="/notificacoes" element={<NotificationsPage />} />
        <Route path="/criar-evento" element={<CreateEventPage />} />
        <Route path="/meus-eventos" element={<MyEventsPage />} />
        <Route path="/checkout/:eventId" element={<CheckoutPage />} />
        <Route path="/meus-pedidos" element={<MyTicketOrdersPage />} />
        <Route path="/meus-ingressos" element={<MyTicketsPage />} />
        <Route path="/opcoes" element={<SettingsPage />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthProvider>
  );
}

export default App;
