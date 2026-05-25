// Paleta de colores para los bloques de hora. El back no manda color:
// asignamos uno acá ciclando esta lista por índice.
const AGENDA_COLORS = ["rojo", "naranja", "verde", "violeta"];

export default function Hero({ onNavigate }) {
  const turnosPreview = [
    { medico: "Dra. Rebecca Rose", especialidad: "Ginecología", hora: "10:30", sede: "Sede Centro" },
    { medico: "Dr. Bella Carol", especialidad: "Obstetricia", hora: "11:15", sede: "Sede Norte" },
    { medico: "Dra. Kimberly", especialidad: "Neurología", hora: "14:00", sede: "Sede Sur" },
    { medico: "Dr. Lauren Leah", especialidad: "Oncología", hora: "16:45", sede: "Sede Centro" },
  ];

  return (
    <section id="inicio" className="hero-section">
      <div className="section-inner grid md:grid-cols-2 items-center gap-10">
      <div className="hero-copy">
      
        <h1 className="hero-title text-5xl font-bold leading-tight mb-6">
          Tu turno médico,<br />simple y al instante
        </h1>

        <p className="hero-description text-gray-600 mb-8 max-w-md">
          Reservá turnos con los mejores profesionales de la salud,
          en la sede más cercana y con la cobertura de tu obra social.
        </p>

        <div className="hero-actions flex gap-4 mb-10">
          <button
            onClick={() => onNavigate && onNavigate("buscar")}
            className="site-btn site-btn-primary px-6 py-3"
          >
            Buscar turnos
          </button>
        </div>

        
      </div>

      <div className="hero-agenda">
        <div className="hero-agenda-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold">Agenda de hoy</p>
              <h3 className="font-bold text-lg">Lunes, 24 de mayo</h3>
            </div>
          </div>

          <ul className="agenda-list">
            {turnosPreview.map((t, i) => (
              <li key={t.medico} className="agenda-item">
                <div className={`agenda-time agenda-time-${AGENDA_COLORS[i % AGENDA_COLORS.length]}`}>
                  <span className="text-sm font-bold">{t.hora}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{t.medico}</p>
                  <p className="text-gray-500 text-xs">{t.especialidad} · {t.sede}</p>
                </div>
                <span className="agenda-status">Confirmado</span>
              </li>
            ))}
          </ul>

          <div className="agenda-footer mt-5 flex items-center justify-between">
            <p className="text-xs text-gray-500">4 de 12 turnos del día</p>
            <button
              onClick={() => onNavigate && onNavigate("buscar")}
              className="text-rose-700 text-sm font-semibold bg-transparent"
            >
              Ver agenda completa →
            </button>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
