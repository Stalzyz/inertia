#!/usr/bin/env bash
# One-time Ubuntu VPS setup for the Inertia Creations site.
# Run as root: sudo bash deploy/setup-vps.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/inertia}"
APP_USER="${APP_USER:-inertia}"
REPO_URL="${REPO_URL:-https://github.com/Stalzyz/inertia.git}"
BRANCH="${BRANCH:-inertia-studio}"
DOMAIN="${DOMAIN:-web.inertiacreation.in}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this script as root (sudo bash deploy/setup-vps.sh)." >&2
  exit 1
fi

for cmd in curl git apt-get systemctl; do
  if ! command -v "${cmd}" >/dev/null 2>&1; then
    echo "Missing required command: ${cmd}" >&2
    exit 1
  fi
done

if ! command -v node >/dev/null 2>&1; then
  echo "Installing Node.js 22 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

echo "Node version: $(node --version)"

if ! id -u "${APP_USER}" >/dev/null 2>&1; then
  useradd --system --create-home --shell /bin/bash "${APP_USER}"
fi

mkdir -p "${APP_DIR}" "${APP_DIR}/data/uploads"

if [[ ! -d "${APP_DIR}/.git" ]]; then
  echo "Cloning ${BRANCH} from ${REPO_URL}..."
  git clone --branch "${BRANCH}" "${REPO_URL}" "${APP_DIR}"
fi

ENV_FILE="${APP_DIR}/.env.production.local"
if [[ ! -f "${ENV_FILE}" ]]; then
  cat > "${ENV_FILE}" <<EOF
# Set a long, unique password before restarting the site.
ADMIN_PASSWORD=CHANGE_ME_WITH_A_LONG_RANDOM_PASSWORD
NEXT_PUBLIC_SITE_URL=https://${DOMAIN}
CONTACT_WEBHOOK_URL=https://garage.grekam.in/api/v1/crm/public/leads/inertiacreation
EOF
  chmod 600 "${ENV_FILE}"
  echo "Created ${ENV_FILE}. Edit ADMIN_PASSWORD before deploying."
fi

chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"
chmod 600 "${ENV_FILE}"

install -m 644 "${APP_DIR}/deploy/inertia.service" /etc/systemd/system/inertia.service
systemctl daemon-reload
systemctl enable inertia

echo
echo "Setup complete."
echo "1. Edit ${ENV_FILE} and replace ADMIN_PASSWORD."
echo "2. Run: sudo bash ${APP_DIR}/deploy/deploy.sh"
echo "3. Configure Nginx with deploy/nginx.conf.example and point ${DOMAIN} at this VPS."
