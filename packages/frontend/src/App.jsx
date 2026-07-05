import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, App as AntApp } from "antd";
import esES from "antd/locale/es_ES";
import enUS from "antd/locale/en_US";
import { useTranslation } from "react-i18next";
import { AuthProvider, RequireRole, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import BuscarTurnos from "./pages/Usuario/BuscarTurnos";
import MisTurnos from "./pages/Usuario/MisTurnos";
import AgendaMedico from "./pages/Medico/AgendaMedico";
import Disponibilidades from "./pages/Medico/Disponibilidades";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import MisServicios from "./pages/Medico/MisServicios";
import MisSedes from "./pages/Medico/MisSedes";
import AdminPanel from "./pages/Admin/AdminPanel";
import MiPerfil from "./pages/MiPerfil";
import Notificaciones from "./pages/Notificaciones";

const theme = {
  token: {
    colorPrimary: "#be123c",
    colorLink: "#be123c",
    colorLinkHover: "#9f1239",
    borderRadius: 10,
    fontFamily:
      '"Inter", system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  },
};

// El admin no ve la página de inicio: al entrar a "/" va directo al panel.
function HomeRoute() {
  const { user } = useAuth();
  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  return <Home />;
}

function App() {
  const { i18n } = useTranslation();
  const localeMap = {
    es: esES,
    en: enUS,
  };
  const idioma = localeMap[i18n.language] ?? esES;

  

  return (
    <ConfigProvider locale={idioma} theme={theme}>
      <AntApp>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomeRoute />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/mi-perfil" element={<MiPerfil />} />
              <Route path="/notificaciones" element={<Notificaciones />} />

              <Route element={<RequireRole role="usuario" />}>
                <Route path="/buscar" element={<BuscarTurnos />} />
                <Route path="/mis-turnos" element={<MisTurnos />} />
              </Route>

              <Route element={<RequireRole role="medico" />}>
                <Route path="/agenda" element={<AgendaMedico />} />
                <Route path="/disponibilidades" element={<Disponibilidades />} />
                <Route path="/mis-sedes" element={<MisSedes />} />
                <Route path="mis-servicios" element={<MisServicios />} />
              </Route>

              <Route element={<RequireRole role="admin" />}>
                <Route path="/admin" element={<AdminPanel />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
