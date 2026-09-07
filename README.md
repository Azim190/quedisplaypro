# DMC Quotation Archiving & Analytics Dashboard
### نظام أرشفة وإدارة عروض الأسعار - دار مكة للاستشارات الهندسية

[![Deploy to GitHub Pages](https://github.com/actions/deploy-pages/actions/workflows/deploy.yml/badge.svg)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-success.svg)]()

A modern, high-performance, bilingual web application tailored for **Dar Makkah Engineering Consultancy (دار مكة للاستشارات الهندسية)** to archive, monitor, search, filter, and analyze engineering quotations through an executive analytics dashboard.

نظام ويب متكامل وعصري ومزدوج اللغة (عربي / إنجليزي) مصمم خصيصاً لمكتب **دار مكة للاستشارات الهندسية** لأرشفة ومتابعة والبحث في عروض الأسعار الهندسية مع لوحة تحكم تفاعلية متطورة.

---

## 🌟 Key Features / المميزات الرئيسية

- **Bilingual Interface (العربية / English)**: Dynamic RTL (Right-to-Left) for Arabic and LTR (Left-to-Right) for English with instant language toggling.
- **Visual Identity**: Tailored specifically to the DMC corporate brand guidelines with Deep Architectural Navy (`#0B3D62`), Gold Accents (`#D4AF37`), and Tajawal Arabic typography.
- **Executive Analytics Dashboard**:
  - **10 Real-time KPI Cards**: Total quotations, active revisions, awarded value, pending review, conversion rate, total gross value, 15% VAT breakdown, and branch counts.
  - **Interactive Charts (Chart.js)**: Quotation breakdown by Branch, Status, Service Type, and Monthly Trends.
- **Quotation Archiving & Cloud Link Storage**:
  - Store and manage quotation records without file bloat.
  - Direct integration with cloud storage URLs (**Microsoft OneDrive**, **SharePoint**, **Google Drive**, **Dropbox**) with integrated "Test Link" validation.
  - Automatic 15% Saudi VAT calculation (Subtotal + VAT = Total).
- **Advanced Filtering & Full-Text Search**:
  - Instant search across Quotation Numbers, Project Titles, Clients, Branches, and Reference codes.
  - Multi-criteria filtering by Branch, Status, Service Type, Currency, and Date Range.
- **Revision History & Audit Trail**:
  - Track multiple versions (`R0`, `R1`, `R2`, ...) for each quotation.
  - Complete security audit log of user actions (login, create, edit, status updates, settings).
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Full control, creation, editing, system settings, branch management, and data import/export.
  - **Standard User**: View, filter, search, open cloud files, and generate reports.
- **Relational SQLite Database & REST API**:
  - Full relational database powered by Node.js native `node:sqlite` (`server/data/dmc_database.sqlite`).
  - Express.js REST API with automated CRUD, full-text search, multi-criteria filtering, and audit logging.
  - **Dual-Mode Sync**: Connects to the SQLite database when the backend is running, and automatically falls back to browser `localStorage` on static hosts (like GitHub Pages).
- **Data Portability**: Full JSON and CSV export/import for seamless backups and data transfer.

---

## 🔑 Default Login Credentials / بيانات الدخول الافتراضية

| Role / الدور | National ID / رقم الهوية | Password / كلمة المرور | Permissions / الصلاحيات |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `1010101010` (or `1234567890`) | `admin123` | Full access & management |
| **Standard User** | `2020202020` (or `0987654321`) | `user123` | View, search & export |

---

## 🗄️ Database & Backend Server / تشغيل قاعدة البيانات والخادم

To run the application with the full **SQLite database and Express REST API backend**:

```bash
# 1. Install dependencies
npm install

# 2. Seed database (creates schema and inserts 248 quotations)
npm run seed

# 3. Start server
npm start
```
The application and REST API will be available at `http://localhost:3000`.

### REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Check server and database status |
| `POST` | `/api/auth/login` | Authenticate user with National ID |
| `GET` | `/api/quotations` | List quotations with search, filters, pagination |
| `GET` | `/api/quotations/:id` | Get single quotation with revisions |
| `POST` | `/api/quotations` | Create new quotation (auto VAT calc) |
| `PUT` | `/api/quotations/:id` | Update quotation details |
| `PATCH` | `/api/quotations/:id/status` | Update quotation status |
| `POST` | `/api/quotations/:id/revisions` | Add new revision |
| `DELETE` | `/api/quotations/:id` | Delete quotation |
| `GET` | `/api/dashboard/stats` | Retrieve aggregated KPI counts and chart data |
| `GET` | `/api/branches` | List DMC branches |
| `GET` | `/api/audit-logs` | Retrieve recent audit logs |

---

## 🚀 Deployment / طرق النشر والتشغيل

### Option 1: GitHub Pages (Automatic Workflow Included)
This repository includes a pre-configured GitHub Actions workflow in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

1. Push this repository to your GitHub account:
   ```bash
   git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
   git branch -M main
   git push -u origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, select **GitHub Actions** (or select **Deploy from a branch** and choose `main` / `root`).
3. Your application will be live at:
   ```
   https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/
   ```

### Option 2: Vercel / Netlify
1. Connect your GitHub repository to [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. Set Build Command to: *(None / leave empty)*
3. Set Publish Directory to: `.` *(Root)*
4. Click **Deploy**.

### Option 3: Run Locally
You can run the application with any simple HTTP server:

```bash
# Using Python 3
python -m http.server 8080

# Or using Node.js (npx)
npx serve .
```
Then navigate to `http://localhost:8080` in your web browser.

---

## 📁 Project Structure / هيكل المشروع

```
Queconsus/
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions workflow for automatic Pages deployment
├── assets/
│   ├── architectural-bg.svg  # DMC vector architectural background
│   ├── icon.svg              # DMC vector logo badge
│   └── logo.svg              # Full DMC corporate header logo
├── css/
│   ├── components.css        # Modals, form fields, badges, scrollbars, dropdowns
│   ├── dashboard.css         # Dashboard layout, KPI cards, chart containers
│   ├── login.css             # Architectural login view styling
│   └── main.css              # Design tokens, typography, CSS variables, dark/light themes
├── js/
│   ├── app.js                # Core orchestrator and view routing
│   ├── audit.js              # Activity logging engine
│   ├── auth.js               # Authentication and session manager
│   ├── dashboard.js          # KPI metrics calculations and Chart.js integration
│   ├── details.js            # Quotation view & inspection modal
│   ├── form.js               # Quotation creation and editing with VAT calculator
│   ├── i18n.js               # Arabic & English localization dictionaries
│   ├── quotations.js         # Table management, filtering, search, pagination
│   ├── revisions.js          # Quotation version tracking (R0, R1, ...)
│   ├── settings.js           # Administrative configurations, data backup & restore
│   └── store.js              # LocalStorage database with 248 pre-seeded realistic records
├── .gitignore                # Git ignore patterns for clean commits
├── app.html                  # Main application dashboard
├── index.html                # Entry login portal
└── README.md                 # Project documentation and deployment guide
```

---

## 🛠️ Technology Stack / التقنيات المستخدمة

- **HTML5 & Vanilla JavaScript (ES6+)**: Zero framework dependencies for ultra-fast loading and longevity.
- **CSS3 with Custom Design Tokens**: Full responsive CSS Grid & Flexbox, smooth transitions, glassmorphism, and dark/light mode.
- **Chart.js v4.4.1**: Executive responsive business intelligence charts.
- **FontAwesome 6.5.1**: Comprehensive iconography.
- **Google Fonts (Tajawal)**: Modern, professional Arabic and English typography.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
