export const mockStudents = [];

export const getStatusColor = (estatus, plan) => {
  if (estatus === 'Desactivado') return 'status-red';
  if (estatus === 'Activo' && plan === 'Mensual') return 'status-green';
  if (estatus === 'Activo' && (plan === 'Anual' || plan === 'Trimestral')) return 'status-purple';
  if (estatus === 'Activo' && plan === 'Cuotas') return 'status-turquoise';
  if (estatus === 'Completado') return 'status-purple'; // Similar to anual paid
  if (estatus === 'Pendiente') return 'status-orange';
  return 'status-gray';
};

export const getReputationBadge = (pagosAtrasados) => {
  if (pagosAtrasados === undefined || pagosAtrasados === 0) return { icon: '🥇', label: 'Oro', color: '#ffb300', desc: 'Excelente pagador' };
  if (pagosAtrasados <= 2) return { icon: '🥈', label: 'Plata', color: '#9e9e9e', desc: 'Suele pagar a tiempo' };
  return { icon: '🥉', label: 'Bronce', color: '#a1887f', desc: 'Frecuentes retrasos' };
};
