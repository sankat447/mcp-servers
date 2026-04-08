#!/bin/bash
# Remove all rack-inventory-chat resources from aitp-ui
NAMESPACE="aitp-ui"
APP_NAME="rack-inventory-chat"

echo "Removing $APP_NAME from $NAMESPACE..."
oc delete deployment "$APP_NAME" -n "$NAMESPACE" --ignore-not-found
oc delete service "$APP_NAME" -n "$NAMESPACE" --ignore-not-found
oc delete route "$APP_NAME" -n "$NAMESPACE" --ignore-not-found
oc delete configmap rack-inventory-chat-html -n "$NAMESPACE" --ignore-not-found
oc delete configmap rack-inventory-chat-nginx -n "$NAMESPACE" --ignore-not-found
echo "Done."
