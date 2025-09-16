// Sanitize issuer domain so both with/without protocol work in envs.
const rawIssuer =
  process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_URL ||
  process.env.CLERK_JWT_ISSUER_DOMAIN ||
  "";
const issuerDomain = rawIssuer
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "");

export default {
  providers: [
    {
      // Example: "positive-snail-42.clerk.accounts.dev"
      // After changes, run `npx convex dev` to sync providers.
      domain: issuerDomain,
      applicationID: "convex",
    },
  ],
};
