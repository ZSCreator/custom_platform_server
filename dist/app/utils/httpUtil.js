'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.combineRequest = exports.httpOrHttpsGet = void 0;
const HallConst = require("../consts/hallConst");
function httpOrHttpsGet(requestUrl, isHttps = false) {
    return new Promise((resolve, reject) => {
        const getReqestObj = isHttps ? require('https') : require('http');
        const request = getReqestObj.get(requestUrl, reqData => {
            combineRequest(reqData, data => {
                request.end();
                clearTimeout(timeOutEventId);
                return resolve(data);
            });
        });
        const timeOutEventId = setTimeout(function () {
            request.emit('timeout', `请求已超过 ${HallConst.HTTP_REQUEST_TIMEOUT}ms 未返回结果`);
        }, HallConst.HTTP_REQUEST_TIMEOUT);
        onError(timeOutEventId, request, reject);
        onTimeOut(timeOutEventId, request, reject);
    });
}
exports.httpOrHttpsGet = httpOrHttpsGet;
;
function onError(timeOutEventId, request, reject) {
    request.on('error', error => {
        request.end();
        clearTimeout(timeOutEventId);
        return reject(error);
    });
}
function onTimeOut(timeOutEventId, request, reject) {
    request.on('timeout', error => {
        request.end();
        clearTimeout(timeOutEventId);
        return reject(error);
    });
}
function combineRequest(request, callback) {
    return new Promise(resolve => {
        let data = '';
        request.on('data', function (chunk) {
            data += chunk;
        });
        request.on('end', () => {
            try {
                data = JSON.parse(data);
                callback && callback(data);
                return resolve(data);
            }
            catch (error) {
                callback && callback(data);
                return resolve(data);
            }
        });
    });
}
exports.combineRequest = combineRequest;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cFV0aWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvdXRpbHMvaHR0cFV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7QUFHYixpREFBa0Q7QUFJbEQsU0FBZ0IsY0FBYyxDQUFDLFVBQVUsRUFBRSxPQUFPLEdBQUcsS0FBSztJQUN0RCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ25DLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEUsTUFBTSxPQUFPLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLEVBQUU7WUFDbkQsY0FBYyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsRUFBRTtnQkFDM0IsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNkLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFFN0IsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDekIsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sY0FBYyxHQUFHLFVBQVUsQ0FBQztZQUM5QixPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxTQUFTLFNBQVMsQ0FBQyxvQkFBb0IsVUFBVSxDQUFDLENBQUM7UUFDL0UsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ25DLE9BQU8sQ0FBQyxjQUFjLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3pDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQy9DLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQWpCRCx3Q0FpQkM7QUFBQSxDQUFDO0FBR0YsU0FBUyxPQUFPLENBQUMsY0FBYyxFQUFFLE9BQU8sRUFBRSxNQUFNO0lBQzVDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxFQUFFO1FBQ3hCLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNkLFlBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUM3QixPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN6QixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFHRCxTQUFTLFNBQVMsQ0FBQyxjQUFjLEVBQUUsT0FBTyxFQUFFLE1BQU07SUFDOUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLEVBQUU7UUFDMUIsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2QsWUFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzdCLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3pCLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUdELFNBQWdCLGNBQWMsQ0FBQyxPQUFPLEVBQUUsUUFBUztJQUM3QyxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ3pCLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNkLE9BQU8sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQVUsS0FBSztZQUM5QixJQUFJLElBQUksS0FBSyxDQUFDO1FBQ2xCLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFO1lBQ25CLElBQUk7Z0JBQ0EsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3hCLFFBQVEsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzNCLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3hCO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ1osUUFBUSxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDM0IsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDeEI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQWpCRCx3Q0FpQkM7QUFBQSxDQUFDIn0=