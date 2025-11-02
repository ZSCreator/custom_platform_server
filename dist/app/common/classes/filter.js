"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Filter {
    constructor(app) {
        this.app = app;
    }
    before(routeRecord, msg, session, next) {
        next(new Error('wocao'));
    }
    after(err, routeRecord, msg, session, resp, next) {
        next(err);
    }
}
exports.default = Filter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9jbGFzc2VzL2ZpbHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQU1BLE1BQXFCLE1BQU07SUFHdkIsWUFBbUIsR0FBZ0I7UUFDL0IsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDbkIsQ0FBQztJQVNNLE1BQU0sQ0FBQyxXQUF3QixFQUFHLEdBQVEsRUFBRSxPQUFpQyxFQUFFLElBQXFDO1FBQ3ZILElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFXTSxLQUFLLENBQUMsR0FBVSxFQUFFLFdBQXdCLEVBQUUsR0FBUSxFQUFFLE9BQWlDLEVBQUUsSUFBUyxFQUFFLElBQXFCO1FBQzVILElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNkLENBQUM7Q0FDSDtBQTlCRix5QkE4QkUifQ==