export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="section-inner">
      <div className="footer-grid grid md:grid-cols-4 gap-10 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="brand-mark">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-7 h-7">
                <path
                  fill="none"
                  stroke="white"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M 78 30 C 78 13 22 13 22 50 C 22 82 78 82 78 50 C 78 28 35 28 35 55 C 35 73 62 73 62 50 C 62 40 50 40 50 52"
                />
              </svg>
            </span>
            <span className="text-xl font-bold text-rose-700">Sweet Medical</span>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            Sistema de gestión de turnos médicos.
            Reservá, gestioná y recibí recordatorios sin filas ni esperas.
          </p>
        </div>

        <div>
          <h5 className="font-semibold mb-4">Especialidades</h5>
          <ul className="footer-links">
            <li>Cardiología</li>
            <li>Ginecología</li>
            <li>Traumatología</li>
            <li>Pediatría</li>
            <li>Oftalmología</li>
          </ul>
        </div>

        <div>
          <h5 className="font-semibold mb-4">Enlaces</h5>
          <ul className="footer-links">
            <li>Médicos</li>
            <li>Sedes</li>
            <li>Planes y obras sociales</li>
            <li>Mis turnos</li>
            <li>Contacto</li>
          </ul>
        </div>

        <div>
          <h5 className="font-semibold mb-4">Newsletter</h5>
          <p className="text-gray-500 text-sm mb-3">
            Novedades, consejos y campañas de salud.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Email"
              className="form-input flex-1"
            />
            <button className="site-btn site-btn-primary px-4">OK</button>
          </div>
        </div>
      </div>

      <div className="footer-bottom border-t pt-6 flex flex-col md:flex-row justify-center text-gray-500 text-sm">
        <p>© 2026 Sweet Medical · Grupo 12 · DDSO UTN FRBA</p>
      </div>
      </div>
    </footer>
  );
}
