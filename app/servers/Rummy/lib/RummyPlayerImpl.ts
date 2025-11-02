import { PlayerInfo } from '../../../common/pojo/entity/PlayerInfo';
import { CommonControlState } from "../../../domain/CommonControl/config/commonConst";
import * as mailModule from '../../../modules/mailModule';
import * as RummyConst from './RummyConst';
/**一个玩家 */
export default class RummyPlayerImpl extends PlayerInfo {
    /**记录玩家的位置 */
    playerSet: number = 0;
    /**j记录玩家的手牌 */
    cards: number[] = [];
    /** 记录玩家的手牌分组情况 */
    cardsList: { key: RummyConst.CardsType, value: number[] }[] = [];
    /**该局盈利 */
    profit: number = 0;
    /**默认玩家多少point */
    point: number = 0;
    /**弃牌需要输多少金币 */
    gropPoint: number = 0;
    /**是否要过牌 */
    isGetCard: boolean = false;
    /**从新的牌组里面获取的牌 */
    getCard: number;
    /**是否准备 */
    playerReady: boolean;
    /**是否已经棋牌 */
    isLose: boolean;
    // 调控状态
    //需要的牌
    needCards: number[] = [];
    constructor(opts: any) {
        super(opts);
        this.profit = 0;// 当前总收益
        this.cards = [];// 最后一次的收益
        this.cardsList = [];  //手牌的分组情况
        this.point = RummyConst.PLAYER_POINT.VALUE;
        this.gropPoint = 0;
        this.playerSet = opts.playerSet;
        this.isGetCard = false;
        this.getCard = null;
        this.playerReady = opts.playerReady;
        this.needCards = [];
        /**  分组情况
         *  {
         *      SHUN_GOLDENFLOWER_ONE：[5,6,7],
         *      SHUN_GOLDENFLOWER:[5,6,52],
         *      SHUN_GOLDENFLOWER:[5,6,52],
         *      BAOZI:[0,12,26]
         *  }
         */
    }


    /**初始游戏信息 */
    async initGame(lowBet: number) {
        this.profit = 0;// 当前收益
        this.gropPoint = lowBet * RummyConst.PLAYER_LOSE.ONE * RummyConst.PLAYER_POINT.VALUE;
        this.point = RummyConst.PLAYER_POINT.VALUE
        this.getCard = null;
        this.isGetCard = false;
        this.isLose = false;
        this.needCards = [];
        this.initControlType();
    }



    /**结算 */
    settlement(winAreaOdds: { name: string, odds: number }[]) {

    }

    /**
     * 断线重连成功重置连接状态
     */
    resetOnlineState() {
        this.onLine = true;
    }

    /**
     * 计算纯利润
     * @param winAreaOdds
     */
    calculateProfit(winAreaOdds: { name: string, odds: number }[]): number {

        return 0;
    }

    /**
     * 结算信息 - 参与发送邮件
     */
    toSettlementInfoByMail() {
        const content = `由于断线/退出游戏。您在[Rummy]游戏中押注:${0 / 100}金币已经自动结算，开奖结果如下：\n您的本局收益为:${this.profit / 100}`;
        mailModule.changeGoldsByMail2({ uid: this.uid, content })
    }

    /**
     * 返回给前端
     */
    result() {
        return {
            uid: this.uid,
            gold: this.gold,
            profit: this.profit,
            nickname: this.nickname,
            headurl: this.headurl,
            cardsList: this.cardsList,
            cards: this.cards,
            playerSet: this.playerSet,
            point: this.point,
            getCard: this.getCard,
            isGetCard: this.isGetCard,
            gropPoint: this.gropPoint,
        };
    }


    strip() {
        return {
            uid: this.uid,
            headurl: this.headurl,
            nickname: encodeURI(this.nickname),
            gold: this.gold,
            isRobot: this.isRobot,
            playerSet: this.playerSet,
            point: this.point,
        };
    }
}
