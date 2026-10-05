import type { ObjectId } from "mongodb";

/** Convierte ObjectId → string y Date → string (ISO), recursivamente. */
export type Serialized<T> = T extends ObjectId
  ? string
  : T extends Date
    ? string
    : T extends readonly (infer U)[]
      ? Serialized<U>[]
      : T extends object
        ? { [K in keyof T]: Serialized<T[K]> }
        : T;

/** ObjectId y Date ya tienen toJSON, por lo que JSON.stringify produce exactamente esa forma. */
export function serialize<T>(value: T): Serialized<T> {
  return JSON.parse(JSON.stringify(value)) as Serialized<T>;
}
