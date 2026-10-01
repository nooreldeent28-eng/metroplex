# Metroplex Construction Services

Website for a commercial and residential general contractor, with a project gallery and an admin panel for managing it.

- React + Vite + TypeScript + Tailwind CSS
- Supabase for admin login, the gallery table, and image storage
- Contact details live in `src/lib/company.ts`

## Routes

| Path | Page |
|------|------|
| `/` | Homepage (featured projects pulled from Supabase) |
| `/gallery` | Full project gallery with category filters and lightbox |
| `/admin/login` | Admin sign-in |
| `/admin` | Dashboard, gallery management, add/edit projects |

## Supabase setup

1. Create a free project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run `supabase/gallery-setup.sql`. It creates the table, the `project-gallery` bucket, and the security policies.
3. In **Authentication > Sign In / Providers**, turn off **Allow new users to sign up**.
4. In **Authentication > Users**, add the admin user, then approve them in the SQL Editor:
   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'management@metroplex-services.com';
   ```
5. Copy `.env.example` to `.env` and fill in the project URL and **anon** key from **Project Settings > API**. Add the same two variables in Vercel under **Settings > Environment Variables**. Never use the service-role key here.

## Development

```bash
npm install
npm run dev
npm run build
```
