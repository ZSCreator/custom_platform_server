import {Application, FrontendSession, pinus} from 'pinus';
import {getLogger, Logger} from 'pinus-logger';
import {isNullOrUndefined} from "../../../utils/lottery/commonUtil";
import {SlotResult} from "../lib/util/lotteryUtil";
import RoomStandAlone from "../lib/Room";
import Player from "../lib/Player";
import {getlanguage, Net_Message} from "../../../services/common/langsrv";
import {ElementsEnum} from "../lib/config/elemenets";
import regulation = require('../../../domain/games/regulation');
import {random} from "../../../utils";
import {ClayPotGameElementType} from "../lib/constant";

/**
 * 下注参数
 * @property bet 基础押注
 * @property room 房间
 * @property player 玩家
 */
interface BetParamOption {
    bet: number,
    room: RoomStandAlone,
    player: Player,
}

/**
 * 果园小游戏
 * @property index 下标
 * @property room 房间
 * @property player 玩家
 */
interface OrchardGameParamOption {
    index: number,
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
     * @route halloween.mainHandler.load
     */
    async load({player, room}: { player: Player, room: RoomStandAlone }, session: FrontendSession) {
        // player.setRoundId(room.getRoundId(player.uid));
        return {
            code: 200,
            gold: player.gold,
            roundId: player.roundId,
            subGameType: player.subGameType,
            prizePool: room.getPrizePool(),
        };
    }

    /**
     * 开始游戏
     * @param bet 基础押注
     * @param room 房间
     * @param player 房间内玩家
     * @param session
     * @route halloween.mainHandler.start
     */
    async start({bet, room, player}: BetParamOption, session: FrontendSession) {
        // 如果玩家正在游戏则不进行判断
        if (player.isGameState()) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_3103)};
        }

        // 如果游戏不开放
        if (!(await room.isGameOpen())) {
            // let offLineArr = [{ nid: room.nid, sceneId: room.sceneId, roomId: room.roomId, uid: player.uid }];
            await room.kickingPlayer(pinus.app.getServerId(), [player]);
            return {code: 500, error: getlanguage(player.language, Net_Message.id_1055)};
        }

        if (!!player.subGameType) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_3100)};
        }

        // 判断传入参数是否合理
        if (isNullOrUndefined(bet)) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_4000)};
        }


        // 改变玩家状态
        player.changeGameState();

        try {
            // 如果押注不合理
            if (typeof bet !== 'number' || bet <= 0) {
                return {code: 500, error: getlanguage(player.language, Net_Message.id_4000)};
            }

            bet *= 100;

            // 如果缺少金币
            if (player.isLackGold(bet)) {
                return {code: 500, error: getlanguage(player.language, Net_Message.id_1015)};
            }

            // console.warn('金币1', player.gold)



            // 初始化玩家
            player.init();

            // 押注
            player.bet(bet);

            // 添加调控池以及盈利池
            const fakeNum = Math.floor(player.totalBet * random(2, 5) * random(50, 100) / 100);
            room.addRunningPool(fakeNum).addProfitPool(player.totalBet);

            // 开奖
            const result: SlotResult = await room.lottery(player);

            // 结算
            await room.settlement(player, result);

            // console.warn('金币3', player.gold)

            // 给离线玩家发送邮件且删除玩家
            room.sendMailAndRemoveOfflinePlayer(player);


            // 返回参数
            return {
                code: 200,
                window: result.window,
                totalWin: player.profit,
                winLines: result.winLines,
                winRows: result.winRows,
                gold: player.gold,
                roundId: player.roundId,
                subGameType: player.subGameType,
                prizePool: room.getPrizePool(),
            };
        } catch (e) {
            // 由于出现过一次未找到模块参数的情况，加入一个regulation.intoJackpot以便排查
            this.logger.error(`玩家${player.uid}的游戏spin出错:halloween-start: ${e} \n 奖池比例: ${regulation.intoJackpot}`);

            return {code: 500, error: getlanguage(player.language, Net_Message.id_1012)};
        } finally {
            // 不管结果如何都变为休闲状态
            player.changeLeisureState();
            await room.removeOfflinePlayer(player);
        }
    }

    /**
     * 点击陶罐小游戏
     * @param room
     * @param player
     * @param session
     * @route halloween.mainHandler.clayPotGame
     */
    async clayPotGame({room, player}: BetParamOption, session: FrontendSession) {
        // 如果玩家正在游戏则不进行判断
        if (player.isGameState()) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_3103)};
        }

        // 如果不等于陶罐小游戏则不允许点击
        if (player.subGameType !== ElementsEnum.ClayPot) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_3101)};
        }

        const result = room.clayPotLottery();
        await room.clayPotSettlement(player, result);

        return {
            code: 200,
            result,
            profit: result === ClayPotGameElementType.Bonus ? 0 : player.profit,
            gold: player.gold,
        }
    }

    /**
     * 点击骰子小游戏
     * @param room
     * @param player
     * @param session
     * @route halloween.mainHandler.diceGame
     */
    async diceGame({room, player}: BetParamOption, session: FrontendSession) {
        // 如果玩家正在游戏则不进行判断
        if (player.isGameState()) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_3103)};
        }

        // 如果不等于陶罐小游戏则不允许点击
        if (player.subGameType !== ElementsEnum.Vampire) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_3101)};
        }

        const result = room.diceGameLottery();
        await room.diceSettlement(player, result);

        return {
            code: 200,
            result,
            profit: player.profit,
            gold: player.gold,
        }
    }

    /**
     * 转盘小游戏
     * @param room
     * @param player
     * @param session
     * @route halloween.mainHandler.turntableGame
     */
    async turntableGame({room, player}: BetParamOption, session: FrontendSession) {
        // 如果玩家正在游戏则不进行判断
        if (player.isGameState()) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_3103)};
        }

        // 如果不等于陶罐小游戏则不允许点击
        if (player.subGameType !== ElementsEnum.Wizard) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_3101)};
        }

        const result = room.turntableGameLottery();
        await room.turntableSettlement(player, result);

        return {
            code: 200,
            result,
            profit: player.profit,
            gold: player.gold,
        }
    }

    /**
     * 果园小游戏
     * @param room
     * @param player
     * @param index 下标
     * @param session
     * @route halloween.mainHandler.orchardGame
     */
    async orchardGame({room, player, index}: OrchardGameParamOption, session: FrontendSession) {
        // 如果玩家正在游戏则不进行判断
        if (player.isGameState()) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_3103)};
        }

        // 如果不等于国园小游戏则不允许点击
        if (player.subGameType !== ElementsEnum.Witch) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_3101)};
        }

        const element = player.orchardGameWindow[index];

        if (element === undefined) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_1704)};
        }

        if (element.open) {
            return {code: 500, error: getlanguage(player.language, Net_Message.id_1704)};
        }

        const result = element.type;
        player.orchardGameOpen(index);
        await room.orchardSettlement(player, result);

        return {
            code: 200,
            result,
            profit: player.profit,
            totalProfit: player.orchardProfit,
            gold: player.gold,
        }
    }

    /**
     * 获取奖池
     * @param room
     * @param player
     * @param session
     * @route halloween.mainHandler.jackpot
     */
    async jackpot({room, player}: OrchardGameParamOption, session: FrontendSession) {
        return {
            code: 200,
            runningPool: room.runningPool,
        }
    }
}