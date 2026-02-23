
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    // Center the sign-up form on the screen
    <div className="flex items-center justify-center min-h-screen bg-background">
      {/* SignUp is a pre-built Clerk component */}
      {/* Handles name, email, password, Google signup */}
      <SignUp />
    </div>
  );
}