import { Star, MapPin, CalendarCheck } from "lucide-react";


const medicos = [
  { id: 1, nombre: "Jessica", apellido: "Joan", especialidad: "Nefrología", matricula: "MN 45821", sede: "Sede Centro" },
  { id: 2, nombre: "Alexandra", apellido: "Pérez", especialidad: "Gastroenterología", matricula: "MN 52114", sede: "Sede Norte" },
  { id: 3, nombre: "Kimberly", apellido: "López", especialidad: "Neurología", matricula: "MN 38902", sede: "Sede Sur" },
  { id: 4, nombre: "Tomás", apellido: "Carol", especialidad: "Obstetricia", matricula: "MN 60012", sede: "Sede Centro" },
  { id: 5, nombre: "Rebecca", apellido: "Rose", especialidad: "Ginecología", matricula: "MN 41203", sede: "Sede Centro" },
  { id: 6, nombre: "Stephanie", apellido: "Sue", especialidad: "Hematología", matricula: "MN 58844", sede: "Sede Norte" },
  { id: 7, nombre: "Penélope", apellido: "Cruz", especialidad: "Fisioterapia", matricula: "MN 47301", sede: "Sede Sur" },
  { id: 8, nombre: "Lauren", apellido: "Leah", especialidad: "Oncología", matricula: "MN 33205", sede: "Sede Centro" },
];


const AVATAR_COLORS = [
  "avatar-rose", "avatar-amber", "avatar-emerald",
  "avatar-indigo", "avatar-sky", "avatar-fuchsia",
];

const hashName = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const iniciales = (nombre, apellido) =>
  `${(nombre?.[0] ?? "").toUpperCase()}${(apellido?.[0] ?? "").toUpperCase()}`;

const colorAvatar = (m) =>
  AVATAR_COLORS[hashName(`${m.nombre}${m.apellido}`) % AVATAR_COLORS.length];

const tratamiento = (nombre) =>
  // heurística simple para mostrar "Dra." si el nombre termina en "a"
  /a$/i.test(nombre) ? "Dra." : "Dr.";

export default function Medicos() {
  return (
    <section id="medicos" className="medicos-section">
      <div className="section-inner">
        <div className="text-center mb-12">
          <p className="text-rose-700 font-semibold text-sm mb-2">Nuestro equipo</p>
          <h2 className="section-heading text-4xl font-bold inline-block">
            Médicos especialistas
          </h2>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            Profesionales certificados, con años de experiencia
            y dedicación a cada uno de nuestros pacientes.
          </p>
        </div>

        <div className="medicos-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {medicos.map((m) => (
            <article key={m.id} className="medico-card">
              <header className="medico-card-head">
                <div className={`medico-avatar ${colorAvatar(m)}`}>
                  {iniciales(m.nombre, m.apellido)}
                </div>
              </header>

              <h4 className="font-semibold text-base">
                {tratamiento(m.nombre)} {m.nombre} {m.apellido}
              </h4>
              <p className="text-rose-700 text-sm font-medium mb-3">
                {m.especialidad}
              </p>

              <ul className="medico-meta">
                <li>
                  <MapPin size={14} />
                  <span>{m.sede}</span>
                </li>
              </ul>

              <p className="medico-matricula">{m.matricula}</p>

              <button className="site-btn site-btn-primary w-full py-2 text-sm mt-4">
                Ver agenda
              </button>
            </article>
          ))}
        </div>

        <div className="text-center mt-10">
          <button className="site-btn site-btn-ghost px-6 py-3 border border-gray-200 rounded-full">
            Ver todos los médicos
          </button>
        </div>
      </div>
    </section>
  );
}
