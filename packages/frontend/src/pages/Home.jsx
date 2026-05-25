import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Especialidades from "../components/Especialidades";
import Medicos from "../components/Medicos";
import ReservaTurno from "../components/ReservaTurno";
import Footer from "../components/Footer";

export default function Home({ onNavigate }) {
  return (
    <>
      <Navbar onNavigate={onNavigate} current="home" />
      <Hero onNavigate={onNavigate} />
      <Especialidades />
      <Medicos />
      <ReservaTurno />
      <Footer />
    </>
  );
}
