import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, App as AntApp } from "antd";
import esES from "antd/locale/es_ES";
import enUS from "antd/locale/en_US";
import { useTranslation } from "react-i18next";
import { AuthProvider, RequireRole } from "./context/AuthContext";
import Home from "./pages/Home";
<<<<<<< HEAD
import BuscarTurnos from "./pages/Usuario/BuscarTurnos";
import MisTurnos from "./pages/Usuario/MisTurnos";
import AgendaMedico from "./pages/Medico/AgendaMedico";
import Disponibilidades from "./pages/Medico/Disponibilidades";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
=======
import BuscarTurnos from "./pages/BuscarTurnos";
import MisTurnos from "./pages/MisTurnos";
import AgendaMedico from "./pages/AgendaMedico";
import Disponibilidades from "./pages/Disponibilidades";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import MisEspecialidades from "./pages/MisEspecialidades";
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b

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
<<<<<<< HEAD
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />

              <Route element={<RequireRole role="usuario" />}>
                <Route path="/buscar" element={<BuscarTurnos />} />
                <Route path="/mis-turnos" element={<MisTurnos />} />
              </Route>

              <Route element={<RequireRole role="medico" />}>
                <Route path="/agenda" element={<AgendaMedico />} />
                <Route path="/disponibilidades" element={<Disponibilidades />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
=======
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/buscar" element={<BuscarTurnos />} />
            <Route path="/mis-turnos" element={<MisTurnos />} />
            <Route path="/agenda" element={<AgendaMedico />} />
            <Route path="/disponibilidades" element={<Disponibilidades />} />
            <Route path="/mis-especialidades" element={<MisEspecialidades />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
