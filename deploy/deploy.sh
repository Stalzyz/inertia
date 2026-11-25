#!/usr/bin/env bash
# Pull the latest Inertia code, rebuild it and restart the systemd service.
# Run as root: sudo bash deploy/deploy.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/inertia}"
APP_USER="${APP_USER:-inertia}"
BRANCH="${BRANCH:-inertia-studio}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run this script as root (sudo bash deploy/deploy.sh)." >&2
  exit 1
fi

cd "${APP_DIR}"

ENV_FILE="${APP_DIR}/.env.production.local"
if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}. Run deploy/setup-vps.sh first." >&2
  exit 1
fi

if grep -q "CHANGE_ME_WITH_A_LONG_RANDOM_PASSWORD" "${ENV_FILE}"; then
  echo "Set a real ADMIN_PASSWORD in ${ENV_FILE} before deploying." >&2
  exit 1
fi

# Admin content and uploads live in data/. Preserve them across code updates.
DATA_BACKUP="$(mktemp -d)"
trap 'rm -rf "${DATA_BACKUP}"' EXIT
if [[ -d "${APP_DIR}/data" ]]; then
  cp -a "${APP_DIR}/data/." "${DATA_BACKUP}/"
fi

echo "Updating ${BRANCH}..."
sudo -u "${APP_USER}" git fetch origin "${BRANCH}"
sudo -u "${APP_USER}" git reset --hard "origin/${BRANCH}"

mkdir -p "${APP_DIR}/data/uploads"
if find "${DATA_BACKUP}" -mindepth 1 | grep -q .; then
  cp -a "${DATA_BACKUP}/." "${APP_DIR}/data/"
fi
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}/data"

echo "Installing dependencies..."
sudo -u "${APP_USER}" npm ci

echo "Checking and building..."
sudo -u "${APP_USER}" npm run lint
sudo -u "${APP_USER}" npm run build

echo "Restarting service..."
systemctl restart inertia
systemctl --no-pager status inertia

echo "Deployed. Data files are preserved in ${APP_DIR}/data."
