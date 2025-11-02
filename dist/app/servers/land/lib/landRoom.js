"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const MessageService = require("../../../services/MessageService");
const utils = require("../../../utils/index");
const land_Logic = require("./land_Logic");
const landPlayer_1 = require("./landPlayer");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const recordUtil_1 = require("./util/recordUtil");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const landMgr_1 = require("../lib/landMgr");
const WAIT_TIME = 3000;
const FAHUA_TIME = 15000;
class landRoom extends SystemRoom_1.SystemRoom {
    constructor(opts) {
        super(opts);
        this.status = "INWAIT";
        this.curr_doing_seat = -1;
        this.lastWinIdx = -1;
        this.lastWaitTime = 0;
        this.lastFahuaTime = 0;
        this.bigwins = [];
        this.tuoguanTime = null;
        this.auto_delay = 0;
        this.record_history = { oper: [], info: [] };
        this.land_seat = -1;
        this.points = 0;
        this.publicCards = [];
        this.lowFen = 0;
        this.totalBei = 0;
        this.Farmer_totalBei = 0;
        this.waitTimeout = null;
        this.Oper_timeout = null;
        this.players = new Array(3).fill(null);
        this.startGameTime = 0;
        this.zipResult = '';
        this.entryCond = opts.entryCond || 0;
        this.lowBet = opts.lowBet || 50;
        this.lowFen = this.lowBet;
        this.maxRound = opts.maxRound || 20;
        this.lastDealPlayer = {
            seat: -1,
            cards: [],
            cardType: null,
            cards_len: null
        };
        this.Initialization();
    }
    close() {
        this.sendRoomCloseMessage();
        this.players = [];
    }
    Initialization() {
        this.curr_doing_seat = -1;
        this.lastFahuaTime = 0;
        this.record_history = { oper: [], info: [] };
        this.land_seat = -1;
        this.points = 0;
        this.publicCards = [];
        this.lastDealPlayer = {
            seat: -1,
            cards: [],
            cardType: null,
            cards_len: null
        };
        this.lowFen = this.lowBet;
        this.totalBei = 1;
        this.Farmer_totalBei = 0;
        this.startGameTime = 0;
        this.battle_kickNoOnline();
        this.status = "INWAIT";
        this.updateRoundId();
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
        this.players[i] = new landPlayer_1.default(i, dbplayer);
        this.addMessage(dbplayer);
        return true;
    }
    async offLineRecover(playerInfo) {
        playerInfo.onLine = true;
        playerInfo.trusteeshipType = 1;
        this.addMessage(playerInfo);
        if (this.curr_doing_seat == playerInfo.seat) {
            clearTimeout(this.tuoguanTime);
        }
        this.channelIsPlayer('ddz_tuoguan', {
            seat: playerInfo.seat,
            trusteeshipType: 1
        });
    }
    leave(playerInfo, isOffLine) {
        this.kickOutMessage(playerInfo.uid);
        if (isOffLine) {
            playerInfo.onLine = false;
            if (this.curr_doing_seat !== playerInfo.seat && this.status == "INGAME") {
                playerInfo.trusteeshipType = 2;
                this.channelIsPlayer('ddz_tuoguan', {
                    seat: playerInfo.seat,
                    trusteeshipType: playerInfo.isRobot == 2 ? 1 : playerInfo.trusteeshipType
                });
            }
            return;
        }
        this.players[playerInfo.seat] = null;
        if (this.lastWinIdx === playerInfo.seat) {
            this.lastWinIdx = -1;
        }
        this.channelIsPlayer('ddz_onExit', { uid: playerInfo.uid, seat: playerInfo.seat });
        landMgr_1.default.removePlayerSeat(playerInfo.uid);
    }
    getWaitTime() {
        if (this.status == "CPoints")
            return Math.max(FAHUA_TIME - (Date.now() - this.lastFahuaTime), 0);
        if (this.status == "INGAME") {
            return Math.max(FAHUA_TIME - (Date.now() - this.lastFahuaTime), 0);
        }
        return 0;
    }
    wait(playerInfo) {
        if (this.status != "INWAIT")
            return;
        if (this.players.filter(pl => pl && pl.status == 'WAIT').length <= 1) {
            this.channelIsPlayer('land_onWait', { waitTime: 0 });
            return;
        }
        if (Date.now() - this.lastWaitTime < WAIT_TIME) {
            const member = playerInfo && this.channel.getMember(playerInfo.uid);
            if (member) {
                let waitTime = Math.max(WAIT_TIME - (Date.now() - this.lastWaitTime), 0);
                MessageService.pushMessageByUids(`land_onWait`, { waitTime }, member);
            }
            return;
        }
        this.channelIsPlayer('land_onWait', { waitTime: WAIT_TIME });
        this.lastWaitTime = Date.now();
        clearTimeout(this.waitTimeout);
        this.waitTimeout = setTimeout(() => {
            const list = this.players.filter(pl => pl);
            if (list.length >= 3) {
                this.handler_start(list);
            }
            else {
                this.channelIsPlayer('land_onWait', { waitTime: 0 });
            }
        }, WAIT_TIME);
    }
    async handler_start(list) {
        this.status = "CPoints";
        clearTimeout(this.waitTimeout);
        let data = land_Logic.cardDataSort();
        this.publicCards = data.publicCards;
        for (const pl of list) {
            if (pl.isRobot == RoleEnum_1.RoleEnum.REAL_PLAYER) {
                let cards = data.cardData.shift();
                pl.initGame(cards.cards);
            }
        }
        for (const pl of list) {
            if (pl.isRobot != RoleEnum_1.RoleEnum.REAL_PLAYER) {
                let cards = data.cardData.shift();
                pl.initGame(cards.cards);
            }
        }
        for (const pl of this.players) {
            const member = pl && this.channel.getMember(pl.uid);
            const opts = pl && pl.wrapGame();
            member && MessageService.pushMessageByUids('ddz_onDeal', opts, member);
        }
        await utils.delay(list.length * 500 + 2000);
        this.set_next_doing_seat(this.nextFahuaIdx());
        return Promise.resolve();
    }
    async set_next_doing_seat(doing) {
        const playerInfo = this.players[doing];
        this.curr_doing_seat = doing;
        playerInfo.state = "PS_OPER";
        this.lastFahuaTime = Date.now();
        this.auto_delay = FAHUA_TIME;
        if (this.status == "INGAME" && this.tishi(playerInfo).length == 0) {
            this.auto_delay = 5000;
        }
        for (const pl of this.players) {
            const member = pl && this.channel.getMember(pl.uid);
            const opts = this.stripSpeak(pl);
            member && MessageService.pushMessageByUids('ddz_onFahua', opts, member);
        }
        this.handler_pass();
        if (!playerInfo.onLine || playerInfo.trusteeshipType == 2) {
            this.handler_play(playerInfo, 2);
        }
    }
    async handler_play(playerInfo, tuoType) {
        if (this.status == "CPoints") {
            return playerInfo.handler_ShoutPoints(this, 0);
        }
        let last_pkg = this.lastDealPlayer.seat == playerInfo.seat ? [] : this.lastDealPlayer.cards;
        let tishi = land_Logic.chaipai(playerInfo.cardList, last_pkg);
        let cards = tishi.length > 0 ? tishi[0].cards : [];
        let cardType = tishi.length > 0 ? tishi[0].type : land_Logic.CardsType.CHECK_CALL;
        if (tuoType === 1) {
            playerInfo.handler_postCards(cards, cardType, this);
        }
        else {
            clearTimeout(this.tuoguanTime);
            this.tuoguanTime = setTimeout(() => {
                playerInfo.handler_postCards(cards, cardType, this);
            }, 1000);
        }
    }
    stripSpeak(playerInfo) {
        const opts = {
            status: this.status,
            curr_doing_seat: this.curr_doing_seat,
            curr_doing_uid: this.players[this.curr_doing_seat].uid,
            betNum: this.lowBet,
            countdown: this.curr_doing_seat == playerInfo.seat ? Math.max(this.auto_delay - (Date.now() - this.lastFahuaTime), 0) : this.getWaitTime(),
            fen: this.points,
            isRobotData: playerInfo.isRobot === 2 ? playerInfo.cardList : null,
            lastDealPlayer: this.lastDealPlayer,
            notices: this.curr_doing_seat == playerInfo.seat ? this.tishi(playerInfo) : [],
        };
        return opts;
    }
    tishi(currPlayer) {
        if (this.status == "CPoints") {
            return [];
        }
        let last_pkg = this.lastDealPlayer.seat == currPlayer.seat ? [] : this.lastDealPlayer.cards;
        let tishiArr = land_Logic.chaipai(currPlayer.cardList, last_pkg);
        return tishiArr;
    }
    gameStart() {
        this.status = "DOUBLE";
        let land_pl = this.players[this.land_seat];
        this.players.forEach(pl => pl && pl.robDeal(this.land_seat));
        this.zipResult = (0, recordUtil_1.buildRecordResult)(this.players, this.publicCards);
        land_pl.cards.push(...this.publicCards);
        land_pl.cards = land_Logic.sort_CardList(land_pl.cards);
        land_pl.cardList = land_pl.cards.slice();
        this.lowFen = this.points * this.lowBet;
        for (const pl of this.players) {
            let opts = {
                land_seat: this.land_seat,
                uid: land_pl.uid,
                fen: this.points,
                publicCards: this.publicCards,
                lowFen: this.lowFen,
                JiPaiQi: this.getJiPaiQi(pl.uid),
                countdown: 5000
            };
            const member = pl && this.channel.getMember(pl.uid);
            member && MessageService.pushMessageByUids('land_qiang', opts, member);
            if (pl.seat != this.land_seat) {
                pl.state = "PS_OPER";
            }
        }
        this.startGameTime = Date.now();
        this.lastDealPlayer.seat = this.land_seat;
        this.waitTimeout = setTimeout(() => {
            for (const pl of this.players) {
                if (pl.seat == this.land_seat || pl.state == "PS_NONE")
                    continue;
                pl.handler_Double(this, 1);
            }
        }, 5000);
    }
    note_pls() {
        let opts = [];
        for (const pl of this.players) {
            if (!pl)
                continue;
            let opt = { uid: pl.uid, seat: pl.seat, totalBei: this.totalBei * pl.isDOUBLE };
            if (pl.seat == this.land_seat) {
                opt.totalBei = opt.totalBei * (this.Farmer_totalBei > 0 ? this.Farmer_totalBei : 1);
            }
            opts.push(opt);
        }
        this.channelIsPlayer("land_note_pls", opts);
    }
    onPostCard(cardType, postCardList, playerInfo) {
        this.record_history.oper.push({ uid: playerInfo.uid, oper_type: "onPostCard", update_time: utils.cDate(), msg: `${postCardList.toString()}` });
        clearTimeout(this.tuoguanTime);
        clearTimeout(this.Oper_timeout);
        playerInfo.state = "PS_NONE";
        for (const pl of this.players) {
            let opts = {
                cardType: cardType,
                seat: playerInfo.seat,
                postCardList: postCardList,
                mingCardPlayer: this.players.filter(pl => pl.isMing).map(pl => {
                    return {
                        uid: pl.uid,
                        seat: pl.seat,
                        cards: pl.cardList
                    };
                }),
                cards: pl.uid == playerInfo.uid ? land_Logic.sort_CardList(playerInfo.cardList) : [],
                cards_len: playerInfo.cardList.length,
                JiPaiQi: this.getJiPaiQi(pl.uid)
            };
            const member = pl && this.channel.getMember(pl.uid);
            member && MessageService.pushMessageByUids('ddz_onPostCard', opts, member);
        }
        this.note_pls();
        this.nextStatus(playerInfo);
    }
    async nextStatus(playerInfo) {
        await utils.delay(100);
        if (playerInfo.cardList.length == 0) {
            this.settlement(playerInfo.seat);
        }
        else {
            this.set_next_doing_seat(this.nextFahuaIdx());
        }
    }
    async settlement(winSeat) {
        clearTimeout(this.Oper_timeout);
        clearTimeout(this.waitTimeout);
        clearTimeout(this.tuoguanTime);
        this.channelIsPlayer('ddz_liangpai', {
            cardLists: this.players.filter(pl => !!pl).map(pl => {
                return { seat: pl.seat, cardlist: pl.cardList };
            }),
        });
        let wtime = 800;
        let chuntian = this.isChunTian(winSeat);
        if (chuntian) {
            wtime = 2000;
            this.totalBei = this.totalBei * 2;
            let opts = {
                type: chuntian,
                totalBei: this.totalBei
            };
            this.channelIsPlayer('ddz_chunTian', opts);
        }
        if (winSeat == this.land_seat) {
            let totalWin = 0;
            for (const pl of this.players) {
                if (pl.seat == this.land_seat)
                    continue;
                totalWin += pl.isDOUBLE * this.lowFen * this.totalBei;
            }
            let diff = totalWin - this.players[this.land_seat].gold;
            if (diff > 0) {
                totalWin = totalWin - diff;
            }
            for (const pl of this.players) {
                if (pl.seat == winSeat)
                    continue;
                pl.profit = -totalWin / 2;
                let diff_pl = totalWin / 2 - pl.gold;
                if (diff_pl > 0) {
                    pl.profit = -pl.gold;
                    totalWin -= diff_pl;
                }
            }
            this.players[this.land_seat].profit = totalWin;
        }
        else {
            let totalWin = 0;
            for (const pl of this.players) {
                if (pl.seat == this.land_seat)
                    continue;
                pl.profit = this.lowFen * this.totalBei * pl.isDOUBLE;
                let diff_pl = pl.profit - pl.gold;
                if (diff_pl > 0) {
                    pl.profit = diff_pl;
                }
                totalWin += pl.profit;
            }
            let diff = totalWin - this.players[this.land_seat].gold;
            if (diff > 0) {
                let totalWin_temp = totalWin;
                totalWin = totalWin - diff;
                let pls = this.players.filter(pl => pl.seat != this.land_seat);
                for (const pll of pls) {
                    pll.profit = (pll.profit / totalWin_temp) * totalWin;
                }
            }
            this.players[this.land_seat].profit = -totalWin;
        }
        this.lastWinIdx = winSeat;
        this.endTime = Date.now();
        await Promise.all(this.players.map(async (pl) => await pl.updateGold(this)));
        await utils.delay(wtime);
        const opts = {
            land_seat: this.land_seat,
            winSeat: winSeat,
            entryCond: this.entryCond,
            list: this.players.map(pl => {
                let opt = {
                    uid: pl.uid,
                    seat: pl.seat,
                    profit: pl.profit,
                    gold: pl.gold,
                    nickname: encodeURI(pl.nickname),
                    lowFen: this.lowFen,
                    totalBei: this.totalBei * pl.isDOUBLE
                };
                if (pl.seat == this.land_seat) {
                    opt.totalBei = opt.totalBei * (this.Farmer_totalBei > 0 ? this.Farmer_totalBei : 1);
                }
                return opt;
            })
        };
        this.channelIsPlayer('land_onSettlement', opts);
        this.record_history.info = opts.list;
        for (const pl of this.players) {
            pl && await pl.only_update_game(this);
        }
        this.status = "END";
        this.Initialization();
    }
    isChunTian(winSeat) {
        if (this.land_seat == winSeat && this.players[this.land_seat].postCardNum >= 1) {
            const sum = this.players.filter(pl => pl.seat != this.land_seat).reduce((total, Value) => total + Value.postCardNum, 0);
            return sum == 0 ? 1 : 0;
        }
        if (winSeat != this.land_seat && this.players[this.land_seat].postCardNum == 1) {
            return 2;
        }
        return 0;
    }
    canReady(uid) {
        let member = this.channel.getMember(uid);
        member && MessageService.pushMessageByUids('ddz_onCanReady', {}, member);
    }
    handler_pass() {
        clearTimeout(this.Oper_timeout);
        this.Oper_timeout = setTimeout(() => {
            let playerInfo = this.players[this.curr_doing_seat];
            playerInfo.trusteeshipType = 2;
            this.channelIsPlayer('ddz_tuoguan', {
                seat: this.players[this.curr_doing_seat].seat,
                trusteeshipType: playerInfo.isRobot == 2 ? 1 : playerInfo.trusteeshipType
            });
            this.handler_play(this.players[this.curr_doing_seat], 1);
            console.warn(this.roundId, this.auto_delay, playerInfo.uid, utils.cDate());
        }, this.auto_delay);
    }
    nextFahuaIdx() {
        do {
            let curr_doing_seat = this.curr_doing_seat;
            if (curr_doing_seat == -1) {
                curr_doing_seat = utils.random(0, 2);
            }
            let idx = curr_doing_seat + 1;
            if (idx >= this.players.length) {
                idx = 0;
            }
            return idx;
        } while (true);
    }
    strip() {
        return {
            nid: this.nid,
            sceneId: this.sceneId,
            roomId: this.roomId,
            players: this.players.map(pl => pl && pl.strip()),
            status: this.status,
            lastWinIdx: this.lastWinIdx,
            curr_doing_seat: this.curr_doing_seat,
            lowFen: this.lowFen,
            lowBet: this.lowBet
        };
    }
    battle_kickNoOnline() {
        const offLinePlayers = [];
        for (const pl of this.players) {
            if (!pl)
                continue;
            if (!pl.onLine)
                landMgr_1.default.removePlayer(pl);
            offLinePlayers.push(pl);
            this.kickOutMessage(pl.uid);
            landMgr_1.default.removePlayerSeat(pl.uid);
            this.players[pl.seat] = null;
        }
        this.kickingPlayer(pinus_1.pinus.app.getServerId(), offLinePlayers);
    }
    getJiPaiQi(uid) {
        let fillCards = [0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1];
        for (const pl of this.players) {
            let cards = land_Logic.delCardList(pl.cards.map(m => m), pl.cardList.map(m => m));
            if (pl.uid == uid) {
                cards = pl.cards.map(c => c);
            }
            for (const card of cards) {
                fillCards[land_Logic.getCardValue(card)]--;
            }
        }
        return fillCards;
    }
    getOffLineData(playerInfo) {
        let arr = [];
        let mingCardPlayer = [];
        for (const pl of this.players) {
            if (!!pl) {
                arr.push({
                    seat: pl.seat,
                    len: pl.cardList.length,
                    trusteeshipType: pl.trusteeshipType
                });
                if (pl.isMing) {
                    mingCardPlayer.push({ uid: pl.uid, seat: pl.seat, cards: pl.cardList });
                }
            }
        }
        const opts = {
            overCards: playerInfo.cardList,
            publicCards: this.publicCards,
            shoupaiLen: arr,
            curr_doing_seat: this.curr_doing_seat,
            land_seat: this.land_seat,
            status: this.status,
            lastDealPlayer: this.lastDealPlayer,
            mingCardPlayer: mingCardPlayer,
            jiaofen: {
                points: this.points,
                seat: this.land_seat
            },
            notices: this.tishi(playerInfo),
            countdown: this.getWaitTime(),
            JiPaiQi: this.status != "INWAIT" ? this.getJiPaiQi(playerInfo.uid) : []
        };
        return opts;
    }
}
exports.default = landRoom;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZFJvb20uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9sYW5kL2xpYi9sYW5kUm9vbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlDQUE4QjtBQUM5QixtRUFBb0U7QUFDcEUsOENBQStDO0FBRS9DLDJDQUE0QztBQUM1Qyw2Q0FBc0M7QUFDdEMsdUVBQW9FO0FBR3BFLGtEQUFzRDtBQUN0RCx1RUFBb0U7QUFDcEUsNENBQTREO0FBRTVELE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQztBQUV2QixNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUM7QUFPekIsTUFBcUIsUUFBUyxTQUFRLHVCQUFzQjtJQWlEeEQsWUFBWSxJQUFTO1FBQ2pCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQTVDaEIsV0FBTSxHQUFnRSxRQUFRLENBQUM7UUFFL0Usb0JBQWUsR0FBVyxDQUFDLENBQUMsQ0FBQztRQUU3QixlQUFVLEdBQVcsQ0FBQyxDQUFDLENBQUM7UUFFeEIsaUJBQVksR0FBVyxDQUFDLENBQUM7UUFFekIsa0JBQWEsR0FBVyxDQUFDLENBQUM7UUFFMUIsWUFBTyxHQUFVLEVBQUUsQ0FBQztRQUVwQixnQkFBVyxHQUFpQixJQUFJLENBQUM7UUFFakMsZUFBVSxHQUFHLENBQUMsQ0FBQztRQUVmLG1CQUFjLEdBQW9CLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFFekQsY0FBUyxHQUFXLENBQUMsQ0FBQyxDQUFDO1FBRXZCLFdBQU0sR0FBVyxDQUFDLENBQUM7UUFFbkIsZ0JBQVcsR0FBYSxFQUFFLENBQUM7UUFHM0IsV0FBTSxHQUFXLENBQUMsQ0FBQztRQUVuQixhQUFRLEdBQVcsQ0FBQyxDQUFDO1FBRXJCLG9CQUFlLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLGdCQUFXLEdBQWlCLElBQUksQ0FBQztRQUVqQyxpQkFBWSxHQUFpQixJQUFJLENB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