'use strict';
const os = require('os');


export const getIp = function () {
    let iptable = { ip: '' };
    let ifaces = os.networkInterfaces();
    for (let dev in ifaces) {
        ifaces[dev].forEach(function (details, alias) {
            if (details.family == 'IPv4' && details.address != '127.0.0.1') {
                iptable['ip'] = details.address;
            }
        });
    }
    return iptable.ip;
}