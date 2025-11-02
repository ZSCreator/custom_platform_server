import { BaseRobot } from "../../../common/pojo/baseClass/BaseRobot";
import * as utils from "../../../utils";
import robAction = require("../common/robotAction");
import { get as getConfiguration } from "../../../../config/data/JsonMgr";


export default class fisheryRobot extends BaseRobot {
    userInfo: {};
    initgold: number;
    errorssInfo: number;
    nowLun: number;
    roundLun: any;
    robotiGold: any[];
    fisheryBetArr: (string | number)[];
    gold: number = 0;
    ChipList: number[];
    constructor(opts) {
        super(opts);
        this.userInfo = {};
        this.initgold = 10000 * utils.random(1, 10);
        this.errorssInfo = 0;
        this.nowLun = 0;//当前轮数
        this.roundLun = utils.random(10, 100);//离开轮数
        this.robotiGold = [];
        this.fisheryBetArr = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    }

    //显示玩家
    async loaded() {
        try {
            const sceneInfo = getConfiguration('scenes/fishery').datas.find(scene => scene.id === this.sceneId);
            this.ChipList = sceneInfo.ChipList;
            let res = await this.requestByRoute("fishery.mainHandler.intoFishery", {});

            if (res.state === 'BETTING') {
                this.onStart();
            }

            return Promise.resolve(res);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async destroy() {
        await this.leaveGameAndReset();
    }

    //收到通知后处理
    registerListener() {
        this.Emitter.on('onStartFishery', this.onStart.bind(this));
        this.Emitter.on('onHarvest', this.onResult.bind(this));
        this.Emitter.on('changeFishery', this.onEnter.bind(this));
    }
    async onEnter(onen) {
    }
    //结算
    onResult(onres) {
        let this_ = this;
        if (onres.players.length > 0) {
            for (let i of onres.players) {
                if (i[this_.uid] != undefined && JSON.stringify(i[this_.uid]) != "{}") {
                    this_.gold = this_.gold + i.winBet;
                    break;
                }
            }
        }
    }
    randgl(probability: number) {
        probability = probability * 100 || 1;
        let odds = Math.floor(Math.random() * 100);

        if (probability === 1) {
            return 1;
        }
        if (odds < probability) {
            return 1;
        } else {
            return 0;
        }
    }
    //开始下注
    onStart() {
        let ran1 = utils.random(0, this.fisheryBetArr.length - 1);
        let betArea = this.fisheryBetArr[ran1];
        this.nowLun++;
        if (this.nowLun > this.roundLun) {
            this.destroy();
            return;
        }

        let yazhuCM = [100, 200, 500, 1000];

        let sum = this.gold / 100;

        let ran = utils.random(1, 100);
        let bet = sum - sum % yazhuCM[0];

        if (bet <= yazhuCM[0]) {
            bet = yazhuCM[0];
        }

        if (ran <= 70) {
            bet = bet * utils.random(9, 12);
        }
        else if (ran > 70 && ran <= 90) {
            bet = bet * utils.random(6, 8);
        } else {
            bet = bet * utils.random(1, 5);
        }

        if (this.gold < bet) {
            this.destroy();
            return;
        }
        let waitTime = 1;
        if (ran <= 20) {
            waitTime = utils.random(2, 6);
        }
        else if (ran > 20 && ran <= 40) {
            waitTime = utils.random(7, 11);
        }
        else if (ran > 40 && ran <= 60) {
            waitTime = utils.random(12, 16);
        } else if (ran > 60 && ran <= 80) {
            waitTime = utils.random(17, 21);
        } else {
            waitTime = utils.random(22, 24);
        }
        this.bet(betArea, bet);
    }

    //押注
    async bet(betArea: string | number, money: number) {
        // let yazhuChoseType = robAction.beizhiRobot(this.sceneId);
        let area = this.ChipList;

        let coplist = this.copList(area, money);
        let betarrlist: number[] = [];
        for (let i of coplist) {
            for (let d = 0; d < i[1]; d++) {
                betarrlist.push(i[0]);
            }
        }
        if (betarrlist.length > 5) {
            betarrlist = betarrlist.slice(0, 4);
        }
        for (const betarr of betarrlist) {
            let delayTime = utils.random(1000, 3800);
            try {
                let res = await this.delayRequest("fishery.mainHandler.fisheryBet", {
                    gold: betarr,
                    seat: betArea
                }, delayTime);
            } catch (error) {
                return;
            }
            this.gold = this.gold - betarr;
        }
    }

    //拆分押注金額
    copList(area: number[], num: number) {
        let betArr: number[][] = [];
        for (let i = area.length - 1; i >= 0; i -= 1) {
            if (num >= area[i]) {
                if (num / area[i] >= 5) {
                    betArr.push([area[i], 5]);
                } else {
                    betArr.push([area[i], Math.floor(num / area[i])]);
                }

                num %= area[i];

                if (num <= 0) break;
            }
        }
        return betArr;
    }


}
