'use strict';

// 机器人押注
import robotConst = require("../../consts/robotConst");
import commonUtil = require('../lottery/commonUtil');
import robotGoldUtil = require('./robotGoldUtil');
import commonRobotAction = require("../../services/robotService/common/robotAction");


// const commonRobotAction = new CommonRobotAction();
/**
 * 获取骰宝下注的类型和金币
 * @param playerGold 
 * @param sceneId 
 */
export function getUp7BetTypeAndGold(playerGold: number, sceneId: number, ChipList: number[]) {
    let res: { betArr: number[] } = { betArr: [] };
    // const yaSection: Array<number> = commonRobotAction.beizhiRobot(sceneId).yaSection;
    const ran = commonUtil.randomFromRange(1, 100);
    let betGold = robotGoldUtil.randomBetGold(ChipList, playerGold, ran);
    // 玩家金币小于押注金币，不押注
    if (!betGold) {
        return res;
    }
    // 拆分押注金额
    res.betArr = divideBetGold(ChipList, betGold);
    // 打乱下注顺序
    commonUtil.shuffle(res.betArr);
    // 凌晨三点到7点减少下注
    let temp1: any = commonUtil.getDateSpecifHMSAfterDays(0, 3)
    let temp2: any = commonUtil.getDateSpecifHMSAfterDays(0, 7)
    if (Date.now() > Date.parse(temp1) &&
        Date.now() < Date.parse(temp2) &&
        res.betArr.length > 3) {
        res.betArr = res.betArr.slice(0, 2);
    }
    return res;
};
/**
 * 获取骰宝下注的类型和金币
 * @param playerGold 
 * @param sceneId 
 */
export function getSicboBetTypeAndGold(playerGold: number, sceneId: number, ChipList: number[]) {
    let res: { betType: string, betArr: number[] } = { betType: '', betArr: [] };
    // const yaSection: Array<number> = commonRobotAction.beizhiRobot(sceneId).yaSection;
    const ran = commonUtil.randomFromRange(1, 100);
    let betGold = robotGoldUtil.randomBetGold(ChipList, playerGold, ran);
    // 玩家金币小于押注金币，不押注
    if (!betGold) {
        return res;
    }
    // 计算押注类型
    let gl: number;
    if (sceneId === 1) {
        const bs = commonUtil.randomFromRange(1, 100);
        let bssd = getSicBoBetProp(bs);
        if (bssd === 2) {
            gl = commonUtil.randomFromRange(0, 5);
            res.betType = robotConst.SICBO.DICE_NUM[gl];
        } else if (bssd === 3) {
            gl = commonUtil.randomFromRange(0, 13);
            res.betType = robotConst.SICBO.POINTS[gl];
        } else if (bssd === 4) {
            gl = commonUtil.randomFromRange(0, 6);
            res.betType = robotConst.SICBO.THREE[gl];
        } else {
            gl = commonUtil.randomFromRange(0, 3);
            res.betType = robotConst.SICBO.YZGL[gl];
        }
    } else {
        if (ran <= 50) {
            gl = commonUtil.randomFromRange(0, 3);
            res.betType = robotConst.SICBO.YZGL[gl];
        } else {
            gl = commonUtil.randomFromRange(0, 5);
            res.betType = robotConst.SICBO.DICE_NUM[gl];
        }
    }
    // 默认下大
    if (commonUtil.isNullOrUndefined(res.betType)) {
        res.betType = 'big';
    }
    // 拆分押注金额
    res.betArr = divideBetGold(ChipList, betGold);
    // 打乱下注顺序
    commonUtil.shuffle(res.betArr);
    // 凌晨三点到7点减少下注
    let temp1: any = commonUtil.getDateSpecifHMSAfterDays(0, 3)
    let temp2: any = commonUtil.getDateSpecifHMSAfterDays(0, 7)
    if (Date.now() > Date.parse(temp1) &&
        Date.now() < Date.parse(temp2) &&
        res.betArr.length > 3) {
        res.betArr = res.betArr.slice(0, 2);
    }
    return res;
};

/**
 * 计算骰宝押注概率
 * @param bssd 
 */
function getSicBoBetProp(bssd) {
    let p = 0;
    if (bssd <= 35) {
        p = 0;
    } else if (bssd > 35 && bssd <= 70) {
        p = 1;
    } else if (bssd > 70 && bssd <= 80) {
        p = 2;
    } else if (bssd > 80 && bssd <= 90) {
        p = 3;
    } else {
        p = 4;
    }
    return p;
}

/**
 * 拆分押注金額，尽量多的种类
 * @param ChipList number[] 下注 可选 砝码
 * @param total number 可用于下注的金额
 */
export function divideBetGold(ChipList: number[], total: number) {
    const randomFactor = commonUtil.randomFromRange(1, 100);
    let selection = ChipList.map(c => c);
    // if (randomFactor >= 50) {
    //     selection = selection.slice(0, 2);
    // }
    const goldArr: number[] = [];
    // 最多二十条
    let i = 20;
    // 每次都筛选出押注金额足够的项
    selection = selection.filter(value => total >= value);
    while (selection.length && i) {
        // 打乱下注金额的顺序
        if (selection.length > 1) {
            commonUtil.shuffle(selection);
        }
        for (let gold of selection) {
            if (total && total >= gold) {
                goldArr.push(gold);
                total -= gold;
            }
        }
        i--;
        // 每次都筛选出押注金额足够的项
        selection = selection.filter(value => total >= value);
    }
    return goldArr;
}

/**
 * 获取百家押注信息
 * @param playerGold 
 * @param sceneId 
 */
export function getBaiJiaBetInfo(playerGold: number, sceneId: number, ChipList: number[]) {
    // const yaSection = commonRobotAction.beizhiRobot(sceneId).yaSection;
    const betGold = robotGoldUtil.randomBetGold(ChipList, playerGold, commonUtil.randomFromRange(1, 100));
    if (!betGold) {
        return { betArea: '', goldArr: [] };
    }
    let pnum = commonUtil.randomFromRange(1, 100);
    let betArea = "bank";
    if (sceneId === 0) {
        if (pnum <= 48) {
            betArea = 'bank';
        } else if (pnum > 48 && pnum <= 90) {
            betArea = 'play';
        } else {
            betArea = 'draw';
        }
    } else {
        //押注区域个数计算
        if (pnum <= 40) {
            //40% 随机押1个 大小庄闲
            betArea = robotConst.BAI_JIA.BET_AREA[commonUtil.randomFromRange(0, 3)];
        } else if (pnum > 40 && pnum <= 70) {
            //30% 随机押1~2个 大小庄闲和庄对闲对
            betArea = robotConst.BAI_JIA.BET_AREA[commonUtil.randomFromRange(0, 6)]
        } else if (pnum > 70 && pnum <= 90) {
            //20% 随机押2个 大小随1个，庄闲随1个
            betArea = robotConst.BAI_JIA.BET_AREA[commonUtil.randomFromRange(2, 3)]
        } else {
            //10% 单押 大
            betArea = "big";
        }
    }
    // 分多次押注
    return { betArea, goldArr: divideBetGold(ChipList, betGold) };
};

/**
 * 推筒子押注信息
 * @param hasBanker 
 * @param playerGold 
 * @param sceneId 
 */
export function getTTZBetInfo(ran: number, sceneId: number, playerGold: number, ChipList: number[]) {

    // const betSelection = commonRobotAction.beizhiRobot(sceneId).yaSection;
    // 每局总下注金额
    let betGold = robotGoldUtil.randomBetGold(ChipList, playerGold, ran);
    // 玩家的金币已经少于最小下注金币，返回
    if (!betGold) {
        return { betArea: "", betArr: [] };
    }

    const betArea = robotConst.TTZ.HAS_BANKER_BET_AREA;
    const randomIndex = commonUtil.randomFromRange(0, betArea.length - 1);
    // 返回的是 下注区域 和 金币数组
    return { betArea: betArea[randomIndex], betArr: divideBetGold(ChipList, betGold) };
};

/**
 * 万人金花也引用这个
 * 百人牛牛的押注信息：返回下注区域和下注列表。bankerGold 是 0 表示是系统坐庄
 * 押注金额规则：
 * a) AI押注金额=int（当前拥有金额/1000）*（随机1~10）
 * b) 如果机器人钱不够则按照最小押注
 * */
export function getBullFightBetInfo(ran: number, playerGold: number, bankerGold: number, ChipList: number[]) {
    // 机器人下注上限
    const robotBetUpLimit = (bankerGold / 100);
    // 每局总下注金额
    let betGold = robotGoldUtil.randomBetGold(ChipList, playerGold, ran);
    // 玩家的金币已经少于最小下注金币，返回
    if (!betGold) {
        return { betArea: 0, betArr: [] };
    }
    // 如果不是系统坐庄，不能超过下注金额的上限
    if (robotBetUpLimit && betGold > robotBetUpLimit) {
        // 在第一个下注 和 上限之间随机一个值，不然很多机器人的下注总量将会是一样多
        betGold = commonUtil.randomFromRange(ChipList[3], Math.max(ChipList[0], robotBetUpLimit));
    }
    // 返回的是 下注区域 和 金币数组
    return { betArea: commonUtil.randomFromRange(0, 3), betArr: divideBetGold(ChipList, betGold) };
};

/**
 * 红黑下注信息
 * @param playerGold 
 * @param sceneId 
 */
export function getRedBlackBetInfo(playerGold: number, sceneId: number, ChipList: number[]) {
    // const betSelection: Array<number> = commonRobotAction.beizhiRobot(sceneId).yaSection;
    // 随机每把的下注金额
    let betGold = robotGoldUtil.randomBetGold(ChipList, playerGold, commonUtil.randomFromRange(1, 100));
    // 下注金额小于最小可下注金额，金币不足，返回
    if (!betGold) {
        return { betType: "", betArr: [] };
    }

    const areaFactor = commonUtil.randomFromRange(1, 100);

    let betType: string = "red";

    if (areaFactor <= 47) {
        betType = areaFactor <= 4 ? "luck" : "red";
    } else {
        betType = areaFactor > 50 ? "black" : "luck";
        if (areaFactor > 97) betType = "luck";
    }

    // betType = areaFactor <= 47 ? "red" : (areaFactor > 52 ? 'black' : 'luck');
    // const betType = 'black';
    let betArr = divideBetGold(ChipList, betGold);
    // 凌晨三点到7点减少下注
    let temp1: any = commonUtil.getDateSpecifHMSAfterDays(0, 3);
    let temp2: any = commonUtil.getDateSpecifHMSAfterDays(0, 7);
    if (Date.now() > Date.parse(temp1) &&
        Date.now() < Date.parse(temp2) &&
        betArr.length > 3) {
        betArr = betArr.slice(0, 2);
    }
    // 返回的是 下注区域 和 金币数组
    return { betType, betArr };
};

/**
 * 龙虎下注信息
 * @param playerGold 
 * @param sceneId 
 */
export function getDragonTigerBetInfo(playerGold: number, sceneId: number, ChipList: number[]) {
    // const betSelection: number[] = commonRobotAction.beizhiRobot(sceneId).yaSection;
    const ran = commonUtil.randomFromRange(1, 100);
    // 随机每把的下注金额
    let betGold = robotGoldUtil.randomBetGold(ChipList, playerGold, ran);
    // 下注金额小于最小可下注金额，金币不足，返回
    if (!betGold) {
        return { 'betType': null, 'betArr': [] };
    }

    let betType: string[];
    if (sceneId === 0) {
        if (ran <= 48) {
            betType = ['t'];
        } else if (ran > 48 && ran <= 96) {
            betType = ['d'];
        } else {
            betType = ['f'];
        }
    } else {
        if (ran <= 45) {
            betType = ['d'];
        } else if (ran > 45 && ran <= 90) {
            betType = ['t']
        } else if (ran > 90 && ran <= 96) {
            betType = robotConst.DRAGON_TIGER.DT_ARR;
        } else {
            betType = ['f'];
        }
    }
    // 押和的，控制总金币在 25000 以内（即前端的250以内）
    if (betType[0] === 'f') {
        // 在 5000 到 25000 之间随机一个值
        betGold = Math.min(betGold, commonUtil.randomFromRange(5000, 25000));
    }

    let betArr = divideBetGold(ChipList, betGold);
    // 凌晨三点到7点减少下注
    let temp1 = commonUtil.getDateSpecifHMSAfterDays(0, 3);
    let temp2 = commonUtil.getDateSpecifHMSAfterDays(0, 7);
    if (Date.now() > temp1 && Date.now() < temp2 && betArr.length > 3) {
        betArr = betArr.slice(0, 2);
    }
    // 返回的是 下注区域 和 金币数组
    return { betType, betArr };
};

