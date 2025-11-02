"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkShunzi = exports.checkHaveChangeShunzi = exports.checkBaozi = exports.finallyCheck = exports.robotCardsType = exports.loseCards = exports.robotGrop = exports.robotCardsToCombination = void 0;
const RummyConst = require("../lib/RummyConst");
const index_2 = require("../../../utils/index");
const commonUtil_1 = require("../../../utils/lottery/commonUtil");
const RummyLogic = require("../lib/RummyLogic");
let CC_DEBUG = false;
function robotCardsToCombination(cards, changeCardList, getCard = null) {
    let lastCards = cards;
    let cardTypeList = [];
    let needCards = [];
    let loseCard = null;
    for (let i = 0; i < 2; i++) {
        let result = robotCardsType(lastCards, changeCardList, cardTypeList, needCards);
        lastCards = result.lastCards;
        cardTypeList = result.cardTypeList;
        needCards = result.needCards;
    }
    if (cards.length == 14) {
        if (cards.length == 14) {
            const result = loseCards(cards, cardTypeList, lastCards, changeCardList, getCard);
            loseCard = result.loseCard;
            cardTypeList = result.cardTypeList;
            cards = result.cards;
            lastCards = result.lastCards;
        }
    }
    if (lastCards.length > 0) {
        cardTypeList.push({ type: RummyConst.CardsType.SINGLE, cards: lastCards });
    }
    let cardsList = [];
    for (let m of cardTypeList) {
        cardsList.push({ key: m.type, value: m.cards });
    }
    needCards = unique(needCards);
    CC_DEBUG && console.warn("最后丢弃的牌", loseCard);
    CC_DEBUG && console.warn("最后的牌组", cardsList);
    CC_DEBUG && console.warn("最后需要的牌", needCards);
    return { cards, loseCard, cardTypeList: cardsList, needCards };
}
exports.robotCardsToCombination = robotCardsToCombination;
function robotGrop(point, cards, cardTypeList, changeCardList, round) {
    if (round == 1 && point <= 70) {
        return false;
    }
    const item = cardTypeList.find(x => x.key == RummyConst.CardsType.SHUN_GOLDENFLOWER_ONE);
    if (item) {
        return false;
    }
    let Separate_2 = robotCardsChangeCardsSeparate(cards, changeCardList);
    let guiPaiCombination = robotCardsGuiPaiSeparate(Separate_2.lastCards);
    let listenNum = Separate_2.robotChangeCards.length + guiPaiCombination.robotGuiPaiCards.length;
    if (listenNum >= 2) {
        return false;
    }
    if (round == 3) {
        const random = (0, commonUtil_1.randomFromRange)(0, 100);
        if (random < 50) {
            return false;
        }
    }
    return true;
}
exports.robotGrop = robotGrop;
function loseCards(cards, cardTypeList, lastCards, changeCardList, getCard) {
    let loseCard = null;
    let Separate_2 = robotCardsChangeCardsSeparate(lastCards, changeCardList);
    let guiPaiCombination = robotCardsGuiPaiSeparate(Separate_2.lastCards);
    CC_DEBUG && console.warn("22222222222", guiPaiCombination.lastCards);
    CC_DEBUG && console.warn("222222222221111111111", Separate_2.robotChangeCards);
    if (guiPaiCombination.lastCards.length > 0) {
        loseCard = getLoseCard(guiPaiCombination.lastCards, getCard);
    }
    else {
        if (lastCards.length == 0) {
            CC_DEBUG && console.warn("cardTypeList...22222", cardTypeList);
            const result = getLoseCardForCardTypeList(cardTypeList, changeCardList);
            if (result && result.card) {
                loseCard = result.card;
                cardTypeList = result.cardTypeList;
            }
        }
        else if (lastCards.length > 0) {
            if (Separate_2.robotChangeCards > 0 || guiPaiCombination.robotGuiPaiCards > 0) {
                let card = null;
                if (Separate_2.robotChangeCards > 0) {
                    card = Separate_2.robotChangeCards[0];
                }
                else if (guiPaiCombination.robotGuiPaiCards > 0) {
                    card = guiPaiCombination.robotGuiPaiCards[0];
                }
                loseCard = checkLoseCard(cardTypeList, card, changeCardList);
                if (card != null) {
                    let index = lastCards.indexOf(card);
                    if (index != -1) {
                        lastCards.splice(index, 1);
                    }
                }
            }
        }
    }
    if (loseCard != null) {
        let index = cards.indexOf(loseCard);
        cards.splice(index, 1);
        let index_ = lastCards.indexOf(loseCard);
        if (index_ != -1) {
            lastCards.splice(index_, 1);
        }
    }
    return { loseCard, cardTypeList, cards, lastCards };
}
exports.loseCards = loseCards;
function checkLoseCard(cardTypeList, robotChangeCard, changeCardList) {
    let item = null;
    let card = null;
    const fourCardsType = cardTypeList.filter(x => x.cards.length >= 4);
    if (fourCardsType.length > 1) {
        const ll = fourCardsType.filter(x => x.type == RummyConst.CardsType.SHUN_GOLDENFLOWER);
        if (ll.length > 0) {
            item = ll[0];
        }
        else {
            item = fourCardsType[0];
        }
    }
    else {
        item = fourCardsType[0];
    }
    if (item) {
        let cards = item.cards;
        let type = RummyConst.CardsType.SHUN_GOLDENFLOWER;
        let index = cardTypeList.findIndex(x => x.cards.sort().toString() == cards.sort().toString());
        let Separate_2 = robotCardsChangeCardsSeparate(cards, changeCardList);
        let guiPaiCombination = robotCardsGuiPaiSeparate(Separate_2.lastCards);
        let cards_ = guiPaiCombination.lastCards.sort((a, b) => b - a);
        if (cards_.length > 0) {
            card = cards_[cards_.length - 1];
        }
        if (card) {
            let index_1 = cards.indexOf(card);
            cards.splice(index_1, 1);
            cards.push(robotChangeCard);
            cardTypeList.splice(index, 1);
            cardTypeList.push({ type: type, cards });
        }
    }
    return card;
}
function getLoseCardForCardTypeList(cardTypeList, changeCardList) {
    const fourCardsType = cardTypeList.filter(x => x.cards.length >= 4);
    let item = null;
    let card = null;
    if (fourCardsType.length > 1) {
        const ll = fourCardsType.filter(x => x.type == RummyConst.CardsType.SHUN_GOLDENFLOWER);
        if (ll.length > 0) {
            item = ll[0];
        }
        else {
            item = fourCardsType[0];
        }
    }
    else {
        item = fourCardsType[0];
    }
    if (item) {
        let cards = item.cards;
        let Separate_2 = robotCardsChangeCardsSeparate(cards, changeCardList);
        let guiPaiCombination = robotCardsGuiPaiSeparate(Separate_2.lastCards);
        let cards_ = guiPaiCombination.lastCards.sort((a, b) => b - a);
        if (cards_.length > 0) {
            card = cards_[cards_.length - 1];
        }
    }
    if (card != null) {
        const cardDel = cardDelToCardTypeList(card, item, cardTypeList);
        cardTypeList = cardDel.cardTypeList;
        return { card, cardTypeList };
    }
    else {
        return { card, cardTypeList };
    }
}
function getLoseCard(lastCards, getCard) {
    let list_unsame = [];
    let card0 = [];
    let card1 = [];
    let card2 = [];
    let card3 = [];
    for (let m of lastCards) {
        if (!list_unsame.includes(m)) {
            list_unsame.push(m);
        }
        else {
            return m;
        }
        let type = Math.floor(m / 13);
        if (type == 0) {
            card0.push(m % 13);
        }
        else if (type == 1) {
            card1.push(m % 13);
        }
        else if (type == 2) {
            card2.push(m % 13);
        }
        else if (type == 3) {
            card3.push(m % 13);
        }
    }
    CC_DEBUG && console.warn("lastCards...", lastCards);
    let list = [{ type: 0, cards: card0 }, { type: 1, cards: card1 }, { type: 2, cards: card2 }, { type: 3, cards: card3 }];
    list = list.filter(x => x.cards.length !== 0);
    list.sort((a, b) => a.cards.length - b.cards.length);
    CC_DEBUG && console.warn("list...", list);
    let item = list[0];
    CC_DEBUG && console.warn("丢弃牌组...", list);
    let cards = item.cards.sort((a, b) => b - a);
    let card = (item.type * 13) + cards[0];
    if (getCard && card == getCard) {
        card = (item.type * 13) + cards[cards.length - 1];
    }
    CC_DEBUG && console.warn("丢弃的牌...", card);
    return card;
}
function robotCardsType(cards, changeCardList, cardTypeList, needCards) {
    let allCards = cards;
    let lastCards = cards;
    const firstCombination = robotCardsCombination(lastCards);
    CC_DEBUG && console.warn("firstCombination..........cardTypeList", firstCombination.list);
    CC_DEBUG && console.warn("firstCombination..........sameCards", firstCombination.sameCards);
    CC_DEBUG && console.warn("firstCombination..........guiPaiList", firstCombination.guiPaiList);
    const checkOne = checkOneShunzi(firstCombination.list, firstCombination.sameCards, cardTypeList, firstCombination.guiPaiList, changeCardList, needCards);
    CC_DEBUG && console.warn("checkOne..........lastCards", checkOne.lastCards);
    CC_DEBUG && console.warn("checkOne..........cardTypeList", checkOne.cardTypeList);
    CC_DEBUG && console.warn("checkOne..........needCards", needCards);
    lastCards = checkOne.lastCards;
    cardTypeList = checkOne.cardTypeList;
    const firstCombination_one = robotCardsCombination(checkOne.lastCards);
    const checkOne1 = checkOneShunzi(firstCombination_one.list, firstCombination_one.sameCards, cardTypeList, firstCombination_one.guiPaiList, changeCardList, needCards);
    lastCards = checkOne1.lastCards;
    cardTypeList = checkOne1.cardTypeList;
    CC_DEBUG && console.warn("checkOne1..........lastCards", checkOne1.lastCards);
    CC_DEBUG && console.warn("checkOne1..........cardTypeList", checkOne1.cardTypeList);
    CC_DEBUG && console.warn("checkOne1..........needCards", needCards);
    let Separate = robotCardsChangeCardsSeparate(lastCards, changeCardList);
    CC_DEBUG && console.warn("Separate....lastCards", Separate.lastCards);
    CC_DEBUG && console.warn("Separate...robotChangeCards", Separate.robotChangeCards);
    const doubleCombination = robotCardsCombination(Separate.lastCards);
    CC_DEBUG && console.warn("doubleCombination....lastCards", doubleCombination.list);
    CC_DEBUG && console.warn("doubleCombination...sameCards", doubleCombination.sameCards);
    CC_DEBUG && console.warn("doubleCombination...guiPaiList", doubleCombination.guiPaiList);
    const secondCheck = checkTwoShunzi(doubleCombination.list, doubleCombination.sameCards, cardTypeList, doubleCombination.guiPaiList, Separate.robotChangeCards, needCards);
    lastCards = secondCheck.lastCards;
    cardTypeList = secondCheck.cardTypeList;
    CC_DEBUG && console.warn("secondCheck..........cardTypeList", secondCheck.cardTypeList);
    CC_DEBUG && console.warn("secondCheck..........lastCards", secondCheck.lastCards);
    CC_DEBUG && console.warn("secondCheck..........needCards", needCards);
    let Separate_2 = robotCardsChangeCardsSeparate(lastCards, changeCardList);
    CC_DEBUG && console.warn("Separate_2..........lastCards", Separate_2.lastCards);
    CC_DEBUG && console.warn("Separate_2..........robotChangeCards", Separate_2.robotChangeCards);
    let guiPaiCombination = robotCardsGuiPaiSeparate(Separate_2.lastCards);
    CC_DEBUG && console.warn("guiPaiCombination..........lastCards", guiPaiCombination.lastCards);
    CC_DEBUG && console.warn("guiPaiCombination..........robotGuiPaiCards", guiPaiCombination.robotGuiPaiCards);
    let baoziCheck = checkBaozi(guiPaiCombination.lastCards, Separate_2.robotChangeCards, guiPaiCombination.robotGuiPaiCards, cardTypeList, needCards);
    CC_DEBUG && console.warn("baoziCheck..........lastCards", baoziCheck.lastCards);
    CC_DEBUG && console.warn("baoziCheck..........cardTypeList", baoziCheck.cardTypeList);
    CC_DEBUG && console.warn("baoziCheck..........needCards", needCards);
    lastCards = baoziCheck.lastCards;
    cardTypeList = baoziCheck.cardTypeList;
    if (lastCards.length >= 2) {
        const finallyResult = finallyCheck(lastCards, cardTypeList, changeCardList, allCards);
        lastCards = finallyResult.lastCards;
        cardTypeList = finallyResult.cardTypeList;
    }
    CC_DEBUG && console.warn("lastCards...finally", lastCards);
    CC_DEBUG && console.warn("cardTypeList...finally", cardTypeList);
    CC_DEBUG && console.warn("needCards...needCards", needCards);
    return { lastCards, cardTypeList, needCards };
}
exports.robotCardsType = robotCardsType;
function finallyCheck(lastCards, cardTypeList, changeCardList, allCards) {
    let guiPaiCombination = robotCardsGuiPaiSeparate(lastCards);
    let changeCombination = robotCardsChangeCardsSeparate(guiPaiCombination.lastCards, changeCardList);
    if (lastCards.length == 2) {
        if (allCards.length == 14) {
            if (changeCombination.lastCards.length == 1) {
                if (guiPaiCombination.robotGuiPaiCards.length == 1) {
                    let card = guiPaiCombination.robotGuiPaiCards[0];
                    CC_DEBUG && console.warn("11111111111");
                    const addResult = addCard(card, cardTypeList, lastCards);
                    lastCards = addResult.lastCards;
                    cardTypeList = addResult.cardTypeList;
                }
                else if (changeCombination.robotChangeCards.length == 1) {
                    CC_DEBUG && console.warn("222222222");
                    let card = changeCombination.robotChangeCards[0];
                    const addResult = addCard(card, cardTypeList, lastCards);
                    lastCards = addResult.lastCards;
                    cardTypeList = addResult.cardTypeList;
                }
            }
        }
        else {
            const fourCardsType = cardTypeList.filter(x => x.cards.length >= 4);
            CC_DEBUG && console.warn("总牌只有13张,所以需要取1张出来作为牌组组合fourCardsType", fourCardsType);
            let item = null;
            let card = null;
            if (fourCardsType.length > 1) {
                const ll = fourCardsType.filter(x => x.type == RummyConst.CardsType.SHUN_GOLDENFLOWER);
                if (ll.length > 0) {
                    item = ll[0];
                }
                else {
                    item = fourCardsType[0];
                }
            }
            else {
                item = fourCardsType[0];
            }
            CC_DEBUG && console.warn("item..........", item);
            if (item) {
                if (item.type == RummyConst.CardsType.SHUN_GOLDENFLOWER_ONE) {
                    const cards = item.cards.sort((a, b) => a - b);
                    if (changeCardList.includes(cards[0])) {
                        card = cards[0];
                    }
                    else if (changeCardList.includes(cards[cards.length - 1])) {
                        card = cards[cards.length - 1];
                    }
                    else {
                        card = cards[cards.length - 1];
                    }
                }
                else {
                    let cards = item.cards;
                    let guiPaiCombination = robotCardsGuiPaiSeparate(cards);
                    let changeCombination = robotCardsChangeCardsSeparate(guiPaiCombination.lastCards, changeCardList);
                    card = changeCombination.lastCards[0];
                }
            }
            CC_DEBUG && console.warn("card..........", card);
            if (card != null) {
                lastCards.push(card);
                const cardDel = cardDelToCardTypeList(card, item, cardTypeList);
                cardTypeList = cardDel.cardTypeList;
            }
        }
    }
    else if (lastCards.length == 3) {
        if (changeCombination.lastCards.length == 1 && allCards.length == 13) {
            cardTypeList.push({ type: RummyConst.CardsType.SHUN_GOLDENFLOWER, cards: lastCards });
            lastCards = [];
        }
        else {
            const fourCardsType = cardTypeList.filter(x => x.cards.length >= 4);
            CC_DEBUG && console.warn("fourCardsType...3", fourCardsType);
            let item = null;
            let card = null;
            if (fourCardsType.length > 1) {
                const ll = fourCardsType.filter(x => x.type == RummyConst.CardsType.SHUN_GOLDENFLOWER);
                if (ll.length > 0) {
                    item = ll[0];
                }
                else {
                    item = fourCardsType[0];
                }
            }
            else {
                item = fourCardsType[0];
            }
            CC_DEBUG && console.warn("item..........", item);
            if (item) {
                if (item) {
                    if (item.type == RummyConst.CardsType.SHUN_GOLDENFLOWER_ONE) {
                        const cards = item.cards.sort((a, b) => a - b);
                        if (changeCardList.includes(cards[0])) {
                            card = cards[0];
                        }
                        else if (changeCardList.includes(cards[cards.length - 1])) {
                            card = cards[cards.length - 1];
                        }
                        else {
                            card = cards[cards.length - 1];
                        }
                    }
                    else {
                        let cards = item.cards;
                        let guiPaiCombination = robotCardsGuiPaiSeparate(cards);
                        let changeCombination = robotCardsChangeCardsSeparate(guiPaiCombination.lastCards, changeCardList);
                        card = changeCombination.lastCards[0];
                    }
                }
            }
            if (card != null) {
                lastCards.push(card);
                const cardDel = cardDelToCardTypeList(card, item, cardTypeList);
                cardTypeList = cardDel.cardTypeList;
            }
        }
    }
    else if (lastCards.length >= 4) {
        if (changeCombination.lastCards.length == 2) {
            let cards = [];
            let finallyCard = null;
            if (changeCombination.lastCards[0] && changeCombination.lastCards[1] && changeCombination.lastCards[0] % 13 > changeCombination.lastCards[1] % 13) {
                finallyCard = changeCombination.lastCards[1];
            }
            else {
                finallyCard = changeCombination.lastCards[0];
            }
            if (guiPaiCombination.robotGuiPaiCards.length > 0) {
                CC_DEBUG && console.warn("guiPaiCombination.robotGuiPaiCards...", guiPaiCombination.robotGuiPaiCards);
                cards = cards.concat(guiPaiCombination.robotGuiPaiCards);
                for (let m of guiPaiCombination.robotGuiPaiCards) {
                    let index = lastCards.findIndex(x => x == m);
                    lastCards.splice(index, 1);
                }
            }
            if (changeCombination.robotChangeCards.length > 0) {
                CC_DEBUG && console.warn("changeCombination.robotChangeCards...", changeCombination.robotChangeCards);
                cards = cards.concat(changeCombination.robotChangeCards);
                for (let m of changeCombination.robotChangeCards) {
                    let index = lastCards.findIndex(x => x == m);
                    lastCards.splice(index, 1);
                }
            }
            CC_DEBUG && console.warn("changeCombination.robotChangeCards...cards", cards);
            CC_DEBUG && console.warn("changeCombination.robotChangeCards...finallyCard", finallyCard);
            if (finallyCard != null) {
                cards.push(finallyCard);
                cardTypeList.push({ type: RummyConst.CardsType.SHUN_GOLDENFLOWER, cards: cards });
                let index = lastCards.findIndex(x => x == finallyCard);
                lastCards.splice(index, 1);
            }
        }
    }
    CC_DEBUG && console.warn("lastCards.........", lastCards);
    CC_DEBUG && console.warn("cardTypeList.........", cardTypeList);
    return { lastCards, cardTypeList };
}
exports.finallyCheck = finallyCheck;
function cardDelToCardTypeList(card, cardsType, cardTypeList) {
    let index = cardTypeList.findIndex(x => x.cards.sort().toString() == cardsType.cards.sort().toString());
    cardTypeList.splice(index, 1);
    const index_card = cardsType.cards.findIndex(x => x == card);
    cardsType.cards.splice(index_card, 1);
    cardTypeList.push(cardsType);
    return { cardTypeList };
}
function addCard(card, cardTypeList, lastCards) {
    const index = lastCards.indexOf(card);
    const typeList = cardTypeList.filter(x => x.type == RummyConst.CardsType.SHUN_GOLDENFLOWER && x.cards.length == 3);
    const typeList_ = cardTypeList.filter(x => x.type == RummyConst.CardsType.SHUN_GOLDENFLOWER_ONE);
    if (typeList.length > 0) {
        let item = typeList[0];
        let index = cardTypeList.findIndex(x => x.cards.sort().toString() == item.cards.sort().toString());
        cardTypeList.splice(index, 1);
        item.cards.push(card);
        cardTypeList.push(item);
    }
    else if (typeList_.length > 1) {
        const item = typeList_.find(x => x.cards.length == 3);
        if (item) {
            let index = cardTypeList.findIndex(x => x.cards.sort().toString() == item.cards.sort().toString());
            cardTypeList.splice(index, 1);
            item.cards.push(card);
            item.type = RummyConst.CardsType.SHUN_GOLDENFLOWER;
            cardTypeList.push(item);
        }
    }
    CC_DEBUG && console.warn("list......", cardTypeList);
    CC_DEBUG && console.warn("card2222......", card);
    if (card != null) {
        lastCards.splice(index, 1);
        CC_DEBUG && console.warn("lastCards.22222.....", lastCards);
    }
    CC_DEBUG && console.warn("cardTypeList1111......", cardTypeList);
    CC_DEBUG && console.warn("lastCards......", lastCards);
    return { cardTypeList: cardTypeList, lastCards };
}
function checkBaozi(lastCards, robotChangeCards, guiPaiList, cardTypeList, needCards) {
    let ss = lastCards;
    let sameCards = [];
    CC_DEBUG && console.warn("开检查条子：lastCards", ss);
    CC_DEBUG && console.warn("开始检查条子：guiPaiList", guiPaiList);
    CC_DEBUG && console.warn("开始检查条子：robotChangeCards", robotChangeCards);
    const sameList = roboteCheckAlike(ss);
    CC_DEBUG && console.warn("sameList", sameList);
    let doubleSameList = sameList.filter(x => x.value > 1);
    CC_DEBUG && console.warn("doubleSameList", doubleSameList);
    if (doubleSameList.length > 0) {
        for (let item of doubleSameList) {
            let key = parseInt(item.key);
            let value = item.value;
            for (let i = 1; i < value; i++) {
                const index = ss.indexOf(key);
                ss.splice(index, 1);
                sameCards.push(key);
            }
        }
    }
    CC_DEBUG && console.warn("ss...........", ss);
    CC_DEBUG && console.warn("sameCards...........", sameCards);
    let list = [];
    for (let m of ss) {
        list.push({ num: m % 13, card: m });
    }
    CC_DEBUG && console.warn("list...", list);
    let result = [];
    for (let i = 0; i < 10; i++) {
        let resultCards = list.filter(m => m.num == i);
        let cards = [];
        for (let m of resultCards) {
            cards.push(m.card);
        }
        if (cards.length >= 1) {
            result.push(cards);
        }
    }
    CC_DEBUG && console.warn("result..", result);
    let lastListThree = result.filter(x => x.length >= 3);
    let lastListTwo = result.filter(x => x.length == 2);
    let goodList = [];
    CC_DEBUG && console.warn("lastListTwo..", lastListTwo);
    CC_DEBUG && console.warn("lastListThree..", lastListThree);
    CC_DEBUG && console.warn("robotChangeCards..", robotChangeCards);
    if (lastListThree.length > 0) {
        for (let m of lastListThree[0]) {
            const index = ss.indexOf(m);
            if (index !== -1) {
                ss.splice(index, 1);
            }
        }
        goodList = lastListThree[0];
    }
    else if (lastListTwo.length > 0) {
        if (robotChangeCards.length > 0) {
            goodList = lastListTwo[0];
            for (let m of lastListTwo[0]) {
                const index = ss.indexOf(m);
                if (index !== -1) {
                    ss.splice(index, 1);
                }
            }
            goodList.push(robotChangeCards[0]);
            const index = robotChangeCards.indexOf(robotChangeCards[0]);
            robotChangeCards.splice(index, 1);
        }
        else if (robotChangeCards.length == 0 && guiPaiList.length > 0) {
            goodList = lastListTwo[0];
            goodList.push(guiPaiList[0]);
            CC_DEBUG && console.warn("拥有两个条子的组合", lastListTwo);
            CC_DEBUG && console.warn("拥有两个条子的组合__ss", ss);
            for (let m of lastListTwo[0]) {
                const index = ss.indexOf(m);
                CC_DEBUG && console.warn("拥有两个条子的组合__index", index);
                if (index !== -1) {
                    ss.splice(index, 1);
                }
            }
            CC_DEBUG && console.warn("拥有两个条子的组合__ss__", ss);
            const index = guiPaiList.indexOf(guiPaiList[0]);
            guiPaiList.splice(index, 1);
        }
        else {
            let key = [];
            let key_num = 0;
            for (let m of lastListTwo[0]) {
                key.push(Math.floor(m / 13));
                key_num = m % 13;
            }
            for (let i = 0; i < 4; i++) {
                if (!key.includes(i)) {
                    addCardToNeedCards(key_num, i, needCards);
                }
            }
        }
    }
    CC_DEBUG && console.warn("组合成条子的数组..", goodList);
    CC_DEBUG && console.warn("ss..剩余牌", ss);
    ss = ss.concat(sameCards, guiPaiList, robotChangeCards);
    if (goodList.length > 0) {
        cardTypeList.push({ type: RummyConst.CardsType.BAOZI, cards: goodList });
    }
    CC_DEBUG && console.warn("检查条子结束剩余牌：", ss);
    CC_DEBUG && console.warn("检查条子结束组成的牌组..", cardTypeList);
    CC_DEBUG && console.warn("检查条子结束需要的牌..", needCards);
    return { cardTypeList, lastCards: ss };
}
exports.checkBaozi = checkBaozi;
function robotSameCards(cards, changeCardList) {
    let haveChangeCard = false;
    let haveThreeCards = false;
    let isSameHuase = false;
    if (cards.length >= 3) {
        haveThreeCards = true;
    }
    for (let m of cards) {
        if (changeCardList.includes(m)) {
            haveChangeCard = true;
        }
    }
    let card0 = [];
    let card1 = [];
    let card2 = [];
    let card3 = [];
    for (let m of cards) {
        let type = Math.floor(m / 13);
        if (type == 0) {
            card0.push(m);
        }
        else if (type == 1) {
            card1.push(m);
        }
        else if (type == 2) {
            card2.push(m);
        }
        else if (type == 3) {
            card3.push(m);
        }
    }
    let list = [{ type: 0, cards: card0 }, { type: 1, cards: card1 }, { type: 2, cards: card2 }, { type: 3, cards: card3 }];
    for (let m of list) {
        if (m.cards.length >= 3) {
            isSameHuase = true;
        }
    }
    return { haveChangeCard, haveThreeCards, isSameHuase };
}
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
function robotCardsCombination(cards) {
    let sameCards = [];
    const result = RummyLogic.checkHaveGuiPai(cards);
    let notGuiPaiList = result.cardList;
    const sameList = roboteCheckAlike(notGuiPaiList);
    let doubleSameList = sameList.filter(x => x.value > 1);
    if (doubleSameList.length > 0) {
        CC_DEBUG && console.warn("doubleSameList", doubleSameList);
        for (let item of doubleSameList) {
            let key = parseInt(item.key);
            let value = item.value;
            for (let i = 1; i < value; i++) {
                const index = notGuiPaiList.indexOf(key);
                notGuiPaiList.splice(index, 1);
                sameCards.push(key);
            }
        }
    }
    CC_DEBUG && console.warn("notGuiPaiList", notGuiPaiList);
    let card0 = [];
    let card1 = [];
    let card2 = [];
    let card3 = [];
    for (let m of notGuiPaiList) {
        let type = Math.floor(m / 13);
        if (type == 0) {
            card0.push(m % 13);
        }
        else if (type == 1) {
            card1.push(m % 13);
        }
        else if (type == 2) {
            card2.push(m % 13);
        }
        else if (type == 3) {
            card3.push(m % 13);
        }
    }
    let list = [{ type: 0, cards: card0 }, { type: 1, cards: card1 }, { type: 2, cards: card2 }, { type: 3, cards: card3 }];
    return { list, sameCards, guiPaiList: result.guiPaiList };
}
function checkOneShunzi(list, sameCards, cardTypeList, guiPaiList, changeCardList, needCards) {
    let lastCards = [];
    for (let item of list) {
        let type = item.type;
        let cards = item.cards;
        if (cards.length >= 3) {
            const { goodList, loseList } = checkShunzi(cards, changeCardList, type, needCards);
            if (goodList && goodList.length >= 3) {
                let backCards = cardToBack(type, goodList);
                cardTypeList.push({ type: RummyConst.CardsType.SHUN_GOLDENFLOWER_ONE, cards: backCards });
            }
            if (loseList && loseList.length > 0) {
                let backCards = cardToBack(type, loseList);
                lastCards = lastCards.concat(backCards);
            }
        }
        else {
            let backCards = cardToBack(type, cards);
            lastCards = lastCards.concat(backCards);
        }
    }
    lastCards = lastCards.concat(sameCards);
    lastCards = lastCards.concat(guiPaiList);
    return { cardTypeList, lastCards };
}
function checkTwoShunzi(list, sameCards, cardTypeList, guiPaiList, robotChangeCards, needCards) {
    let lastCards = [];
    for (let item of list) {
        let type = item.type;
        let cards = item.cards;
        if (cards.length >= 2) {
            let { goodList, loseList } = checkHaveChangeShunzi(cards, type, needCards);
            CC_DEBUG && console.warn("goodList...", goodList);
            CC_DEBUG && console.warn("loseList...", loseList);
            CC_DEBUG && console.warn("robotChangeCards...", robotChangeCards);
            CC_DEBUG && console.warn("guiPaiList...", guiPaiList);
            if (goodList && goodList.length >= 2) {
                if (robotChangeCards.length > 0 || guiPaiList.length > 0) {
                    CC_DEBUG && console.warn("判断是否有听用牌变牌和鬼牌...", goodList);
                    if (robotChangeCards.length > 0) {
                        let cards = cardToBack(type, goodList);
                        const card = robotChangeCards[0];
                        CC_DEBUG && console.warn("card...", card);
                        const index = robotChangeCards.indexOf(card);
                        if (index !== -1) {
                            robotChangeCards.splice(index, 1);
                        }
                        cards.push(card);
                        cardTypeList.push({ type: RummyConst.CardsType.SHUN_GOLDENFLOWER, cards: cards });
                    }
                    else if (robotChangeCards.length == 0 && guiPaiList.length > 0) {
                        const card = guiPaiList[0];
                        const index = guiPaiList.indexOf(card);
                        guiPaiList.splice(index, 1);
                        let cards = cardToBack(type, goodList);
                        cards.push(card);
                        cardTypeList.push({ type: RummyConst.CardsType.SHUN_GOLDENFLOWER, cards: cards });
                    }
                }
                else {
                    let goodListCards = cardToBack(type, goodList);
                    lastCards = lastCards.concat(goodListCards);
                }
            }
            if (loseList && loseList.length > 0) {
                let cards = cardToBack(type, loseList);
                lastCards = lastCards.concat(cards);
            }
        }
        else {
            let backCards = cardToBack(type, cards);
            lastCards = lastCards.concat(backCards);
        }
    }
    CC_DEBUG && console.warn("lastCards...", lastCards);
    lastCards = lastCards.concat(sameCards);
    lastCards = lastCards.concat(guiPaiList);
    lastCards = lastCards.concat(robotChangeCards);
    return { cardTypeList, lastCards };
}
function checkHaveChangeShunzi(cards, type, needCards) {
    const ss = cards;
    ss.sort((a, b) => (a - b));
    let list = [];
    CC_DEBUG && console.warn("开始检测是否有顺子的可能：", ss);
    for (let i = 0; i < ss.length - 1; i++) {
        CC_DEBUG && console.warn("判断是否有两个相差数成连子............", ss[i]);
        let goodList_ = [];
        if ((ss[0] == 0 && ss[ss.length - 1] == 12)) {
            goodList_.push(ss[0]);
            goodList_.push(ss[ss.length - 1]);
            list.push({ num: goodList_.length, goodList: goodList_ });
            addCardToNeedCards(ss[ss.length - 1] - 1, type, needCards);
        }
        else if ((ss[0] == 0 && ss[ss.length - 1] == 11)) {
            goodList_.push(ss[0]);
            goodList_.push(ss[ss.length - 1]);
            list.push({ num: goodList_.length, goodList: goodList_ });
            addCardToNeedCards(ss[ss.length - 1] + 1, type, needCards);
        }
        for (let j = 1; j < ss.length; j++) {
            let goodList = [];
            if (ss[i + j] && ss[i] == ss[i + j] - 1) {
                if (ss[i + j + 1] && (ss[i + j] == ss[i + j + 1] - 2)) {
                    goodList.push(ss[i]);
                    goodList.push(ss[i + j]);
                    goodList.push(ss[i + j + 1]);
                    list.push({ num: goodList.length, goodList });
                    addCardToNeedCards(ss[i + j + 1] - 1, type, needCards);
                }
                else {
                    goodList.push(ss[i]);
                    goodList.push(ss[i + j]);
                    list.push({ num: goodList.length, goodList });
                    addCardToNeedCards(ss[i + j] + 1, type, needCards);
                }
            }
            else if (ss[i + j] && ss[i] == ss[i + j] - 2) {
                if (ss[i + j + 1] && ss[i + j] == ss[i + j + 1] - 1) {
                    goodList.push(ss[i]);
                    goodList.push(ss[i + j]);
                    goodList.push(ss[i + j + 1]);
                    list.push({ num: goodList.length, goodList });
                }
                else {
                    goodList.push(ss[i]);
                    goodList.push(ss[i + j]);
                    list.push({ num: goodList.length, goodList });
                    addCardToNeedCards(ss[i + j] + 1, type, needCards);
                }
            }
        }
    }
    let list_1 = [];
    let maxLength = 0;
    CC_DEBUG && console.warn("差一张组成连子333...list", list);
    list = getUnique(list);
    if (list.length > 0) {
        for (let item of list) {
            let numLength = item.num;
            if (maxLength < numLength) {
                maxLength = numLength;
            }
            let points = 0;
            for (let m of item.goodList) {
                points += cardPoint(m);
            }
            list_1.push({ cardLength: numLength, points, cards: item.goodList });
        }
        CC_DEBUG && console.warn("list_1...", list_1);
        const ls = list_1.filter(x => x.cardLength == maxLength);
        const lss = ls.sort((a, b) => b.points - a.point);
        const finallyList = lss[0];
        CC_DEBUG && console.warn("finallyList...", finallyList);
        const loseList = (0, index_2.getArrDifference)(ss, finallyList.cards);
        CC_DEBUG && console.warn("loseCards...", loseList);
        CC_DEBUG && console.warn("finallyList.cards...", finallyList.cards);
        CC_DEBUG && console.warn("needCards...", needCards);
        let finallyCard = unique(finallyList.cards);
        return { goodList: finallyCard, loseList: loseList };
    }
    else {
        return { goodList: [], loseList: ss };
    }
}
exports.checkHaveChangeShunzi = checkHaveChangeShunzi;
function addCardToNeedCards(card, type, needCards) {
    if (card != -1 && card != 14) {
        if ([0, 1, 2, 3].includes(type)) {
            let card_ = type * 13 + card;
            needCards.push(card_);
        }
    }
}
function cardPoint(card) {
    const tenPoint = [0, 10, 11, 12];
    if (tenPoint.includes(card)) {
        return 10;
    }
    else {
        return card + 1;
    }
}
function cardToBack(type, cardList) {
    let backCardList = [];
    if ([0, 1, 2, 3].includes(type)) {
        for (let m of cardList) {
            backCardList.push((type * 13) + m);
        }
    }
    return backCardList;
}
function checkShunzi(ss, changeCardList, type, needCards) {
    ss = ss.sort((a, b) => (a - b));
    CC_DEBUG && console.warn("ss..11111", ss);
    const result = roboteCheckAlike(ss);
    let list = result.filter(x => x.value > 1);
    for (let item of list) {
        let key = parseInt(item.key);
        let value = item.value;
        for (let i = 1; i < value; i++) {
            const index = ss.indexOf(key);
            ss.splice(index, 1);
        }
    }
    let goodList = [];
    if (ss.length == 2) {
        CC_DEBUG && console.warn("ss..", ss);
        if (ss[0] == 0 && ss[1] == 12) {
            addCardToNeedCards(11, type, needCards);
        }
        else if (ss[0] == 0 && ss[1] == 11) {
            addCardToNeedCards(12, type, needCards);
        }
        else if (ss[0] + 1 == ss[1]) {
            addCardToNeedCards(ss[1] + 1, type, needCards);
        }
    }
    for (let i = 0; i < ss.length - 1; i++) {
        let item = [];
        if (ss[0] == 0 && ss[ss.length - 1] == 12) {
            if (ss[ss.length - 2] == 11) {
                item.push(ss[0]);
                item.push(ss[ss.length - 1]);
                item.push(ss[ss.length - 2]);
                goodList.push(item);
            }
            else {
                addCardToNeedCards(11, type, needCards);
                CC_DEBUG && console.warn("needCards...x1", needCards);
            }
        }
        for (let j = 1; j < ss.length - 1; j++) {
            let item = [];
            if (ss[i + j] && ss[i] == ss[i + j] - 1) {
                if (ss[i + j + 1] && ss[i + j] - 1 == ss[i + j + 1] - 2) {
                    item.push(ss[i]);
                    item.push(ss[i + j]);
                    item.push(ss[i + j + 1]);
                    goodList.push(item);
                }
                else {
                    item.push(ss[i]);
                    item.push(ss[i + j]);
                    goodList.push(item);
                    if (item.length < 2) {
                        addCardToNeedCards(ss[i + j] + 1, type, needCards);
                        CC_DEBUG && console.warn("needCards...x2", needCards);
                    }
                }
            }
            else if (ss[i + j] && ss[i] == ss[i + j] - 2) {
                if (!ss.includes(ss[i + j] - 1)) {
                    addCardToNeedCards(ss[i + j] - 1, type, needCards);
                }
                CC_DEBUG && console.warn("needCards...x3", needCards);
            }
        }
    }
    goodList = getUnique(goodList);
    CC_DEBUG && console.warn("能组成纯连元素的二维数组", goodList);
    goodList = delOnlyTwo(goodList);
    CC_DEBUG && console.warn("去掉只有两个元素的数组过后", goodList);
    let ll = [];
    let aa = [];
    if (goodList.length > 1) {
        for (let i = 0; i < goodList.length - 1; i++) {
            if (goodList[i][0] == 0 && goodList[i].length >= 3) {
                let cards = goodList[i];
                if ((cards[1] == 12 && cards[2] == 11) || ((cards[1] == 1 && cards[2] == 2))) {
                    ll = ll.concat(goodList[i]);
                    break;
                }
            }
            else {
                if (goodList[i][2] == goodList[i + 1][1]) {
                    ll = ll.concat(goodList[i], goodList[i + 1]);
                }
                else {
                    if (goodList[i].length >= 3) {
                        ll = ll.concat(goodList[i]);
                    }
                }
            }
        }
    }
    else if (goodList.length > 0) {
        ll = goodList[0];
    }
    if (ll.length > 0) {
        ll = unique(ll);
        CC_DEBUG && console.warn("ll...重新检查是否是纯连", ll);
        ll.sort((a, b) => a - b);
        if (ll[0] != 0 || ll[ll.length - 1] != 12) {
            let ls = [];
            for (let i = 0; i < ll.length - 1; i++) {
                if (ll[i] == ll[i + 1] - 1) {
                    ls.push(ll[i]);
                    ls.push(ll[i + 1]);
                }
                else {
                    break;
                }
            }
            ls = unique(ls);
            if (ls.length >= 3) {
                ll = ls;
            }
            CC_DEBUG && console.warn("ls...重新检查是否是纯连", ls);
        }
        CC_DEBUG && console.warn("重新检查是否是纯连--ll被替换", ll);
        if (ll.length == 4) {
            if (changeCardList.includes(ll[0])) {
                ll.splice(0, 1);
            }
            else if (changeCardList.includes(ll[ll.length - 1])) {
                ll.splice(ll.length - 1, 1);
            }
        }
        else if (ll.length == 5) {
            if (changeCardList.includes(ll[0])) {
                ll.splice(0, 1);
            }
            if (changeCardList.includes(ll[ll.length - 1])) {
                ll.splice(ll.length - 1, 1);
            }
            if (ll.length == 5) {
                if (changeCardList.includes(ll[1])) {
                    ll.splice(0, 2);
                }
                else if (changeCardList.includes(ll[ll.length - 2])) {
                    ll.splice(ll.length - 2, 2);
                }
            }
        }
        else if (ll.length == 6) {
            if (changeCardList.includes(ll[0]) || changeCardList.includes(ll[1]) || changeCardList.includes(ll[2])) {
                ll.splice(0, 3);
            }
            else if (changeCardList.includes(ll[ll.length - 1]) || changeCardList.includes(ll[ll.length - 2]) || changeCardList.includes(ll[ll.length - 3])) {
                ll.splice(ll.length - 3, 3);
            }
        }
        else if (ll.length > 6) {
            if (changeCardList.includes(ll[0]) || changeCardList.includes(ll[1]) || changeCardList.includes(ll[2]) || changeCardList.includes(ll[2])) {
                ll.splice(0, 4);
            }
            else if (changeCardList.includes(ll[ll.length - 1]) || changeCardList.includes(ll[ll.length - 2]) || changeCardList.includes(ll[ll.length - 3]) || changeCardList.includes(ll[ll.length - 4])) {
                ll.splice(ll.length - 4, 4);
            }
        }
        CC_DEBUG && console.warn("ll...", ll);
        if (ll.length >= 3) {
            aa = (0, index_2.getArrDifference)(ss, ll);
            CC_DEBUG && console.warn("needCards...1之前", needCards);
            return { goodList: ll, loseList: aa };
        }
        else {
            CC_DEBUG && console.warn("needCards...2之前", needCards);
            CC_DEBUG && console.warn("needCards...2222222222", needCards);
            return { goodList: [], loseList: ss };
        }
    }
    else {
        CC_DEBUG && console.warn("needCards...3333333333333", needCards);
        return { goodList: [], loseList: ss };
    }
}
exports.checkShunzi = checkShunzi;
function delOnlyTwo(goodList) {
    let list = [];
    for (let m of goodList) {
        if (m.length >= 3) {
            list.push(m);
        }
    }
    return list;
}
function getUnique(array) {
    let obj = {};
    return array.filter((item, index) => {
        let newItem = item + JSON.stringify(item);
        return obj.hasOwnProperty(newItem) ? false : obj[newItem] = true;
    });
}
function unique(a) {
    let res = [];
    for (let i = 0, len = a.length; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
            if (a[i] === a[j])
                j = ++i;
        }
        res.push(a[i]);
    }
    return res;
}
function roboteCheckAlike(cards) {
    let prv = statisticalFieldNumber(cards);
    let list = [];
    for (let key in prv) {
        list.push({ key: key, value: prv[key] });
    }
    return list;
}
;
function statisticalFieldNumber(arr) {
    return arr.reduce(function (prev, next) {
        prev[next] = (prev[next] + 1) || 1;
        return prev;
    }, {});
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyZFR5cGVVdGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL1J1bW15L3JvYm90L2NhcmRUeXBlVXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsZ0RBQWdEO0FBQ2hELGdEQUFzRDtBQUN0RCxrRUFBa0U7QUFDbEUsZ0RBQWdEO0FBRWhELElBQUksUUFBUSxHQUFHLEtBQUssQ0FBQztBQU1yQixTQUFnQix1QkFBdUIsQ0FBQyxLQUFlLEVBQUcsY0FBeUIsRUFBRyxVQUFtQixJQUFJO0lBRXpHLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQztJQUN0QixJQUFJLFlBQVksR0FBVyxFQUFFLENBQUM7SUFDOUIsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBQ25CLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQztJQUNwQixLQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRyxDQUFDLEdBQUUsQ0FBQyxFQUFDLENBQUMsRUFBRSxFQUFDO1FBQ3hCLElBQUksTUFBTSxHQUE2QyxjQUFjLENBQUUsU0FBUyxFQUFHLGNBQWMsRUFBRSxZQUFZLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDeEgsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDN0IsWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7UUFDbkMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7S0FDakM7SUFJRCxJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksRUFBRSxFQUFFO1FBRXBCLElBQUcsS0FBSyxDQUFDLE1BQU0sSUFBSSxFQUFFLEVBQUM7WUFDbEIsTUFBTSxNQUFNLEdBQWlELFNBQVMsQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBQyxjQUFjLEVBQUcsT0FBTyxDQUFDLENBQUM7WUFDaEksUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7WUFDM0IsWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7WUFDbkMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDckIsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7U0FDaEM7S0FDSjtJQUdELElBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUM7UUFDcEIsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUMsU0FBUyxFQUFDLENBQUMsQ0FBQTtLQUN6RTtJQUNELElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQztJQUNuQixLQUFJLElBQUksQ0FBQyxJQUFLLFlBQVksRUFBQztRQUN2QixTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUcsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFBO0tBQ2xEO0lBRUQsU0FBUyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM5QixRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFFLENBQUM7SUFDOUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBRSxDQUFDO0lBQzlDLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUUsQ0FBQztJQUUvQyxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRyxZQUFZLEVBQUcsU0FBUyxFQUFFLFNBQVMsRUFBRSxDQUFBO0FBQ3BFLENBQUM7QUF6Q0QsMERBeUNDO0FBT0QsU0FBZ0IsU0FBUyxDQUFDLEtBQWEsRUFBRSxLQUFjLEVBQUUsWUFBcUIsRUFBRyxjQUF5QixFQUFHLEtBQWM7SUFDdkgsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxFQUFFLEVBQUU7UUFDM0IsT0FBUSxLQUFLLENBQUM7S0FDakI7SUFDRCxNQUFNLElBQUksR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQSxFQUFFLENBQUEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxVQUFVLENBQUMsU0FBUyxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDdkYsSUFBRyxJQUFJLEVBQUM7UUFDSixPQUFPLEtBQUssQ0FBQztLQUNoQjtJQUVELElBQUksVUFBVSxHQUFzQyw2QkFBNkIsQ0FBQyxLQUFLLEVBQUcsY0FBYyxDQUFDLENBQUM7SUFFMUcsSUFBSSxpQkFBaUIsR0FBc0Msd0JBQXdCLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzFHLElBQUksU0FBUyxHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDO0lBQy9GLElBQUksU0FBUyxJQUFJLENBQUMsRUFBQztRQUNoQixPQUFPLEtBQUssQ0FBQztLQUNmO0lBRUQsSUFBRyxLQUFLLElBQUksQ0FBQyxFQUFDO1FBQ1YsTUFBTSxNQUFNLEdBQUcsSUFBQSw0QkFBZSxFQUFDLENBQUMsRUFBQyxHQUFHLENBQUMsQ0FBQztRQUN0QyxJQUFHLE1BQU0sR0FBRSxFQUFFLEVBQUM7WUFDVixPQUFPLEtBQUssQ0FBQztTQUNoQjtLQUNKO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQztBQXpCRCw4QkF5QkM7QUFNRCxTQUFnQixTQUFTLENBQUMsS0FBZSxFQUFFLFlBQXFCLEVBQUcsU0FBb0IsRUFBRyxjQUF5QixFQUFHLE9BQWdCO0lBQzlILElBQUksUUFBUSxHQUFHLElBQUksQ0FBQztJQUdwQixJQUFJLFVBQVUsR0FBc0MsNkJBQTZCLENBQUMsU0FBUyxFQUFHLGNBQWMsQ0FBQyxDQUFDO0lBRTlHLElBQUksaUJBQWlCLEdBQXNDLHdCQUF3QixDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMxRyxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDcEUsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEVBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDOUUsSUFBRyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQztRQUN0QyxRQUFRLEdBQUcsV0FBVyxDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRyxPQUFPLENBQUMsQ0FBQztLQUNqRTtTQUFJO1FBQ0QsSUFBRyxTQUFTLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtZQUN0QixRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBQyxZQUFZLENBQUMsQ0FBQztZQUU5RCxNQUFNLE1BQU0sR0FBNEIsMEJBQTBCLENBQUMsWUFBWSxFQUFDLGNBQWMsQ0FBQyxDQUFBO1lBQy9GLElBQUcsTUFBTSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUM7Z0JBQ3JCLFFBQVEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFFO2dCQUN4QixZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQzthQUN0QztTQUNKO2FBQUssSUFBRyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQztZQUMxQixJQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLElBQUksaUJBQWlCLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxFQUFDO2dCQUV6RSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7Z0JBQ2hCLElBQUcsVUFBVSxDQUFDLGdCQUFnQixHQUFHLENBQUMsRUFBRTtvQkFDL0IsSUFBSSxHQUFHLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDMUM7cUJBQUssSUFBRyxpQkFBaUIsQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLEVBQUM7b0JBQzNDLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDakQ7Z0JBQ0QsUUFBUSxHQUFHLGFBQWEsQ0FBQyxZQUFZLEVBQUUsSUFBSSxFQUFDLGNBQWMsQ0FBQyxDQUFDO2dCQUM1RCxJQUFHLElBQUksSUFBSSxJQUFJLEVBQUM7b0JBQ1osSUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDcEMsSUFBRyxLQUFLLElBQUksQ0FBQyxDQUFDLEVBQUM7d0JBQ1gsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQzdCO2lCQUVKO2FBQ0o7U0FFSjtLQUVKO0lBYUQsSUFBRyxRQUFRLElBQUksSUFBSSxFQUFDO1FBQ2hCLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDcEMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEIsSUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN6QyxJQUFHLE1BQU0sSUFBSSxDQUFDLENBQUMsRUFBQztZQUNaLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzlCO0tBQ0o7SUFDRCxPQUFPLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUcsU0FBUyxFQUFFLENBQUU7QUFDOUQsQ0FBQztBQS9ERCw4QkErREM7QUFNRCxTQUFTLGFBQWEsQ0FBQyxZQUFxQixFQUFHLGVBQXNCLEVBQUcsY0FBeUI7SUFFN0YsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ2hCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztJQUNoQixNQUFNLGFBQWEsR0FBSSxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQSxFQUFFLENBQUEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbEUsSUFBRyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQztRQUN4QixNQUFNLEVBQUUsR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQSxFQUFFLENBQUEsQ0FBQyxDQUFDLElBQUksSUFBSSxVQUFVLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDckYsSUFBRyxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQztZQUNiLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDaEI7YUFBSTtZQUNELElBQUksR0FBSSxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDNUI7S0FDSjtTQUFJO1FBQ0QsSUFBSSxHQUFJLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM1QjtJQUNELElBQUcsSUFBSSxFQUFDO1FBQ0osSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN2QixJQUFJLElBQUksR0FBSSxVQUFVLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDO1FBQ25ELElBQUksS0FBSyxHQUFHLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBLEVBQUUsQ0FBQSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzVGLElBQUksVUFBVSxHQUFzQyw2QkFBNkIsQ0FBQyxLQUFLLEVBQUcsY0FBYyxDQUFDLENBQUM7UUFFMUcsSUFBSSxpQkFBaUIsR0FBc0Msd0JBQXdCLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzFHLElBQUksTUFBTSxHQUFHLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUQsSUFBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQztZQUNqQixJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDcEM7UUFFRCxJQUFHLElBQUksRUFBQztZQUNKLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLENBQUM7WUFFeEIsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUU1QixZQUFZLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FBQztZQUU3QixZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBRyxLQUFLLEVBQUMsQ0FBQyxDQUFDO1NBQzNDO0tBRUo7SUFFRCxPQUFPLElBQUksQ0FBRTtBQUNqQixDQUFDO0FBTUQsU0FBUywwQkFBMEIsQ0FBQyxZQUFrQixFQUFFLGNBQXlCO0lBQzdFLE1BQU0sYUFBYSxHQUFJLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBLEVBQUUsQ0FBQSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBRyxDQUFDLENBQUMsQ0FBQztJQUNsRSxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7SUFDaEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ2hCLElBQUcsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUM7UUFDeEIsTUFBTSxFQUFFLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUEsRUFBRSxDQUFBLENBQUMsQ0FBQyxJQUFJLElBQUksVUFBVSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3JGLElBQUcsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUM7WUFDYixJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2hCO2FBQUk7WUFDRCxJQUFJLEdBQUksYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzVCO0tBQ0o7U0FBSTtRQUNELElBQUksR0FBSSxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDNUI7SUFDRCxJQUFHLElBQUksRUFBQztRQUNKLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7UUFDdkIsSUFBSSxVQUFVLEdBQXNDLDZCQUE2QixDQUFDLEtBQUssRUFBRyxjQUFjLENBQUMsQ0FBQztRQUUxRyxJQUFJLGlCQUFpQixHQUFzQyx3QkFBd0IsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDMUcsSUFBSSxNQUFNLEdBQUcsaUJBQWlCLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsRUFBRSxDQUFBLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM1RCxJQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFDO1lBQ2pCLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztTQUNwQztLQUNKO0lBRUQsSUFBRyxJQUFJLElBQUksSUFBSSxFQUFDO1FBQ1osTUFBTSxPQUFPLEdBQXNCLHFCQUFxQixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsWUFBWSxDQUFFLENBQUM7UUFDcEYsWUFBWSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7UUFDcEMsT0FBTyxFQUFFLElBQUksRUFBRyxZQUFZLEVBQUUsQ0FBQTtLQUNqQztTQUFLO1FBQ0YsT0FBTyxFQUFFLElBQUksRUFBRyxZQUFZLEVBQUUsQ0FBQTtLQUNqQztBQUNMLENBQUM7QUFPRCxTQUFTLFdBQVcsQ0FBQyxTQUFvQixFQUFHLE9BQWdCO0lBRXhELElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztJQUVyQixJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDZixJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDZixJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDZixJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDZixLQUFJLElBQUksQ0FBQyxJQUFJLFNBQVMsRUFBQztRQUNuQixJQUFHLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBQztZQUN4QixXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO1NBQ3RCO2FBQUk7WUFDRCxPQUFPLENBQUMsQ0FBQztTQUNaO1FBQ0QsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDOUIsSUFBRyxJQUFJLElBQUksQ0FBQyxFQUFDO1lBQ1QsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7U0FDdEI7YUFBSyxJQUFHLElBQUksSUFBSSxDQUFDLEVBQUM7WUFDZixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztTQUN0QjthQUFLLElBQUcsSUFBSSxJQUFJLENBQUMsRUFBQztZQUNmLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1NBQ3RCO2FBQUssSUFBRyxJQUFJLElBQUksQ0FBQyxFQUFDO1lBQ2YsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7U0FDdEI7S0FDSjtJQUNELFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBQyxTQUFTLENBQUMsQ0FBQTtJQUNsRCxJQUFJLElBQUksR0FBRyxDQUFDLEVBQUMsSUFBSSxFQUFFLENBQUMsRUFBRyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFHLEtBQUssRUFBQyxLQUFLLEVBQUUsRUFBQyxFQUFDLElBQUksRUFBRSxDQUFDLEVBQUcsS0FBSyxFQUFDLEtBQUssRUFBRSxFQUFDLEVBQUMsSUFBSSxFQUFFLENBQUMsRUFBRyxLQUFLLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQztJQUVsSCxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUEsRUFBRSxDQUFBLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBRTVDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ25ELFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBQyxJQUFJLENBQUMsQ0FBQTtJQUN4QyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkIsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFDLElBQUksQ0FBQyxDQUFBO0lBRXhDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxFQUFFLENBQUEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzFDLElBQUksSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkMsSUFBRyxPQUFPLElBQUksSUFBSSxJQUFJLE9BQU8sRUFBRTtRQUMzQixJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQ3JEO0lBR0QsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFDLElBQUksQ0FBQyxDQUFBO0lBQ3hDLE9BQVEsSUFBSSxDQUFDO0FBQ2pCLENBQUM7QUFNRCxTQUFnQixjQUFjLENBQUMsS0FBZSxFQUFHLGNBQXlCLEVBQUcsWUFBcUIsRUFBRyxTQUFvQjtJQUVySCxJQUFJLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFDckIsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBRXRCLE1BQU0sZ0JBQWdCLEdBQXdDLHFCQUFxQixDQUFFLFNBQVMsQ0FBRSxDQUFDO0lBRWxHLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLHdDQUF3QyxFQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pGLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLHFDQUFxQyxFQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzNGLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxFQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzdGLE1BQU0sUUFBUSxHQUFpQyxjQUFjLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFHLGdCQUFnQixDQUFDLFNBQVMsRUFBRyxZQUFZLEVBQUcsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUUxTCxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyw2QkFBNkIsRUFBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDM0UsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLEVBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ2pGLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLDZCQUE2QixFQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2pFLFNBQVMsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDO0lBQy9CLFlBQVksR0FBRyxRQUFRLENBQUMsWUFBWSxDQUFDO0lBUXJDLE1BQU0sb0JBQW9CLEdBQXdDLHFCQUFxQixDQUFFLFFBQVEsQ0FBQyxTQUFTLENBQUcsQ0FBQztJQUUvRyxNQUFNLFNBQVMsR0FBaUMsY0FBYyxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRyxvQkFBb0IsQ0FBQyxTQUFTLEVBQUcsWUFBWSxFQUFHLG9CQUFvQixDQUFDLFVBQVUsRUFBRyxjQUFjLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDeE0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7SUFDaEMsWUFBWSxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUM7SUFDdEMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsOEJBQThCLEVBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzdFLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLGlDQUFpQyxFQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNuRixRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyw4QkFBOEIsRUFBQyxTQUFTLENBQUMsQ0FBQztJQUduRSxJQUFJLFFBQVEsR0FBc0MsNkJBQTZCLENBQUMsU0FBUyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQzVHLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNyRSxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyw2QkFBNkIsRUFBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUdqRixNQUFNLGlCQUFpQixHQUF3QyxxQkFBcUIsQ0FBRSxRQUFRLENBQUMsU0FBUyxDQUFFLENBQUM7SUFDNUcsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLEVBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbEYsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsK0JBQStCLEVBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdEYsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLEVBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFdkYsTUFBTSxXQUFXLEdBQWlDLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUcsaUJBQWlCLENBQUMsU0FBUyxFQUFHLFlBQVksRUFBSSxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLGdCQUFnQixFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzVNLFNBQVMsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDO0lBQ2xDLFlBQVksR0FBRyxXQUFXLENBQUMsWUFBWSxDQUFDO0lBQ3pDLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLG1DQUFtQyxFQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUN2RixRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsRUFBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDakYsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLEVBQUMsU0FBUyxDQUFDLENBQUM7SUFHcEUsSUFBSSxVQUFVLEdBQXNDLDZCQUE2QixDQUFDLFNBQVMsRUFBRyxjQUFjLENBQUMsQ0FBQztJQUMvRyxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQywrQkFBK0IsRUFBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDL0UsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0NBQXNDLEVBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFNUYsSUFBSSxpQkFBaUIsR0FBc0Msd0JBQXdCLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzNHLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxFQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzdGLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLDZDQUE2QyxFQUFDLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFMUcsSUFBSSxVQUFVLEdBQWtDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUcsVUFBVSxDQUFDLGdCQUFnQixFQUFFLGlCQUFpQixDQUFDLGdCQUFnQixFQUFFLFlBQVksRUFBRSxTQUFTLENBQUUsQ0FBQztJQUNyTCxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQywrQkFBK0IsRUFBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDL0UsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0NBQWtDLEVBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3JGLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLCtCQUErQixFQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ25FLFNBQVMsR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDO0lBQ2pDLFlBQVksR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDO0lBR3ZDLElBQUcsU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUc7UUFFdkIsTUFBTSxhQUFhLEdBQWtDLFlBQVksQ0FBRSxTQUFTLEVBQUcsWUFBWSxFQUFFLGNBQWMsRUFBRyxRQUFRLENBQUUsQ0FBQztRQUN6SCxTQUFTLEdBQUcsYUFBYSxDQUFDLFNBQVMsQ0FBQztRQUNwQyxZQUFZLEdBQUcsYUFBYSxDQUFDLFlBQVksQ0FBQztLQUM3QztJQUNGLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLFNBQVMsQ0FBRSxDQUFDO0lBQzVELFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLFlBQVksQ0FBRSxDQUFDO0lBQ2xFLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLFNBQVMsQ0FBRSxDQUFDO0lBQzdELE9BQU8sRUFBRSxTQUFTLEVBQUcsWUFBWSxFQUFFLFNBQVMsRUFBQyxDQUFBO0FBQ2pELENBQUM7QUE5RUQsd0NBOEVDO0FBTUQsU0FBZ0IsWUFBWSxDQUFFLFNBQW1CLEVBQUUsWUFBb0IsRUFBRyxjQUF5QixFQUFHLFFBQW1CO0lBRXJILElBQUksaUJBQWlCLEdBQXNDLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRS9GLElBQUksaUJBQWlCLEdBQXNDLDZCQUE2QixDQUFDLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUV0SSxJQUFHLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1FBQ3RCLElBQUcsUUFBUSxDQUFDLE1BQU0sSUFBSSxFQUFFLEVBQUM7WUFDckIsSUFBRyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBQztnQkFFdkMsSUFBRyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO29CQUMvQyxJQUFJLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDakQsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUE7b0JBQ3ZDLE1BQU0sU0FBUyxHQUFrQyxPQUFPLENBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxTQUFTLENBQUUsQ0FBQztvQkFDMUYsU0FBUyxHQUFHLFNBQVMsQ0FBQyxTQUFTLENBQUM7b0JBQ2hDLFlBQVksR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDO2lCQUN6QztxQkFBSyxJQUFHLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7b0JBQ3JELFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO29CQUNyQyxJQUFJLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDakQsTUFBTSxTQUFTLEdBQWtDLE9BQU8sQ0FBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLFNBQVMsQ0FBRSxDQUFDO29CQUMxRixTQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQztvQkFDaEMsWUFBWSxHQUFHLFNBQVMsQ0FBQyxZQUFZLENBQUM7aUJBQ3pDO2FBQ0o7U0FDSjthQUFJO1lBQ0QsTUFBTSxhQUFhLEdBQUksWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUEsRUFBRSxDQUFBLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2xFLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLHNDQUFzQyxFQUFFLGFBQWEsQ0FBQyxDQUFBO1lBQy9FLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztZQUNoQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7WUFDaEIsSUFBRyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQztnQkFDeEIsTUFBTSxFQUFFLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUEsRUFBRSxDQUFBLENBQUMsQ0FBQyxJQUFJLElBQUksVUFBVSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUNyRixJQUFHLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFDO29CQUNiLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2hCO3FCQUFJO29CQUNELElBQUksR0FBSSxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzVCO2FBQ0o7aUJBQUk7Z0JBQ0QsSUFBSSxHQUFJLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUM1QjtZQUNELFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFDLElBQUksQ0FBQyxDQUFBO1lBQy9DLElBQUcsSUFBSSxFQUFDO2dCQUVKLElBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxVQUFVLENBQUMsU0FBUyxDQUFDLHFCQUFxQixFQUFDO29CQUN2RCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDN0MsSUFBRyxjQUFjLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDO3dCQUNqQyxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNuQjt5QkFBSyxJQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBQzt3QkFDdEQsSUFBSSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO3FCQUNsQzt5QkFBSTt3QkFDRCxJQUFJLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7cUJBQ2xDO2lCQUNKO3FCQUFLO29CQUNGLElBQUksS0FBSyxHQUFJLElBQUksQ0FBQyxLQUFLLENBQUM7b0JBQ3hCLElBQUksaUJBQWlCLEdBQXNDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUUzRixJQUFJLGlCQUFpQixHQUFzQyw2QkFBNkIsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDLENBQUM7b0JBQ3RJLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3pDO2FBQ0o7WUFFRCxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBQyxJQUFJLENBQUMsQ0FBQTtZQUMvQyxJQUFHLElBQUksSUFBSSxJQUFJLEVBQUM7Z0JBQ1osU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDckIsTUFBTSxPQUFPLEdBQXNCLHFCQUFxQixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsWUFBWSxDQUFFLENBQUM7Z0JBQ3BGLFlBQVksR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDO2FBQ3ZDO1NBRUo7S0FFSjtTQUFLLElBQUcsU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUM7UUFDM0IsSUFBRyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLEVBQUUsRUFBQztZQUNoRSxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxTQUFTLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBQyxDQUFDLENBQUM7WUFDcEYsU0FBUyxHQUFHLEVBQUUsQ0FBQztTQUNsQjthQUFJO1lBQ0QsTUFBTSxhQUFhLEdBQUksWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUEsRUFBRSxDQUFBLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ2xFLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLGFBQWEsQ0FBQyxDQUFBO1lBQzVELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztZQUNoQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7WUFDaEIsSUFBRyxhQUFhLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQztnQkFDeEIsTUFBTSxFQUFFLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUEsRUFBRSxDQUFBLENBQUMsQ0FBQyxJQUFJLElBQUksVUFBVSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUNyRixJQUFHLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFDO29CQUNiLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2hCO3FCQUFJO29CQUNELElBQUksR0FBSSxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzVCO2FBQ0o7aUJBQUk7Z0JBQ0QsSUFBSSxHQUFJLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUM1QjtZQUNGLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFDLElBQUksQ0FBQyxDQUFBO1lBQzlDLElBQUcsSUFBSSxFQUFDO2dCQUVKLElBQUcsSUFBSSxFQUFDO29CQUVKLElBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxVQUFVLENBQUMsU0FBUyxDQUFDLHFCQUFxQixFQUFDO3dCQUN2RCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzt3QkFDN0MsSUFBRyxjQUFjLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDOzRCQUNqQyxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNuQjs2QkFBSyxJQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBQzs0QkFDdEQsSUFBSSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO3lCQUNsQzs2QkFBSTs0QkFDRCxJQUFJLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7eUJBQ2xDO3FCQUNKO3lCQUFLO3dCQUNGLElBQUksS0FBSyxHQUFJLElBQUksQ0FBQyxLQUFLLENBQUM7d0JBQ3hCLElBQUksaUJBQWlCLEdBQXNDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUUzRixJQUFJLGlCQUFpQixHQUFzQyw2QkFBNkIsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsY0FBYyxDQUFDLENBQUM7d0JBQ3RJLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ3pDO2lCQUNKO2FBY0o7WUFFRCxJQUFHLElBQUksSUFBSSxJQUFJLEVBQUM7Z0JBQ1osU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDckIsTUFBTSxPQUFPLEdBQXNCLHFCQUFxQixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsWUFBWSxDQUFFLENBQUM7Z0JBQ3BGLFlBQVksR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDO2FBQ3ZDO1NBRUo7S0FHSjtTQUFLLElBQUcsU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUM7UUFDM0IsSUFBRyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBQztZQUN2QyxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDZixJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUM7WUFDdkIsSUFBRyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDOUksV0FBVyxHQUFHLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNoRDtpQkFBSTtnQkFDRCxXQUFXLEdBQUcsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2hEO1lBQ0QsSUFBRyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFDO2dCQUM5QyxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyx1Q0FBdUMsRUFBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO2dCQUNuRyxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUN6RCxLQUFJLElBQUksQ0FBQyxJQUFJLGlCQUFpQixDQUFDLGdCQUFnQixFQUFDO29CQUM1QyxJQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQSxFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUMzQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FBQztpQkFDN0I7YUFDSjtZQUNELElBQUcsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQztnQkFDOUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUNBQXVDLEVBQUMsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQTtnQkFDbkcsS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDekQsS0FBSSxJQUFJLENBQUMsSUFBSSxpQkFBaUIsQ0FBQyxnQkFBZ0IsRUFBQztvQkFDNUMsSUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUEsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDM0MsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzdCO2FBQ0o7WUFDRixRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyw0Q0FBNEMsRUFBQyxLQUFLLENBQUMsQ0FBQTtZQUM1RSxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxrREFBa0QsRUFBQyxXQUFXLENBQUMsQ0FBQTtZQUN2RixJQUFHLFdBQVcsSUFBSSxJQUFJLEVBQUM7Z0JBQ25CLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3hCLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztnQkFFaEYsSUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUEsRUFBRSxDQUFBLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQztnQkFDckQsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUM7YUFDN0I7U0FFSjtLQUNKO0lBQ0YsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEVBQUMsU0FBUyxDQUFDLENBQUE7SUFDeEQsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLEVBQUMsWUFBWSxDQUFDLENBQUE7SUFDN0QsT0FBUSxFQUFFLFNBQVMsRUFBRyxZQUFZLEVBQUUsQ0FBQTtBQUV4QyxDQUFDO0FBL0tELG9DQStLQztBQU1ELFNBQVMscUJBQXFCLENBQUMsSUFBYSxFQUFHLFNBQWUsRUFBRyxZQUFvQjtJQUNqRixJQUFJLEtBQUssR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQSxFQUFFLENBQUEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDdEcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0IsTUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBLEVBQUUsQ0FBQSxDQUFDLElBQUUsSUFBSSxDQUFDLENBQUM7SUFDekQsU0FBUyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JDLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDN0IsT0FBTyxFQUFFLFlBQVksRUFBRSxDQUFDO0FBQzVCLENBQUM7QUFTRCxTQUFTLE9BQU8sQ0FBQyxJQUFhLEVBQUcsWUFBb0IsRUFBRSxTQUFvQjtJQUN2RSxNQUFNLEtBQUssR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RDLE1BQU0sUUFBUSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBLEVBQUUsQ0FBQSxDQUFDLENBQUMsSUFBSSxJQUFJLFVBQVUsQ0FBQyxTQUFTLENBQUMsaUJBQWlCLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDakgsTUFBTSxTQUFTLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUEsRUFBRSxDQUFBLENBQUMsQ0FBQyxJQUFJLElBQUksVUFBVSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBRSxDQUFDO0lBd0JoRyxJQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFDO1FBQ25CLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixJQUFJLEtBQUssR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQSxFQUFFLENBQUEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDakcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEIsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUUzQjtTQUFLLElBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUM7UUFDMUIsTUFBTSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUEsRUFBRSxDQUFBLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxDQUFBO1FBQ25ELElBQUcsSUFBSSxFQUFDO1lBQ0osSUFBSSxLQUFLLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUEsRUFBRSxDQUFBLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQ2pHLFlBQVksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBRTtZQUNwRCxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzNCO0tBRUo7SUFDRixRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUMsWUFBWSxDQUFDLENBQUE7SUFDbkQsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUMsSUFBSSxDQUFDLENBQUE7SUFDOUMsSUFBRyxJQUFJLElBQUksSUFBSSxFQUFDO1FBQ1osU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUMsU0FBUyxDQUFDLENBQUE7S0FDN0Q7SUFDRCxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsRUFBQyxZQUFZLENBQUMsQ0FBQTtJQUMvRCxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBQyxTQUFTLENBQUMsQ0FBQTtJQUNyRCxPQUFPLEVBQUUsWUFBWSxFQUFHLFlBQVksRUFBRyxTQUFTLEVBQUcsQ0FBQztBQUN4RCxDQUFDO0FBS0QsU0FBZ0IsVUFBVSxDQUFDLFNBQW9CLEVBQUUsZ0JBQTJCLEVBQUUsVUFBcUIsRUFBRSxZQUFvQixFQUFHLFNBQW9CO0lBQzVJLElBQUksRUFBRSxHQUFJLFNBQVMsQ0FBQztJQUlwQixJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDbkIsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUMsRUFBRSxDQUFDLENBQUM7SUFDL0MsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUMsVUFBVSxDQUFDLENBQUM7SUFDekQsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMseUJBQXlCLEVBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNyRSxNQUFNLFFBQVEsR0FBSSxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN4QyxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUMsUUFBUSxDQUFDLENBQUM7SUFDN0MsSUFBSSxjQUFjLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDeEQsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUMsY0FBYyxDQUFDLENBQUM7SUFDekQsSUFBRyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQztRQUN6QixLQUFJLElBQUksSUFBSSxJQUFJLGNBQWMsRUFBQztZQUMzQixJQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzdCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDdkIsS0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUcsQ0FBQyxHQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBQztnQkFDMUIsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDOUIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDdkI7U0FDSjtLQUNKO0lBQ0YsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQzVDLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzFELElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNkLEtBQUksSUFBSSxDQUFDLElBQUksRUFBRSxFQUFDO1FBQ1osSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBRyxDQUFDLEdBQUUsRUFBRSxFQUFHLElBQUksRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDO0tBQ3RDO0lBQ0YsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3hDLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztJQUNoQixLQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFDO1FBQ3hCLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBLEVBQUUsQ0FBQSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzdDLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNmLEtBQUksSUFBSSxDQUFDLElBQUksV0FBVyxFQUFDO1lBQ3JCLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ3RCO1FBQ0QsSUFBRyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBQztZQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3RCO0tBQ0o7SUFDRixRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUMsTUFBTSxDQUFDLENBQUM7SUFDM0MsSUFBSSxhQUFhLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUEsRUFBRSxDQUFBLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEQsSUFBSSxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUEsRUFBRSxDQUFBLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDbEQsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO0lBQ25CLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBQyxXQUFXLENBQUMsQ0FBQTtJQUNyRCxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBQyxhQUFhLENBQUMsQ0FBQTtJQUN6RCxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBQyxnQkFBZ0IsQ0FBQyxDQUFBO0lBQzlELElBQUcsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUM7UUFDeEIsS0FBSSxJQUFJLENBQUMsSUFBSSxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUM7WUFDMUIsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixJQUFHLEtBQUssS0FBSyxDQUFDLENBQUMsRUFBQztnQkFDWixFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQzthQUN2QjtTQUNKO1FBQ0QsUUFBUSxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUUvQjtTQUFLLElBQUcsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUM7UUFDNUIsSUFBRyxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFHO1lBQzdCLFFBQVEsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsS0FBSSxJQUFJLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUM7Z0JBQ3hCLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLElBQUcsS0FBSyxLQUFLLENBQUMsQ0FBQyxFQUFDO29CQUNaLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUN2QjthQUVKO1lBQ0QsUUFBUSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25DLE1BQU0sS0FBSyxHQUFHLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVELGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDckM7YUFBSyxJQUFHLGdCQUFnQixDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7WUFDNUQsUUFBUSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQixRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBQyxXQUFXLENBQUMsQ0FBQTtZQUNqRCxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUMsRUFBRSxDQUFDLENBQUE7WUFDNUMsS0FBSSxJQUFJLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUM7Z0JBQ3hCLE1BQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzVCLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFDLEtBQUssQ0FBQyxDQUFBO2dCQUNsRCxJQUFHLEtBQUssS0FBSyxDQUFDLENBQUMsRUFBQztvQkFDWixFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztpQkFDdkI7YUFFSjtZQUNELFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQzlDLE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEQsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDL0I7YUFBSztZQUNGLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztZQUNiLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztZQUNoQixLQUFJLElBQUksQ0FBQyxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBQztnQkFDeEIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMzQixPQUFPLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQzthQUNwQjtZQUVELEtBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUM7Z0JBQ3JCLElBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFDO29CQUNoQixrQkFBa0IsQ0FBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO2lCQUM5QzthQUVKO1NBQ0o7S0FDSjtJQUNGLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBQyxRQUFRLENBQUMsQ0FBQztJQUNoRCxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUMsRUFBRSxDQUFDLENBQUM7SUFDdEMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFDLFVBQVUsRUFBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBRXRELElBQUcsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUM7UUFDbkIsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxVQUFVLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztLQUMxRTtJQUVGLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBQyxFQUFFLENBQUMsQ0FBQztJQUMxQyxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUMsWUFBWSxDQUFDLENBQUM7SUFDdkQsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2xELE9BQU8sRUFBRSxZQUFZLEVBQUcsU0FBUyxFQUFHLEVBQUUsRUFBRyxDQUFBO0FBQzdDLENBQUM7QUFuSEQsZ0NBbUhDO0FBTUQsU0FBUyxjQUFjLENBQUMsS0FBZ0IsRUFBRSxjQUF5QjtJQUMvRCxJQUFJLGNBQWMsR0FBRyxLQUFLLENBQUM7SUFDM0IsSUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDO0lBQzNCLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQztJQUN4QixJQUFHLEtBQUssQ0FBQyxNQUFNLElBQUcsQ0FBQyxFQUFFO1FBQ2pCLGNBQWMsR0FBRyxJQUFJLENBQUM7S0FDekI7SUFDRCxLQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssRUFBQztRQUNmLElBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBQztZQUMxQixjQUFjLEdBQUcsSUFBSSxDQUFDO1NBQ3pCO0tBQ0o7SUFFRCxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDZixJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDZixJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDZixJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDZixLQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssRUFBQztRQUNmLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQzlCLElBQUcsSUFBSSxJQUFJLENBQUMsRUFBQztZQUNULEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7YUFBSyxJQUFHLElBQUksSUFBSSxDQUFDLEVBQUM7WUFDZixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO2FBQUssSUFBRyxJQUFJLElBQUksQ0FBQyxFQUFDO1lBQ2YsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjthQUFLLElBQUcsSUFBSSxJQUFJLENBQUMsRUFBQztZQUNmLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7S0FDSjtJQUNELElBQUksSUFBSSxHQUFHLENBQUMsRUFBQyxJQUFJLEVBQUUsQ0FBQyxFQUFHLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUcsS0FBSyxFQUFDLEtBQUssRUFBRSxFQUFDLEVBQUMsSUFBSSxFQUFFLENBQUMsRUFBRyxLQUFLLEVBQUMsS0FBSyxFQUFFLEVBQUMsRUFBQyxJQUFJLEVBQUUsQ0FBQyxFQUFHLEtBQUssRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDO0lBQ2xILEtBQUksSUFBSSxDQUFDLElBQUksSUFBSSxFQUFDO1FBQ2QsSUFBRyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7WUFDcEIsV0FBVyxHQUFHLElBQUksQ0FBQztTQUN0QjtLQUNKO0lBRUQsT0FBTyxFQUFFLGNBQWMsRUFBRyxjQUFjLEVBQUcsV0FBVyxFQUFFLENBQUE7QUFDNUQsQ0FBQztBQUtELFNBQVMsNkJBQTZCLENBQUMsS0FBZ0IsRUFBRyxjQUF5QjtJQUMvRSxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFDbkIsSUFBSSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7SUFDMUIsS0FBSSxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQUM7UUFDZixJQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUM7WUFDMUIsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzVCO2FBQUs7WUFDRixTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3JCO0tBQ0o7SUFDRCxPQUFPLEVBQUUsU0FBUyxFQUFJLGdCQUFnQixFQUFDLENBQUE7QUFDM0MsQ0FBQztBQUtELFNBQVMsd0JBQXdCLENBQUMsS0FBZ0I7SUFDOUMsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBQ25CLElBQUksZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0lBQzFCLEtBQUksSUFBSSxDQUFDLElBQUksS0FBSyxFQUFDO1FBQ2YsSUFBRyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFDO1lBQ3ZDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUM1QjthQUFLO1lBQ0YsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNyQjtLQUNKO0lBQ0QsT0FBTyxFQUFFLFNBQVMsRUFBSSxnQkFBZ0IsRUFBRSxDQUFDO0FBQzdDLENBQUM7QUFLRCxTQUFTLHFCQUFxQixDQUFDLEtBQWU7SUFLMUMsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBQ25CLE1BQU0sTUFBTSxHQUEwQyxVQUFVLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRXhGLElBQUksYUFBYSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7SUFFcEMsTUFBTSxRQUFRLEdBQUksZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDbEQsSUFBSSxjQUFjLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDdkQsSUFBRyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQztRQUMxQixRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBQyxjQUFjLENBQUMsQ0FBQztRQUN6RCxLQUFJLElBQUksSUFBSSxJQUFJLGNBQWMsRUFBQztZQUMzQixJQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzdCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUM7WUFDdkIsS0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUcsQ0FBQyxHQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBQztnQkFDMUIsTUFBTSxLQUFLLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDekMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7YUFDdkI7U0FDSjtLQUNKO0lBRUYsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFDLGFBQWEsQ0FBQyxDQUFBO0lBRXRELElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUNmLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUNmLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUNmLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUNmLEtBQUksSUFBSSxDQUFDLElBQUksYUFBYSxFQUFDO1FBQ3ZCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQzlCLElBQUcsSUFBSSxJQUFJLENBQUMsRUFBQztZQUNULEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1NBQ3RCO2FBQUssSUFBRyxJQUFJLElBQUksQ0FBQyxFQUFDO1lBQ2YsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7U0FDdEI7YUFBSyxJQUFHLElBQUksSUFBSSxDQUFDLEVBQUM7WUFDZixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztTQUN0QjthQUFLLElBQUcsSUFBSSxJQUFJLENBQUMsRUFBQztZQUNmLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1NBQ3RCO0tBQ0o7SUFDRCxJQUFJLElBQUksR0FBRyxDQUFDLEVBQUMsSUFBSSxFQUFFLENBQUMsRUFBRyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFHLEtBQUssRUFBQyxLQUFLLEVBQUUsRUFBQyxFQUFDLElBQUksRUFBRSxDQUFDLEVBQUcsS0FBSyxFQUFDLEtBQUssRUFBRSxFQUFDLEVBQUMsSUFBSSxFQUFFLENBQUMsRUFBRyxLQUFLLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQztJQUNsSCxPQUFPLEVBQUUsSUFBSSxFQUFHLFNBQVMsRUFBSSxVQUFVLEVBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFBO0FBRWpFLENBQUM7QUFNRCxTQUFTLGNBQWMsQ0FBQyxJQUFZLEVBQUcsU0FBb0IsRUFBRSxZQUFvQixFQUFHLFVBQXFCLEVBQUcsY0FBeUIsRUFBRyxTQUFrQjtJQUN0SixJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUM7SUFFbkIsS0FBSSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUM7UUFDakIsSUFBSSxJQUFJLEdBQUksSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3ZCLElBQUcsS0FBSyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUM7WUFDakIsTUFBTSxFQUFFLFFBQVEsRUFBRyxRQUFRLEVBQUUsR0FBRyxXQUFXLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFFLENBQUM7WUFDckYsSUFBRyxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUM7Z0JBRWhDLElBQUksU0FBUyxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUcsUUFBUSxDQUFDLENBQUM7Z0JBQzVDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRyxLQUFLLEVBQUcsU0FBUyxFQUFDLENBQUMsQ0FBQTthQUM1RjtZQUNELElBQUcsUUFBUSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFDO2dCQUUvQixJQUFJLFNBQVMsR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFHLFFBQVEsQ0FBQyxDQUFDO2dCQUU1QyxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUMzQztTQUNKO2FBQUk7WUFDRCxJQUFJLFNBQVMsR0FBRyxVQUFVLENBQUMsSUFBSSxFQUFHLEtBQUssQ0FBQyxDQUFDO1lBQ3pDLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzNDO0tBQ0o7SUFFRCxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUV4QyxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUV6QyxPQUFPLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxDQUFBO0FBQ3RDLENBQUM7QUFJRCxTQUFTLGNBQWMsQ0FBQyxJQUFZLEVBQUcsU0FBb0IsRUFBRyxZQUFvQixFQUFHLFVBQXFCLEVBQUcsZ0JBQTJCLEVBQUcsU0FBa0I7SUFDekosSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBSW5CLEtBQUksSUFBSSxJQUFJLElBQUksSUFBSSxFQUFDO1FBQ2pCLElBQUksSUFBSSxHQUFJLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN2QixJQUFHLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1lBQ2xCLElBQUksRUFBRSxRQUFRLEVBQUcsUUFBUSxFQUFFLEdBQUcscUJBQXFCLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM3RSxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUMsUUFBUSxDQUFDLENBQUE7WUFDaEQsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFDLFFBQVEsQ0FBQyxDQUFBO1lBQ2hELFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFDLGdCQUFnQixDQUFDLENBQUE7WUFDaEUsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFDLFVBQVUsQ0FBQyxDQUFBO1lBQ25ELElBQUcsUUFBUSxJQUFJLFFBQVEsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFDO2dCQUVoQyxJQUFHLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUM7b0JBQ3JELFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFDLFFBQVEsQ0FBQyxDQUFBO29CQUNwRCxJQUFHLGdCQUFnQixDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7d0JBQzVCLElBQUksS0FBSyxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUcsUUFBUSxDQUFDLENBQUM7d0JBQ3hDLE1BQU0sSUFBSSxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNsQyxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUMsSUFBSSxDQUFDLENBQUE7d0JBQ3ZDLE1BQU0sS0FBSyxHQUFHLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTt3QkFDNUMsSUFBRyxLQUFLLEtBQUssQ0FBQyxDQUFDLEVBQUM7NEJBQ1osZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsQ0FBQzt5QkFDcEM7d0JBQ0QsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFFakIsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxVQUFVLENBQUMsU0FBUyxDQUFDLGlCQUFpQixFQUFHLEtBQUssRUFBRyxLQUFLLEVBQUMsQ0FBQyxDQUFBO3FCQUNwRjt5QkFBTSxJQUFHLGdCQUFnQixDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUM7d0JBRTVELE1BQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDM0IsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDdkMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzNCLElBQUksS0FBSyxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUcsUUFBUSxDQUFDLENBQUM7d0JBQ3hDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ2pCLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRyxLQUFLLEVBQUcsS0FBSyxFQUFDLENBQUMsQ0FBQTtxQkFDcEY7aUJBRUo7cUJBQUk7b0JBQ0QsSUFBSSxhQUFhLEdBQUcsVUFBVSxDQUFDLElBQUksRUFBRyxRQUFRLENBQUMsQ0FBQztvQkFFaEQsU0FBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7aUJBQy9DO2FBRUo7WUFFRCxJQUFHLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQztnQkFFL0IsSUFBSSxLQUFLLEdBQUcsVUFBVSxDQUFDLElBQUksRUFBRyxRQUFRLENBQUMsQ0FBQztnQkFFeEMsU0FBUyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7YUFDdkM7U0FDSjthQUFNO1lBQ0gsSUFBSSxTQUFTLEdBQUcsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN4QyxTQUFTLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUMzQztLQUNKO0lBQ0YsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFDLFNBQVMsQ0FBQyxDQUFBO0lBRWpELFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRXhDLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBRXpDLFNBQVMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFFL0MsT0FBTyxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsQ0FBQTtBQUN0QyxDQUFDO0FBR0QsU0FBZ0IscUJBQXFCLENBQUMsS0FBZ0IsRUFBRSxJQUFJLEVBQUcsU0FBb0I7SUFDL0UsTUFBTSxFQUFFLEdBQUksS0FBSyxDQUFDO0lBQ2xCLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQSxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3RCLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNmLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUk1QyxLQUFJLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBRyxDQUFDLEdBQUUsRUFBRSxDQUFDLE1BQU0sR0FBRSxDQUFDLEVBQUcsQ0FBQyxFQUFFLEVBQUU7UUFDbEMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsMkJBQTJCLEVBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDMUQsSUFBSSxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ25CLElBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFO1lBQ3hDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLE1BQU0sRUFBRyxRQUFRLEVBQUUsU0FBUyxFQUFDLENBQUMsQ0FBQztZQUV6RCxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQzdEO2FBQUssSUFBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUM7WUFDN0MsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QixTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsTUFBTSxFQUFHLFFBQVEsRUFBRSxTQUFTLEVBQUMsQ0FBQyxDQUFDO1lBRXpELGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDOUQ7UUFDRCxLQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRyxDQUFDLEdBQUUsRUFBRSxDQUFDLE1BQU0sRUFBRyxDQUFDLEVBQUUsRUFBQztZQUMvQixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFDbEIsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFFLENBQUMsRUFBRTtnQkFFcEMsSUFBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUssRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUUsQ0FBQyxDQUFDLEVBQUM7b0JBQ2pELFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3JCLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN2QixRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzdCLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRyxRQUFRLEVBQUMsQ0FBQyxDQUFDO29CQUU1QyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDO2lCQUN6RDtxQkFBSTtvQkFDRCxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNyQixRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFDLEdBQUcsRUFBQyxRQUFRLENBQUMsTUFBTSxFQUFHLFFBQVEsRUFBQyxDQUFDLENBQUM7b0JBRTVDLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztpQkFDcEQ7YUFHSjtpQkFBSyxJQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUMxQyxJQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFDO29CQUMvQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNyQixRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdkIsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUMsR0FBRyxFQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUcsUUFBUSxFQUFDLENBQUMsQ0FBQztpQkFDL0M7cUJBQUk7b0JBQ0QsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDckIsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLE1BQU0sRUFBRyxRQUFRLEVBQUMsQ0FBQyxDQUFDO29CQUU3QyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7aUJBQ3BEO2FBRUo7U0FDSjtLQUNKO0lBRUQsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ2hCLElBQUksU0FBUyxHQUFHLENBQUMsQ0FBQztJQUNsQixRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLENBQUMsQ0FBQTtJQUVuRCxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZCLElBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUM7UUFDZixLQUFJLElBQUksSUFBSSxJQUFJLElBQUksRUFBQztZQUNqQixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ3pCLElBQUcsU0FBUyxHQUFJLFNBQVMsRUFBQztnQkFDdEIsU0FBUyxHQUFHLFNBQVMsQ0FBQzthQUN6QjtZQUNELElBQUksTUFBTSxHQUFHLENBQUMsQ0FBRTtZQUNoQixLQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUM7Z0JBQ3ZCLE1BQU0sSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDMUI7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRyxNQUFNLEVBQUcsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUcsQ0FBQyxDQUFBO1NBQ3pFO1FBQ0YsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQzNDLE1BQU0sRUFBRSxHQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFBLEVBQUUsQ0FBQSxDQUFDLENBQUMsVUFBVSxJQUFJLFNBQVMsQ0FBQyxDQUFDO1FBQ3hELE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUM5QyxNQUFNLFdBQVcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUIsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUMsV0FBVyxDQUFDLENBQUE7UUFFckQsTUFBTSxRQUFRLEdBQUcsSUFBQSx3QkFBZ0IsRUFBQyxFQUFFLEVBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pELFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBQyxRQUFRLENBQUMsQ0FBQTtRQUNqRCxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDbEUsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFDLFNBQVMsQ0FBQyxDQUFBO1FBQ2pELElBQUksV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDNUMsT0FBTyxFQUFFLFFBQVEsRUFBRyxXQUFXLEVBQUcsUUFBUSxFQUFHLFFBQVEsRUFBRSxDQUFBO0tBQzFEO1NBQUs7UUFDRixPQUFPLEVBQUUsUUFBUSxFQUFHLEVBQUUsRUFBRyxRQUFRLEVBQUcsRUFBRSxFQUFFLENBQUE7S0FDM0M7QUFDTCxDQUFDO0FBOUZELHNEQThGQztBQU1ELFNBQVMsa0JBQWtCLENBQUMsSUFBYSxFQUFHLElBQVcsRUFBRyxTQUFvQjtJQUMxRSxJQUFHLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRSxFQUFFO1FBQ3pCLElBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUM7WUFDeEIsSUFBSSxLQUFLLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFDN0IsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN6QjtLQUNKO0FBQ0wsQ0FBQztBQUlELFNBQVMsU0FBUyxDQUFDLElBQWE7SUFDNUIsTUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDLEVBQUMsRUFBRSxFQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsQ0FBQztJQUM5QixJQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUM7UUFDdkIsT0FBTyxFQUFFLENBQUM7S0FDYjtTQUFJO1FBQ0QsT0FBTyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0tBQ25CO0FBQ0wsQ0FBQztBQUVELFNBQVMsVUFBVSxDQUFDLElBQWEsRUFBRyxRQUFtQjtJQUNuRCxJQUFJLFlBQVksR0FBRyxFQUFFLENBQUM7SUFDdEIsSUFBRyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBQztRQUN4QixLQUFJLElBQUksQ0FBQyxJQUFJLFFBQVEsRUFBQztZQUNsQixZQUFZLENBQUMsSUFBSSxDQUFFLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBRSxDQUFDO1NBQ3hDO0tBQ0o7SUFDRCxPQUFPLFlBQVksQ0FBQztBQUN4QixDQUFDO0FBR0QsU0FBZ0IsV0FBVyxDQUFFLEVBQWEsRUFBRSxjQUF3QixFQUFHLElBQWEsRUFBRSxTQUFTO0lBQzNGLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxFQUFFLENBQUEsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMzQixRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUMsRUFBRSxDQUFDLENBQUE7SUFFeEMsTUFBTSxNQUFNLEdBQUksZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDckMsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDM0MsS0FBSSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUM7UUFDakIsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM3QixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3ZCLEtBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFHLENBQUMsR0FBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUM7WUFDMUIsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5QixFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztTQUN2QjtLQUNKO0lBQ0QsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO0lBQ2xCLElBQUcsRUFBRSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUM7UUFDZixRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUMsRUFBRSxDQUFDLENBQUE7UUFDbEMsSUFBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDMUIsa0JBQWtCLENBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQTtTQUMzQzthQUFLLElBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFDO1lBQy9CLGtCQUFrQixDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUE7U0FDMUM7YUFBSyxJQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFDO1lBQ3hCLGtCQUFrQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFBO1NBQ2pEO0tBQ0o7SUFDRCxLQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRyxDQUFDLEdBQUMsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUcsQ0FBQyxFQUFFLEVBQUU7UUFDbkMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBRWQsSUFBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUN0QyxJQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBQztnQkFDdkIsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRTdCLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDdkI7aUJBQUk7Z0JBQ0Qsa0JBQWtCLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDeEMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUMsU0FBUyxDQUFDLENBQUE7YUFDdkQ7U0FFSjtRQUVELEtBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFHLENBQUMsR0FBRSxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBSSxDQUFDLEVBQUUsRUFBQztZQUNwQyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7WUFDZCxJQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUUsQ0FBQyxFQUFFO2dCQUNuQyxJQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDbkQsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRSxDQUFDLEdBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdkIsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDdkI7cUJBQUs7b0JBQ0YsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ25CLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3BCLElBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUM7d0JBQ2Ysa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUMsSUFBSSxFQUFDLFNBQVMsQ0FBQyxDQUFDO3dCQUNqRCxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBQyxTQUFTLENBQUMsQ0FBQTtxQkFDdkQ7aUJBRUo7YUFDSjtpQkFBSyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLElBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUN4QyxJQUFHLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFFLENBQUMsQ0FBQyxFQUFDO29CQUMxQixrQkFBa0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFFLENBQUMsRUFBQyxJQUFJLEVBQUMsU0FBUyxDQUFDLENBQUM7aUJBQ25EO2dCQUNELFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFDLFNBQVMsQ0FBQyxDQUFBO2FBQ3ZEO1NBQ0o7S0FDSjtJQUVELFFBQVEsR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDL0IsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFDLFFBQVEsQ0FBQyxDQUFBO0lBRWpELFFBQVEsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDaEMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ2xELElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQztJQUNaLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQztJQUNaLElBQUcsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUM7UUFFbkIsS0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUcsQ0FBQyxHQUFFLFFBQVEsQ0FBQyxNQUFNLEdBQUUsQ0FBQyxFQUFHLENBQUMsRUFBRSxFQUFDO1lBQ3BDLElBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtnQkFDL0MsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixJQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ3pFLEVBQUUsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM1QixNQUFNO2lCQUNUO2FBQ0o7aUJBQUs7Z0JBQ0YsSUFBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQztvQkFDbEMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDN0M7cUJBQUs7b0JBQ0YsSUFBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBQzt3QkFDdkIsRUFBRSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQy9CO2lCQUNKO2FBQ0o7U0FFUjtLQUNKO1NBQUssSUFBRyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQztRQUN6QixFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQ25CO0lBR0QsSUFBRyxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQztRQUViLEVBQUUsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFaEIsUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUMsRUFBRSxDQUFDLENBQUE7UUFFN0MsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsRUFBRSxDQUFBLENBQUMsR0FBRSxDQUFDLENBQUMsQ0FBQztRQUNyQixJQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFDO1lBQ3JDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQztZQUNaLEtBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFHLENBQUMsR0FBRSxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQztnQkFDakMsSUFBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUM7b0JBQ3BCLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2YsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ3RCO3FCQUFLO29CQUNGLE1BQU07aUJBQ1Q7YUFDSjtZQUVELEVBQUUsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDaEIsSUFBRyxFQUFFLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBQztnQkFDZCxFQUFFLEdBQUcsRUFBRSxDQUFDO2FBQ1g7WUFDRCxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBQyxFQUFFLENBQUMsQ0FBQTtTQUNoRDtRQUNELFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQy9DLElBQUcsRUFBRSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUM7WUFDZCxJQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQy9CLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2xCO2lCQUFLLElBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDO2dCQUM5QyxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzVCO1NBQ0o7YUFBSyxJQUFHLEVBQUUsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1lBRXJCLElBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQztnQkFDOUIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7YUFDbEI7WUFFRCxJQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFFLENBQUMsRUFBQztnQkFDM0MsRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQzthQUM5QjtZQUVELElBQUcsRUFBRSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUM7Z0JBQ2QsSUFBRyxjQUFjLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDO29CQUM5QixFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQztpQkFDbEI7cUJBQUssSUFBRyxjQUFjLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBRSxDQUFDLEVBQUM7b0JBQ2pELEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQy9CO2FBQ0o7U0FDSjthQUFLLElBQUcsRUFBRSxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUM7WUFDcEIsSUFBRyxjQUFjLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQztnQkFDbEcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7YUFDbEI7aUJBQUssSUFBRyxjQUFjLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBQztnQkFDNUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQzthQUM5QjtTQUNKO2FBQUssSUFBRyxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBQztZQUNuQixJQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxjQUFjLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUM7Z0JBQ25JLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2xCO2lCQUFLLElBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLGNBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxjQUFjLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFDO2dCQUN6TCxFQUFFLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzlCO1NBQ0o7UUFDRCxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUMsRUFBRSxDQUFDLENBQUE7UUFHcEMsSUFBRyxFQUFFLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBQztZQUNkLEVBQUUsR0FBRyxJQUFBLHdCQUFnQixFQUFDLEVBQUUsRUFBQyxFQUFFLENBQUMsQ0FBQztZQUU3QixRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBQyxTQUFTLENBQUMsQ0FBQTtZQUNyRCxPQUFPLEVBQUUsUUFBUSxFQUFHLEVBQUUsRUFBRyxRQUFRLEVBQUcsRUFBRSxFQUFHLENBQUE7U0FDNUM7YUFBSTtZQUNELFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFDLFNBQVMsQ0FBQyxDQUFBO1lBQ3JELFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFDLFNBQVMsQ0FBQyxDQUFBO1lBQzVELE9BQU8sRUFBRSxRQUFRLEVBQUcsRUFBRSxFQUFHLFFBQVEsRUFBRyxFQUFFLEVBQUUsQ0FBQTtTQUMzQztLQUdKO1NBQUs7UUFDRixRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQywyQkFBMkIsRUFBQyxTQUFTLENBQUMsQ0FBQTtRQUMvRCxPQUFPLEVBQUUsUUFBUSxFQUFHLEVBQUUsRUFBRyxRQUFRLEVBQUcsRUFBRSxFQUFFLENBQUE7S0FDM0M7QUFFTCxDQUFDO0FBdExELGtDQXNMQztBQU9ELFNBQVMsVUFBVSxDQUFDLFFBQVE7SUFDekIsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQ2QsS0FBSSxJQUFJLENBQUMsSUFBSSxRQUFRLEVBQUM7UUFDbEIsSUFBRyxDQUFDLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBQztZQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDaEI7S0FDSjtJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2YsQ0FBQztBQVlELFNBQVMsU0FBUyxDQUFDLEtBQUs7SUFDcEIsSUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0lBQ2IsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFO1FBRWhDLElBQUksT0FBTyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3pDLE9BQU8sR0FBRyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFBO0lBQ3BFLENBQUMsQ0FBQyxDQUFBO0FBQ04sQ0FBQztBQU1ELFNBQVMsTUFBTSxDQUFDLENBQUM7SUFDYixJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7SUFDYixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQzFDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBSTlCLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1NBQ2Y7UUFDRCxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2xCO0lBQ0QsT0FBTyxHQUFHLENBQUM7QUFDZixDQUFDO0FBR0QsU0FBUyxnQkFBZ0IsQ0FBRSxLQUFlO0lBQ3RDLElBQUksR0FBRyxHQUFHLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3hDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUNkLEtBQUssSUFBSSxHQUFHLElBQUksR0FBRyxFQUFFO1FBQ2pCLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFBO0tBQzNDO0lBQ0QsT0FBUSxJQUFJLENBQUM7QUFDakIsQ0FBQztBQUFBLENBQUM7QUFVRixTQUFTLHNCQUFzQixDQUFDLEdBQUc7SUFDL0IsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLFVBQVUsSUFBSSxFQUFFLElBQUk7UUFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDWCxDQUFDIn0=