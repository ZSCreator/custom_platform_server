"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seeAction = exports.robotAction = exports.addLevRoom = exports.overLevRoom = exports.addRobot = exports.getProb = void 0;
const robotConfig_1 = require("./robotConfig");
const bipai = require("../../../utils/GameUtil");
function romdomTime(max, min) {
    return parseInt(Math.random() * (max - min + 1) + min, 10);
}
function getRandom(probability) {
    probability = probability * 100 || 1;
    let odds = Math.floor(Math.random() * 100);
    if (probability === 1) {
        return 0;
    }
    if (odds < probability) {
        return 1;
    }
    else {
        return 0;
    }
}
;
function getProb(probability) {
    probability = probability * 100 || 1;
    let odds = Math.floor(Math.random() * 100);
    if (probability === 1) {
        return 0;
    }
    if (odds < probability) {
        return 1;
    }
    else {
        return 0;
    }
}
exports.getProb = getProb;
function addRobot(robnumb) {
    let prob;
    let arr = robotConfig_1.default[0].addRoom;
    for (let key of arr) {
        if (key.player == robnumb + 1) {
            prob = key.probability;
        }
    }
    let isAdd = this.getProb(prob);
    if (isAdd == 1) {
        return true;
    }
    else {
        return false;
    }
}
exports.addRobot = addRobot;
function overLevRoom(initGold, nowMoney, limitMoney) {
    if (initGold >= limitMoney * 10) {
        if (nowMoney > initGold * 1.5) {
            return true;
        }
        else if (nowMoney < initGold * 0.5) {
            let isLev = getRandom(0.1);
            if (isLev == 1) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    else if (initGold >= limitMoney * 2 && initGold < limitMoney * 10) {
        if (nowMoney < initGold * 0.5) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        if (nowMoney < initGold * 0.5) {
            return true;
        }
        else {
            return false;
        }
    }
}
exports.overLevRoom = overLevRoom;
function addLevRoom(playerNum, robotNum) {
    let prob;
    let arr = robotConfig_1.default[0].paddLevRoom;
    for (let key of arr) {
        if (key.p_numb == playerNum && key.robot == robotNum) {
            prob = key.probability;
        }
    }
    let isLve = this.getProb(prob);
    if (isLve == 1) {
        return true;
    }
    else {
        return false;
    }
}
exports.addLevRoom = addLevRoom;
function robotAction(turn, gold, otherfill) {
    let prob;
    if (turn <= 1) {
        return 'bet';
    }
    if (otherfill) {
        return 'see';
    }
    if (gold <= 20000) {
        prob = this.getProb(0.99999);
    }
    if (gold > 20000 && gold <= 200000) {
        prob = this.getProb(0.8);
    }
    if (gold > 50000 && gold <= 100000) {
        prob = this.getProb(0.8);
    }
    if (gold > 100000 && gold <= 200000) {
        prob = this.getProb(0.7);
    }
    if (gold > 200000 && gold <= 500000) {
        prob = this.getProb(0.6);
    }
    if (gold > 500000 && gold <= 1000000) {
        prob = this.getProb(0.5);
    }
    if (gold > 1000000) {
        prob = this.getProb(0.5);
    }
    if (turn >= 4) {
        return 'see';
    }
    if (prob == 1) {
        return "bet";
    }
    else {
        return "see";
    }
}
exports.robotAction = robotAction;
function seeAction(turn, playerNum, cowNum, turnKP, capBet, betNum, mygold, allCards, otherfill) {
    let newsAllCards = [];
    for (const item of allCards) {
        newsAllCards.push({
            cards: item.cards,
            cardType: item.type
        });
    }
    let winer;
    let isWin = false;
    try {
        winer = bipai.bipai(newsAllCards);
        if (winer.cards.toString() == cowNum.cards.toString()) {
            isWin = true;
        }
    }
    catch (e) {
        return "fold";
    }
    let bull = cowNum.cardType;
    if (turn == 0) {
        return 'bet';
    }
    if (turn >= 19) {
        return 'allin';
    }
    let onum = playerNum - 1;
    if (betNum >= capBet) {
        return 'bipai';
    }
    if (mygold < capBet * onum) {
        return 'bipai';
    }
    if (isWin) {
        if (bull > 10) {
            let mpro = this.getProb(0.3);
            if (mpro == 1) {
                return 'fill';
            }
            else {
                return "bet";
            }
        }
        if (bull == 10) {
            let ranNum = romdomTime(4, 8);
            let oturn = turnKP + ranNum;
            if (turn < oturn) {
                return "bet";
            }
            else {
                let pro = this.getProb(0.3);
                if (pro == 1) {
                    return "bipai";
                }
                else {
                    let mpro = this.getProb(0.3);
                    if (mpro == 1) {
                        return 'fill';
                    }
                    else {
                        return "bet";
                    }
                }
            }
        }
        if (bull >= 8) {
            if (otherfill) {
                let isk = this.getProb(0.4);
                if (isk == 1) {
                    return 'bipai';
                }
                else {
                    let isk = this.getProb(0.3);
                    if (isk == 1) {
                        return 'fill';
                    }
                    else {
                        return "bet";
                    }
                }
            }
            let ranNum = romdomTime(3, 8);
            let oturn = turnKP + ranNum;
            if (turn < oturn) {
                let isk = this.getProb(0.3);
                if (isk == 1) {
                    return 'fill';
                }
                else {
                    return "bet";
                }
            }
            else {
                let pro = this.getProb(0.3);
                if (pro == 1) {
                    return "bipai";
                }
                else {
                    let isk = this.getProb(0.3);
                    if (isk == 1) {
                        return 'fill';
                    }
                    else {
                        return "bet";
                    }
                }
            }
        }
        if (bull >= 5 && bull <= 8) {
            if (otherfill) {
                let isk = this.getProb(0.4);
                if (isk == 1) {
                    return 'bipai';
                }
                else {
                    return "bet";
                }
            }
            let ranNum = romdomTime(2, 5);
            let oturn = turnKP + ranNum;
            if (turn < oturn) {
                let isk = this.getProb(0.3);
                if (isk == 1) {
                    return 'fill';
                }
                else {
                    return "bet";
                }
            }
            else {
                let pro = this.getProb(0.5);
                if (pro == 1) {
                    let isk = this.getProb(0.2);
                    if (isk == 1) {
                        return 'fill';
                    }
                    else {
                        return "bet";
                    }
                }
                else {
                    return 'bipai';
                }
            }
        }
        if (bull >= 3 && bull < 5) {
            let ranNum = romdomTime(1, 3);
            let oturn = turnKP + ranNum;
            if (turn < oturn) {
                let isk = this.getProb(0.3);
                if (isk == 1) {
                    let isk = this.getProb(0.2);
                    if (isk == 1) {
                        return 'fill';
                    }
                    else {
                        return "bet";
                    }
                }
                else {
                    return "bet";
                }
            }
            else {
                let pro = this.getProb(0.4);
                if (pro == 1) {
                    return 'bipai';
                }
                else {
                    let isk = this.getProb(0.2);
                    if (isk == 1) {
                        return 'fill';
                    }
                    else {
                        return "bet";
                    }
                }
            }
        }
        if (bull < 3 && bull > 0) {
            let pro = this.getProb(0.4);
            if (pro == 1) {
                return "bipai";
            }
            else {
                let isk = this.getProb(0.2);
                if (isk == 1) {
                    return 'fill';
                }
                else {
                    return "bet";
                }
            }
        }
        if (bull == 0) {
            let isk = this.getProb(0.5);
            if (isk == 1) {
                return 'bipai';
            }
            else {
                let isk = this.getProb(0.1);
                if (isk == 1) {
                    return 'fill';
                }
                else {
                    return "bet";
                }
            }
        }
        ;
    }
    if (!isWin) {
        if (bull >= 9) {
            if (otherfill) {
                let isk = this.getProb(0.4);
                if (isk == 1) {
                    return 'bipai';
                }
                else {
                    let isk = this.getProb(0.3);
                    if (isk == 1) {
                        return 'fill';
                    }
                    else {
                        return "bet";
                    }
                }
            }
            let pro = this.getProb(0.5);
            if (pro == 1) {
                return 'fold';
            }
            let ranNum = romdomTime(9, 15);
            let oturn = turnKP + ranNum;
            if (turn < oturn) {
                let isk = this.getProb(0.2);
                if (isk == 1) {
                    return 'fill';
                }
                else {
                    return "bet";
                }
            }
            else {
                let pro = this.getProb(0.35);
                if (pro == 1) {
                    return "bipai";
                }
                else {
                    let mpro = this.getProb(0.2);
                    if (mpro == 1) {
                        return 'fill';
                    }
                    else {
                        return "bet";
                    }
                }
            }
        }
        if (bull >= 5 && bull <= 8) {
            if (otherfill) {
                let isk = this.getProb(0.4);
                if (isk == 1) {
                    return 'bipai';
                }
                else {
                    let isk = this.getProb(0.3);
                    if (isk == 1) {
                        return 'fill';
                    }
                    else {
                        return "bet";
                    }
                }
            }
            let ranNum = romdomTime(2, 5);
            let oturn = turnKP + ranNum;
            if (turn >= 10) {
                return 'bet';
            }
            if (turn < oturn) {
                let mpro = this.getProb(0.1);
                if (mpro == 1) {
                    return 'fill';
                }
                else {
                    return "bet";
                }
            }
            else {
                let pro = this.getProb(0.4);
                if (pro == 1) {
                    let mpro = this.getProb(0.2);
                    if (mpro == 1) {
                        return 'fill';
                    }
                    else {
                        return "bet";
                    }
                }
                else {
                    return 'bipai';
                }
            }
        }
        if (bull >= 3 && bull < 5) {
            if (playerNum == 2) {
                let pro = this.getProb(0.4);
                if (pro == 1) {
                    return "bipai";
                }
                else {
                    if (capBet >= betNum * 2) {
                        return 'bipai';
                    }
                    if (turn >= turnKP + 5) {
                        return 'bipai';
                    }
                    else {
                        return 'bet';
                    }
                }
            }
            else {
                return 'fold';
            }
        }
        if (bull < 3 && bull > 0) {
            let pro = this.getProb(0.4);
            if (pro == 1) {
                return "bipai";
            }
            else {
                if (capBet >= betNum * 2) {
                    return 'bipai';
                }
                let pro = this.getProb(0.2);
                if (pro == 1) {
                    return "fill";
                }
                else {
                    return 'bet';
                }
            }
        }
        if (bull == 0) {
            let pro = this.getProb(0.2);
            if (pro == 1) {
                return "bipai";
            }
            else {
                return 'fold';
            }
        }
        ;
    }
}
exports.seeAction = seeAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9ib3RBY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9xem5ucHAvbGliL3JvYm90QWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLCtDQUFxQztBQUNyQyxpREFBaUQ7QUFFakQsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUc7SUFDMUIsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDN0QsQ0FBQztBQUVELFNBQVMsU0FBUyxDQUFDLFdBQW1CO0lBQ3BDLFdBQVcsR0FBRyxXQUFXLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNyQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUUzQyxJQUFJLFdBQVcsS0FBSyxDQUFDLEVBQUU7UUFDckIsT0FBTyxDQUFDLENBQUM7S0FDVjtJQUNELElBQUksSUFBSSxHQUFHLFdBQVcsRUFBRTtRQUN0QixPQUFPLENBQUMsQ0FBQztLQUNWO1NBQU07UUFDTCxPQUFPLENBQUMsQ0FBQztLQUNWO0FBQ0gsQ0FBQztBQUFBLENBQUM7QUFJRixTQUFnQixPQUFPLENBQUMsV0FBbUI7SUFDekMsV0FBVyxHQUFHLFdBQVcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQ3JDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBRTNDLElBQUksV0FBVyxLQUFLLENBQUMsRUFBRTtRQUNyQixPQUFPLENBQUMsQ0FBQztLQUNWO0lBQ0QsSUFBSSxJQUFJLEdBQUcsV0FBVyxFQUFFO1FBQ3RCLE9BQU8sQ0FB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