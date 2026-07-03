/**
 * Blacklist de tokens JWT invalidados por logout.
 *
 * Limitaciones conocidas:
 * - Se pierde al reiniciar el servidor (in-memory).
 * - Los tokens expirados permanecen en el Set hasta el reinicio.
 *   Como los tokens duran 10 minutos, el Set no crece indefinidamente
 *   durante una sesión normal.
 *
 * Para producción real: reemplazar con Redis con TTL automático.
 */
const _blacklistedTokens = new Set()

/**
 * Agrega un token a la blacklist (logout).
 * @param {string} token - El token JWT completo (sin "Bearer ").
 */
export const addToBlacklist = (token) => {
    _blacklistedTokens.add(token)
}

/**
 * Verifica si un token está en la blacklist.
 * @param {string} token - El token JWT completo (sin "Bearer ").
 * @returns {boolean}
 */
export const isBlacklisted = (token) => {
    return _blacklistedTokens.has(token)
}
