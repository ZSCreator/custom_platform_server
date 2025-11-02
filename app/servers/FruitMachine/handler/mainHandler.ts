import { Application, FrontendSession } from 'pinus';
import { getLogger } from "pinus-logger";
import * as FMConst from "../lib/FruitMachineConst";
import RoomStandAlone from "../lib/RoomStandAlone";
import Player from "../lib/Player";
import {getlanguage, Net_Message} from "../../../services/common/langsrv";
import {ScenePointValueMap} from "../../../../config/data/gamesScenePointValue";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";
const logger = getLogger('server_out', __filename);


/**
 * 下注参数
 * @property data 下注数据
 * @property room 房间
 * @property player 玩家
 */
interface BetParamOption {
    data: { [area: string]: number },
    room: RoomStandAlone,
    player: Player,
}


export default function (app: Application) {
    return new mainHandler(app);
}

export class mainHandler {

    constructor(private app: Application) {
        this.app = app;
    }

    /**
     * 第一次进入游戏需加载的内容 单机版
     * @return {Function} callback: 成功代码以及房间信息 || 错误代码以及错误信息
     * @route  FruitMachine.mainHandler.loadedGame
     *  */
    async loadedGame({ player }: { room: RoomStandAlone, player: Player }) {
        // player.setRoundId(room.getRoundId(player.uid));
        return {
            code: 200,
            player: player.strip(),
            roundId: player.roundId,
            pointValue: ScenePointValueMap[GameNidEnum.FruitMachine].pointValue
        };
    }

    // /**
    //  * 获取房间玩家列表
    //  * @return {Function} callback: 成功代码以及房间玩家过滤后的信息 || 错误代码以及错误信息
    //  * @route  FruitMachine.mainHandler.getPlayers
    //  * */
    // async getPlayers({ }, session: FrontendSession) {
    //   const { roomId, uid, nid } = sessionService.sessionInfo(session);
    //   const { roomInfo, error } = process(roomId, uid, nid);
    //   const { player } = await PlayerManager.getPlayer({ uid }, false);
    //
    //   if (error) {
    //     return { code: 500, error: langsrv.getlanguage(player.language,2004) };
    //   }
    //
    //   return {
    //     code: 200,
    //     players: roomInfo.getPlayers(),
    //   };
    // }

    /**
     * 玩家下注
     * @param {Object} bets:  下注区域及下注区域金额 {"orange": number}
     * @return {Function} callback: 成功代码 || 错误代码以及错误信息
     * @route FruitMachine.mainHandler.userBet
     * */
    async userBet({ data, player, room }: BetParamOption) {
        // 如果玩家正在游戏则不进行判断
        if (player.isGameState()) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_3103)}
        }

        // 如果传过来的不是对象 或者是空对象返回错误
        if (typeof data !== 'object' || !Object.keys(data).length) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_1106) };
        }

        // 如果传入错误类型
        if (Object.keys(data).find(key => !FMConst.areaOdds.hasOwnProperty(key))) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_1106) };
        }

        player.changeGameState();

        try {
            // 如果押注金币超过拥有金币
            if (player.isLackGold(data)) {
                return { code: 500, error: getlanguage(player.language, Net_Message.id_1015) };
            }

            // 限压检测
            if (room.checkLimit(player, data)) {
                return { code: 500, error: getlanguage(player.language, Net_Message.id_1013) }
            }

            // 玩家下注 判断是否下注成功
            await player.bet(data);

            // 开奖
            const { totalProfit, playerWinAreas, lotteryResult, bigOdds,  records } = await room.lottery(player);

            // 结算
            await room.settlement(player, totalProfit, bigOdds, lotteryResult, records);

            return {
                code: 200,
                lotteryResult,
                totalProfit,
                bigOdds,
                playerWinAreas,
                gold: player.gold,
                roundId: player.roundId
            }
        } catch (error) {
            logger.error('水果机下注失败', error.stack || error);
            return { code: 500, error: getlanguage(player.language, Net_Message.id_1012) };
        } finally {
            player.changeLeisureState();
            await room.removeOfflinePlayer(player);
        }
    }
}