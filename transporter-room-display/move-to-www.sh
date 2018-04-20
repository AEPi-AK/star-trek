#!/bin/bash

cp ../shared/*.ts ./src/shared

sudo cp -r ~/star-trek/transporter-room-display /var/www
cd /var/www/transporter-room-display
sudo npm install
sudo npm run build
