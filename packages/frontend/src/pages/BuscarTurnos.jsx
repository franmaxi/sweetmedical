import { useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const turnosMock = [
  { id: 1, medico: "Dra. Rebecca Rose", especialidad: "Ginecología", sede: "Sede Centro", fecha: "2026-05-26", hora: "09:00", obraSocial: "OSDE" },
  { id: 2, medico: "Dr. Bella Carol", especialidad: "Obstetricia", sede: "Sede Norte", fecha: "2026-05-26", hora: "10:30", obraSocial: "Swiss Medical" },
  { id: 3, medico: "Dra. Kimberly López", especialidad: "Neurología", sede: "Sede Sur", fecha: "2026-05-27", hora: "11:00", obraSocial: "Galeno" },
  { id: 4, medico: "Dr. Lauren Leah", especialidad: "Oncología", sede: "Sede Centro", fecha: "2026-05-27", hora: "14:00", obraSocial: "OSDE" },
  { id: 5, medico: "Dra. Stephanie Sue", especialidad: "Hematología", sede: "Sede Norte", fecha: "2026-05-28", hora: "15:30", obraSocial: "Medicus" },
  { id: 6, medico: "Dra. Penelope Cruz", especialidad: "Fisioterapia", sede: "Sede Centro", fecha: "2026-05-28", hora: "16:00", obraSocial: "OSDE" },
  { id: 7, medico: "Dra. Alexandra Pérez", especialidad: "Gastroenterología", sede: "Sede Sur", fecha: "2026-05-29", hora: "08:30", obraSocial: "Galeno" },
  { id: 8, medico: "Dra. Jessica Joan", especialidad: "Nefrología", sede: "Sede Centro", fecha: "2026-05-29", hora: "12:00", obraSocial: "Swiss Medical" },
  { id: 9, medico: "Dra. Rebecca Rose", especialidad: "Ginecología", sede: "Sede Centro", fecha: "2026-05-30", hora: "10:00", obraSocial: "OSDE" },
  { id: 10, medico: "Dr. Bella Carol", especialidad: "Obstetricia", sede: "Sede Norte", fecha: "2026-05-30", hora: "11:45", obraSocial: "Medicus" },
];

const especialidadesList = ["Todas", "Cardiología", "Ginecología", "Obstetricia", "Neurología", "Oncología", "Hematología", "Fisioterapia", "Gastroenterología", "Nefrología", "Pediatría"];
const sedesList = ["Todas", "Sede Centro", "Sede Norte", "Sede Sur"];

export default function BuscarTurnos({ onNavigate }) {
  const [especialidad, setEspecialidad] = useState("Todas");
  const [sede, setSede] = useState("Todas");
  const [medico, setMedico] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");

  const resultados = useMemo(() => {
    return turnosMock.filter((t) => {
      if (especialidad !== "Todas" && t.especialidad !== especialidad) return false;
      if (sede !== "Todas" && t.sede !== sede) return false;
      if (medico.trim() && !t.medico.toLowerCase().includes(medico.trim().toLowerCase())) return false;
      if (fechaDesde && t.fecha < fechaDesde) return false;
      return true;
    });
  }, [especialidad, sede, medico, fechaDesde]);

  const limpiar = () => {
    setEspecialidad("Todas");
    setSede("Todas");
    setMedico("");
    setFechaDesde("");
  };

  return (
    <>
      <Navbar onNavigate={onNavigate} current="buscar" />

      <section className="buscar-section">
      <div className="section-inner">
        <div className="mb-8">
          <p className="text-rose-700 font-semibold text-sm mb-2">Reservá tu turno</p>
          <h1 className="text-4xl font-bold mb-3">Buscar turnos disponibles</h1>
          <p className="text-gray-600 max-w-2xl">
            Filtrá por especialidad, médico, sede o fecha para encontrar el turno que mejor te queda.
          </p>
        </div>

        <div className="buscar-layout grid lg:grid-cols-[320px_1fr] gap-8">
          <aside className="buscar-filters">
            <div className="filter-card">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-lg">Filtros</h3>
                <button onClick={limpiar} className="text-rose-700 text-sm font-semibold bg-transparent">
                  Limpiar
                </button>
              </div>

              <label className="search-field mb-4">
                <span className="search-label">Especialidad</span>
                <select className="search-input" value={especialidad} onChange={(e) => setEspecialidad(e.target.value)}>
                  {especialidadesList.map((e) => <option key={e}>{e}</option>)}
                </select>
              </label>

              <label className="search-field mb-4">
                <span className="search-label">Médico</span>
                <input
                  className="search-input"
                  value={medico}
                  onChange={(e) => setMedico(e.target.value)}
                  placeholder="Buscar por nombre"
                />
              </label>

              <label className="search-field mb-4">
                <span className="search-label">Sede</span>
                <select className="search-input" value={sede} onChange={(e) => setSede(e.target.value)}>
                  {sedesList.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>

              <label className="search-field mb-2">
                <span className="search-label">Fecha desde</span>
                <input
                  type="date"
                  className="search-input"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                />
              </label>
            </div>
          </aside>

          <div className="buscar-results">
            <div className="flex items-center justify-between mb-5">
              <p className="text-gray-600">
                <span className="font-bold text-gray-900">{resultados.length}</span>{" "}
                turno{resultados.length === 1 ? "" : "s"} disponible{resultados.length === 1 ? "" : "s"}
              </p>
              <select className="search-input w-auto">
                <option>Ordenar por: Fecha</option>
                <option>Ordenar por: Médico</option>
              </select>
            </div>

            {resultados.length === 0 ? (
              <div className="empty-state text-center py-20">
                <div className="text-5xl mb-3">🔍</div>
                <p className="text-gray-600 font-semibold mb-1">No encontramos turnos con esos filtros</p>
                <p className="text-gray-400 text-sm">Probá cambiar la especialidad, sede o fecha.</p>
              </div>
            ) : (
              <ul className="turno-list">
                {resultados.map((t) => (
                  <li key={t.id} className="turno-row">
                    <div className="turno-date">
                      <span className="turno-day">{t.fecha.split("-")[2]}</span>
                      <span className="turno-month">May</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{t.medico}</p>
                      <p className="text-gray-500 text-sm">
                        {t.especialidad} · {t.sede}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">Cobertura: {t.obraSocial}</p>
                    </div>
                    <div className="turno-hora">
                      <p className="text-xs text-gray-500">Horario</p>
                      <p className="font-bold text-lg">{t.hora}</p>
                    </div>
                    <button className="site-btn site-btn-primary px-5 py-2 text-sm">
                      Reservar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      </section>

      <Footer />
    </>
  );
}
