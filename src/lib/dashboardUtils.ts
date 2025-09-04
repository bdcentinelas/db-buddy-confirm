// Función para agrupar votantes por hora
export const groupVotersByHour = (voters: { created_at: string }[]) => {
  const hourCounts = new Map<string, number>();
  
  voters.forEach(voter => {
    try {
      const date = new Date(voter.created_at);
      if (!isNaN(date.getTime())) {
        const hour = date.getHours().toString().padStart(2, '0') + ':00';
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      }
    } catch (error) {
      // Silently handle invalid dates
      console.warn('Invalid date encountered:', voter.created_at);
    }
  });

  // Generar datos para las últimas 24 horas
  const result = [];
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(Date.now() - i * 60 * 60 * 1000);
    const hourKey = hour.getHours().toString().padStart(2, '0') + ':00';
    result.push({
      hour: hourKey,
      count: hourCounts.get(hourKey) || 0
    });
  }

  return result;
};