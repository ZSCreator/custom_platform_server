
import  * as cardTypeUtils from "../../app/servers/Rummy/robot/cardTypeUtils";
import  * as  RummyLogic from "../../app/servers/Rummy/lib/RummyLogic";
let robotCards = [];
let robotCardList :any [] = [];
let pokerList = null;
let firstCard = null;
let loseCard = null;
let lostCards = [];
let winPlayer = 1;  //2是机器人赢牌，1是真人赢牌
let round = 1;
let needCards = [];
let point = 20;
let changeCard = null;  //获取变牌
let changeCardList = []; //获取变牌的数组
let roundList = [];
async function startTest() {
    //回合开始的时候,初始化
     changeCard = RummyLogic.getChangeCard();  //获取变牌
     changeCardList = RummyLogic.getOtherChangeCard(changeCard); //获取变牌的数组
     robotCards = [];
     robotCardList  = [];
     pokerList = null;
     firstCard = null;
     loseCard = null;
     lostCards = [];
     winPlayer = 1;  //2是机器人赢牌，1是真人赢牌
     round = 1;
     needCards = [];
     point = 20;

    //发牌
    const result: { robotCards , playerCards , pokerList  ,firstCard} = RummyLogic.getRobotAndPlayerCards(winPlayer, changeCard, changeCardList);
    robotCards = result.robotCards;
    pokerList = result.pokerList;
    firstCard = result.firstCard;
    console.warn('机器人牌型:',robotCardList,'变牌:',changeCardList,'牌:',robotCards,);
    lostCards.push(firstCard);
    //整理机器人的牌型
    //机器人收到牌进行组合
    const result_1 : {  cards, loseCard , cardTypeList ,needCards } = cardTypeUtils.robotCardsToCombination(robotCards , changeCardList);
    robotCardList = result_1.cardTypeList;
    needCards = result_1.needCards;
    robotCards = result_1.cards;
    loseCard = result_1.loseCard;
    console.warn('机器人第一次整理牌型:',robotCardList,'变牌:',changeCardList,'需要的牌',needCards,);
    //是否要进行弃牌
     point = RummyLogic.calculatePlayerPoint(robotCardList, changeCardList);
    let robotGop = cardTypeUtils.robotGrop(point,robotCards,robotCardList,changeCardList,round);
    if(robotGop){
        console.warn('机器人弃牌:牌型:',robotCardList,'分数$',point,',变牌:',changeCardList,'需要的牌',needCards,);
    }
    //机器人回合
    for(let i = 1 ;i<= 21 ;i++){
        if(point == 0){
            return round;
        }else {
            round_fun();
        }
    }

}

/**
 * 一回合
 */

function round_fun() {
    //机器人要牌
    let card = getCard();
    //要到牌进行牌型整理
    robotCards.push(card)
    console.warn('机器人要到牌后的牌:',robotCards,'要牌',card,'变牌',changeCardList,'回合',round);
    const result_2 : {  cards, loseCard , cardTypeList ,needCards } = cardTypeUtils.robotCardsToCombination(robotCards , changeCardList ,card);
    robotCardList = result_2.cardTypeList;
    needCards = result_2.needCards;
    robotCards = result_2.cards;
    loseCard = result_2.loseCard;
    //机器人要到牌后整理牌型

    //是否要进行弃牌
    point = RummyLogic.calculatePlayerPoint(robotCardList, changeCardList);
    //机器人要到牌后整理牌型
    console.warn('机器人要到牌后整理牌型:',robotCardList,'分数',point,'变牌',changeCardList,'需要的牌',needCards,'丢掉的牌',loseCard);
    let robotGop = cardTypeUtils.robotGrop(point,robotCards,robotCardList,changeCardList,round);
    if(robotGop){
        console.warn('机器人弃牌:',robotCardList,'分数',point,'变牌',changeCardList);
        return;
    }
    //是否可以进行胡牌
    if(point == 0){
        console.warn('机器人胡牌牌型:',robotCardList,'分数',point,'变牌',changeCardList);
    }
    //机器人丢牌
    lostCards.push(loseCard);
    round += 1;
}

//从废牌里面点击要牌
function getCard(){
    // let needCard = lostCards[lostCards.length - 1];
    // if (needCards.includes(needCard)) {
    //     return needCard;
    // }else {
        const result: { card , pokerList } = RummyLogic.getCardForPoker(pokerList, needCards, winPlayer,2, round, changeCardList);
        return result.card;
    // }
}

async function clean(){
    let roundList = [];
    for(let i= 1 ;i<= 1 ;i++){
        const round = await startTest();
        console.warn("round",round)
        roundList.push(round);
    }
    for(let i= 2;i<= 20;i++){
        if(i < 10){
            const ls = roundList.filter(x=> x== i)
            console.warn(`${i} 回合结束的有${ls.length}局`)
        }else if(i > 10 && i < 20){
            const ls = roundList.filter(x=> x>= i)
            console.warn(`${i} 回合结束的有${ls.length}局`)
        }else{
            const ls = roundList.filter(x=> x>= 20)
            console.warn(`20以上 回合结束的有${ls.length}局`)
        }

    }
    console.warn(Date.now())
    process.exit();
}





setTimeout(clean, 0);