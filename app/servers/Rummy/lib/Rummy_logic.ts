import RummyConst = require('./RummyConst');
import * as Utils from "../../../utils/index";
import * as RummyIndex from "../lib/untils/RummyIndex";
/**
 * 一副牌
 */

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


/**洗牌 0-52 17副牌 */
export function shuffle() {
    // 获取一副顺序的牌
    const poker = randomPoker();
    const pokerList = poker.concat(poker);
    // 打乱
    pokerList.sort(() => 0.5 - Math.random());
    return pokerList;
}






/**
 * 获取牌型
 */
export function getCardType(cards: number[], changeCardList: number[]) {
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

    //判定组合牌里面没有相同得牌   isSameCard true
    const isSameCard = bisRepeat(noChangeCardList);
    // 判定是否是条子
    if (!isSameCard) {
        const arr = noChangeCardList.map(m => m % 13);
        // arr.sort((a, b) => a - b);
        const { isAlike, alikeNum } = checkAlike(arr);
        if (isAlike && (alikeNum + changeCardNum + guiPaiNum) >= 3 && (alikeNum + changeCardNum + guiPaiNum) <= 4) {
            return RummyConst.CardsType.BAOZI;
        }
    }
    return RummyConst.CardsType.SINGLE;
};


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
    return { isGuiPai, cardList, guiPaiNum , guiPaiList };
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











