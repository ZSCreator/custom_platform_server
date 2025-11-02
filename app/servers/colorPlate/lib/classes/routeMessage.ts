import { Room } from "../room";
import Player from "../player";
import { MsgRoute } from "../constants";

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
            displayPlayers: this.room.getDisplayPlayers(),
            playersNumber: this.room.players.length,
        });
    }

    /**
     * 开始下注状态
     */
    public startBetState() {
        this.room.channelIsPlayer(MsgRoute.START_BET_STATE, {
            roundId: this.room.roundId,
            countdown: this.room.processState.countdown,
        });

        this.room.roomManager.pushRoomStateMessage(this.room.roomId, {
            nid: this.room.nid,
            sceneId: this.room.sceneId,
            roomId: this.room.roomId,
            countDown: this.room.processState.countdown,
            state: this.room.processState.stateName,
            history: this.room.getLotteryHistory(true)
        })
    }

    /**
     * 开始开奖状态
     */
    public startLotteryState() {
        this.room.channelIsPlayer(MsgRoute.START_LOTTERY_STATE, {
            result: this.room.getResult(),
            countdown: this.room.processState.countdown,
        });

        this.room.roomManager.pushRoomStateMessage(this.room.roomId, {
            nid: this.room.nid,
            sceneId: this.room.sceneId,
            roomId: this.room.roomId,
            countDown: this.room.processState.countdown,
            state: this.room.processState.stateName,
            history: this.room.getLotteryHistory(true)
        })
    }

    /**
     * 开始结算状态
     */
    public startSettlementState() {
        this.room.channelIsPlayer(MsgRoute.START_SETTLEMENT_STATE, {
            countdown: this.room.processState.countdown,
            winAreas: this.room.getWinAreas(),
            gamePlayers: this.room.getGamePlayerSettlementResult(),
        });

        this.room.roomManager.pushRoomStateMessage(this.room.roomId, {
            nid: this.room.nid,
            sceneId: this.room.sceneId,
            roomId: this.room.roomId,
            countDown: this.room.processState.countdown,
            state: this.room.processState.stateName,
            history: this.room.getLotteryHistory(true)
        })
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
            displayPlayers: this.room.getDisplayPlayers()
        });
    }
}