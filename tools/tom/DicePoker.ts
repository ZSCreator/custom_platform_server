import { time } from 'console';
import { exit } from 'process';
import { AreaBet } from '../../app/servers/DicePoker/lib/DiceConst';
import Dice_logic = require('../../app/servers/DicePoker/lib/Dice_logic');
import utils = require("../../app/utils");


let obj = new Dice_logic.DicePokerAction();
// obj.save_DiceList = [0, 0, 0, 0, 0];
let cycle = 0;
let Number_draws = 3;
let Number_extra = 3;
do {
    cycle++;
    while (obj.save_DiceList.length < 5) {
        obj.save_DiceList.push(0);
    }
    let curr_DiceList = Dice_logic.GetDice(obj.save_DiceList);
    curr_DiceList = Dice_logic.GetArr(obj.save_DiceList, curr_DiceList);
    curr_DiceList.sort((a, b) => a - b);
    console.warn("Number_draws", Number_draws, curr_DiceList.toString());
    let ret = obj.Get_handler_Pass(curr_DiceList);
    if (ret.success) {
        obj.area_DiceList[ret.idx].submit = true;
        obj.area_DiceList[ret.idx].DiceList = curr_DiceList.slice();
        console.warn("提交", ret.idx, JSON.stringify(obj.area_DiceList[ret.idx]));
        obj.save_DiceList = [0, 0, 0, 0, 0];
        Number_draws = 3;
        if (obj.area_DiceList.some(c => c.submit == false)) {
            continue;
        }
    } else {
        let tingM = obj.BuTouZi(curr_DiceList);
        // if (buNum.idx == -1) {
        console.warn("不满足缺一", curr_DiceList.toString(), "|", obj.save_DiceList.toString());
        // for (const idx of AreaArr) {
        // if (area_DiceList[idx].submit == false) {
        console.warn("===============", JSON.stringify(obj.area_DiceList.filter(c => c.submit == false).map(c => c.idx)));
        // }
        // }
    }

    Number_draws--;
    if (Number_draws == 0) {
        if (obj.area_DiceList.filter(c => c.submit == false).length == 1 && Number_extra > 0) {
            Number_extra--;
            Number_draws++;
            continue;
        }
        let idx = obj.AnySumit(curr_DiceList);
        obj.area_DiceList[idx].submit = true;
        obj.area_DiceList[idx].DiceList = curr_DiceList.slice();
        obj.area_DiceList[idx].points = Dice_logic.CalculatePoints(obj.area_DiceList, idx, curr_DiceList);
        console.warn("最后提交", `${idx}`, JSON.stringify(obj.area_DiceList[idx]));
        obj.save_DiceList = [0, 0, 0, 0, 0];
        Number_draws = 3;
        if (obj.area_DiceList.some(c => c.submit == false)) {
            continue;
        }
    }
    if (!obj.area_DiceList.some(c => c.submit == false)) {
        break;
    }
} while (true);
for (let idx = 0; idx < 13; idx++) {
    console.warn("==", idx, JSON.stringify(obj.area_DiceList[idx]));
}
console.warn(obj.area_DiceList.reduce((v, s) => v + s.points, 0));
