import LoginForm from '@/components/LoginForm/LoginForm';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <main>
      <div>
        <div>
          <div>
          </div>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}