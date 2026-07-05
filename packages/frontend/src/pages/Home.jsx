import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Layout } from "antd";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Especialidades from "../components/Especialidades";
import Medicos from "../components/Medicos";
import ReservaTurno from "../components/ReservaTurno";
import Footer from "../components/Footer";

const { Content } = Layout;

export default function Home({ darkMode, setDarkMode }) {
  const { state } = useLocation();

  // Permite que enlaces (ej. del footer) naveguen a una sección de la home.
  useEffect(() => {
    if (!state?.scrollTo) return;
    const el = document.getElementById(state.scrollTo);
    if (el) {
      // Esperamos un frame para que la sección ya esté montada.
      requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth" }));
    }
  }, [state]);

  return (
    <Layout style={{ background: "#fff" }}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <Content>
        <Hero />
        <Especialidades />
        <Medicos />
        <ReservaTurno />
      </Content>
      <Footer />
    </Layout>
  );
}
