import {Room} from "../room";
import Player from "../player";
import {MsgRoute, RoomState} from "../constants";
import {pushMessageByUids} from "../../../../services/MessageService";

/**
 * 房间消息路由类
 * @param room  房间类(由于这一个类只用于收发消息，不用做数据的改变，所以我们开始就绑定)
 */
export default class RouteMessage {
    private readonly room: Room;

    constructor(room: Room) {
        this.room = room;
    }

    /**
     * 玩家列表发生变化 当玩家进入或者退出时调用
     */
    playersChange() {
        this.room.channelIsPlayer(MsgRoute.PLAYERS_CHANGE, {
            players: this.room.getFrontDisplayPlayers(),
        });
    }

    /**
     * 踢出玩家通知
     */
    playersGoOut(player: Player) {
        const member = this.room.channel.getMember(player.uid);

        if (member) {
            pushMessageByUids(MsgRoute.GO_OUT, {}, member);
        }
    }

    /**
     * 开始发牌状态
     */
    public startDealState() {
        this.room.channelIsPlayer(MsgRoute.START_DEAL_STATE, {
            countdown: this.room.processState.countdown,
            systemCard: this.room.getSystemCard(),
            roundId: this.room.roundId,
        });
    }

    /**
     * 开始下注状态
     */
    public startBetState() {
        this.room.channelIsPlayer(MsgRoute.START_BET_STATE, {
            countdown: this.room.processState.countdown,
        });
    }

    /**
     * 开始再次下注状态
     */
    public startSecondBetState() {
        this.room.channelIsPlayer(MsgRoute.START_SECOND_BET_STATE, {
            countdown: this.room.processState.countdown,
            systemCard: this.room.getSystemCard(),
        });
    }

    /**
     * 开始开奖状态
     */
    public startLotteryState(nextState: RoomState) {
        this.room.channelIsPlayer(MsgRoute.START_LOTTERY_STATE, {
            result: this.room.getResult(),
            countdown: this.room.processState.countdown,
            nextState,
        });
    }

    /**
     * 开始再次开奖状态
     */
    public startSecondLotteryState() {
        this.room.channelIsPlayer(MsgRoute.START_SECOND_LOTTERY_STATE, {
            result: this.room.getResult(),
            countdown: this.room.processState.countdown,
            players: this.room.getFrontDisplayPlayers(),
        });
    }

    /**
     * 开始结算状态
     */
    public startSettlementState() {
        this.room.channelIsPlayer(MsgRoute.START_SETTLEMENT_STATE, {
            countdown: this.room.processState.countdown,
            winAreas: this.room.getWinArea(),
            gamePlayers: this.room.getGamePlayerSettlementResult(),
        });
    }

    /**
     * 同时有玩家下注
     * @param player 下注玩家
     * @param bets 押注数据
     */
    public playerBet(player: Player, bets) {
        this.room.channelIsPlayer( MsgRoute.PLAYER_BET, {
            uid: player.uid,
            bets,
        });
    }

    /**
     * 玩家跳过第二轮下注
     * @param player 下注玩家
     */
    public playerSkip(player: Player) {
        this.room.channelIsPlayer( MsgRoute.PLAYER_SKIP, {
            uid: player.uid,
        });
    }
}