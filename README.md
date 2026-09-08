# SKxMOVIES — Next-Gen Cinematic Portal for Cloudflare Pages

A high-performance movie and web series indexing portal built with **React 19**, **Vite**, **Tailwind CSS**, and **Cloudflare Pages Functions**. Powered by distributed **CockroachDB (Postgres-compatible)** clusters with automatic multi-database expansion and zero ad spam.

---

## 🌟 Key Highlights & Improvements

1. **Native Cloudflare Pages Architecture**:
   - Built to run seamlessly on Cloudflare Pages edge runtime without requiring a traditional Express server.
   - Centralized Cloudflare Pages Functions catch-all handler located at `functions/api/[[catchall]].ts`.
   - Dual-runtime compatibility: runs locally with `npm run dev` and deploys directly to Cloudflare Pages.

2. **CockroachDB Multi-Database Clustering**:
   - Automatic multi-pool detection: `DATABASE_URL`, `DATABASE_URL_2`, `DATABASE_URL_3`, etc.
   - **Unified Reads**: Queries across all connected CockroachDB clusters and deduplicates records.
   - **Zero Downtime Expansion**: When your initial database reaches storage limits, simply add `DATABASE_URL_2` in Cloudflare Pages settings.
   - Built-in failover to in-memory/demo state if databases are temporarily unreachable during initial setup.

3. **Pure Telegram Integration (Replaces All Email)**:
   - All email forms, dependencies, and contact pages have been completely removed.
   - Official Telegram broadcast channel pinned in header, announcement bar, footer, and detail pages.
   - Dedicated **Telegram Support Hub** at `/support` for instant mirror requests, broken link reporting, and discussion groups.
   - Dynamic Telegram settings configurable directly from the Admin Panel.

4. **Cinematic Pure Black Background & Realistic Motion Selector**:
   - The entire website background is styled in pure `#000000` obsidian black.
   - 5 realistic, cinematic background motion styles to select from in the Admin Panel:
     - **Cinematic Particles & Golden Embers**: Floating micro-embers and drifting stardust with organic light pulsation.
     - **Cosmic Aurora & Biome Mesh**: Undulating cosmic cyan & amber light washes.
     - **Anamorphic 35mm Lens Flares**: Classic projector light streaks and horizontal flares.
     - **Deep Star Constellations**: Star nodes interconnected by thin filament lines.
     - **Pure Pitch-Black Minimalist**: Pure obsidian black with optical vignette and zero CPU draw.
   - Persisted site-wide via database settings.

5. **External URLs Only (Zero File Uploads)**:
   - Strictly enforces external HTTPS URLs for posters, banners, trailers, stream links, and download mirrors.
   - Prevents bloated server storage and maximizes bandwidth efficiency.

6. **Full-Fidelity Admin Panel**:
   - Secure JWT-based admin authentication with master password encryption (`bcryptjs`).
   - Manage content (title, slug, categories, genres, quality badges, specs, trailer, mirrors).
   - Manage streaming options with custom resolution tags (4K UHD, 1080p FHD, 720p HD) and direct download buttons with file size estimates.
   - Live announcement popups manager with customizable triggers and delays.
   - Category and genre organizers.

---

## 🗄️ Database Setup (CockroachDB)

1. Create a free cluster on [CockroachDB Cloud](https://cockroachlabs.cloud/).
2. Run the SQL script from `schema.sql` in the CockroachDB SQL Console:
   ```sql
   -- Run contents of schema.sql to create tables:
   -- admins, site_settings, categories, genres, tags, content, popups
   ```
3. Copy your CockroachDB Postgres connection string:
   ```env
   DATABASE_URL="postgresql://user:password@cluster-name.gcp-us-central1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full"
   ```

### ⚡ Adding a Second Database When Full:
When your primary CockroachDB database reaches storage quota:
1. Create a second database cluster on CockroachDB.
2. Initialize it using `schema.sql`.
3. In your Cloudflare Pages dashboard, add an environment variable:
   ```env
   DATABASE_URL_2="postgresql://user2:password2@cluster2...:26257/defaultdb?sslmode=verify-full"
   ```
4. The system automatically reads from both databases and aggregates the content seamlessly!

---

## 🚀 Deployment to Cloudflare Pages

### Option 1: Via Cloudflare Dashboard (Recommended)
1. Push this repository to GitHub or GitLab.
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) &rarr; **Workers & Pages** &rarr; **Create Application** &rarr; **Pages** &rarr; **Connect to Git**.
3. Select your repository.
4. Set Build Settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
5. In **Environment Variables**, configure:
   - `DATABASE_URL`: Your CockroachDB connection string
   - `JWT_SECRET`: A secure random secret string (e.g. `skx_secret_jwt_38478239748923`)
   - `ADMIN_EMAIL`: `admin@skxmovies.com`
   - `ADMIN_PASSWORD`: Your desired master admin password
6. Click **Save and Deploy**. Your site and API functions are live worldwide on the edge!

---

## 🔐 Default Admin Credentials

- **URL**: `/admin/login`
- **Email**: `admin@skxmovies.com`
- **Password**: `Admin@12345`

*(You can update this password at any time inside the Admin Dashboard under the Security tab).*

---

## 🛠️ Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Production build
npm run build
```
The local server runs on `http://localhost:3000`.
