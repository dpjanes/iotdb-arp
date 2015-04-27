# mac-scan-kludge
Scan the local network for MAC addresses.

Tested on Mac and Raspberry Pi. Needs to get 
a Windows version.

It uses the command "arp -an" to get MAC addreses
for the LAN. Before running the command it
floods the local network with requests for all
IP addresses, hopefully getting the ARP table
filled up with goodies.

All mac addresses are normalized to uppercase
and leadings "0" if needed.

# Usage
## Parameters

    {
        verbose: true,
        poll: 180,
        max: 256,
    }

* verbose: print lots of stuff
* poll: re-run after this many seconds (default: 0 - run once)
* max: poll this many hosts at once (default: 64)

## Code

    browser = require('iotdb-arp');
    browser.browser({}, function(error, d) {
        if (error) {
            console.log("#", error);
        } else if (d) {
            console.log(d);
        } else {
        }
    });

## Sample Results

    { ip: '192.168.0.1', 
      mac: '68:B6:FC:00:00:00', 
      interface: 'en0' }
    { ip: '192.168.0.10',
      mac: '04:A1:51:00:00:00',
      interface: 'en0' }
    { ip: '192.168.0.12',
      mac: 'D0:52:A8:00:00:00',
      interface: 'en0' }
    { ip: '192.168.0.14',
      mac: '58:55:CA:00:00:00',
      interface: 'en0' }
