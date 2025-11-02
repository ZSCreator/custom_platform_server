import { BlackJackRoomImpl } from "../../BlackJackRoomImpl";
import { BlackJackPlayerImpl } from "../../BlackJackPlayerImpl";
import { getPai } from "../../../../../utils/GameUtil";
import { BlackJackBetArea } from "../BlackJackBetArea";
import { BlackJackPlayerRoleEnum } from "../../enum/BlackJackPlayerRoleEnum";
import { getLogger } from "pinus-logger";
const robotlogger = getLogger("server_out", __filename);


export class BlackJackRuntimeData {

    private room: BlackJackRoomImpl;

    private countdown: number = 0;

    private seatList: Array<string | null>;

    /** 牌池 */
    private pokerPool: Array<number> = [];

    /** 庄家区域 */
    private dealerArea: BlackJackBetArea;

    /** @property 公共区域总下注 */
    private totalBet: number = 0;

    /** @property 公共牌区域 */
    private commonAreaList: Array<BlackJackBetArea> = [];

    /** @property 分牌区域 */
    private separateAreaList: Array<BlackJackBetArea> = [];

    private separateAreaMap: Set<number>;

    /** @property 保险倒计时基数 */
    private insuranceCountdown: number = 3;

    /** @property 下注倒计时 */
    private betCountdown: number = 10;

    /** @property 牌池轮数 */
    private pokerPoolRound: number = 0;

    /** @property 庄家剩余的待发牌 */
    private dealerPreparePoker: number[] = [];

    /** Start 保险阶段运行参数 */

    /** @property 牌型A词典 */
    private distPoker: Array<number> = [0, 13, 26, 39];

    /**  End  保险阶段运行参数 */

    constructor(room: BlackJackRoomImpl) {
        this.room = room;

        const maxBet = this.room.areaMaxBet;

        this.dealerArea = new BlackJackBetArea(maxBet);

        this.commonAreaList.push(new BlackJackBetArea(maxBet), new BlackJackBetArea(maxBet), new BlackJackBetArea(maxBet));
    }
    /**
     * 初始化运行时所需数据
     */
    public initRuntimeData() {
        // 初始化座位信息

        this.seatList = Array.from({ length: this.room.roomUserLimit }).map(() => null);

        // robotlogger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 初始化房间座位 | 总数: ${this.room.roomUserLimit}`);

        // robotlogger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 初始化牌池 - 5副 `);

        this.restPokerPool();

        this.resetRoomInfoAndRestart();

        this.dealerPreparePoker = [];
    }

    /**
     * 玩家入场，坐进座位
     * @param player 玩家信息
     */
    public sitInSeat(player: BlackJackPlayerImpl): number | false {
        const idx = this.seatList.findIndex((val) => val === null);

        if (idx < 0) {
            robotlogger.warn(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 玩家: ${player.uid} | 玩家身份 isRobot : ${player.isRobot} | 游戏身份 role: ${player.role} | 坐进位置: ${idx + 1} | 出错 - 没有空位 `);
            return false;
        }

        this.seatList[idx] = player.uid;

        // robotlogger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 玩家: ${player.uid} | 玩家身份 isRobot : ${player.isRobot} | 游戏身份 role: ${player.role} | 坐进位置: ${idx + 1}  `);

        return idx + 1;
    }

    /**
     * 玩家离场，离开座位
     * @param uid 玩家编号
     */
    public leaveSeat(uid: string): boolean {
        const idx = this.seatList.findIndex((val) => val === uid);

        if (idx < 0) {
            robotlogger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 玩家: ${uid} | 离开位置: ${idx + 1} | 出错 - 并不在座位上 `);
            return false;
        }

        this.seatList[idx] = null;

        // robotlogger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 玩家: ${uid} | 离开位置: ${idx + 1}  `);
        return true;
    }

    public getSeatNumByUid(uid: string) {
        const idx = this.seatList.findIndex((val) => val === uid);

        if (idx < 0) {
            robotlogger.warn(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 玩家: ${uid} | 离开位置: ${idx + 1} | 出错 - 并不在座位上 `);
            return "未落座";
        }

        return idx;
    }

    /**
     * 获取当前计时器
     */
    public getCurrentCountdown() {
        return this.countdown;
    }

    /**
     * 计时器减1
     */
    public decreaseToCountDown() {
        this.countdown--;
    }

    /**
     * 设置庄家待发牌
     * @param dealerPreparePoker
     */
    public setDealerPreparePoker(dealerPreparePoker) {
        this.dealerPreparePoker = dealerPreparePoker;
    }

    /**
     * 保留庄家的初始两张牌
     */
    public reserveDealerPoker() {
        this.dealerArea.reserveTwoPoker();
    }

    /**
     * 保留庄家一张牌
     */
    public reserveDealerOnePoker() {
        this.dealerArea.reserveOnePoker();
    }

    /**
     * 获取庄家两张初始牌后剩余的牌
     */
    getDealerResidualPoker() {
        return this.dealerArea.getResidualPoker();
    }
    /**
     * 检测下注区域是否超过限额
     * @param areaIdx 下注区域
     * @param bet     下注金额
     */
    public checkAreaCanBet(areaIdx: number, bet: number) {
        const targetArea = this.commonAreaList[areaIdx];

        return targetArea.checkPlayerCanBet(bet);
    }

    /**
     * 指定区域下注
     * @param areaIdx 下注区域
     * @param bet     下注金额
     * @description 公共区域
     */
    public betIntoCommonByAreaIdx(areaIdx: number, bet: number) {
        this.commonAreaList[areaIdx].add(bet);

        this.totalBet += bet;

        // robotlogger.debug(`${this.room.backendServerId} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 下注 | 公共区域合计: ${this.totalBet} | 指定区域: ${areaIdx} , 当前下注: ${this.commonAreaList[areaIdx].getCurrentBet()} `);
    }

    /**
     * 指定区域下注
     * @param areaIdx 下注区域
     * @param bet     下注金额
     * @description 分牌区域
     */
    public betIntoBySeparateAreaIdx(areaIdx: number, bet: number) {
        this.separateAreaList[areaIdx].add(bet);

        this.totalBet += bet;

        // robotlogger.debug(`${this.room.backendServerId} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 下注 | 公共区域合计: ${this.totalBet} | 指定区域: ${areaIdx} , 当前下注: ${this.separateAreaList[areaIdx].getCurrentBet()} `);
    }

    /**
     * 获取指定区域的下注总额
     * @param areaIdx 下注区域
     */
    public getTotalBetByAreaIdx(areaIdx: number) {
        return this.commonAreaList[areaIdx].getCurrentBet() + (this.separateAreaList.length === 0 ? 0 : this.separateAreaList[areaIdx].getCurrentBet());
    }
    /**
     * 检测是否可以“下注阶段” => "发牌阶段"
     * @description 是否有人下注
     */
    public checkBettingToPlayer() {
        if (this.totalBet === 0) {
            return false;
        }
        return true;
    }

    /**
     * 取出公共区域 牌和点
     */
    public copyPokerFromCommonArea() {
        return this.commonAreaList.map(area => area.getPokerList());
    }

    /**
     * 复制公共区域牌进分牌区域
     */
    public pasteSeparateAreaFromCommonArea(areaIdx: number) {
        if (this.separateAreaMap.has(areaIdx)) {
            return;
        }

        this.separateAreaMap.add(areaIdx);

        const commonPokerList = this.commonAreaList.map(area => area.getPokerList());

        this.separateAreaList.forEach((area, idx) => {

            if (areaIdx === idx) {

                const firstPoker = commonPokerList[idx].basePokerList[0];

                area.addPoker(firstPoker);
            }
        });
    }

    /**
     * 重新洗牌
     */
    private restPokerPool() {
        this.pokerPool = getPai(5);
        this.pokerPoolRound++;
        // robotlogger.debug(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 第 ${this.pokerPoolRound} 次洗牌`);
    }

    /**
     * 取牌
     * @description 自动补牌，抽尾张
     */
    public getOnePokerFromPokerPool() {
        if (this.pokerPool.length === 0) {
            // robotlogger.info(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 牌池已空`);
            this.restPokerPool();
        }

        const poker = this.pokerPool.shift();

        // robotlogger.debug(`${this.room.backendServerId} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 抽取牌 :${poker}`);

        return poker;
    }

    /**
     * 指定公共区域增牌
     * @param areaIdx 区域下表
     * @param poker 牌点
     * @returns 当前区域最大点数
     */
    public addPokerIntoCommonAreaByAreaIdx(areaIdx: number, poker: number) {

        // robotlogger.debug(`${this.room.backendServerId} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 公共区域编号: ${areaIdx} | 发牌`);

        this.commonAreaList[areaIdx].addPoker(poker);

        const { countList } = this.commonAreaList[areaIdx].getPokerAndCount();

        const maxCount = Math.max(...countList);

        // robotlogger.debug(`${this.room.backendServerId} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 分牌区域编号: ${areaIdx} | 发牌 | 当前区域最大点 :${maxCount}`);

        return maxCount;
    }

    /**
     * 指定分牌区域增牌
     * @param areaIdx 区域下表
     * @param poker 牌点
     * @returns 当前区域最大点数
     */
    public addPokerIntoSeparateAreaByAreaIdx(areaIdx: number, poker: number) {
        // robotlogger.debug(`${this.room.backendServerId} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 分牌区域编号: ${areaIdx} | 发牌`);

        this.separateAreaList[areaIdx].addPoker(poker);

        const { countList } = this.separateAreaList[areaIdx].getPokerAndCount();

        const maxCount = Math.max(...countList);

        // robotlogger.debug(`${this.room.backendServerId} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 分牌区域编号: ${areaIdx} | 发牌 | 当前区域最大点 :${maxCount}`);

        return maxCount;
    }

    /**
     * 开局发牌
     * @param role 玩家身份: 此处对应的公共区域所属
     */
    public handoutPokerForCommonArea(role: BlackJackPlayerRoleEnum) {
        switch (role) {
            case BlackJackPlayerRoleEnum.Dealer:
                // robotlogger.debug(`${this.room.backendServerId} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 庄家区域发牌`);

                this.dealerArea.addPoker(this.getOnePokerFromPokerPool());
                // this.dealerArea.addPoker(13);

                // robotlogger.debug(`${this.room.backendServerId} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 庄家区域发牌 | 点数 : ${this.dealerArea.getCount()}`);
                break;
            case BlackJackPlayerRoleEnum.Player:
                // robotlogger.debug(`${this.room.backendServerId} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 公共区域发牌`);

                const { length } = this.commonAreaList;

                for (let i = 0; i < length; i++) {
                    const area = this.commonAreaList[i];

                    if (this.commonAreaList[i].getCurrentBet() === 0) {
                        continue;
                    }

                    // robotlogger.debug(`${this.room.backendServerId} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 公共区域编号: ${i} | 发牌`);

                    area.addPoker(this.getOnePokerFromPokerPool());
                    area.addPoker(this.getOnePokerFromPokerPool());
                    // area.addPoker(1);
                    // area.addPoker(14);
                    // area.addPoker(12);
                    // area.addPoker(13);
                    // area.addPoker(25);

                    // robotlogger.debug(`${this.room.backendServerId} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 公共区域编号: ${i} | 点数 : ${area.getCount()}`);
                }
                break;
            default:
                robotlogger.error(`${this.room.backendServerId} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 公共区域发牌出错 : role - ${role}`);
                break;
        }
    }

    /**
     * 检测是否进入保险流程
     */
    public checkChangesToInsurance(): boolean {
        return this.distPoker.includes(this.dealerArea.getFirstPoker());
    }

    /**
     * 提示下一个区域是否购买保险
     */
    public nextAreaSpeakOnInsurance(): false | number {

        const areaIdx = this.room.waitForNoticeAreaListOnInsurance.shift();

        if (typeof areaIdx === "number") {

            const currentCount = this.commonAreaList[areaIdx].getCount();

            if (currentCount === 21) {

                return this.nextAreaSpeakOnInsurance();
            }

            // robotlogger.info(`${this.room.backendServerId} | 游戏:${this.room.nid} | 场: ${this.room.sceneId} | 房间: ${this.room.roomId} | 保险流程 | 保险通知 | 区域 :${areaIdx}`);

            this.setInsuranceCountdown();
            return areaIdx;
        }

        return false;
    }

    /**
     * 通知下一区域操作
     * @param areaIdx 区域
     */
    public nextAreaSpeakOnPlayer() {
        this.setPlayerCountdown();
    }

    /**
     * 庄家要牌
     * @returns {number}
     * @description 返回要牌后的牌面合计
     */
    public dealerHit(): number {
        this.dealerArea.addPoker(this.getOnePokerFromPokerPool());
        // this.dealerArea.addPoker(12);
        return this.dealerArea.getCount();
    }

    /**
     * 回滚庄家要牌
     */
    public rollbackBankerDeal() {
        this.dealerArea.reserveOnePoker();
    }

    /**
     * 庄家补牌 在庄家发完两张初始牌后
     * @returns {number}
     * @description 返回要牌后的牌面合计
     */
    public afterDealerHit(): number {
        this.dealerArea.addPoker(this.dealerPreparePoker.shift());
        // this.dealerArea.addPoker(12);
        return this.dealerArea.getCount();
    }

    /**
     * 重置房间信息并开启下一局
     * @description 1.初始化下注计时器
     */
    public resetRoomInfoAndRestart() {
        this.totalBet = 0;
        // 初始化下注计时器
        this.countdown = this.betCountdown;

        const maxBet = this.room.areaMaxBet;

        this.dealerArea = new BlackJackBetArea(maxBet);

        this.commonAreaList = Array.from({ length: 3 }).map(() => new BlackJackBetArea(maxBet));

        this.separateAreaList = Array.from({ length: 3 }).map(() => new BlackJackBetArea(maxBet));

        this.separateAreaMap = new Set();
    }

    /**
     * 设置保险阶段计时器
     */
    private setInsuranceCountdown() {
        // 设置保险计时器
        this.countdown = 3;
    }

    /**
     * 设置玩家阶段计时器
     */
    private setPlayerCountdown() {
        this.countdown = 5;
    }

    /**
     * 设置结算动画事件
     */
    public setSettlementCountdown(countdown: number = 3) {
        this.countdown = countdown;
    }

    /**
     * 获取庄家区域牌和点
     */
    public getDealerPokerListAndCount() {
        return this.dealerArea.getPokerAndCount();
    }

    /**
     * 获取公共区域牌和点
     */
    public getCommonPokerListAndCount() {
        return this.commonAreaList.map(area => area.getPokerAndCount());
    }

    /**
     * 获取分牌区域牌和点
     */
    public getSeparatePokerListAndCount() {
        return this.separateAreaList.map(area => area.getPokerAndCount());
    }
}
