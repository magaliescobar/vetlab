'use client';

import { useActionState } from 'react';
import { authenticate } from '@/lib/actions';
import { useSearchParams } from 'next/navigation';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <h1>
          Ingrese sus datos de acceso
        </h1>
        <div className="">
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <input
                className=""
                id="email"
                type="email"
                name="email"
                placeholder="Ingrese su email"
                required
              />
            </div>
          </div>
          <div className="">
            <label
              className=""
              htmlFor="password"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                className=""
                id="password"
                type="password"
                name="password"
                placeholder="Ingrese su contraseña"
                required
              />
          </div>
        </div>
        </div>
        <input type="hidden" name="redirectTo" value={callbackUrl} />
        <button  aria-disabled={isPending}>
          Iniciar sesión
        </button>
        <div className=""
          aria-live="polite"
          aria-atomic="true">
         {errorMessage && (
            <>
              <p className="">{errorMessage}</p>
            </>
          )}
        </div>
      </div>
    </form>
  );
}