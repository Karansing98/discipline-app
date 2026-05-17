#!/bin/bash
# Discipline Pro - Production Setup Script for Linux VPS
# Run this on your Hostinger VPS (Ubuntu/Debian)

set -e

echo "=== Discipline Pro - Production Setup ==="

# 1. Install Node.js if not present
if ! command -v node &> /dev/null; then
  echo "Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# 2. Install PM2 globally
echo "Installing PM2..."
sudo npm install -g pm2

# 3. Clone or upload your app
# git clone <your-repo> /var/www/discipline-app
# OR upload files manually via SCP/FTP

APP_DIR="/var/www/discipline-app"
cd $APP_DIR

# 4. Install dependencies
echo "Installing dependencies..."
npm install --production

# 5. Build the app
echo "Building..."
npm run build

# 6. Setup environment
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cat > .env << 'ENVEOF'
JWT_SECRET=$(openssl rand -hex 32)
DATABASE_URL="file:./prisma/dev.db"
NODE_ENV=production
ENVEOF
fi

# 7. Push database schema
echo "Setting up database..."
npx prisma db push

# 8. Start with PM2
echo "Starting app with PM2..."
pm2 start ecosystem.config.js
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $(whoami) --hp /home/$(whoami)

# 9. Setup Nginx reverse proxy (optional)
echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Next steps:"
echo "  1. Point your domain to this server's IP"
echo "  2. Install Nginx and configure as reverse proxy:"
echo "     server {"
echo "       listen 80;"
echo "       server_name yourdomain.com;"
echo "       location / {"
echo "         proxy_pass http://localhost:3000;"
echo "         proxy_http_version 1.1;"
echo "         proxy_set_header Upgrade \$http_upgrade;"
echo "         proxy_set_header Connection 'upgrade';"
echo "         proxy_set_header Host \$host;"
echo "       }"
echo "     }"
echo "  3. Run: sudo apt-get install -y nginx certbot python3-certbot-nginx"
echo "  4. Run: sudo certbot --nginx -d yourdomain.com"
echo ""
echo "App is running at http://localhost:3000"
