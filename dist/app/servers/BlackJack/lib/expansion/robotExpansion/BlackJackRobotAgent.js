"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlackJackRobotAgent = void 0;
class BlackJackRobotAgent {
    constructor(robot) {
        this.robot = robot;
    }
    async loaded() {
        try {
            return await this.robot.requestByRoute('BlackJack.mainHandler.loaded', {});
        }
        catch (error) {
            return false;
        }
    }
    async addMultiple(areaIdx) {
        try {
            await this.robot.requestByRoute('BlackJack.mainHandler.addMultiple', { areaIdx });
        }
        catch (error) {
        }
    }
    async separatePoker(areaIdx) {
        try {
            await this.robot.requestByRoute('BlackJack.mainHandler.separatePoker', { areaIdx });
        }
        catch (error) {
        }
    }
    async getOnePoker(areaIdx) {
        try {
            await this.robot.requestByRoute('BlackJack.mainHandler.getOnePoker', { areaIdx });
        }
        catch (error) {
        }
    }
    async insurance(areaIdx) {
        try {
            await this.robot.requestByRoute('BlackJack.mainHandler.insurance', { areaIdx });
        }
        catch (error) {
        }
    }
    destroy() {
        this.robot = null;
    }
}
exports.BlackJackRobotAgent = BlackJackRobotAgent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmxhY2tKYWNrUm9ib3RBZ2VudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL0JsYWNrSmFjay9saWIvZXhwYW5zaW9uL3JvYm90RXhwYW5zaW9uL0JsYWNrSmFja1JvYm90QWdlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBT0EsTUFBYSxtQkFBbUI7SUFJNUIsWUFBWSxLQUF5QjtRQUNqQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUN2QixDQUFDO0lBRU0sS0FBSyxDQUFDLE1BQU07UUFDZixJQUFJO1lBQ0EsT0FBTyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLDhCQUE4QixFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzlFO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDWixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFNTSxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQWU7UUFDcEMsSUFBSTtZQUNBLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsbUNBQW1DLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1NBQ3JGO1FBQUMsT0FBTyxLQUFLLEVBQUU7U0FFZjtJQUNMLENBQUM7SUFNTSxLQUFLLENBQUMsYUFBYSxDQUFDLE9BQWU7UUFDdEMsSUFBSTtZQUNBLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMscUNBQXFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZGO1FBQUMsT0FBTyxLQUFLLEVBQUU7U0FFZjtJQUNMLENBQUM7SUFRTSxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQWU7UUFDcEMsSUFBSTtZQUNBLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsbUNBQW1DLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1NBQ3JGO1FBQUMsT0FBTyxLQUFLLEVBQUU7U0FFZjtJQUNMLENBQUM7SUFNTSxLQUFLLENBQUMsU0FBUyxDQUFDLE9BQWU7UUFDbEMsSUFBSTtZQUNBLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsaUNBQWlDLEVBQUUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1NBQ25GO1FBQUMsT0FBTyxLQUFLLEVBQUU7U0FFZjtJQUNMLENBQUM7SUFFTSxPQUFPO1FBQ1YsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDdEIsQ0FBQztDQUNKO0FBckVELGtEQXFFQyJ9