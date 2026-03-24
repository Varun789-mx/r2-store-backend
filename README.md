# Driveapp — Backend

The REST API backend for **R2-Store**, a simple media sharing and cloud storage application. Built with Express 5, Prisma, and Cloudflare R2 — running natively on Bun.

> 🔗 Frontend repo: [driveapp-frontend](https://github.com/Varun789-mx/driveapp-frontend) · Live at [r2-store.vercel.app](https://r2-store.vercel.app)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Bun |
| Framework | Express.js 5 |
| Language | TypeScript 5 |
| ORM | Prisma 6.5 + Prisma Accelerate |
| Database | PostgreSQL (via `@prisma/adapter-pg`) |
| Object Storage | Cloudflare R2 (AWS S3-compatible SDK) |
| Media (optional) | Cloudinary |
| Auth | @auth/express + JWT + cookie-parser |
| File Upload | Multer |
| ID Generation | nanoid |

---

## Features

- 📤 File upload to Cloudflare R2 with presigned URL support
- 🔐 Session-based auth with JWT and HTTP-only cookies
- 🗄️ PostgreSQL database with Prisma ORM and Accelerate edge caching
- 📁 Temporary local file staging via Multer before R2 upload
- 🌐 CORS-configured for frontend origin

---

## Project Structure
```
Driveapp/
├── prisma/               # Prisma schema and migrations
├── public/
│   └── temp/             # Temporary upload staging directory
├── src/
│   └── index.ts          # Express app entry point
├── types/                # Shared TypeScript type definitions
├── .env.example          # Environment variable template
├── package.json
├── tsconfig.json
└── bun.lock
```

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed (`curl -fsSL https://bun.sh/install | bash`)
- A **PostgreSQL** database
- A **Cloudflare R2** bucket with API credentials

### Installation
```bash
git clone https://github.com/Varun789-mx/Driveapp.git
cd Driveapp
bun install
```

### Environment Variables

Copy the example file and fill in your values:
```bash
cp .env.example .env
```
```env
# PostgreSQL connection string
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# URLs
MAIN_URL=http://localhost
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# Cloudflare R2
CLOUDFLARE_AC_TOKEN=your_cloudflare_account_token
CLOUDFLARE_URL=your_r2_bucket_public_url
ACCESS_KEY_ID=your_r2_access_key_id
SECRET_ACCESS_KEY=your_r2_secret_access_key

# Cloudinary (optional — may not be in use)
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Server
PORT=5000
```

### Database Setup

Run migrations before starting the server:
```bash
# Development
bun run migrate:dev

# Production
bun run migrate:prod
```

### Running Locally
```bash
bun run dev
```

The server starts with file watching at `http://localhost:5000`.

---

## Available Scripts

| Command | Description |
|---|---|
| `bun run dev` | Start dev server with hot reload (`--watch`) |
| `bun run build` | Compile TypeScript to `dist/` for production |
| `bun run start` | Run the compiled production build |
| `bun run start:prod` | Run DB migrations then start production server |
| `bun run migrate:dev` | Run Prisma migrations in development |
| `bun run migrate:prod` | Deploy Prisma migrations to production |

---

## How It Works

1. **Upload flow** — Files are received via Multer and staged in `public/temp/`, then streamed to Cloudflare R2 using the AWS S3-compatible SDK. Presigned URLs are generated for secure client-side access.
2. **Auth** — Users authenticate via `@auth/express`. Sessions are managed with JWT tokens stored in HTTP-only cookies.
3. **Database** — Prisma handles all DB operations against PostgreSQL. Prisma Accelerate provides connection pooling and edge caching.
4. **CORS** — The API is configured to accept requests from `FRONTEND_URL` only.

---

## Deployment

For production, build the project first then run the production start command:
```bash
bun run build
bun run start:prod   # runs migrations + starts server
```

Make sure all environment variables are set in your hosting environment.

---

## Related

- 🖥️ Frontend: [driveapp-frontend](https://github.com/Varun789-mx/driveapp-frontend)
- ☁️ [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- 🗄️ [Prisma Docs](https://www.prisma.io/docs)

---

## License

MIT
