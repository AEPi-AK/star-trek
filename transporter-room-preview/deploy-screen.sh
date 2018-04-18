#!/bin/bash
while true; do killall chromium-browser; chromium-browser --password-store=basic --kiosk --app="http://master-server.local"; sleep 3s; done
