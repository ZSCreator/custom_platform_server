import { BaseRobot } from "../../../../common/pojo/baseClass/BaseRobot";
import { BlackJackRoomChannelEventName } from "../enum/BlackJackRoomChannelEventName";
import { BlackJackBetArea } from "../expansion/BlackJackBetArea";
import { BlackJackRobotAgent } from "../expansion/robotExpansion/BlackJackRobotAgent";
import { divideBetGold } from "../../../../utils/robot/robotBetUtil";
import { random } from "../../../../utils/index";
import { ApiResult } from "../../../../common/pojo/ApiResult";
import { BlackJackState } from "../../../../common/systemState/blackJack.state";
import { sum } from "ramda";
import { get as getConfiguration } from "../../../../../config/data/JsonMgr";
import { getLogger } from 'pinus-logger';
const robotlogger = getLogger('robot_out', __filename);


export class BlackJackRobotImpl extends BaseRobot {

    seat: number = -1;

    agent: BlackJackRobotAgent;

    /** 初始化参数 */
    initGold: number = 0;

    gold: number = 0;

    targetRound: number = 0;

    /** 统计参数 */
    playingRound: number = 0;


    /** 运行时参数 */

    /** @property 计时器 */
    countDown: number = 0;

    /** @property 庄家区域 */
    dealerPokerArea: BlackJackBetArea;

    /** @property 玩家公共区域 */
    commonAreaPokerList: Array<BlackJackBetArea>;

    /** @property 玩家分牌区域 */
    separateAreaPokerList: Array<BlackJackBetArea>;

    // 延迟下注行为时间
    betActionTimer: NodeJS.Timer = null;

    delayedSendTimer: NodeJS.Timer = null;
    ChipList: number[];

    constructor(opts) {
        super(opts);
        this.agent = new BlackJackRobotAgent(this);
        const sceneInfo = getConfiguration('scenes/BlackJack').datas.find(scene => scene.id === this.sceneId);
        this.ChipList = sceneInfo.ChipList;
        this.dealerPokerArea = new BlackJackBetArea(0);
        this.commonAreaPokerList = Array.from({ length: 3 }).map(() => new BlackJackBetArea(0));
        this.separateAreaPokerList = Array.from({ length: 3 }).map(() => new BlackJackBetArea(0));

        const targetRoundValue = random(0, 100);

        if (targetRoundValue > 80) {
            this.targetRound = random(5, 15);
        } else if (targetRoundValue > 50) {
            this.targetRound = random(2, 12);
        } else {
            this.targetRound = random(2, 5);
        }

    }

    public async loaded() {
        try {
            const result = await this.agent.loaded();
            if (!result || result.code != 200) {
                await this.destroy();
                return false;
            }
            this.gold = result.data.currentPlayer.gold;
            this.initGold = result.data.currentPlayer.gold;
            return true;
        } catch (e) {
            await this.destroy();
            return false;
        }
    }

    public registerListener() {
        /** 下注阶段: 开始下注 */
        this.Emitter.on(BlackJackRoomChannelEventName.Betting, (data) => this.betBefore(data));

        /** 发牌阶段: 初始牌 */
        this.Emitter.on(BlackJackRoomChannelEventName.ShowInitPokerList, (data) => this.getInitPokerList(data));

        /** 闲家阶段: 开始操作 */
        this.Emitter.on(BlackJackRoomChannelEventName.Player, (data) => this.robotAction(data));

        /** 结算阶段 */
        this.Emitter.on(BlackJackRoomChannelEventName.Settlement, (data) => this.settlement(data));

        /** 超时 */
        this.Emitter.on(`${this.nid}_playerTimeOut`, () => this.timeout());

        /** 连接关闭 */
        // this.Emitter.on('close', () => this.timeout());
    }

    timeout() {
        this.destroy();
    }

    public nextGameRound() {
        this.clearBetAreaTimer();

        this.playingRound++;

        /** 初始化运行参数 */
        this.countDown = 0;
        this.dealerPokerArea = new BlackJackBetArea(0);
        this.commonAreaPokerList = Array.from({ length: 3 }).map(() => new BlackJackBetArea(0));
        this.separateAreaPokerList = Array.from({ length: 3 }).map(() => new BlackJackBetArea(0));
    }

    public async destroy(flags = true) {
        this.clearBetAreaTimer();
        await this.leaveGameAndReset(flags);
        this.agent.destroy();
        this.agent = null;
    }

    /**
     * 清除下注延迟器和定时器
     */
    private clearBetAreaTimer() {
        clearTimeout(this.betActionTimer);
        clearTimeout(this.delayedSendTimer);
    }

    /**
     * 下注前
     * @param {countDown:number} 下注倒计时
     * 
     * @description 下注阶段
     */
    private betBefore({ countDown }) {
        if (this.targetRound < this.playingRound) {
            this.destroy();
            return;
        }


        this.nextGameRound();
        // 下注: 可操作计时器
        this.countDown = countDown;
        // 停止下注的时间戳：开奖前 1 秒
        const stopBetTimeOut = Date.now() + countDown * 1000 - 1000;
        // 获取机器人下注配置
        const yaSection = this.ChipList;
        /** 下注金额 */
        let sum = this.gold / 100;
        let ran = random(1, 100);

        let bet = sum - sum % yaSection[0];
        if (bet <= yaSection[0]) {
            bet = yaSection[0];
        }

        if (ran <= 70) {
            bet = bet * random(9, 20);
        } else if (ran > 70 && ran <= 90) {
            bet = bet * random(6, 8);
        } else {
            bet = bet * random(1, 5);
        }

        if (this.gold < bet) {
            return;
        }

        /** 下注方式 */

        // 下注区域
        const baseRandomArea = { 0: [0, 1], 1: [1, 2], 2: [2, 0] };

        const areaList = [];

        // 随机下注区域
        if (this.gold > this.initGold) {
            if (ran <= 60) {
                areaList.push(0, 1, 2);
            } else if (ran > 60 && ran <= 85) {
                areaList.push(random(0, 2));
            } else {
                areaList.push(...baseRandomArea[random(0, 2)]);
            }
        } else {
            if (ran <= 40) {
                areaList.push(0, 1, 2);
            } else if (ran > 40 && ran <= 90) {
                areaList.push(random(0, 2));
            } else {
                areaList.push(...baseRandomArea[random(0, 2)]);
            }
        }

        /** 延迟下注行为 */
        let waitTime = 0;
        switch (areaList.length) {
            case 1:
                waitTime = random(3, 5)
                break;
            case 2:
                waitTime = random(2, 4)
                break;
            case 3:
                waitTime = random(2, 3)
                break;
            default:
                waitTime = random(2, 3)
                break;
        }

        // clearTimeout(this.betActionTimer);
        this.betActionTimer = setTimeout(() => {
            this.betBeginning(bet, areaList, stopBetTimeOut);
            // for (const areaIdx of areaList) {
            //     this.betBeginning(bet, areaIdx);
            // }
        }, waitTime * 1000);
    }

    /**
     * 开始下注
     * @param betGold 下注金额
     * @param areaList 下注区域
     * @param waitTime 等待时间
     */
    private async betBeginning(betGold: number, areaList: number[], stopBetTimeOut: number) {
        const yaSection = this.ChipList;

        // 拆分下注金额
        let goldList = divideBetGold(yaSection, betGold);

        if (goldList.length > 5) {
            goldList = goldList.slice(0, 3);
        }
        /**下注不能超过携带金额的一半 */
        while (sum(goldList) > this.gold / 2) {
            goldList.shift();
        }
        // console.warn('下注', areaIdx);
        // let betData = [];
        // let allRequestTime = 0;
        try {
            for (const areaIdx of areaList) {
                for (const gold of goldList) {
                    let time = random(1e1, 1e3);
                    if (Date.now() + time > stopBetTimeOut)
                        time = Math.max(0, random(0, stopBetTimeOut - Date.now()));
                    await this.delayRequest("BlackJack.mainHandler.bet", { areaIdx, bet: gold }, time);
                }
            }
        } catch (error) {
            // robotlogger.warn(goldList.toString(), this.gold);
            // robotlogger.warn(sum(goldList), this.gold / 2, sum(goldList) - this.gold / 2);
            // robotlogger.warn("==================");
        }
    }

    /**
     * 获取初始牌
     * 
     * @description 发牌阶段 
     */
    private getInitPokerList({ dealerPoker, commonPokerList }) {

        this.clearBetAreaTimer();

        // 庄家初始牌
        const { pokerList: dealerPokerList, countList: dealerCountList } = dealerPoker;

        this.dealerPokerArea.setPokerList(dealerPokerList, dealerCountList);

        // 闲家初始化牌
        this.commonAreaPokerList.forEach((area, areaIdx) => {
            const { pokerList, countList } = commonPokerList[areaIdx];

            area.setPokerList([...pokerList], [...countList]);
        })
    }

    /**
     * 玩家开始操作
     * @param countDown         倒计时
     * @param isSeparatePoker   是否分牌区域
     * @param areaIdx           当前区域下注
     * @param commonPokerList   公共区域
     * @param separatePokerList 分牌区域
     * @param playerList        玩家列表
     * 
     * @description 闲家阶段
     */
    private robotAction({ countDown, commonPokerList, separatePokerList, areaIdx, isSeparatePoker, playerList }) {

        /** 更新当前运行所需数据 */

        // 闲家阶段: 可操作计时器
        this.countDown = countDown;

        /** 是否可操作 */
        const playerExist = playerList.find(p => p.uid === this.uid);

        if (!playerExist) {

            return;
        }

        // 更新自己所属牌区域
        const { pokerList, countList } = isSeparatePoker ? playerExist.separatePokerList[areaIdx] : playerExist.commonPokerList[areaIdx];

        if (isSeparatePoker) {
            this.separateAreaPokerList[areaIdx].setPokerList([...pokerList], [...countList]);
        } else {
            this.commonAreaPokerList[areaIdx].setPokerList([...pokerList], [...countList]);
        }

        const maxCount = Math.max(...countList);

        if (maxCount < 17) {
            this.agent.getOnePoker(areaIdx);
        }
    }

    private settlement({ countDown, playerList }) {
        // 结算阶段: 可操作计时器
        this.countDown = countDown;

        /** 是否包含自己 */
        const playerExist = playerList.find(p => p.uid === this.uid);

        if (!playerExist) {
            if (this.playingRound >= 2) {
                this.destroy();
            }
            return;
        }

        this.gold = playerExist.gold;
    }
}
