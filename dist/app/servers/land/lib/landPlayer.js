"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PlayerInfo_1 = require("../../../common/pojo/entity/PlayerInfo");
const land_Logic = require("./land_Logic");
const apiResultDTO_1 = require("../../../common/classes/apiResultDTO");
const land_Logic_1 = require("./land_Logic");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
class landPlayer extends PlayerInfo_1.PlayerInfo {
    constructor(i, opts) {
        super(opts);
        this.status = "NONE";
        this.state = "PS_NONE";
        this.cards = [];
        this.bet = 0;
        this.profit = 0;
        this.cardList = [];
        this.postcardList = [];
        this.postCardNum = 0;
        this.trusteeshipType = 1;
        this.isMing = false;
        this.isDOUBLE = 1;
        this.friendSeat = -1;
        this.points = -1;
        this.initgold = 0;
        this.seat = i;
        this.gold = opts.gold;
        this.initgold = this.gold;
    }
    prepare() {
        this.status = "WAIT";
        this.cards = [];
        this.holdStatus = 0;
        this.isDOUBLE = 1;
        this.bet = 0;
        this.profit = 0;
        this.cardList = [];
        this.postcardList = [];
        this.postCardNum = 0;
        this.trusteeshipType = 1;
        this.isMing = false;
        this.friendSeat = -1;
        this.points = -1;
        this.state = "PS_NONE";
    }
    initGame(cards) {
        this.status = "GAME";
        this.cards = cards.map(c => c);
        this.holdStatus = 0;
        this.cardList = cards.map(c => c);
        this.postcardList = [];
        this.postCardNum = 0;
        this.trusteeshipType = 1;
        this.isMing = false;
    }
    wrapGame() {
        return {
            seat: this.seat,
            gold: this.gold,
            bet: this.bet,
            cards: this.cards,
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
            bet: this.bet,
            isDOUBLE: this.isDOUBLE,
            isRobot: this.isRobot
        };
    }
    Record_strip() {
        return {
            uid: this.uid,
            isRobot: this.isRobot,
            nickname: encodeURI(this.nickname),
            headurl: this.headurl,
            gold: this.gold,
            profit: this.profit
        };
    }
    async updateGold(roomInfo) {
        this.gameRecordService = (0, RecordGeneralManager_1.default)();
        const res = await this.gameRecordService
            .setPlayerBaseInfo(this.uid, false, this.isRobot, this.initgold)
            .setGameInfo(roomInfo.nid, roomInfo.sceneId, roomInfo.roomId)
            .setGameRoundInfo(roomInfo.roundId, roomInfo.realPlayersNumber, 0)
            .setGameRecordInfo(Math.abs(this.profit), Math.abs(this.profit), this.profit, false)
            .addResult(roomInfo.zipResult)
            .setGameRecordLivesResult(roomInfo.record_history)
            .sendToDB(1);
        this.gold = res.gold;
        this.initgold = this.gold;
        this.profit = res.playerRealWin;
    }
    async only_update_game(roomInfo) {
        await this.gameRecordService.Later_updateRecord(roomInfo.record_history);
    }
    robDeal(seat) {
        if (this.seat !== seat) {
            this.friendSeat = [0, 1, 2].find(s => s !== seat && s !== this.seat);
        }
    }
    handler_ShoutPoints(roomInfo, points) {
        clearTimeout(roomInfo.Oper_timeout);
        this.state = "PS_NONE";
        this.points = points;
        roomInfo.points = Math.max(roomInfo.points, points);
        do {
            if (points == 3) {
                roomInfo.land_seat = this.seat;
                break;
            }
            if (roomInfo.players.filter(pl => pl.points >= 0).length != 3) {
                roomInfo.set_next_doing_seat(roomInfo.nextFahuaIdx());
                break;
            }
            if (roomInfo.points === 0) {
                setTimeout(() => {
                    roomInfo.channelIsPlayer('ddz_liuju', {});
                    roomInfo.players.forEach(pl => pl && pl.prepare());
                    roomInfo.handler_start(roomInfo.players);
                }, 1000);
            }
            else {
                roomInfo.land_seat = roomInfo.players.find(pl => pl.points == roomInfo.points).seat;
            }
            break;
        } while (true);
        roomInfo.channelIsPlayer('land_jiaoFeng', {
            points: points,
            seat: this.seat
        });
        if (roomInfo.land_seat != -1) {
            roomInfo.gameStart();
        }
    }
    handler_Double(roomInfo, double) {
        this.isDOUBLE = double;
        this.state = "PS_NONE";
        roomInfo.Farmer_totalBei += double;
        roomInfo.channelIsPlayer("land_oper", { seat: this.seat, double: double });
        roomInfo.note_pls();
        let ret = roomInfo.players.every(pl => pl.state == "PS_NONE");
        if (ret) {
            roomInfo.status = "INGAME";
            clearTimeout(roomInfo.waitTimeout);
            roomInfo.set_next_doing_seat(roomInfo.land_seat);
        }
    }
    handler_postCards(cards, cardType_, roomInfo) {
        let cardType = land_Logic.GetCardType(cards);
        if (cards.length == 0) {
            this.postcardList = [];
            roomInfo.onPostCard(cardType, cards, this);
            return new apiResultDTO_1.default({ code: 200 }).result();
        }
        this.postcardList = land_Logic.sort_CardList(cards);
        if (roomInfo.lastDealPlayer.seat !== this.seat && !land_Logic.isOverPre(this.postcardList, roomInfo.lastDealPlayer.cards)) {
            return new apiResultDTO_1.default({ code: 500, msg: '错误牌型:2' }).result();
        }
        roomInfo.lastDealPlayer.seat = this.seat;
        roomInfo.lastDealPlayer.cards = cards;
        roomInfo.lastDealPlayer.cardType = cardType;
        roomInfo.lastDealPlayer.cards_len = this.cardList.length;
        if (cardType === land_Logic_1.CardsType.BOOM || cardType === land_Logic_1.CardsType.BIG_BOOM) {
            roomInfo.totalBei = roomInfo.totalBei * 2;
        }
        this.cardList = land_Logic.delCardList(this.cardList, cards);
        this.postCardNum += 1;
        roomInfo.onPostCard(cardType, cards, this);
        return new apiResultDTO_1.default({ code: 200 }).result();
    }
    handler_openCards(roomInfo) {
        roomInfo.totalBei = roomInfo.totalBei * 2;
        this.isMing = true;
        const opts = {
            uid: this.uid,
            seat: this.seat,
            cards: land_Logic.sort_CardList(this.cardList),
        };
        roomInfo.channelIsPlayer('ddz_mingCard', opts);
        roomInfo.note_pls();
    }
}
exports.default = landPlayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZFBsYXllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2xhbmQvbGliL2xhbmRQbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1RUFBb0U7QUFHcEUsMkNBQTRDO0FBRTVDLHVFQUE0RTtBQUM1RSw2Q0FBeUM7QUFFekMsbUZBQTJHO0FBRzNHLE1BQXFCLFVBQVcsU0FBUSx1QkFBVTtJQWlDOUMsWUFBWSxDQUFTLEVBQUUsSUFBUztRQUM1QixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUEvQmhCLFdBQU0sR0FBdUMsTUFBTSxDQUFDO1FBRXBELFVBQUssR0FBMEIsU0FBUyxDQUFBO1FBRXhDLFVBQUssR0FBYSxFQUFFLENBQUM7UUFJckIsUUFBRyxHQUFXLENBQUMsQ0FBQztRQUVoQixXQUFNLEdBQVcsQ0FBQyxDQUFDO1FBRW5CLGFBQVEsR0FBYSxFQUFFLENBQUM7UUFFeEIsaUJBQVksR0FBYSxFQUFFLENBQUM7UUFFNUIsZ0JBQVcsR0FBVyxDQUFDLENBQUM7UUFFeEIsb0JBQWUsR0FBVyxDQUFDLENBQUM7UUFFNUIsV0FBTSxHQUFZLEtBQUssQ0FBQztRQUV4QixhQUFRLEdBQUcsQ0FBQyxDQUFDO1FBRWIsZUFBVSxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBRXhCLFdBQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUdaLGFBQVEsR0FBVyxDQUFDLENBQUM7UUFHakIsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7UUFDZCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQzlCLENBQUM7SUFHRCxPQUFPO1FBQ0gsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSSxD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