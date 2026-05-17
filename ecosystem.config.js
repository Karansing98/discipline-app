module.exports = {
  apps: [{
    name: "discipline-app",
    script: "node_modules/next/dist/bin/next",
    args: "start",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
    },
    instances: 1,
    exec_mode: "fork",
    watch: false,
    max_memory_restart: "500M",
    error_file: "logs/err.log",
    out_file: "logs/out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
  }]
};
