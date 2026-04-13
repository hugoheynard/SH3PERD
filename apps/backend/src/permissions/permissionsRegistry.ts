export const USER = {
  PREFERENCES: {
    WRITE: {
      SELF: 'user::preferences::write::self',
    },
    READ: {
      SELF: 'user::preferences::read::self',
    },
  },
} as const;

export const PERMISSIONS = {
  USER,
};

// Utilitaire récursif pour extraire les valeurs d’un objet imbriqué
type Values<T> = T extends object ? Values<T[keyof T]> : T;

// Donne : "user::preferences::write::self" | "user::preferences::read::self"
export type TPermissionKey = Values<typeof PERMISSIONS>;
