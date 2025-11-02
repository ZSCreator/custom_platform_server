import RummyPlayerImpl from './RummyPlayerImpl';
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import { getLogger } from 'pinus-logger';
import { pinus } from 'pinus';
import * as RummyConst from './RummyConst';
import { robotCardsToCombination } from '../robot/cardTypeUtils';
import * as RummyLogic from './RummyLogic';
import createPlayerRecordService from '../../../common/dao/RecordGeneralManager';
import { RummyRoomManager } from "./RummyRoomManager";
import Control from "./control";
import { RoleEnum } from "../../../common/constant/player/RoleEnum";
import utils = require('../../../utils');
import MessageService = require('../../../services/MessageService');
const RummyLogger = getLogger('server_out', __filename);
/** 准备中  */
let READY = { name: 'READY', time: 5 };
/** 打牌阶段 */
let PLAY_CARD = { name: 'PLAY_CARD', time: 10000000000 };
/** 有人点击胡牌了，需要人整理牌 */
let FINISH_CARD = { name: 'FINISH_CARD', time: 15 };
/** 派奖中 */
let SEND_AWARD = { name: 'SEND_AWARD', time: 10 };


const CC_DEBUG = false;
/**
 * Rummy - 游戏房间
 */
export class RummyRoomImpl extends SystemRoom<RummyPlayerImpl> {
    entryCond: number;
    /**几幅牌 */
    /**状态 BETTING.下注阶段 OPEN_AWARD.开奖阶段 SEND_AWARD.结算中 */
    status: 'INWAIT' | 'READY' | 'PLAY_CARD' | 'FINISH_CARD' | 'SEND_AWARD' | 'END' = 'INWAIT';
    /**记录最后一次的倒计时 时间 */
    lastCountdownTime: number = 0;
    /**看牌的倒计时 */
    lookCardLastCountdownTime: number = 0;
    /** 记录两副牌 */
    cards: number[] = [];
    /**记录两副牌得底牌 */
    pokerList: number[] = [];
    /**记录丢牌的记录 */
    lostCards: number[] = [];
    /**记录该哪个玩家发话 */
    whichSet: number;
    /**记录leftCard */
    leftCard: number;
    /**看牌的定时器 */
    getCardTime: NodeJS.Timer = null;
    /**流程的定时器 */
    runInterval: NodeJS.Timer = null;
    /**看牌的时间 */
    lookTime: number;
    /**变牌 */
    changeCard: number;
    /**第几回合 */
    round: number;
    /** 变牌的数组 */
    changeCardList: number[] = [];
    /**房间的基本点数 */
    roomPoint: number;
    /**第一张翻的牌 */
    firstCard: number;
    /**胡牌玩家uid */
    shawUid: string;
    countdown: number;
    /**另外一个玩家是否整理完毕 */
    otherPlayerCardsList: boolean;
    /**该局是否已经结算 */
    isSendAward: boolean;
    players: RummyPlayerImpl[] = new Array(2).fill(null);// 玩家列表;;
    roomManager: RummyRoomManager;

    // 调控逻辑
    backendServerId: string;
    whichOneStart: number;
    startTime: number;
    endTime: number;
    playerLength: number = 0;
    lowBet: number;
    winPlayer: number = 0;
    controlNum: number = 0;  //每局开始的时候获取到的调控值
    controlLogic: Control = new Control({ room: this });

    constructor(opts: any, roomManager: RummyRoomManager) {
        super(opts);
        this.roomManager = roomManager;
        this.backendServerId = pinus.app.getServerId();
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

    /**
     * 房间关闭
     */
    close(): void {
        clearInterval(this.getCardTime);
        clearInterval(this.runInterval);
        this.sendRoomCloseMessage();
        this.roomManager = null;
        // this.players = [];
    }

    /**添加一个玩家 */
    addPlayerInRoom(dbplayer: RummyPlayerImpl) {
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
        if (this.isFull()) return false;
        const idxs: number[] = [];
        this.players.forEach((m, i) => !m && idxs.push(i));//空位置压入数组
        // 数组中随机一个位置
        const i = idxs[utils.random(0, idxs.length - 1)];
        dbplayer.playerReady = true;
        dbplayer.playerSet = i;
        this.players[i] = new RummyPlayerImpl(dbplayer);
        // 给玩家选一个空座位 空位置压入数组
        // 添加到消息通道
        this.addMessage(dbplayer);
        return true;
    }

    /**有玩家离开
     *@param isOffLine true 离线
     */
    async leave(playerInfo: RummyPlayerImpl, isOffLine: boolean) {
        if (!playerInfo || !playerInfo.uid) {
            return;
        }
        //提出消息通道
        this.kickOutMessage(playerInfo.uid);
        //玩家掉线离开
        if (isOffLine) {
            playerInfo.onLine = false;
            return;
        }
        this.players[playerInfo.playerSet] = null;
        // 更新真实玩家数量
        this.updateRealPlayersNumber();
        return;
    }


    /**获取当前状态的倒计时 时间 */
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



    /**运行游戏 */
    run() {
        console.warn("Rummy", this.sceneId, this.roomId);
        this.lastCountdownTime = Date.now();
        this.nextWhichOneStart();
        this.game_start();//初始化房间信息
    }

    //开始倒计时
    openTimer() {
        clearInterval(this.runInterval);
        this.runInterval = setInterval(() => this.update(), 1000);
    }
    //关闭定时器
    closeTimer() {
        clearInterval(this.runInterval);
    }


    // 一秒执行一次
    async update() {
        --this.countdown;
        if (this.countdown > 0) {
            return;
        }
        this.lastCountdownTime = Date.now();
        switch (this.status) {
            case PLAY_CARD.name:// 如果是打牌阶段 下个阶段就是派奖
                break;
            case FINISH_CARD.name:// 如果有玩家胡牌那么就进入整理牌型阶段
                if (!this.otherPlayerCardsList) {
                    const playerOther = this.players.find(pl => !!pl && pl.uid != this.shawUid);
                    await this.playerOtherPostCardsListForRoom(playerOther, playerOther.cardsList);
                }
                break;
            case SEND_AWARD.name:// 如果是派奖阶段，下个阶段就是准备阶段
                await this.finally();
                break;
            case READY.name:   // 如果是准备阶段  等待2秒开始发牌
                //在准备接断的时候就要判断是哪个玩家赢，根据调控接口来判断是那个玩家赢
                await this.playCard();
                break;
        }
    }

    async control() {
        const control = await this.controlLogic.runControl();
        const robotPlayers = this.players.filter(p => p.isRobot === RoleEnum.ROBOT);
        if (robotPlayers.length === 1 && control === 0) {
            this.controlNum = 0;
        } else if (robotPlayers.length === 2 || robotPlayers.length === 0) {
            return;
        } else {
            this.controlNum = control;
        }
        // const control  = - 100 ;
        this.controlNum = control;
        let random = utils.random(0, 100);
        if (random < (50 - Math.floor(control / 2))) {
            //如果随机值小于 maxLength ，就说明这局玩家赢，负责就是玩家输
            this.winPlayer = 1;   //赢家是真人
        } else {
            this.winPlayer = 2;  //赢家是机器人
        }
        this.players.filter(p => p.isRobot === RoleEnum.REAL_PLAYER).forEach(p => p.setControlType(this.controlLogic.controlType));
    }

    //结束过后
    async finally() {
        // this.status = 'INWAIT';
        // this.isSendAward = false;
        this.closeTimer();
        this.closeCardTime();
        await this.battle_kickNoOnline();
        this.Initialization();
    }

    Initialization() {
        //同时把状态改成NONE
        this.status = 'INWAIT';
        this.isSendAward = false;
        this.updateRoundId();
        // 取消定时器
        this.closeTimer();
        this.closeCardTime();
    }

    /**
     * 下一把从哪个位置开始
     *  随机哪个位置先说话
     */
    nextWhichOneStart() {
        this.whichOneStart = utils.random(0, 1);
    }
    /**初始化 */
    async game_start() {
        this.countdown = READY.time;
        this.status = "READY";
        this.round = 0;
        this.lostCards = [];
        this.whichSet = -1;
        //检查玩家是否金币足够
        this.players.forEach(pl => !!pl && pl.initGame(this.lowBet));
        this.otherPlayerCardsList = false;
        this.startTime = Date.now();
        // this.cards = Rummy_logic.shuffle();
        // 开启定时器
        this.openTimer();
        //加入调控
        await this.control();

        this.channelIsPlayer('Rummy_READY', {
            countdown: this.countdown,
            status: this.status,
        });
    }

    /** 发牌 */
    async playCard() {
        this.countdown = PLAY_CARD.time;
        this.status = 'PLAY_CARD';
        //开始发牌
        const changeCard = RummyLogic.getChangeCard();  //获取变牌
        const changeCardList = RummyLogic.getOtherChangeCard(changeCard); //获取变牌的数组
        let robotCards = null;
        let pokerList = null;
        let firstCard = null;
        let cardTwo = null;
        let cardOne = null;
        //如果有机器人的情况要给机器人一定的好牌
        if (this.winPlayer != 0) {
            const result: { robotCards, playerCards, pokerList, firstCard, finallyCard } = RummyLogic.getRobotAndPlayerCards(this.winPlayer, changeCard, changeCardList);
            robotCards = result.robotCards;
            pokerList = result.pokerList;
            firstCard = result.firstCard;
            cardTwo = result.playerCards;

            this.changeCard = result.finallyCard;
        } else {   //没机器人就完全随机
            const result: { playerCards_1, playerCards_2, pokerList, firstCard } = RummyLogic.getPlayerCards();
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
                } else {
                    pl.cards = cardTwo;
                }
            } else if (robotCards == null) {
                if (pl.playerSet == 0) {
                    pl.cards = cardOne;
                } else {
                    pl.cards = cardTwo;
                }
            }
            pl.playerReady = false;  //开始发牌了，玩家的准备状态就变成false;
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
            // 对牌进行整理
            pl.cardsList = RummyLogic.cardListType(pl.cards, this.changeCardList);
            member && MessageService.pushMessageByUids('Rummy_Start_FAPAI', opts, member);
            const { needCards } = robotCardsToCombination(pl.cards, this.changeCardList);
            pl.needCards = needCards;
        }
        this.whichSet = this.whichOneStart;  // 1 号位置发言
        await this.whichOne();
    }

    /**
     * 开启看牌定时器
     */
    openCardTime() {
        clearInterval(this.getCardTime);
        this.getCardTime = setInterval(() => this.lookTimeupdate(), 1000);
    }

    /**
     * 关闭看牌定时器
     */
    closeCardTime() {
        clearInterval(this.getCardTime);
    }

    // 一秒执行一次
    async lookTimeupdate() {
        --this.lookTime;
        if (this.lookTime > 0) {
            return;
        }
        //如果这个时候还没有决定好丢牌那么就从没有组好的梯队里面选一张 ------------
        //判断这个人是否要过牌，没要过牌直接要牌弃牌---同一张，如果要了牌然后没丢牌,时间到了还是同一张牌
        if (this.lookTime < 1) {
            //同时发话的这个玩家没有要牌和丢牌的话就需要丢牌
            let player = this.players.find(pl => !!pl && pl.playerSet == this.whichSet);
            if (player.getCard == null && player.isGetCard == false) {  //没有要牌也没有弃牌
                await this.getPokerListCard(player);  //点击要牌
                this.lookTime = 5;
            } else if (player.getCard != null && player.isGetCard == true) {
                await this.lostCard(player, player.getCard, player.cardsList, player.point, true);            //然后再弃牌
            } else {
                await this.whichOne();
            }
        }
    }

    /**
     * 该谁发话进行通知
     */
    async whichOne() {
        if (this.whichSet == this.whichOneStart) {
            this.round += 1;     //  每次 0 号位置发言 回合+1
        };
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
    /**
     * 丢弃牌 , 丢牌的同时，更新玩家身上的牌和牌组合
     */
    async lostCard(player: RummyPlayerImpl, card: number, cardsList: any, point: number, isSystem: boolean) {
        let index = player.cards.indexOf(card);
        //验证发过来cardsList 是否是和cards 一样
        //如果牌不对就将上轮的牌发给他
        let list = [];
        for (let key of cardsList) {
            list = list.concat(key.value);
        }
        if (player.isRobot == 0 && isSystem == false && list.length != 13) {
            let index2 = player.cards.indexOf(player.getCard);
            player.cards.splice(index2, 1);
            let index3 = player.cardsList[player.cardsList.length - 1].value.indexOf(player.getCard);
            player.cardsList[player.cardsList.length - 1].value.splice(index3, 1);
            //通知前端修正牌
            const member = this.channel.getMember(player.uid);
            member && MessageService.pushMessageByUids('Rummy_AMEND_CARD', { cardsList: player.cardsList, }, member);
            this.lostCards.push(player.getCard);
        } else
            if (player.isRobot == 0) {
                CC_DEBUG && console.warn("真实玩家得牌:", player.cards, "组合:", player.cardsList, "需要的牌:", player.needCards, "丢掉的牌：", card, "回合:", this.round)
            }
        if (isSystem) {
            let index3 = player.cardsList[player.cardsList.length - 1].value.indexOf(player.getCard);
            player.cardsList[player.cardsList.length - 1].value.splice(index3, 1);
            player.cards.splice(index, 1);
            this.lostCards.push(card);
        } else {
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
            isSystem: isSystem,   //判断是否系统自己出牌
        });
        //丢完牌过后更新玩家需要得牌
        const { needCards } = robotCardsToCombination(player.cards, this.changeCardList);
        player.needCards = needCards;
        //丢牌完过后就要换人说话
        if (this.whichSet == 0) {
            this.whichSet = 1;
        } else {
            this.whichSet = 0;
        }
        await this.whichOne();
        return this.lostCards;
    }

    /**
     * 点击要牌 从废牌里面获取最上面一张
     */
    async playerGetlostCard(player: RummyPlayerImpl) {
        let card = this.lostCards[this.lostCards.length - 1];
        this.lostCards.splice(this.lostCards.length - 1, 1);
        if (player.isRobot == 0) {
            CC_DEBUG && console.warn("真实玩家得牌:", player.cards, "组合:", player.cardsList, "需要的牌:", player.needCards, "丢掉的牌：", card, "回合:", this.round)
        }
        //加入到玩家cards 和牌组里面
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

    /**
     * 点击要牌 从牌组里面获取最上面一张   将要的牌加入玩家身上的牌组
     */
    async getPokerListCard(player: RummyPlayerImpl) {

        const { card, pokerList } = RummyLogic.getCardForPoker(this.pokerList, player.needCards, this.winPlayer, player.isRobot, this.round, this.changeCardList, this.controlNum);
        if (player.isRobot == 0) {
            CC_DEBUG && console.warn("玩家点击要牌从牌组里面拿牌:", player.isRobot, "card:", card, "cards:", player.cards, "cardList:", player.cardsList)
        }

        this.pokerList = pokerList;
        //加入到玩家cards 和牌组里面
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
                }
                member && MessageService.pushMessageByUids('Rummy_GET_CARD', opts, member);
            })
        }
        return card;
    }


    /**
     * 通知另外一个玩家有人胡牌了，需要自己整理牌型
     */
    async noticePlayerShaw(player: RummyPlayerImpl) {
        this.status = 'FINISH_CARD';
        this.countdown = FINISH_CARD.time;
        this.channelIsPlayer('Rummy_SHAW', {
            playerSet: player.playerSet,
            nickname: player.nickname,
            countdown: this.countdown,
        });
    }

    /**
     * 另外一个玩家点击确定整理完毕
     */
    async playerOtherPostCardsListForRoom(playerOther: RummyPlayerImpl, cardsList) {
        if (!this.otherPlayerCardsList) {
            //先判定前端发过来的牌跟服务器是不是一样，如果不一样，计算点数就根据服务器玩家身上的进行组合
            this.otherPlayerCardsList = true;
            let list = [];
            for (let item of cardsList) {
                list = list.concat(item.value);
            }
            let playerCard = playerOther.cards.sort((a, b) => a - b);  //服务器玩家身上的牌数组排序
            list.sort((a, b) => a - b);    //数组排序
            if (playerCard.toString() != list.toString()) {
                cardsList = playerOther.cardsList;
            } else {
                playerOther.cardsList = cardsList;
            }
            const point = RummyLogic.calculatePlayerPoint(cardsList, this.changeCardList);
            playerOther.point = point;
            let shawPlayer = this.players.find(player => player.uid == this.shawUid);
            if (shawPlayer.point == 0) {
                shawPlayer.profit = Math.floor(point * this.roomPoint * 100) / 100;
                playerOther.profit = - Math.floor(point * this.roomPoint * 100) / 100;
            } else {
                shawPlayer.profit = - Math.floor(shawPlayer.point * this.roomPoint * 100) / 100;
                playerOther.profit = Math.floor(shawPlayer.point * this.roomPoint * 100) / 100;
            }
        }
        //如果玩家整理完毕过后就调用派奖方法
        await this.sendAward();
        return true;
    }
    /**
     * 胡牌计算分值
     */
    async shaw(player: RummyPlayerImpl, cardsList: any, card: number) {
        let list = [];
        this.lostCards.push(card);
        //改变玩家是否获取牌的状态
        player.cardsList = cardsList;
        player.getCard = null;
        player.isGetCard = false;
        for (let item of cardsList) {
            list = list.concat(item.value);
        }
        //需要将card的弃牌丢掉
        let index = player.cards.indexOf(card);
        player.cards.splice(index, 1);
        let playerCard = player.cards.sort((a, b) => a - b);  //服务器玩家身上的牌数组排序
        list.sort((a, b) => a - b);    //数组排序
        if (playerCard.toString() != list.toString()) {
            cardsList = player.cardsList;
        } else {
            player.cardsList = cardsList;
        }
        const point = RummyLogic.calculatePlayerPoint(cardsList, this.changeCardList);
        player.point = point;
        this.shawUid = player.uid;
        this.lostCards.push(card);
        //通知另外一个该玩家要胡牌了
        await this.noticePlayerShaw(player);
        // this.closeCardTime();
    }

    /**
     * 弃牌
     */
    async grop(player: RummyPlayerImpl) {
        let playerOther = this.players.find(x => x.playerSet != player.playerSet);
        player.profit = - player.gropPoint;
        player.point = 80; //赢家的这个gropPoint = 0
        player.isLose = true; //确认玩家弃牌状态
        playerOther.profit = player.gropPoint;
        playerOther.point = 0;
        //再进行派奖
        await this.sendAward();

    }


    /**派奖中 */
    async sendAward() {
        if (this.isSendAward == true) {
            return;
        }
        //开过奖,重置这个属性
        this.isSendAward = true;
        //派奖的时候关闭看牌定时器
        this.closeCardTime();
        // 压缩开奖结果
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
        // 执行加钱 - 在线的
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

    /**更新玩家金币 */
    updateGold(list) {
        return new Promise((resolve, reject) => {
            /**
             * 添加游戏记录
             */
            let result = {
                list: list,
                round: this.round,
                lostCards: this.lostCards,
                roomPoint: this.roomPoint,
                winPlayer: this.winPlayer,
                controlNum: this.controlNum,
            };
            //只对有下注和在线的玩家结算
            Promise.all(this.players.map(async (pl) => {
                try {
                    // 添加游戏记录以及更新玩家金币
                    const res = await createPlayerRecordService()
                        .setPlayerBaseInfo(pl.uid, false, pl.isRobot, pl.gold)
                        .setGameInfo(this.nid, this.sceneId, this.roomId)
                        .setGameRoundInfo(this.roundId, -1, -1)
                        .setGameRecordInfo(Math.abs(pl.profit), Math.abs(pl.profit), pl.profit, false)
                        .setGameRecordLivesResult(result)
                        .sendToDB(1);
                    pl.gold = res.gold;
                    pl.profit = res.playerRealWin;

                    //发送走马灯
                    if (pl.profit > 100000) {
                        this.sendMaleScreen(pl);
                    }

                } catch (error) {
                    RummyLogger.error('Rummy结算日志记录失败', error);
                }
            })).then(data => {
                return resolve({});
            });
        });
    }


    /**
     * 发送走马灯
     */
    sendMaleScreen(player: RummyPlayerImpl) {
        MessageService.sendBigWinNotice(this.nid, player.nickname, player.profit, player.isRobot, player.headurl);
    }

    /**
     * 获取房间相关信息
     */
    strip() {
        let data = null;
        if (this.status == "SEND_AWARD" || this.status == "END") {
            let result = this.players.map(pl => pl.result());
            data = {
                changeCard: this.changeCard,
                result: result,
                countdown: this.countdown
            }
        }
        let playerList = [];
        for (let player of this.players) {
            player && playerList.push(player.strip())
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



    /**踢掉离线玩家以及金币不足得玩家*/
    async battle_kickNoOnline() {
        const offLinePlayers: RummyPlayerImpl[] = [];
        for (const pl of this.players) {
            if (!pl) continue;
            // if (pl.gold == 0 || pl.isRobot == 2) {
            // 不在线移除玩家 在线则不移除 因为还在这个场中
            if (!pl.onLine) this.roomManager.removePlayer(pl);
            // await this.leave(pl, false);
            offLinePlayers.push(pl);
            this.kickOutMessage(pl.uid);
            this.players[pl.playerSet] = null;
            this.roomManager.removePlayerSeat(pl.uid);
        }
        //更新数据（前端需要切换场景）
        await this.kickingPlayer(pinus.app.getServerId(), offLinePlayers);
        //将玩家清空
    }
}