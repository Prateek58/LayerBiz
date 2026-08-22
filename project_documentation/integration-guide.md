# LayerBiz Full Integration Guide & Architecture Reference

This document summarizes the full technical integration between **Next.js (Frontend)** and **Strapi v5 (Backend CMS & CRM)**, including environment setup for both local development and remote production servers.

---

## 1. Architecture Overview

```
                          ┌───────────────────────────┐
                          │   Visitor Web Browser     │
                          └─────────────┬─────────────┘
                                        │ (Submissions & Views)
                                        ▼
                        ┌───────────────────────────────┐
                        │    Next.js Frontend Server    │
                        │    (Port 3000 / Production)   │
                        └───┬───────────────────────┬───┘
                            │                       │
      (Read Blogs / Save CRM)                       │ (Alert Emails via Gmail SMTP)
                            ▼                       ▼
            ┌───────────────────────────┐    ┌───────────────────────────┐
            │    Strapi v5 Headless     │    │     Gmail Notification    │
            │      CMS & Database       │    │      (Nodemailer)         │
            │ (Port 1337 / Remote DB)   │    │  (prateek.bhardwaj60...)  │
            └───────────────────────────┘    └───────────────────────────┘
```

---

## 2. Dynamic Blog Setup (Markdown & Clean Slugs)

### Strapi Schema (`blog-post`)
* **Content-Type**: `api::blog-post.blog-post`
* **Key Fields**:
  * `title` (String, required)
  * `slug` (UID, `targetField: "title"`) — placed directly under title.
  * `category`, `date`, `readTime`, `tags` (JSON)
  * `content` (Rich Text / Markdown)
* **Auto-Slug Backend Lifecycle** (`backend/src/api/blog-post/content-types/blog-post/lifecycles.ts`): Automatically slugifies the title (e.g. `"The Architecture"` $\rightarrow$ `"the-architecture"`) on save if the slug is empty.

### Next.js Frontend Rendering (`frontend/app/blog/[id]/page.tsx`)
* Uses `react-markdown` to parse content dynamically from Strapi.
* Wrapped in `prose prose-invert prose-pre:bg-transparent prose-pre:p-0` for typography.
* **Code Blocks**: Formatted with `react-syntax-highlighter` (`vscDarkPlus` theme), enclosed in a `not-prose` wrapper with a transparent background and slate border (`border: 1px solid #1e293b`).
* **Italic Styles**: Custom `em` renderer enforcing `text-lg text-slate-300 italic`.

---

## 3. Contact Form & Newsletter (Hybrid Strapi CRM + Email)

### Strapi Collections Created
1. **`contact-inquiry`**:
   * Fields: `name` (string), `email` (email), `subject` (string), `message` (text), `status` (`new` | `in_review` | `replied`).
2. **`newsletter-subscriber`**:
   * Fields: `email` (email, unique), `status` (`active` | `unsubscribed`), `subscribedAt` (datetime).

### Next.js API Routes
1. **`/api/contact`** (`frontend/app/api/contact/route.ts`):
   * Inspects Honeypot & Time-trap.
   * Saves inquiry into Strapi collection `contact-inquiries` (permanent CRM record).
   * Dispatches instant HTML alert email to `NOTIFICATION_EMAIL` with `replyTo: <user_email>`.
2. **`/api/newsletter`** (`frontend/app/api/newsletter/route.ts`):
   * Inspects Honeypot & Time-trap.
   * Checks Strapi for duplicate subscribers.
   * Saves new subscriber into Strapi collection `newsletter-subscribers`.
   * Sends quick subscriber alert to `NOTIFICATION_EMAIL`.

---

## 4. Anti-Bot Spam Protection (Honeypot + Time-Trap)

* **100% Free & Zero-Cost**: No external API keys or subscriptions required.
* **Invisible Honeypot Input**: Added invisible inputs (`name="company_url_hp"` and `name="newsletter_hp"`) with `aria-hidden="true"` and `position: absolute; left: -9999px;`. Real users never see or fill this. Automated spam scripts fill all fields blindly.
* **Sub-Second Time Trap**: Rejects automated submissions that occur in $< 1\text{ second}$.
* **Silent Dropping**: Returns fake `200 OK` to bots so they do not retry with altered payloads.

---

## 5. Environment Variables Configuration

### A. Local Development Environment

#### Frontend (`frontend/.env.local`):
```env
# Strapi API Connection (Requires Full-Access Token)
STRAPI_API_TOKEN=your_full_access_strapi_token_here
NEXT_PUBLIC_STRAPI_API_URL=http://127.0.0.1:1337

# Automated Email Dispatcher (Gmail SMTP)
EMAIL_USER=layerbiz1@gmail.com
EMAIL_PASS=vgqc qzzj uecr zlel

# Your Private Destination Inbox (where alerts land)
NOTIFICATION_EMAIL=prateek.bhardwaj60@gmail.com
```

#### Backend (`backend/.env`):
```env
HOST=0.0.0.0
PORT=1337

# Strapi Secrets
APP_KEYS=...
API_TOKEN_SALT=...
ADMIN_JWT_SECRET=...
JWT_SECRET=...
TRANSFER_TOKEN_SALT=...
ENCRYPTION_KEY=...

# MySQL Database
DATABASE_CLIENT=mysql
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_NAME=layerbizdb
DATABASE_USERNAME=root
DATABASE_PASSWORD=root123
DATABASE_SSL=false
```

---

### B. Remote Production Server / SSH Deployment

Based on your GitHub Actions workflows ([deploy-frontend.yml](file:///Users/prateekbhardwaj/Projects/LayerBiz/.github/workflows/deploy-frontend.yml) and [deploy-backend.yml](file:///Users/prateekbhardwaj/Projects/LayerBiz/.github/workflows/deploy-backend.yml)):

#### Where to put the `.env` file on your Production SSH Server:

1. **Frontend Production Environment**:
   * **Path on Server**: `/home/layerbiz/htdocs/layerbiz.com/frontend/.env.production` (or `.env.local`)
   * Create this file **once** directly on your server via SSH:
     ```bash
     ssh layerbiz@<YOUR_SERVER_IP>
     nano /home/layerbiz/htdocs/layerbiz.com/frontend/.env.production
     ```
   * **Contents**:
     ```env
     # Production Strapi API Endpoint
     NEXT_PUBLIC_STRAPI_API_URL=https://admin.layerbiz.com
     
     # Full-Access Token generated from Production Strapi Admin
     STRAPI_API_TOKEN=your_production_full_access_token_here
     
     # Email Dispatcher Credentials
     EMAIL_USER=layerbiz1@gmail.com
     EMAIL_PASS=vgqc qzzj uecr zlel
     
     # Your Private Destination Inbox (alerts land here)
     NOTIFICATION_EMAIL=prateek.bhardwaj60@gmail.com
     ```
   * *Note: Because `.env.production` and `.env.local` are in `.gitignore`, GitHub Actions `git reset --hard` will NEVER overwrite or delete this file.*

2. **Backend Production Environment**:
   * **Path on Server**: `/home/layerbiz-admin/htdocs/admin.layerbiz.com/backend/.env`
   * Create this file **once** directly on your server via SSH:
     ```bash
     ssh layerbiz-admin@<YOUR_SERVER_IP>
     nano /home/layerbiz-admin/htdocs/admin.layerbiz.com/backend/.env
     ```
   * **Contents**:
     ```env
     HOST=0.0.0.0
     PORT=1337
     
     # Strapi Secrets (generate or use your existing production keys)
     APP_KEYS=...
     API_TOKEN_SALT=...
     ADMIN_JWT_SECRET=...
     JWT_SECRET=...
     TRANSFER_TOKEN_SALT=...
     ENCRYPTION_KEY=...
     
     # Production MySQL Database
     DATABASE_CLIENT=mysql
     DATABASE_HOST=127.0.0.1
     DATABASE_PORT=3306
     DATABASE_NAME=layerbizdb
     DATABASE_USERNAME=root
     DATABASE_PASSWORD=your_db_password
     DATABASE_SSL=false
     ```

#### 3. Important Production Step:
* When you deploy to production, log in to your production Strapi Admin (`admin.layerbiz.com/admin`), go to **Settings** $\rightarrow$ **API Tokens** $\rightarrow$ **Create New API Token**:
  * Name: `Frontend Production Token`
  * Token duration: `Unlimited`
  * Token type: **`Full Access`**
* Copy that token into `/home/layerbiz/htdocs/layerbiz.com/frontend/.env.production` as `STRAPI_API_TOKEN`.

---

## 6. Quick Verification Commands

```bash
# 1. Test Fetching Blog Posts via API
curl -s http://127.0.0.1:1337/api/blog-posts

# 2. Test Creating a Contact Inquiry via API
curl -s -X POST http://127.0.0.1:1337/api/contact-inquiries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{"data":{"name":"Test User","email":"test@example.com","subject":"Test","message":"Hello"}}'

# 3. Test Subscribing to Newsletter via API
curl -s -X POST http://127.0.0.1:1337/api/newsletter-subscribers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{"data":{"email":"newsubscriber@example.com","status":"active"}}'
```

---

## 7. Step-by-Step Gmail SMTP App Password Setup

To enable automated email alerts via Gmail without exposing your real password:

1. **Enable 2-Step Verification**:
   * Go to [Google Account Security](https://myaccount.google.com/security).
   * Ensure **2-Step Verification** is turned **ON** on your sender account (`layerbiz1@gmail.com`).

2. **Generate an App Password**:
   * Open the direct link: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
   * Under **App name**, enter a descriptive identifier: `LayerBiz Website`.
   * Click **Create**.
   * Google will display a **16-character password** (e.g. `vgqc qzzj uecr zlel`).

3. **Add to Environment Files**:
   * Add the sender email and generated 16-character key to `.env.local` (local) and `.env.production` (remote):
     ```env
     EMAIL_USER=layerbiz1@gmail.com
     EMAIL_PASS=vgqc qzzj uecr zlel
     NOTIFICATION_EMAIL=prateek.bhardwaj60@gmail.com
     ```

4. **How It Runs**:
   * Next.js uses Nodemailer with `service: 'gmail'`.
   * When forms are submitted, it sends emails from `layerbiz1@gmail.com` directly to `NOTIFICATION_EMAIL` (`prateek.bhardwaj60@gmail.com`).
   * The sender's email address is attached as `replyTo`, allowing 1-click replies from your Gmail inbox.

