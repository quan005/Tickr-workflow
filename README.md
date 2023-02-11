# Tickr-workflow

-e TEMPORAL_TLS_SERVER_NAME=temporal-ui.tickrbot.com \
 -e TEMPORAL_TLS_CA=/etc/letsencrypt/live/www.temporal-ui.tickrbot.com/fullchain.pem \
 -e TEMPORAL_TLS_CERT=/etc/letsencrypt/live/www.temporal-ui.tickrbot.com/cert.pem \
 -e TEMPORAL_TLS_KEY=/etc/letsencrypt/live/www.temporal-ui.tickrbot.com/privkey.pem \
 -e TEMPORAL_TLS_ENABLE_HOST_VERIFICATION=false \
 temporalio/ui:latest
