#!/bin/bash
# ============================================================
# Discipline Pro - Complete VPS Deployment Script
# Run this on your fresh Hostinger VPS (Ubuntu 22.04/24.04)
# ============================================================
# USAGE:
#   ssh root@your-server-ip
#   # Upload this script, then:
#   bash deploy-vps.sh yourdomain.com
# ============================================================

set -e

DOMAIN=$1
APP_DIR="/var/www/discipline-app"

if [ -z "$DOMAIN" ]; then
  echo "Usage: bash deploy-vps.sh yourdomain.com"
  exit 1
fi

echo ""
echo "=============================================="
echo "  Discipline Pro - Full VPS Setup"
echo "  Domain: $DOMAIN"
echo "=============================================="
echo ""

# --------------------------------------------------
# STEP 1: System Update & Basic Tools
# --------------------------------------------------
echo "[1/10] Updating system packages..."
apt-get update -y && apt-get upgrade -y
apt-get install -y curl wget git ufw nginx certbot python3-certbot-nginx

# --------------------------------------------------
# STEP 2: Firewall Setup
# --------------------------------------------------
echo "[2/10] Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# --------------------------------------------------
# STEP 3: Install Node.js 22
# --------------------------------------------------
echo "[3/10] Installing Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs
node -v
npm -v

# --------------------------------------------------
# STEP 4: Install PM2
# --------------------------------------------------
echo "[4/10] Installing PM2..."
npm install -g pm2

# --------------------------------------------------
# STEP 5: Create app directory & upload
# --------------------------------------------------
echo "[5/10] Setting up application directory..."
mkdir -p $APP_DIR
mkdir -p $APP_DIR/logs

echo "--> Upload your app files now, then press any key to continue."
echo "--> Use SCP: scp -r discipline-app/* root@YOUR_IP:$APP_DIR/"
read -n 1 -s -r -p ""

# --------------------------------------------------
# STEP 6: Install app dependencies
# --------------------------------------------------
echo "[6/10] Installing app dependencies..."
cd $APP_DIR
npm install --production

# --------------------------------------------------
# STEP 7: Create .env file with secure JWT secret
# --------------------------------------------------
echo "[7/10] Creating environment configuration..."
if [ ! -f .env ]; then
  JWT_SECRET=$(openssl rand -hex 32)
  cat > .env << EOF
JWT_SECRET=$JWT_SECRET
DATABASE_URL="file:./prisma/dev.db"
NODE_ENV=production
EOF
  echo "--> JWT_SECRET generated securely"
else
  echo "--> .env already exists, keeping existing"
fi

# --------------------------------------------------
# STEP 8: Build the app
# --------------------------------------------------
echo "[8/10] Building the application..."
npx prisma db push
npm run build

# --------------------------------------------------
# STEP 9: Start with PM2
# --------------------------------------------------
echo "[9/10] Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

# --------------------------------------------------
# STEP 10: Configure Nginx + SSL
# --------------------------------------------------
echo "[10/10] Configuring Nginx with SSL..."

cat > /etc/nginx/sites-available/$DOMAIN << 'NGINXEOF'
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 1000;
}
NGINXEOF

# Replace placeholder with actual domain
sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/sites-available/$DOMAIN

# Enable site and remove default
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# Get SSL certificate
echo "--> Obtaining SSL certificate from Let's Encrypt..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect

# --------------------------------------------------
# DONE
# --------------------------------------------------
echo ""
echo "=============================================="
echo "  ✅ DEPLOYMENT COMPLETE!"
echo "=============================================="
echo ""
echo "  Your app is live at:"
echo "  https://$DOMAIN"
echo ""
echo "  Useful commands:"
echo "  - View logs:  pm2 logs discipline-app"
echo "  - Restart:    pm2 restart discipline-app"
echo "  - Stop:       pm2 stop discipline-app"
echo "  - Monitor:    pm2 monit"
echo ""
echo "  SSL auto-renews via Certbot"
echo "=============================================="
