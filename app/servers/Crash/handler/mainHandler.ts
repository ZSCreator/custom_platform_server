import { Application, FrontendSession } from 'pinus';
import { Room } from "../lib/room";
import Player from "../lib/player";
import { getlanguage, Net_Message } from '../../../services/common/langsrv';
import {MAX_ODDS} from "../lib/constants";

export default function (app: Application) {
    return new mainHandler(app);
};

export class mainHandler {

    constructor(private app: Application) {
        this.app = app;
    }

    /**
     * 第一次进入游戏
     * @return {Object} 房间信息以及玩家信息
     * @route Crash.mainHandler.load
     **/
    async load({ room, player }: { room: Room, player: Player }): Promise<object> {

        return {
            code: 200,
            state: room.processState.stateName,
            countdown: room.processState.getRemainingTime(),
            roundId: room.roundId,
            totalBet: player.getTotalBet(),
            lotteryHistory: room.getLotteryHistory(),
            gold: player.gold,
        };
    }

    /**
     * 下注
     * @return {Object}
     * @route Crash.mainHandler.bet
     **/
    async bet({ room, player, num }: { room: Room, player: Player, num: number }): Promise<object> {
        // 不是下注状态则不让他押注
        if (!room.isBetState()) {
            return { code: 500, msg: getlanguage(player.language, Net_Message.id_2011) };
        }

        if (!num || num < 0) {
            return { code: 500, msg: getlanguage(player.language, Net_Message.id_1214) };
        }

        // 检查金币是否满足条件
        if (player.isLackGold(num)) {
            return { code: 500, msg: getlanguage(player.language, Net_Message.id_1015) };
        }

        if (num < room.lowBet || num > room.capBet) {
            return { code: 500, msg: getlanguage(player.language, Net_Message.id_1104) };
        }


        room.playerBet(player, num);
        return { code: 200, gold: player.gold };
    }

    /**
     * 取走钱
     * @param room
     * @param player
     * @param num
     * @param session
     * @route Crash.mainHandler.cashOut
     */
    async cashOut({ room, player }: { room: Room, player: Player }, session: FrontendSession) {
        // 不是下注状态则不让他押注
        if (!room.isLotteryState()) {
            return { code: 500, msg: getlanguage(player.language, Net_Message.id_2011) };
        }

        // 是否又下注
        if (player.getTotalBet() <= 0) {
            return { code: 500, msg: getlanguage(player.language, Net_Message.id_1015) };
        }

        // 查看是否抢过了
        if (player.isTaken()) {
            return { code: 500, msg: getlanguage(player.language, Net_Message.id_1018) };
        }

        // 抢然后结算
        const odds = await room.takeMoney(player);

        return {
            code: 200,
            gold: player.gold,
            profit: player.getProfit(),
            odds
        }
    }

    /**
     * 设置止盈点
     * @param room
     * @param player
     * @param number
     * @param session
     * @route Crash.mainHandler.setTakeProfitPoint
     */
    async setTakeProfitPoint({ room, player, odds }: { room: Room, player: Player, odds: number }, session: FrontendSession) {
        // 设置止赢点
        if (!odds && typeof odds !== 'number') {
            return { code: 500, msg: getlanguage(player.language, Net_Message.id_1012) };
        }

        /**
         * 如果是开奖状态且有押注而且还没有抢都不可以新设置止盈点
         */
        if (room.isLotteryState() && player.getTotalBet() > 0 && !player.isTaken()) {
            return { code: 500, msg: getlanguage(player.language, Net_Message.id_1012) };
        }

        odds = Math.floor(odds * 100) / 100;
        if (odds < 0 || odds > MAX_ODDS) {
            return { code: 500, msg: getlanguage(player.language, Net_Message.id_1012) };
        }

        player.setTakeProfitPoint(odds);
        return {code: 200, takeProfitPoint: odds};
    }



    /**
     * 获取玩家列表
     * @return {Object} 玩家列表
     * @route Crash.mainHandler.getPlayers
     **/
    async getPlayers({ room }: { room: Room, player: Player }): Promise<object> {
        return { code: 200, players: room.getFrontDisplayPlayers() };
    }
}