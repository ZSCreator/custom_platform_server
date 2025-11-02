'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatchGate = void 0;
const pinus_1 = require("pinus");
function dispatchGate(fromRobot = true) {
    const gateServers = pinus_1.pinus.app.getServersByType('gate');
    if (!Array.isArray(gateServers) || !gateServers.length) {
        return;
    }
    let chosenGate;
    if (gateServers.length === 1 || !fromRobot) {
        chosenGate = gateServers[0];
    }
    else {
        gateServers.sort((a, b) => {
            return parseInt(a.id.split('-').pop()) - parseInt(b.id.split('-').pop());
        });
        let ran = gateServers.length - 1;
        chosenGate = gateServers[ran];
    }
    return { host: chosenGate.clientHost, port: chosenGate.clientPort };
}
exports.dispatchGate = dispatchGate;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2F0ZUJhbGFuY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvc2VydmVyQ29udHJvbGxlci9nYXRlQmFsYW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUliLGlDQUEwQztBQUsxQyxTQUFnQixZQUFZLENBQUMsU0FBUyxHQUFHLElBQUk7SUFDekMsTUFBTSxXQUFXLEdBQUcsYUFBSyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2RCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUU7UUFDcEQsT0FBTztLQUNWO0lBQ0QsSUFBSSxVQUFlLENBQUM7SUFFcEIsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRTtRQUN4QyxVQUFVLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQy9CO1NBQU07UUFFSCxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3RCLE9BQU8sUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDN0UsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLEdBQUcsR0FBRyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNqQyxVQUFVLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2pDO0lBRUQsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUE7QUFDdkUsQ0FBQztBQW5CRCxvQ0FtQkM7QUFBQSxDQUFDIn0=