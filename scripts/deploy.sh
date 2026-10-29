#!/usr/bin/env bash
# Build and publish the static site to the OVH origin; vps-edge serves it as https://somchai.dev.
# Each release lands in its own directory and `current` is switched atomically.
# Rollback: ssh ovhvps 'cd /var/www/somchai.dev && ln -sfn releases/<id> current.tmp && mv -T current.tmp current'
set -euo pipefail

host="${DEPLOY_HOST:-ovhvps}"
root=/var/www/somchai.dev
keep=5

cd "$(dirname "$0")/.."
if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree is dirty; commit before deploying." >&2
  exit 1
fi

release="$(date -u +%Y%m%d%H%M%S)-$(git rev-parse --short HEAD)"
npm run build
rsync -az --delete dist/ "$host:$root/releases/$release/"
ssh "$host" "set -e
  cd $root
  ln -sfn releases/$release current.tmp && mv -T current.tmp current
  ls -1dt releases/* | tail -n +$((keep + 1)) | xargs -r rm -rf"
echo "Deployed $release"
