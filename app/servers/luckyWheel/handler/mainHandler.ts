import {Application, pinus} from 'pinus';
import regulation = require('../../../domain/games/regulation');
import { getLogger, Logger } from 'pinus-logger';
import { FrontendSession } from "pinus";
import RoomStandAlone from "../lib/Room";
import Player from "../lib/Player";
import {LWLotteryResult} from "../lib/util/lotteryUtil";
import { getlanguage, Net_Message } from "../../../services/common/langsrv";
import * as moment from "moment";
import GameRecordMysqlDao from "../../../common/dao/mysql/GameRecord.mysql.dao";
import roomManager from "../lib/roomManager";

/**
 * 下注参数
 * @property lineNum 选线
 * @property bet 基础押注
 * @property room 房间
 * @property player 玩家
 */
interface BetParamOption {
    lineNum: number,
    bet: number,
    room: RoomStandAlone,
    player: Player,
}

export default function (app: Application) {
    return new mainHandler(app);
};
export class mainHandler {
    logger: Logger;

    constructor(private app: Application) {
        this.logger = getLogger('log', __filename);
    }

    /**
     * 加载获取参数
     * @param player 房间内部玩家
     * @param room
     * @param session
     * @route luckyWheel.mainHandler.load
     */
    async load({ player, room }: { player: Player, room: RoomStandAlone }, session: FrontendSession) {
        return {
            code: 200,
            gold: player.gold,
            roundId: player.roundId
        };
    }


    /**
     * 开始游戏
     * @param lineNum 选线条数
     * @param bet 基础押注
     * @param room 房间
     * @param player 房间内玩家
     * @param session
     * @route luckyWheel.mainHandler.start
     */
    async start({ bet, room, player }: BetParamOption, session: FrontendSession) {
        // 如果玩家正在游戏则不进行判断
        if (player.isGameState()) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_3103)}
        }

        // 如果游戏不开放
        if (!(await room.isGameOpen())) {
            // let offLineArr = [{ nid: room.nid, sceneId: room.sceneId, roomId: room.roomId, uid: player.uid }];
            await room.kickingPlayer(pinus.app.getServerId(), [player]);
            return { code: 500, error: getlanguage(player.language, Net_Message.id_1055) };
        }

        if (typeof bet !== 'number' || bet <= 0) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_4000) };
        }

        console.warn('大转盘玩家下注', player.uid, bet);

        // 改变玩家状态
        player.changeGameState();

        try {
            // 如果缺少金币
            if (player.isLackGold(bet)) {
                return { code: 500, error: getlanguage(player.language, Net_Message.id_1015) };
            }
            
            // 初始化玩家
            player.init();

            // 押注
            player.bet(bet);

            // 添加调控池以及盈利池
            room.addRunningPool(player.totalBet).addProfitPool(player.totalBet);

            // 开奖
            const result: LWLotteryResult  = await room.lottery(player);

            // 结算
            await room.settlement(player, result);

            // 给离线玩家发送邮件且删除玩家
            room.sendMailAndRemoveOfflinePlayer(player);

            // 返回参数
            const returns = {
                lotteryResult: result.result,
                isBigWin: player.isBigWin,
                roundId: player.roundId,
                gold: player.gold,
                profit: result.profit
            };

            return { code: 200, result: returns }
        } catch (e) {
            // 由于出现过一次未找到模块参数的情况，加入一个regulation.intoJackpot以便排查
            this.logger.error(`幸运转盘 玩家${player.uid}的游戏spin出错:start: ${e} \n 奖池比例: ${regulation.intoJackpot}`);
            return { code: 500, error: getlanguage(player.language, Net_Message.id_1012) };
        } finally {
            // 不管结果如何都变为休闲状态
            player.changeLeisureState();
            await room.removeOfflinePlayer(player);
        }
    }

    /**
     * 获取玩家的最近10条游戏记录
     * @route luckyWheel.mainHandler.gameRecord
     */
    async gameRecord({ player }: {player: Player, room: RoomStandAlone}) {
        let language = null;
        try {
            let tableName = moment().format("YYYYMM");
            let table = `Sp_GameRecord_${tableName}`;
            if (player.group_id){
                table = `Sp_GameRecord_${player.group_id}_${tableName}`
            }

            let result = await GameRecordMysqlDao.findListForLuckyWheel(table, roomManager._nid, player.uid);

            if (!result) {
                return { code: 200, result: [] };
            }

            return { code: 200, result: result.map(r => {
                    return {
                        roundId: r.roundId,
                        result: JSON.parse(r.result).lotteryResult,
                        validBet: r.validBet,
                    }
                }) };
        } catch (error) {
            this.logger.error(`luckyWheel.gameHandler.gameRecord: ${error.stack || error.message || JSON.stringify(error)}`);
            return { code: 500, error: getlanguage(language, Net_Message.id_14) };
        }
    }
}