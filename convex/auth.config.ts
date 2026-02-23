
// This file tells Convex "use Clerk for authentication"
// Convex will verify every request using Clerk's JWT tokens

export default {
  providers: [
    {
      // This URL tells Convex where to verify tokens
      // It comes from your Clerk dashboard
      domain: process.env.CLERK_ISSUER_URL!,
      applicationID: "convex",
    },
  ],
};