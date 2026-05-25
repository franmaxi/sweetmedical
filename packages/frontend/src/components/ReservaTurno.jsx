export default function ReservaTurno() {
  return (
    <section id="contacto" className="cta-section p-7">
      <div className="section-inner cta-inner grid md:grid-cols-2 gap-10 items-center">
        <div className="cta-copy text-white">
          <h2 className="text-3xl font-bold mb-4 leading-tight">
            Reservá tu turno<br />en menos de 1 minuto
          </h2>
          <p className="text-cyan-50 mb-8 max-w-md">
            Elegí especialidad, médico y sede. Recibí la confirmación
            por email y los recordatorios automáticos.
          </p>

        </div>

        <div className="cta-form bg-white p-8 rounded-3xl shadow-2xl">
          <h3 className="text-xl font-bold mb-6 text-gray-900">Solicitar turno</h3>
          <form className="grid grid-cols-2 gap-4">
            <input className="form-input col-span-1" placeholder="Nombre" />
            <input className="form-input col-span-1" placeholder="Email" />
            <input className="form-input col-span-1" placeholder="Teléfono" />
            <select className="form-input col-span-1">
              <option>Especialidad</option>
              <option>Cardiología</option>
              <option>Ginecología</option>
              <option>Pediatría</option>
            </select>
            <input className="form-input col-span-1" type="date" />
            <input className="form-input col-span-1" type="time" />
            <textarea className="form-input col-span-2" rows="3" placeholder="Comentarios (opcional)" />
            <button type="button" className="site-btn site-btn-primary col-span-2 py-3">
              Enviar solicitud
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
