"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const DicePlayer_1 = require("./DicePlayer");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const constants_1 = require("../../../services/newControl/constants");
const DiceRoomMgr_1 = require("./DiceRoomMgr");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const MessageService = require("../../../services/MessageService");
const utils = require("../../../utils/index");
const Dice_logic = require("./Dice_logic");
const control_1 = require("./control");
const WAIT_TIME = 3000;
const AUTO_TIME = 90;
const CC_DEBUG = true;
class landRoom extends SystemRoom_1.SystemRoom {
    constructor(opts) {
        super(opts);
        this.maxRound = 14;
        this.roundTimes = 1;
        this.status = 'INWAIT';
        this.lastWaitTime = 0;
        this.lastFahuaTime = 0;
        this.auto_delay = AUTO_TIME;
        this.record_history = { banker_uid: "", oper: [], info: [] };
        this.waitTimeout = null;
        this.players = new Array(2).fill(null);
        this.startGameTime = 0;
        this.zipResult = '';
        this.banker = null;
        this.curr_DiceList = [];
        this.save_DiceList = [];
        this.controlNum = 0;
        this.entryCond = opts.entryCond || 0;
        this.lowBet = opts.lowBet || 50;
        this.Initialization();
        this.control = new control_1.default({ room: this });
    }
    Initialization() {
        this.roundTimes = 1;
        this.lastFahuaTime = 0;
        this.record_history = { banker_uid: "", oper: [], info: [] };
        this.startGameTime = 0;
        this.setSice = [];
        this.banker = null;
        this.battle_kickNoOnline();
        this.status = "INWAIT";
        this.controlNum = 0;
        this.updateRoundId();
    }
    close() {
        this.sendRoomCloseMessage();
    }
    addPlayerInRoom(dbplayer) {
        const playerInfo = this.getPlayer(dbplayer.uid);
        if (playerInfo) {
            playerInfo.sid = dbplayer.sid;
            this.offLineRecover(playerInfo);
            return true;
        }
        if (this.isFull())
            return false;
        const indexArr = [];
        this.players.forEach((m, i) => !m && indexArr.push(i));
        const i = indexArr[utils.random(0, indexArr.length - 1)];
        this.players[i] = new DicePlayer_1.default(i, dbplayer);
        this.channelIsPlayer("Dice.addpl", this.players[i].strip());
        return true;
    }
    async offLineRecover(playerInfo) {
        playerInfo.onLine = true;
        this.addMessage(playerInfo);
    }
    leave(playerInfo, isOffLine) {
        this.kickOutMessage(playerInfo.uid);
        if (isOffLine) {
            playerInfo.onLine = false;
            return;
        }
        this.players[playerInfo.seat] = null;
        const opts = { uid: playerInfo.uid, seat: playerInfo.seat };
        this.channelIsPlayer('Dice.onExit', opts);
        DiceRoomMgr_1.default.removePlayerSeat(playerInfo.uid);
    }
    getWaitTime() {
        return this.countdown;
    }
    wait(playerInfo) {
        if (this.status != "INWAIT")
            return;
        if (this.players.filter(pl => pl && pl.status == 'WAIT').length <= 1) {
            this.channelIsPlayer('Dice.onWait', { waitTime: 0 });
            return;
        }
        if (Date.now() - this.lastWaitTime < WAIT_TIME) {
            const member = playerInfo && this.channel.getMember(playerInfo.uid);
            if (member) {
                let waitTime = Math.max(WAIT_TIME - (Date.now() - this.lastWaitTime), 0);
                MessageService.pushMessageByUids(`Dice.onWait`, { waitTime }, member);
            }
            return;
        }
        this.channelIsPlayer('Dice.onWait', { waitTime: WAIT_TIME });
        this.lastWaitTime = Date.now();
        clearTimeout(this.waitTimeout);
        this.waitTimeout = setTimeout(() => {
            const list = this.players.filter(pl => !!pl);
            if (list.length == 2) {
                this.handler_start();
            }
            else {
                this.channelIsPlayer('Dice.onWait', { waitTime: 0 });
            }
        }, WAIT_TIME);
    }
    handler_start() {
        this.startGameTime = Date.now();
        this.status = "startNextHand";
        console.warn(this.nid, this.roomId, this.roundId, this.status);
        this.lastFahuaTime = Date.now();
        clearTimeout(this.waitTimeout);
        this.record_history = { banker_uid: "", oper: [], info: [] };
        this.players.forEach(pl => pl && (pl.initGame()));
        this.banker = null;
        this.setSice = Dice_logic.GetTwoDice();
        if (this.setSice[0] > this.setSice[1]) {
            this.banker = this.players[0];
        }
        else {
            this.banker = this.players[1];
        }
        let opts = {
            plys: this.players.map(pl => pl && pl.strip()),
            roundTimes: this.roundTimes,
            roundId: this.roundId,
            setSice: this.setSice,
            banker: this.banker.uid,
        };
        this.channelIsPlayer("Dice.startNextHand", opts);
        this.countdown = 6;
        let Oper_timeout = setInterval(() => {
            this.countdown -= 1;
            if (this.countdown <= 0) {
                this.status = "INGAME";
                CC_DEBUG && console.warn(this.roundId, this.roomId, "startNextHand", utils.cDate());
                clearInterval(Oper_timeout);
                this.Oper_timeout = null;
                this.set_next_doing_seat(this.banker.seat);
            }
        }, 1000);
    }
    set_next_doing_seat(doing) {
        const playerInfo = this.players[doing];
        playerInfo.state = "PS_OPER";
        this.curr_doing_seat = doing;
        playerInfo.Number_draws = 3;
        this.curr_DiceList = [0, 0, 0, 0, 0];
        this.save_DiceList = [0, 0, 0, 0, 0];
        this.lastFahuaTime = Date.now();
        let opts = {
            curr_doing_seat: doing,
            uid: playerInfo.uid,
            auto_time: this.auto_delay
        };
        this.channelIsPlayer("Dice.onFahua", opts);
        if (this.banker.seat != playerInfo.seat) {
            this.roundTimes++;
        }
        this.handler_pass();
    }
    handler_pass() {
        clearTimeout(this.Oper_timeout);
        this.countdown = this.auto_delay;
        this.Oper_timeout = setInterval(() => {
            this.countdown -= 1;
            if (this.countdown <= 0) {
                this.players[this.curr_doing_seat].status = "FOLD";
                this.checkHasNextPlayer();
            }
        }, 1000);
    }
    async handler_complete() {
        console.warn(this.nid, this.roomId, "handler_complete");
        this.curr_doing_seat = -1;
        clearTimeout(this.Oper_timeout);
        this.countdown = 10;
        if (this.players.some(c => c.status == "FOLD")) {
            for (const pl of this.players) {
                if (pl.status == "FOLD") {
                    pl.profit = -this.lowBet;
                }
                else {
                    pl.profit = this.lowBet;
                }
            }
        }
        else {
            if (this.players[0].totalPoint > this.players[1].totalPoint) {
                this.players[0].profit = this.lowBet;
                this.players[1].profit = -this.lowBet;
            }
            else {
                this.players[1].profit = this.lowBet;
                this.players[0].profit = -this.lowBet;
            }
        }
        for (const pl of this.players) {
            pl && await pl.updateGold(this);
        }
        this.record_history.banker_uid = this.banker.uid;
        this.record_history.info = this.players.map(c => {
            if (c) {
                return {
                    uid: c.uid,
                    seat: c.seat,
                    profit: c.profit,
                };
            }
        });
        for (const pl of this.players) {
            pl && await pl.only_update_game(this);
        }
        const opts = {
            players: this.players.map(pl => {
                if (pl)
                    return {
                        uid: pl.uid,
                        seat: pl.seat,
                        nickname: pl.nickname,
                        headurl: pl.headurl,
                        totalPoint: pl.totalPoint,
                        profit: pl.profit,
                        gold: pl.gold
                    };
            }),
        };
        this.channelIsPlayer("Dice.sendResult", opts);
        this.Initialization();
    }
    checkHasNextPlayer() {
        let doing = this.nextFahuaIdx();
        if (this.roundTimes >= this.maxRound || this.players.some(c => c.status == "FOLD")) {
            return this.handler_complete();
        }
        else {
            this.set_next_doing_seat(doing);
        }
    }
    nextFahuaIdx() {
        if (this.curr_doing_seat == 0) {
            return 1;
        }
        return 0;
    }
    battle_kickNoOnline() {
        const offLinePlayers = [];
        for (const pl of this.players) {
            if (!pl)
                continue;
            if (!pl.onLine)
                DiceRoomMgr_1.default.removePlayer(pl);
            offLinePlayers.push(pl);
            this.kickOutMessage(pl.uid);
            DiceRoomMgr_1.default.removePlayerSeat(pl.uid);
            this.players[pl.seat] = null;
        }
        this.kickingPlayer(pinus_1.pinus.app.getServerId(), offLinePlayers);
    }
    personalControl(controlPlayers) {
        controlPlayers.forEach(p => this.getPlayer(p.uid).setControlType(constants_1.ControlKinds.PERSONAL));
        this.controlNum = controlPlayers[0].probability;
    }
    sceneControl(sceneWeights, isPlatformControl) {
        const realPlayer = this.players.find(p => p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER);
        const controlType = isPlatformControl ? constants_1.ControlKinds.PLATFORM : constants_1.ControlKinds.SCENE;
        realPlayer.setControlType(controlType);
        this.controlNum = sceneWeights;
    }
}
exports.default = landRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGljZVJvb20uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9EaWNlUG9rZXIvbGliL0RpY2VSb29tLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQThCO0FBQzlCLDZDQUFzQztBQUN0Qyx1RUFBb0U7QUFFcEUsc0VBQXNFO0FBQ3RFLCtDQUF3QztBQUN4Qyx1RUFBb0U7QUFDcEUsbUVBQW9FO0FBQ3BFLDhDQUErQztBQUMvQywyQ0FBNEM7QUFDNUMsdUNBQWdDO0FBR2hDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQztBQUV2QixNQUFNLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDckIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBTXRCLE1BQXFCLFFBQVMsU0FBUSx1QkFBc0I7SUEwQ3hELFlBQVksSUFBUztRQUNqQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUF0Q2hCLGFBQVEsR0FBRyxFQUFFLENBQUM7UUFFZCxlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBRXZCLFdBQU0sR0FBbUQsUUFBUSxDQUFDO1FBRWxFLGlCQUFZLEdBQVcsQ0FBQyxDQUFDO1FBRXpCLGtCQUFhLEdBQVcsQ0FBQyxDQUFDO1FBRTFCLGVBQVUsR0FBRyxTQUFTLENBQUM7UUFFdkIsbUJBQWMsR0FBRyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFFeEQsZ0JBQVcsR0FBaUIsSUFBSSxDQUFDO1FBR2pDLFlBQU8sR0FBaUIsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBR2hELGtCQUFhLEdBQVcsQ0FBQyxDQUFDO1FBRTFCLGNBQVMsR0FBVyxFQUFFLENBQUM7UUFHdkIsV0FBTSxHQUFlLElBQUksQ0FBQztRQUkxQixrQkFBYSxHQUFhLEVBQUUsQ0FBQztRQUU3QixrQkFBYSxHQUFhLEVBQUUsQ0FBQztRQUc3QixlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBS25CLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUM7UUFDckMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQztRQUNoQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDdEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUQsY0FBYztRQUNWLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxjQUFjLEdBQUcsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDO1FBQzdELElBQUksQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2xCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ25CLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQzNCLElBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBQ0QsS0FBSztRQUNELElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFFRCxlQUFlLENBQUMsUUFBUTtRQUNwQixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVoRCxJQUFJLFVBQVUsRUFBRTtZQUNaLFVBQVUsQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUM5QixJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2hDLE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFHRCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDYixPQUFPLEtBQUssQ0FBQztRQUdqQixNQUFNLFFBQVEsR0FBYSxFQUFFLENBQUM7UUFDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFHdkQsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksb0JBQVUsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFHOUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzVELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFHRCxLQUFLLENBQUMsY0FBYyxDQUFDLFVBQXNCO1FBRXZDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBR3pCLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQU9ELEtBQUssQ0FBQyxVQUFzQixFQUFFLFNBQWtCO1FBRTVDLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BDLElBQUksU0FBUyxFQUFFO1lBQ1gsVUFBVSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDMUIsT0FBTztTQUNWO1FBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ3JDLE1BQU0sSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM1RCxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUMxQyxxQkFBVyxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBR0QsV0FBVztRQUNQLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUMxQixDQUFDO0lBR0QsSUFBSSxDQUFDLFVBQXVCO1FBQ3hCLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxRQUFRO1lBQ3ZCLE9BQU87UUFDWCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtZQUNsRSxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3JELE9BQU87U0FDVjtRQUVELElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxZQUFZLEdBQUcsU0FBUyxFQUFFO1lBQzVDLE1BQU0sTUFBTSxHQUFHLFVBQVUsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDcEUsSUFBSSxNQUFNLEVBQUU7Z0JBQ1IsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUN6RSxjQUFjLENBQUMsaUJBQWlCLENBQUMsYUFBYSxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7YUFDekU7WUFDRCxPQUFPO1NBQ1Y7UUFFRCxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO1FBRzdELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRy9CLFlBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQy9CLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzdDLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7Z0JBQ2xCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQzthQUN4QjtpQkFBTTtnQkFDSCxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxFQUFFLFFBQVEsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQ3hEO1FBQ0wsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFHRCxhQUFhO1FBQ1QsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFFaEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxlQUFlLENBQUM7UUFDOUIsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDaEMsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUM3RCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDbkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDdkMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDbkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pDO2FBQU07WUFDSCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakM7UUFFRCxJQUFJLElBQUksR0FBRztZQUNQLElBQUksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDOUMsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO1lBQzNCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztZQUNyQixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDckIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRztTQUMxQixDQUFDO1FBRUYsSUFBSSxDQUFDLGVBQWUsQ0FBQyxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztRQUNuQixJQUFJLFlBQVksR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFO1lBQ2hDLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDO1lBQ3BCLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3JCLElBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDO2dCQUN2QixRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsZUFBZSxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO2dCQUNwRixhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO2dCQUN6QixJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUM5QztRQUNMLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNiLENBQUM7SUFFRCxtQkFBbUIsQ0FBQyxLQUFhO1FBQzdCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkMsVUFBVSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7UUFDN0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7UUFDN0IsVUFBVSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRXJDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ2hDLElBQUksSUFBSSxHQUFHO1lBQ1AsZUFBZSxFQUFFLEtBQUs7WUFDdEIsR0FBRyxFQUFFLFVBQVUsQ0FBQyxHQUFHO1lBQ25CLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVTtTQUM3QixDQUFBO1FBQ0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFM0MsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFO1lBQ3JDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztTQUNyQjtRQUVELElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRUQsWUFBWTtRQUNSLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRTtZQUNqQyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQztZQUNwQixJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksQ0FBQyxFQUFFO2dCQUNyQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO2dCQUNuRCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQzthQUM3QjtRQUNMLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUViLENBQUM7SUFHRCxLQUFLLENBQUMsZ0JBQWdCO1FBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDeEQsSUFBSSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMxQixZQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBRXBCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxFQUFFO1lBQzVDLEtBQUssTUFBTSxFQUFFLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDM0IsSUFBSSxFQUFFLENBQUMsTUFBTSxJQUFJLE1BQU0sRUFBRTtvQkFDckIsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7aUJBQzVCO3FCQUFNO29CQUNILEVBQUUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztpQkFDM0I7YUFDSjtTQUNKO2FBQU07WUFDSCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFO2dCQUN6RCxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO2dCQUNyQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7YUFDekM7aUJBQU07Z0JBQ0gsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztnQkFDckMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2FBQ3pDO1NBQ0o7UUFFRCxLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDM0IsRUFBRSxJQUFJLE1BQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNuQztRQUNELElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDO1FBQ2pELElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQzVDLElBQUksQ0FBQyxFQUFFO2dCQUNILE9BQU87b0JBQ0gsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHO29CQUNWLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSTtvQkFDWixNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU07aUJBSW5CLENBQUE7YUFDSjtRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsS0FBSyxNQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQzNCLEVBQUUsSUFBSSxNQUFNLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN6QztRQUNELE1BQU0sSUFBSSxHQUFHO1lBQ1QsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUMzQixJQUFJLEVBQUU7b0JBQ0YsT0FBTzt3QkFDSCxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUc7d0JBQ1gsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJO3dCQUNiLFFBQVEsRUFBRSxFQUFFLENBQUMsUUFBUTt3QkFDckIsT0FBTyxFQUFFLEVBQUUsQ0FBQyxPQUFPO3dCQUNuQixVQUFVLEVBQUUsRUFBRSxDQUFDLFVBQVU7d0JBRXpCLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTTt3QkFDakIsSUFBSSxFQUFFLEVBQUUsQ0FBQyxJQUFJO3FCQUNoQixDQUFBO1lBQ1QsQ0FBQyxDQUFDO1NBQ0wsQ0FBQztRQUNGLElBQUksQ0FBQyxlQUFlLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDOUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUFFRCxrQkFBa0I7UUFDZCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDaEMsSUFBSSxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxFQUFFO1lBQ2hGLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7U0FDbEM7YUFBTTtZQUNILElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNuQztJQUNMLENBQUM7SUFJRCxZQUFZO1FBQ1IsSUFBSSxJQUFJLENBQUMsZUFBZSxJQUFJLENBQUMsRUFBRTtZQUMzQixPQUFPLENBQUMsQ0FBQztTQUNaO1FBQ0QsT0FBTyxDQUFDLENBQUM7SUFDYixDQUFDO0lBR0QsbUJBQW1CO1FBQ2YsTUFBTSxjQUFjLEdBQWlCLEVBQUUsQ0FBQztRQUN4QyxLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDM0IsSUFBSSxDQUFDLEVBQUU7Z0JBQUUsU0FBUztZQUVsQixJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU07Z0JBQUUscUJBQVcsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7WUFFN0MsY0FBYyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4QixJQUFJLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM1QixxQkFBVyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNyQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7U0FDaEM7UUFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQU1ELGVBQWUsQ0FBQyxjQUF1QztRQUNuRCxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDLHdCQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUN6RixJQUFJLENBQUMsVUFBVSxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7SUFDcEQsQ0FBQztJQU9ELFlBQVksQ0FBQyxZQUFvQixFQUFFLGlCQUEwQjtRQUN6RCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLEtBQUssbUJBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM5RSxNQUFNLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsd0JBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLHdCQUFZLENBQUMsS0FBSyxDQUFDO1FBQ25GLFVBQVUsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLFVBQVUsR0FBRyxZQUFZLENBQUM7SUFDbkMsQ0FBQztDQUNKO0FBaldELDJCQWlXQyJ9