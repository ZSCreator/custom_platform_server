"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_logger_1 = require("pinus-logger");
function default_1() {
    return new Lifecycle();
}
exports.default = default_1;
class Lifecycle {
    constructor() {
        this.logger = (0, pinus_logger_1.getLogger)('c', __filename);
    }
    async afterStartup(app, cb) {
        cb();
        return;
    }
    async beforeShutdown(app, shutDown, cancelShutDownTimer) {
        return;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvcHJvbW90ZURvd24vbGlmZWN5Y2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsK0NBQXlDO0FBR3pDO0lBQ0ksT0FBTyxJQUFJLFNBQVMsRUFBRSxDQUFDO0FBQzNCLENBQUM7QUFGRCw0QkFFQztBQUVELE1BQU0sU0FBUztJQUlYO1FBQ0ksSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRCxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQWdCLEVBQUUsRUFBYztRQUcvQyxFQUFFLEVBQUUsQ0FBQztRQUNMLE9BQU87SUFDWCxDQUFDO0lBQ0QsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFnQixFQUFFLFFBQW9CLEVBQUUsbUJBQStCO1FBT3hGLE9BQU87SUFDWCxDQUFDO0NBRUoifQ==