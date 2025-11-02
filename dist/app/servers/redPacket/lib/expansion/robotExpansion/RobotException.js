"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RobotException = void 0;
const pinus_1 = require("pinus");
const logger = (0, pinus_1.getLogger)("server_out", __filename);
class RobotException {
    constructor(robot) {
        this.robot = robot;
        const { nid, uid, guestid } = this.robot;
        this.prefixLog = `游戏:${nid}|机器人:${guestid}|`;
    }
    debug(msg) {
        logger.debug(`${this.prefixLog}${msg}`);
    }
    channelWarn(msg) {
        logger.warn(`${this.prefixLog}${msg}`);
    }
}
exports.RobotException = RobotException;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9ib3RFeGNlcHRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9yZWRQYWNrZXQvbGliL2V4cGFuc2lvbi9yb2JvdEV4cGFuc2lvbi9Sb2JvdEV4Y2VwdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxpQ0FBZ0M7QUFFaEMsTUFBTSxNQUFNLEdBQUcsSUFBQSxpQkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUtuRCxNQUFhLGNBQWM7SUFNekIsWUFBWSxLQUF5QjtRQUNuQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxHQUFHLFFBQVEsT0FBTyxHQUFHLENBQUM7SUFDL0MsQ0FBQztJQUVELEtBQUssQ0FBQyxHQUFXO1FBQ2YsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRUQsV0FBVyxDQUFDLEdBQVc7UUFDckIsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUN6QyxDQUFDO0NBQ0Y7QUFuQkQsd0NBbUJDIn0=