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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9ib3RBY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9xem5uL2xpYi9yb2JvdEFjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSwrQ0FBcUM7QUFDckMsaURBQWlEO0FBRWpELFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHO0lBQzFCLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzdELENBQUM7QUFFRCxTQUFTLFNBQVMsQ0FBQyxXQUFtQjtJQUNwQyxXQUFXLEdBQUcsV0FBVyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDckMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFFM0MsSUFBSSxXQUFXLEtBQUssQ0FBQyxFQUFFO1FBQ3JCLE9BQU8sQ0FBQyxDQUFDO0tBQ1Y7SUFDRCxJQUFJLElBQUksR0FBRyxXQUFXLEVBQUU7UUFDdEIsT0FBTyxDQUFDLENBQUM7S0FDVjtTQUFNO1FBQ0wsT0FBTyxDQUFDLENBQUM7S0FDVjtBQUNILENBQUM7QUFBQSxDQUFDO0FBSUYsU0FBZ0IsT0FBTyxDQUFDLFdBQW1CO0lBQ3pDLFdBQVcsR0FBRyxXQUFXLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUNyQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUUzQyxJQUFJLFdBQVcsS0FBSyxDQUFDLEVBQUU7UUFDckIsT0FBTyxDQUFDLENBQUM7S0FDVjtJQUNELElBQUksSUFBSSxHQUFHLFdBQVcsRUFBRTtRQUN0QixPQUFPLENBQUMs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