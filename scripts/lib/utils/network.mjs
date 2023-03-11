import os from 'os';

export function getFirstIPv4() {
  const networkInterfaces = os.networkInterfaces();
  
  for (const key in networkInterfaces) {
    return networkInterfaces[key][1].address;
  }
}