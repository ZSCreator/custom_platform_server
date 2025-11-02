"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconnectBeforeEntryRoom = void 0;
const pinus_1 = require("pinus");
const ApiResult_1 = require("../../../common/pojo/ApiResult");
const systemState_1 = require("../../../common/systemState");
const pinus_logger_1 = require("pinus-logger");
const logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const Game_manager_1 = require("../../../common/dao/daoManager/Game.manager");
async function reconnectBeforeEntryRoom(nid, uid) {
    try {
        const { name } = await Game_manager_1.default.findOne({ nid });
        if (!name) {
            return false;
        }
        if (!pinus_1.pinus.app.rpc[name]) {
            return new ApiResult_1.ApiResult(systemState_1.hallState.Game_Not_Open, [], '游戏暂未开放，即将上线');
        }
        const serverInfoList = pinus_1.pinus.app.getServersByType(name);
        const backendServerId = serverInfoList[0].id;
        if (!pinus_1.pinus.app.rpc[name].mainRemote.reconnectBeforeEntryRoom) {
            return false;
        }
        const rpcReuslt = await pinus_1.pinus.app.rpc[name].mainRemote.reconnectBeforeEntryRoom.toServer(backendServerId, { uid });
        return !!(rpcReuslt && rpcReuslt.code === 200);
    }
    catch (e) {
        logger.error(`${pinus_1.pinus.app.getServerId()} | RPC玩家重连前出错:${e.stack}`);
        return false;
    }
}
exports.reconnectBeforeEntryRoom = reconnectBeforeEntryRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZVJlbW90ZUNhbGxTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvaGFsbC9zZXJ2aWNlL0dhbWVSZW1vdGVDYWxsU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxpQ0FBOEI7QUFDOUIsOERBQTJEO0FBQzNELDZEQUF3RDtBQUN4RCwrQ0FBeUM7QUFFekMsTUFBTSxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUVuRCw4RUFBc0U7QUFTL0QsS0FBSyxVQUFVLHdCQUF3QixDQUFDLEdBQWdCLEVBQUUsR0FBVztJQUN4RSxJQUFJO1FBR0EsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLE1BQU0sc0JBQVcsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBRXBELElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDUCxPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUdELElBQUksQ0FBQyxhQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN0QixPQUFPLElBQUkscUJBQVMsQ0FBQyx1QkFBUyxDQUFDLGFBQWEsRUFBRSxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7U0FDcEU7UUFFRCxNQUFNLGNBQWMsR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXhELE1BQU0sZUFBZSxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFN0MsSUFBSSxDQUFDLGFBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyx3QkFBd0IsRUFBRTtZQUMxRCxPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUVELE1BQU0sU0FBUyxHQUFHLE1BQU0sYUFBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLHdCQUF3QixDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBR25ILE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxJQUFJLFNBQVMsQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7S0FDbEQ7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNSLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxhQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDbkUsT0FBTyxLQUFLLENBQUM7S0FDaEI7QUFDTCxDQUFDO0FBL0JELDREQStCQyJ9