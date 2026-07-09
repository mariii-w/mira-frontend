#!/usr/bin/env bash
set -euo pipefail

DOCKERHUB_USERNAME=ethelin17
IMAGE_NAME=mira-uni
: "${DOCKERHUB_TOKEN:?Missing DOCKERHUB_TOKEN}"

TAG="${TAG:-latest}"
DOCKERFILE="${DOCKERFILE:-Dockerfile}"
CONTEXT="${CONTEXT:-.}"
PLATFORM="${PLATFORM:-linux/amd64}"

FULL_IMAGE="${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${TAG}"

echo "$DOCKERHUB_TOKEN" | docker login \
  --username "$DOCKERHUB_USERNAME" \
  --password-stdin

docker buildx build \
  --platform "$PLATFORM" \
  -f "$DOCKERFILE" \
  -t "$FULL_IMAGE" \
  --push \
  "$CONTEXT"

echo "Published: $FULL_IMAGE"

curl -X POST "$REDEPLOY_HOOK"
