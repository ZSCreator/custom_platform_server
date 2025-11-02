import { Application, pinus } from 'pinus';
import regulation = require('../../../domain/games/regulation');
import { getLogger, Logger } from 'pinus-logger';
import { FrontendSession } from "pinus";
import RoomStandAlone from "../lib/Room";
import Player from "../lib/Player";
import { isNullOrUndefined } from "../../../utils/lottery/commonUtil";
import { FreeSpinResult, isHaveLine, XYJLotteryResult } from "../lib/util/lotteryUtil";
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

/**
 * bonus小游戏参数
 * @property totalBet 上一次总押注
 * @property over 是否结束
 * @property playTimes 这里是选择次数还是选择时间不定 偏向与选择次数
 * @property room 所在房间
 * @property player 所在房间的玩家
 */
interface BonusGameParams {
    totalBet: number,
    over: boolean,
    playTimes: number,
    room: RoomStandAlone,
    player: Player
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
     * @route xiyouji.mainHandler.load
     */
    async load({ player, room }: { player: Player, room: RoomStandAlone }, session: FrontendSession) {
        // player.setRoundId(room.getRoundId(player.uid));
        return {
            code: 200,
            gold: player.gold,
            gainedScatter: player.getAllCharacters(),
            roundId: player.roundId
        };
    }

    /**
     * 获取已获得的图标
     * @return {gainedScatter}
     * @route: xiyouji.mainHandler.gainedScatter
     */
    async gainedScatter({ player }: { player: Player }) {
        return { code: 200, gainedScatter: player.getAllCharacters() };
    };

    /**
     * 开始游戏
     * @param lineNum 选线条数
     * @param bet 基础押注
     * @param room 房间
     * @param player 房间内玩家
     * @param session
     * @route xiyouji.mainHandler.start
     */
    async start({ lineNum, bet, room, player }: BetParamOption, session: FrontendSession) {
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
        if (isNullOrUndefined(lineNum) || isNullOrUndefined(bet)) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_4000) };
        }

        // 判断选线是否合理
        if (!isHaveLine(lineNum)) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_4000) };
        }

        // 如果押注不合理
        if (typeof lineNum !== 'number' || typeof bet !== 'number' || bet <= 0) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_4000) };
        }

        if (player.gameState !== 1) {
            return { code: 200, error: getlanguage(player.language, Net_Message.id_3202)}
        }

        // 改变玩家状态
        player.changeGameState();

        try {
            // 如果缺少金币
            if (player.isLackGold(bet, lineNum)) {
                return { code: 500, error: getlanguage(player.language, Net_Message.id_1015) };
            }
            
            // 初始化玩家
            player.init();

            // 押注
            player.bet(bet, lineNum);

            // 添加调控池以及盈利池
            room.addRunningPool(player.totalBet).addProfitPool(player.totalBet);

            // 开奖
            const { result, freeSpinResult }: { result: XYJLotteryResult, freeSpinResult: FreeSpinResult } = await room.lottery(player);

            // 结算
            await room.settlement(player, result, freeSpinResult);

            // 给离线玩家发送邮件且删除玩家
            room.sendMailAndRemoveOfflinePlayer(player);

            // 返回参数
            const returns = {
                firstRound: result.characterWindow,
                rounds: result.rounds,
                luckyFiveLines: result.luckyFiveLines,
                fiveLines: result.fiveLines,
                roundsAward: result.roundsAward,
                allTotalWin: result.allTotalWin,
                canFreespin: !!freeSpinResult,
                gainedScatter: player.getCurrentCharacters(),
                canBoom: false,
                freespins: !!freeSpinResult ? freeSpinResult.results : [],
                freespinAllTotalWin: !!freeSpinResult ? freeSpinResult.totalWin : 0,
                freespinAllJackpotWin: !!freeSpinResult ? freeSpinResult.jackpotWin : 0,
                canOnlineAward: false,
                onlineAward: 0,
                isBigWin: player.isBigWin,
                roundId: player.roundId,
                gold: player.gold
            };

            return { code: 200, result: returns }
        } catch (e) {
            // 由于出现过一次未找到模块参数的情况，加入一个regulation.intoJackpot以便排查
            this.logger.error(`西游记 玩家${player.uid}的游戏spin出错:start: ${e} \n 奖池比例: ${regulation.intoJackpot}`);
            return { code: 500, error: getlanguage(player.language, Net_Message.id_1012) };
        } finally {
            // 不管结果如何都变为休闲状态
            player.changeLeisureState();
            await room.removeOfflinePlayer(player);
        }
    }

    /**
     * 小游戏
     * @route: xiyouji.mainHandler.littleGame
     * @param over 是否放弃
     * @param playTimes 选择时间
     * @param room 选择时间
     * @param player 房间玩家
     */
    async littleGame({over, playTimes, room, player }: BonusGameParams) {
        // 如果玩家正在游戏则不进行判断
        if (player.isGameState()) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_3103)}
        }

        if (player.gameState !== 2) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_3202)}
        }

        // 改变玩家状态
        player.changeGameState();

        try { // 小游戏开奖
            const result: { isOver: boolean, profit: number } = await room.bonusGameLottery(player, over, playTimes);

            return {code: 200, continue: !result.isOver, award: result.profit, roundId: player.roundId}
        } catch (e) {
            this.logger.error(`西游记 玩家${player.uid}的小游戏出错: ${e}`);
            return { code: 500, error: getlanguage(player.language, Net_Message.id_1012) };
        } finally {
            // 不管结果如何都变为休闲状态
            player.changeLeisureState();
            await room.removeOfflinePlayer(player);
        }
    };

    /**
     * 申请奖池信息
     * @route: xiyouji.mainHandler.jackpotFund
     */
    async jackpotFund({ room }: { room: RoomStandAlone }) {
        return {
            code: 200,
            jackpotFund: room.jackpot,
            runningPool: room.runningPool,
            profit: room.profitPool
        };
    };

    /**
     * 申请奖池信息
     * @route: xiyouji.mainHandler.jackpotShow
     */
    async jackpotShow({ room }: { room: RoomStandAlone }) {
        return {
            code: 200,
            jackpotShow: room.jackpotShow,
        }
    };
}