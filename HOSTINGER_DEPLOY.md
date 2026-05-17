# Deploy on Hostinger Business Plan (No VPS Needed)

Since you have **Hostinger Business** hosting with `apaleapp.com`, you can deploy the Node.js app directly.

## Step 1: Upload Files

1. Login to **hPanel** → **Hosting** → Select your plan
2. Go to **File Manager**
3. Navigate to `public_html` or create a folder like `discipline-app`
4. Upload all files from the `discipline-app` folder (the Next.js app)
5. Extract if uploaded as zip

## Step 2: Set Up Node.js App

1. In hPanel → **Hosting** → **Advanced** → **Node.js**
2. Click **Add Node.js App**
3. Fill in:
   - **App root:** `/discipline-app` (or wherever you uploaded)
   - **Entry point:** `npm start`
   - **Build command:** `npm run build`
   - **App domain:** `apaleapp.com`
   - **Node.js version:** 22.x
4. Click **Create**

> If you don't see Node.js option, contact Hostinger support to enable it for your Business plan.

## Step 3: Wait for Build

Hostinger will automatically:
1. Install dependencies
2. Run the build command
3. Start the app
4. Link it to your domain

Your app will be live at: **https://apaleapp.com**

## Step 4: API Base URL

After deploying, update the API URL in the mobile app.

Open `discipline-app-mobile/src/api/client.ts` and change:
```typescript
// BEFORE:
const BASE_URL = "https://apaleapp.com/api";

// Keep it as is - it's already correct
```

---

# Android App - Build & Publish to Play Store

## Prerequisites

Install on your computer:
1. **Node.js** (v22): https://nodejs.org
2. **Git**: https://git-scm.com

## Step 1: Install Mobile App Dependencies

```bash
cd discipline-app-mobile
npm install
```

## Step 2: Install Expo CLI & EAS

```bash
npm install -g eas-cli
expo login
```

> Create a free Expo account at https://expo.dev if you don't have one.

## Step 3: Build APK for Play Store

### Option A: Free APK (without Expo)

```bash
npx expo run:android
```
This generates an APK in `android/app/build/outputs/apk/debug/`

### Option B: Production APK/AAB (for Play Store)

```bash
# 1. Build Android App Bundle (recommended for Play Store)
eas build --platform android --profile production

# 2. Or build APK for testing
eas build --platform android --profile preview
```

## Step 4: Publish to Google Play Store

1. Go to https://play.google.com/console
2. Pay $25 one-time registration fee
3. Click **Create app**
4. Fill in:
   - **App name:** Discipline Pro
   - **Package name:** `com.disciplinepro.app`
5. Upload the AAB file from Step 3
6. Fill in store listing (description, screenshots, etc.)
7. Submit for review (takes 1-3 days)

## Tips for Play Store Approval

- Take screenshots of all screens (Dashboard, Goals, Focus, Sleep, Analytics)
- Write a clear description about building discipline and habits
- Set content rating to "Everyone"
- Make sure privacy policy is accessible (use a free privacy policy generator)

---

## Update App After Changes

When you update the backend:

1. **Backend:** Re-upload changed files → Hostinger auto-rebuilds
2. **Mobile:** Run `eas build --platform android` again → upload new AAB to Play Store
