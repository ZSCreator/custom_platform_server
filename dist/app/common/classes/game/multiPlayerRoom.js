"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SystemRoom_1 = require("../../pojo/entity/SystemRoom");
class MultiPlayerRoom extends SystemRoom_1.SystemRoom {
    constructor() {
        super(...arguments);
        this.runningState = true;
    }
    async process() {
        if (!this.runningState) {
            return;
        }
        await this.processState.before();
        this.stateTimer = setTimeout(async () => {
            await this.processState.after();
        }, this.processState.countdown);
    }
    stopTimer() {
        this.runningState = false;
        clearTimeout(this.stateTimer);
    }
}
exports.default = MultiPlayerRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlQbGF5ZXJSb29tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9jbGFzc2VzL2dhbWUvbXVsdGlQbGF5ZXJSb29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsNkRBQTBEO0FBTTFELE1BQThCLGVBQXNDLFNBQVEsdUJBQWE7SUFBekY7O1FBUUksaUJBQVksR0FBWSxJQUFJLENBQUM7SUFrQ2pDLENBQUM7SUFuQkcsS0FBSyxDQUFDLE9BQU87UUFDVCxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNwQixPQUFPO1NBQ1Y7UUFHRCxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFakMsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFFcEMsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3BDLENBQUMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFHRCxTQUFTO1FBQ0wsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDMUIsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNsQyxDQUFDO0NBQ0o7QUExQ0Qsa0NBMENDIn0=