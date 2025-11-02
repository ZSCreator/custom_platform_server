"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RobotAgentMessage = void 0;
const pinus_1 = require("pinus");
const logger = (0, pinus_1.getLogger)("server_out", __filename);
class RobotAgentMessage {
    constructor(robot) {
        this.robot = robot;
    }
    async loaded() {
        try {
            await this.robot.requestByRoute('redPacket.redPacketHandler.loaded', {});
        }
        catch (error) {
        }
    }
    async handOutRedPacket(amount, mineNumber) {
        try {
            let result = await this.robot.requestByRoute("redPacket.redPacketHandler.handOutRedPacket", { amount, mineNumber });
        }
        catch (error) {
        }
    }
    async grabRedPacket() {
        try {
            this.robot.grabbedCount += 1;
            const result = await this.robot.requestByRoute("redPacket.redPacketHandler.grabRedPacket", {});
        }
        catch (error) {
            switch (typeof error) {
                case 'string':
                    logger.error(`机器人抢红包出错|返回出错信息为:${error}`);
                    break;
                case 'object':
                    if (error.code === 81001) {
                    }
                    else {
                        await this.robot.leave();
                    }
                    break;
                default:
                    logger.error(`机器人抢红包出错`);
                    break;
            }
        }
    }
    async cancelHandOutRedPacket() {
        try {
            await this.robot.requestByRoute("redPacket.redPacketHandler.cancelHandOutRedPacket", {});
        }
        catch (error) {
        }
    }
    async leaveRoom() {
        const disConnect = await this.robot.leaveGameAndReset();
    }
}
exports.RobotAgentMessage = RobotAgentMessage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9ib3RBZ2VudE1lc3NhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9yZWRQYWNrZXQvbGliL2V4cGFuc2lvbi9yb2JvdEV4cGFuc2lvbi9Sb2JvdEFnZW50TWVzc2FnZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxpQ0FBZ0M7QUFFaEMsTUFBTSxNQUFNLEdBQUcsSUFBQSxpQkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUtuRCxNQUFhLGlCQUFpQjtJQUk1QixZQUFZLEtBQXlCO1FBQ25DLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3JCLENBQUM7SUFLRCxLQUFLLENBQUMsTUFBTTtRQUNWLElBQUk7WUFDRixNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLG1DQUFtQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzFFO1FBQUMsT0FBTyxLQUFLLEVBQUU7U0FFZjtJQUNILENBQUM7SUFPRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsTUFBYyxFQUFFLFVBQWtCO1FBRXZELElBQUk7WUFDRixJQUFJLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLDZDQUE2QyxFQUFFLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxDQUFDLENBQUM7U0FDckg7UUFBQyxPQUFPLEtBQUssRUFBRTtTQUVmO0lBQ0gsQ0FBQztJQUtELEtBQUssQ0FBQyxhQUFhO1FBQ2pCLElBQUk7WUFDRixJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksSUFBSSxDQUFDLENBQUM7WUFDN0IsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQywwQ0FBMEMsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUNoRztRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ2QsUUFBUSxPQUFPLEtBQUssRUFBRTtnQkFDcEIsS0FBSyxRQUFRO29CQUNYLE1BQU0sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEtBQUssRUFBRSxDQUFDLENBQUM7b0JBQzFDLE1BQU07Z0JBQ1IsS0FBSyxRQUFRO29CQUNYLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLEVBQUU7cUJBRXpCO3lCQUFNO3dCQUdMLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztxQkFDMUI7b0JBQ0QsTUFBTTtnQkFDUjtvQkFDRSxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUN6QixNQUFNO2FBQ1Q7U0FDRjtJQUNILENBQUM7SUFLRCxLQUFLLENBQUMsc0JBQXNCO1FBQzFCLElBQUk7WUFDRixNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLG1EQUFtRCxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzFGO1FBQUMsT0FBTyxLQUFLLEVBQUU7U0FFZjtJQUNILENBQUM7SUFLRCxLQUFLLENBQUMsU0FBUztRQUNiLE1BQU0sVUFBVSxHQUFHLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQzFELENBQUM7Q0FDRjtBQTlFRCw4Q0E4RUMifQ==