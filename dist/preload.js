"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sslOpts = exports.preload = void 0;
const bluebird_1 = require("bluebird");
const fs = require("fs");
const pinus_logger_1 = require("pinus-logger");
const Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
require("reflect-metadata");
function preload(app) {
    bluebird_1.Promise.config({
        warnings: false,
        longStackTraces: false,
        cancellation: false,
        monitoring: false
    });
    require('source-map-support').install({
        handleUncaughtExceptions: false
    });
    process.on('uncaughtException', function (err) {
        Logger.error(app.getServerId(), 'Caught exception: ' + (err.stack || err.message || err));
    });
    process.on('unhandledRejection', (reason, p) => {
        Logger.error(app.getServerId(), 'Caught Unhandled Rejection at:' + JSON.stringify(p) + 'reason:' + (reason.stack || reason.message || JSON.stringify(reason)));
    });
}
exports.preload = preload;
exports.sslOpts = {
    run: false,
    ssl: {
        type: 'wss',
        key: null,
        cert: null
    },
    isdecode: false,
};
exports.sslOpts.isdecode = false;
if (exports.sslOpts.run) {
    exports.sslOpts.ssl.key = fs.readFileSync('config/private/game-server.key');
    exports.sslOpts.ssl.cert = fs.readFileSync('config/private/game-server.pem');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlbG9hZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3ByZWxvYWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsdUNBQW1DO0FBRW5DLHlCQUF5QjtBQUN6QiwrQ0FBeUM7QUFDekMsTUFBTSxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUVuRCw0QkFBMEI7QUFPMUIsU0FBZ0IsT0FBTyxDQUFDLEdBQWdCO0lBSXBDLGtCQUFPLENBQUMsTUFBTSxDQUFDO1FBRVgsUUFBUSxFQUFFLEtBQUs7UUFFZixlQUFlLEVBQUUsS0FBSztRQUV0QixZQUFZLEVBQUUsS0FBSztRQUVuQixVQUFVLEVBQUUsS0FBSztLQUNwQixDQUFDLENBQUM7SUFHSCxPQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxPQUFPLENBQUM7UUFDbEMsd0JBQXdCLEVBQUUsS0FBSztLQUNsQyxDQUFDLENBQUM7SUFHSCxPQUFPLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFLFVBQVUsR0FBUTtRQUU5QyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxvQkFBb0IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzlGLENBQUMsQ0FBQyxDQUFDO0lBR0gsT0FBTyxDQUFDLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLE1BQVcsRUFBRSxDQUFNLEVBQUUsRUFBRTtRQUVyRCxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxnQ0FBZ0MsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksTUFBTSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNuSyxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUEvQkQsMEJBK0JDO0FBT1UsUUFBQSxPQUFPLEdBQUc7SUFFakIsR0FBRyxFQUFFLEtBQUs7SUFDVixHQUFHLEVBQUU7UUFDRCxJQUFJLEVBQUUsS0FBSztRQUNYLEdBQUcsRUFBRSxJQUFJO1FBQ1QsSUFBSSxFQUFFLElBQUk7S0FDYjtJQUVELFFBQVEsRUFBRSxLQUFLO0NBQ2xCLENBQUE7QUFDRCxlQUFPLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztBQUV6QixJQUFJLGVBQU8sQ0FBQyxHQUFHLEVBQUU7SUFDYixlQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLGdDQUFnQyxDQUFDLENBQUM7SUFDcEUsZUFBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0NBQ3hFIn0=