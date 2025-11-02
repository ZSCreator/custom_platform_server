import { Application} from 'pinus';
import langsrv = require('../../../services/common/langsrv');
import RoomStandAlone from "../lib/Room";
import Player from "../lib/Player";
import { isHaveBet, PharaohLotteryResult } from "../lib/util/lotteryUtil";
import {getlanguage, Net_Message} from "../../../services/common/langsrv";
import {getLogger, Logger} from "pinus-logger";


/**
 * 下注参数
 * @property betOdd 押注配数
 * @property betNum 基础押注
 * @property room 房间
 * @property player 玩家
 */
interface BetParamOption {
    betOdd: number,
    betNum: number,
    room: RoomStandAlone,
    player: Player,
}


export default function (app: Application) {
    return new indianaHandler(app);
}

export class indianaHandler {
    logger: Logger

    constructor(private app: Application) {
        this.app = app;
        this.logger = getLogger('log', __filename);

    }

    /**
     * 请求已获得的铲子数
     * @route: pharaoh.indianaHandler.initGame
     */
    async initGame({ player }: { room: RoomStandAlone, player: Player }) {
        // player.setRoundId(room.getRoundId(player.uid));
        return {
            code: 200,
            shovelNum: player.detonatorCount,
            profit: player.profit,
            lv: player.gameLevel,
            gold: player.gold,
            littleGame: beforeFrontendLittleGameInfo(player),
            roundId: player.roundId
        };
    }

    /**
     * 开始游戏
     * @route: pharaoh.indianaHandler.start
     */
    async start({ betNum, betOdd, player, room }: BetParamOption) {
        // 如果玩家正在游戏则不进行判断
        if (player.isGameState()) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_3103)}
        }

        // 查看下注参数是否
        if (!isHaveBet(betNum, betOdd)) {
            return { code: 500, error: getlanguage(player.language, langsrv.Net_Message.id_4000) };
        }

        // 是否是在下游戏中 小游戏中无法下注
        if (player.isLittleGameState()) {
            return { code: 500, error: getlanguage(player.language, langsrv.Net_Message.id_3100) };
        }

        // 获取 游戏 房间 玩家 信息
        // let game = await GameManager.getOneGame(room.nid);

        // // 如果游戏未开放则返回
        // if (!game.opened) {
        //     return { code: 500, error: langsrv.getlanguage(player.language, langsrv.Net_Message.id_1055) };
        // }

        // 如果缺少金币
        if (player.isLackGold(betNum, betOdd)) {
            return { code: 500, error: getlanguage(player.language, langsrv.Net_Message.id_1015) };
        }

        player.changeGameState();

        try {
            // 初始化玩家
            player.init();

            // 下注
            player.bet(betNum, betOdd);

            // 累积房间内部调控池 盈利池 小游戏奖池
            room.addRunningPool(player.totalBet)
                .addProfitPool(player.totalBet);

            // 开奖
            const result: PharaohLotteryResult = await room.lottery(player);

            // 结算
            await room.settlement(player, result);

            return {
                code: 200,
                curProfit: player.profit,
                result,
                pass: player.gameLevel,
                isCanPass: player.isLittleGameState(),
                littleGame: beforeFrontendLittleGameInfo(player),
                gold: player.gold,
                shovelNum: player.detonatorCount,
                canOnlineAward: false,
                onlineAward: 0,
                roundId: player.roundId,

            };
        } catch (error) {
            this.logger.error(`pharaoh.indianaHandler.start: ${error.stack}`);
            return { code: 500, error: getlanguage(player.language, langsrv.Net_Message.id_1012) };
        } finally {
            player.changeLeisureState();
            await room.removeOfflinePlayer(player);
        }
    }

    /**
     * 小游戏点击
     * @route: pharaoh.indianaHandler.cast
     */
    async cast({ player, room }: { room: RoomStandAlone, player: Player }) {
        // 如果不是小游戏状态
        if (player.isSpinState()) {
            return { code: 500, error: getlanguage(player.language, langsrv.Net_Message.id_3101) };
        }

        // 投掷次数
        if (player.throwNum <= 0) {
            return { code: 500, error: getlanguage(player.language, langsrv.Net_Message.id_3102) };
        }

        try {

            // 小游戏开奖
            const result = await room.littleGameLottery(player);


            // 额外派发的奖类型
            let boxPrizeType = '',
                // 额外派发的奖金额
                prizeNum = 0;

            // 如果是投掷次数为零且没有通关 且奖池金额够 则派发安慰奖
            // if (player.throwCount === 0 &&
            //     player.currentPosition !== littleGameLayout[player.littleGameLevel].length &&
            //     room.jackpot > player.totalBet * 7.5 &&
            //     player.currentPosition > 13) {
            //
            //     // 如果第一关位置大于13 额外派发mega宝箱【铂金宝箱】
            //     if (player.littleGameLevel === 1 && player.currentPosition > 13) {
            //         boxPrizeType = platinum;
            //     } else if (player.littleGameLevel === 2 && player.currentPosition > 14) {
            //         // 如果是第二关位置大于14 额外派发monster宝箱 【钻石宝箱】
            //         boxPrizeType = diamond;
            //     } else if (player.littleGameLevel === 3 && player.currentPosition > 15) {
            //         // 如果是第三关位置大于15 额外派发king宝箱 【终极宝箱】
            //         boxPrizeType = king;
            //     } else {
            //         boxPrizeType = '';
            //     }
            //
            //     // 如果有中奖类型
            //     if (boxPrizeType.length > 0) {
            //         // 至少让他赢押注的7.5倍
            //         const baseWin = player.totalBet * 7.5;
            //
            //         // 奖池奖 (奖池 - 下注金额 * 7.5） * （玩家总押注 / 10) * 宝箱类型的比例（eg: 0.00001）
            //         const jackpotWin = (room.jackpot - baseWin) * (player.totalBet / 10) * littleGameBonusOdds[boxPrizeType];
            //
            //         // 安慰奖金额
            //         prizeNum = Math.floor(baseWin + jackpotWin);
            //     }
            // }

            return {
                code: 200,
                result: beforeFrontedLittleGameResult(result, player),
                curProfit: 0,
                gold: player.gold,
                collect: player.customsClearance,
                boxPrizeType,
                prizeNum,
                roundId: player.roundId,
                throwNum: player.throwNum
            };
        } catch (e) {
            this.logger.error(`pharaoh.indianaHandler.cast: ${e.stack}`);
            return {code: 500, error: getlanguage(player.language, langsrv.Net_Message.id_1012)}
        }
    }

    /**
     * 申请奖池信息
     * @route: pharaoh.indianaHandler.jackpotFund
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
     * 申请奖池信息
     * @route: pharaoh.indianaHandler.jackpotShow
     */
    async jackpotShow({ room }: { room: RoomStandAlone }) {
        return {
            code: 200,
            jackpotShow: room.jackpotShow,
        };
    }
}

/**
 * 前端需要的小游戏信息 兼容以前老的写法
 * @param player
 */
function beforeFrontendLittleGameInfo(player: Player) {

    return {
        activation: player.isLittleGameState(),     // 激活小游戏
        pass: player.gameLevel,                     // 关卡
        curPosition: player.currentPosition,        // 当前步数
        historyPosition: player.historyPosition,    // 历史位置
        gains: player.littleGameGainDetail,         // 收益详情
        restDice: player.throwNum,                  // 剩余投掷次数
        totalWin: player.littleGameWin,             // 盈利
        initMoney: player.littleGameAccumulate,     // 奖池金币
        initMoneyDis: [player.littleGameAccumulate, 0], // 奖池
        bonusMoney: player.totalBet,                // 押注
    }
}

/**
 * 小游戏前端结果
 * @param result
 * @param player
 */
function beforeFrontedLittleGameResult(result: any, player: Player) {
    return {
        point: player.throwCount,               // 投掷点数
        awardType: player.currentAwardType,     // 投掷的类型
        award: player.littleGameWin,            // 收益
        select: result.select,
        selectType: result.selectType,
    }
}
