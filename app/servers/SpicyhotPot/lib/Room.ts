import utils = require('../../../utils/index');
import Player from './Player';
import OffLineService = require('../../../services/hall/offLineService');
import { SystemRoom } from '../../../common/pojo/entity/SystemRoom';
import Control from "./control";

function sortProbability(random) {
    let _arr = bets;
    let allweight = 0;
    let section = 0; //区间临时变量
    let arr: any = _arr.map(m => {
        const obj = {};
        for (let key in m) {
            obj[key] = m[key];
        }
        return obj;
    });
    //console.log("obj=", arr);
    //排序
    arr.sort((a: any, b: any) => {
        return a.probability - b.probability;
    });
    //计算总权重
    for (let i = 0; i < arr.length; i++) {
        allweight += Number(arr[i].probability);
    }

    //获取概率区间
    for (let i = 0; i < arr.length; i++) {
        if (i == 0) {
            let right = (arr[i].probability / allweight);
            arr[i]['section'] = [0, right];
            section = right;
        } else {
            let right = (arr[i].probability / allweight) + section;
            arr[i]['section'] = [section, right];
            section = right;
        }

    }
    //console.log(arr);
    for (let i = 0; i < arr.length; i++) {
        if (random >= arr[i].section[0] && random < arr[i].section[1]) {
            return arr[i].name;
        }
    }
}

function checkAlike(_arr) {
    const obj = {};
    for (let i = 0; i < _arr.length; i++) {
        if (obj[_arr[i]]) {
            obj[_arr[i]] += 1;
        } else {
            obj[_arr[i]] = 1;
        }
    }
    //console.log(obj);
    return obj;
}

const bets = [
    // 豆腐
    { "name": 'K1', "probability": 205 },
    // 藕片
    { "name": 'K2', "probability": 205 },
    // 木耳
    { "name": 'K3', "probability": 149 },
    // 土豆
    { "name": 'K4', "probability": 149 },
    // 香菇
    { "name": 'K5', "probability": 120 },
    // 甜肠
    { "name": 'K6', "probability": 120 },
    // 血旺
    { "name": 'K7', "probability": 90 },
    // 午餐肉
    { "name": 'K8', "probability": 90 },
    // 香肠
    { "name": 'K9', "probability": 75 },
    // 黄喉
    { "name": 'K10', "probability": 75 },
    // 羊肉
    { "name": 'K11', "probability": 60 },
    // 毛肚
    { "name": 'K12', "probability": 60 }
]
const rebates = {
    K1: 0.6,
    K2: 0.6,
    K3: 1.2,
    K4: 1.2,
    K5: 2.2,
    K6: 2.2,
    K7: 4.8,
    K8: 4.8,
    K9: 7.8,
    K10: 7.8,
    K11: 14,
    K12: 14
};


export default class SpicyhotPotRoom extends SystemRoom<Player> {
    players: Player[] = []
    constructor(opts) {
        super(opts);

        this.players = [];
        // this.channelBet = opts.channelBet;
        // this.channelBet = opts.channelBet;//下注专用通道
        this.channel = opts.channel;
    }

    /**************************************  工具方法部分 ******************************************/


    async kickOfflinePlayer() {
        for (let i = this.players.length - 1; i >= 0; i--) {
            if (this.players[i].checkPlayerOnline()) {
                await OffLineService.setOffLineData(this.players[i].uid);
                // this.players.remove("uid", this.players[i].uid);
                utils.remove(this.players, 'uid', this.players[i].uid);
            }
        }
    }



    getPlayer(uid) {
        return this.players.find(player => player.uid === uid);
    }


    addPlayerInRoom(player) {
        const findPlayer = this.getPlayer(player.uid);

        if (findPlayer) {
            findPlayer.upOnlineTrue();
        } else {
            this.players.push(new Player(player));
        }

        this.addMessage(player);
        return true;
    }


    removePlayer(uid, offOnline = false) {
        const findPlayer = this.getPlayer(uid);
        this.kickOutMessage(uid);

        if (offOnline) {
            findPlayer.upOnlineFlase();
            return;
        }
        utils.remove(this.players, 'uid', uid);
        // this.players.remove("uid", uid);
    }

    strip() {
        return {
            players: this.players.map(player => player.strip()),
        }
    }



    static getResult(bet: number) {
        let rest = [], rebate = [];

        for (let i = 0; i < 9; i++) {
            rest.push(sortProbability(Math.random()));
        }
        const alikeCount = checkAlike(rest);
        for (let key in alikeCount) {
            if (alikeCount[key] >= 3) {
                let Json = {};
                Json[key] = rebates[key];
                rebate.push(Json);
            }
        }

        // 取消限制返奖率已有兜底
        // if (this.computWin(rebate) * 100 / bet > slotsAwardRateLimit('54')) {
        //     return this.getResult(bet);
        // }

        return { rest, rebate };
    }

    /**
     * 获取一个系统必胜或者必输的方法
     * @param bet
     * @param isSystemWin
     */
    static getWinOrLossResult(bet, isSystemWin) {
        // return () => {
        let result
        for (let i = 0; i < 100; i++) {
            result = this.getResult(bet);

            const win = this.calculateProfit(result.rebate, bet);

            if (isSystemWin && win <= bet) {
                break;
            }

            if (!isSystemWin && win > bet) {
                break;
            }
        }

        return result;
        // }
    }

    /**
     * 计算收益
     * @param rebate 开奖结果
     * @param bet 押注额
     */
    static calculateProfit(rebate: any, bet: number): number {
        let totalWin = 0;
        for (let key in rebate) {
            totalWin += rebate[key][Object.keys(rebate[key])[0]];
        }


        return Math.floor(totalWin * bet);
    }


    /**
     * 获取开奖结果
     * @param player 玩家
     * @param bet 押注额
     */
    async GetKaiJiangResult(player, bet: number): Promise<any> {
        return await Control.getControlInstance().result(player, bet);
    }
}
