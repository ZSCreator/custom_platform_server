"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bipai = exports.getPoint = exports.getPoints = exports.getCardType = exports.types = exports.pukes = exports.shuffle_cards = exports.CardType = exports.CardV = void 0;
var CardV;
(function (CardV) {
    CardV[CardV["ding3"] = 0] = "ding3";
    CardV[CardV["er4"] = 1] = "er4";
    CardV[CardV["za51"] = 2] = "za51";
    CardV[CardV["za52"] = 3] = "za52";
    CardV[CardV["za71"] = 4] = "za71";
    CardV[CardV["za72"] = 5] = "za72";
    CardV[CardV["za81"] = 6] = "za81";
    CardV[CardV["za82"] = 7] = "za82";
    CardV[CardV["za91"] = 8] = "za91";
    CardV[CardV["za92"] = 9] = "za92";
    CardV[CardV["oo6"] = 10] = "oo6";
    CardV[CardV["gaojiao7"] = 11] = "gaojiao7";
    CardV[CardV["hongtou10"] = 12] = "hongtou10";
    CardV[CardV["futou"] = 13] = "futou";
    CardV[CardV["bandeng"] = 14] = "bandeng";
    CardV[CardV["chang3"] = 15] = "chang3";
    CardV[CardV["meipai"] = 16] = "meipai";
    CardV[CardV["epai"] = 17] = "epai";
    CardV[CardV["renpai"] = 18] = "renpai";
    CardV[CardV["dipai"] = 19] = "dipai";
    CardV[CardV["tianpai"] = 20] = "tianpai";
})(CardV = exports.CardV || (exports.CardV = {}));
;
var CardType;
(function (CardType) {
    CardType[CardType["points"] = 0] = "points";
    CardType[CardType["digaojiu"] = 1] = "digaojiu";
    CardType[CardType["tiangaojiu"] = 2] = "tiangaojiu";
    CardType[CardType["digang"] = 3] = "digang";
    CardType[CardType["tiangang"] = 4] = "tiangang";
    CardType[CardType["diwang"] = 5] = "diwang";
    CardType[CardType["tianwang"] = 6] = "tianwang";
    CardType[CardType["zawu"] = 7] = "zawu";
    CardType[CardType["zaqi"] = 8] = "zaqi";
    CardType[CardType["zaba"] = 9] = "zaba";
    CardType[CardType["zajiu"] = 10] = "zajiu";
    CardType[CardType["shuangoo"] = 11] = "shuangoo";
    CardType[CardType["shuanggaojiao"] = 12] = "shuanggaojiao";
    CardType[CardType["shuanghongtou"] = 13] = "shuanghongtou";
    CardType[CardType["shuangfutou"] = 14] = "shuangfutou";
    CardType[CardType["shuangbandeng"] = 15] = "shuangbandeng";
    CardType[CardType["shuangchangsan"] = 16] = "shuangchangsan";
    CardType[CardType["shuangmei"] = 17] = "shuangmei";
    CardType[CardType["shuangE"] = 18] = "shuangE";
    CardType[CardType["shuangren"] = 19] = "shuangren";
    CardType[CardType["shuangdi"] = 20] = "shuangdi";
    CardType[CardType["shuangtian"] = 21] = "shuangtian";
    CardType[CardType["zhizhun"] = 22] = "zhizhun";
})(CardType = exports.CardType || (exports.CardType = {}));
function shuffle_cards() {
    const cards = [
        0, 1, 2, 3, 4, 5, 6, 7,
        8, 9, 10, 10, 11, 11, 12, 12,
        13, 13, 14, 14, 15, 15, 16, 16,
        17, 17, 18, 18, 19, 19, 20, 20
    ];
    cards.sort(() => 0.5 - Math.random());
    return cards;
}
exports.shuffle_cards = shuffle_cards;
;
exports.pukes = [
    "丁三", '二四', '杂五1',
    '杂五2', '杂七1', '杂七2', '杂八1', '杂八2', '杂九1',
    '杂九2', '零霖六', '高脚七', '红头十', '斧头', '板凳',
    '长三', '梅牌', '鹅牌', '人牌', '地牌', '天牌'
];
exports.types = [
    "点数牌", "地高九", '天高九', '地杠',
    '天杠', '地王', '双王', '杂五', '杂七', '杂八',
    '杂九', '双零霖', '双高脚', '双红头', '双斧头', '双板凳',
    '双长三', '双梅', '双鹅', '双人', '双地', '双天', '至尊'
];
function getCardType(theCards, twoStrategy = false) {
    let theCards_ = theCards.slice();
    for (let idx = 0; idx < 2; idx++) {
        if (idx == 1) {
            theCards_ = [theCards_[1], theCards_[0]];
        }
        if (theCards_.toString() == `${CardV.gaojiao7},${CardV.dipai}`) {
            return CardType.digaojiu;
        }
        else if (theCards_.toString() == `${CardV.za71},${CardV.tianpai}`) {
            return CardType.tiangaojiu;
        }
        else if (theCards_.toString() == `${CardV.za82},${CardV.dipai}`) {
            return CardType.digang;
        }
        else if (theCards_.toString() == `${CardV.za82},${CardV.tianpai}`) {
            return CardType.tiangang;
        }
        else if (theCards_.toString() == `${CardV.za92},${CardV.dipai}`) {
            return CardType.diwang;
        }
        else if (theCards_.toString() == `${CardV.za92},${CardV.tianpai}`) {
            return CardType.tianwang;
        }
        else if (theCards_.toString() == `${CardV.za51},${CardV.za52}`) {
            return CardType.zawu;
        }
        else if (theCards_.toString() == `${CardV.za71},${CardV.za72}`) {
            return CardType.zaqi;
        }
        else if (theCards_.toString() == `${CardV.za81},${CardV.za82}`) {
            return CardType.zaba;
        }
        else if (theCards_.toString() == `${CardV.za91},${CardV.za91}`) {
            return CardType.zajiu;
        }
        else if (theCards_.toString() == `${CardV.oo6},${CardV.oo6}`) {
            return CardType.shuangoo;
        }
        else if (theCards_.toString() == `${CardV.gaojiao7},${CardV.gaojiao7}`) {
            return CardType.shuanggaojiao;
        }
        else if (theCards_.toString() == `${CardV.hongtou10},${CardV.hongtou10}`) {
            return CardType.shuanghongtou;
        }
        else if (theCards_.toString() == `${CardV.futou},${CardV.futou}`) {
            return CardType.shuangfutou;
        }
        else if (theCards_.toString() == `${CardV.bandeng},${CardV.bandeng}`) {
            return CardType.shuangbandeng;
        }
        else if (theCards_.toString() == `${CardV.chang3},${CardV.chang3}`) {
            return CardType.shuangchangsan;
        }
        else if (theCards_.toString() == `${CardV.meipai},${CardV.meipai}`) {
            return CardType.shuangmei;
        }
        else if (theCards_.toString() == `${CardV.epai},${CardV.epai}`) {
            return CardType.shuangE;
        }
        else if (theCards_.toString() == `${CardV.renpai},${CardV.renpai}`) {
            return CardType.shuangren;
        }
        else if (theCards_.toString() == `${CardV.dipai},${CardV.dipai}`) {
            return CardType.shuangdi;
        }
        else if (theCards_.toString() == `${CardV.tianpai},${CardV.tianpai}`) {
            return CardType.shuangtian;
        }
        else if (theCards_.toString() == `${CardV.ding3},${CardV.er4}`) {
            return CardType.zhizhun;
        }
    }
    return CardType.points;
}
exports.getCardType = getCardType;
function getPoints(theCards) {
    let points = 0;
    for (const card of theCards) {
        switch (card) {
            case CardV.dipai:
                points += 2;
                break;
            case CardV.ding3:
                points += 3;
                break;
            case CardV.bandeng:
            case CardV.epai:
                points += 4;
                break;
            case CardV.er4:
            case CardV.oo6:
            case CardV.chang3:
                points += 6;
                break;
            case CardV.za51:
            case CardV.za52:
                points += 5;
                break;
            case CardV.za71:
            case CardV.za72:
            case CardV.gaojiao7:
                points += 7;
                break;
            case CardV.za81:
            case CardV.za82:
            case CardV.renpai:
                points += 8;
                break;
            case CardV.za91:
            case CardV.za92:
                points += 9;
                break;
            case CardV.hongtou10:
            case CardV.meipai:
                points += 10;
                break;
            case CardV.futou:
                points += 11;
                break;
            case CardV.tianpai:
                points += 12;
                break;
            default:
                break;
        }
    }
    while (points >= 10) {
        points -= 10;
    }
    return points;
}
exports.getPoints = getPoints;
function getPoint(theCard) {
    switch (theCard) {
        case CardV.ding3:
        case CardV.er4:
            return 0;
        case CardV.za51:
        case CardV.za52:
            return 1;
        case CardV.za71:
        case CardV.za72:
            return 2;
        case CardV.za81:
        case CardV.za82:
            return 3;
        case CardV.za91:
        case CardV.za92:
            return 4;
        case CardV.oo6:
            return 5;
        case CardV.gaojiao7:
            return 6;
        case CardV.hongtou10:
            return 7;
        case CardV.futou:
            return 8;
        case CardV.bandeng:
            return 9;
        case CardV.chang3:
            return 10;
        case CardV.meipai:
            return 11;
        case CardV.epai:
            return 12;
        case CardV.renpai:
            return 13;
        case CardV.dipai:
            return 14;
        case CardV.tianpai:
            return 15;
        default:
            break;
    }
    return 0;
}
exports.getPoint = getPoint;
function bipai(theCards1, theCards2) {
    let fight1 = getCardType(theCards1, true);
    let fight2 = getCardType(theCards2, true);
    if (fight1 != fight2) {
        return fight1 > fight2;
    }
    const max1 = getPoints(theCards1), max2 = getPoints(theCards2);
    if (max1 != max2) {
        return max1 > max2;
    }
    const arr1 = theCards1.map(c => getPoint(c)).sort((a, b) => b - a);
    const arr2 = theCards2.map(c => getPoint(c)).sort((a, b) => b - a);
    if (arr1[0] != arr2[0]) {
        return arr1[0] > arr2[0];
    }
    if (arr1[1] != arr2[1]) {
        return arr1[1] > arr2[1];
    }
    return true;
}
exports.bipai = bipai;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXpwal9sb2dpYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL3F6cGovbGliL3F6cGpfbG9naWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBSUEsSUFBWSxLQW1DWDtBQW5DRCxXQUFZLEtBQUs7SUFFYixtQ0FBUyxDQUFBO0lBRVQsK0JBQUcsQ0FBQTtJQUVILGlDQUFJLENBQUE7SUFBRSxpQ0FBSSxDQUFBO0lBRVYsaUNBQUksQ0FBQTtJQUFFLGlDQUFJLENBQUE7SUFFVixpQ0FBSSxDQUFBO0lBQUUsaUNBQUksQ0FBQTtJQUVWLGlDQUFJLENBQUE7SUFBRSxpQ0FBSSxDQUFBO0lBRVYsZ0NBQUcsQ0FBQTtJQUVILDBDQUFRLENBQUE7SUFFUiw0Q0FBUyxDQUFBO0lBRVQsb0NBQUssQ0FBQTtJQUVMLHdDQUFPLENBQUE7SUFFUCxzQ0FBTSxDQUFBO0lBRU4sc0NBQU0sQ0FBQTtJQUVOLGtDQUFJLENBQUE7SUFFSixzQ0FBTSxDQUFBO0lBRU4sb0NBQUssQ0FBQTtJQUVMLHdDQUFPLENBQUE7QUFDWCxDQUFDLEVBbkNXLEtBQUssR0FBTCxhQUFLLEtBQUwsYUFBSyxRQW1DaEI7QUFBQSxDQUFDO0FBRUYsSUFBWSxRQStDWDtBQS9DRCxXQUFZLFFBQVE7SUFFaEIsMkNBQVUsQ0FBQTtJQUVWLCtDQUFZLENBQUE7SUFFWixtREFBVSxDQUFBO0lBRVYsMkNBQU0sQ0FBQTtJQUVOLCtDQUFRLENBQUE7SUFFUiwyQ0FBTSxDQUFBO0lBRU4sK0NBQVEsQ0FBQTtJQUVSLHVDQUFJLENBQUE7SUFFSix1Q0FBSSxDQUFBO0lBRUosdUNBQUksQ0FBQTtJQUVKLDBDQUFLLENBQUE7SUFFTCxnREFBUSxDQUFBO0lBRVIsMERBQWEsQ0FBQTtJQUViLDBEQUFhLENBQUE7SUFFYixzREFBVyxDQUFBO0lBRVgsMERBQWEsQ0FBQTtJQUViLDREQUFjLENBQUE7SUFFZCxrREFBUyxDQUFBO0lBRVQsOENBQU8s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