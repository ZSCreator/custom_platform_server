"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RummyRoomImpl = void 0;
const RummyPlayerImpl_1 = require("./RummyPlayerImpl");
const SystemRoom_1 = require("../../../common/pojo/entity/SystemRoom");
const pinus_logger_1 = require("pinus-logger");
const pinus_1 = require("pinus");
const RummyConst = require("./RummyConst");
const cardTypeUtils_1 = require("../robot/cardTypeUtils");
const RummyLogic = require("./RummyLogic");
const RecordGeneralManager_1 = require("../../../common/dao/RecordGeneralManager");
const control_1 = require("./control");
const RoleEnum_1 = require("../../../common/constant/player/RoleEnum");
const utils = require("../../../utils");
const MessageService = require("../../../services/MessageService");
const RummyLogger = (0, pinus_logger_1.getLogger)('server_out', __filename);
let READY = { name: 'READY', time: 5 };
let PLAY_CARD = { name: 'PLAY_CARD', time: 10000000000 };
let FINISH_CARD = { name: 'FINISH_CARD', time: 15 };
let SEND_AWARD = { name: 'SEND_AWARD', time: 10 };
const CC_DEBUG = false;
class RummyRoomImpl extends SystemRoom_1.SystemRoom {
    constructor(opts, roomManager) {
        super(opts);
        this.status = 'INWAIT';
        this.lastCountdownTime = 0;
        this.lookCardLastCountdownTime = 0;
        this.cards = [];
        this.pokerList = [];
        this.lostCards = [];
        this.getCardTime = null;
        this.runInterval = null;
        this.changeCardList = [];
        this.players = new Array(2).fill(null);
        this.playerLength = 0;
        this.winPlayer = 0;
        this.controlNum = 0;
        this.controlLogic = new control_1.default({ room: this });
        this.roomManager = roomManager;
        this.backendServerId = pinus_1.pinus.app.getServerId();
        this.entryCond = opts.entryCond;
        this.lowBet = opts.lowBet;
        this.pokerList = [];
        this.lostCards = [];
        this.cards = [];
        this.whichSet = -1;
        this.lookTime = RummyConst.LookCardTime.TIME;
        this.changeCard = null;
        this.round = 0;
        this.changeCardList = [];
        this.roomPoint = this.lowBet;
        this.firstCard = null;
        this.shawUid = null;
        this.otherPlayerCardsList = false;
        this.isSendAward = false;
        this.whichOneStart = 0;
        this.winPlayer = 0;
        this.controlNum = 0;
        this.Initialization();
    }
    close() {
        clearInterval(this.getCardTime);
        clearInterval(this.runInterval);
        this.sendRoomCloseMessage();
        this.roomManager = null;
    }
    addPlayerInRoom(dbplayer) {
        const robotPlayerList = this.players.filter(pl => pl && pl.isRobot == 2);
        if (robotPlayerList.length == 1 && dbplayer && dbplayer.isRobot == 2) {
            return false;
        }
        let playerInfo = this.getPlayer(dbplayer.uid);
        if (playerInfo) {
            playerInfo.sid = dbplayer.sid;
            this.offLineRecover(playerInfo);
            return true;
        }
        if (this.isFull())
            return false;
        const idxs = [];
        this.players.forEach((m, i) => !m && idxs.push(i));
        const i = idxs[utils.random(0, idxs.length - 1)];
        dbplayer.playerReady = true;
        dbplayer.playerSet = i;
        this.players[i] = new RummyPlayerImpl_1.default(dbplayer);
        this.addMessage(dbplayer);
        return true;
    }
    async leave(playerInfo, isOffLine) {
        if (!playerInfo || !playerInfo.uid) {
            return;
        }
        this.kickOutMessage(playerInfo.uid);
        if (isOffLine) {
            playerInfo.onLine = false;
            return;
        }
        this.players[playerInfo.playerSet] = null;
        this.updateRealPlayersNumber();
        return;
    }
    getCountdownTime() {
        const time = Date.now() - this.lastCountdownTime;
        if (this.status === READY.name)
            return Math.max((READY.time) * 1000 - time, 500);
        if (this.status === PLAY_CARD.name)
            return Math.max((RummyConst.LookCardTime.TIME) * 1000 - time, 500);
        if (this.status === SEND_AWARD.name)
            return Math.max((SEND_AWARD.time) * 1000 - time, 500);
        return 0;
    }
    run() {
        console.warn("Rummy", this.sceneId, this.roomId);
        this.lastCountdownTime = Date.now();
        this.nextWhichOneStart();
        this.game_start();
    }
    openTimer() {
        clearInterval(this.runInterval);
        this.runInterval = setInterval(() => this.update(), 1000);
    }
    closeTimer() {
        clearInterval(this.runInterval);
    }
    async update() {
        --this.countdown;
        if (this.countdown > 0) {
            return;
        }
        this.lastCountdownTime = Date.now();
        switch (this.status) {
            case PLAY_CARD.name:
                break;
            case FINISH_CARD.name:
                if (!this.otherPlayerCardsList) {
                    const playerOther = this.players.find(pl => !!pl && pl.uid != this.shawUid);
                    await this.playerOtherPostCardsListForRoom(playerOther, playerOther.cardsList);
                }
                break;
            case SEND_AWARD.name:
                await this.finally();
                break;
            case READY.name:
                await this.playCard();
                break;
        }
    }
    async control() {
        const control = await this.controlLogic.runControl();
        const robotPlayers = this.players.filter(p => p.isRobot === RoleEnum_1.RoleEnum.ROBOT);
        if (robotPlayers.length === 1 && control === 0) {
            this.controlNum = 0;
        }
        else if (robotPlayers.length === 2 || robotPlayers.length === 0) {
            return;
        }
        else {
            this.controlNum = control;
        }
        this.controlNum = control;
        let random = utils.random(0, 100);
        if (random < (50 - Math.floor(control / 2))) {
            this.winPlayer = 1;
        }
        else {
            this.winPlayer = 2;
        }
        this.players.filter(p => p.isRobot === RoleEnum_1.RoleEnum.REAL_PLAYER).forEach(p => p.setControlType(this.controlLogic.controlType));
    }
    async finally() {
        this.closeTimer();
        this.closeCardTime();
        await this.battle_kickNoOnline();
        this.Initialization();
    }
    Initialization() {
        this.status = 'INWAIT';
        this.isSendAward = false;
        this.updateRoundId();
        this.closeTimer();
        this.closeCardTime();
    }
    nextWhichOneStart() {
        this.whichOneStart = utils.random(0, 1);
    }
    async game_start() {
        this.countdown = READY.time;
        this.status = "READY";
        this.round = 0;
        this.lostCards = [];
        this.whichSet = -1;
        this.players.forEach(pl => !!pl && pl.initGame(this.lowBet));
        this.otherPlayerCardsList = false;
        this.startTime = Date.now();
        this.openTimer();
        await this.control();
        this.channelIsPlayer('Rummy_READY', {
            countdown: this.countdown,
            status: this.status,
        });
    }
    async playCard() {
        this.countdown = PLAY_CARD.time;
        this.status = 'PLAY_CARD';
        const changeCard = RummyLogic.getChangeCard();
        const changeCardList = RummyLogic.getOtherChangeCard(changeCard);
        let robotCards = null;
        let pokerList = null;
        let firstCard = null;
        let cardTwo = null;
        let cardOne = null;
        if (this.winPlayer != 0) {
            const result = RummyLogic.getRobotAndPlayerCards(this.winPlayer, changeCard, changeCardList);
            robotCards = result.robotCards;
            pokerList = result.pokerList;
            firstCard = result.firstCard;
            cardTwo = result.playerCards;
            this.changeCard = result.finallyCard;
        }
        else {
            const result = RummyLogic.getPlayerCards();
            cardOne = result.playerCards_1;
            pokerList = result.pokerList;
            firstCard = result.firstCard;
            cardTwo = result.playerCards_2;
            this.changeCard = changeCard;
        }
        this.pokerList = pokerList;
        this.changeCardList = changeCardList;
        this.firstCard = firstCard;
        this.lostCards.push(firstCard);
        for (let pl of this.players) {
            if (robotCards != null) {
                if (pl.isRobot == 2) {
                    pl.cards = robotCards;
                }
                else {
                    pl.cards = cardTwo;
                }
            }
            else if (robotCards == null) {
                if (pl.playerSet == 0) {
                    pl.cards = cardOne;
                }
                else {
                    pl.cards = cardTwo;
                }
            }
            pl.playerReady = false;
            const member = this.channel.getMember(pl.uid);
            const opts = {
                cards: pl.cards,
                firstCard: firstCard,
                changeCard: this.changeCard,
                changeCardList: this.changeCardList,
                cardsList: pl.cardsList,
                status: 'PLAY_CARD',
                lostCards: this.lostCards,
            };
            if (pl.isRobot == 2) {
                opts["winPlayer"] = this.winPlayer;
            }
            pl.cardsList = RummyLogic.cardListType(pl.cards, this.changeCardList);
            member && MessageService.pushMessageByUids('Rummy_Start_FAPAI', opts, member);
            const { needCards } = (0, cardTypeUtils_1.robotCardsToCombination)(pl.cards, this.changeCardList);
            pl.needCards = needCards;
        }
        this.whichSet = this.whichOneStart;
        await this.whichOne();
    }
    openCardTime() {
        clearInterval(this.getCardTime);
        this.getCardTime = setInterval(() => this.lookTimeupdate(), 1000);
    }
    closeCardTime() {
        clearInterval(this.getCardTime);
    }
    async lookTimeupdate() {
        --this.lookTime;
        if (this.lookTime > 0) {
            return;
        }
        if (this.lookTime < 1) {
            let player = this.players.find(pl => !!pl && pl.playerSet == this.whichSet);
            if (player.getCard == null && player.isGetCard == false) {
                await this.getPokerListCard(player);
                this.lookTime = 5;
            }
            else if (player.getCard != null && player.isGetCard == true) {
                await this.lostCard(player, player.getCard, player.cardsList, player.point, true);
            }
            else {
                await this.whichOne();
            }
        }
    }
    async whichOne() {
        if (this.whichSet == this.whichOneStart) {
            this.round += 1;
        }
        ;
        if (this.whichSet == this.whichOneStart && this.round == 2) {
            this.players.map(player => player.gropPoint = this.lowBet * RummyConst.PLAYER_LOSE.TWO * RummyConst.PLAYER_POINT.VALUE);
        }
        let two = this.lowBet * RummyConst.PLAYER_LOSE.TWO * RummyConst.PLAYER_POINT.VALUE;
        let one = this.lowBet * RummyConst.PLAYER_LOSE.ONE * RummyConst.PLAYER_POINT.VALUE;
        this.lookTime = RummyConst.LookCardTime.TIME;
        this.channelIsPlayer('Rummy_Play', {
            whichSet: this.whichSet,
            round: this.round,
            gropPoint: this.round == 1 ? one : two,
            lookTime: this.lookTime,
        });
        this.openCardTime();
    }
    async lostCard(player, card, cardsList, point, isSystem) {
        let index = player.cards.indexOf(card);
        let list = [];
        for (let key of cardsList) {
            list = list.concat(key.value);
        }
        if (player.isRobot == 0 && isSystem == false && list.length != 13) {
            let index2 = player.cards.indexOf(player.getCard);
            player.cards.splice(index2, 1);
            let index3 = player.cardsList[player.cardsList.length - 1].value.indexOf(player.getCard);
            player.cardsList[player.cardsList.length - 1].value.splice(index3, 1);
            const member = this.channel.getMember(player.uid);
            member && MessageService.pushMessageByUids('Rummy_AMEND_CARD', { cardsList: player.cardsList, }, member);
            this.lostCards.push(player.getCard);
        }
        else if (player.isRobot == 0) {
            CC_DEBUG && console.warn("真实玩家得牌:", player.cards, "组合:", player.cardsList, "需要的牌:", player.needCards, "丢掉的牌：", card, "回合:", this.round);
        }
        if (isSystem) {
            let index3 = player.cardsList[player.cardsList.length - 1].value.indexOf(player.getCard);
            player.cardsList[player.cardsList.length - 1].value.splice(index3, 1);
            player.cards.splice(index, 1);
            this.lostCards.push(card);
        }
        else {
            player.cards.splice(index, 1);
            player.cardsList = cardsList;
            this.lostCards.push(card);
        }
        player.point = point;
        player.getCard = null;
        player.isGetCard = false;
        this.firstCard = null;
        this.channelIsPlayer('Rummy_LOST_CARD', {
            card: card,
            lostCards: this.lostCards,
            whichSet: this.whichSet,
            isSystem: isSystem,
        });
        const { needCards } = (0, cardTypeUtils_1.robotCardsToCombination)(player.cards, this.changeCardList);
        player.needCards = needCards;
        if (this.whichSet == 0) {
            this.whichSet = 1;
        }
        else {
            this.whichSet = 0;
        }
        await this.whichOne();
        return this.lostCards;
    }
    async playerGetlostCard(player) {
        let card = this.lostCards[this.lostCards.length - 1];
        this.lostCards.splice(this.lostCards.length - 1, 1);
        if (player.isRobot == 0) {
            CC_DEBUG && console.warn("真实玩家得牌:", player.cards, "组合:", player.cardsList, "需要的牌:", player.needCards, "丢掉的牌：", card, "回合:", this.round);
        }
        player.cards.push(card);
        player.cardsList[player.cardsList.length - 1].value.push(card);
        player.isGetCard = true;
        player.getCard = card;
        this.channelIsPlayer('Rummy_GET_CARD', {
            card: card,
            whichSet: this.whichSet,
            lostCards: this.lostCards,
            type: RummyConst.PUKE_TYPE.LOST,
        });
        return card;
    }
    async getPokerListCard(player) {
        const { card, pokerList } = RummyLogic.getCardForPoker(this.pokerList, player.needCards, this.winPlayer, player.isRobot, this.round, this.changeCardList, this.controlNum);
        if (player.isRobot == 0) {
            CC_DEBUG && console.warn("玩家点击要牌从牌组里面拿牌:", player.isRobot, "card:", card, "cards:", player.cards, "cardList:", player.cardsList);
        }
        this.pokerList = pokerList;
        player.cards.push(card);
        player.cardsList[player.cardsList.length - 1].value.push(card);
        player.getCard = card;
        this.leftCard = card;
        player.isGetCard = true;
        if (this.isFull() == true) {
            this.players.map(pl => {
                const member = this.channel.getMember(pl.uid);
                let card1 = null;
                if (pl.uid == player.uid) {
                    card1 = card;
                }
                const opts = {
                    card: card1,
                    lostCards: this.lostCards,
                    whichSet: this.whichSet,
                    type: RummyConst.PUKE_TYPE.PUKE,
                };
                member && MessageService.pushMessageByUids('Rummy_GET_CARD', opts, member);
            });
        }
        return card;
    }
    async noticePlayerShaw(player) {
        this.status = 'FINISH_CARD';
        this.countdown = FINISH_CARD.time;
        this.channelIsPlayer('Rummy_SHAW', {
            playerSet: player.playerSet,
            nickname: player.nickname,
            countdown: this.countdown,
        });
    }
    async playerOtherPostCardsListForRoom(playerOther, cardsList) {
        if (!this.otherPlayerCardsList) {
            this.otherPlayerCardsList = true;
            let list = [];
            for (let item of cardsList) {
                list = list.concat(item.value);
            }
            let playerCard = playerOther.cards.sort((a, b) => a - b);
            list.sort((a, b) => a - b);
            if (playerCard.toString() != list.toString()) {
                cardsList = playerOther.cardsList;
            }
            else {
                playerOther.cardsList = cardsList;
            }
            const point = RummyLogic.calculatePlayerPoint(cardsList, this.changeCardList);
            playerOther.point = point;
            let shawPlayer = this.players.find(player => player.uid == this.shawUid);
            if (shawPlayer.point == 0) {
                shawPlayer.profit = Math.floor(point * this.roomPoint * 100) / 100;
                playerOther.profit = -Math.floor(point * this.roomPoint * 100) / 100;
            }
            else {
                shawPlayer.profit = -Math.floor(shawPlayer.point * this.roomPoint * 100) / 100;
                playerOther.profit = Math.floor(shawPlayer.point * this.roomPoint * 100) / 100;
            }
        }
        await this.sendAward();
        return true;
    }
    async shaw(player, cardsList, card) {
        let list = [];
        this.lostCards.push(card);
        player.cardsList = cardsList;
        player.getCard = null;
        player.isGetCard = false;
        for (let item of cardsList) {
            list = list.concat(item.value);
        }
        let index = player.cards.indexOf(card);
        player.cards.splice(index, 1);
        let playerCard = player.cards.sort((a, b) => a - b);
        list.sort((a, b) => a - b);
        if (playerCard.toString() != list.toString()) {
            cardsList = player.cardsList;
        }
        else {
            player.cardsList = cardsList;
        }
        const point = RummyLogic.calculatePlayerPoint(cardsList, this.changeCardList);
        player.point = point;
        this.shawUid = player.uid;
        this.lostCards.push(card);
        await this.noticePlayerShaw(player);
    }
    async grop(player) {
        let playerOther = this.players.find(x => x.playerSet != player.playerSet);
        player.profit = -player.gropPoint;
        player.point = 80;
        player.isLose = true;
        playerOther.profit = player.gropPoint;
        playerOther.point = 0;
        await this.sendAward();
    }
    async sendAward() {
        if (this.isSendAward == true) {
            return;
        }
        this.isSendAward = true;
        this.closeCardTime();
        this.countdown = SEND_AWARD.time;
        let list = [];
        for (let pl of this.players) {
            let info = {
                uid: pl.uid,
                gold: pl.gold,
                profit: pl.profit,
                cardsList: pl.cardsList,
                point: pl.point,
                gropPoint: pl.gropPoint,
                isRobot: pl.isRobot,
            };
            list.push(info);
        }
        await this.updateGold(list);
        this.status = 'SEND_AWARD';
        let result = this.players.map(pl => pl.result());
        this.channelIsPlayer('Rummy_SEND_AWARD', {
            changeCard: this.changeCard,
            result: result,
            countdown: this.countdown,
        });
        if (this.players.some(pl => pl && pl.isOnLine == true)) {
            await utils.delay(30 * 1000);
        }
        this.finally();
    }
    updateGold(list) {
        return new Promise((resolve, reject) => {
            let result = {
                list: list,
                round: this.round,
                lostCards: this.lostCards,
                roomPoint: this.roomPoint,
                winPlayer: this.winPlayer,
                controlNum: this.controlNum,
            };
            Promise.all(this.players.map(async (pl) => {
                try {
                    const res = await (0, RecordGeneralManager_1.default)()
                        .setPlayerBaseInfo(pl.uid, false, pl.isRobot, pl.gold)
                        .setGameInfo(this.nid, this.sceneId, this.roomId)
                        .setGameRoundInfo(this.roundId, -1, -1)
                        .setGameRecordInfo(Math.abs(pl.profit), Math.abs(pl.profit), pl.profit, false)
                        .setGameRecordLivesResult(result)
                        .sendToDB(1);
                    pl.gold = res.gold;
                    pl.profit = res.playerRealWin;
                    if (pl.profit > 100000) {
                        this.sendMaleScreen(pl);
                    }
                }
                catch (error) {
                    RummyLogger.error('Rummy结算日志记录失败', error);
                }
            })).then(data => {
                return resolve({});
            });
        });
    }
    sendMaleScreen(player) {
        MessageService.sendBigWinNotice(this.nid, player.nickname, player.profit, player.isRobot, player.headurl);
    }
    strip() {
        let data = null;
        if (this.status == "SEND_AWARD" || this.status == "END") {
            let result = this.players.map(pl => pl.result());
            data = {
                changeCard: this.changeCard,
                result: result,
                countdown: this.countdown
            };
        }
        let playerList = [];
        for (let player of this.players) {
            player && playerList.push(player.strip());
        }
        return {
            status: this.status,
            players: playerList,
            round: this.round,
            lowBet: this.lowBet,
            lookTime: this.lookTime,
            firstCard: this.firstCard,
            whichSet: this.whichSet,
            changeCard: this.changeCard,
            lostCards: this.lostCards,
            data: data,
        };
    }
    async battle_kickNoOnline() {
        const offLinePlayers = [];
        for (const pl of this.players) {
            if (!pl)
                continue;
            if (!pl.onLine)
                this.roomManager.removePlayer(pl);
            offLinePlayers.push(pl);
            this.kickOutMessage(pl.uid);
            this.players[pl.playerSet] = null;
            this.roomManager.removePlayerSeat(pl.uid);
        }
        await this.kickingPlayer(pinus_1.pinus.app.getServerId(), offLinePlayers);
    }
}
exports.RummyRoomImpl = RummyRoomImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUnVtbXlSb29tSW1wbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL1J1bW15L2xpYi9SdW1teVJvb21JbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHVEQUFnRDtBQUNoRCx1RUFBb0U7QUFDcEUsK0NBQXlDO0FBQ3pDLGlDQUE4QjtBQUM5QiwyQ0FBMkM7QUFDM0MsMERBQWlFO0FBQ2pFLDJDQUEyQztBQUMzQyxtRkFBaUY7QUFFakYsdUNBQWdDO0FBQ2hDLHVFQUFvRTtBQUNwRSx3Q0FBeUM7QUFDekMsbUVBQW9FO0FBQ3BFLE1BQU0sV0FBVyxHQUFHLElBQUEsd0JBQVMsRUFBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFFeEQsSUFBSSxLQUFLLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUV2QyxJQUFJLFNBQVMsR0FBRyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxDQUFDO0FBRXpELElBQUksV0FBVyxHQUFHLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUM7QUFFcEQsSUFBSSxVQUFVLEdBQUcsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQztBQUdsRCxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFJdkIsTUFBYSxhQUFjLFNBQVEsdUJBQTJCO0lBd0QxRCxZQUFZLElBQVMsRUFBRSxXQUE2QjtRQUNoRCxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFyRGhCLFdBQU0sR0FBNEUsUUFBUSxDQUFDO1FBRTNGLHNCQUFpQixHQUFXLENBQUMsQ0FBQztRQUU5Qiw4QkFBeUIsR0FBVyxDQUFDLENBQUM7UUFFdEMsVUFBSyxHQUFhLEVBQUUsQ0FBQztRQUVyQixjQUFTLEdBQWEsRUFBRSxD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