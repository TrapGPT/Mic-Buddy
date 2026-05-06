import { Suspense } from 'react';
import { SignIn } from '@clerk/nextjs';

function SignInPanel() {
  return (
    <SignIn
      routing="path"
      path="/sign-in"
      signUpUrl="/sign-up"
      forceRedirectUrl="/dashboard"
    />
  );
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Loading sign-in…</p>
        }
      >
        <SignInPanel />
      </Suspense>
    </div>
  );
}
