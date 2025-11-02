'use strict';
import utils = require('../../../utils');
import { AreaBet } from "./DiceConst";
import {random} from "../../../utils";

export const names = [
    "POINTS_1",
    "POINTS_2",
    "POINTS_3",
    "POINTS_4",
    "POINTS_5",
    "POINTS_6",
    "SANTIAO",
    "ZHADAN",
    "XIAOLIANZI",
    "DALIANZI",
    "BAOZI",
    "ANY"
]

export function GetDice(save_DiceList: number[]) {
    const result: number[] = [];
    for (const item of save_DiceList) {
        if (item == 0) {
            result.push(utils.random(1, 6));
        } else {
            result.push(0);
        }
    }
    return result;
}

/**获取大小不同的骰子 */
export function GetTwoDice() {
    const result: number[] = [];
    do {
        let dice1 = utils.random(1, 6);
        let dice2 = utils.random(1, 6);
        if (dice1 != dice2) {
            result.push(dice1);
            result.push(dice2);
            break;
        }
    } while (true);
    return result;
}
export function GetArr(arr1: number[], result: number[]) {
    let save_DiceList = arr1.slice();
    let curr_DiceList = result.slice();
    for (let idx = 0; idx < save_DiceList.length; idx++) {
        if (save_DiceList[idx] == 0 ||
            save_DiceList[idx] == null) {
            save_DiceList[idx] = curr_DiceList[idx];
        }
    }
    return save_DiceList;
}

/**计算点数 */
export function CalculatePoints(area_DiceList: { [key: number]: { DiceList: number[]; points: number; submit: boolean; }; },
    area: AreaBet, DiceList: number[]) {
    const alikeCounts = utils.checkAlike(DiceList);
    let points = 0;
    if (area == AreaBet.POINTS_1) {//0-5
        points = DiceList.filter(c => c == 1).length * 1;
    } else if (area == AreaBet.POINTS_2) {//0-10
        points = DiceList.filter(c => c == 2).length * 2;
    } else if (area == AreaBet.POINTS_3) {//0-15
        points = DiceList.filter(c => c == 3).length * 3;
    } else if (area == AreaBet.POINTS_4) {//0-20
        points = DiceList.filter(c => c == 4).length * 4;
    } else if (area == AreaBet.POINTS_5) {//0-25
        points = DiceList.filter(c => c == 5).length * 5;
    } else if (area == AreaBet.POINTS_6) {//0-30
        points = DiceList.filter(c => c == 6).length * 6;
    } else if (area == AreaBet.SANTIAO) {//0-5-30
        const alikeCount = utils.checkAlike(DiceList);
        if (alikeCount.find(c => c.count >= 3)) {
            points = DiceList.reduce((v, s) => v + s, 0);
        }
    } else if (area == AreaBet.ZHADAN) {//0-5-30
        const alikeCount = utils.checkAlike(DiceList);
        if (alikeCount.find(c => c.count >= 4)) {
            points = DiceList.reduce((v, s) => v + s, 0);
        }
    } else if (area == AreaBet.HULU) {//0-25
        if (alikeCounts.find(c => c.count == 3) && alikeCounts.find(c => c.count == 2)) {
            points = 25;
        }
        let alikeCount = alikeCounts.find(c => c.count == 5);
        if (alikeCount) {
            if (area_DiceList[AreaBet.BAOZI].submit && area_DiceList[AreaBet.BAOZI].points > 0) {
                points = 25;
            }
        }
    } else if (area == AreaBet.XIAOLIANZI) {//30
        const arr1 = [1, 2, 3, 4];
        const arr2 = [2, 3, 4, 5];
        const arr3 = [3, 4, 5, 6];
        if (utils.isContain(DiceList, arr1) ||
            utils.isContain(DiceList, arr2) ||
            utils.isContain(DiceList, arr3)) {
            points = 30;
        }
        let alikeCount = alikeCounts.find(c => c.count == 5);
        if (alikeCount) {
            if (area_DiceList[AreaBet.BAOZI].submit && area_DiceList[AreaBet.BAOZI].points > 0) {
                points = 30;
            }

        }
    } else if (area == AreaBet.DALIANZI) {//40
        const arr1 = [1, 2, 3, 4, 5];
        const arr2 = [2, 3, 4, 5, 6];
        if (utils.isContain(DiceList, arr1) ||
            utils.isContain(DiceList, arr2)) {
            points = 40;
        }
        let alikeCount = alikeCounts.find(c => c.count == 5);
        if (alikeCount) {
            if (area_DiceList[AreaBet.BAOZI].submit && area_DiceList[AreaBet.BAOZI].points > 0) {
                points = 40;
            }
        }
    } else if (area == AreaBet.BAOZI) {//50
        const alikeCount = utils.checkAlike(DiceList);
        if (alikeCount.find(c => c.count == 5)) {
            points = 50;
        }
    } else if (area == AreaBet.ANY) {//30
        points = DiceList.reduce((v, s) => v + s, 0);
    }
    return points;
}
export class DicePokerAction {
    private AreaArr = [AreaBet.BAOZI, AreaBet.DALIANZI, AreaBet.XIAOLIANZI, AreaBet.HULU,
    AreaBet.ZHADAN, AreaBet.SANTIAO, AreaBet.POINTS_6, AreaBet.POINTS_5,
    AreaBet.POINTS_4, AreaBet.POINTS_3, AreaBet.POINTS_2, AreaBet.POINTS_1,
    AreaBet.ANY];
    area_DiceList: { idx: number, DiceList: number[], points: number, submit: boolean }[] = [];
    save_DiceList: number[] = [];
    Subscript: number[] = [];
    CC_DEBUG = false;
    constructor() {
        for (let idx = 0; idx < 13; idx++) {
            this.area_DiceList.push({ idx, DiceList: [], points: 0, submit: false });
        }
    }
    Get_handler_Pass(curr_DiceList: number[]) {
        let AreaPoint = {
            5: 20,
            4: 20,
            3: 20,
            2: 15,
            1: 10,
            0: 5,
            12: 20
        };
        let flag = false;
        for (const idx of this.AreaArr) {
            let points = 0;
            if (this.area_DiceList[idx].submit == false) {
                if (idx == AreaBet.BAOZI ||
                    idx == AreaBet.DALIANZI ||
                    idx == AreaBet.XIAOLIANZI ||
                    idx == AreaBet.HULU ||
                    idx == AreaBet.ZHADAN ||
                    idx == AreaBet.SANTIAO) {
                    points = CalculatePoints(this.area_DiceList, idx, curr_DiceList);
                    if (points > 0) {
                        flag = true;
                    }
                    // }else if (idx==AreaBet.POINTS_6){

                } else {
                    points = CalculatePoints(this.area_DiceList, idx, curr_DiceList);
                    if (points >= AreaPoint[idx]) {
                        flag = true;
                    }
                }
            }

            if (flag == true) {
                this.area_DiceList[idx].DiceList = curr_DiceList.slice();
                this.area_DiceList[idx].points = points;
                // area_DiceList[idx].submit = true;
                // console.warn(idx, JSON.stringify(area_DiceList[idx]));
                return { success: true, idx };
            }
        }
        if (flag == false) {
            // console.warn("找补", curr_DiceList.toString());
            return { success: false, idx: -1 };
        }
    }

    BuTouZi(curr_DiceList: number[]) {
        //key-不保留的骰子，value：可以听得牌切片
        let tingM: { Idx: number, del: number, arr: number[], Idxs: number[], Subscript: number[] }[] = [];
        const alikeCounts = utils.checkAlike(curr_DiceList);
        for (let index = 0; index < curr_DiceList.length; index++) {
            let Tmp = curr_DiceList.slice();
            let del = Tmp.splice(index, 1)[0];
            for (const item of [1, 2, 3, 4, 5, 6]) {
                let temp = [...Tmp.slice(), item];
                let ret = this.Get_handler_Pass(temp);
                if (ret.success) {
                    if (!tingM.find(c => c.del == del)) {
                        tingM.push({ Idx: ret.idx, del: del, arr: [], Idxs: [], Subscript: [0, 1, 2, 3, 4] });
                        tingM.find(c => c.del == del).Subscript = tingM.find(c => c.del == del).Subscript.filter(c => c != index);
                    }
                    if (!tingM.find(c => c.del == del).arr.includes(item)) {
                        tingM.find(c => c.del == del).arr.push(item)
                        tingM.find(c => c.del == del).Idxs.push(ret.idx)
                    }
                }
            }
        }

        tingM.sort((a, b) => {
            if (a.arr.length != b.arr.length)
                return b.arr.length - a.arr.length;
            return a.del - b.del;
        });
        while (tingM.length > 0) {
            for (const item of tingM) {
                this.CC_DEBUG && console.warn("tingM", names[item.Idx], JSON.stringify(item));
            }
            if (tingM[0].Idx == AreaBet.ZHADAN && tingM[0].arr.length <= 2) {
                break;
            }
            this.save_DiceList = tingM[0].Subscript.map(c => curr_DiceList[c]);
            this.Subscript = tingM[0].Subscript.slice();
            return tingM;
        }
        tingM = [];
        for (const idx of this.AreaArr) {
            if (this.area_DiceList[idx].submit == false) {
                if (idx == AreaBet.BAOZI ||
                    idx == AreaBet.ZHADAN) {
                    for (const count of [4, 3, 2]) {
                        let result = alikeCounts.find(c => c.count >= count);
                        if (result) {
                            this.save_DiceList = result.Subscript.map(c => curr_DiceList[c]);
                            this.Subscript = result.Subscript.slice();
                            return tingM;
                        }
                    }
                } else if (idx == AreaBet.POINTS_1 ||
                    idx == AreaBet.POINTS_2 ||
                    idx == AreaBet.POINTS_3 ||
                    idx == AreaBet.POINTS_4 ||
                    idx == AreaBet.POINTS_5 ||
                    idx == AreaBet.POINTS_6) {
                    // const alikeCounts = utils.checkAlike(curr_DiceList);
                    for (const alikeCount of alikeCounts) {
                        if (alikeCount.key == idx + 1) {
                            tingM.push({ Idx: idx, del: alikeCount.count, arr: [], Idxs: [], Subscript: alikeCount.Subscript })
                        }
                    }
                }
            }
        }
        tingM.sort((a, b) => {
            if (a.arr.length != b.arr.length)
                return b.arr.length - a.arr.length;
            return b.del - a.del;
        });
        if (tingM.length > 0) {
            for (const item of tingM) {
                this.CC_DEBUG && console.warn("tingM2", JSON.stringify(item));
            }
            this.save_DiceList = tingM[0].Subscript.map(c => curr_DiceList[c]);
            this.Subscript = tingM[0].Subscript.slice();
            return tingM;
        }
        return tingM;
    }
    AnySumit(curr_DiceList: number[]) {
        let newArr = this.area_DiceList.filter(c => c.idx <= AreaBet.POINTS_6 && c.submit == false);
        if (newArr.length > 0) {
            const alikeCounts = utils.checkAlike(curr_DiceList);
            let MaxStart: { idx: number, count?: number, points?: number }[] = [];
            for (const Area of newArr) {
                if (Area.submit == false) {
                    let alikeCount = alikeCounts.find(c => c.key == Area.idx + 1);
                    MaxStart.push({ idx: Area.idx, count: alikeCount ? alikeCount.count : 0 });
                }
            }
            MaxStart.sort((a, b) => b.count - a.count);
            if (MaxStart.length > 0) {
                return MaxStart[0].idx;
            }
        }
        let MaxStart: { idx: number, count?: number, points?: number }[] = [];
        let LnewArr = this.area_DiceList.filter(c => c.idx > AreaBet.POINTS_6 && c.submit == false);
        if (LnewArr.length > 0) {
            for (const Area of LnewArr) {
                let points = CalculatePoints(this.area_DiceList, Area.idx, curr_DiceList);
                MaxStart.push({ idx: Area.idx, points });
            }
            MaxStart.sort((a, b) => b.points - a.points);
        }
        return MaxStart[0].idx;
    }
}

/**
 * 开奖类
 */
export class LotteryUtil {
    saveDiceList: number[];
    areas: any;
    controlNum: number = 0;

    constructor(saveDiceList: number[], areas: any) {
        this.saveDiceList = saveDiceList;
        this.areas = areas;
    }

    /**
     * 设置调控值
     * @param num
     */
    setControlNum(num: number) {
        this.controlNum = num;
    }

    /**
     * 开奖
     */
    lottery() {
        const result = GetDice(this.saveDiceList);

        let saveDiceList = GetArr(this.saveDiceList, result);
        let maxPoint = 0, indexList = [];
        for (let idx = 0; idx < 13; idx++) {
            if (this.areas[idx].submit === false) {
                this.areas[idx].points = CalculatePoints(this.areas, idx, saveDiceList);
                indexList.push(idx);

                if (this.areas[idx].points > maxPoint) {
                    maxPoint = this.areas[idx].points;
                }
            }
        }

        if (this.controlNum === 0) {
            return result;
        }

        const randomNum = random(0, 99);
        if (this.controlNum < 0 && randomNum < Math.abs(this.controlNum)) {
            if (maxPoint > 15 || indexList.filter(i => (i === 0 || i === 1 || i === 2)).length === indexList.length) {
                return result;
            }

            return this.lottery();
        } else if (this.controlNum > 0 && randomNum < this.controlNum) {
            if (maxPoint < 15) {
                return result;
            }

            return this.lottery();
        }

        return result;
    }
}
