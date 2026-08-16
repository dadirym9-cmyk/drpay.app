# DRPay — Step 1: GitHub-safe project

This version removes local environment files and clears inline values for known secrets.
Do NOT use "Allow Secret" in GitHub.

Required secrets must be configured in the deployment environment:
- DATABASE_URL
- JWT_SECRET
- BREVO_API_KEY
- AUTH_APP_TRANSACTION_SECRET
- HAPPYSEEDS_PROJECT_ID

The PostgreSQL database itself is NOT replaced or deleted by this cleanup.
