'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const utils = require("../../../utils/index");
const GoldenFlower_logic = require("./GoldenFlower_logic");
const MessageService = require("../../../services/MessageService");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
class jhPlayer extends PlayerInfo_1.PlayerInfo {
    constructor(roomInfo, i, opts) {
        super(opts);
        this.status = 'NONE';
        this.state = "PS_NONE";
        this.cards = null;
        this.cardType = 0;
        this.holdStatus = 0;
        this.totalBet = 0;
        this.profit = 0;
        this.auto_genzhu = false;
        this.auto_no_Fold = true;
        this.is_settlement = false;
        this.initgold = 0;
        this.seat = i;
        this.gold = opts.gold;
        if (roomInfo.experience) {
            this.gold = 2000000;
        }
        this.initgold = this.gold;
    }
    stripRobot() {
        return {
            cards: this.cards,
            cardType: this.cardType,
            uid: this.uid,
            isRobot: this.isRobot,
            gold: this.gold
        };
    }
    initGame(roomInfo, cards, cardType, betNum) {
        this.status = 'GAME';
        this.cards = cards;
        this.cards.sort((a, b) => {
            if (a % 13 === 0)
                return 0;
            if (b % 13 === 0)
                return 1;
            return b % 13 - a % 13;
        });
        this.cardType = cardType;
        this.holdStatus = 0;
        this.totalBet = betNum;
        this.gold -= betNum;
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "lowBet", update_time: utils.cDate(), msg: betNum });
        this.initControlType();
    }
    toHolds() {
        return this.cards && { uid: this.uid, cards: this.cards, type: this.cardType, isRobot: this.isRobot };
    }
    wrapSettlement() {
        return {
            uid: this.uid,
            seat: this.seat,
            totalBet: this.totalBet,
            profit: this.profit,
            gold: this.gold,
            holds: this.toHolds(),
        };
    }
    wrapGame() {
        return {
            seat: this.seat,
            uid: this.uid,
            headurl: this.headurl,
            nickname: this.nickname,
            gold: this.gold,
            totalBet: this.totalBet,
            holds: null,
            holdStatus: this.holdStatus
        };
    }
    strip() {
        return {
            seat: this.seat,
            uid: this.uid,
            headurl: this.headurl,
            nickname: encodeURI(this.nickname),
            gold: this.gold,
            status: this.status,
            holdStatus: this.holdStatus,
            totalBet: this.totalBet,
            isRobot: this.isRobot,
            ip: this.ip,
        };
    }
    Record_strip() {
        return {
            uid: this.uid,
            isRobot: this.isRobot,
            seat: this.seat,
            nickname: this.nickname,
            headurl: this.headurl,
            gold: this.gold,
            totalBet: this.totalBet,
            hold: this.cards,
            cardType: this.cardType,
            holdStatus: this.holdStatus,
            profit: this.profit,
        };
    }
    kickStrip() {
        return {
            uid: this.uid,
            seat: this.seat
        };
    }
    async settlement(roomInfo) {
        roomInfo.record_history.max_uid = roomInfo.max_uid;
        this.gameRecordService = (0, RecordGeneralManager_1.default)();
        const data = this.gameRecordService
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
            .addResult(roomInfo.zipResult)
            .setControlType(this.controlType)
            .setGameRecordInfo(Math.abs(this.totalBet), Math.abs(this.totalBet), this.profit - this.totalBet, false)
            .setGameRecordLivesResult(roomInfo.record_history);
        let res = await data.sendToDB(1);
        this.is_settlement = true;
        this.gold = res.gold;
        this.initgold = this.gold;
        this.profit = res.playerRealWin;
    }
    async only_update_game(roomInfo) {
        if (!roomInfo.experience) {
            await this.gameRecordService.Later_updateRecord(roomInfo.record_history);
        }
    }
    rechargeStrip() {
        return {
            uid: this.uid,
            seat: this.seat,
            gold: this.gold,
        };
    }
    handler_fold(roomInfo) {
        let flage = false;
        if (roomInfo.curr_doing_seat == this.seat && this.status == "GAME") {
            flage = true;
        }
        this.status = 'WAIT';
        this.state = "PS_NONE";
        this.settlement(roomInfo);
        this.holdStatus = 2;
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "fold", update_time: utils.cDate(), msg: "" });
        (roomInfo.zhuang_seat === this.seat) && roomInfo.resetZhuang();
        for (const pl of roomInfo._players) {
            const member = pl && roomInfo.channel.getMember(pl.uid);
            if (!member)
                continue;
            const opts = { type: 'fold', seat: this.seat };
            if (pl.uid == this.uid)
                opts["cards"] = this.cards;
            MessageService.pushMessageByUids('ZJH_onOpts', opts, member);
        }
        const list = roomInfo._players.filter(pl => pl && pl.status == 'GAME');
        if (flage || list.length == 1) {
            roomInfo.checkHasNextPlayer(this.seat);
        }
    }
    handler_kanpai(roomInfo) {
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "kanpai", update_time: utils.cDate(), msg: "" });
        roomInfo.channelIsPlayer('ZJH_onOpts', {
            type: 'kanpai',
            seat: this.seat,
            fahuaTime: this.seat === roomInfo.curr_doing_seat ? roomInfo.handler_pass() : 0
        });
    }
    handler_cingl(roomInfo, betNum) {
        clearTimeout(roomInfo.Oper_timeout);
        this.state = "PS_NONE";
        this.totalBet += betNum;
        this.gold -= betNum;
        roomInfo.addSumBet(this, betNum, "cingl");
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "cingl", update_time: utils.cDate(), msg: betNum });
        roomInfo.channelIsPlayer('ZJH_onOpts', {
            type: 'cingl',
            seat: this.seat,
            gold: this.gold,
            betNum: betNum,
            totalBet: this.totalBet,
            sumBet: roomInfo.currSumBet
        });
        roomInfo.checkHasNextPlayer(this.seat);
    }
    handler_filling(roomInfo, betNum, num) {
        clearTimeout(roomInfo.Oper_timeout);
        this.state = "PS_NONE";
        this.totalBet += betNum;
        this.gold -= betNum;
        roomInfo.betNum = num;
        roomInfo.addSumBet(this, betNum, "filling");
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "filling", update_time: utils.cDate(), msg: betNum });
        roomInfo.channelIsPlayer('ZJH_onOpts', {
            type: "filling",
            seat: this.seat,
            gold: this.gold,
            betNum: betNum,
            totalBet: this.totalBet,
            sumBet: roomInfo.currSumBet
        });
        roomInfo.checkHasNextPlayer(this.seat);
    }
    async handler_Allfighting(roomInfo) {
        clearTimeout(roomInfo.Oper_timeout);
        this.state = "PS_NONE";
        let curr_bet = this.gold;
        this.totalBet += curr_bet;
        this.gold -= curr_bet;
        roomInfo.addSumBet(this, curr_bet, "allin");
        roomInfo.record_history.oper.push({ uid: this.uid, oper_type: "allin", update_time: utils.cDate(), msg: curr_bet });
        let flag = true;
        const gamePlayers = roomInfo._players.filter(pl => pl && pl.status == 'GAME');
        for (const pl of gamePlayers) {
            if (pl && pl.uid == this.uid)
                continue;
            let temp = GoldenFlower_logic.bipaiSole(this, pl);
            if (temp <= 0) {
                flag = false;
            }
        }
        roomInfo.channelIsPlayer('ZJH_onOpts', {
            type: 'allin',
            seat: this.seat,
            gold: this.gold,
            betNum: curr_bet,
            totalBet: this.totalBet,
            sumBet: roomInfo.currSumBet,
            iswin: flag,
        });
        if (!flag) {
            this.status = 'WAIT';
            this.holdStatus = 3;
            (roomInfo.zhuang_seat == this.seat) && roomInfo.resetZhuang();
            this.settlement(roomInfo);
        }
        if (flag) {
            for (const pl of gamePlayers) {
                if (pl && pl.uid == this.uid)
                    continue;
                let diff = pl.totalBet - this.totalBet;
                if (diff > 0) {
                    pl.totalBet -= diff;
                    roomInfo.addSumBet(pl, -diff, "allin");
                }
                pl.status = 'WAIT';
                pl.holdStatus = 3;
                pl.settlement(roomInfo);
            }
        }
        await utils.delay(1500);
        roomInfo.checkHasNextPlayer(this.seat);
        return flag;
    }
}
exports.default = jhPlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamhQbGF5ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9Hb2xkZW5GbG93ZXIvbGliL2poUGxheWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFDYix1RUFBb0U7QUFFcEUsOENBQStDO0FBSS9DLDJEQUEyRDtBQUMzRCxtRUFBb0U7QUFFcEUsbUZBQTJHO0FBRTNHLE1BQXFCLFFBQVMsU0FBUSx1QkFBVTtJQXdCNUMsWUFBWSxRQUFnQixFQUFFLENBQVMsRUFBRSxJQUFTO1FBQzlDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQXZCaEIsV0FBTSxHQUF1QyxNQUFNLENBQUM7UUFFcEQsVUFBSyxHQUEwQixTQUFTLENBQUE7UUFFeEMsVUFBSyxHQUFhLElBQUksQ0FBQztRQUV2QixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBRXJCLGVBQVUsR0FBVyxDQUFDLENBQUM7UUFFdkIsYUFBUSxHQUFHLENBQUMsQ0FBQztRQUViLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFFbkIsZ0JBQVcsR0FBRyxLQUFLLENBQUM7UUFFcEIsaUJBQVksR0FBRyxJQUFJLENBQUM7UUFFcEIsa0JBQWEsR0FBRyxLQUFLLENBQUM7UUFHdEIsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUdqQixJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNkLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFJLFFBQVEsQ0FBQyxVQUFVLEVBQUU7WUFDckIsSUFBSSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7U0FDdkI7UUFDRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDOUIsQ0FBQztJQUdELFVBQVU7UUFDTixPQUFPO1lBQ0gsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtZQUN2QixHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7WUFDYixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDckIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1NBQ2xCLENBQUE7SUFDTCxDQUFDO0lBR0QsUUFBUSxDQUFDLFFBQWdCLEVBQUUsS0FBZSxFQUFFLFFBQWdCLEVBQUUsTUFBYztRQUN4RSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNyQixJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQztnQkFBRSxPQUFPLENBQUMsQ0FBQztZQUMzQixJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQztnQkFBRSxPQUFPLENBQUMsQ0FBQztZQUMzQixPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUMzQixDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDO1FBQ3BCLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUNuSCxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUdELE9BQU87UUFDSCxPQUFPLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzFHLENBQUM7SUFHRCxjQUFjO1FBQ1YsT0FBTztZQUNILEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztZQUNiLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtZQUN2QixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07WUFDbkIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1lBQ2YsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUU7U0FDeEIsQ0FBQztJQUNOLENBQUM7SUFHRCxRQUFRO1FBQ0osT0FBTztZQUNILElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRztZQUNiLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztZQUNyQixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7WUFDdkIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1lBQ2YsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1lBQ3ZCLEtBQUssRUFBRSxJQUFJO1lBQ1gsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO1NBQzlCLENBQUM7SUFDTixDQUFDO0lBRUQsS0FBSztRQUNELE9BQU87WUFDSCxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7WUFDZixHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7WUFDYixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDckIsUUFBUSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQ2xDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtZQUNuQixVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVU7WUFDM0IsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1lBQ3ZCLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztZQUNyQixFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7U0FDZCxDQUFDO0lBQ04sQ0FBQztJQUdELFlBQVk7UUFDUixPQUFPO1lBQ0gsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO1lBQ2IsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPO1lBQ3JCLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtZQUN2QixPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDckIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1lBQ2YsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1lBQ3ZCLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSztZQUNoQixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7WUFDdkIsVUFBVSxFQUFFLElBQUksQ0FBQyxVQUFVO1lBQzNCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtTQUN0QixDQUFBO0lBQ0wsQ0FBQztJQUVELFNBQVM7UUFDTCxPQUFPO1lBQ0gsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO1lBQ2IsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1NBQ2xCLENBQUM7SUFDTixDQUFDO0lBR0QsS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFnQjtRQUM3QixRQUFRLENBQUMsY0FBYyxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQ25ELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFBLDhCQUF5QixHQUFFLENBQUM7UUFDckQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLGlCQUFpQjthQUM5QixpQkFBaUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUM7YUFDL0QsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDO2FBQzVELGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQzthQUNqRSxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQzthQUM3QixjQUFjLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQzthQUNoQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDO2FBQ3ZHLHdCQUF3QixDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUN2RCxJQUFJLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFFMUIsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUM7SUFDcEMsQ0FBQztJQUdELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFnQjtRQUNuQyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRTtZQUN0QixNQUFNLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDNUU7SUFDTCxDQUFDO0lBR0QsYUFBYTtRQUNULE9BQU87WUFDSCxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7WUFDYixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7WUFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7U0FDbEIsQ0FBQTtJQUNMLENBQUM7SUFFRCxZQUFZLENBQUMsUUFBZ0I7UUFDekIsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ2xCLElBQUksUUFBUSxDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksTUFBTSxFQUFFO1lBQ2hFLEtBQUssR0FBRyxJQUFJLENBQUM7U0FDaEI7UUFDRCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQztRQUN2QixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzFCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUU3RyxDQUFDLFFBQVEsQ0FBQyxXQUFXLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUUvRCxLQUFLLE1BQU0sRUFBRSxJQUFJLFFBQVEsQ0FBQyxRQUFRLEVBQUU7WUFDaEMsTUFBTSxNQUFNLEdBQUcsRUFBRSxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsTUFBTTtnQkFBRSxTQUFTO1lBQ3RCLE1BQU0sSUFBSSxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQy9DLElBQUksRUFBRSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRztnQkFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUNuRCxjQUFjLENBQUMsaUJBQWlCLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztTQUNoRTtRQUVELE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxNQUFNLElBQUksTUFBTSxDQUFDLENBQUM7UUFDdkUsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7WUFDM0IsUUFBUSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUMxQztJQUVMLENBQUM7SUFNRCxjQUFjLENBQUMsUUFBZ0I7UUFDM0IsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQy9HLFFBQVEsQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFO1lBQ25DLElBQUksRUFBRSxRQUFRO1lBQ2QsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO1lBQ2YsU0FBUyxFQUFFLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2xGLENBQUMsQ0FBQztJQUNQLENBQUM7SUFNRCxhQUFhLENBQUMsUUFBZ0IsRUFBRSxNQUFjO1FBRTFDLFlBQVksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7UUFDdkIsSUFBSSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUM7UUFDeEIsSUFBSSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUM7UUFDcEIsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztRQUVsSCxRQUFRLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRTtZQUNuQyxJQUFJLEVBQUUsT0FBTztZQUNiLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLE1BQU0sRUFBRSxNQUFNO1lBQ2QsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRO1lBQ3ZCLE1BQU0sRUFBRSxRQUFRLENBQUMsVUFBVTtTQUM5QixDQUFDLENBQUM7UUFDSCxRQUFRLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFPRCxlQUFlLENBQUMsUUFBZ0IsRUFBRSxNQUFjLEVBQUUsR0FBVztRQUV6RCxZQUFZLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDO1FBRXBCLFFBQVEsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO1FBQ3RCLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM1QyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFFcEgsUUFBUSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUU7WUFDbkMsSUFBSSxFQUFFLFNBQVM7WUFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7WUFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7WUFDZixNQUFNLEVBQUUsTUFBTTtZQUNkLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtZQUN2QixNQUFNLEVBQUUsUUFBUSxDQUFDLFVBQVU7U0FDOUIsQ0FBQyxDQUFDO1FBQ0gsUUFBUSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBR0QsS0FBSyxDQUFDLG1CQUFtQixDQUFDLFFBQWdCO1FBQ3RDLFlBQVksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7UUFDdkIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN6QixJQUFJLENBQUMsUUFBUSxJQUFJLFFBQVEsQ0FBQztRQUMxQixJQUFJLENBQUMsSUFBSSxJQUFJLFFBQVEsQ0FBQztRQUN0QixRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDNUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3BILElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztRQUNoQixNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxDQUFDO1FBQzlFLEtBQUssTUFBTSxFQUFFLElBQUksV0FBVyxFQUFFO1lBQzFCLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUc7Z0JBQ3hCLFNBQVM7WUFDYixJQUFJLElBQUksR0FBRyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2xELElBQUksSUFBSSxJQUFJLENBQUMsRUFBRTtnQkFDWCxJQUFJLEdBQUcsS0FBSyxDQUFDO2FBQ2hCO1NBQ0o7UUFDRCxRQUFRLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRTtZQUNuQyxJQUFJLEVBQUUsT0FBTztZQUNiLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTtZQUNmLE1BQU0sRUFBRSxRQUFRO1lBQ2hCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtZQUN2QixNQUFNLEVBQUUsUUFBUSxDQUFDLFVBQVU7WUFDM0IsS0FBSyxFQUFFLElBQUk7U0FFZCxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsSUFBSSxFQUFFO1lBRVAsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7WUFDckIsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7WUFFcEIsQ0FBQyxRQUFRLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7WUFFOUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUM3QjtRQUVELElBQUksSUFBSSxFQUFFO1lBQ04sS0FBSyxNQUFNLEVBQUUsSUFBSSxXQUFXLEVBQUU7Z0JBQzFCLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEdBQUc7b0JBQ3hCLFNBQVM7Z0JBQ2IsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO2dCQUN2QyxJQUFJLElBQUksR0FBRyxDQUFDLEVBQUU7b0JBQ1YsRUFBRSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUM7b0JBRXBCLFFBQVEsQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO2lCQUMxQztnQkFDRCxFQUFFLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztnQkFDbkIsRUFBRSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7Z0JBRWxCLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDM0I7U0FDSjtRQUVELE1BQU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QixRQUFRLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3ZDLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7Q0FDSjtBQWhVRCwyQkFnVUMifQ==