#!/bin/bash

cp ../shared/*.ts ./src/shared

sudo cp -r ~/star-trek/game-screen /var/www
cd /var/www/game-screen
sudo npm install
sudo npm run build
