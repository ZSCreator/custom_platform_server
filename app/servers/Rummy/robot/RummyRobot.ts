import { BaseRobot } from "../../../common/pojo/baseClass/BaseRobot";
import * as CommonUtil from "../../../utils/lottery/commonUtil";
import { MsgRoute, RoomState } from '../lib/constants';
import * as Rummy_interface from "../../../servers/Rummy/lib/interface/Rummy_interface";
import * as cardTypeUtils from "../robot/cardTypeUtils";
import * as RummyLogic from "../lib/RummyLogic";
const CC_DEBUG = false;
/**
 * 请求路由
 */
enum RequestRoute {
    playerGetlostCard = 'Rummy.mainHandler.playerGetlostCard',         //点击要牌  从废牌里面获取
    getPokerListCard = 'Rummy.mainHandler.getPokerListCard',         //点击要牌  //从新的牌组里面获取
    lostCard = 'Rummy.mainHandler.lostCard',   //丢牌
    loaded = 'Rummy.mainHandler.loaded',   //界面加载
    grop = 'Rummy.mainHandler.grop',    //弃牌
    shaw = 'Rummy.mainHandler.shaw',    //胡牌
    playerOtherPostCardsList = 'Rummy.mainHandler.playerOtherPostCardsList',    //另外一个玩家点击确定整理完毕
    start = 'Rummy.mainHandler.start',    //游戏开始
}

/**
 * Rummy机器人
 */
export default class RummyRobot extends BaseRobot {
    playerGold: number = 0;
    /**当前轮数 */
    round: number = 0;
    /**记录玩家的位置 */
    playerSet: number = 0;
    /**j记录机器人的手牌 */
    cards: number[] = [];
    /** 记录机器人的手牌分组情况 */
    cardsList: any[] = [];
    /**该局盈利 */
    profit: number = 0;
    /**默认玩家多少point */
    point: number = 0;
    /**弃牌需要输多少金币 */
    gropPoint: number = 0;
    /**是否要过牌 */
    isGetCard: boolean = false;
    /**变牌 */
    changeCard: number;
    /**第一张牌 */
    firstCard: number;
    /**该谁发话 */
    whichSet: number;
    /**变牌的数组 */
    changeCardList: number[];
    /**弃牌的数组 */
    lostCards: number[];
    /**机器人uid */
    uid: string;
    /**房间状态 */
    status: string;
    /**记录机器人上一张牌要的什么 */
    lastCard: number;
    /** 剩余牌堆的牌 */
    pokerList: number[] = [];
    /** 是哪个身份赢 */
    winPlayer: number = 0;
    /** 需要的牌组 */
    needCards: number[] = [];
    /** 需要丢弃的cards */
    loseCards: number[] = [];
    constructor(opts) {
        super(opts);
        this.whichSet = 0;
        this.lostCards = [];
        this.status = RoomState.NONE;
    }



    //初始化机器人数据
    async finishInit() {
        this.round = 0;
        this.cards = [];
        this.cardsList = [];
        this.profit = 0;
        this.point = 0;
        this.gropPoint = 0;
        this.isGetCard = false;
        this.changeCard = null;
        this.firstCard = null;
        this.whichSet = -1;
        this.changeCardList = [];
        this.lostCards = [];
        this.status = RoomState.NONE;
        this.lastCard = null;
        this.needCards = [];
        this.loseCards = [];
    }

    /**
     * 加载
     */
    async load() {
        try {
            const loadedData: Rummy_interface.Rummy_mainHandler_loaded =
                await this.requestByRoute(RequestRoute.loaded, {});
            this.playerSet = loadedData.pl.playerSet;
            this.uid = loadedData.pl.uid;
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    /**
     * 离开
     */
    async destroy() {
        CC_DEBUG && console.warn("机器人调用断线", this.uid)
        await this.leaveGameAndReset(false);
        return;
    }

    /**
     * 注册通知
     */
    registerListener() {
        // 开始发牌
        this.Emitter.on(MsgRoute.RUMMY_START_FAPAI, (data) => this.getStartPlayerCard(data));
        // 该谁发话
        this.Emitter.on(MsgRoute.RUMMY_PLAY, (data) => this.robotLoseCard(data));
        // 丢牌
        this.Emitter.on(MsgRoute.RUMMY_LOST_CARD, (data) => this.rummyLostCard(data));
        // 胡牌 有人胡牌了，需要机器人整理牌型
        this.Emitter.on(MsgRoute.RUMMY_SHAW, (data) => this.playerOtherPostCardsList(data));
        // 派奖 结束过后，如果真实玩家准备了,那么就需要准备 派奖结束过后需要把机器人身上的牌和东西清理掉,同
        this.Emitter.on(MsgRoute.RUMMY_REALPLAYER_READY, (data) => this.robotSendAward(data));
        // 监听让机器人的牌改变
        this.Emitter.on(MsgRoute.RUMMY_CHANGE_CARDS, (data) => this.changeRobotCardsList(data));
        // 准备
        this.Emitter.on(MsgRoute.RUMMY_READY, (data) => this.getReady(data));
        // 机器人离开
        // this.Emitter.on(MsgRoute.RUMMY_ONEXIT, () => this.destroy());
    }


    /**
     * 准备监听返回的参数
     * @param data 数据
     * @param secondBet 是否是再次下注
     */
    async getReady(data: { countdown: number, status: string }) {
        this.status = data.status;
        CC_DEBUG && console.warn("机器人准备阶段:", this.uid, this.sceneId, this.roomId);
        return;
    }
    /**
     * 发牌监听返回的参数
     * @param data 数据
     * @param secondBet 是否是再次下注
     */
    async getStartPlayerCard(data: { cards: number[], winPlayer: number, firstCard: number, changeCard: number, changeCardList: number[], lostCards: number[], status: string, pokerList: number[] }) {
        this.cards = data.cards;
        this.changeCard = data.changeCard;
        this.changeCardList = data.changeCardList;
        this.firstCard = data.firstCard;
        this.lostCards = data.lostCards;
        this.status = data.status;
        this.winPlayer = data.winPlayer;

        //机器人收到牌进行组合
        const result: { cards, loseCard, cardTypeList, needCards } = cardTypeUtils.robotCardsToCombination(this.cards, this.changeCardList);
        // this.loseCards = lastCards;
        this.cardsList = result.cardTypeList;
        this.needCards = result.needCards;
        this.cards = result.cards;
        CC_DEBUG && console.warn("机器人uid:", this.uid, "机器人的牌", this.cardsList, "变牌：", this.changeCardList,
            "cards:", this.cards, "winPlayer:", this.winPlayer, "玩家需要的牌组：", this.needCards);
        return;
    }




    /**
     * 该谁发话监听返回的参数
     * @param data 数据
     * @param secondBet 是否是再次下注
     */
    async robotLoseCard(data: { whichSet: number, round: number, gropPoint: number, }) {
        this.whichSet = data.whichSet;
        this.round = data.round;
        if (this.status !== RoomState.PLAY_CARD) {
            CC_DEBUG && console.warn(`房间状态不是打牌阶段不能说话:uid:${this.uid},`)
            return;
        }
        CC_DEBUG && console.warn(`机器人发话系统uid :${this.uid},whichSet:${this.whichSet},机器人位置：${this.playerSet}`);
        if (this.whichSet == this.playerSet) {
            //整理牌型
            let needCard = null;
            if (this.lostCards.length > 0) {
                needCard = this.lostCards[this.lostCards.length - 1];
            } else {
                needCard = this.firstCard;
            }
            let card = null;
            //检查是否需要丢弃排队里面的牌
            // const result = robotUtil.settleRobotCardList(needCard, this.cards, this.cardsList, this.changeCardList, this.lastCard);
            // console.warn('是否需要这张牌', result);
            if ([52, 53].includes(needCard) || this.changeCardList.includes(needCard) || this.needCards.includes(needCard)) {
                // 第一次延迟
                let delayTime = CommonUtil.randomFromRange(1000, 2000);
                if (this.round == 1) {
                    delayTime = 6000;
                }
                // 点击要牌  丢弃丢牌堆里面要牌
                let lostdata = await this.delayRequest(RequestRoute.playerGetlostCard, {}, delayTime);
                CC_DEBUG && console.warn("机器人uid:", this.uid, "机器人从废牌要的牌", lostdata, "回合:", this.round);
                if (lostdata.code == 200) {
                    card = lostdata.card;
                    this.cards.push(card)
                }
                // 要了牌过后
            } else {
                // 第一次延迟
                let delayTime = CommonUtil.randomFromRange(1000, 2000);
                if (this.round == 1) {
                    delayTime = 6000;
                }
                // 点击要牌 从新额牌堆里面要牌
                let getCardData = await this.delayRequest(RequestRoute.getPokerListCard, {}, delayTime);
                CC_DEBUG && console.warn("机器人uid:", this.uid, "机器人要的牌", getCardData, "回合:", this.round);
                if (getCardData.code == 200) {
                    card = getCardData.card;
                    this.cards.push(card);
                }
            }

            //要牌过后进行机器人整理牌机器人丢牌
            // const lostData = await robotUtil.robotGetCard(card, this.cards, this.cardsList, this.changeCardList);
            // let lostCard = card;
            // if (lostData.code === 200) {
            //     lostCard = lostData.lostCard == null ? card : lostData.lostCard;
            //     this.cardsList = lostData.cardsList;
            //     this.cards = lostData.cards;
            // }
            //机器人收到牌进行组合
            const { cards, loseCard, cardTypeList, needCards } = cardTypeUtils.robotCardsToCombination(this.cards, this.changeCardList, card);
            this.cards = cards;
            this.cardsList = cardTypeList;
            this.needCards = needCards;
            let lastCard = loseCard;
            CC_DEBUG && console.warn("机器人uid:", this.uid, "机器人要丢的牌,lostCard", loseCard, "回合:", this.round);
            CC_DEBUG && console.warn("机器人uid:", this.uid, "机器人要丢完牌的牌组cardsList", cardTypeList, "机器人变牌", this.changeCardList, "回合:", this.round);
            CC_DEBUG && console.warn("机器人uid:", this.uid, "机器人丢完牌的cards", cards, "回合:", this.round);
            CC_DEBUG && console.warn("机器人uid:", this.uid, "机器人丢完牌的needCards", needCards, "回合:", this.round);
            const point = RummyLogic.calculatePlayerPoint(cardTypeList, this.changeCardList);
            //对point进行判定，如果 winPlayer = 1 ,round = 1,没有纯连，听用牌小于2 ,且分值大于70分,就直接放弃
            let delayTime1 = CommonUtil.randomFromRange(2000, 8000);
            //判断玩家是否弃牌
            if (this.winPlayer == 1) {
                let robotGop = cardTypeUtils.robotGrop(point, this.cards, this.cardsList, this.changeCardList, this.round);
                if (robotGop) {
                    await this.delayRequest(RequestRoute.grop, { cardsList: this.cardsList, card: lastCard }, delayTime1);
                    CC_DEBUG && console.warn("机器人uid:", this.uid, '机器人弃牌 cardsList:', this.cardsList, 'round:', this.round);
                }
            }

            //如果等于0 就可以胡牌   //还有一个条件就是至少要5回合过后才能胡牌，不然太快了玩家要怀疑  5, 8
            // const random = CommonUtil.randomFromRange(4, 7);
            if (point == 0) {
                //胡牌
                await this.delayRequest(RequestRoute.shaw, { cardsList: this.cardsList, card: lastCard }, delayTime1);
                CC_DEBUG && console.warn("机器人uid:", this.uid, "回合:", this.round, '机器人胡牌 cardsList:', this.cardsList, 'lostCard:', lastCard);
            } else {
                await this.delayRequest(RequestRoute.lostCard, { cardsList: this.cardsList, card: lastCard, point }, delayTime1);
                this.lastCard = lastCard;  //记录机器人上次丢弃的牌
                CC_DEBUG && console.warn("机器人uid:", this.uid, "回合:", this.round, '机器人丢牌 :', this.lastCard, '丢了牌过后:', this.cardsList);
            }
        } else {
            CC_DEBUG && console.warn(`不该这个机器人说话uid:${this.uid}`)
            return;
        }

    }


    /**
     * 监听对方玩家丢弃牌的数据
     * @param data 数据
     * @param secondBet 是否是再次下注
     */
    async rummyLostCard(data: { card: number, lostCards: number[], whichSet: number, isSystem: boolean }) {
        this.lostCards = data.lostCards;
        CC_DEBUG && console.warn("机器人uid:", this.uid, '机器人监听到的丢牌 lostCards:', this.lostCards);
        return;
    }

    /**
     * 监听到玩家要胡牌,那么就需要机器人整理牌型
     * @param data 数据
     * @param secondBet 是否是再次下注
     */
    async playerOtherPostCardsList(data: { playerSet: number }) {
        if (data.playerSet == this.playerSet) {
            return;
        }
        //整理牌型
        let delayTime = CommonUtil.randomFromRange(1000, 2000);
        // 延迟跳过
        await this.delayRequest(RequestRoute.playerOtherPostCardsList, { cardsList: this.cardsList }, delayTime);
        return;
    }

    /**
     * 监听到派奖了，那么就开始倒计时，多少秒过后点击开始按钮
     * @param data 数据
     * @param secondBet 是否是再次下注
     */
    async robotSendAward(data: { countdown: number }) {
        //整理牌型
        await this.finishInit();
        CC_DEBUG && console.warn("机器人uid:", this.uid, `机器人监听到的派奖结束点击开始 lostCards:${this.lostCards}`);
        // 延迟跳过
        // await this.delayRequest(RequestRoute.start, {}, delayTime);
        return;
    }

    /**
     * 监听到机器人的牌需要修改
     * @param data 数据
     * @param secondBet 是否是再次下注
     */
    async changeRobotCardsList(data: { cards: number[], cardsList: any[] }) {
        CC_DEBUG && console.warn("机器人uid:", this.uid, "机器人监听：", data.cards, '.....', data.cardsList);
        this.cards = data.cards;
        this.cardsList = data.cardsList;
        return;
    }

}
