import { Suspense } from 'react';
import { SignUp } from '@clerk/nextjs';

function SignUpPanel() {
  return (
    <SignUp
      routing="path"
      path="/sign-up"
      signInUrl="/sign-in"
      forceRedirectUrl="/dashboard"
    />
  );
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">Loading sign-up…</p>
        }
      >
        <SignUpPanel />
      </Suspense>
    </div>
  );
}
