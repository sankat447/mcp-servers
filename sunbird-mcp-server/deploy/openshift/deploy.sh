#!/bin/bash
# =============================================================================
# Sunbird MCP Server — OpenShift Deployment Script
# =============================================================================
# Usage:
#   ./deploy.sh                    # Deploy using existing deployment.yaml
#   ./deploy.sh --from-template    # Generate deployment.yaml from template
#   ./deploy.sh --build-only       # Only build and push the image
#   ./deploy.sh --rollout          # Trigger a new rollout of existing deployment
# =============================================================================

set -euo pipefail

# Configuration
NAMESPACE="${NAMESPACE:-aitp-ai}"
APP_NAME="sunbird-mcp-server"
IMAGE_REGISTRY="image-registry.openshift-image-registry.svc:5000"
IMAGE_NAME="${IMAGE_REGISTRY}/${NAMESPACE}/${APP_NAME}:latest"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR}/../.."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()   { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }
step()  { echo -e "\n${CYAN}==>${NC} $1"; }

# ---------------------------------------------------------------------------
# Pre-flight checks
# ---------------------------------------------------------------------------
preflight() {
  step "Running pre-flight checks..."

  if ! command -v oc &>/dev/null; then
    error "oc CLI not found. Install: https://docs.openshift.com/container-platform/latest/cli_reference/openshift_cli/getting-started-cli.html"
    exit 1
  fi

  if ! oc whoami &>/dev/null; then
    error "Not logged in to OpenShift. Run: oc login <cluster-url>"
    exit 1
  fi

  CURRENT_PROJECT=$(oc project -q 2>/dev/null || true)
  if [ "$CURRENT_PROJECT" != "$NAMESPACE" ]; then
    warn "Switching to project ${NAMESPACE}"
    oc project "$NAMESPACE" || { error "Cannot switch to project ${NAMESPACE}"; exit 1; }
  fi

  log "Logged in as: $(oc whoami)"
  log "Cluster: $(oc whoami --show-server)"
  log "Project: ${NAMESPACE}"
}

# ---------------------------------------------------------------------------
# Generate deployment.yaml from template
# ---------------------------------------------------------------------------
generate_from_template() {
  step "Generating deployment.yaml from template..."

  local TEMPLATE="${SCRIPT_DIR}/deployment.template.yaml"
  local OUTPUT="${SCRIPT_DIR}/deployment.yaml"

  if [ ! -f "$TEMPLATE" ]; then
    error "Template not found: ${TEMPLATE}"
    exit 1
  fi

  read -rp "Sunbird Base URL [https://192.168.200.201]: " SUNBIRD_URL
  SUNBIRD_URL="${SUNBIRD_URL:-https://192.168.200.201}"

  read -rp "Sunbird Username [API]: " SUNBIRD_USER
  SUNBIRD_USER="${SUNBIRD_USER:-API}"

  read -rsp "Sunbird Password: " SUNBIRD_PASS
  echo

  if [ -z "$SUNBIRD_PASS" ]; then
    error "Password cannot be empty"
    exit 1
  fi

  sed \
    -e "s|__SUNBIRD_BASE_URL__|${SUNBIRD_URL}|g" \
    -e "s|__SUNBIRD_USERNAME__|${SUNBIRD_USER}|g" \
    -e "s|__SUNBIRD_PASSWORD__|${SUNBIRD_PASS}|g" \
    "$TEMPLATE" > "$OUTPUT"

  log "Generated: ${OUTPUT}"
  warn "This file contains credentials — do NOT commit it to git"
}

# ---------------------------------------------------------------------------
# Build & Push image
# ---------------------------------------------------------------------------
build_and_push() {
  step "Building Docker image..."
  cd "$PROJECT_ROOT"

  # Build using OpenShift's BuildConfig or local Docker
  if command -v docker &>/dev/null; then
    log "Building with Docker..."
    docker build -t "${APP_NAME}:latest" -f Dockerfile .

    step "Pushing to OpenShift internal registry..."
    # Get the external route for the registry
    REGISTRY_ROUTE=$(oc get route default-route -n openshift-image-registry -o jsonpath='{.spec.host}' 2>/dev/null || echo "")

    if [ -n "$REGISTRY_ROUTE" ]; then
      docker tag "${APP_NAME}:latest" "${REGISTRY_ROUTE}/${NAMESPACE}/${APP_NAME}:latest"
      docker push "${REGISTRY_ROUTE}/${NAMESPACE}/${APP_NAME}:latest"
      log "Image pushed to: ${REGISTRY_ROUTE}/${NAMESPACE}/${APP_NAME}:latest"
    else
      warn "External registry route not found. Using oc new-build instead..."
      oc_build
    fi
  else
    oc_build
  fi
}

oc_build() {
  step "Building with OpenShift BuildConfig..."
  cd "$PROJECT_ROOT"

  # Create or update BuildConfig
  if oc get bc "${APP_NAME}" &>/dev/null; then
    log "BuildConfig exists, starting new build..."
    oc start-build "${APP_NAME}" --from-dir=. --follow --wait
  else
    log "Creating new BuildConfig..."
    oc new-build --name="${APP_NAME}" --binary --strategy=docker
    oc start-build "${APP_NAME}" --from-dir=. --follow --wait
  fi

  log "Build completed successfully"
}

# ---------------------------------------------------------------------------
# Deploy
# ---------------------------------------------------------------------------
deploy() {
  local DEPLOY_FILE="${SCRIPT_DIR}/deployment.yaml"

  if [ ! -f "$DEPLOY_FILE" ]; then
    error "deployment.yaml not found. Run with --from-template first."
    exit 1
  fi

  step "Applying deployment manifests..."
  oc apply -f "$DEPLOY_FILE"

  step "Waiting for rollout..."
  oc rollout status deployment/${APP_NAME} -n ${NAMESPACE} --timeout=300s

  step "Verifying deployment..."
  POD_COUNT=$(oc get pods -l app=${APP_NAME} -n ${NAMESPACE} --field-selector=status.phase=Running -o name 2>/dev/null | wc -l | tr -d ' ')
  log "Running pods: ${POD_COUNT}"

  ROUTE_HOST=$(oc get route sunbird-mcp -n ${NAMESPACE} -o jsonpath='{.spec.host}' 2>/dev/null || echo "N/A")
  log "Route: https://${ROUTE_HOST}"

  step "Testing health endpoint..."
  sleep 5
  if curl -sk "https://${ROUTE_HOST}/health" | grep -q "ok\|healthy"; then
    log "Health check PASSED"
  else
    warn "Health check did not return expected response (pods may still be starting)"
  fi

  echo ""
  log "Deployment complete!"
  echo ""
  echo "  URL:     https://${ROUTE_HOST}"
  echo "  Health:  https://${ROUTE_HOST}/health"
  echo "  Tools:   https://${ROUTE_HOST}/tools"
  echo "  MCP:     https://${ROUTE_HOST}/mcp"
  echo ""
}

# ---------------------------------------------------------------------------
# Rollout (restart pods with latest image)
# ---------------------------------------------------------------------------
rollout() {
  step "Triggering rollout restart..."
  oc rollout restart deployment/${APP_NAME} -n ${NAMESPACE}
  oc rollout status deployment/${APP_NAME} -n ${NAMESPACE} --timeout=300s
  log "Rollout complete"
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
case "${1:-}" in
  --from-template)
    preflight
    generate_from_template
    build_and_push
    deploy
    ;;
  --build-only)
    preflight
    build_and_push
    ;;
  --rollout)
    preflight
    rollout
    ;;
  --help|-h)
    echo "Usage: $0 [--from-template | --build-only | --rollout | --help]"
    echo ""
    echo "  (no args)        Build, push, and deploy using existing deployment.yaml"
    echo "  --from-template  Generate deployment.yaml from template, then build & deploy"
    echo "  --build-only     Only build and push the Docker image"
    echo "  --rollout        Trigger a new rollout of existing deployment"
    echo ""
    ;;
  *)
    preflight
    build_and_push
    deploy
    ;;
esac
