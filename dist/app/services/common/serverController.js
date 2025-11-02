'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAfterStartAll = void 0;
const pinus_1 = require("pinus");
const messageService = require("../MessageService");
const logService = require("./logService");
async function initAfterStartAll(app) {
    const currServerID = pinus_1.pinus.app.getServerId();
    try {
        if (currServerID === 'hall-server-1') {
            messageService.startBigWinNotice();
            return;
        }
        logService.logSyncLog(`initAfterStartAll|${currServerID}|初始化正常`);
        return Promise.resolve();
    }
    catch (error) {
        logService.logSyncLog(`initAfterStartAll|${currServerID}|初始化出错|${error}`);
        return Promise.resolve();
    }
}
exports.initAfterStartAll = initAfterStartAll;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyQ29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL2FwcC9zZXJ2aWNlcy9jb21tb24vc2VydmVyQ29udHJvbGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUdiLGlDQUEyQztBQUMzQyxvREFBcUQ7QUFDckQsMkNBQTRDO0FBR3JDLEtBQUssVUFBVSxpQkFBaUIsQ0FBQyxHQUFnQjtJQUNwRCxNQUFNLFlBQVksR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQzdDLElBQUk7UUFFQSxJQUFJLFlBQVksS0FBSyxlQUFlLEVBQUU7WUFFbEMsY0FBYyxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDbkMsT0FBTztTQUNWO1FBQ0QsVUFBVSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsWUFBWSxRQUFRLENBQUMsQ0FBQztRQUNqRSxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM1QjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osVUFBVSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsWUFBWSxVQUFVLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDMUUsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDNUI7QUFDTCxDQUFDO0FBZkQsOENBZUM7QUFBQSxDQUFDIn0=