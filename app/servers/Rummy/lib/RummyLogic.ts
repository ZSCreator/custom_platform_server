import RummyConst = require('./RummyConst');
import * as Utils from "../../../utils/index";
import * as RummyIndex from "../lib/untils/RummyIndex";
import { createPlayerUid } from "../../../utils/general";
import { Player } from "../../../common/dao/mysql/entity/Player.entity";
/**
 * 一副牌
 */
let CC_DEBUG = false;

//       0     1      2     3        4     5      6     7      8      9     10      11     12
//    ['黑A', '黑2', '黑3', '黑4', '黑5', '黑6', '黑7', '黑8', '黑9', '黑10', '黑J', '黑Q', '黑K',
//     13     14     15     16     17     18      19    20     21     22     23      24     25
//     '红A', '红2', '红3', '红4', '红5', '红6', '红7', '红8', '红9', '红10', '红J', '红Q', '红K',
//     26      27     28    29     30     31      32    33    34      35     36      37     38
//     '梅A', '梅2', '梅3', '梅4', '梅5', '梅256', '梅7', '梅8', '梅9', '梅10', '梅J', '梅Q', '梅K，
//     39      40     41   42      43    44      45    46     47      48      49    50       51
//     '方A', '方2', '方3', '方4', '方5', '方6', '方7', '方8', '方9', '方10', '方J', '方Q', '方K',
//     52    53 ]
//     '小鬼','大鬼'

/**
 * 随机一副牌
 */
export function randomPoker() {
    let poker: number[] = [];
    for (let i = 0; i < 54; i++) {
        poker.push(i);
    }

    return poker;
};



/**
 * 从底牌里面获取变牌
 */

export function getChangeCard() {
    let poker = randomPoker();
    for (let j = 1; j <= 5; j++) {
        const random = Utils.random(0, 51)
        let changeCard = poker[random];
        if (!RummyConst.CARD_TYPE_GUIPAI.includes(changeCard)) {
            return changeCard;
        }
    }
}

/**
 * 根据变牌点数来获取对应点数的其他花色的变牌
 */

export function getOtherChangeCard(changeCard: number) {
    let list = [];
    let num = changeCard % 13;
    for (let i = 0; i <= 3; i++) {
        list.push(i * 13 + num);
    }
    return list;

}


/**
 * 获取两个玩家的牌 都是真人
 */
export function getPlayerCards() {
    const poker = randomPoker(); //获取一副牌
    let pokerList = poker.concat(randomPoker());
    //将扑克打乱
    shuffle(pokerList);
    const player1: { list, poker } = getRandomCards(pokerList);
    pokerList = player1.poker;
    const player2: { list, poker } = getRandomCards(pokerList);
    let first: { card, pokerList } = getFirstCard(pokerList)
    return { playerCards_1: player1.list, playerCards_2: player2.list, pokerList: first.pokerList, firstCard: first.card }
}

/**
 * 获取两个玩家的牌，一个真人一个机器人
 */

export function getRobotAndPlayerCards(winPlayer: number, changeCard: number, changeCardList: number[]) {
    const random = Utils.random(1, 100);
    // let random = 90;
    if (winPlayer == 1) { //玩家获取好牌,机器人获取机器人的差牌
        if (random >= RummyConst.Rummy_Data.WinPlayerGoodRobotCard_start && random <= RummyConst.Rummy_Data.WinPlayerGoodRobotCard_end) {
            const playerCards: { poker, list } = getGoodCards(1, changeCard, changeCardList);
            const robotCards: { poker, list } = getRobotBadCards(changeCard, changeCardList);
            let pokerList = playerCards.poker.concat(robotCards.poker);
            let result_Del: { pokerList, finallyCard } = getChangeCardToDel(pokerList, changeCardList);
            let first: { card, pokerList } = getFirstCard(result_Del.pokerList);
            CC_DEBUG && console.warn(`winPlayer:${winPlayer}, random${random},robotCards:${robotCards.list},playerCards:${playerCards.list.length},pokerList:${first.pokerList.length},firstCard:${first.card}`);
            return { robotCards: robotCards.list, playerCards: playerCards.list, pokerList: first.pokerList, firstCard: first.card, finallyCard: result_Del.finallyCard };
        } else if (random >= RummyConst.Rummy_Data.WinPlayerGropRobotCard_start && random <= RummyConst.Rummy_Data.WinPlayerGropRobotCard_start) {  //发给机器人弃牌
            const playerCards: { poker, list } = getGoodCards(1, changeCard, changeCardList);

            const robotCards: { list, poker } = getGropCards(changeCardList, playerCards.poker);

            let result_Del: { pokerList, finallyCard } = getChangeCardToDel(robotCards.poker, changeCardList);


            let first: { card, pokerList } = getFirstCard(result_Del.pokerList);

            CC_DEBUG && console.warn(`winPlayer:${winPlayer}, random${random}, robotCards:${robotCards.list},playerCards:${playerCards.list.length},pokerList:${first.pokerList.length},firstCard:${first.card}`);
            return { robotCards: robotCards.list, playerCards: playerCards.list, pokerList: first.pokerList, firstCard: first.card, finallyCard: result_Del.finallyCard }
        } else {
            const playerCards: { poker, list } = getGoodCards(1, changeCard, changeCardList);
            const poker = randomPoker(); //获取一副牌
            let pokerList = poker.concat(playerCards.poker);
            //将扑克打乱
            shuffle(pokerList);
            const robotCards: { list, poker } = getRandomCards(pokerList);

            let result_Del: { pokerList, finallyCard } = getChangeCardToDel(robotCards.poker, changeCardList);

            let first: { card, pokerList } = getFirstCard(result_Del.pokerList);
            CC_DEBUG && console.warn(`winPlayer:${winPlayer}, random${random}, robotCards:${robotCards.list},playerCards:${playerCards.list.length},pokerList:${first.pokerList.length},firstCard:${first.card}`);
            return { robotCards: robotCards.list, playerCards: playerCards.list, pokerList: first.pokerList, firstCard: first.card, finallyCard: result_Del.finallyCard }
        }

    } else {
        const robotCards: { poker, list } = getGoodCards(2, changeCard, changeCardList);
        const playerCards: { poker, list } = getBadCards(changeCard, changeCardList, robotCards.poker);
        let result_Del: { pokerList, finallyCard } = getChangeCardToDel(playerCards.poker, changeCardList);
        let first: { card, pokerList } = getFirstCard(result_Del.pokerList);
        CC_DEBUG && console.warn(`winPlayer:${winPlayer}, random${random}, robotCards:${robotCards.list},playerCards:${playerCards.list.length},pokerList:${first.pokerList.length},firstCard:${first.card}`);
        return { robotCards: robotCards.list, playerCards: playerCards.list, pokerList: first.pokerList, firstCard: first.card, finallyCard: result_Del.finallyCard }
    }
}

/**
 * 获取完两个玩家的牌过后，需要取一张变牌作为底牌
 */

function getChangeCardToDel(pokerList: number[], changeCardList: number[]) {
    for (let m of changeCardList) {
        const index = pokerList.indexOf(m);
        if (index !== -1) {
            pokerList.splice(index, 1);
            return { pokerList: pokerList, finallyCard: m }
        }
    }

}

/**
 * 获取第一张牌
 */
function getFirstCard(pokerList: number[]) {
    const card = pokerList[0];
    pokerList.splice(0, 1);
    return { card, pokerList }
}

/** 获取机器人和真实玩家的牌 */
export function getGoodCards(forNum: number, changeCard: number, changeCardList: number[]) {
    //颜色数组
    let color = [0, 1, 2, 3];
    const poker = randomPoker();
    let list = [];
    //随机一个花色作为纯连
    getOneShun(color, list);
    // cardNum += cardOneColorNum;
    //非纯连的牌 , 给两张连着的牌，或者差一张牌形成三张的两张牌, 0为两张连着，1为 差一张牌形成三张的两张牌
    for (let i = 0; i < forNum; i++) {
        getChunlian(color, list);
    }
    //获取两张不同颜色类型的相同牌
    // const random = Utils.random(0,100);
    // if(random > RummyConst.Rummy_Data.GetGoodBaoZi){
    //     getBaoziType(list);
    // }
    //获取鬼牌或者变牌
    getChangeCardAndGuiPai(list, changeCardList)
    //首先将已经安排好的牌进行poke删除
    delePokerCard(poker, list);
    //将扑克打乱
    shuffle(poker);
    //剩下的就随机获取剩余的牌
    // list =  finallyCard(poker,list);
    // console.warn("poker",poker.length)

    //剩下的就随机获取剩余的牌
    list = finallyCard_notChangeAndGui(poker, list, changeCardList);
    return { poker, list }
};


/** 获取机器人和真实玩家的牌 */
export function getBadCards(changeCard: number, changeCardList: number[], lastPoker: number[]) {
    //颜色数组
    const poker = randomPoker();
    let list = [];
    //获取两种相同的牌,这两种相同的牌不能是变牌
    getSameCards(lastPoker, list, changeCardList);
    lastPoker = lastPoker.concat(poker);
    //将扑克打乱
    shuffle(poker);
    //首先将已经安排好的牌进行poke删除
    delePokerCard(lastPoker, list);
    //剩下的就随机获取剩余的牌
    list = finallyCard(lastPoker, list);
    return { list, poker: lastPoker }
};


/** 机器人获取的差牌 */
export function getRobotBadCards(changeCard: number, changeCardList: number[]) {
    //颜色数组
    let color = [0, 1, 2, 3];
    const poker = randomPoker();
    let list = [];
    //随机一个花色作为纯连
    getOneShun(color, list);
    // cardNum += cardOneColorNum;
    //非纯连的牌 , 给两张连着的牌，或者差一张牌形成三张的两张牌, 0为两张连着，1为 差一张牌形成三张的两张牌
    // getChunlian(color , list);
    //获取鬼牌或者变牌
    //首先将已经安排好的牌进行poke删除
    delePokerCard(poker, list);
    //将扑克打乱
    shuffle(poker);
    //剩下的就随机获取剩余的牌
    list = finallyCard(poker, list);
    return { poker, list }
};


/** 获取随机牌 */
export function getRandomCards(poker: number[]) {
    //颜色数组
    let list = [];
    //剩下的就随机获取剩余的牌
    list = finallyCard(poker, list);
    return { list, poker }
};


/** 获取能让机器人弃牌的牌 */
export function getGropCards(changeCardList: number[], lastPoker: number[]) {
    //颜色数组
    let poker = randomPoker();
    const { lastCards } = robotCardsChangeCardsSeparate(poker, changeCardList);
    const notGuiPoker: { lastCards, robotGuiPaiCards } = robotCardsGuiPaiSeparate(lastCards);
    let pokerList = notGuiPoker.lastCards;
    //然后取不能成为组合的牌
    let list = getGropCards_notShun(pokerList, lastPoker, changeCardList);
    let allCards = poker.concat(lastPoker);
    if (list.length == 13) {
        for (let m of list) {
            let index = allCards.indexOf(m);
            allCards.splice(index, 1)
        }
        shuffle(allCards);
        return { list, poker: allCards }
    } else {

        for (let m of list) {
            let index = allCards.indexOf(m);
            allCards.splice(index, 1)
        }
        //剩下的就随机获取剩余的牌
        shuffle(allCards)
        let list_ = finallyCard_notChangeAndGui(allCards, list, changeCardList);
        return { list: list_, poker: allCards }
    }
};

/**
 * 获取能放弃的牌,就是没有纯连,并且分数大于70  13张牌，每个花色牌都有一个10，13
 * @param cards
 */
export function getGropCards_notShun(cards: number[], lastPoker: number[], changeCardList: number[]) {
    //获取1-2个相同的牌
    let list = [];
    //先从 cards 里面获取达不到纯连的10张牌
    const color = [0, 1, 2, 3];
    for (let m of color) {
        const cardList = getGrop_oneColor_card(m, cards);
        list = list.concat(cardList);
    }
    if (list.length > 13) {
        let length = list.length - 13;
        for (let i = 0; i < length; i++) {
            let random = Utils.random(0, list.length - 1);
            list.splice(random, 1)
        }
    }

    // if(list.length < 13){
    //     let length = 13 - list.length;
    //     let cards = [];
    //     for(let i = 1 ; i<= length; i++ ){
    //         if(i == length){
    //             let random = Utils.random(0,3)
    //             cards.push(changeCardList[random]);
    //         }else{
    //             shuffle(list);
    //             shuffle(lastPoker);
    //             let card = list[i];
    //             if(lastPoker.includes(card)){
    //                 cards.push(card);
    //             }else{
    //                 cards.push(lastPoker[i]);
    //             }
    //         }
    //
    //     }
    //     list = list.concat(cards);
    // }

    return list;
}

export function getGrop_oneColor_card(colorType: number, cards: number[]) {
    // const color = [0,1,2,3];
    const cardNum = Utils.random(2, 4);
    let start = 12;
    if (cardNum == 3) {
        start = 11
    } else if (cardNum == 2) {
        start = 10
    }
    let cardList = [];
    for (let i = 0; i < cardNum; i++) {
        if (cardList.length == 0) {
            let card = (colorType * 13) + start;
            if (cards.includes(card)) {
                cardList.push(card)
            } else {
                cardList.push(card - 1)
            }
        }
        if (i !== 0) {
            const sub = Utils.random(3, 4);
            let card = cardList[cardList.length - 1] - sub;
            if (cards.includes(card)) {
                cardList.push(card)
            }
        }

    }
    return cardList;
}

/**
 *  将机器人牌堆所有听用牌取出来
 */
function robotCardsChangeCardsSeparate(cards: number[], changeCardList: number[]) {
    let lastCards = [];
    let robotChangeCards = [];
    for (let m of cards) {
        if (changeCardList.includes(m)) {
            robotChangeCards.push(m);
        } else {
            lastCards.push(m);
        }
    }
    return { lastCards, robotChangeCards }
}

/**
 *  将机器人牌堆所有鬼牌取出来
 */
function robotCardsGuiPaiSeparate(cards: number[]) {
    let lastCards = [];
    let robotGuiPaiCards = [];
    for (let m of cards) {
        if (RummyConst.CARD_TYPE_GUIPAI.includes(m)) {
            robotGuiPaiCards.push(m);
        } else {
            lastCards.push(m);
        }
    }
    return { lastCards, robotGuiPaiCards };
}

/**
 * 获取两种相同的牌,这两种相同的牌不能是变牌
 */
function getSameCards(lastPuker: number[], list: number[], changeCardList: number[]) {
    const random = Utils.random(1, 2);
    if (random == 1) {
        let card = getNotChangeInLastPuker(lastPuker, changeCardList, list);
        list.push(card);
        list.push(card);
    } else {
        for (let i = 0; i < 2; i++) {
            let card = getNotChangeInLastPuker(lastPuker, changeCardList, list);
            list.push(card);
            list.push(card);
        }
    }
}
// 获取 lastPuker 不是数组的牌
function getNotChangeInLastPuker(lastPuker: number[], changeCardList: number[], list: number[]) {
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

/**
 * 获取纯连
 */
function getOneShun(color: number[], list: number[]) {

    const cardColor = Utils.random(0, 3);
    //随机三或者四位作为纯连牌张数
    const cardOneColorNum = Utils.random(3, 4);
    //随机从0-13取
    const startNum = Utils.random(0, 9);

    for (let i = 0; i < cardOneColorNum; i++) {
        list.push(cardColor * 13 + (startNum + i));
    }
    const index = color.indexOf(cardColor);
    color.splice(index, 1);
}

/**
 * 剩下的就随机获取剩余的牌
 */
function finallyCard(poker: number[], list: number[]) {
    let length = list.length;
    let ss = poker.splice(0, 13 - length);
    list = list.concat(ss);

    return list;
}

/**
 * 剩下的牌不能获取到鬼牌和变牌
 */
function finallyCard_notChangeAndGui(poker: number[], list: number[], changeCardList: number[]) {

    let length = list.length;
    const { lastCards } = robotCardsChangeCardsSeparate(poker, changeCardList);
    const notGuiPoker: { lastCards, robotGuiPaiCards } = robotCardsGuiPaiSeparate(lastCards);
    let pokerList = notGuiPoker.lastCards;
    let ss = pokerList.splice(0, 13 - length);
    list = list.concat(ss);
    for (let m of ss) {
        const index = poker.indexOf(m);
        poker.splice(index, 1)
    }
    return list;
}


/**洗牌 0-52 17副牌 */
function shuffle(poker: number[]) {
    // 打乱
    poker.sort(() => 0.5 - Math.random());
}


/**
 * 首先将已经安排好的牌进行poke删除
 */
function delePokerCard(poker: number[], list: number[]) {
    for (let m of list) {
        const index = poker.indexOf(m);
        poker.splice(index, 1);
    }
}

/**
 * 获取鬼牌或者变牌
 */

function getChangeCardAndGuiPai(list: number[], changeCardList: number[]) {
    //首先查看list里面有几张变牌，如果超过2张就return,否则就根据情况加1-2张
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
            const random = Utils.random(0, 3)
            list.push(changeCardList[random])
        } else {
            const random = Utils.random(0, 1);
            list.push(RummyConst.CARD_TYPE_GUIPAI[random])
        }
    } else if (haveChange == 1) {
        if (random > RummyConst.Rummy_Data.GoodCardForChange) {
            const random = Utils.random(0, 1);
            list.push(RummyConst.CARD_TYPE_GUIPAI[random])
        }
    }

}


/**
 *获取两张不同颜色类型的相同牌
 */
function getBaoziType(list: number[]) {
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

/**
 * 获取两组2张牌的非纯连的牌
 */
function getChunlian(color: number[], list: number[]) {

    const cardToChun = Utils.random(1, 2);
    const cardNum = Utils.random(0, 10);
    color.sort((a, b) => a - b);
    const random = Utils.random(0, color.length - 1);
    let colorType = color[random];
    if (cardToChun == 0) {
        for (let i = 0; i < 2; i++) {
            list.push((colorType * 13) + (cardNum + i));
        }

    } else {
        for (let i = 0; i < 2; i++) {
            if (i == 0) {
                list.push((colorType * 13) + (cardNum + i));
            } else {
                list.push((colorType * 13) + (cardNum + i) + 1);
            }

        }
    }
    //删除对应颜色的分类
    const index = color.indexOf(colorType);
    color.splice(index, 1);
}

/**
 * 要牌，从牌组中获取需要的牌或者不需要的牌
 * isRobt 是哪个身份在要牌
 */

export function getCardForPoker(pokerList: number[], needCards: number[], winPlayer: number, isRobot: number, round: number, changeCards: number[], controlNum: number = 0) {
    const random = Utils.random(0, 100);
    let num = 0;
    if (controlNum == 100) {
        num = 5;
    } else if (controlNum == 0) {
        num = 0;
    } else {
        num = Math.floor(controlNum / 20) + 1;
    }
    if (winPlayer == 1) {
        if (isRobot == 0) {  //如果是真人玩家在要牌
            if (random > RummyConst.Rummy_Data.GetNeedCardForPlayer) {
                if (needCards.length !== 0) {
                    const result: { card, pokerList } = needCardForPoker(needCards, pokerList, changeCards);
                    if (result && result.card.toString()) {
                        return { card: result.card, pokerList: result.pokerList }
                    }
                }
            }
        } else {
            if (random > RummyConst.Rummy_Data.GetNeedCardForRobot_ForWinPlayer) {
                if (needCards.length !== 0) {
                    const result: { card, pokerList } = needCardForPoker(needCards, pokerList, changeCards);
                    if (result && result.card.toString()) {
                        return { card: result.card, pokerList: result.pokerList }
                    }
                }
            }
        }


    } else if (winPlayer == 2) {
        if (isRobot == 2) {
            if (random > (RummyConst.Rummy_Data.GetNeedCardForRobot_ForWinRobot - num * 10)) {
                if (needCards.length !== 0) {
                    const result: { card, pokerList } = needCardForPoker(needCards, pokerList, changeCards);
                    if (result && result.card.toString()) {
                        return { card: result.card, pokerList: result.pokerList }
                    }
                }
            }

        } else if (isRobot == 0) { //那么就要给玩家废牌
            if (random > (RummyConst.Rummy_Data.GetLoseCardForPlayer - num * 10)) {
                let loseResult: { card, pokerList } = getLoseCards(needCards, pokerList, changeCards);
                if (loseResult && loseResult.card.toString()) {
                    return { card: loseResult.card, pokerList: loseResult.pokerList }
                }
            }

        }
    }

    let card = pokerList[0];
    pokerList.splice(0, 1);
    return { card, pokerList }
}


/**
 * 给玩家废牌，就是不存在needCards里面的还有变牌和鬼牌都不能给
 */
function getLoseCards(needCards: number[], pokerList: number[], changeCards: number[]) {
    for (let i = 0; i < pokerList.length; i++) {
        let card = pokerList[i];
        if (!needCards.includes(card) && !changeCards.includes(card) && !RummyConst.CARD_TYPE_GUIPAI.includes(card)) {
            pokerList.splice(i, 1);
            return { card: card, pokerList }
        }
    }


}


/**
 * 循环 needCards 里面一张牌从 pokerList 取出来
 */

function needCardForPoker(needCards: number[], pokerList: number[], changeCards: number[]) {
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
            pokerList.splice(index, 1)
            return { card: card, pokerList }
        }
    } else if (random > 70 && random < 90) {
        //如果没有获取到需要牌那么就从牌组里面获取变牌或者鬼牌
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
            pokerList.splice(changeIndex, 1)
            return { card: changeCard, pokerList }
        }
    } else if (random > 90) {
        //如果没有获取到需要牌那么就从牌组里面获取变牌或者鬼牌
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
            pokerList.splice(guiPaiCardIndex, 1)
            return { card: guiPaiCard, pokerList }
        }
    }
}


/**
 * 对第一次发牌的牌进行分组，每个花色一组，鬼牌一组
 */

export function cardListType(cards: number[], changeCardList: number[]) {
    let resultCardListType: { key: RummyConst.CardsType, value: number[] }[] = [];
    let black: number[] = [];
    let red: number[] = [];
    let mei: number[] = [];
    let fang: number[] = [];
    let guipai: number[] = [];
    for (let i = 0; i < cards.length; i++) {
        if (RummyConst.CARD_TYPE_GUIPAI.includes(cards[i])) {
            guipai.push(cards[i])
        } else {
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



/**
 * 计算牌的分值  变牌和鬼牌不计分
 * 如果包含了纯连的分数  realPoint
 * 不包含纯连的分数 fakePoint
 * isShaw  如果是胡牌 是true ,胡牌必须纯连 >= 2  ,或者纯连==1 加上非纯连 >=2
 */
export function calculatePlayerPoint(cardsList: any[], changeCardList: number[]) {
    let realPoint = 0;
    let fakePoint = 0;
    let isOne = 0;   //是否包含了第一队列 纯连
    let isTwo = 0;   //是否包含了第二队列 非纯连
    for (let item of cardsList) {
        const type = getCardType(item.value, changeCardList);  //判断是什么类型
        if (type == RummyConst.CardsType.SINGLE) {
            realPoint += countPoint(item.value, changeCardList);
            fakePoint += countPoint(item.value, changeCardList);
        } else if (type == RummyConst.CardsType.BAOZI) {
            fakePoint += countPoint(item.value, changeCardList);
        } else if (type == RummyConst.CardsType.SHUN_GOLDENFLOWER) {
            isTwo += 1;
            fakePoint += countPoint(item.value, changeCardList);
        } else if (type == RummyConst.CardsType.SHUN_GOLDENFLOWER_ONE) {
            isOne += 1;
        }
    }
    if ((isOne == 1 && isTwo >= 1) || (isOne >= 2)) {
        return realPoint > RummyConst.PLAYER_POINT.VALUE ? RummyConst.PLAYER_POINT.VALUE : realPoint;
    } else {
        return fakePoint > RummyConst.PLAYER_POINT.VALUE ? RummyConst.PLAYER_POINT.VALUE : fakePoint;
    }


}

/**
 * 计算分值
 */
function countPoint(list, changeCardList) {
    let point = 0;
    for (let key of list) {
        if (!changeCardList.includes(key) && !RummyConst.CARD_TYPE_GUIPAI.includes(key)) {
            if (RummyConst.CARD_POINT_TYPE.includes(key)) {
                point += 10;
            } else {
                point += key % 13 + 1;
            }
        }
    }
    return point;
}


/**
 * 获取牌型
 */
function getCardType(cards: number[], changeCardList: number[]) {

    if (cards.length < 3) {
        return RummyConst.CardsType.SINGLE;
    }
    //获取牌中包含鬼牌 ,已经剔除出鬼牌了
    const { isGuiPai, cardList, guiPaiNum } = checkHaveGuiPai(cards);
    // 是否同花
    const tempH = Math.floor(cardList[0] / 13);
    const isTonghua = cardList.every(m => tempH === Math.floor(m / 13));
    if (isTonghua) {
        const arr = cardList.map(m => m % 13);
        arr.sort((a, b) => a - b);
        // 是否顺子
        const isShunzi = checkShunzi(arr);
        // 如果是顺子又是金花 --- 顺金 不包含鬼牌 === 第一序列
        if (isShunzi && !isGuiPai) {
            return RummyConst.CardsType.SHUN_GOLDENFLOWER_ONE;
        }
    }

    //检查是否包含有变牌得组合  === 剔除变牌，检验组成同花顺需要几张
    const { isChangeCard, noChangeCardList, changeCardNum } = checkHaveChangeCard(cardList, changeCardList);
    //判定组合牌里面没有相同得牌   isSameCard true
    const isSameCard = bisRepeat(noChangeCardList);
    if (!isSameCard) {
        // console.warn(`isChangeCard:${isChangeCard},noChangeCardList:${noChangeCardList},changeCardNum:${changeCardNum}`)
        //验证包含了变牌以及鬼牌得同花顺子     ====非纯连  第二序列
        //检查是否是同花需要将变牌去掉
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
        // 判定是否是条子
        const arr = noChangeCardList.map(m => m % 13);
        // arr.sort((a, b) => a - b);
        const { isAlike, alikeNum } = checkAlike(arr);
        if (isAlike && (alikeNum + changeCardNum + guiPaiNum) >= 3 && (alikeNum + changeCardNum + guiPaiNum) <= 4) {
            return RummyConst.CardsType.BAOZI;
        }
    }
    return RummyConst.CardsType.SINGLE;
};


/**是否包含 变牌*/
export function checkHaveChangeCard(cards: number[], changeCardList: number[]) {
    let isChangeCard = false;
    let noChangeCardList = [];
    let changeCardNum = 0;
    for (let item of cards) {
        if (changeCardList.includes(item)) {
            isChangeCard = true;
            changeCardNum += 1;
        } else {
            noChangeCardList.push(item);
        }
    }
    return { isChangeCard, noChangeCardList, changeCardNum };
}



/**是否包含鬼牌 */
export function checkHaveGuiPai(cards: number[]) {
    let isGuiPai = false;
    let cardList = [];
    let guiPaiNum = 0;
    let guiPaiList = []; //鬼牌数组
    for (let item of cards) {
        if (item == 52 || item == 53) {
            isGuiPai = true;
            guiPaiNum += 1;
            guiPaiList.push(item);
        } else {
            cardList.push(item);
        }
    }
    return { isGuiPai, cardList, guiPaiNum, guiPaiList };
}


/**是否顺子  */
function checkShunzi(cards: number[]) {
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
};

/**是否顺子 如果包含了鬼牌，变成顺子需要几张变牌 */
function checkGuiPaiShunzi(cards: number[]) {
    cards.sort((a, b) => a - b);
    let num = 0;  //需要几张变牌
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
};

/**
 *  检验是否有重复元素  有重复返回true ，否则就是false
 */
function bisRepeat(cardList: number[]) {
    let hash = {};
    for (let i in cardList) {
        if (hash[cardList[i]]) {
            return true;
        }
        // 不存在该元素，则赋值为true，可以赋任意值，相应的修改if判断条件即可
        hash[cardList[i]] = true;
    }
    return false;
}


/**检查相同的 */
function checkAlike(cards: number[]) {
    let prv = statisticalFieldNumber(cards);
    let list = [];
    for (let key in prv) {
        list.push({ key: key, value: prv[key] })
    }
    if (list.length == 1) {
        return { isAlike: true, alikeNum: list[0].value };
    } else {
        return { isAlike: false, alikeNum: 0 };
    }

};


/**
 * 查看数组中相同得元素有几个
 * arr：[1,1,1,1,3]
 * prev:{1:4,3:1,}
 * @param arr
 */

function statisticalFieldNumber(arr) {
    return arr.reduce(function (prev, next) {
        prev[next] = (prev[next] + 1) || 1;
        return prev;
    }, {});
}

