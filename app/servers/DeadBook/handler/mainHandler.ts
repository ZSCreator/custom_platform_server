import { Application, FrontendSession, pinus } from 'pinus';
import regulation = require('../../../domain/games/regulation');
import { getLogger, Logger } from 'pinus-logger';
import { isNullOrUndefined } from "../../../utils/lottery/commonUtil";
import { SlotResult } from "../lib/util/lotteryUtil";
import RoomStandAlone from "../lib/room";
import Player from "../lib/player";
import { getlanguage, Net_Message } from "../../../services/common/langsrv";
import {ColorType, PlayerGameState} from "../lib/constant";

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
     * @route DeadBook.mainHandler.load
     */
    async load({ player, room }: { player: Player, room: RoomStandAlone }, session: FrontendSession) {
        // player.setRoundId(room.getRoundId(player.uid));
        return {
            code: 200,
            gold: player.gold,
            roundId: player.roundId,
        };
    }

    /**
     * 开始游戏
     * @param bet 基础押注
     * @param room 房间
     * @param player 房间内玩家
     * @param session
     * @route DeadBook.mainHandler.start
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
        if (isNullOrUndefined(bet)) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_4000) };
        }

        // 如果不是正常游戏状态
        if (player.gameState !== PlayerGameState.NORMAL) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_3103) };
        }

        // 改变玩家状态
        player.changeGameState();

        try {
            // 如果押注不合理
            if (typeof bet !== 'number' || bet <= 0) {
                return { code: 500, error: getlanguage(player.language, Net_Message.id_4000) };
            }

            // 如果缺少金币
            if (player.isLackGold(bet)) {
                return { code: 500, error: getlanguage(player.language, Net_Message.id_1015) };
            }

            // 初始化玩家
            player.init();
            room.setRoundId(player);

            // 押注
            player.bet(bet);

            // 添加调控池以及盈利池
            room.addRunningPool(player.totalBet).addProfitPool(player.totalBet);

            // 开奖
            const result: SlotResult = await room.lottery(player);
            player.setResult(result);

            // 没中奖就直接结算
            if (result.totalWin === 0) {
                await room.settlement(player);
            } else {
                player.setBoState();
            }

            // await room.settlement(player);


            // 返回参数
            return {
                code: 200,
                getWindow: result.window,
                totalWin: result.totalWin,
                winLines: result.winLines,
                isBigWin: player.isBigWin,
                gold: player.gold,
                freeSpin: result.freeSpin,
                freeSpinResult: result.freeSpinResult,
                roundId: player.roundId,
                freeSpinSpecialElement: result.freeSpinSpecialElement
            };
        } catch (e) {
            // 由于出现过一次未找到模块参数的情况，加入一个regulation.intoJackpot以便排查
            this.logger.error(`玩家${player.uid}的游戏spin出错:DeadBook-start: ${e} \n 奖池比例: ${regulation.intoJackpot}`);

            return { code: 500, error: getlanguage(player.language, Net_Message.id_1012) };
        } finally {
            // 不管结果如何都变为休闲状态
            player.changeLeisureState();

            if (!player.onLine) {
                // 结算
                await room.settlement(player);
                await room.removeOfflinePlayer(player);
            }
        }
    }

    /**
     * 申请奖池信息
     * @route: DeadBook.mainHandler.jackpotFund
     */
    async jackpotFund({ room }: { room: RoomStandAlone }) {
        return {
            code: 200,
            jackpotFund: room.jackpot,
            runningPool: room.runningPool,
            profit: room.profitPool
        };
    }

    /**
     * 博一博
     * @route: DeadBook.mainHandler.bo
     */
    async bo({ room, player, color, }: { room: RoomStandAlone, player: Player, color: ColorType }) {
        // 如果不是博一博状态
        if (player.gameState !== PlayerGameState.BO) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_3103) };
        }

        player.reduceBoTimes();

        console.warn('博一博1', player.gold, player.profit, player.boProfit);
        const result = await room.boLottery(player, color);
        player.setBoResult(result.card, result.totalWin);
        console.warn('博一博2', player.gold, player.profit, player.boProfit, result);

        // 结算
        if (result.totalWin === 0 || player.boTimes === 0 || result.totalWin >= 2500 * player.baseBet) {
            await room.settlement(player);
            player.setNormalState();
        }

        return {
            code: 200,
            profit: result.totalWin,
            card: result.card,
            roundId: player.roundId,
            gold: player.gold,
        };
    }

    /**
     * 收集
     * @route: DeadBook.mainHandler.done
     */
    async done({ room, player }: { room: RoomStandAlone, player: Player, }) {
        // 如果不是博一博状态
        if (player.gameState !== PlayerGameState.BO) {
            return { code: 500, error: getlanguage(player.language, Net_Message.id_3103) };
        }

        await room.settlement(player);
        player.setNormalState();

        return {
            code: 200,
            profit: player.profit,
            roundId: player.roundId,
            gold: player.gold,
        };
    }
}