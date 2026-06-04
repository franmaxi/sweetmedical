import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, App as AntApp } from "antd";
import esES from "antd/locale/es_ES";
import enUS from "antd/locale/en_US";
import { useTranslation } from "react-i18next";
import Home from "./pages/Home";
import BuscarTurnos from "./pages/BuscarTurnos";
import MisTurnos from "./pages/MisTurnos";
import AgendaMedico from "./pages/AgendaMedico";
import Disponibilidades from "./pages/Disponibilidades";

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
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/buscar" element={<BuscarTurnos />} />
            <Route path="/mis-turnos" element={<MisTurnos />} />
            <Route path="/agenda" element={<AgendaMedico />} />
            <Route path="/disponibilidades" element={<Disponibilidades />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
