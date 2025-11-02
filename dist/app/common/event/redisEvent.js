"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalArr = exports.globalEvent = void 0;
const utils = require("../../utils");
const events_1 = require("events");
exports.globalEvent = new events_1.EventEmitter();
exports.globalArr = {};
exports.globalEvent.on("doForward", (uid, route, parameter) => {
    let vv = exports.globalArr[uid];
    if (vv) {
        let args = utils.clone(parameter);
        process.nextTick(() => {
            vv.event.emit(route, args);
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkaXNFdmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2FwcC9jb21tb24vZXZlbnQvcmVkaXNFdmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxxQ0FBc0M7QUFDdEMsbUNBQXNDO0FBRXpCLFFBQUEsV0FBVyxHQUFHLElBQUkscUJBQVksRUFBRSxDQUFDO0FBQ2pDLFFBQUEsU0FBUyxHQUFtRSxFQUFFLENBQUM7QUFFNUYsbUJBQVcsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBVyxFQUFFLEtBQWEsRUFBRSxTQUFjLEVBQUUsRUFBRTtJQUN2RSxJQUFJLEVBQUUsR0FBRyxpQkFBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3hCLElBQUksRUFBRSxFQUFFO1FBQ0osSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNsQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUNsQixFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDL0IsQ0FBQyxDQUFDLENBQUM7S0FDTjtBQUNMLENBQUMsQ0FBQyxDQUFDIn0=