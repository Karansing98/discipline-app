# Discipline Pro - Complete Deployment Guide

## Prerequisites
- A Hostinger account
- A domain name (yourdomain.com)
- ~$10-15/month for a VPS

---

## Step 1: Buy a VPS from Hostinger

1. Go to https://www.hostinger.com/vps
2. Choose **VPS 1** plan ($9.99/mo or less) - enough for this app
3. Select **Ubuntu 22.04 LTS** as OS
4. Complete purchase

## Step 2: Point Your Domain to the VPS

1. Login to your Hostinger hPanel
2. Go to **Domains** → click your domain → **DNS Zone Editor**
3. Delete all existing A records
4. Add a new **A record**:
   - **Type:** A
   - **Name:** @ (or leave empty)
   - **Value:** (your VPS IP address)
   - **TTL:** 14400
5. Optionally add `www` subdomain:
   - **Type:** A
   - **Name:** www
   - **Value:** (your VPS IP)
6. Wait 5-30 minutes for DNS to propagate

> **Find your VPS IP:** Hostinger hPanel → VPS → your VPS → find the IPv4 address

## Step 3: Connect to Your VPS via SSH

### On Windows:
Open **Command Prompt** or **PowerShell**:
```powershell
ssh root@your-vps-ip
```
Type `yes` when asked about fingerprint, then enter your root password.

> **Get your root password:** hPanel → VPS → your VPS → **Root password** (click eye icon)

### On Mac/Linux:
```bash
ssh root@your-vps-ip
```

## Step 4: Upload the App to VPS

While connected via SSH (or open a new terminal):

### Option A: Upload from your computer (SCP)

**On your local machine** (not on VPS):
```bash
# From inside the discipline-app folder, run on YOUR computer:
scp -r * root@your-vps-ip:/var/www/discipline-app/
```

### Option B: Upload via Hostinger File Manager
1. Zip the `discipline-app` folder on your computer:
   ```powershell
   # On your computer, in PowerShell:
   Compress-Archive -Path "C:\Users\Public\apaleapp\discipline-app\*" -DestinationPath "discipline-app.zip"
   ```
2. hPanel → VPS → **File Manager**
3. Navigate to `/var/www/`
4. Upload `discipline-app.zip`
5. Right-click → **Extract**

## Step 5: Run the Deployment Script

Back in your SSH terminal on the VPS:
```bash
cd /var/www/discipline-app
bash scripts/deploy-vps.sh yourdomain.com
```

This single command does EVERYTHING:
- Updates the server
- Sets up firewall
- Installs Node.js, Nginx, PM2, Certbot
- Installs app dependencies
- Creates secure JWT secret
- Builds the app
- Configures Nginx reverse proxy
- Gets free SSL certificate from Let's Encrypt
- Starts the app

## Step 6: Done!

Visit `https://yourdomain.com` - your app is live.

---

## Management Commands

| Action | Command |
|--------|---------|
| View live logs | `pm2 logs discipline-app` |
| Restart app | `pm2 restart discipline-app` |
| Stop app | `pm2 stop discipline-app` |
| Monitor CPU/RAM | `pm2 monit` |
| List processes | `pm2 list` |
| Nginx logs | `tail -f /var/log/nginx/access.log` |
| App error logs | `tail -f /var/www/discipline-app/logs/err.log` |

---

## Updating the App

When you make changes locally, redeploy:

```bash
# 1. On your local machine, upload changed files:
scp -r src/* package.json root@your-vps-ip:/var/www/discipline-app/

# 2. SSH into VPS and rebuild:
ssh root@your-vps-ip
cd /var/www/discipline-app
npm install
npm run build
pm2 restart discipline-app
```

---

## Troubleshooting

**App shows 502 Bad Gateway**
```bash
pm2 status                    # Check if app is running
pm2 logs discipline-app --lines 50  # Check for errors
systemctl status nginx        # Check if Nginx is running
```

**SSL not working**
```bash
certbot certificates          # Check existing certs
certbot --nginx -d yourdomain.com  # Re-issue certificate
```

**Port 3000 already in use**
```bash
kill $(lsof -t -i:3000)       # Kill process on port 3000
pm2 start ecosystem.config.js  # Restart app
```
