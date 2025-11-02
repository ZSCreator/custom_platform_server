'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRobotLog = exports.resetHistory = void 0;
const caohuajiConst = require("../servers/caohuaji/lib/caohuajiConst");
const resetHistory = async function () {
    return true;
};
exports.resetHistory = resetHistory;
const isRobotLog = function (isRobot) {
    return caohuajiConst.LOG_ISROBOT ? true : isRobot != 2;
};
exports.isRobotLog = isRobotLog;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FvaHVhamlTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYXBwL3NlcnZpY2VzL2Nhb2h1YWppU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUNiLHVFQUF3RTtBQU1qRSxNQUFNLFlBQVksR0FBRyxLQUFLO0lBTTdCLE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUMsQ0FBQTtBQVBZLFFBQUEsWUFBWSxnQkFPeEI7QUFHTSxNQUFNLFVBQVUsR0FBRyxVQUFVLE9BQWU7SUFDL0MsT0FBTyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUM7QUFDM0QsQ0FBQyxDQUFBO0FBRlksUUFBQSxVQUFVLGNBRXRCIn0=