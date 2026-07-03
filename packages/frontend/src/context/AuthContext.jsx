import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { loginApi, logoutApi } from "../api/api";

/**
 * Decodifica el payload de un JWT sin librerías externas.
 * Solo lee la parte pública del token (no verifica la firma).
 */
function decodeJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(window.atob(base64));
  } catch {
    return null;
  }
}

const STORAGE_KEY = "sweetmedical_auth";
const AuthContext = createContext(null);

function loadUserFromStorage() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => loadUserFromStorage());

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = async ({ nombreUsuario, password }) => {
    // Llama al backend — lanza error si las credenciales son incorrectas
    const token = await loginApi({ nombreUsuario, password });

    // Decodifica el payload para obtener los datos del usuario
    const payload = decodeJwt(token);
    
    // Normalizar el rol para que coincida con lo que espera el frontend
    let normalizedRole = payload.userRol?.toLowerCase();
    if (normalizedRole === 'paciente') {
      normalizedRole = 'usuario';
    }

    const nextUser = {
      userId: payload.userId,
      username: payload.userName,
      role: normalizedRole,
      displayName: payload.userName,
    };
    setUser(nextUser);
    return nextUser;
  };

  const logout = async () => {
    // Blacklistea el token en el servidor y limpia el storage
    await logoutApi();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, login, logout, isAuthenticated: Boolean(user), hasRole: (allowedRole) => user?.role === allowedRole }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function RequireRole({ role, redirectTo = "/login" }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
