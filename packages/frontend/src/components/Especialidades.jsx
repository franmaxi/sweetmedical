import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";

// Mapa visual: nombre de especialidad → icono.
// El backend manda únicamente datos de dominio (nombre, descripción, etc.);
// el frontend resuelve qué icono mostrar. Si llega una especialidad nueva
// que no está mapeada, se usa el fallback "+".
const ICONO_POR_ESPECIALIDAD = {
  "Cardiología": "♥️",
  "Ginecología": "🌸",
  "Traumatología": "🦴",
  "Neumonología": "☁️",
  "Oftalmología": "👁",
  "Pediatría": "🧸",
  "Dermatología": "✦",
  "Clínica Médica": "🩺",
  "Odontología": "🦷",
};
const ICONO_DEFAULT = "+";

// Mock: lo que en producción vendría del back (`GET /especialidades`).
// Nota que no hay propiedad `icono` — el icono lo resuelve el front.
const especialidades = [
  { nombre: "Cardiología", descripcion: "Cuidamos la salud de tu corazón con estudios y seguimiento personalizado.", medicos: 24 },
  { nombre: "Ginecología", descripcion: "Atención integral en salud femenina, controles y prevención.", medicos: 18 },
  { nombre: "Traumatología", descripcion: "Lesiones deportivas, fracturas y rehabilitación con especialistas.", medicos: 21 },
  { nombre: "Neumonología", descripcion: "Diagnóstico y tratamiento de enfermedades respiratorias.", medicos: 12 },
  { nombre: "Oftalmología", descripcion: "Controles visuales y tratamientos para el cuidado de tus ojos.", medicos: 15 },
  { nombre: "Pediatría", descripcion: "Atención dedicada al crecimiento y bienestar de los más chicos.", medicos: 28 },
  { nombre: "Dermatología", descripcion: "Cuidado integral de la piel, tratamientos clínicos y estéticos.", medicos: 14 },
  { nombre: "Clínica Médica", descripcion: "Consulta general y derivaciones a especialistas según tu caso.", medicos: 32 },
  { nombre: "Odontología", descripcion: "Salud bucal, limpieza, ortodoncia y tratamientos preventivos.", medicos: 19 },
];

export default function Services() {
  const [query, setQuery] = useState("");

  const filtradas = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return especialidades;
    return especialidades.filter(
      (e) =>
        e.nombre.toLowerCase().includes(q) ||
        e.descripcion.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <section id="especialidades" className="services-section">
      <div className="section-inner">
      <div className="services-header mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <p className="text-rose-700 font-semibold text-sm mb-2">
            Nuestras especialidades
          </p>
          <h2 className="section-heading text-4xl font-bold">
            Atención profesional<br />en cada área de la salud
          </h2>
        </div>

      </div>

      <div className="services-search-bar mb-10">
        <div className="search-icon-bubble">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar especialidad (ej: cardiología, piel, niños...)"
          className="services-search-input"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="services-search-clear"
            aria-label="Limpiar búsqueda"
          >
            <X size={16} />
          </button>
        )}
        <span className="services-search-count">
          {filtradas.length} {filtradas.length === 1 ? "resultado" : "resultados"}
        </span>
      </div>

      {filtradas.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No encontramos especialidades para "{query}".
        </div>
      ) : (
        <div className="service-grid grid md:grid-cols-3 gap-6">
          {filtradas.map((e) => (
            <div key={e.nombre} className="service-card p-6 rounded-3xl border transition">
              <div className="flex items-start justify-between mb-4">
                <div className="service-icon text-3xl">
                  {ICONO_POR_ESPECIALIDAD[e.nombre] ?? ICONO_DEFAULT}
                </div>
                <span className="service-badge">{e.medicos} médicos</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{e.nombre}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{e.descripcion}</p>
              <button className="service-link text-rose-700 text-sm font-semibold inline-block bg-transparent">
                Ver médicos →
              </button>
            </div>
          ))}
        </div>
      )}
      </div>
    </section>
  );
}
