# Administrator setup

The first administrator is provisioned explicitly; public sign-up is intentionally not available.

1. Configure `DATABASE_URL` and `SESSION_SECRET` in the local environment.
2. Apply the database migration after it has been generated and reviewed.
3. Set `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD` (at least 12 characters) in your shell.
4. Run `npm run admin:create` once to create or rotate that administrator's password.
5. Remove `ADMIN_PASSWORD` from the shell environment after provisioning.

The password is stored as a bcrypt hash. Session cookies are HTTP-only, same-site and secure in production. Do not expose session secrets or administrator credentials in browser code or public environment variables.
