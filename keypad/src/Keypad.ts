import { Device, getDeviceList, on as onUsb, InEndpoint } from 'usb';

const VENDOR_ID = 3141; // 2^16 - 1. Lol. Very lazy of them.
function deviceIsCardKeypad(device: Device): boolean {
  return device.deviceDescriptor.idVendor === VENDOR_ID;
}


function watchDevice(device: Device, sendPacket: (p: any) => any): void {
  if (!deviceIsCardKeypad(device)) {
    return;
  }
  console.log(`Keypad connected`);
  device.open();
  const iface = device.interfaces[0];

  // The RFID reader is recognized as a keyboard when plugged
  // in. So we want to tell the kernel to stop treating it as such, and
  // let us have full control.
  if (iface.isKernelDriverActive()) {
    iface.detachKernelDriver();
  }

  iface.claim();

  const endpoint = iface.endpoints[0];

  if (endpoint.direction !== 'in') {
    throw Error('invalid endpoint for interface');
  }

  (endpoint as InEndpoint).startPoll(1, 4);

  let scanCodes: number[] = [];

  endpoint.on('data', (data: Buffer) => {
    console.log("Buffer: ", (data.toString('hex', 2, 4)));
    const scanCode = parseInt(data.toString('hex', 2, 4), 16);
    // Every other scan code is blank padding
    if (scanCode === 0) {
      return;
    } else if (scanCode >= 0x59 && scanCode <= 0x62) {
      // Only push numbers 0-9
      // https://github.com/abcminiuser/lufa/blob/master/LUFA/Drivers/USB/Class/Common/HIDClassCommon.h#L113
      console.log(`Read keypress with value: ${scanCode}`);
      /*const entry = manifest.find(m => m.sequence === sequence);
      if (entry) {
        console.log(`Identified ${entry.name} (id ${entry.cardID})`);
        sendPacket({
          kind: 'scan',
          cardID: entry.cardID,
        });
      }*/
      }
  });

  endpoint.on('error', error => {
    console.log(`Keypad disconnected`);
  });
}

export default class Keypad {
  constructor(sendPacket: (p: any) => any) {
    getDeviceList()
      .filter(deviceIsCardKeypad)
      .forEach(device => watchDevice(device, sendPacket.bind(this)));

    onUsb('attach', device => watchDevice(device, sendPacket.bind(this)));
  }
}
