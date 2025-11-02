import { Application, FrontendSession } from 'pinus';
import {Room} from "../lib/room";
import Player from "../lib/player";
import {BetAreasName} from '../lib/config/betAreas';
import {sum} from "../../../utils";
import {getlanguage, Net_Message} from '../../../services/common/langsrv';



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
     * @route andarBahar.mainHandler.load
     **/
    async load({ room, player }: {room: Room, player: Player}, session: FrontendSession): Promise<object> {


        return {
            code: 200,
            state: room.processState.stateName,
            countdown: room.processState.getRemainingTime(),
            playerBetsDetail: player.getBetsDetail(),
            players: room.getFrontDisplayPlayers(),
            result: room.getResult(),
            systemCard: room.getSystemCard(),
            lowBet: room.lowBet,
            capBet: room.capBet,
            roundId: room.roundId,
        };
    }

    /**
     * 下注
     * @return {Object}
     * @route andarBahar.mainHandler.bet
     **/
    async bet({ room, player, bets }: {room: Room, player: Player, bets: {[key in BetAreasName]: number}}, session: FrontendSession): Promise<object> {
        // 不是下注状态则不让他押注
        if (!room.isBetState()) {
            return {code: 500, message: getlanguage(player.language, Net_Message.id_2011)};
        }

        // 检查玩家押注状态玩家能否押注
        if (room.checkBettingState(player)) {
           return {code: 500, message: getlanguage(player.language, Net_Message.id_1011)};
        }

        if (!bets) {
            return {code: 500, message: getlanguage(player.language, Net_Message.id_1214)};
        }

        // 检查押注区域
        if (!room.checkBetAreas(player, bets)) {
            return {code: 500, message: getlanguage(player.language, Net_Message.id_1738)};
        }

        // 检查金币是否满足条件
        if (player.isLackGold(sum(bets))) {
            return {code: 500, message: getlanguage(player.language, Net_Message.id_1015)};
        }


        // 玩家押注
        room.playerBet(player, bets);

        // 如果条件符合 改变房间押注状态
        room.changeBettingState();

        return {code: 200, gold: player.gold};
    }

    /**
     * 续押
     * @return {Object}
     * @route andarBahar.mainHandler.renew
     **/
    async renew({ room, player }: {room: Room, player: Player, bets: {[key in BetAreasName]: number}}, session: FrontendSession): Promise<object> {
        // 如果上一局未押注
        if (!player.isLastBet()) {
            return {code: 500, message: getlanguage(player.language, Net_Message.id_2022)};
        }

        // 检查金币是否满足条件
        if (player.isLackGold(sum(player.getLastBets()))) {
            return {code: 500, message: getlanguage(player.language, Net_Message.id_1015)};
        }

        // 检查是否超限
        if (room.checkBets(player.getLastBets() as {[areaName in BetAreasName]: number})) {
            return {code: 500, message: getlanguage(player.language, Net_Message.id_1013)};
        }


        room.playerBet(player, player.getLastBets() as {[areaName in BetAreasName]: number});

        return {code: 200, gold: player.gold};
    }


    /**
     * 跳过第二次下注
     * @return {Object}
     * @route andarBahar.mainHandler.skip
     **/
    async skip({ room, player }: {room: Room, player: Player, }, session: FrontendSession): Promise<object> {
        // 不是再次下注状态或者没有押注则无法撤销
        if (!room.isSecondBetState() || !player.isBet()) {
            return {code: 500, message: getlanguage(player.language, Net_Message.id_1216)};
        }

        room.skip(player);
        return {code: 200, gold: player.gold};
    }

    /**
     * 获取玩家列表
     * @return {Object} 玩家列表
     * @route andarBahar.mainHandler.getPlayers
     **/
    async getPlayers({ room, player }: {room: Room, player: Player}, session: FrontendSession): Promise<object> {
        return {code: 200, players: room.getFrontDisplayPlayers()};
    }
}