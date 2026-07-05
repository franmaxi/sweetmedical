import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);
const STORAGE_KEY = "sweetmedical_cart";

function cargarInicial() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Carrito de turnos, persistido en localStorage.
 * Cada item guarda lo necesario para mostrarlo y para reservarlo luego:
 * { turnoId, medicoNombre, fechaHora, sedeNombre, motivoTipo, motivoId, motivoNombre, precio }
 */
export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState(cargarInicial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage lleno o no disponible: ignoramos */
    }
  }, [items]);

  // Al cerrar sesión vaciamos el carrito para que no quede visible a otro usuario.
  useEffect(() => {
    if (!user) setItems([]);
  }, [user]);

  const agregar = (item) =>
    setItems((prev) =>
      prev.some((i) => i.turnoId === item.turnoId) ? prev : [...prev, item],
    );

  const quitar = (turnoId) =>
    setItems((prev) => prev.filter((i) => i.turnoId !== turnoId));

  const vaciar = () => setItems([]);

  const estaEnCarrito = (turnoId) => items.some((i) => i.turnoId === turnoId);

  const value = useMemo(() => {
    const total = items.reduce((sum, i) => sum + (Number(i.precio) || 0), 0);
    return { items, cantidad: items.length, total, agregar, quitar, vaciar, estaEnCarrito };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
