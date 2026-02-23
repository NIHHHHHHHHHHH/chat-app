
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    // Center the sign-in form on the screen
    <div className="flex items-center justify-center min-h-screen bg-background">
      {/* SignIn is a pre-built Clerk component */}
      {/* It handles everything - email, password, Google login */}
      <SignIn />
    </div>
  );
}