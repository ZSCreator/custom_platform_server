'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./lib/main");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    async beforeStartup(app, cb) {
        console.log(app.getServerId(), '!!beforeStartup');
        return cb();
    }
    ;
    async afterStartup(app, cb) {
        console.log(app.getServerId(), '!!afterStartup');
        (0, main_1.RpcRun)();
        return cb();
    }
    ;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvY2hlY2tQbGF5ZXJJbkdhbWUvbGlmZWN5Y2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFJYixxQ0FBa0M7QUFJbEM7SUFDSSxPQUFPLElBQUksU0FBUyxFQUFFLENBQUM7QUFDM0IsQ0FBQztBQUZELDRCQUVDO0FBR0QsTUFBTSxTQUFTO0lBRVgsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFDaEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUNsRCxPQUFPLEVBQUUsRUFBRSxDQUFDO0lBQ2hCLENBQUM7SUFBQSxDQUFDO0lBRUYsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFnQixFQUFFLEVBQWM7UUFDL0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUVqRCxJQUFBLGFBQU0sR0FBRSxDQUFDO1FBQ1QsT0FBTyxFQUFFLEVBQUUsQ0FBQztJQUNoQixDQUFDO0lBQUEsQ0FBQztDQUVMIn0=