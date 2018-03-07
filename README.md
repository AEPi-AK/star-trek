# Booth Tech Setup Guide

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
    a. Click Enter
    b. Click Register New Machine
    c. In the first dropdown, select Legacy Wireless Network and then click continue
    d. Type whatever you want for the hostname.
    e. On the Pi, open up the Terminal and type `ifconfig`
    f. Type the MAC address (should look like AA:BB:CC:DD) into the Hardware address box
    g. Select Student Organization under affiliation
    h. Click continue
    i. In about 30 minutes, you should be able to access the internet from the Pi.
11. Try to open chromium on your pi. If it doesn't let you access the internet after waiting for 30 minutes, follow this [SO answer](https://raspberrypi.stackexchange.com/a/47715).
    * Instead of internationalistation options, you'll want localisation options.
12. Set up the Pi SSH and VNC servers
    a. Run `sudo rapsi-config` in a terminal window
    b. Select `Interfacing Options`
    c. Navigate to and select `SSH`
    d. Choose `Yes`
    e. Select `Ok`
    f. Do the same for `VNC`
    g. Choose `Finish`
    h. Now you can ssh onto the pi by connecting to it via ethernet and 
       running `ssh pi@raspberrypi.local`. The password is `raspberry` by
       default.
    i. You can also connect to the Pi with VNC. See 
       `https://www.raspberrypi.org/documentation/remote-access/vnc/README.md`
       for more information.
13. Set up typescript + node on the Pi 
    a. curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
    b. Install node, `sudo apt-get install node`
    c. Install TypeScript, `sudo npm install -g typescript`
    d. Install nodemon, `sudo npm install -g nodemon`
14. Set up Samba on the pi
    a. `sudo apt-get install samba samba-common-bin`
    b. `sudo smbpasswd -a pi`
    c. `nano /etc/samba/smb.conf`
    d. Edit the file to read as:
```
workgroup = WORKGROUP
wins support = yes

[pihome]
   comment = Pi Home
   path = /home/pi
   browseable = Yes
   writeable = Yes
   only guest = no
   create mask = 0777
   directory mask = 0777
   public = yes
```
    e. `service smbd restart`
    f. Now, you may access the Pi's file system from your mac. Open finder
       -> Go -> Connect to Server
    g. Set the server to smb://<piname>.local
       * By default, <piname> is raspberrypi

You now have a linux machine on which you may begin developing.

## Booth Tech misc. important tidbits

* You will not be able to use anything that requries Internet access at runtime-- we will only have access to each other's machines via our LAN network.
* The most important thing is robustness. Make sure your pi will not crash under any circumstances.
