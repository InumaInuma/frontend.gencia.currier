/**
 * Utilidades para manejo de Horario Oficial del Perú (America/Lima - UTC-5)
 */

export const getPeruDate = (): Date => {
  const now = new Date();
  // Formatea a hora de Lima (Perú - UTC-5)
  const peruString = now.toLocaleString("en-US", { timeZone: "America/Lima" });
  return new Date(peruString);
};

export const isAfterCutoffTimePeru = (cutoffHour = 9, cutoffMinute = 30): boolean => {
  const peruDate = getPeruDate();
  const currentMinutes = peruDate.getHours() * 60 + peruDate.getMinutes();
  const cutoffMinutes = cutoffHour * 60 + cutoffMinute;
  return currentMinutes >= cutoffMinutes;
};

export const getPeruTimeString = (): string => {
  const peruDate = getPeruDate();
  return peruDate.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: true });
};
