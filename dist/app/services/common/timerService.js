'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.caohuajiTimerJackpot = exports.delayServerClose = void 0;
const TimerService = module.exports;
let awardTimer = {};
const closeAwardSetInterval = TimerService.closeAwardSetInterval = function (room) {
    const str = 'AWARD_' + room.nid + '' + room.roomId + '';
    console.log('关闭放奖监控', str);
    clearInterval(awardTimer[str]);
};
const delayServerClose = function (time = 3 * 1000) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            return resolve({});
        }, time);
    });
};
exports.delayServerClose = delayServerClose;
const caohuajiTimerJackpot = function (nid) {
};
exports.caohuajiTimerJackpot = caohuajiTimerJackpot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZXJTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vYXBwL3NlcnZpY2VzL2NvbW1vbi90aW1lclNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFJYixNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO0FBWXBDLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQTtBQUduQixNQUFNLHFCQUFxQixHQUFHLFlBQVksQ0FBQyxxQkFBcUIsR0FBRyxVQUFVLElBQUk7SUFDN0UsTUFBTSxHQUFHLEdBQUcsUUFBUSxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ3hELE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzNCLGFBQWEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNuQyxDQUFDLENBQUE7QUFlTSxNQUFNLGdCQUFnQixHQUFHLFVBQVUsSUFBSSxHQUFHLENBQUMsR0FBRyxJQUFJO0lBQ3JELE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDbkMsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNaLE9BQU8sT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtJQUNaLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFBO0FBTlksUUFBQSxnQkFBZ0Isb0JBTTVCO0FBR00sTUFBTSxvQkFBb0IsR0FBRyxVQUFVLEdBQUc7QUFjakQsQ0FBQyxDQUFDO0FBZFcsUUFBQSxvQkFBb0Isd0JBYy9CIn0=