import FishPrawnCrabConst = require('./FishPrawnCrabConst');


/**
 * 获取鱼虾蟹得结果
 * @param count
 */
export function getDiceResult(): string[] {
    let diceResult = [];
    const diceArea = FishPrawnCrabConst.DICE_AREA;
    let num = 3 ;  //随机三次骰子得结果
    for(let i = 1; i<= num;i++){
        let index = Math.floor((Math.random()*diceArea.length));
        diceResult.push(diceArea[index]);
    }

    return diceResult;
    // return ['HL','HL','FISH'];
};



/**
 * 根据鱼虾蟹得结果来组合成中将区域哪些区域中将
 * @param
   三个骰宝一样，开奖区域为 2
   两个骰宝一样，开奖区域为3
   三个骰宝都不一样 开奖区域为6

 */
export function getWinBetArea(diceResult: string []): string[] {
    let winArea = [];
    const diceArea = FishPrawnCrabConst.DICE_AREA;
    const doubleArea = FishPrawnCrabConst.DOUBLE_AREA;  // 组合元素
    if(diceResult.length == 0 || diceResult.length > 3 ){
        return winArea;
    }
    for(let i = 0 ; i<= 2 ; i++){
        if(!winArea.includes(diceResult[i]) && diceArea.includes(diceResult[i])){  //单个元素
            winArea.push(diceResult[i]);
            if(i<= 1){
                for(let j = 1 ;j<= 2; j++){
                    const doubleDice = diceResult[i]+'_'+diceResult[i+j]; //组合元素 如果没有该组合就换一种组合方式
                    if(!doubleArea.includes(doubleDice)){
                        const doubleDice1 = diceResult[i+j]+'_'+diceResult[i];
                        if(doubleArea.includes(doubleDice1) && !winArea.includes(doubleDice1)){
                            winArea.push(doubleDice1);
                        }
                    }else if(!winArea.includes(doubleDice)){
                        winArea.push(doubleDice);
                    }
                 }

            }
        }
    }
    if(winArea.length == 1){
        winArea.push(FishPrawnCrabConst.AREA.ONE)
    }
    return winArea;
};


/**
 *  计算开奖结果得赔率
 */
export function getPlayerWinGold(winArea: string [] ,result : string []): { name:string , odds : number }[] {
        const resultOdds = [];   //查看骰宝有几个，并算出赔率
        const diceArea = FishPrawnCrabConst.DICE_AREA;
        const doubleArea = FishPrawnCrabConst.DOUBLE_AREA;  // 组合元素
        //开奖结果为三个相同骰宝
           if(winArea.length == 2){
               for(let item of winArea){
                   if(item == FishPrawnCrabConst.AREA.ONE){
                       resultOdds.push({name: item , odds:FishPrawnCrabConst.DICE_ODDS.one});
                   }else{
                       resultOdds.push({name: item , odds:FishPrawnCrabConst.DICE_ODDS.three});
                   }
               }
           }
        //两个骰宝一样，开奖区域为3
           if(winArea.length == 3){
               const prev = statisticalFieldNumber(result);
               for(let item of winArea){
                   if(item == FishPrawnCrabConst.AREA.ONE){
                       resultOdds.push({name: item , odds:FishPrawnCrabConst.DICE_ODDS.one});
                   }else if(diceArea.includes(item) && prev[item] == 2 ){
                       resultOdds.push({name: item , odds:FishPrawnCrabConst.DICE_ODDS.double});
                   }else if(diceArea.includes(item) && prev[item] == 1 ){
                       resultOdds.push({name: item , odds:FishPrawnCrabConst.DICE_ODDS.single});
                   }else if(doubleArea.includes(item)) {
                       resultOdds.push({name: item , odds:FishPrawnCrabConst.DICE_ODDS.doubleTwo});
                   }
               }
           }
        //三个骰宝都不一样 开奖区域为6
            if(winArea.length == 6){
                for(let item of winArea){
                    if(diceArea.includes(item)){
                        resultOdds.push({name: item , odds:FishPrawnCrabConst.DICE_ODDS.single});
                    }else if(doubleArea.includes(item)) {
                        resultOdds.push({name: item , odds:FishPrawnCrabConst.DICE_ODDS.doubleSingle});
                    }
                }
            }

        return   resultOdds;
}

/**
 * 查看数组中相同得元素有几个
 * arr：[1,1,1,1,3]
 * prev:{}
 * @param arr
 */

function  statisticalFieldNumber(arr) {
    return arr.reduce(function (prev, next) {
        prev[next] = (prev[next] + 1) || 1;
        return prev;
    }, {});
}



/**
 * 构造结果记录
 * @param bankerCards
 * @param playerCards
 * @param result
 */
export function buildRecordResult(result: string[] ) {
    let one = result[0];
    let two = result[1];
    let three = result[2];
    return one +'_' + two +'_' + three;
}

/**
 * 生成开奖结果
 */
export function genLotteryResult(): LotteryResult {
    // 开奖结果
    const result = getDiceResult();
    // 中奖区域
    const winArea = getWinBetArea(result);
    // 中奖区域
    const winAreaOdds = getPlayerWinGold(winArea,result);
    
    return {result, winArea, winAreaOdds};
}