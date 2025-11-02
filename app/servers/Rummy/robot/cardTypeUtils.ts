import * as RummyConst from "../lib/RummyConst";
import {getArrDifference} from "../../../utils/index";
import {randomFromRange} from "../../../utils/lottery/commonUtil";
import * as RummyLogic from "../lib/RummyLogic";

let CC_DEBUG = false;

/**
 * 机器人整理牌型
 * getCard 要到的牌
 */
export function robotCardsToCombination(cards :number[],  changeCardList : number[] , getCard : number = null) {

    let lastCards = cards;  // cards
    let cardTypeList : any[] = [];  //机器人的牌型
    let needCards = [];
    let loseCard = null;
    for(let i = 0 ; i< 2;i++){
     let result : { lastCards , cardTypeList ,needCards } = robotCardsType( lastCards , changeCardList, cardTypeList ,needCards);
         lastCards = result.lastCards;
         cardTypeList = result.cardTypeList;
         needCards = result.needCards;
    }



    if( cards.length == 14 ){
        //如果cards 为14张牌就需要丢弃一张牌
        if(cards.length == 14){
            const result: { loseCard, cardTypeList ,cards ,lastCards } = loseCards(cards, cardTypeList, lastCards,changeCardList , getCard);
            loseCard = result.loseCard;
            cardTypeList = result.cardTypeList;
            cards = result.cards;
            lastCards = result.lastCards;
        }
    }


    if(lastCards.length > 0){
        cardTypeList.push({type:RummyConst.CardsType.SINGLE, cards:lastCards})
    }
    let cardsList = [];
    for(let m  of cardTypeList){
        cardsList.push({key: m.type , value: m.cards })
    }
    //需要的牌需要进行去重
    needCards = unique(needCards);
    CC_DEBUG && console.warn("最后丢弃的牌", loseCard );
    CC_DEBUG && console.warn("最后的牌组", cardsList );
    CC_DEBUG && console.warn("最后需要的牌", needCards );

    return { cards, loseCard , cardTypeList : cardsList ,needCards }
}


/**
 * 判断机器人是否需要弃牌 grop
 */

export function robotGrop(point :number ,cards:number[], cardTypeList : any [] , changeCardList : number[] , round : number) {
    if( round == 1 && point <= 70 ){
        return  false;
    }
    const item = cardTypeList.find(x=>x.key == RummyConst.CardsType.SHUN_GOLDENFLOWER_ONE);
    if(item){
        return false;
    }
    //对整理出来的牌进行非纯连组合,先将剩余牌lastCards的听用牌取出来
    let Separate_2 : { lastCards ,  robotChangeCards} = robotCardsChangeCardsSeparate(cards , changeCardList);
    //再将所有lastCards 的鬼牌取出来
    let guiPaiCombination : { lastCards ,  robotGuiPaiCards} = robotCardsGuiPaiSeparate(Separate_2.lastCards);
    let listenNum = Separate_2.robotChangeCards.length + guiPaiCombination.robotGuiPaiCards.length;
    if( listenNum >= 2){
       return false;
    }

    if(round == 3){
        const random = randomFromRange(0,100);
        if(random< 50){
            return false;
        }
    }

    return true;
}

/**
 * 如果cards 为14张牌就需要丢弃一张牌
 */

export function loseCards(cards :number[] ,cardTypeList : any [] , lastCards : number[] , changeCardList : number[] , getCard : number) {
        let loseCard = null;
        //第一步首先将听用牌和鬼牌去除
        //对整理出来的牌进行非纯连组合,先将剩余牌lastCards的听用牌取出来
        let Separate_2 : { lastCards ,  robotChangeCards} = robotCardsChangeCardsSeparate(lastCards , changeCardList);
        //再将所有lastCards 的鬼牌取出来
        let guiPaiCombination : { lastCards ,  robotGuiPaiCards} = robotCardsGuiPaiSeparate(Separate_2.lastCards);
        CC_DEBUG && console.warn("22222222222",guiPaiCombination.lastCards);
        CC_DEBUG && console.warn("222222222221111111111",Separate_2.robotChangeCards);
        if(guiPaiCombination.lastCards.length > 0){
            loseCard = getLoseCard(guiPaiCombination.lastCards , getCard);
        }else{
            if(lastCards.length == 0 ){ //当可以丢弃的牌里面没得牌了,需要从已经组合好的非纯连里面获取一张牌作为丢弃
                CC_DEBUG && console.warn("cardTypeList...22222",cardTypeList);

                const result :  {card ,cardTypeList } = getLoseCardForCardTypeList(cardTypeList,changeCardList)
                if(result && result.card){
                    loseCard = result.card ;
                    cardTypeList = result.cardTypeList;
                }
            }else if(lastCards.length > 0){   //当丢弃的牌里面有牌，那么就是鬼牌或者变牌
                if(Separate_2.robotChangeCards > 0 || guiPaiCombination.robotGuiPaiCards > 0){
                    //第一步判断当变牌有的时候，那么就要从非纯连牌中去除
                    let card = null;
                    if(Separate_2.robotChangeCards > 0 ){
                         card = Separate_2.robotChangeCards[0];
                    }else if(guiPaiCombination.robotGuiPaiCards > 0){
                         card = guiPaiCombination.robotGuiPaiCards[0];
                    }
                    loseCard = checkLoseCard(cardTypeList, card,changeCardList);
                    if(card != null){
                        let index = lastCards.indexOf(card);
                        if(index != -1){
                            lastCards.splice(index,1);
                        }

                    }
                }

            }

        }
        // if(loseCard == null){
        //
        //     let item = cardTypeList[cardTypeList.length - 1];
        //     let Separate_2 : { lastCards ,  robotChangeCards} = robotCardsChangeCardsSeparate( item.cards , changeCardList);
        //     //再将所有lastCards 的鬼牌取出来
        //     let guiPaiCombination : { lastCards ,  robotGuiPaiCards} = robotCardsGuiPaiSeparate(Separate_2.lastCards);
        //     let cards = guiPaiCombination.lastCards;
        //     loseCard = cards[cards.length - 1];
        //     let index = item.cards.indexOf(loseCard);
        //     cardTypeList[cardTypeList.length - 1].cards.splice(index, 1);
        // }
        //
        if(loseCard != null){
            let index = cards.indexOf(loseCard);
            cards.splice(index,1);
            let index_ = lastCards.indexOf(loseCard);
            if(index_ != -1){
                lastCards.splice(index_,1);
            }
        }
        return { loseCard, cardTypeList ,cards , lastCards } ;
}

/**
 * 查看如果lastCard为变牌和鬼牌，那么就不能丢弃，需要直接
 */

function checkLoseCard(cardTypeList : any [] , robotChangeCard:number , changeCardList : number[] ) {
    //先找出组合数大于4的
    let item = null;
    let card = null; //取出来的card
    const fourCardsType =  cardTypeList.filter(x=>x.cards.length >=4);
    if(fourCardsType.length > 1){
        const ll = fourCardsType.filter(x=>x.type == RummyConst.CardsType.SHUN_GOLDENFLOWER);
        if(ll.length > 0){
            item = ll[0];
        }else{
            item =  fourCardsType[0];
        }
    }else{
        item =  fourCardsType[0];
    }
    if(item){
        let cards = item.cards;
        let type =  RummyConst.CardsType.SHUN_GOLDENFLOWER;
        let index = cardTypeList.findIndex(x=>x.cards.sort().toString() == cards.sort().toString());
        let Separate_2 : { lastCards ,  robotChangeCards} = robotCardsChangeCardsSeparate(cards , changeCardList);
        //再将所有lastCards 的鬼牌取出来
        let guiPaiCombination : { lastCards ,  robotGuiPaiCards} = robotCardsGuiPaiSeparate(Separate_2.lastCards);
        let cards_ = guiPaiCombination.lastCards.sort((a,b)=>b - a);
        if(cards_.length > 0){
            card = cards_[cards_.length - 1];
        }

        if(card){
            let index_1 = cards.indexOf(card);
            cards.splice(index_1,1);
            //将该牌发放到数组里面
            cards.push(robotChangeCard);
            //删除原有的那一条分类
            cardTypeList.splice(index,1);
            // cardTypeList.push(cardsType);
            cardTypeList.push({type: type , cards});
        }

    }

    return card ;
}


/**
 * 从已经组合好的里面取一张
 */
function getLoseCardForCardTypeList(cardTypeList:any[] ,changeCardList : number[] ) {
    const fourCardsType =  cardTypeList.filter(x=>x.cards.length >=4);
    let item = null;
    let card = null; //取出来的card
    if(fourCardsType.length > 1){
        const ll = fourCardsType.filter(x=>x.type == RummyConst.CardsType.SHUN_GOLDENFLOWER);
        if(ll.length > 0){
            item = ll[0];
        }else{
            item =  fourCardsType[0];
        }
    }else{
        item =  fourCardsType[0];
    }
    if(item){
        let cards = item.cards;
        let Separate_2 : { lastCards ,  robotChangeCards} = robotCardsChangeCardsSeparate(cards , changeCardList);
        //再将所有lastCards 的鬼牌取出来
        let guiPaiCombination : { lastCards ,  robotGuiPaiCards} = robotCardsGuiPaiSeparate(Separate_2.lastCards);
        let cards_ = guiPaiCombination.lastCards.sort((a,b)=>b - a);
        if(cards_.length > 0){
            card = cards_[cards_.length - 1];
        }
    }
    //如果取到元素就将元素从组合好的牌组中取出来
    if(card != null){
        const cardDel : { cardTypeList } = cardDelToCardTypeList(card, item, cardTypeList );
        cardTypeList = cardDel.cardTypeList;
        return { card , cardTypeList }
    }else {
        return { card , cardTypeList }
    }
}


/**
 * 获取要丢弃的那张牌
 */

function getLoseCard(lastCards : number[] , getCard : number) {
    //选出有相同的牌丢弃
    let list_unsame = [];
    //就选者一张花色比较少，分数比较高的
    let card0 = [];
    let card1 = [];
    let card2 = [];
    let card3 = [];
    for(let m of lastCards){
        if(!list_unsame.includes(m)){
            list_unsame.push(m)
        }else{
            return m;
        }
        let type = Math.floor(m / 13);
        if(type == 0){
            card0.push(m % 13);
        }else if(type == 1){
            card1.push(m % 13);
        }else if(type == 2){
            card2.push(m % 13);
        }else if(type == 3){
            card3.push(m % 13);
        }
    }
    CC_DEBUG && console.warn("lastCards...",lastCards)
    let list = [{type: 0 , cards: card0 },{ type: 1 , cards:card1 },{type: 2 , cards:card2 },{type: 3 , cards:card3}];
    //过滤掉 cards = [];
    list = list.filter(x=>x.cards.length !== 0);
    //选出花色比较少的那个
    list.sort((a,b)=> a.cards.length - b.cards.length);
    CC_DEBUG && console.warn("list...",list)
    let item = list[0];
    CC_DEBUG && console.warn("丢弃牌组...",list)
    //获取分数比较高的进行丢弃
    let cards = item.cards.sort((a,b)=>b - a);
    let card = (item.type * 13) + cards[0];
    if(getCard && card == getCard ){
        card = (item.type * 13) + cards[cards.length - 1];
    }


    CC_DEBUG && console.warn("丢弃的牌...",card)
    return  card;
}

/**
 * 机器人牌型组合函数方法
 */

export function robotCardsType(cards :number[],  changeCardList : number[] , cardTypeList : any [] , needCards : number[]){
    //机器人收到牌进行组合
    let allCards = cards;
    let lastCards = cards; //剩余牌组
    /** step1   对纯连的判断，如果有纯连那么就继续往下面走，如果没有纯连那么就需要判断分值是否超过70,超过70分就选择弃牌*/
    const firstCombination: { list , sameCards  , guiPaiList  } = robotCardsCombination( lastCards );
    //对整理出来的分组进行判断是否有纯连
   CC_DEBUG && console.warn("firstCombination..........cardTypeList",firstCombination.list);
   CC_DEBUG && console.warn("firstCombination..........sameCards",firstCombination.sameCards);
   CC_DEBUG && console.warn("firstCombination..........guiPaiList",firstCombination.guiPaiList);
   const checkOne : { cardTypeList ,lastCards } = checkOneShunzi(firstCombination.list , firstCombination.sameCards , cardTypeList , firstCombination.guiPaiList ,changeCardList ,needCards);

   CC_DEBUG && console.warn("checkOne..........lastCards",checkOne.lastCards);
   CC_DEBUG && console.warn("checkOne..........cardTypeList",checkOne.cardTypeList);
   CC_DEBUG && console.warn("checkOne..........needCards",needCards);
    lastCards = checkOne.lastCards;
    cardTypeList = checkOne.cardTypeList;
    //因为一组牌里面有两幅牌，如果sameCards 里面有大于三张同时是纯连就需要再走一遍纯连逻辑
    // let { haveChangeCard , haveThreeCards , isSameHuase } = robotSameCards(firstCombination.sameCards ,changeCardList);
    // CC_DEBUG && console.warn("haveChangeCard",haveChangeCard);
    // CC_DEBUG && console.warn("haveThreeCards",haveThreeCards);
    // CC_DEBUG && console.warn("isSameHuase",isSameHuase);
    // if( !haveChangeCard  &&  haveThreeCards && isSameHuase ){
    //再走一遍纯连
    const firstCombination_one: { list , sameCards  , guiPaiList  } = robotCardsCombination( checkOne.lastCards  );
    //对整理出来的分组进行判断是否有纯连
    const checkOne1 : { cardTypeList ,lastCards } = checkOneShunzi(firstCombination_one.list , firstCombination_one.sameCards , cardTypeList , firstCombination_one.guiPaiList , changeCardList ,needCards);
    lastCards = checkOne1.lastCards;
    cardTypeList = checkOne1.cardTypeList;
    CC_DEBUG && console.warn("checkOne1..........lastCards",checkOne1.lastCards);
    CC_DEBUG && console.warn("checkOne1..........cardTypeList",checkOne1.cardTypeList);
    CC_DEBUG && console.warn("checkOne1..........needCards",needCards);
    // }
    //对整理出来的牌进行非纯连组合,先将剩余牌lastCards的听用牌取出来
    let Separate : { lastCards ,  robotChangeCards} = robotCardsChangeCardsSeparate(lastCards ,changeCardList);
   CC_DEBUG && console.warn("Separate....lastCards",Separate.lastCards);
   CC_DEBUG && console.warn("Separate...robotChangeCards",Separate.robotChangeCards);
    //如果有纯连的话，那么就需要把重复的牌在放到牌组里面进行重新分组
    /** step2   对连子的判断*/
    const doubleCombination: { list , sameCards  , guiPaiList  } = robotCardsCombination( Separate.lastCards );
   CC_DEBUG && console.warn("doubleCombination....lastCards",doubleCombination.list);
   CC_DEBUG && console.warn("doubleCombination...sameCards",doubleCombination.sameCards);
   CC_DEBUG && console.warn("doubleCombination...guiPaiList",doubleCombination.guiPaiList);
    //对整理出来的牌进行非纯连组合,先将剩余牌的听用牌取出来
    const secondCheck : { cardTypeList ,lastCards } = checkTwoShunzi(doubleCombination.list , doubleCombination.sameCards , cardTypeList  , doubleCombination.guiPaiList ,Separate.robotChangeCards ,needCards);
    lastCards = secondCheck.lastCards;
    cardTypeList = secondCheck.cardTypeList;
   CC_DEBUG && console.warn("secondCheck..........cardTypeList",secondCheck.cardTypeList);
   CC_DEBUG && console.warn("secondCheck..........lastCards",secondCheck.lastCards);
   CC_DEBUG && console.warn("secondCheck..........needCards",needCards);
    /** step3 对条子的判断，对剩余牌里面判断是否有条子的判断*/
        //对整理出来的牌进行非纯连组合,先将剩余牌lastCards的听用牌取出来
    let Separate_2 : { lastCards ,  robotChangeCards} = robotCardsChangeCardsSeparate(lastCards , changeCardList);
   CC_DEBUG && console.warn("Separate_2..........lastCards",Separate_2.lastCards);
   CC_DEBUG && console.warn("Separate_2..........robotChangeCards",Separate_2.robotChangeCards);
    //再将所有lastCards 的鬼牌取出来
    let guiPaiCombination : { lastCards ,  robotGuiPaiCards} = robotCardsGuiPaiSeparate(Separate_2.lastCards);
   CC_DEBUG && console.warn("guiPaiCombination..........lastCards",guiPaiCombination.lastCards);
   CC_DEBUG && console.warn("guiPaiCombination..........robotGuiPaiCards",guiPaiCombination.robotGuiPaiCards);
    //对剩余的lastCards(不包含鬼牌和变牌)进行条子的确认
    let baoziCheck : { cardTypeList ,lastCards }  = checkBaozi(guiPaiCombination.lastCards  ,Separate_2.robotChangeCards, guiPaiCombination.robotGuiPaiCards ,cardTypeList ,needCards );
   CC_DEBUG && console.warn("baoziCheck..........lastCards",baoziCheck.lastCards);
   CC_DEBUG && console.warn("baoziCheck..........cardTypeList",baoziCheck.cardTypeList);
   CC_DEBUG && console.warn("baoziCheck..........needCards",needCards);
    lastCards = baoziCheck.lastCards;
    cardTypeList = baoziCheck.cardTypeList;
    //判断剩余的牌里面如果有一张是单牌，另外两张是变牌，那么就弄成连子
    //第一步先把鬼牌和变牌取出来
    if(lastCards.length >= 2  ){
        // return { lastCards , cardTypeList }
        const finallyResult : { lastCards , cardTypeList } = finallyCheck( lastCards , cardTypeList ,changeCardList , allCards );
        lastCards = finallyResult.lastCards;
        cardTypeList = finallyResult.cardTypeList;
    }
   CC_DEBUG && console.warn("lastCards...finally", lastCards );
   CC_DEBUG && console.warn("cardTypeList...finally", cardTypeList );
   CC_DEBUG && console.warn("needCards...needCards", needCards );
    return { lastCards , cardTypeList ,needCards}
}

/**
 * 判断剩余的牌里面如果有一张是单牌，另外两张是变牌，那么就弄成连子
 */

export function finallyCheck( lastCards: number[], cardTypeList : any[]  ,changeCardList : number[] , allCards : number[]  ) {
    //第一步先把鬼牌和变牌取出来
    let guiPaiCombination : { lastCards ,  robotGuiPaiCards} = robotCardsGuiPaiSeparate(lastCards);
    //再把鬼牌取出来
    let changeCombination : { lastCards ,  robotChangeCards} = robotCardsChangeCardsSeparate(guiPaiCombination.lastCards ,changeCardList);
    //如果只剩下一张牌，那么就是不要的牌，先查看另外一张牌是否是变牌和鬼牌
    if(lastCards.length == 2 ){
        if(allCards.length == 14){
            if(changeCombination.lastCards.length == 1){
                //查看剩下的牌变牌和鬼牌有几张
                if(guiPaiCombination.robotGuiPaiCards.length == 1 ){
                    let card = guiPaiCombination.robotGuiPaiCards[0];
                    CC_DEBUG && console.warn("11111111111")
                    const addResult : { lastCards , cardTypeList } = addCard( card, cardTypeList ,lastCards );
                    lastCards = addResult.lastCards;
                    cardTypeList = addResult.cardTypeList;
                }else if(changeCombination.robotChangeCards.length == 1 ){
                    CC_DEBUG && console.warn("222222222")
                    let card = changeCombination.robotChangeCards[0];
                    const addResult : { lastCards , cardTypeList } = addCard( card, cardTypeList ,lastCards );
                    lastCards = addResult.lastCards;
                    cardTypeList = addResult.cardTypeList;
                }
            }
        }else{
            const fourCardsType =  cardTypeList.filter(x=>x.cards.length >=4);
            CC_DEBUG && console.warn("总牌只有13张,所以需要取1张出来作为牌组组合fourCardsType", fourCardsType)
            let item = null;
            let card = null; //取出来的card
            if(fourCardsType.length > 1){
                const ll = fourCardsType.filter(x=>x.type == RummyConst.CardsType.SHUN_GOLDENFLOWER);
                if(ll.length > 0){
                    item = ll[0];
                }else{
                    item =  fourCardsType[0];
                }
            }else{
                item =  fourCardsType[0];
            }
            CC_DEBUG && console.warn("item..........",item)
            if(item){
                //如果item 是 纯连那么，如果首牌和尾牌是变牌就去出来
                if(item.type == RummyConst.CardsType.SHUN_GOLDENFLOWER_ONE){
                    const cards = item.cards.sort((a,b)=> a - b);
                    if(changeCardList.includes(cards[0])){
                        card = cards[0];
                    }else if(changeCardList.includes(cards[cards.length - 1])){
                        card = cards[cards.length - 1];
                    }else{
                        card = cards[cards.length - 1];
                    }
                }else {
                    let cards =  item.cards;
                    let guiPaiCombination : { lastCards ,  robotGuiPaiCards} = robotCardsGuiPaiSeparate(cards);
                    //再把鬼牌取出来
                    let changeCombination : { lastCards ,  robotChangeCards} = robotCardsChangeCardsSeparate(guiPaiCombination.lastCards ,changeCardList);
                    card = changeCombination.lastCards[0];
                }
            }
            //如果取到元素就将元素从组合好的牌组中取出来
            CC_DEBUG && console.warn("card..........",card)
            if(card != null){
                lastCards.push(card);
                const cardDel : { cardTypeList } = cardDelToCardTypeList(card, item, cardTypeList );
                cardTypeList = cardDel.cardTypeList;
            }

        }

    }else if(lastCards.length == 3){ //如果剩余牌为三张，那么一张丢弃，剩余2张需要加一张来组合成牌组,就需要从其他已经组合好的4张牌组里面里面取一张
        if(changeCombination.lastCards.length == 1 && allCards.length == 13){
            cardTypeList.push({type: RummyConst.CardsType.SHUN_GOLDENFLOWER ,cards: lastCards});
            lastCards = [];
        }else{
            const fourCardsType =  cardTypeList.filter(x=>x.cards.length >=4);
            CC_DEBUG && console.warn("fourCardsType...3", fourCardsType)
            let item = null;
            let card = null; //取出来的card
            if(fourCardsType.length > 1){
                const ll = fourCardsType.filter(x=>x.type == RummyConst.CardsType.SHUN_GOLDENFLOWER);
                if(ll.length > 0){
                    item = ll[0];
                }else{
                    item =  fourCardsType[0];
                }
            }else{
                item =  fourCardsType[0];
            }
           CC_DEBUG && console.warn("item..........",item)
            if(item){

                if(item){
                    //如果item 是 纯连那么，如果首牌和尾牌是变牌就去出来
                    if(item.type == RummyConst.CardsType.SHUN_GOLDENFLOWER_ONE){
                        const cards = item.cards.sort((a,b)=> a - b);
                        if(changeCardList.includes(cards[0])){
                            card = cards[0];
                        }else if(changeCardList.includes(cards[cards.length - 1])){
                            card = cards[cards.length - 1];
                        }else{
                            card = cards[cards.length - 1];
                        }
                    }else {
                        let cards =  item.cards;
                        let guiPaiCombination : { lastCards ,  robotGuiPaiCards} = robotCardsGuiPaiSeparate(cards);
                        //再把鬼牌取出来
                        let changeCombination : { lastCards ,  robotChangeCards} = robotCardsChangeCardsSeparate(guiPaiCombination.lastCards ,changeCardList);
                        card = changeCombination.lastCards[0];
                    }
                }

                // //取出来一个大于4的组合需要取组合cards 里面的一个参数，看怎么取组合头还是组合尾
                // if(changeCombination.lastCards.length >= 1){
                //     for(let m of changeCombination.lastCards){
                //         //首先看这个card和item是否是同一个颜色，如果是同一个颜色，就取出来
                //         //先判断组合牌的首牌
                //         if( Math.floor(m / 13) ==  Math.floor(item.cards[0] / 13)  && !changeCardList.includes(m) && !RummyConst.CARD_TYPE_GUIPAI.includes(m)){
                //             card = item.cards[0];
                //         }else if(Math.floor(m / 13) == Math.floor(item.cards[item.cards.length - 1] / 13)  && !changeCardList.includes(m) && !RummyConst.CARD_TYPE_GUIPAI.includes(m)){
                //             card = item.cards[item.cards.length - 1];
                //         }
                //     }
                // }
            }
            //如果取到元素就将元素从组合好的牌组中取出来
            if(card != null){
                lastCards.push(card);
                const cardDel : { cardTypeList } = cardDelToCardTypeList(card, item, cardTypeList );
                cardTypeList = cardDel.cardTypeList;
            }

        }


    }else if(lastCards.length >= 4){
        if(changeCombination.lastCards.length == 2){
            let cards = [];
            let finallyCard = null;
            if(changeCombination.lastCards[0] && changeCombination.lastCards[1] && changeCombination.lastCards[0] % 13 > changeCombination.lastCards[1] % 13 ){
                finallyCard = changeCombination.lastCards[1];
            }else{
                finallyCard = changeCombination.lastCards[0];
            }
            if(guiPaiCombination.robotGuiPaiCards.length > 0){
               CC_DEBUG && console.warn("guiPaiCombination.robotGuiPaiCards...",guiPaiCombination.robotGuiPaiCards)
                cards = cards.concat(guiPaiCombination.robotGuiPaiCards);
                for(let m of guiPaiCombination.robotGuiPaiCards){
                    let index = lastCards.findIndex(x=>x == m);
                    lastCards.splice(index,1);
                }
            }
            if(changeCombination.robotChangeCards.length > 0){
               CC_DEBUG && console.warn("changeCombination.robotChangeCards...",changeCombination.robotChangeCards)
                cards = cards.concat(changeCombination.robotChangeCards);
                for(let m of changeCombination.robotChangeCards){
                    let index = lastCards.findIndex(x=>x == m);
                    lastCards.splice(index,1);
                }
            }
           CC_DEBUG && console.warn("changeCombination.robotChangeCards...cards",cards)
           CC_DEBUG && console.warn("changeCombination.robotChangeCards...finallyCard",finallyCard)
            if(finallyCard != null){
                cards.push(finallyCard);
                cardTypeList.push({type: RummyConst.CardsType.SHUN_GOLDENFLOWER ,cards: cards});
                //删除lastCards
                let index = lastCards.findIndex(x=>x == finallyCard);
                lastCards.splice(index,1);
            }

        }
    }
   CC_DEBUG && console.warn("lastCards.........",lastCards)
   CC_DEBUG && console.warn("cardTypeList.........",cardTypeList)
    return  { lastCards , cardTypeList }

}

/**
 * 将元素从组合好的牌组中取出来，然后再将牌组组合
 */

function cardDelToCardTypeList(card : number , cardsType : any , cardTypeList : any[]) {
    let index = cardTypeList.findIndex(x=>x.cards.sort().toString() == cardsType.cards.sort().toString());
    cardTypeList.splice(index,1);
    const index_card = cardsType.cards.findIndex(x=>x==card);
    cardsType.cards.splice(index_card,1);
    cardTypeList.push(cardsType);
    return { cardTypeList };
}


/**
 * 如果有一张牌时变牌或者鬼牌就加入到非纯连里面
 * @param card
 * @param cardTypeList
 */

function addCard(card : number , cardTypeList : any[] ,lastCards : number[]) {
    const index = lastCards.indexOf(card);
    const typeList = cardTypeList.filter(x=>x.type == RummyConst.CardsType.SHUN_GOLDENFLOWER && x.cards.length == 3);
    const typeList_ = cardTypeList.filter(x=>x.type == RummyConst.CardsType.SHUN_GOLDENFLOWER_ONE );
    // for(let item of cardTypeList){
    //     if(typeList.length > 0 && card){
    //        CC_DEBUG && console.warn("list......222",list)
    //        CC_DEBUG && console.warn("item......222",item)
    //         if(item.type == RummyConst.CardsType.SHUN_GOLDENFLOWER){
    //             if(item.cards.length == 3){
    //                 item.cards.push(card);
    //                CC_DEBUG && console.warn("item......222",item)
    //                 list.push(item);
    //                 card = null;
    //             }
    //         }
    //     }else if(typeList_.length >= 2 && card ){
    //         const item = typeList_.find(x=>x.cards.length == 3);
    //         item.type = RummyConst.CardsType.SHUN_GOLDENFLOWER;
    //         item.cards = item.cards.push(card);
    //         list.push(item);
    //         card = null;
    //     }else{
    //         list.push(item);
    //     }
    //
    // }
    if(typeList.length > 0){
        let item = typeList[0];
        let index = cardTypeList.findIndex(x=>x.cards.sort().toString() == item.cards.sort().toString());
        cardTypeList.splice(index,1);
        item.cards.push(card);
        cardTypeList.push(item);

    }else if(typeList_.length > 1){
        const item = typeList_.find(x=>x.cards.length == 3)
        if(item){
            let index = cardTypeList.findIndex(x=>x.cards.sort().toString() == item.cards.sort().toString());
            cardTypeList.splice(index,1);
            item.cards.push(card);
            item.type = RummyConst.CardsType.SHUN_GOLDENFLOWER ;
            cardTypeList.push(item);
        }

    }
   CC_DEBUG && console.warn("list......",cardTypeList)
   CC_DEBUG && console.warn("card2222......",card)
    if(card != null){
        lastCards.splice(index,1)
        CC_DEBUG && console.warn("lastCards.22222.....",lastCards)
    }
    CC_DEBUG && console.warn("cardTypeList1111......",cardTypeList)
    CC_DEBUG && console.warn("lastCards......",lastCards)
    return { cardTypeList : cardTypeList , lastCards  };
}

/**
 * 判断是否有条子的存在，或者条子大于2张，然后有一个变牌存在
 */
export function checkBaozi(lastCards : number[] ,robotChangeCards : number[], guiPaiList : number[] ,cardTypeList : any[] , needCards : number[]){
    let ss =  lastCards;

    //先将相同的踢出去，检查该牌组里面是否有相同的条子3个或者2个
    //将相同的牌踢出一个到数组
    let sameCards = [];
    CC_DEBUG && console.warn("开检查条子：lastCards",ss);
    CC_DEBUG && console.warn("开始检查条子：guiPaiList",guiPaiList);
    CC_DEBUG && console.warn("开始检查条子：robotChangeCards",robotChangeCards);
    const sameList =  roboteCheckAlike(ss);
   CC_DEBUG && console.warn("sameList",sameList);
    let doubleSameList = sameList.filter(x => x.value > 1);
   CC_DEBUG && console.warn("doubleSameList",doubleSameList);
    if(doubleSameList.length > 0){
        for(let item of doubleSameList){
            let key = parseInt(item.key);
            let value = item.value;
            for(let i = 1 ; i< value; i++){
                const index = ss.indexOf(key);
                ss.splice(index, 1);
                sameCards.push(key);
            }
        }
    }
   CC_DEBUG && console.warn("ss...........",ss)
   CC_DEBUG && console.warn("sameCards...........",sameCards);
    let list = [];
    for(let m of ss){
        list.push({num : m %13 , card: m});
    }
   CC_DEBUG && console.warn("list...",list);
    let result = [];
    for(let i = 0 ; i < 10; i++){
        let resultCards = list.filter(m=>m.num == i);
        let cards = [];
        for(let m of resultCards){
            cards.push(m.card);
        }
        if(cards.length >= 1){
            result.push(cards);
        }
    }
   CC_DEBUG && console.warn("result..",result);
    let lastListThree = result.filter(x=>x.length >= 3);
    let lastListTwo = result.filter(x=>x.length == 2);
    let goodList = [];
   CC_DEBUG && console.warn("lastListTwo..",lastListTwo)
   CC_DEBUG && console.warn("lastListThree..",lastListThree)
   CC_DEBUG && console.warn("robotChangeCards..",robotChangeCards)
    if(lastListThree.length > 0){
        for(let m of lastListThree[0]){
            const index = ss.indexOf(m);
            if(index !== -1){
                ss.splice(index, 1);
            }
        }
        goodList = lastListThree[0];

    }else if(lastListTwo.length > 0){
        if(robotChangeCards.length > 0  ){
            goodList = lastListTwo[0];
            for(let m of lastListTwo[0]){
                const index = ss.indexOf(m);
                if(index !== -1){
                    ss.splice(index, 1);
                }

            }
            goodList.push(robotChangeCards[0]);
            const index = robotChangeCards.indexOf(robotChangeCards[0]);
            robotChangeCards.splice(index, 1);
        }else if(robotChangeCards.length == 0 && guiPaiList.length > 0 ){
            goodList = lastListTwo[0];
            goodList.push(guiPaiList[0]);
            CC_DEBUG && console.warn("拥有两个条子的组合",lastListTwo)
            CC_DEBUG && console.warn("拥有两个条子的组合__ss",ss)
            for(let m of lastListTwo[0]){
                const index = ss.indexOf(m);
                CC_DEBUG && console.warn("拥有两个条子的组合__index",index)
                if(index !== -1){
                    ss.splice(index, 1);
                }

            }
            CC_DEBUG && console.warn("拥有两个条子的组合__ss__",ss)
            const index = guiPaiList.indexOf(guiPaiList[0]);
            guiPaiList.splice(index, 1);
        }else {
            let key = [];
            let key_num = 0;
            for(let m of lastListTwo[0]){
                key.push(Math.floor(m/13));
                key_num = m % 13;
            }
            //
            for(let i = 0 ;i< 4 ;i++){
                if(!key.includes(i)){
                    addCardToNeedCards( key_num, i, needCards);
                }

            }
        }
    }
   CC_DEBUG && console.warn("组合成条子的数组..",goodList);
   CC_DEBUG && console.warn("ss..剩余牌",ss);
    ss = ss.concat(sameCards,guiPaiList,robotChangeCards);

    if(goodList.length > 0){
        cardTypeList.push({type: RummyConst.CardsType.BAOZI, cards: goodList});
    }

   CC_DEBUG && console.warn("检查条子结束剩余牌：",ss);
   CC_DEBUG && console.warn("检查条子结束组成的牌组..",cardTypeList);
   CC_DEBUG && console.warn("检查条子结束需要的牌..",needCards);
    return { cardTypeList , lastCards : ss  }
}


/**
 *  判断相同的牌是否大于三张，有听用牌和是有超过三张是一种花色
 */
function robotSameCards(cards : number[] ,changeCardList : number[] ){
    let haveChangeCard = false; //是否有听用牌
    let haveThreeCards = false;
    let isSameHuase = false;
    if(cards.length >=3 ){
        haveThreeCards = true;
    }
    for(let m of cards){
        if(changeCardList.includes(m)){
            haveChangeCard = true;
        }
    }

    let card0 = [];
    let card1 = [];
    let card2 = [];
    let card3 = [];
    for(let m of cards){
        let type = Math.floor(m / 13);
        if(type == 0){
            card0.push(m);
        }else if(type == 1){
            card1.push(m);
        }else if(type == 2){
            card2.push(m);
        }else if(type == 3){
            card3.push(m);
        }
    }
    let list = [{type: 0 , cards: card0 },{ type: 1 , cards:card1 },{type: 2 , cards:card2 },{type: 3 , cards:card3}];
    for(let m of list){
        if(m.cards.length >= 3 ){
            isSameHuase = true;
        }
    }

    return { haveChangeCard , haveThreeCards , isSameHuase }
}

/**
 *  将机器人牌堆所有听用牌取出来
 */
function robotCardsChangeCardsSeparate(cards : number[] , changeCardList : number[]){
    let lastCards = [];
    let robotChangeCards = [];
    for(let m of cards){
        if(changeCardList.includes(m)){
            robotChangeCards.push(m);
        }else {
            lastCards.push(m);
        }
    }
    return { lastCards ,  robotChangeCards}
}

/**
 *  将机器人牌堆所有鬼牌取出来
 */
function robotCardsGuiPaiSeparate(cards : number[] ){
    let lastCards = [];
    let robotGuiPaiCards = [];
    for(let m of cards){
        if(RummyConst.CARD_TYPE_GUIPAI.includes(m)){
            robotGuiPaiCards.push(m);
        }else {
            lastCards.push(m);
        }
    }
    return { lastCards ,  robotGuiPaiCards };
}

/**
 * 对机器人的牌进行组合
 */
function robotCardsCombination(cards: number[] ){
    // 对cards 进行
    // if(!cardsList){
    //说明是第一次进行牌组组合，首先进行纯连的优先组合,将所有的花色进行分类组合
    //step1  先提出cards 里面是否有鬼牌,有鬼牌就踢出。
    let sameCards = [];  //将是已经存在相同的牌放入该数组当中  [{type:0 , cards:[]}]
    const result : { cardList, guiPaiNum , guiPaiList } = RummyLogic.checkHaveGuiPai(cards);
    //剔除鬼牌过后的数组
    let notGuiPaiList = result.cardList;
    //将相同的牌踢出一个到数组
    const sameList =  roboteCheckAlike(notGuiPaiList);
    let doubleSameList = sameList.filter(x => x.value > 1);
    if(doubleSameList.length > 0){
       CC_DEBUG && console.warn("doubleSameList",doubleSameList);
        for(let item of doubleSameList){
            let key = parseInt(item.key);
            let value = item.value;
            for(let i = 1 ; i< value; i++){
                const index = notGuiPaiList.indexOf(key);
                notGuiPaiList.splice(index, 1);
                sameCards.push(key);
            }
        }
    }

   CC_DEBUG && console.warn("notGuiPaiList",notGuiPaiList)
    //step2 对没有鬼牌数组进行颜色分类看是否有纯连
    let card0 = [];
    let card1 = [];
    let card2 = [];
    let card3 = [];
    for(let m of notGuiPaiList){
        let type = Math.floor(m / 13);
        if(type == 0){
            card0.push(m % 13);
        }else if(type == 1){
            card1.push(m % 13);
        }else if(type == 2){
            card2.push(m % 13);
        }else if(type == 3){
            card3.push(m % 13);
        }
    }
    let list = [{type: 0 , cards: card0 },{ type: 1 , cards:card1 },{type: 2 , cards:card2 },{type: 3 , cards:card3}];
    return { list , sameCards  , guiPaiList : result.guiPaiList }
    // }
}




//判断是否有纯连
function checkOneShunzi(list : any[] , sameCards : number[] ,cardTypeList : any[] , guiPaiList : number[] , changeCardList : number[] , needCards:number[]){
    let lastCards = [];
    //颜色分组完成查看是否有纯连
    for(let item of list){
        let type =  item.type;
        let cards = item.cards;
        if(cards.length >= 3){
            const { goodList , loseList } = checkShunzi(cards, changeCardList, type, needCards );
            if(goodList && goodList.length >= 3){
                //对牌进行数值恢复
                let backCards = cardToBack(type , goodList);
                cardTypeList.push({type: RummyConst.CardsType.SHUN_GOLDENFLOWER_ONE,  cards : backCards})
            }
            if(loseList && loseList.length > 0){
                //对牌进行数值恢复
                let backCards = cardToBack(type , loseList);
                // cardTypeList.push({type: RummyConst.CardsType.SINGLE, cards : cards})
                lastCards = lastCards.concat(backCards);
            }
        }else{
            let backCards = cardToBack(type , cards);
            lastCards = lastCards.concat(backCards);
        }
    }
    //将重复的牌放到没有牌组的组队里面
    lastCards = lastCards.concat(sameCards);
    //将鬼牌牌放到没有牌组的组队里面
    lastCards = lastCards.concat(guiPaiList);
    //step2  完成了对纯连判断组合,现在开始对非纯连进行判断组合
    return { cardTypeList ,lastCards }
}


//判断是否有连子
function checkTwoShunzi(list : any[] , sameCards : number[] , cardTypeList : any[] , guiPaiList : number[] , robotChangeCards : number[] , needCards:number[]){
    let lastCards = [];
    // let startRobotChangeCards = [] ;
    // startRobotChangeCards = startRobotChangeCards.concat(robotChangeCards);
    //颜色分组完成查看是否有连子
    for(let item of list){
        let type =  item.type;
        let cards = item.cards;
        if(cards.length >= 2 ){
            let { goodList , loseList } = checkHaveChangeShunzi(cards ,type, needCards);
           CC_DEBUG && console.warn("goodList...",goodList)
           CC_DEBUG && console.warn("loseList...",loseList)
           CC_DEBUG && console.warn("robotChangeCards...",robotChangeCards)
           CC_DEBUG && console.warn("guiPaiList...",guiPaiList)
            if(goodList && goodList.length >= 2){
                //判断是否有听用牌变牌和鬼牌
                if(robotChangeCards.length > 0 || guiPaiList.length > 0){
                   CC_DEBUG && console.warn("判断是否有听用牌变牌和鬼牌...",goodList)
                    if(robotChangeCards.length > 0 ){
                        let cards = cardToBack(type , goodList);
                        const card = robotChangeCards[0];
                       CC_DEBUG && console.warn("card...",card)
                        const index = robotChangeCards.indexOf(card)
                        if(index !== -1){
                            robotChangeCards.splice(index,1);
                        }
                        cards.push(card);
                        //对牌进行数值恢复
                        cardTypeList.push({type: RummyConst.CardsType.SHUN_GOLDENFLOWER,  cards : cards})
                    } else if(robotChangeCards.length == 0 && guiPaiList.length > 0){
                        //如果变牌不存在查看鬼牌是否存在
                        const card = guiPaiList[0];
                        const index = guiPaiList.indexOf(card);
                        guiPaiList.splice(index,1);
                        let cards = cardToBack(type , goodList);
                        cards.push(card);
                        cardTypeList.push({type: RummyConst.CardsType.SHUN_GOLDENFLOWER,  cards : cards})
                    }

                }else{
                    let goodListCards = cardToBack(type , goodList);
                    // let loseListCards = cardToBack(type , loseList);
                    lastCards = lastCards.concat(goodListCards);
                }

            }

            if(loseList && loseList.length > 0){
                //对牌进行数值恢复
                let cards = cardToBack(type , loseList);
                // cardTypeList.push({type: RummyConst.CardsType.SINGLE, cards : cards})
                lastCards = lastCards.concat(cards);
            }
        } else {
            let backCards = cardToBack(type, cards);
            lastCards = lastCards.concat(backCards);
        }
    }
   CC_DEBUG && console.warn("lastCards...",lastCards)
    //将重复的牌放到没有牌组的组队里面
    lastCards = lastCards.concat(sameCards);
    //将鬼牌牌放到没有牌组的组队里面
    lastCards = lastCards.concat(guiPaiList);
    //将剩余的变牌放入到lastCards里面
    lastCards = lastCards.concat(robotChangeCards);
    //step2  完成了对纯连判断组合,现在开始对非纯连进行判断组合
    return { cardTypeList ,lastCards }
}


export function checkHaveChangeShunzi(cards : number[] ,type , needCards : number[]){
    const ss =  cards;
    ss.sort((a,b)=>(a-b));
    let list = [];
   CC_DEBUG && console.warn("开始检测是否有顺子的可能：", ss)
    // if(){
    //
    // }
    for(let i=0 ; i< ss.length -1 ; i++ ){
       CC_DEBUG && console.warn("判断是否有两个相差数成连子............",ss[i])
        let goodList_ = [];
        if((ss[0] == 0 && ss[ss.length - 1] == 12) ){
            goodList_.push(ss[0]);
            goodList_.push(ss[ss.length - 1]);
            list.push({num: goodList_.length , goodList: goodList_});
            //将需要的牌加入到需要数组里面
            addCardToNeedCards(ss[ss.length - 1] - 1,type, needCards);
        }else if((ss[0] == 0 && ss[ss.length - 1] == 11)){
            goodList_.push(ss[0]);
            goodList_.push(ss[ss.length - 1]);
            list.push({num: goodList_.length , goodList: goodList_});
            //将需要的牌加入到需要数组里面
            addCardToNeedCards(ss[ss.length - 1] + 1 ,type, needCards);
        }
        for(let j = 1 ; j< ss.length ; j++){
            let goodList = [];
            if( ss[i + j] && ss[i] == ss[i + j] -1 ){  //两个元素已经相连
                //三个元素差一个可以相连
                if(ss[i + j + 1] && (ss[i + j] ==  ss[i + j + 1] -2)){
                    goodList.push(ss[i]);
                    goodList.push(ss[i+j]);
                    goodList.push(ss[i + j + 1]);
                    list.push({num:goodList.length , goodList});
                    //将需要的牌加入到需要数组里面
                    addCardToNeedCards(ss[i + j + 1] -1 ,type, needCards);
                }else{
                    goodList.push(ss[i]);
                    goodList.push(ss[i+j]);
                    list.push({num:goodList.length , goodList});
                    //将需要的牌加入到需要数组里面
                    addCardToNeedCards(ss[i+j] + 1 ,type, needCards);
                }

                // list.push(goodList);
            }else if(ss[i + j] && ss[i] == ss[i + j] - 2 ){
                if(ss[i + j + 1] && ss[i + j] == ss[i + j + 1] - 1){
                    goodList.push(ss[i]);
                    goodList.push(ss[i+j]);
                    goodList.push(ss[i + j + 1]);
                    list.push({num:goodList.length , goodList});
                }else{
                    goodList.push(ss[i]);
                    goodList.push(ss[i+j]);
                    list.push({num: goodList.length , goodList});
                    //将需要的牌加入到需要数组里面
                    addCardToNeedCards(ss[i+j] + 1 ,type, needCards);
                }

            }
        }
    }
    //选择张数比较多的数组，然后再选择分值较低的，然后剩下得就丢到弃牌堆里
    let list_1 = [];
    let maxLength = 0;
    CC_DEBUG && console.warn("差一张组成连子333...list", list)
    //二位数组进行去重
    list = getUnique(list);
    if(list.length > 0){
        for(let item of list){
            let numLength = item.num;
            if(maxLength <  numLength){
                maxLength = numLength;
            }
            let points = 0 ;
            for(let m of item.goodList){
                points += cardPoint(m);
            }
            list_1.push({cardLength :numLength , points , cards: item.goodList  })
        }
       CC_DEBUG && console.warn("list_1...",list_1)
        const ls =  list_1.filter(x=>x.cardLength == maxLength);
        const lss = ls.sort((a,b)=>b.points - a.point)
        const finallyList = lss[0];
       CC_DEBUG && console.warn("finallyList...",finallyList)
        //过滤出没有组成组合的牌组
        const loseList = getArrDifference(ss,finallyList.cards);
       CC_DEBUG && console.warn("loseCards...",loseList)
       CC_DEBUG && console.warn("finallyList.cards...",finallyList.cards)
       CC_DEBUG && console.warn("needCards...",needCards)
        let finallyCard = unique(finallyList.cards);
        return { goodList : finallyCard , loseList : loseList }
    }else {
        return { goodList : [] , loseList : ss }
    }
}

/**
 * 添加一个张牌到needCards, 这里的card是经过 % 13 的
 */

function addCardToNeedCards(card : number , type:number , needCards : number[]) {
    if(card != -1 && card != 14 ){
        if([0,1,2,3].includes(type)){
            let card_ = type * 13 + card;
            needCards.push(card_);
        }
    }
}


/** 计算分值 */
function cardPoint(card : number) {
    const tenPoint = [0,10,11,12];
    if(tenPoint.includes(card)){
        return 10;
    }else{
        return card + 1;
    }
}
/** 对牌进行数值恢复 */
function cardToBack(type : number , cardList : number[]){
    let backCardList = [];
    if([0,1,2,3].includes(type)){
        for(let m of cardList){
            backCardList.push( (type * 13) + m );
        }
    }
    return backCardList;
}

/**检查传进来的数组是否有>3的顺子的组合，同时返回组合好的数组和不能组合的组数  */
export function checkShunzi( ss : number[] ,changeCardList: number[] , type : number, needCards ){
    ss = ss.sort((a,b)=>(a-b));
    CC_DEBUG && console.warn("ss..11111",ss)
    //去除相同的数字
    const result =  roboteCheckAlike(ss);
    let list = result.filter(x => x.value > 1);
    for(let item of list){
        let key = parseInt(item.key);
        let value = item.value;
        for(let i = 1 ; i< value; i++){
            const index = ss.indexOf(key);
            ss.splice(index, 1);
        }
    }
    let goodList = [];
    if(ss.length == 2){
       CC_DEBUG && console.warn("ss..",ss)
        if(ss[0] == 0 && ss[1] == 12 ){
            addCardToNeedCards( 11, type ,needCards)
        }else if(ss[0] == 0 && ss[1] == 11){
            addCardToNeedCards(12, type ,needCards)
        }else if(ss[0] + 1 == ss[1]){
            addCardToNeedCards(ss[1] + 1, type ,needCards)
        }
    }
    for(let i = 0 ; i<ss.length - 1 ; i++ ){
        let item = [];
        //判断Q K A
        if(ss[0] == 0 && ss[ss.length - 1] == 12 ){
            if(ss[ss.length - 2] == 11){
                item.push(ss[0]);
                item.push(ss[ss.length - 1]);
                item.push(ss[ss.length - 2]);
                //如果goodList 已经存在了，那么就不需要再存相同的
                goodList.push(item);
            }else{
                addCardToNeedCards(11, type ,needCards);
                CC_DEBUG && console.warn("needCards...x1",needCards)
            }

        }
        //判断1 - k
        for(let j = 1 ; j< ss.length - 1  ; j++){
            let item = [];
            if(ss[i + j] && ss[i] == ss[i + j] -1 ){  //两个数组已经相连
                if(ss[i + j + 1] && ss[i + j] -1 == ss[i + j + 1] - 2 ){  //三个数组已经相连
                    item.push(ss[i]);
                    item.push(ss[i+j]);
                    item.push(ss[i+ j +1]);
                    goodList.push(item);
                }else {
                    item.push(ss[i]);
                    item.push(ss[i+j]);
                    goodList.push(item);
                    if(item.length < 2){
                        addCardToNeedCards(ss[i + j] + 1,type,needCards);
                        CC_DEBUG && console.warn("needCards...x2",needCards)
                    }

                }
            }else if( ss[i+j]  && ss[i] == ss[i+j] - 2 ){
                if(!ss.includes(ss[i + j] -1)){
                    addCardToNeedCards(ss[i + j] -1,type,needCards);
                }
                CC_DEBUG && console.warn("needCards...x3",needCards)
            }
        }
    }
    //二位数组进行去重
    goodList = getUnique(goodList);
    CC_DEBUG && console.warn("能组成纯连元素的二维数组",goodList)
    //去掉只有两个元素的数组
    goodList = delOnlyTwo(goodList);
    CC_DEBUG && console.warn("去掉只有两个元素的数组过后",goodList)
    let ll = [];
    let aa = [];
    if(goodList.length > 1){
        //对能组成纯连的数组进行重组 组成纯连 [ [ 4, 5, 6 ], [ 5, 6, 7 ], [ 6, 7, 8 ], [ 7, 8, 9 ], [ 8, 9, 10 ] ]
        for(let i = 0 ; i< goodList.length -1 ; i++){
                if(goodList[i][0] == 0 && goodList[i].length >= 3 ){
                    let cards = goodList[i];
                    if((cards[1] == 12 && cards[2] == 11) || ((cards[1] == 1 && cards[2] == 2)) ){
                        ll = ll.concat(goodList[i]);
                        break;
                    }
                }else {
                    if(goodList[i][2] == goodList[i+1][1]){
                        ll = ll.concat(goodList[i],goodList[i+1]);
                    }else {
                        if(goodList[i].length >= 3){
                            ll = ll.concat(goodList[i]);
                        }
                    }
                }

        }
    }else if(goodList.length > 0){
        ll = goodList[0]
    }

    //在进行一次纯连的检验
    if(ll.length > 0){
        //去重
        ll = unique(ll);
        //判断纯连ll
        CC_DEBUG && console.warn("ll...重新检查是否是纯连",ll)
        //检查是否是纯连
        ll.sort((a,b)=>a- b);
        if(ll[0] != 0 || ll[ll.length - 1] != 12){
            let ls = [];
            for(let i = 0 ; i< ll.length - 1;i++){
                if(ll[i] == ll[i+1] - 1){
                    ls.push(ll[i]);
                    ls.push(ll[i + 1]);
                }else {
                    break;
                }
            }

            ls = unique(ls);
            if(ls.length >= 3){
                ll = ls;
            }
            CC_DEBUG && console.warn("ls...重新检查是否是纯连",ls)
        }
        CC_DEBUG && console.warn("重新检查是否是纯连--ll被替换",ll)
        if(ll.length == 4){
            if(changeCardList.includes(ll[0]) ){
                ll.splice(0,1);
            }else if(changeCardList.includes(ll[ll.length-1])){
                ll.splice(ll.length-1,1);
            }
        }else if(ll.length == 5 ){
            //判断第一位和第二位是否有变牌
            if(changeCardList.includes(ll[0])){
                ll.splice(0,1);
            }

            if(changeCardList.includes(ll[ll.length - 1 ])){
                ll.splice(ll.length - 1,1);
            }

            if(ll.length == 5){
                if(changeCardList.includes(ll[1])){
                    ll.splice(0,2);
                }else if(changeCardList.includes(ll[ll.length - 2 ])){
                    ll.splice(ll.length - 2 ,2);
                }
            }
        }else if(ll.length == 6){
            if(changeCardList.includes(ll[0]) || changeCardList.includes(ll[1]) || changeCardList.includes(ll[2])){
                ll.splice(0,3);
            }else if(changeCardList.includes(ll[ll.length - 1]) || changeCardList.includes(ll[ll.length - 2]) || changeCardList.includes(ll[ll.length - 3])){
                ll.splice(ll.length - 3,3);
            }
        }else if(ll.length > 6){
            if(changeCardList.includes(ll[0]) || changeCardList.includes(ll[1]) || changeCardList.includes(ll[2])|| changeCardList.includes(ll[2])){
                ll.splice(0,4);
            }else if(changeCardList.includes(ll[ll.length - 1]) || changeCardList.includes(ll[ll.length - 2]) || changeCardList.includes(ll[ll.length - 3])|| changeCardList.includes(ll[ll.length - 4])){
                ll.splice(ll.length - 4,4);
            }
        }
        CC_DEBUG && console.warn("ll...",ll)
        // CC_DEBUG && console.warn("needCards...",needCards)
        //去重完将不符合的提出到loseList = [];
        if(ll.length >= 3){
            aa = getArrDifference(ss,ll);
            // needCards = [];
            CC_DEBUG && console.warn("needCards...1之前",needCards)
            return { goodList : ll , loseList : aa  }
        }else{
            CC_DEBUG && console.warn("needCards...2之前",needCards)
            CC_DEBUG && console.warn("needCards...2222222222",needCards)
            return { goodList : [] , loseList : ss }
        }


    }else {
        CC_DEBUG && console.warn("needCards...3333333333333",needCards)
        return { goodList : [] , loseList : ss }
    }

}



/**
 * 去掉只有两位数的二维数组
 */
function delOnlyTwo(goodList){
   let list = [];
   for(let m of goodList){
       if(m.length >= 3){
           list.push(m);
       }
   }
   return list;
}


/**
 * 二位数组去重，arr:[[ 0, 12, 11 ],
                    [ 0, 12, 11 ],
                    [ 0, 12, 11 ],
                    [ 8, 9, 10 ],
                    [ 0, 12, 11 ]]
 let arr = [[{a:1},{a:1,b:2}],[{a:1}],[{a:1},{a:1,b:2}]]
。
 */
function getUnique(array){
    let obj = {};
    return array.filter((item, index) => {
        // 防⽌key重复
        let newItem = item + JSON.stringify(item)
        return obj.hasOwnProperty(newItem) ? false : obj[newItem] = true
    })
}

/**
 * 数组去重
 * @param a
 */
function unique(a) {
    let res = [];
    for (let i = 0, len = a.length; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
            // 这一步十分巧妙
            // 如果发现相同元素
            // 则 i 自增进入下一个循环比较
            if (a[i] === a[j])
                j = ++i; //j = i = i + 1;
        }
        res.push(a[i]);
    }
    return res;
}

/**检查相同的 */
function roboteCheckAlike (cards: number[]) {
    let prv = statisticalFieldNumber(cards);
    let list = [];
    for (let key in prv) {
        list.push({ key: key, value: prv[key] })
    }
    return  list;
};


/**
 * 查看数组中相同得元素有几个
 * arr：[1,1,1,1,3]
 * prev:{}
 * @param arr
 */

function statisticalFieldNumber(arr) {
    return arr.reduce(function (prev, next) {
        prev[next] = (prev[next] + 1) || 1;
        return prev;
    }, {});
}







