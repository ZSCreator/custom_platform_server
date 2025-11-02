import { Application, FrontendSession, pinus } from 'pinus';
import regulation = require('../../../domain/games/regulation');
import { getLogger, Logger } from 'pinus-logger';
import { isNullOrUndefined } from "../../../utils/lottery/commonUtil";
import { isHaveLine, SlotResult } from "../lib/util/lotteryUtil";
import RoomStandAlone from "../lib/Room";
import Player from "../lib/Player";
import { getlanguage, Net_Message } from "../../../services/common/langsrv";

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
    return new MainHandler(app);
}

export class MainHandler {
    logger: Logger;

    constructor(private app: Application) {
        this.logger = getLogger('server_out', __filename);
    }

    /**
     * 加载获取参数
     * @param player 房间内部玩家
     * @param room 房间
     * @param session
     * @route slots77.mainHandler.load
     */
    async load({ player, room }: { player: Player, room: RoomStandAlone }, session: FrontendSession) {

        player.setRoundId(room.getRoundId(player.uid));
        return {
            code: 200,
            gold: player.gold,
            roundId: player.roundId,
        };
    }

    /**
     * 开始游戏
     * @param lineNum 选线条数
     * @param bet 基础押注
     * @param room 房间
     * @param player 房间内玩家
     * @param session
     * @route slots77.mainHandler.start
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

        // 判断传入参数是否合理
        if ( isNullOrUndefined(bet)) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_4000) };
        }

        // 改变玩家状态
        player.changeGameState();

        try {
            // 如果押注不合理
            if ( typeof bet !== 'number' || bet <= 0) {
                return { code: 500, error: getlanguage(player.language, Net_Message.id_4000) };
            }

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
            const result: SlotResult = await room.lottery(player);

            player.playerWin = result.totalWin;

            // 结算
            await room.settlement(player, result);

            // 给离线玩家发送邮件且删除玩家
            room.sendMailAndRemoveOfflinePlayer(player);

            // 返回参数
            return {
                code: 200,
                getWindow: result.window,
                totalWin: player.profit,
                jackpotType: result.jackpotType,
                winLines: result.winLines,
                // canOnlineAward: false,
                // onlineAward: 0,
                // gold: player.gold,
                // freeSpin: result.freeSpin,
                freeSpinResult: result.freeSpinResult,
                roundId: player.roundId,
                bankCard : result.bankCard,
            };
        } catch (e) {
            // 由于出现过一次未找到模块参数的情况，加入一个regulation.intoJackpot以便排查
            this.logger.error(`玩家${player.uid}的游戏spin出错:slots77-start: ${e} \n 奖池比例: ${regulation.intoJackpot}`);

            return { code: 500, error: getlanguage(player.language, Net_Message.id_1012) };
        } finally {
            // 不管结果如何都变为休闲状态
            player.changeLeisureState();
            await room.removeOfflinePlayer(player);
        }
    }

    /**
     * 玩家点击扑克获取小游戏相关信息
     * @route: slots77.mainHandler.goldDouble
     */
    async goldDouble({ player,room }: BetParamOption, session: FrontendSession) {

        if(player.gold < player.playerWin){
            return { code: 500, error: getlanguage(player.language, Net_Message.id_1015) };
        }
        try {
            let result = await room.goldDouble(player);
            return { code : 200 ,  doubleResult : result.doubleResult , bankCard : result.bankCard }
        } catch (e) {
            this.logger.error(`玩家${player.uid}玩家点击扑克获取小游戏相关信息:${e} `);
            return {code: 500, error: getlanguage(player.language, Net_Message.id_1012)};
        }
    }

    /**
     * 点击金猪收取金币
     * @route: slots77.mainHandler.getGold
     */
    async getGold({ player }: BetParamOption, session: FrontendSession) {

        if(player.gold < player.playerWin){
            return { code: 500, error: getlanguage(player.language, Net_Message.id_1015) };
        }
        try {
            return { code : 200 , gold : player.gold , playerWin : player.playerWin  }
        } catch (e) {
            this.logger.error(`玩家${player.uid}玩家点击扑克获取小游戏相关信息:${e} `);
            return {code: 500, error: getlanguage(player.language, Net_Message.id_1012)};
        }
    }

    /**
     * 初始化，进入游戏获取玩家的金币
     * @route: slots77.mainHandler.loadGold
     */
    async loadGold({ player }: BetParamOption, session: FrontendSession) {
        return { code: 200, gold: player.gold }
    }


}