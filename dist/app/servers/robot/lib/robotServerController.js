'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.robotEnterEachGameEx = exports.stop_robot_server = exports.start_robot_server = exports.afterRobotServerStarted = exports.inventoryRobots = exports.getOneAvailableRobot = exports.increaseAvailableRobot = exports.getAllAvailableRobot = exports.robot_Controller = exports.robot_run = void 0;
const pinus_1 = require("pinus");
const robotConst = require("../../../consts/robotConst");
const JsonConfig = require("../../../pojo/JsonConfig");
const Game_manager_1 = require("../../../common/dao/daoManager/Game.manager");
const pinus_logger_1 = require("pinus-logger");
const redisManager = require("../../../common/dao/redis/lib/redisManager");
const robotlogger = (0, pinus_logger_1.getLogger)('robot_out', __filename);
const AiAutoCreat_1 = require("./AiAutoCreat");
exports.robot_run = {};
exports.robot_Controller = {
    async start() {
        return await redisManager.setObjectIntoRedisNoExpiration("robot:Controller", 1).catch(error => {
        });
    },
    async get() {
        return await redisManager.getObjectFromRedis("robot:Controller");
    },
    async stop() {
        return await redisManager.setObjectIntoRedisNoExpiration("robot:Controller", 0).catch(error => {
        });
    },
};
async function getAllAvailableRobot() {
    return await redisManager.getAllFromSet(robotConst.AVAILABLE_ROBOT_SET);
}
exports.getAllAvailableRobot = getAllAvailableRobot;
;
async function increaseAvailableRobot(guestid) {
    let ret = await redisManager.storeInSet(robotConst.AVAILABLE_ROBOT_SET, guestid).catch(error => {
        robotlogger.warn(`robotCommonOp.increaseAvailableRobot|${error.stack || error.message || error}`);
    });
}
exports.increaseAvailableRobot = increaseAvailableRobot;
;
async function getOneAvailableRobot() {
    let guestid = await redisManager.spop(robotConst.AVAILABLE_ROBOT_SET);
    if (guestid) {
        return { guestid };
    }
    return null;
}
exports.getOneAvailableRobot = getOneAvailableRobot;
;
async function inventoryRobots() {
    try {
        const allRobotPlayer = await (0, AiAutoCreat_1.GetAllSpPl)();
        if (!Array.isArray(allRobotPlayer)) {
            return;
        }
        for (const guestid of allRobotPlayer) {
            await increaseAvailableRobot(guestid);
        }
        return allRobotPlayer;
    }
    catch (error) {
        return Promise.reject(error.stack);
    }
}
exports.inventoryRobots = inventoryRobots;
;
async function afterRobotServerStarted() {
    try {
        await redisManager.deleteKeyFromRedis(robotConst.AVAILABLE_ROBOT_SET);
        await inventoryRobots();
        let allRobot = await getAllAvailableRobot();
        robotlogger.warn(`${pinus_1.pinus.app.getServerId()}|allRobot.length:${allRobot.length}`);
        await exports.robot_Controller.start();
    }
    catch (error) {
        robotlogger.warn(`robotServerController.afterRobotServerStarted|${error}`);
    }
}
exports.afterRobotServerStarted = afterRobotServerStarted;
;
function start_robot_server(nid, Mode_IO = false, delay = 5 * 1000) {
    setTimeout(async () => {
        if (exports.robot_run[nid]) {
            exports.robot_run[nid].robotManger.start();
            return;
        }
        let starting = await exports.robot_Controller.get();
        if (starting == 1) {
            exports.robot_run[nid] = { nid, run: true };
            let allRobotConfig = JsonConfig.get_all_robotStatus();
            for (let oneRobotConfig of allRobotConfig) {
                if (oneRobotConfig.open && oneRobotConfig.nid == nid) {
                    exports.robot_run[nid].robotManger = await robotEnterEachGameEx(oneRobotConfig.nid, Mode_IO);
                    break;
                }
            }
        }
        else {
            start_robot_server(nid, Mode_IO, 1000);
        }
    }, delay);
}
exports.start_robot_server = start_robot_server;
function stop_robot_server(nid) {
    if (!exports.robot_run[nid]) {
        return;
    }
    exports.robot_run[nid].robotManger.stop();
}
exports.stop_robot_server = stop_robot_server;
async function robotEnterEachGameEx(nid, Mode_IO = false) {
    const game = await Game_manager_1.default.findOne({ nid });
    if (!game) {
        return null;
    }
    switch (nid) {
        default:
            robotlogger.warn(`robotServerController.robotEnterEachGame|游戏 nid 错误：${nid}`);
            return null;
    }
}
exports.robotEnterEachGameEx = robotEnterEachGameEx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9ib3RTZXJ2ZXJDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvcm9ib3QvbGliL3JvYm90U2VydmVyQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUdiLGlDQUE4QjtBQUM5Qix5REFBeUQ7QUFrQ3pELHVEQUF1RDtBQUV2RCw4RUFBd0U7QUFFeEUsK0NBQXlDO0FBRXpDLDJFQUE0RTtBQUM1RSxNQUFNLFdBQVcsR0FBRyxJQUFBLHdCQUFTLEVBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ3ZELCtDQUE2RDtBQU1sRCxRQUFBLFNBQVMsR0FBZ0YsRUFBRSxDQUFDO0FBQzFGLFFBQUEsZ0JBQWdCLEdBQUc7SUFDNUIsS0FBSyxDQUFDLEtBQUs7UUFDUCxPQUFPLE1BQU0sWUFBWSxDQUFDLDhCQUE4QixDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUM5RixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDRCxLQUFLLENBQUMsR0FBRztRQUNMLE9BQU8sTUFBTSxZQUFZLENBQUMsa0JBQWtCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBQ0QsS0FBSyxDQUFDLElBQUk7UUFDTixPQUFPLE1BQU0sWUFBWSxDQUFDLDhCQUE4QixDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUM5RixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSixDQUFDO0FBR0ssS0FBSyxVQUFVLG9CQUFvQjtJQUN0QyxPQUFPLE1BQU0sWUFBWSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUM1RSxDQUFDO0FBRkQsb0RBRUM7QUFBQSxDQUFDO0FBSUssS0FBSyxVQUFVLHNCQUFz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