"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_http_plugin_1 = require("pinus-http-plugin");
const loginRoute_1 = require("./route/loginRoute");
const plugin = (0, pinus_http_plugin_1.createPinusHttpPlugin)();
class HttpComponents extends plugin.components[0] {
    constructor() {
        super(...arguments);
        this.name = plugin.name;
    }
    beforeStart(cb) {
        !!cb && cb();
    }
    afterStart(cb) {
        cb();
    }
    loadRoutes() {
        this.http.get('/', function (req, res) {
            res.send('pinus-http-plugin ok!');
        });
        this.http.all('*', (req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            next();
        });
        (0, loginRoute_1.default)(this.app, this.http);
    }
}
exports.default = HttpComponents;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cENvbXBvbmVudHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nYXRlSHR0cC9saWIvaHR0cENvbXBvbmVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5REFBd0Q7QUFFeEQsbURBQTRDO0FBRTVDLE1BQU0sTUFBTSxHQUFHLElBQUEseUNBQXFCLEdBQUUsQ0FBQztBQUV2QyxNQUFxQixjQUFlLFNBQVEsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFBaEU7O1FBQ0ksU0FBSSxHQUFXLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUF5Qi9CLENBQUM7SUF2QkcsV0FBVyxDQUFDLEVBQU87UUFDZixDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFFRCxVQUFVLENBQUMsRUFBTztRQUNkLEVBQUUsRUFBRSxDQUFDO0lBQ1QsQ0FBQztJQUVNLFVBQVU7UUFDYixJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsVUFBVSxHQUFRLEVBQUUsR0FBUTtZQUMzQyxHQUFHLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDdEMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFO1lBQ2xDLEdBQUcsQ0FBQyxNQUFNLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDL0MsR0FBRyxDQUFDLE1BQU0sQ0FBQyw4QkFBOEIsRUFBRSxpQ0FBaUMsQ0FBQyxDQUFDO1lBQzlFLEdBQUcsQ0FBQyxNQUFNLENBQUMsOEJBQThCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztZQUMvRCxHQUFHLENBQUMsTUFBTSxDQUFDLDhCQUE4QixFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQzNELElBQUksRUFBRSxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFBLG9CQUFVLEVBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDcEMsQ0FBQztDQUNKO0FBMUJELGlDQTBCQyJ9