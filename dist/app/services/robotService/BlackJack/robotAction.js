"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seeAction = exports.robotAction = exports.addLevRoom = exports.overLevRoom = exports.addRobot = exports.getRandom = void 0;
const robotreg = require("./robotConfig");
function romdomTime(max, min) {
    return parseInt(Math.random() * (max - min + 1) + min, 10);
}
function getRandom(probability) {
    let tem_probability = probability * 100 || 1;
    let odds = Math.floor(Math.random() * 100);
    if (tem_probability === 1) {
        return 0;
    }
    if (odds < tem_probability) {
        return 1;
    }
    else {
        return 0;
    }
}
exports.getRandom = getRandom;
;
function addRobot(robnumb) {
    let prob;
    let arr = robotreg[0].addRoom;
    for (let key of arr) {
        if (key.player == robnumb + 1) {
            prob = key.probability;
        }
    }
    let isAdd = getRandom(prob);
    if (isAdd == 1) {
        return true;
    }
    else {
        return false;
    }
}
exports.addRobot = addRobot;
;
function overLevRoom(isWin, nowMoney, limitMoney) {
    let arr = robotreg[0].moneyLevRoom;
    if (isWin) {
        console.log("机器人赢了");
        if (nowMoney > limitMoney * 10) {
            let prob = arr.ten_win[0].lev_prob;
            let isLev = getRandom(prob);
            console.log(prob, "离开概率", isLev);
            if (isLev == 1) {
                return true;
            }
            else {
                return false;
            }
        }
        else if (nowMoney > limitMoney * 1) {
            let prob = arr.one_win[0].lev_prob;
            let isLev = getRandom(prob);
            if (isLev == 1) {
                return true;
            }
            else {
                return false;
            }
        }
        else if (nowMoney < limitMoney * 1) {
            let prob = arr.less_win[0].lev_prob;
            let isLev = getRandom(prob);
            if (isLev == 1) {
                return true;
            }
            else {
                return false;
            }
        }
    }
    else {
        console.log("机器人输了");
        if (nowMoney > limitMoney * 10) {
            let prob = arr.ten_lose[0].lev_prob;
            let isLev = getRandom(prob);
            if (isLev == 1) {
                return true;
            }
            else {
                return false;
            }
        }
        else if (nowMoney > limitMoney * 1) {
            let prob = arr.one_lose[0].lev_prob;
            let isLev = getRandom(prob);
            if (isLev == 1) {
                return true;
            }
            else {
                return false;
            }
        }
        else if (nowMoney < limitMoney * 1) {
            let prob = arr.less_lose[0].lev_prob;
            let isLev = getRandom(prob);
            if (isLev == 1) {
                return true;
            }
            else {
                return false;
            }
        }
    }
}
exports.overLevRoom = overLevRoom;
;
function addLevRoom(playerNum, robotNum) {
    let prob;
    let arr = robotreg[0].paddLevRoom;
    for (let key of arr) {
        if (key.p_numb == playerNum && key.robot == robotNum) {
            prob = key.probability;
        }
    }
    console.log(prob, "加入离开");
    let isLve = getRandom(prob);
    if (isLve == 1) {
        return true;
    }
    else {
        return false;
    }
}
exports.addLevRoom = addLevRoom;
;
function robotAction(turn) {
    const gnub = romdomTime(2, 4);
    console.log(gnub, turn, "hhhhhhhhhh");
    if (turn < gnub) {
        return "bet";
    }
    else {
        return "see";
    }
}
exports.robotAction = robotAction;
;
function seeAction(turn, playerNum, cowNum, turnKP) {
    let bull = cowNum;
    let pro = getRandom(0.5);
    if (turn >= 20) {
        return 'bipai';
    }
    if (bull == 12) {
        return "bet";
    }
    if (bull == 11) {
        if (turn < turnKP + 5) {
            return "bet";
        }
        else {
            if (pro == 1) {
                return "bipai";
            }
            else {
                return "bet";
            }
        }
    }
    if (bull >= 10) {
        if (turn < turnKP + 2) {
            return "bet";
        }
        else {
            if (pro == 1) {
                return "bipai";
            }
            else {
                return "bet";
            }
        }
    }
    if (bull >= 9) {
        if (turn > turnKP + 2) {
            return "bipai";
        }
        else {
            if (pro == 1) {
                return "bipai";
            }
            else {
                return "bet";
            }
        }
    }
    if (bull >= 8) {
        if (playerNum == 1) {
            return "bipai";
        }
        else {
            return "bet";
        }
    }
    else {
        return "bipai";
    }
}
exports.seeAction = seeAction;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9ib3RBY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvcm9ib3RTZXJ2aWNlL0JsYWNrSmFjay9yb2JvdEFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSwwQ0FBMkM7QUFFM0MsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUc7SUFDMUIsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDN0QsQ0FBQztBQUlELFNBQWdCLFNBQVMsQ0FBQyxXQUFXO0lBQ25DLElBQUksZUFBZSxHQUFHLFdBQVcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQzdDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBRTNDLElBQUksZUFBZSxLQUFLLENBQUMsRUFBRTtRQUN6QixPQUFPLENBQUMsQ0FBQztLQUNWO0lBQ0QsSUFBSSxJQUFJLEdBQUcsZUFBZSxFQUFFO1FBQzFCLE9BQU8sQ0FBQyxDQUFDO0tBQ1Y7U0FBTTtRQUNMLE9BQU8sQ0FBQyxDQUFDO0tBQ1Y7QUFDSCxDQUFDO0FBWkQsOEJBWUM7QUFBQSxDQUFDO0FBR0YsU0FBZ0IsUUFBUSxDQUFDLE9BQU87SUFDOUIsSUFBSSxJQUFJLENBQUM7SUFDVCxJQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0lBRTlCLEtBQUssSUFBSSxHQUFHLElBQUksR0FBRyxFQUFFO1FBQ25CLElBQUksR0FBRyxDQUFDLE1BQU0sSUFBSSxPQUFPLEdBQUcsQ0FBQyxFQUFFO1lBQzdCLElBQUksR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDO1NBQ3hCO0tBQ0Y7SUFF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