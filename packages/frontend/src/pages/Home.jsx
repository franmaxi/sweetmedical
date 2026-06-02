import { Layout } from "antd";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Especialidades from "../components/Especialidades";
import Medicos from "../components/Medicos";
import ReservaTurno from "../components/ReservaTurno";
import Footer from "../components/Footer";

const { Content } = Layout;

export default function Home() {
  return (
    <Layout style={{ background: "#fff" }}>
      <Navbar />
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
