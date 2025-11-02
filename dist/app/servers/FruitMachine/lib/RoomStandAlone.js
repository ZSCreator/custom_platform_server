"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Player_1 = require("./Player");
const utils = require("../../../utils/index");
const control_1 = require("./control");
const Game_manager_1 = require("../../../common/dao/daoManager/Game.manager");
const slotMachineRoom_1 = require("../../../common/classes/game/slotMachineRoom");
const MessageService_1 = require("../../../services/MessageService");
class RoomStandAlone extends slotMachineRoom_1.default {
    constructor(opts) {
        super(opts);
        this.gameName = '水果机';
        this._players = new Map();
        this.control = control_1.Control.geInstance(this.sceneId);
        this.betLimit = opts.betLimit || 0;
        this.roomCapacity = opts.roomCapacity;
    }
    init() {
    }
    async isGameOpen() {
        const game = await Game_manager_1.default.findOne({ nid: this.nid });
        return game.opened;
    }
    getPlayer(uid) {
        return this._players.get(uid);
    }
    isFull() {
        return this._players.size >= this.roomCapacity;
    }
    addPlayerInRoom(player) {
        this._players.set(player.uid, new Player_1.default(player));
        return true;
    }
    removePlayer(currPlayer) {
        this._players.delete(currPlayer.uid);
    }
    getPlayers() {
        return [...this._players.values()];
    }
    checkLimit(player, bets) {
        return player.totalBet + utils.sum(bets) > this.betLimit;
    }
    async lottery(player) {
        return this.control.result(player);
    }
    async settlement(player, totalProfit, bigOdds, lotteryResult, details) {
        player.setRoundId(this.getRoundId(player.uid));
        await player.addGold(totalProfit, bigOdds, lotteryResult, details, this);
        if (totalProfit / player.totalBet > 20 && totalProfit >= 100000) {
            (0, MessageService_1.sendBigWinNotice)(this.nid, player.nickname, totalProfit, player.isRobot, player.headurl);
        }
        player.init();
    }
}
exports.default = RoomStandAlone;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUm9vbVN0YW5kQWxvbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9GcnVpdE1hY2hpbmUvbGliL1Jvb21TdGFuZEFsb25lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscUNBQThCO0FBQzlCLDhDQUErQztBQUMvQyx1Q0FBb0M7QUFDcEMsOEVBQXlFO0FBQ3pFLGtGQUErRTtBQUMvRSxxRUFBa0U7QUFRbEUsTUFBcUIsY0FBZSxTQUFRLHlCQUEyQjtJQU9uRSxZQUFZLElBQVM7UUFDakIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBUGhCLGFBQVEsR0FBRyxLQUFLLENBQUE7UUFDaEIsYUFBUSxHQUF3QixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBT3RDLElBQUksQ0FBQyxPQUFPLEdBQUcsaUJBQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRWhELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUM7UUFFbkMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQzFDLENBQUM7SUFJRCxJQUFJO0lBQ0osQ0FBQztJQUtELEtBQUssQ0FBQyxVQUFVO1FBQ1osTUFBTSxJQUFJLEdBQUcsTUFBTSxzQkFBYyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUM3RCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDdkIsQ0FBQztJQUVELFNBQVMsQ0FBQyxHQUFXO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUtELE1BQU07UUFDRixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDbkQsQ0FBQztJQU1ELGVBQWUsQ0FBQyxNQUFXO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsSUFBSSxnQkFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDbEQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQU1ELFlBQVksQ0FBQyxVQUFlO1FBQ3hCLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBS0QsVUFBVTtRQUNOLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBUUQsVUFBVSxDQUFDLE1BQWMsRUFBRSxJQUFnQztRQUN2RCxPQUFPLE1BQU0sQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQzdELENBQUM7SUFHRCxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQWM7UUFDeEIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBVUQsS0FBSyxDQUFDLFVBQVUsQ0FDWixNQUFjLEVBQ2QsV0FBbUIsRUFDbkIsT0FBZSxFQUNmLGFBQWtCLEVBQ2xCLE9BQVk7UUFHWixNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDL0MsTUFBTSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUd6RSxJQUFJLFdBQVcsR0FBRyxNQUFNLENBQUMsUUFBUSxHQUFHLEVBQUUsSUFBSSxXQUFXLElBQUksTUFBTSxFQUFFO1lBQzdELElBQUEsaUNBQWdCLEVBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUM1RjtRQUVELE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNsQixDQUFDO0NBQ0o7QUF6R0QsaUNBeUdDIn0=