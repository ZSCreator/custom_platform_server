"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainHandlerValidationRulesService = void 0;
const ApiResult_1 = require("../../../common/pojo/ApiResult");
const systemState_1 = require("../../../common/systemState");
const hallConst = require("../../../consts/hallConst");
const pinus_1 = require("pinus");
const langsrv = require("../../../services/common/langsrv");
const Game_manager_1 = require("../../../common/dao/daoManager/Game.manager");
const logger = (0, pinus_1.getLogger)("server_out", __filename);
const loggerPreStr = `大厅服务器 ${pinus_1.pinus.app.getServerId()} | `;
class MainHandlerValidationRulesService {
    constructor(handler) {
        this.handler = handler;
    }
    async _enterGameOrSelectionListValidate(language, parameter) {
        try {
            if (pinus_1.pinus.app.state > hallConst.SERVER_STATUS) {
                logger.warn(`${loggerPreStr}服务器即将维护`);
                return Promise.reject(new ApiResult_1.ApiResult(systemState_1.appState.Server_To_Be_Closed, [], langsrv.getlanguage(language, langsrv.Net_Message.id_226)));
            }
            const { nid, whetherToShowScene, whetherToShowRoom } = parameter;
            const gameInfo = await Game_manager_1.default.findOne({ nid });
            if (!gameInfo) {
                logger.warn(`${loggerPreStr}查询不到游戏:${nid} 配置信息`);
                return Promise.reject(new ApiResult_1.ApiResult(systemState_1.hallState.Can_Not_Find_SystemGame, [], langsrv.getlanguage(language, langsrv.Net_Message.id_226)));
            }
            if (gameInfo && gameInfo.opened == false) {
                logger.warn(`${loggerPreStr}游戏未开放:${nid} `);
                return Promise.reject(new ApiResult_1.ApiResult(systemState_1.hallState.Can_Not_Find_SystemGame, [], langsrv.getlanguage(language, langsrv.Net_Message.id_226)));
            }
            if (typeof whetherToShowScene !== 'boolean' || typeof whetherToShowRoom !== 'boolean') {
                return Promise.reject(new ApiResult_1.ApiResult(systemState_1.hallState.Parameter_Miss_Field, [], langsrv.getlanguage(language, langsrv.Net_Message.id_226)));
            }
            return null;
        }
        catch (e) {
            logger.error(`${loggerPreStr} 进入游戏出错:${e.stack}`);
            return Promise.reject(new ApiResult_1.ApiResult(systemState_1.httpState.ERROR, [], langsrv.getlanguage(language, langsrv.Net_Message.id_226)));
        }
    }
}
exports.MainHandlerValidationRulesService = MainHandlerValidationRulesService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbkhhbmRsZXJWYWxpZGF0aW9uUnVsZXNTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZlcnMvaGFsbC9zZXJ2aWNlL01haW5IYW5kbGVyVmFsaWRhdGlvblJ1bGVzU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSw4REFBMkQ7QUFDM0QsNkRBQTZFO0FBQzdFLHVEQUF1RDtBQUN2RCxpQ0FBeUM7QUFHekMsNERBQTZEO0FBQzdELDhFQUFzRTtBQUV0RSxNQUFNLE1BQU0sR0FBRyxJQUFBLGlCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQ25ELE1BQU0sWUFBWSxHQUFHLFNBQVMsYUFBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDO0FBRTNELE1BQWEsaUNBQWlDO0lBSTFDLFlBQVksT0FBb0I7UUFDNUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7SUFDMUIsQ0FBQztJQWlERCxLQUFLLENBQUMsaUNBQWlDLENBQUMsUUFBZ0IsRUFBRSxTQUEwQztRQUNoRyxJQUFJO1lBSUEsSUFBSSxhQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsYUFBYSxFQUFFO2dCQUMzQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsWUFBWSxTQUFTLENBQUMsQ0FBQztnQkFFdEMsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUkscUJBQVMsQ0FBQyxzQkFBUSxDQUFDLG1CQUFtQixFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNySTtZQUVELE1BQU0sRUFBRSxHQUFHLEVBQUUsa0JBQWtCLEVBQUUsaUJBQWlCLEVBQUUsR0FBRyxTQUFTLENBQUM7WUFFakUsTUFBTSxRQUFRLEdBQUcsTUFBTSxzQkFBVyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFFcEQsSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDWCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsWUFBWSxVQUFVLEdBQUcsT0FBTyxDQUFDLENBQUM7Z0JBRWpELE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLHFCQUFTLENBQUMsdUJBQVMsQ0FBQyx1QkFBdUIsRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDMUk7WUFFRCxJQUFJLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLEtBQUssRUFBRTtnQkFDdEMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLFlBQVksU0FBUyxHQUFHLEdBQUcsQ0FBQyxDQUFDO2dCQUU1QyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxxQkFBUyxDQUFDLHVCQUFTLENBQUMsdUJBQXVCLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzFJO1lBRUQsSUFBSSxPQUFPLGtCQUFrQixLQUFLLFNBQVMsSUFBSSxPQUFPLGlCQUFpQixLQUFLLFNBQVMsRUFBRTtnQkFDbkYsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUkscUJBQVMsQ0FBQyx1QkFBUyxDQUFDLG9CQUFvQixFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN2STtZQUVELE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxZQUFZLFdBQVcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDbEQsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUkscUJBQVMsQ0FBQyx1QkFBUyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDeEg7SUFDTCxDQUFDO0NBQ0o7QUE1RkQsOEVBNEZDIn0=