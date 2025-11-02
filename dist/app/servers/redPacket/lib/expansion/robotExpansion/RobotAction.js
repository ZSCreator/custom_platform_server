"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RobotAction = void 0;
const commonUtil_1 = require("../../../../../utils/lottery/commonUtil");
const pinus_1 = require("pinus");
const logger = (0, pinus_1.getLogger)("server_out", __filename);
class RobotAction {
    constructor(robot) {
        this.robot = robot;
    }
    handoutRedPacket() {
        let amount = 0;
        try {
            const { playerGold } = this.robot;
            const min = this.robot.lowBet / 1000;
            let max = this.robot.capBet / 1000;
            if (playerGold < this.robot.capBet)
                max = Math.floor(playerGold / 1000);
            amount = (0, commonUtil_1.randomFromRange)(min, 5) * 1000;
            if (this.robot.playerGold < this.robot.capBet) {
                this.robot.leave();
                return;
            }
            this.robot.agentMessage.handOutRedPacket(amount, (0, commonUtil_1.randomFromRange)(0, 9));
        }
        catch (e) {
            logger.error(`机器人:${this.robot.uid}|发红包出错|当前金额:${this.robot.playerGold}|红包金额:${amount}|错误详情:${e}`);
        }
    }
    grabTheRedPacket() {
        const currentProbability = (0, commonUtil_1.randomFromRange)(0, 100);
        if (currentProbability > 20) {
            this.robot.hadGrabFlag = true;
            this.robot.grabTimeOut = setTimeout(() => {
                this.robot.agentMessage.grabRedPacket();
            }, (0, commonUtil_1.randomFromRange)(0, 4000));
        }
    }
}
exports.RobotAction = RobotAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9ib3RBY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9yZWRQYWNrZXQvbGliL2V4cGFuc2lvbi9yb2JvdEV4cGFuc2lvbi9Sb2JvdEFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx3RUFBMEU7QUFDMUUsaUNBQWdDO0FBRWhDLE1BQU0sTUFBTSxHQUFHLElBQUEsaUJBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFFbkQsTUFBYSxXQUFXO0lBSXRCLFlBQVksS0FBeUI7UUFDbkMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDckIsQ0FBQztJQU1ELGdCQUFnQjtRQUVkLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztRQUNmLElBQUk7WUFDRixNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUNsQyxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7WUFDckMsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1lBR25DLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTTtnQkFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFFeEUsTUFBTSxHQUFHLElBQUEsNEJBQWUsRUFBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBRXhDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUU7Z0JBQzdDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ25CLE9BQU87YUFDUjtZQUVELElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxJQUFBLDRCQUFlLEVBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDekU7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsZUFBZSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsU0FBUyxNQUFNLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNwRztJQUVILENBQUM7SUFLRCxnQkFBZ0I7UUFDZCxNQUFNLGtCQUFrQixHQUFHLElBQUEsNEJBQWUsRUFBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFbkQsSUFBSSxrQkFBa0IsR0FBRyxFQUFFLEVBQUU7WUFFM0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1lBRTlCLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzFDLENBQUMsRUFBRSxJQUFBLDRCQUFlLEVBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDOUI7SUFDSCxDQUFDO0NBQ0Y7QUFwREQsa0NBb0RDIn0=