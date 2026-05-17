# Deploy Free on Vercel (No VPS, No Upgrade Needed)

Since your Hostinger plan doesn't support Node.js, we'll deploy on **Vercel** (100% free, made by the creators of Next.js).

## Step 1: Create a GitHub Account

1. Go to https://github.com and sign up (free)
2. Verify your email

## Step 2: Upload Code to GitHub

After creating your account:

```bash
# On your computer, run these commands:
cd C:\Users\Public\apaleapp\discipline-app
git init
git add .
git commit -m "Initial commit"
```

Then on GitHub.com:
1. Click **+** → **New repository**
2. Name: `discipline-app`
3. Click **Create repository**
4. Run the commands GitHub shows you to push your code

## Step 3: Get a Free Database (Neon)

1. Go to https://neon.tech
2. Sign up with GitHub (free tier - 500MB data, plenty for your app)
3. Click **Create a project**
4. Name: `discipline-db`
5. Click **Create**
6. Copy the **connection string** (looks like: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/discipline-db?sslmode=require`)

## Step 4: Deploy on Vercel

1. Go to https://vercel.com
2. Sign up with GitHub (free)
3. Click **Add New...** → **Project**
4. Import your `discipline-app` GitHub repo
5. Click **Deploy** (it will fail first time - that's normal)

### Fix: Add Database Environment Variable

1. In Vercel dashboard → Your project → **Settings**
2. Click **Environment Variables**
3. Add:
   - **Name:** `DATABASE_URL`
   - **Value:** (paste the Neon connection string from Step 3)
4. Add another:
   - **Name:** `JWT_SECRET`
   - **Value:** (type a random string like: `my-super-secret-key-change-this-12345`)
5. Go to **Deployments** → Click the three dots on the failed one → **Redeploy**

After 1-2 minutes, your app is live at: **https://discipline-app.vercel.app**

## Step 5: Connect Your Domain

1. In Vercel dashboard → Project → **Settings** → **Domains**
2. Enter: `apaleapp.com`
3. Click **Add**
4. Vercel shows you DNS records to add

### On Hostinger hPanel:
1. Go to **Domains** → **DNS Zone Editor**
2. Delete existing A records
3. Add the CNAME record Vercel showed you
4. Wait 5-30 minutes for DNS to propagate

Done! Your app is live at **https://apaleapp.com** (free forever).

## Android App - Update API URL

After deploying, update the mobile app API URL:

Open `discipline-app-mobile/src/api/client.ts` and make sure it says:
```typescript
const BASE_URL = "https://apaleapp.com/api";
```

Then build the APK as described in the Android guide.

---

## Summary: What's Free

| Service | Cost | What it does |
|---------|------|-------------|
| Vercel | Free | Hosts your Next.js app + SSL |
| Neon | Free | PostgreSQL database (500MB) |
| GitHub | Free | Stores your code |
| Hostinger DNS | Free (you already have) | Points domain to Vercel |
| **Total** | **$0/month** | |
