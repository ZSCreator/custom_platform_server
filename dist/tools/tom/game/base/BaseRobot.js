"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRobot = exports.isNullOrUndefined = void 0;
const RobotNet_1 = require("./RobotNet");
const pinus_logger_1 = require("pinus-logger");
const ApiResult_1 = require("../../../../app/common/pojo/ApiResult");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
function isNullOrUndefined(data) {
    return data === undefined || data === null;
}
exports.isNullOrUndefined = isNullOrUndefined;
;
class BaseRobot extends RobotNet_1.RobotNet {
    constructor(opts) {
        super();
        this.guestid = '';
        this.nid = '';
        this.sceneId = 0;
        this.roomId = '';
        this.leaveStauts = false;
        this.delayTimeoutObjs = [];
        this.gold_min = 0;
        this.gold_max = 0;
        this.session = null;
    }
    requestByRoute(route, requestParam) {
        return new Promise((resolve, reject) => {
            this.request(route, requestParam, (data) => {
                if (data.code !== 200) {
                    robotlogger.info(`uid - ${this.uid} | nickname - ${this.nickname} | 机器人请求 ${route} 接口出错: ${JSON.stringify(data)}`);
                    return reject(data);
                }
                return resolve(data);
            });
        });
    }
    async delayRequest(route, param, delayTime) {
        if (!route || isNullOrUndefined(param)) {
            return Promise.reject(`robotEnterBase.delayRequest|参数错误|${route}|${param}`);
        }
        return new Promise((resolve, reject) => {
            let delayTimeoutObj = setTimeout(async () => {
                try {
                    const res = await this.requestByRoute(route, param);
                    return resolve(res);
                }
                catch (error) {
                    return reject(error);
                }
                finally {
                    clearTimeout(delayTimeoutObj);
                    this.delayTimeoutObjs = this.delayTimeoutObjs.filter(c => c['_idleTimeout'] != delayTimeoutObj['_idleTimeout']);
                }
            }, delayTime);
            this.delayTimeoutObjs.push(delayTimeoutObj);
        });
    }
    ;
    async enterGameOrSelectionList(nid, sceneId, roomId, param = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                this.nid = nid;
                this.sceneId = sceneId;
                this.roomId = roomId;
                let { code, data } = await this.requestByRoute("hall.mainHandler.enterGameOrSelectionList", {
                    nid,
                    sceneId,
                    roomId,
                    whetherToShowScene: true,
                    whetherToShowRoom: false,
                    whetherToShowGamingInfo: false,
                    param
                });
                if (code !== 200) {
                    reject({ code, data });
                }
                if (Array.isArray(data.roomHistoryList) && data.roomHistoryList.length > 0) {
                    roomId = data.roomHistoryList[0].roomHistoryList;
                }
                data = await this.requestByRoute("hall.mainHandler.enterGameOrSelectionList", {
                    nid,
                    sceneId,
                    roomId,
                    whetherToShowScene: false,
                    whetherToShowRoom: false,
                    whetherToShowGamingInfo: false,
                    param
                });
                this.roomId = data['data']['roomId'];
                return resolve(data);
            }
            catch (error) {
                if (!(error instanceof Error) && typeof error === 'object') {
                    const { code, msg } = error;
                    if (code === 500) {
                        return reject(`uid:${this.uid}|nid:${this.nid}|sceneId:${this.sceneId}|roomId:${roomId}| ${JSON.stringify(error)}`);
                    }
                }
                return reject(`enterGameOrSelectionList|uid:${this.uid}|nid:${this.nid}|sceneId:${this.sceneId}|roomId:${roomId}|error:${error.stack || typeof error === 'string' ? error : JSON.stringify(error, null, 2)}`);
            }
            finally {
                this.check_robot_exit();
            }
        });
    }
    async enterHall(player, dataFromGate) {
        const guestid = player.guestid;
        this.player = player;
        this.guestid = guestid || "";
        this.uid = player.uid;
        try {
            await this.requestConnector(dataFromGate.server);
            const response = await this.requestByRoute("connector.entryHandler.entryHall", {
                uid: dataFromGate.uid,
                token: dataFromGate.token,
            });
            this.nickname = response.data.nickname;
            return response;
        }
        catch (error) {
            this.disconnect();
            return Promise.reject(error);
        }
    }
    async selfDestructive() {
        if (this.leaveStauts) {
            return false;
        }
        this.leaveStauts = true;
        this.clear_delayRequest_time();
        await this.robotDisconnect();
        clearInterval(this.check_Interval);
        this.destroy();
    }
    async leaveGameAndReset(flags = true) {
        if (this.leaveStauts) {
            return false;
        }
        this.leaveStauts = true;
        this.clear_delayRequest_time();
        try {
            if (flags) {
                await this.requestByRoute("hall.mainHandler.leaveRoomAndGame", {});
            }
            return true;
        }
        catch (error) {
            if (error instanceof ApiResult_1.ApiResult) {
                const { code } = error;
                switch (code) {
                    case 17017:
                    case 34701:
                        return false;
                    default:
                        break;
                }
            }
            return false;
        }
        finally {
            this.robotDisconnect();
            clearInterval(this.check_Interval);
        }
    }
    ;
    robotDisconnect() {
        this.disconnect();
        this.Emitter.removeAllListeners();
    }
    clear_delayRequest_time() {
        for (const delayTimeoutObj of this.delayTimeoutObjs) {
            clearTimeout(delayTimeoutObj);
        }
        this.delayTimeoutObjs = [];
    }
}
exports.BaseRobot = BaseRobot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFzZVJvYm90LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vdG9vbHMvdG9tL2dhbWUvYmFzZS9CYXNlUm9ib3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EseUNBQXNDO0FBQ3RDLCtDQUF5QztBQUd6QyxxRUFBa0U7QUFFbEUsTUFBTSxXQUFXLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztBQU12RCxTQUFnQixpQkFBaUIsQ0FBQyxJQUFJO0lBQ2xDLE9BQU8sSUFBSSxLQUFLLFNBQVMsSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDO0FBQy9DLENBQUM7QUFGRCw4Q0FFQztBQUFBLENBQUM7QUFHRixNQUFzQixTQUFVLFNBQVEsbUJBQVE7SUErQjVDLFlBQVksSUFBUztRQUNqQixLQUFLLEVBQUUsQ0FBQztRQTlCTCxZQUFPLEdBQVcsRUFBRSxDQUFDO1FBR3JCLFFBQUcsR0FBVyxFQUFFLENBQUM7UUFHakIsWUFBTyxHQUFXLENBQUMsQ0FBQztRQUdwQixXQUFNLEdBQVcsRUFBRSxDQUFDO1FBTW5CLGdCQUFXLEdBQUcsS0FBSyxDQUFDO1FBSTVCLHFCQUFnQixHQUFxQixFQUFFLENBQUM7UUFFeEMsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUNyQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBR3JCLFlBQU8sR0FBNkIsSUFBSSxDQUFDO0lBT3pDLENBQUM7SUFHTSxjQUFjLENBQUMsS0FBYSxFQUFFLFlBQVk7UUFDN0MsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNuQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRTtnQkFDdkMsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLEdBQUcsRUFBRTtvQkFDbkIsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksQ0FB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