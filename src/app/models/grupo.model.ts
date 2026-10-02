// Refleja lo que devuelve GET /api/grupos (la entidad Grupo del backend, en JSON)
export interface Grupo {
  id: number;
  materia: {
    id: number;
    nombre: string;
    codigo: string;
  };
  horario: string;
  cuposTotales: number;
  cuposDisponibles: number;
}

// Refleja el CupoActualizadoEvent que llega por WebSocket
export interface CupoActualizadoEvent {
  grupoId: number;
  cuposDisponibles: number;
  cuposTotales: number;
}
