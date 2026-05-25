import { useState } from "react";
import Home from "./pages/Home";
import BuscarTurnos from "./pages/BuscarTurnos";

function App() {
  const [page, setPage] = useState("home");

  return (
    <div className="text-gray-900">
      {page === "home" && <Home onNavigate={setPage} />}
      {page === "buscar" && <BuscarTurnos onNavigate={setPage} />}
    </div>
  );
}

export default App;
