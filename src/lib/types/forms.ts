/** Estado estándar de los formularios con Server Actions (useActionState). */
export type FormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const INITIAL_FORM_STATE: FormState = { ok: false };
