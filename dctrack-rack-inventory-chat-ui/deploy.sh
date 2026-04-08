#!/bin/bash
# ============================================================
# Rack Inventory Chat UI - OpenShift Deploy Script
# Namespace: aitp-ui  (same as dctrack-chat-ui pattern)
# Route: rack-inventory-chat.apps.ocp419.crucible.iisl.com
# Webhook target: workflows.apps.ocp419.crucible.iisl.com
#                 /webhook/rack-inventory
# ============================================================
set -e

NAMESPACE="aitp-ui"
APP_NAME="rack-inventory-chat"
ROUTE_HOST="rack-inventory-chat.apps.ocp419.crucible.iisl.com"
N8N_WEBHOOK="https://workflows.apps.ocp419.crucible.iisl.com/webhook/rack-inventory"

echo "=================================================="
echo "  Rack Inventory Chat UI - Deploy"
echo "  Namespace : $NAMESPACE"
echo "  Route     : $ROUTE_HOST"
echo "  Webhook   : $N8N_WEBHOOK"
echo "=================================================="

# ── STEP 1: Create HTML ConfigMap ──────────────────────────
echo ""
echo "[1/5] Creating HTML ConfigMap..."
oc create configmap rack-inventory-chat-html \
  --from-file=index.html="$(dirname "$0")/index.html" \
  -n "$NAMESPACE" \
  --dry-run=client -o yaml | oc apply -f -
echo "      ✓ HTML ConfigMap applied"

# ── STEP 2: Create nginx ConfigMap from file ─────────────
echo ""
echo "[2/6] Creating nginx ConfigMap..."
oc create configmap rack-inventory-chat-nginx \
  --from-file=default.conf="$(dirname "$0")/nginx.conf" \
  -n "$NAMESPACE" \
  --dry-run=client -o yaml | oc apply -f -
echo "      ✓ Nginx ConfigMap applied"

# ── STEP 3: Apply deployment, service, route ──────────────
echo ""
echo "[3/6] Applying deployment, service, route..."

cat <<EOF | oc apply -f -
---
# ── Deployment ─────────────────────────────────────────────
apiVersion: apps/v1
kind: Deployment
metadata:
  name: $APP_NAME
  namespace: $NAMESPACE
  labels:
    app: $APP_NAME
    version: "1.0"
spec:
  replicas: 2
  selector:
    matchLabels:
      app: $APP_NAME
  template:
    metadata:
      labels:
        app: $APP_NAME
    spec:
      containers:
      - name: nginx
        image: nginxinc/nginx-unprivileged:alpine
        ports:
        - containerPort: 8080
          name: http
        volumeMounts:
        - name: html
          mountPath: /usr/share/nginx/html
        - name: nginx-conf
          mountPath: /etc/nginx/conf.d
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "128Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 3
          periodSeconds: 5
      volumes:
      - name: html
        configMap:
          name: rack-inventory-chat-html
      - name: nginx-conf
        configMap:
          name: rack-inventory-chat-nginx
---
# ── Service ────────────────────────────────────────────────
apiVersion: v1
kind: Service
metadata:
  name: $APP_NAME
  namespace: $NAMESPACE
  labels:
    app: $APP_NAME
spec:
  selector:
    app: $APP_NAME
  ports:
  - name: http
    port: 80
    targetPort: 8080
---
# ── Route ──────────────────────────────────────────────────
apiVersion: route.openshift.io/v1
kind: Route
metadata:
  name: $APP_NAME
  namespace: $NAMESPACE
  labels:
    app: $APP_NAME
spec:
  host: $ROUTE_HOST
  to:
    kind: Service
    name: $APP_NAME
    weight: 100
  tls:
    termination: edge
    insecureEdgeTerminationPolicy: Redirect
  wildcardPolicy: None
EOF

echo "      ✓ Resources applied"

# ── STEP 4: Wait for rollout ───────────────────────────────
echo ""
echo "[4/6] Waiting for rollout..."
oc rollout status deployment/$APP_NAME -n "$NAMESPACE" --timeout=120s
echo "      ✓ Pods running"

# ── STEP 5: Verify ────────────────────────────────────────
echo ""
echo "[5/6] Verifying..."
oc get pods -n "$NAMESPACE" -l app="$APP_NAME"
echo ""
oc get route "$APP_NAME" -n "$NAMESPACE"

# ── STEP 6: Smoke test ────────────────────────────────────
echo ""
echo "[6/6] Smoke testing route..."
sleep 3
STATUS=$(curl -sk -o /dev/null -w "%{http_code}" "https://$ROUTE_HOST/health")
if [ "$STATUS" = "200" ]; then
  echo "      ✓ Health check passed (HTTP $STATUS)"
else
  echo "      ⚠ Health check returned HTTP $STATUS — pod may still be starting"
fi

echo ""
echo "=================================================="
echo "  DONE"
echo "  Chat UI: https://$ROUTE_HOST"
echo "  Test:    curl -X POST https://$ROUTE_HOST/api/rack \\"
echo "             -H 'Content-Type: application/json' \\"
echo "             -d '{\"image_url\":\"https://example.com/rack.jpg\",\"output_format\":\"json\"}'"
echo "=================================================="
