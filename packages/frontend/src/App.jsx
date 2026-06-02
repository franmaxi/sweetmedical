import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, App as AntApp } from "antd";
import esES from "antd/locale/es_ES";
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
  return (
    <ConfigProvider locale={esES} theme={theme}>
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
