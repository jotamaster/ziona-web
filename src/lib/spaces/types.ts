export type Space = {
  id: string;
  name: string;
  /** Presente cuando el backend lo envía; sirve para mostrar eliminar solo al creador. */
  createdByUserId?: string;
};
