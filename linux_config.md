## modify gateway ip for internet access (only for current session)

sudo ip route del default
sudo ip route add default via 192.168.11.1 dev eth0

## pi uses NetworkManager

nmcli general status
nmcli connection show

## DHCP neu auslösen

nmcli device reapply eth0

## Make connection-name to default gateway

sudo nmcli connection modify "<connection-name>" ipv4.gateway 192.168.11.1
sudo nmcli connection modify "<connection-name>" ipv4.never-default no

## if DHCP provides a gateway

nmcli connection modify "<connection-name>" ipv4.method auto

## apply changes

sudo nmcli connection down "<connection-name>" && nmcli connection up "<connection-name>"

## Update systemtime

sudo timedatectl set-ntp true
sudo timedatectl status

## Install node and npm

curl -o- https://fnm.vercel.app/install | bash
fnm install 16

## get project

git clone https://github.com/BLRKClemens/HeartSensorServer
npm run start (for client)
npm run playerMap (for playerMapServer)

## For ant+ usb stick access without sudo

sudo nano /etc/udev/rules.d/ant-usb-m.rules
check for idVendor and idProduct in lsusb
SUBSYSTEM=="usb", ATTRS{idVendor}=="0fcf", ATTRS{idProduct}=="1008", RUN+="/sbin/modprobe usbserial vendor=0x0fcf product=0x1009", MODE="0666", OWNER="pi", GROUP="root"
sudo udevadm control --reload-rules
sudo udevadm trigger

## for pm2 startup deamon

pm2 startup
pm2 save
