#!/bin/bash
while true; do killall chromium-browser; chromium-browser --password-store=basic --kiosk --app="http://localhost"; sleep 3s; done
