

import  {robotCardsType , checkShunzi ,loseCards ,robotCardsToCombination ,checkBaozi ,checkHaveChangeShunzi ,finallyCheck} from "../../app/servers/Rummy/robot/cardTypeUtils";
import  { calculatePlayerPoint ,getGoodCards , getBadCards ,getRobotBadCards ,getPlayerCards ,getRobotAndPlayerCards ,getCardForPoker ,getGropCards ,getGropCards_notShun} from "../../app/servers/Rummy/lib/RummyLogic";
import * as Utils from "../../app/utils";
import * as cardTypeUtils from "../../app/servers/Rummy/robot/cardTypeUtils";
async function clean() {
    console.warn(Date.now())
    let  cards = [30,31,32,50,51,39,44,45,46,38,38,43,17,19];
    const changeCardList = [4,17,30,43]
    // let cardTypeList : any[] = [];
    let needCards = [];
    // let lastCards = [0];
    // let puke =  [
    //     40, 27, 35,  2, 19, 26,  0, 52,  4,
    //     15, 22,  1, 39, 37,  8, 53, 28, 46, 18,
    //     21, 14, 17, 49, 20, 50, 41, 43, 44, 33,
    //     11,  9, 38, 23, 10, 24, 30, 42, 51, 34,
    //     45
    // ];

    // const cardTypeList = [
    //     { key: 'SHUN_GOLDENFLOWER_ONE', value: [ 30, 31, 32 ] },
    //     { key: 'SHUN_GOLDENFLOWER_ONE', value: [ 39, 50, 51] },
    //     { key: 'SHUN_GOLDENFLOWER_ONE', value: [ 44, 45, 46 ] },
    //     { key: '"SINGLE"', value: [ 38, 38, 17, 43 ] }
    // ]
    // const point =  calculatePlayerPoint(cardTypeList,changeCardList)
    // console.warn("point....",point)

    // // for(let i = 0 ; i< 2;i++){
    //  let result : { lastCards , cardTypeList } = robotCardsType( cards , changeCardList, cardTypeList ,needCards);
    // let result: { cards, loseCard , cardTypeList  ,needCards } = robotCardsToCombination( cards , changeCardList, null );
    // console.warn("cardTypeList....",result.cards)
    // console.warn("loseCard....",result.loseCard)
    // console.warn("cardTypeList....",result.cardTypeList)
    // console.warn("needCards....",result.needCards)
    // // }
    // let lastCards = [ 8, 15, 10];
    // let lastCards = [ 43,45, 23];
    // let cardTypeList = [
    //     { type: 'SHUN_GOLDENFLOWER_ONE', cards: [ 1, 2, 3, 4 ] },
    //     { type: 'SHUN_GOLDENFLOWER_ONE', cards: [ 16, 17, 19, ] },
    //     { type: 'SHUN_GOLDENFLOWER', cards: [ 45, 7 , 13 ] },
    //     { type: 'SHUN_GOLDENFLOWER', cards: [ 23, 30 ,43 ,52] },
    // ];

    // checkHaveChangeShunzi(  [0,9,11]  , 1 ,   [] );
    // checkShunzi(  lastCards  , changeCardList , 0,  needCards );


     //测试包子
    // checkBaozi([6,23],[38],[],[],[])
    // 判断剩余的牌里面
    // let  cards = [  30, 31, 32, 42, 43, 16,
    //     17, 33, 25,  0, 40, 18,
    //     41
    //
    // ];
    // let cardTypeList =  [
    //     { type: 'SHUN_GOLDENFLOWER_ONE', cards: [ 16, 17, 18 ] },
    //     { type: 'SHUN_GOLDENFLOWER_ONE', cards: [ 30, 31, 32, 33 ] },
    //     { type: 'SHUN_GOLDENFLOWER_ONE', cards: [ 40, 41, 42, 43 ] }
    // ]
    // finallyCheck([0, 25], cardTypeList, changeCardList, cards)
     //测试获取好牌的方法
    // getGoodCards(0,[0,13,26,39])

    //测试获取坏牌的方法

    // getBadCards(0,[0,13,26,39], puke)
    //机器人获取的差牌
    // getRobotBadCards(0,[0,13,26,39]);
    //机器人获取能够弃牌

    // let lastCards = [   1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12,
    //                 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,24, 25,
    //                 27, 28, 29, 30, 31, 32, 33, 34, 35,36, 37, 38,
    //                 40, 41, 42, 43, 44, 45, 46, 47,48, 49, 50, 51]
    // console.warn("lastCards....",lastCards.length)
    // for(let i= 0 ;i< 100 ;i++){
    //     const { list , poker  } =  getGropCards(changeCardList, lastCards);
    //     console.warn("list....",list)
    //     console.warn("poker....",poker.length)
    // }
    //获取两个玩家的牌 都是真人
    // getPlayerCards()
    //获取两个玩家的牌，一个真人一个机器人
    // for(let i = 0 ; i<100;i++){
    //     const { robotCards , playerCards , pokerList  ,firstCard} =  getRobotAndPlayerCards(2,0,[0,13,26,39])
    //     if(pokerList.length !== 81 ){
    //         console.warn("xxxxxxxxxxxxxxxxxxxxxxxxxx,robotCards",robotCards,"playerCards",playerCards)
    //     }
    //     // const random = Utils.random(0, 2);
    //     // console.warn("random...",random)
    // }
    // let puke =  [ 1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12];
    // let needCards = [20]
    // //从牌组中获取需要的牌
    // const { card : card ,pokerList } = getCardForPoker(puke,needCards,2,2,8,changeCardList);
    // console.warn("card...",card)
    // console.warn("pokerList...",pokerList)
    //从牌组中获取需要的牌
    // const result: { loseCard, cardTypeList ,cards } = loseCards(cards,cardTypeList,lastCards,changeCardList);
    //机器人整理牌型
    // for(let i = 18 ; i<= 53; i++){

        // const result : { cards, loseCard , cardTypeList ,needCards }  = robotCardsToCombination(cards,changeCardList)
        // console.warn("loseCard....",result.cards)
        // console.warn("loseCard....",result.loseCard)
        // console.warn("cardTypeList....",result.cardTypeList)
        // console.warn("needCards....",result.needCards)
    //     let length = 0;
    //     for(let m of result.cardTypeList){
    //         length += m.value.length;
    //     }
    //     if(length == 12){
    //         console.warn("i....",i)
    //     }
    // }
    // console.warn("needCards....",result.needCards)
    // let ss = [4,11,12];
    // if(ss[0] != 0 || ss[ss.length - 1] != 12){
    //     console.warn("222222222222222")
    // }
    // const control = 25;
    // console.warn(Math.floor(control / 20));
    console.warn(Date.now())
    process.exit();
    return;
}





setTimeout(clean, 0);