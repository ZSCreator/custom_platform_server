import { ApiResult } from "../../../common/pojo/ApiResult";
import { hallState, appState, httpState } from "../../../common/systemState";
import * as hallConst from '../../../consts/hallConst';
import { pinus, getLogger } from "pinus";
import { MainHandler } from "../handler/mainHandler";
import { IEnterGameOrSelectionListOption } from "../../../common/pojo/dto/IHall.mainHandler";
import langsrv = require('../../../services/common/langsrv');
import GameManager from "../../../common/dao/daoManager/Game.manager";

const logger = getLogger("server_out", __filename);
const loggerPreStr = `大厅服务器 ${pinus.app.getServerId()} | `;

export class MainHandlerValidationRulesService {

    handler: MainHandler;

    constructor(handler: MainHandler) {
        this.handler = handler
    }

    /**
     * 校验客户端请求参数
     * @param player 玩家基础信息
     */
    // async enterGameOrSelectionListValidate(player: PlayerInfo, parameter: IEnterGameOrSelectionListOption): Promise<ApiResult | null> {
    //     try {
    //
    //         if (!player) {
    //             this.handler.logger.warn(`${loggerPreStr}查询不到玩家`);
    //
    //             return new ApiResult(hallState.Can_Not_Find_Player, [], langsrv.getlanguage(player.language, langsrv.Net_Message.id_3));
    //         }
    //
    //         if (pinus.app.state > hallConst.SERVER_STATUS) {
    //             this.handler.logger.warn(`${loggerPreStr}服务器即将维护`);
    //
    //             return new ApiResult(appState.Server_To_Be_Closed, [], langsrv.getlanguage(player.language, langsrv.Net_Message.id_226));
    //         }
    //
    //         const { nid, whetherToShowScene, whetherToShowRoom } = parameter;
    //
    //         const systemGameInfo = await GameManagerDao.findOne({ nid });
    //
    //         if (!systemGameInfo) {
    //             this.handler.logger.warn(`${loggerPreStr}查询不到游戏:${nid} 配置信息`);
    //
    //             return new ApiResult(hallState.Can_Not_Find_SystemGame, [], langsrv.getlanguage(player.language, langsrv.Net_Message.id_226));
    //         }
    //         if (!systemGameInfo.opened) {
    //             this.handler.logger.warn(`${loggerPreStr}游戏 ${nid} 未开放`);
    //             return new ApiResult(hallState.Game_Not_Open, [], langsrv.getlanguage(player.language, langsrv.Net_Message.id_226));
    //         }
    //
    //         if (typeof whetherToShowScene !== 'boolean' || typeof whetherToShowRoom !== 'boolean') {
    //             return new ApiResult(hallState.Parameter_Miss_Field, [], langsrv.getlanguage(player.language, langsrv.Net_Message.id_226));
    //         }
    //
    //         return null;
    //     } catch (e) {
    //         this.handler.logger.error(`${loggerPreStr} 进入游戏出错:${e.stack}`);
    //         return new ApiResult(httpState.ERROR, [], langsrv.getlanguage(player.language, langsrv.Net_Message.id_226))
    //     }
    // }

    /**
     * 校验客户端请求参数
     */
    async _enterGameOrSelectionListValidate(language: string, parameter: IEnterGameOrSelectionListOption) {
        try {



            if (pinus.app.state > hallConst.SERVER_STATUS) {
                logger.warn(`${loggerPreStr}服务器即将维护`);

                return Promise.reject(new ApiResult(appState.Server_To_Be_Closed, [], langsrv.getlanguage(language, langsrv.Net_Message.id_226)));
            }

            const { nid, whetherToShowScene, whetherToShowRoom } = parameter;

            const gameInfo = await GameManager.findOne({ nid });

            if (!gameInfo) {
                logger.warn(`${loggerPreStr}查询不到游戏:${nid} 配置信息`);

                return Promise.reject(new ApiResult(hallState.Can_Not_Find_SystemGame, [], langsrv.getlanguage(language, langsrv.Net_Message.id_226)));
            }

            if (gameInfo && gameInfo.opened == false) {
                logger.warn(`${loggerPreStr}游戏未开放:${nid} `);

                return Promise.reject(new ApiResult(hallState.Can_Not_Find_SystemGame, [], langsrv.getlanguage(language, langsrv.Net_Message.id_226)));
            }
            // if (typeof whetherToShowScene !== 'boolean' || typeof whetherToShowRoom !== 'boolean' || typeof whetherToShowGamingInfo !== 'boolean') {
            if (typeof whetherToShowScene !== 'boolean' || typeof whetherToShowRoom !== 'boolean') {
                return Promise.reject(new ApiResult(hallState.Parameter_Miss_Field, [], langsrv.getlanguage(language, langsrv.Net_Message.id_226)));
            }

            return null;
        } catch (e) {
            logger.error(`${loggerPreStr} 进入游戏出错:${e.stack}`);
            return Promise.reject(new ApiResult(httpState.ERROR, [], langsrv.getlanguage(language, langsrv.Net_Message.id_226)));
        }
    }
}
