import { hash } from "bcryptjs";
import postgres from "postgres";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;

if (!process.env.DATABASE_URL || !email || !password || password.length < 12) {
  throw new Error("Set DATABASE_URL, ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters).");
}

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });
try {
  const passwordHash = await hash(password, 12);
  await sql`
    INSERT INTO admins (email, password_hash)
    VALUES (${email}, ${passwordHash})
    ON CONFLICT (email)
    DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = NOW()
  `;
  process.stdout.write(`Administrator credentials provisioned for ${email}\n`);
} finally {
  await sql.end();
}
