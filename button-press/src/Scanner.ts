import { Device, getDeviceList, on as onUsb, InEndpoint } from 'usb';

const VENDOR_ID = 65535; // 2^16 - 1. Lol. Very lazy of them.
function deviceIsCardScanner(device: Device): boolean {
  return device.deviceDescriptor.idVendor === VENDOR_ID;
}


function watchDevice(device: Device, sendPacket: (p: any) => any): void {
  if (!deviceIsCardScanner(device)) {
    return;
  }
  console.log(`Scanner connected`);
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

  (endpoint as InEndpoint).startPoll(1, 8);

  let scanCodes: number[] = [];

  endpoint.on('data', (data: Buffer) => {
    const scanCode = parseInt(data.toString('hex', 2, 3), 16);
    console.log(data);
    // Every other scan code is blank padding
    if (scanCode === 0) {
      return;
    } else if (scanCode >= 0x1e && scanCode <= 0x27) {
      console.log('valid scan number');
      // Only push numbers 0-9
      // https://github.com/abcminiuser/lufa/blob/master/LUFA/Drivers/USB/Class/Common/HIDClassCommon.h#L113
      scanCodes.push(scanCode - 0x1d);
      console.log(scanCodes);
    } else if (scanCode === 0x28) {
      // If the enter key was pressed
      const sequence = Number(scanCodes.join(''));
      console.log(`Read card with sequence: ${sequence}`);
        sendPacket({
          kind: 'scan',
          cardID: sequence,
        });
      }

      scanCodes = [];
  });

  endpoint.on('error', error => {
    console.log(`Scanner disconnected`);
  });
}

export default class Scanner {
  constructor(sendPacket: (p: any) => any) {
    getDeviceList()
      .filter(deviceIsCardScanner)
      .forEach(device => watchDevice(device, sendPacket.bind(this)));

    onUsb('attach', device => watchDevice(device, sendPacket.bind(this)));
  }
}
