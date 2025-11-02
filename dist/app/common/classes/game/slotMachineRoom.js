"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SystemRoom_1 = require("../../pojo/entity/SystemRoom");
const Game_manager_1 = require("../../dao/daoManager/Game.manager");
const regulation = require("../../../domain/games/regulation");
const pinus_1 = require("pinus");
const utils_1 = require("../../../utils/utils");
class BaseSlotMachineRoom extends SystemRoom_1.SystemRoom {
    constructor(opts) {
        super(opts);
        this._players = new Map();
    }
    async saveRoomPool() {
    }
    runJackpotTimer() {
        this.runningPool = Math.floor(100000000 + (Math.floor(Math.random() * 100000000)));
        this.jackpotTimer = setInterval(() => {
            this.runningPool += Math.floor(Math.floor(Math.random() * 1000));
            const randomNum = Math.random();
            if (randomNum < 0.0002) {
                this.runningPool -= Math.floor(Math.floor(Math.random() * 1000000));
            }
        }, 3 * 1000);
    }
    async isGameOpen() {
        const game = await Game_manager_1.default.findOne({ nid: this.nid });
        return game.opened;
    }
    addRunningPool(num) {
        this.runningPool += Math.floor(num * regulation.intoJackpot.runningPool);
        return this;
    }
    deductRunningPool(num) {
        this.runningPool -= num;
        return this;
    }
    deductJackpot(num) {
        this.jackpot -= num;
        return this;
    }
    addProfitPool(num) {
        this.profitPool += num * regulation.intoJackpot.profitPool;
        return this;
    }
    getPlayer(uid) {
        return this._players.get(uid);
    }
    getPlayers() {
        return [...this._players.values()];
    }
    removePlayer(currPlayer) {
        this._players.delete(currPlayer.uid);
        if (!!this.channel) {
            this.kickOutMessage(currPlayer.uid);
        }
    }
    async removeOfflinePlayer(player) {
        if (!player.onLine) {
            this._players.delete(player.uid);
            await this.kickingPlayer(pinus_1.pinus.app.getServerId(), [player]);
        }
    }
    getRoundId(uid) {
        return (0, utils_1.genRoundId)(this.nid, this.roomId, uid);
    }
}
exports.default = BaseSlotMachineRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xvdE1hY2hpbmVSb29tLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9jbGFzc2VzL2dhbWUvc2xvdE1hY2hpbmVSb29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsNkRBQTBEO0FBQzFELG9FQUErRDtBQUMvRCwrREFBZ0U7QUFDaEUsaUNBQThCO0FBRTlCLGdEQUFrRDtBQVVsRCxNQUE4QixtQkFBMEMsU0FBUSx1QkFBYTtJQU96RixZQUFzQixJQUFTO1FBQzNCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQVBoQixhQUFRLEdBQW1CLElBQUksR0FBRyxFQUFFLENBQUM7SUFRckMsQ0FBQztJQTJCRCxLQUFLLENBQUMsWUFBWTtJQVFsQixDQUFDO0lBS0QsZUFBZTtRQUNYLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkYsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFO1lBQ2pDLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBRWpFLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUVoQyxJQUFJLFNBQVMsR0FBRyxNQUFNLEVBQUU7Z0JBQ3BCLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQ3ZFO1FBQ0wsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNqQixDQUFDO0lBS0QsS0FBSyxDQUFDLFVBQVU7UUFDWixNQUFNLElBQUksR0FBRyxNQUFNLHNCQUFjLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQzdELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBTUQsY0FBYyxDQUFDLEdBQVc7UUFDdEIsSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxVQUFVLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3pFLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFNRCxpQkFBaUIsQ0FBQyxHQUFHO1FBQ2pCLElBQUksQ0FBQyxXQUFXLElBQUksR0FBRyxDQUFDO1FBQ3hCLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFNRCxhQUFhLENBQUMsR0FBRztRQUNiLElBQUksQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDO1FBQ3BCLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFNRCxhQUFhLENBQUMsR0FBVztRQUNyQixJQUFJLENBQUMsVUFBVSxJQUFJLEdBQUcsR0FBRyxVQUFVLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQztRQUMzRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBS0QsU0FBUyxDQUFDLEdBQVc7UUFDakIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBS0QsVUFBVTtRQUNOLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBTUQsWUFBWSxDQUFDLFVBQWE7UUFDdEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXJDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDaEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBT0QsS0FBSyxDQUFDLG1CQUFtQixDQUFDLE1BQVM7UUFFL0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDaEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztTQUMvRDtJQUNMLENBQUM7SUFNRCxVQUFVLENBQUMsR0FBVztRQUNsQixPQUFPLElBQUEsa0JBQVUsRUFBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDbEQsQ0FBQztDQUNKO0FBeEpELHNDQXdKQyJ9