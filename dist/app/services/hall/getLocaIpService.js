'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIp = void 0;
const os = require('os');
const getIp = function () {
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
};
exports.getIp = getIp;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0TG9jYUlwU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2FwcC9zZXJ2aWNlcy9oYWxsL2dldExvY2FJcFNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFDYixNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFHbEIsTUFBTSxLQUFLLEdBQUc7SUFDakIsSUFBSSxPQUFPLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7SUFDekIsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDcEMsS0FBSyxJQUFJLEdBQUcsSUFBSSxNQUFNLEVBQUU7UUFDcEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRSxLQUFLO1lBQ3hDLElBQUksT0FBTyxDQUFDLE1BQU0sSUFBSSxNQUFNLElBQUksT0FBTyxDQUFDLE9BQU8sSUFBSSxXQUFXLEVBQUU7Z0JBQzVELE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO2FBQ25DO1FBQ0wsQ0FBQyxDQUFDLENBQUM7S0FDTjtJQUNELE9BQU8sT0FBTyxDQUFDLEVBQUUsQ0FBQztBQUN0QixDQUFDLENBQUE7QUFYWSxRQUFBLEtBQUssU0FXakIifQ==