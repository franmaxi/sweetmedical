export default function Navbar({ onNavigate, current = "home" }) {
  //esto es para poder usar el mismo componente en la home y en la página de búsqueda, y que marque como activo el link correspondiente
  const go = (page) => (e) => {
    if (e) e.preventDefault();
    onNavigate && onNavigate(page);
  };

  return (
    <div className="site-nav-wrapper">
    <nav className="site-nav flex items-center justify-between px-8 py-4">
      <a href="#inicio" onClick={go("home")} className="site-brand flex items-center gap-2">
        <span className="brand-mark">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            className="w-7 h-7"
          >
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
        <span className="text-xl font-bold text-rose-700">SweetMedical</span>
      </a>

      <ul className="site-nav-links hidden md:flex gap-8 font-medium text-sm">
        <li>
          <a href="#inicio" onClick={go("home")} className={current === "home" ? "nav-active" : ""}>
            Inicio
          </a>
        </li>
        <li>
          <a href="#buscar" onClick={go("buscar")} className={current === "buscar" ? "nav-active" : ""}>
            Buscar turnos
          </a>
        </li>
        <li><a href="#especialidades" onClick={go("home")}>Especialidades</a></li>
        <li><a href="#medicos" onClick={go("home")}>Médicos</a></li>
        <li><a href="#sedes" onClick={go("home")}>Sedes</a></li>
      </ul>

      <div className="site-nav-actions flex gap-3">
        <button className="site-btn site-btn-ghost font-medium px-4 py-2">
          Ingresar
        </button>
        <button className="site-btn site-btn-primary px-5 py-2">
          Registrarse
        </button>
      </div>
    </nav>
    </div>
  );
}
