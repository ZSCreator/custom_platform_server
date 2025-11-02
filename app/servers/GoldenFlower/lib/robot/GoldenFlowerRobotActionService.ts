"use strict";

// 三张牌操作
import GoldenFlower_logic = require('../GoldenFlower_logic');
import commonUtil = require("../../../../utils/lottery/commonUtil");
import JsonMgr = require('../../../../../config/data/JsonMgr');

/**
 * @param roundTimes 轮数
 * @param PlayerKp_num 看牌玩家数
 * @param rank 名次
 * @param Player_size 牌局玩家数
 * @param Holds_type 手牌 ai 牌型分类
 * @param cards_type 牌型
 * @param flag 真则封顶
 * @param nid 游戏id
 * @param sceneId 场id
 */
export function kanpai_NewPlayerType(roundTimes: number, PlayerKp_num: number, rank: number, Player_size: number, Holds_type: number, cards_type: number, flag: boolean, nid: string, sceneId: number) {
    //新策略打法
    //看牌  10%*([轮数]-1)+10%*[已看]
    //弃牌 [牌级]/12*[排名]/[玩家]
    try {
        let robotStatus = JsonMgr.get('robot/zjhConfig').datas;
        const ran = Math.random() * 100;
        let Local_rank = rank - 1;
        //0+([排名]-1）*[牌重]*[轮数]*2
        let x1 = robotStatus['CardType']["Fold_1"][cards_type]["x1"][Local_rank];
        let x2 = robotStatus['CardType']["Fold_1"][cards_type]["x2"][Local_rank];
        //0*[轮数] 封顶弃牌规则
        let x3 = robotStatus['CardType']["Fold_2"][cards_type][Local_rank];
        let probability = x1 + (rank - 1) * Holds_type * roundTimes * x2;
        if (flag)
            probability = roundTimes * x3;
        if (ran < probability) {
            if (rank == 1) {
                console.log(rank);
            }
            return "Fold";
        }
        //看牌后 比牌 x1+[轮数]*[x2]
        x1 = robotStatus['CardType']["BiPai_1"][cards_type]["x1"][Local_rank];
        x2 = robotStatus['CardType']["BiPai_1"][cards_type]["x2"][Local_rank];
        //封顶比牌 x1*[轮数]
        x3 = robotStatus['CardType']["BiPai_2"][cards_type][Local_rank];
        probability = x1 + roundTimes * x2;
        if (flag)
            probability = roundTimes * x3;
        if (ran < probability) {
            return "bipai";
        }
        //看牌后跟注 =x1
        probability = robotStatus['CardType']["Cingl_1"][cards_type][Local_rank];
        if (ran < probability) {
            return "Cingl";
        } else {
            return "filling";
        }
    } catch (error) {
        console.error(error);
    }
}
/**
 * @param roundTimes 轮数
 * @param PlayerKp_num 看牌玩家数
 * @param rank 名次
 * @param Player_size 牌局玩家数
 * @param Holds_type 手牌 ai 牌型分类
 * @param cards_type 牌型
 * @param flag 真则封顶
 */
export function Nokanpai_NewPlayerType(roundTimes: number, PlayerKp_num: number, rank: number, Player_size: number, Holds_type: number, cards_type, flag: boolean) {
    try {
        let robotStatus = JsonMgr.get('robot/zjhConfig').datas;
        const ran = Math.random() * 100;
        let Local_rank = rank - 1;
        //"未封顶看牌 =x1*[轮数]+x2*[已看]",
        let x1 = robotStatus.CardType["kanpai_0"][cards_type]["x1"][Local_rank];
        let x2 = robotStatus.CardType["kanpai_0"][cards_type]["x2"][Local_rank];
        let probability = x1 * (roundTimes - 1) + x2 * PlayerKp_num;
        if (flag) {
            //封顶后看牌=（[已看]/[玩家]）+20
            probability = (PlayerKp_num / Player_size) * 100 + 20;
        }
        if (ran < probability) {
            return "kanpai";
        }
        //未看牌 弃牌 =x1*[轮数]
        x1 = robotStatus['CardType']["Fold_0"][cards_type][Local_rank];
        probability = x1 * roundTimes;
        //封顶后弃牌 x1*[轮数]
        if (flag) {
            x1 = robotStatus['CardType']["Fold_2"][cards_type][Local_rank];
            probability = x1 * roundTimes;
        }
        if (ran < probability) {
            if (rank == 1) {
                console.log(rank);
            }
            return "Fold";
        }
        //未看牌比牌 x1
        probability = robotStatus['CardType']["BiPai_0"][cards_type][Local_rank];
        if (ran < probability) {
            return "bipai";
        }
        //未看牌跟注 =x1
        probability = robotStatus['CardType']["Cingl_0"][cards_type][Local_rank];
        if (ran < probability) {
            return "Cingl";
        } else {
            return "filling";
        }
    } catch (error) {
        console.error(error);
    }

}

/**传入概率值，列入30，生产小于30的随机数 ，则满足条件返回真 */
export function Is_probability(probability) {
    let rand = commonUtil.randomFromRange(0, 100);
    if (rand < probability) {
        return true;
    }
    return false;
}

/**概率计算下注金额 */
function sortProbability(_arr) {
    let allweight = 0;
    let section = 0; //区间临时变量
    let arr = _arr.map(m => {
        const obj = {};
        for (let key in m) {
            obj[key] = m[key];
        }
        return obj;
    });
    //console.log("obj=", arr);
    //排序
    arr.sort((a, b) => {
        return a.probability - b.probability;
    });
    //计算总权重
    for (let i = 0; i < arr.length; i++) {
        allweight += Number(arr[i].probability);
    }

    //获取概率区间
    for (let i = 0; i < arr.length; i++) {
        if (i === 0) {
            let right = (arr[i].probability / allweight);
            arr[i]['section'] = [0, right];
            section = right;
        } else {
            let right = (arr[i].probability / allweight) + section;
            arr[i]['section'] = [section, right];
            section = right;
        }
    }
    const random = Math.random();
    for (let i = 0; i < arr.length; i++) {
        if (random >= arr[i].section[0] && random < arr[i].section[1]) {
            return arr[i].name;
        }
    }
}
