import cron from 'node-cron'
import { TurnoService } from '../services/TurnoService.js'

function iniciarTurnosCron() {
    // Creo que esto funciona asi, ya que no estamos creando una clase
  const turnoService = new TurnoService();

  //Refrescamos los turnos cada 30 minutos
  cron.schedule('*/30 * * * *', async () => {
    console.log(`[CRON] [${new Date().toLocaleTimeString()}] Iniciando refresco de turnos...`)
    try {
      await turnoService.refrescarTurnosBatch();
      console.log('[CRON] Refresco de turnos completado con éxito.')
    } catch (error) {
      console.error('[CRON ERROR] Falló el refresco de turnos:', error)
    }
  }, {
    timezone: "America/Argentina/Buenos_Aires"
  });


  // Todos los domingo a las 3 AM generamos los turnos para dentro de 28 dias (.env)
  // Sintaxis: '0 3 * * 0' -> Minuto 0, Hora 3, Cualquier día del mes/mes, Domingo (0)
  cron.schedule('0 3 * * 0', async () => {
    console.log(`[CRON] [${new Date().toLocaleString()}] Iniciando generación semanal de turnos...`)
    try {
      await turnoService.generarTurnosBatch();
      console.log('[CRON] Generación semanal de turnos completada con éxito.')
    } catch (error) {
      console.error('[CRON ERROR] Falló la generación de turnos:', error)
    }
  }, {
    timezone: "America/Argentina/Buenos_Aires"
  });

}

export default iniciarTurnosCron; // Esto nos permite llamarlo desde al app.js /index.js