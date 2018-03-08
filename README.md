# Booth Tech

Dear Future Reader,

This README was written to preserve the hashtag institutional knowledge of the technological geniuses
in AEPi. It includes how to set up Raspberry Pis minimally for booth, installing TypeScript and related
tools, and an explanation and rationale for our heavy use of Socket.io.

## Table of Contents

1. [Components](#components)
2. [Setting up your Pi](#setting-up-your-pi)
3. [Socket io](#socket.io)
4. [Misc tidbits and tips](#misc-tips)

## Components

The base booth tech kit comes with:

* Raspberry Pi
* Micro SD card
* Micro SD card reader
* Power supply
* Micro USB cable

You will need all of these things to continue.

## Setting up your Pi

If you were given a Pi that was already set up, you can skip this section.

If you are the one setting up the Pis, you might find this section helpful.

These instructions were written specifically for Mac.

1. Download [Etcher](https://etcher.io/)
2. Download [Raspbian](https://www.raspberrypi.org/downloads/raspbian/) (it may be faster to use the torrent download)
   * If you don't need the desktop, I recommend going with lite.
3. Put the Micro SD card into the reader
4. Plug the reader into your computer
5. Open Etcher
6. Select the zip of Raspbian
7. Select the reader as the storage device
8. Flash!
9. Plug a keyboard (via USB), mouse (via USB), screen (via HDMI), and the Micro SD card into your pi.
   * The micro SD card should be taken out of the reader and put into the pie directly. The slot is on the bottom.
10. If you are at CMU and plan to use the internet on the Pi, [you'll need to register its MAC address](https://netreg.net.cmu.edu/)
    1. Click Enter
    2. Click Register New Machine
    3. In the first dropdown, select Legacy Wireless Network and then click continue
    4. Type whatever you want for the hostname.
    5. On the Pi, open up the Terminal and type `ifconfig`
    6. Type the MAC address (should look like AA:BB:CC:DD) into the Hardware address box
    7. Select Student Organization under affiliation
    8. Click continue
    9. In about 30 minutes, you should be able to access the internet from the Pi.
11. Try to open chromium on your pi. If it doesn't let you access the internet after waiting for 30 minutes, follow this [SO answer](https://raspberrypi.stackexchange.com/a/47715).
    * Instead of internationalistation options, you'll want localisation options.
12. Set up the Pi SSH and VNC servers
    1. Run `sudo rapsi-config` in a terminal window
    2. Select `Interfacing Options`
    3. Navigate to and select `SSH`
    4. Choose `Yes`
    5. Select `Ok`
    6. Do the same for `VNC`
    7. Choose `Finish`
    8. Now you can ssh onto the pi by connecting to it via ethernet and 
       running `ssh pi@raspberrypi.local`. The password is `raspberry` by
       default.
    9. You can also connect to the Pi with VNC. See 
       `https://www.raspberrypi.org/documentation/remote-access/vnc/README.md`
       for more information.
13. Set up typescript + node on the Pi
    1. curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
    2. Install node, `sudo apt-get install node`
    3. Install TypeScript, `sudo npm install -g typescript`
    4. Install nodemon, `sudo npm install -g nodemon`
14. Set up Samba on the pi
    1. `sudo apt-get install samba samba-common-bin`
    2. `sudo smbpasswd -a pi`
    3. `nano /etc/samba/smb.conf`
    4. Edit the file to read as [SambaConfig](/setup/SambaConfig)
    5. `service smbd restart`
    6. Now, you may access the Pi's file system from your mac. Open finder
       -> Go -> Connect to Server
    7. Set the server to smb://<piname>.local
       * By default, <piname> is raspberrypi

You now have a linux machine on which you may begin developing.

## Socket.io



## Misc Tips

* You will not be able to use anything that requries Internet access at runtime-- we will only have access to each other's machines via our LAN network.
* The most important thing is robustness. Make sure your pi will not crash under any circumstances.
