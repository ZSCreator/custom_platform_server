"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkHaveGuiPai = exports.checkHaveChangeCard = exports.calculatePlayerPoint = exports.cardListType = exports.getCardForPoker = exports.getGrop_oneColor_card = exports.getGropCards_notShun = exports.getGropCards = exports.getRandomCards = exports.getRobotBadCards = exports.getBadCards = exports.getGoodCards = exports.getRobotAndPlayerCards = exports.getPlayerCards = exports.getOtherChangeCard = exports.getChangeCard = exports.randomPoker = void 0;
const RummyConst = require("./RummyConst");
const Utils = require("../../../utils/index");
let CC_DEBUG = false;
function randomPoker() {
    let poker = [];
    for (let i = 0; i < 54; i++) {
        poker.push(i);
    }
    return poker;
}
exports.randomPoker = randomPoker;
;
function getChangeCard() {
    let poker = randomPoker();
    for (let j = 1; j <= 5; j++) {
        const random = Utils.random(0, 51);
        let changeCard = poker[random];
        if (!RummyConst.CARD_TYPE_GUIPAI.includes(changeCard)) {
            return changeCard;
        }
    }
}
exports.getChangeCard = getChangeCard;
function getOtherChangeCard(changeCard) {
    let list = [];
    let num = changeCard % 13;
    for (let i = 0; i <= 3; i++) {
        list.push(i * 13 + num);
    }
    return list;
}
exports.getOtherChangeCard = getOtherChangeCard;
function getPlayerCards() {
    const poker = randomPoker();
    let pokerList = poker.concat(randomPoker());
    shuffle(pokerList);
    const player1 = getRandomCards(pokerList);
    pokerList = player1.poker;
    const player2 = getRandomCards(pokerList);
    let first = getFirstCard(pokerList);
    return { playerCards_1: player1.list, playerCards_2: player2.list, pokerList: first.pokerList, firstCard: first.card };
}
exports.getPlayerCards = getPlayerCards;
function getRobotAndPlayerCards(winPlayer, changeCard, changeCardList) {
    const random = Utils.random(1, 100);
    if (winPlayer == 1) {
        if (random >= RummyConst.Rummy_Data.WinPlayerGoodRobotCard_start && random <= RummyConst.Rummy_Data.WinPlayerGoodRobotCard_end) {
            const playerCards = getGoodCards(1, changeCard, changeCardList);
            const robotCards = getRobotBadCards(changeCard, changeCardList);
            let pokerList = playerCards.poker.concat(robotCards.poker);
            let result_Del = getChangeCardToDel(pokerList, changeCardList);
            let first = getFirstCard(result_Del.pokerList);
            CC_DEBUG && console.warn(`winPlayer:${winPlayer}, random${random},robotCards:${robotCards.list},playerCards:${playerCards.list.length},pokerList:${first.pokerList.length},firstCard:${first.card}`);
            return { robotCards: robotCards.list, playerCards: playerCards.list, pokerList: first.pokerList, firstCard: first.card, finallyCard: result_Del.finallyCard };
        }
        else if (random >= RummyConst.Rummy_Data.WinPlayerGropRobotCard_start && random <= RummyConst.Rummy_Data.WinPlayerGropRobotCard_start) {
            const playerCards = getGoodCards(1, changeCard, changeCardList);
            const robotCards = getGropCards(changeCardList, playerCards.poker);
            let result_Del = getChangeCardToDel(robotCards.poker, changeCardList);
            let first = getFirstCard(result_Del.pokerList);
            CC_DEBUG && console.warn(`winPlayer:${winPlayer}, random${random}, robotCards:${robotCards.list},playerCards:${playerCards.list.length},pokerList:${first.pokerList.length},firstCard:${first.card}`);
            return { robotCards: robotCards.list, playerCards: playerCards.list, pokerList: first.pokerList, firstCard: first.card, finallyCard: result_Del.finallyCard };
        }
        else {
            const playerCards = getGoodCards(1, changeCard, changeCardList);
            const poker = randomPoker();
            let pokerList = poker.concat(playerCards.poker);
            shuffle(pokerList);
            const robotCards = getRandomCards(pokerList);
            let result_Del = getChangeCardToDel(robotCards.poker, changeCardList);
            let first = getFirstCard(result_Del.pokerList);
            CC_DEBUG && console.warn(`winPlayer:${winPlayer}, random${random}, robotCards:${robotCards.list},playerCards:${playerCards.list.length},pokerList:${first.pokerList.length},firstCard:${first.card}`);
            return { robotCards: robotCards.list, playerCards: playerCards.list, pokerList: first.pokerList, firstCard: first.card, finallyCard: result_Del.finallyCard };
        }
    }
    else {
        const robotCards = getGoodCards(2, changeCard, changeCardList);
        const playerCards = getBadCards(changeCard, changeCardList, robotCards.poker);
        let result_Del = getChangeCardToDel(playerCards.poker, changeCardList);
        let first = getFirstCard(result_Del.pokerList);
        CC_DEBUG && console.warn(`winPlayer:${winPlayer}, random${random}, robotCards:${robotCards.list},playerCards:${playerCards.list.length},pokerList:${first.pokerList.length},firstCard:${first.card}`);
        return { robotCards: robotCards.list, playerCards: playerCards.list, pokerList: first.pokerList, firstCard: first.card, finallyCard: result_Del.finallyCard };
    }
}
exports.getRobotAndPlayerCards = getRobotAndPlayerCards;
function getChangeCardToDel(pokerList, changeCardList) {
    for (let m of changeCardList) {
        const index = pokerList.indexOf(m);
        if (index !== -1) {
            pokerList.splice(index, 1);
            return { pokerList: pokerList, finallyCard: m };
        }
    }
}
function getFirstCard(pokerList) {
    const card = pokerList[0];
    pokerList.splice(0, 1);
    return { card, pokerList };
}
function getGoodCards(forNum, changeCard, changeCardList) {
    let color = [0, 1, 2, 3];
    const poker = randomPoker();
    let list = [];
    getOneShun(color, list);
    for (let i = 0; i < forNum; i++) {
        getChunlian(color, list);
    }
    getChangeCardAndGuiPai(list, changeCardList);
    delePokerCard(poker, list);
    shuffle(poker);
    list = finallyCard_notChangeAndGui(poker, list, changeCardList);
    return { poker, list };
}
exports.getGoodCards = getGoodCards;
;
function getBadCards(changeCard, changeCardList, lastPoker) {
    const poker = randomPoker();
    let list = [];
    getSameCards(lastPoker, list, changeCardList);
    lastPoker = lastPoker.concat(poker);
    shuffle(poker);
    delePokerCard(lastPoker, list);
    list = finallyCard(lastPoker, list);
    return { list, poker: lastPoker };
}
exports.getBadCards = getBadCards;
;
function getRobotBadCards(changeCard, changeCardList) {
    let color = [0, 1, 2, 3];
    const poker = randomPoker();
    let list = [];
    getOneShun(color, list);
    delePokerCard(poker, list);
    shuffle(poker);
    list = finallyCard(poker, list);
    return { poker, list };
}
exports.getRobotBadCards = getRobotBadCards;
;
function getRandomCards(poker) {
    let list = [];
    list = finallyCard(poker, list);
    return { list, poker };
}
exports.getRandomCards = getRandomCards;
;
function getGropCards(changeCardList, lastPoker) {
    let poker = randomPoker();
    const { lastCards } = robotCardsChangeCardsSeparate(poker, changeCardList);
    const notGuiPoker = robotCardsGuiPaiSeparate(lastCards);
    let pokerList = notGuiPoker.lastCards;
    let list = getGropCards_notShun(pokerList, lastPoker, changeCardList);
    let allCards = poker.concat(lastPoker);
    if (list.length == 13) {
        for (let m of list) {
            let index = allCards.indexOf(m);
            allCards.splice(index, 1);
        }
        shuffle(allCards);
        return { list, poker: allCards };
    }
    else {
        for (let m of list) {
            let index = allCards.indexOf(m);
            allCards.splice(index, 1);
        }
        shuffle(allCards);
        let list_ = finallyCard_notChangeAndGui(allCards, list, changeCardList);
        return { list: list_, poker: allCards };
    }
}
exports.getGropCards = getGropCards;
;
function getGropCards_notShun(cards, lastPoker, changeCardList) {
    let list = [];
    const color = [0, 1, 2, 3];
    for (let m of color) {
        const cardList = getGrop_oneColor_card(m, cards);
        list = list.concat(cardList);
    }
    if (list.length > 13) {
        let length = list.length - 13;
        for (let i = 0; i < length; i++) {
            let random = Utils.random(0, list.length - 1);
            list.splice(random, 1);
        }
    }
    return list;
}
exports.getGropCards_notShun = getGropCards_notShun;
function getGrop_oneColor_card(colorType, cards) {
    const cardNum = Utils.random(2, 4);
    let start = 12;
    if (cardNum == 3) {
        start = 11;
    }
    else if (cardNum == 2) {
        start = 10;
    }
    let cardList = [];
    for (let i = 0; i < cardNum; i++) {
        if (cardList.length == 0) {
            let card = (colorType * 13) + start;
            if (cards.includes(card)) {
                cardList.push(card);
            }
            else {
                cardList.push(card - 1);
            }
        }
        if (i !== 0) {
            const sub = Utils.random(3, 4);
            let card = cardList[cardList.length - 1] - sub;
            if (cards.includes(card)) {
                cardList.push(card);
            }
        }
    }
    return cardList;
}
exports.getGrop_oneColor_card = getGrop_oneColor_card;
function robotCardsChangeCardsSeparate(cards, changeCardList) {
    let lastCards = [];
    let robotChangeCards = [];
    for (let m of cards) {
        if (changeCardList.includes(m)) {
            robotChangeCards.push(m);
        }
        else {
            lastCards.push(m);
        }
    }
    return { lastCards, robotChangeCards };
}
function robotCardsGuiPaiSeparate(cards) {
    let lastCards = [];
    let robotGuiPaiCards = [];
    for (let m of cards) {
        if (RummyConst.CARD_TYPE_GUIPAI.includes(m)) {
            robotGuiPaiCards.push(m);
        }
        else {
            lastCards.push(m);
        }
    }
    return { lastCards, robotGuiPaiCards };
}
function getSameCards(lastPuker, list, changeCardList) {
    const random = Utils.random(1, 2);
    if (random == 1) {
        let card = getNotChangeInLastPuker(lastPuker, changeCardList, list);
        list.push(card);
        list.push(card);
    }
    else {
        for (let i = 0; i < 2; i++) {
            let card = getNotChangeInLastPuker(lastPuker, changeCardList, list);
            list.push(card);
            list.push(card);
        }
    }
}
function getNotChangeInLastPuker(lastPuker, changeCardList, list) {
    let card = null;
    while (true) {
        const random = Utils.random(0, lastPuker.length - 1);
        if (!changeCardList.includes(lastPuker[random]) && !list.includes(lastPuker[random])) {
            card = lastPuker[random];
            break;
        }
    }
    return card;
}
function getOneShun(color, list) {
    const cardColor = Utils.random(0, 3);
    const cardOneColorNum = Utils.random(3, 4);
    const startNum = Utils.random(0, 9);
    for (let i = 0; i < cardOneColorNum; i++) {
        list.push(cardColor * 13 + (startNum + i));
    }
    const index = color.indexOf(cardColor);
    color.splice(index, 1);
}
function finallyCard(poker, list) {
    let length = list.length;
    let ss = poker.splice(0, 13 - length);
    list = list.concat(ss);
    return list;
}
function finallyCard_notChangeAndGui(poker, list, changeCardList) {
    let length = list.length;
    const { lastCards } = robotCardsChangeCardsSeparate(poker, changeCardList);
    const notGuiPoker = robotCardsGuiPaiSeparate(lastCards);
    let pokerList = notGuiPoker.lastCards;
    let ss = pokerList.splice(0, 13 - length);
    list = list.concat(ss);
    for (let m of ss) {
        const index = poker.indexOf(m);
        poker.splice(index, 1);
    }
    return list;
}
function shuffle(poker) {
    poker.sort(() => 0.5 - Math.random());
}
function delePokerCard(poker, list) {
    for (let m of list) {
        const index = poker.indexOf(m);
        poker.splice(index, 1);
    }
}
function getChangeCardAndGuiPai(list, changeCardList) {
    let haveChange = 0;
    for (let m of list) {
        if (changeCardList.includes(m)) {
            haveChange += 1;
        }
    }
    if (haveChange == 2) {
        return;
    }
    const random = Utils.random(0, 100);
    if (haveChange == 0) {
        if (random > RummyConst.Rummy_Data.GoodCardForChange) {
            const random = Utils.random(0, 3);
            list.push(changeCardList[random]);
        }
        else {
            const random = Utils.random(0, 1);
            list.push(RummyConst.CARD_TYPE_GUIPAI[random]);
        }
    }
    else if (haveChange == 1) {
        if (random > RummyConst.Rummy_Data.GoodCardForChange) {
            const random = Utils.random(0, 1);
            list.push(RummyConst.CARD_TYPE_GUIPAI[random]);
        }
    }
}
function getBaoziType(list) {
    while (true) {
        let color = [0, 1, 2, 3];
        const oneColor = Utils.random(0, 3);
        const index = color.indexOf(oneColor);
        color.splice(index, 1);
        const randomIndex = Utils.random(0, color.length - 1);
        const twoColor = color[randomIndex];
        const cardNum = Utils.random(0, 12);
        let oneCard = oneColor * 13 + cardNum;
        let twoCard = twoColor * 13 + cardNum;
        if (!list.includes(oneCard) && !list.includes(twoCard)) {
            list.push(oneColor * 13 + cardNum);
            list.push(twoColor * 13 + cardNum);
            break;
        }
    }
}
function getChunlian(color, list) {
    const cardToChun = Utils.random(1, 2);
    const cardNum = Utils.random(0, 10);
    color.sort((a, b) => a - b);
    const random = Utils.random(0, color.length - 1);
    let colorType = color[random];
    if (cardToChun == 0) {
        for (let i = 0; i < 2; i++) {
            list.push((colorType * 13) + (cardNum + i));
        }
    }
    else {
        for (let i = 0; i < 2; i++) {
            if (i == 0) {
                list.push((colorType * 13) + (cardNum + i));
            }
            else {
                list.push((colorType * 13) + (cardNum + i) + 1);
            }
        }
    }
    const index = color.indexOf(colorType);
    color.splice(index, 1);
}
function getCardForPoker(pokerList, needCards, winPlayer, isRobot, round, changeCards, controlNum = 0) {
    const random = Utils.random(0, 100);
    let num = 0;
    if (controlNum == 100) {
        num = 5;
    }
    else if (controlNum == 0) {
        num = 0;
    }
    else {
        num = Math.floor(controlNum / 20) + 1;
    }
    if (winPlayer == 1) {
        if (isRobot == 0) {
            if (random > RummyConst.Rummy_Data.GetNeedCardForPlayer) {
                if (needCards.length !== 0) {
                    const result = needCardForPoker(needCards, pokerList, changeCards);
                    if (result && result.card.toString()) {
                        return { card: result.card, pokerList: result.pokerList };
                    }
                }
            }
        }
        else {
            if (random > RummyConst.Rummy_Data.GetNeedCardForRobot_ForWinPlayer) {
                if (needCards.length !== 0) {
                    const result = needCardForPoker(needCards, pokerList, changeCards);
                    if (result && result.card.toString()) {
                        return { card: result.card, pokerList: result.pokerList };
                    }
                }
            }
        }
    }
    else if (winPlayer == 2) {
        if (isRobot == 2) {
            if (random > (RummyConst.Rummy_Data.GetNeedCardForRobot_ForWinRobot - num * 10)) {
                if (needCards.length !== 0) {
                    const result = needCardForPoker(needCards, pokerList, changeCards);
                    if (result && result.card.toString()) {
                        return { card: result.card, pokerList: result.pokerList };
                    }
                }
            }
        }
        else if (isRobot == 0) {
            if (random > (RummyConst.Rummy_Data.GetLoseCardForPlayer - num * 10)) {
                let loseResult = getLoseCards(needCards, pokerList, changeCards);
                if (loseResult && loseResult.card.toString()) {
                    return { card: loseResult.card, pokerList: loseResult.pokerList };
                }
            }
        }
    }
    let card = pokerList[0];
    pokerList.splice(0, 1);
    return { card, pokerList };
}
exports.getCardForPoker = getCardForPoker;
function getLoseCards(needCards, pokerList, changeCards) {
    for (let i = 0; i < pokerList.length; i++) {
        let card = pokerList[i];
        if (!needCards.includes(card) && !changeCards.includes(card) && !RummyConst.CARD_TYPE_GUIPAI.includes(card)) {
            pokerList.splice(i, 1);
            return { card: card, pokerList };
        }
    }
}
function needCardForPoker(needCards, pokerList, changeCards) {
    const random = Utils.random(0, 100);
    if (random > 70) {
        let card = null;
        let index = null;
        for (let m of needCards) {
            const index_ = pokerList.indexOf(m);
            if (index_ != -1) {
                card = m;
                index = index_;
                break;
            }
        }
        if (card || card == 0) {
            pokerList.splice(index, 1);
            return { card: card, pokerList };
        }
    }
    else if (random > 70 && random < 90) {
        let changeCard = null;
        let changeIndex = null;
        for (let m of changeCards) {
            const index_ = pokerList.indexOf(m);
            if (index_ != -1) {
                changeCard = m;
                changeIndex = index_;
                break;
            }
        }
        if (changeCard || changeCard == 0) {
            pokerList.splice(changeIndex, 1);
            return { card: changeCard, pokerList };
        }
    }
    else if (random > 90) {
        let guiPaiCard = null;
        let guiPaiCardIndex = null;
        let guiList = RummyConst.CARD_TYPE_GUIPAI;
        for (let m of guiList) {
            const index_ = pokerList.indexOf(m);
            if (index_ != -1) {
                guiPaiCard = m;
                guiPaiCardIndex = index_;
                break;
            }
        }
        if (guiPaiCard) {
            pokerList.splice(guiPaiCardIndex, 1);
            return { card: guiPaiCard, pokerList };
        }
    }
}
function cardListType(cards, changeCardList) {
    let resultCardListType = [];
    let black = [];
    let red = [];
    let mei = [];
    let fang = [];
    let guipai = [];
    for (let i = 0; i < cards.length; i++) {
        if (RummyConst.CARD_TYPE_GUIPAI.includes(cards[i])) {
            guipai.push(cards[i]);
        }
        else {
            let num = Math.floor(cards[i] / 13);
            switch (num) {
                case 0:
                    black.push(cards[i]);
                    break;
                case 1:
                    red.push(cards[i]);
                    break;
                case 2:
                    mei.push(cards[i]);
                    break;
                default:
                    fang.push(cards[i]);
            }
        }
    }
    if (black.length != 0) {
        const key = getCardType(black, changeCardList);
        resultCardListType.push({ key: key, value: black });
    }
    if (red.length != 0) {
        const key = getCardType(red, changeCardList);
        resultCardListType.push({ key: key, value: red });
    }
    if (mei.length != 0) {
        const key = getCardType(mei, changeCardList);
        resultCardListType.push({ key: key, value: mei });
    }
    if (fang.length != 0) {
        const key = getCardType(fang, changeCardList);
        resultCardListType.push({ key: key, value: fang });
    }
    if (guipai.length != 0) {
        resultCardListType.push({ key: RummyConst.CardsType.SINGLE, value: guipai });
    }
    return resultCardListType;
}
exports.cardListType = cardListType;
function calculatePlayerPoint(cardsList, changeCardList) {
    let realPoint = 0;
    let fakePoint = 0;
    let isOne = 0;
    let isTwo = 0;
    for (let item of cardsList) {
        const type = getCardType(item.value, changeCardList);
        if (type == RummyConst.CardsType.SINGLE) {
            realPoint += countPoint(item.value, changeCardList);
            fakePoint += countPoint(item.value, changeCardList);
        }
        else if (type == RummyConst.CardsType.BAOZI) {
            fakePoint += countPoint(item.value, changeCardList);
        }
        else if (type == RummyConst.CardsType.SHUN_GOLDENFLOWER) {
            isTwo += 1;
            fakePoint += countPoint(item.value, changeCardList);
        }
        else if (type == RummyConst.CardsType.SHUN_GOLDENFLOWER_ONE) {
            isOne += 1;
        }
    }
    if ((isOne == 1 && isTwo >= 1) || (isOne >= 2)) {
        return realPoint > RummyConst.PLAYER_POINT.VALUE ? RummyConst.PLAYER_POINT.VALUE : realPoint;
    }
    else {
        return fakePoint > RummyConst.PLAYER_POINT.VALUE ? RummyConst.PLAYER_POINT.VALUE : fakePoint;
    }
}
exports.calculatePlayerPoint = calculatePlayerPoint;
function countPoint(list, changeCardList) {
    let point = 0;
    for (let key of list) {
        if (!changeCardList.includes(key) && !RummyConst.CARD_TYPE_GUIPAI.includes(key)) {
            if (RummyConst.CARD_POINT_TYPE.includes(key)) {
                point += 10;
            }
            else {
                point += key % 13 + 1;
            }
        }
    }
    return point;
}
function getCardType(cards, changeCardList) {
    if (cards.length < 3) {
        return RummyConst.CardsType.SINGLE;
    }
    const { isGuiPai, cardList, guiPaiNum } = checkHaveGuiPai(cards);
    const tempH = Math.floor(cardList[0] / 13);
    const isTonghua = cardList.every(m => tempH === Math.floor(m / 13));
    if (isTonghua) {
        const arr = cardList.map(m => m % 13);
        arr.sort((a, b) => a - b);
        const isShunzi = checkShunzi(arr);
        if (isShunzi && !isGuiPai) {
            return RummyConst.CardsType.SHUN_GOLDENFLOWER_ONE;
        }
    }
    const { isChangeCard, noChangeCardList, changeCardNum } = checkHaveChangeCard(cardList, changeCardList);
    const isSameCard = bisRepeat(noChangeCardList);
    if (!isSameCard) {
        const noChangeTemp = Math.floor(noChangeCardList[0] / 13);
        const isTonghuaForChange = noChangeCardList.every(m => noChangeTemp === Math.floor(m / 13));
        if ((isGuiPai || isChangeCard) && isTonghuaForChange) {
            const arr = noChangeCardList.map(m => m % 13);
            arr.sort((a, b) => a - b);
            const num = checkGuiPaiShunzi(arr);
            if (num <= guiPaiNum + changeCardNum) {
                return RummyConst.CardsType.SHUN_GOLDENFLOWER;
            }
        }
        const arr = noChangeCardList.map(m => m % 13);
        const { isAlike, alikeNum } = checkAlike(arr);
        if (isAlike && (alikeNum + changeCardNum + guiPaiNum) >= 3 && (alikeNum + changeCardNum + guiPaiNum) <= 4) {
            return RummyConst.CardsType.BAOZI;
        }
    }
    return RummyConst.CardsType.SINGLE;
}
;
function checkHaveChangeCard(cards, changeCardList) {
    let isChangeCard = false;
    let noChangeCardList = [];
    let changeCardNum = 0;
    for (let item of cards) {
        if (changeCardList.includes(item)) {
            isChangeCard = true;
            changeCardNum += 1;
        }
        else {
            noChangeCardList.push(item);
        }
    }
    return { isChangeCard, noChangeCardList, changeCardNum };
}
exports.checkHaveChangeCard = checkHaveChangeCard;
function checkHaveGuiPai(cards) {
    let isGuiPai = false;
    let cardList = [];
    let guiPaiNum = 0;
    let guiPaiList = [];
    for (let item of cards) {
        if (item == 52 || item == 53) {
            isGuiPai = true;
            guiPaiNum += 1;
            guiPaiList.push(item);
        }
        else {
            cardList.push(item);
        }
    }
    return { isGuiPai, cardList, guiPaiNum, guiPaiList };
}
exports.checkHaveGuiPai = checkHaveGuiPai;
function checkShunzi(cards) {
    cards.sort((a, b) => a - b);
    let i = 0;
    if (cards[0] === 0 && cards[cards.length - 1] === 12) {
        i = 1;
    }
    for (; i < cards.length - 1; i++) {
        if (cards[i] + 1 !== cards[i + 1]) {
            return false;
        }
    }
    return true;
}
;
function checkGuiPaiShunzi(cards) {
    cards.sort((a, b) => a - b);
    let num = 0;
    let i = 0;
    if (cards[0] === 0 && cards[cards.length - 1] === 12) {
        i = 1;
    }
    if (cards.length == 1) {
        return cards.length - 1;
    }
    if (cards.length >= 2 && cards[0] === 0 && cards[cards.length - 1] >= 8) {
        cards.splice(0, 1);
        cards.push(13);
        cards.sort((a, b) => a - b);
    }
    for (; i < cards.length - 1; i++) {
        if (cards[i + 1] && cards[i + 1] - cards[i] + 1 > 0) {
            num += cards[i + 1] - (cards[i] + 1);
        }
    }
    return num;
}
;
function bisRepeat(cardList) {
    let hash = {};
    for (let i in cardList) {
        if (hash[cardList[i]]) {
            return true;
        }
        hash[cardList[i]] = true;
    }
    return false;
}
function checkAlike(cards) {
    let prv = statisticalFieldNumber(cards);
    let list = [];
    for (let key in prv) {
        list.push({ key: key, value: prv[key] });
    }
    if (list.length == 1) {
        return { isAlike: true, alikeNum: list[0].value };
    }
    else {
        return { isAlike: false, alikeNum: 0 };
    }
}
;
function statisticalFieldNumber(arr) {
    return arr.reduce(function (prev, next) {
        prev[next] = (prev[next] + 1) || 1;
        return prev;
    }, {});
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUnVtbXlMb2dpYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL1J1bW15L2xpYi9SdW1teUxvZ2ljLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJDQUE0QztBQUM1Qyw4Q0FBOEM7QUFPOUMsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO0FBZ0JyQixTQUFnQixXQUFXO0lBQ3ZCLElBQUksS0FBSyxHQUFhLEVBQUUsQ0FBQztJQUN6QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3pCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNqQixDQUFDO0FBUEQsa0NBT0M7QUFBQSxDQUFDO0FBUUYsU0FBZ0IsYUFBYTtJQUN6QixJQUFJLEtBQUssR0FBRyxXQUFXLEVBQUUsQ0FBQztJQUMxQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3pCLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQ2xDLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMvQixJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUNuRCxPQUFPLFVBQVUsQ0FBQztTQUNyQjtLQUNKO0FBQ0wsQ0FBQztBQVRELHNDQVNDO0FBTUQsU0FBZ0Isa0JBQWtCLENBQUMsVUFBa0I7SUFDakQsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ2QsSUFBSSxHQUFHLEdBQUcsVUFBVSxHQUFHLEVBQUUsQ0FBQztJQUMxQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMs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