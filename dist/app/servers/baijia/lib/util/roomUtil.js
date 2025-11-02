'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRecordResult = exports.isRobotLog = void 0;
const baijiaConst = require("../baijiaConst");
const GameUtil_1 = require("../../../../utils/GameUtil");
function isRobotLog(isRobot) {
    return baijiaConst.LOG_ISROBOT ? true : isRobot != 2;
}
exports.isRobotLog = isRobotLog;
function buildRecordResult(bankerCards, playerCards, result) {
    let bankerStr = (0, GameUtil_1.conversionCards)(bankerCards), playerStr = (0, GameUtil_1.conversionCards)(playerCards);
    if (bankerCards.length === 2)
        bankerStr += '00';
    if (playerCards.length === 2)
        playerStr += '00';
    const thirteenth = result.bank ? '2' : result.play ? '1' : '0';
    const fourteenth = result.big ? '2' : '1';
    const fifteenth = result.pair0 ? '1' : '0';
    const sixteenth = result.pair1 ? '1' : '0';
    return `${bankerStr}${playerStr}${thirteenth}${fourteenth}${fifteenth}${sixteenth}`;
}
exports.buildRecordResult = buildRecordResult;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbVV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9iYWlqaWEvbGliL3V0aWwvcm9vbVV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFDYiw4Q0FBK0M7QUFDL0MseURBQTJEO0FBSzNELFNBQWdCLFVBQVUsQ0FBQyxPQUFlO0lBQ3RDLE9BQU8sV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDO0FBQ3pELENBQUM7QUFGRCxnQ0FFQztBQVVELFNBQWdCLGlCQUFpQixDQUFDLFdBQXFCLEVBQUUsV0FBcUIsRUFBRSxNQUFXO0lBQ3ZGLElBQUksU0FBUyxHQUFHLElBQUEsMEJBQWUsRUFBQyxXQUFXLENBQUMsRUFDeEMsU0FBUyxHQUFHLElBQUEsMEJBQWUsRUFBQyxXQUFXLENBQUMsQ0FBQztJQUc3QyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEtBQUssQ0FBQztRQUFFLFNBQVMsSUFBSSxJQUFJLENBQUM7SUFDaEQsSUFBSSxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUM7UUFBRSxTQUFTLElBQUksSUFBSSxDQUFDO0lBR2hELE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7SUFFL0QsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7SUFFMUMsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7SUFFM0MsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7SUFFM0MsT0FBTyxHQUFHLFNBQVMsR0FBRyxTQUFTLEdBQUcsVUFBVSxHQUFHLFVBQVUsR0FBRyxTQUFTLEdBQUcsU0FBUyxFQUFFLENBQUM7QUFDeEYsQ0FBQztBQWxCRCw4Q0FrQkMifQ==