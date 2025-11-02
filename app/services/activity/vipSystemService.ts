'use strict';
import { getLogger } from 'pinus-logger';
import PlayerManagerDao from '../../common/dao/daoManager/Player.manager';
import JsonMgr = require('../../../config/data/JsonMgr');
import CommonUtil = require('../../utils/lottery/commonUtil');
import RedisManager = require('../../common/dao/redis/lib/redisManager');
import VipConfigMysqlDao from '../../common/dao/mysql/VipConfig.mysql.dao';
import VipBonusDetailsMysqlDao from '../../common/dao/mysql/VipBonusDetails.mysql.dao';
import * as moment from "moment";
const globalErrorLogger = getLogger('server_out', __filename);


/**
 * 获取玩家VIP的相关信息
 */
/* export const getPlayerSystemMessage = async (player : any) => {
    const result = { needAddRmbToNextLevel : 0 , selfLevelRatio : 0, nextLevelRatio : 0, nextVipLevel :0 ,receive : 0 ,nextLevelScore : 0 ,selfVipLevel: 0 ,todayReceive : 0 }
    try {
        const  vipScore = player.addRmb /100;
        let  selfVipLevel = await getPlayerLevel(vipScore) ;
        let  nextVipLevel = selfVipLevel;
        if((selfVipLevel + 1) <= 12){
            nextVipLevel = selfVipLevel + 1;
        }
        const { selfLevelRatio , nextLevelRatio ,nextLevelScore}: any = await getNexVipLevelNeedVipScore(selfVipLevel,nextVipLevel );
        // let receive = parseInt(player.yesterdayVipPlayFlowCount ?　player.yesterdayVipPlayFlowCount　:  0);
        result.needAddRmbToNextLevel = nextLevelScore - vipScore;
        result.selfLevelRatio = selfLevelRatio;
        result.nextLevelRatio = nextLevelRatio;
        result.nextLevelScore = nextLevelScore;
        // result.receive = receive;
        result.selfVipLevel = selfVipLevel;
        result.nextVipLevel = nextVipLevel;
        // result.vipScore = vipScore;
        // result.todayReceive = parseInt(player.todayVipPlayFlowCount ? player.todayVipPlayFlowCount : 0);
        return result ;
    }catch (error) {
        globalErrorLogger.info(`getPlayerSystemMessage==uid{player.uid} 计算vip等级错误：${error.stack || error}`);
        return error;
    }
} */
/**
 * 根据传入的积分来获取玩家的等级
 */
export const getPlayerLevel = async (vipScore: number) => {
    let level = 0;
    try {
        const configJson = JsonMgr.get('system/vipConfig').datas;
        console.log('config1', configJson);
        const config = configJson.vipLevels;
        console.log('vipConfig', config);
        if (!config) {
            return 0;
        }
        let level = 0;
        if (!config || !vipScore) {
            return level;
        }
        if (!(config instanceof Array)) {
            return level;
        }
        config.sort((v1, v2) => {
            return v2.levelScore - v1.levelScore;
        });
        for (let value of config) {
            if (vipScore >= value.levelScore) {
                level = value.level;
                break;
            }
        }
        console.log('level', level);
        return level;
    } catch (e) {
        globalErrorLogger.info(`getPlayerLevel==vipScore: ${vipScore} 计算vip等级错误：${e.stack || e}`);
        return level;
    }
}

/**
 * 根据传入的等级来获取下一等级所需要的积分
 */
export const getNexVipLevelNeedVipScore = async (selfVipLevel: number, nextVipLevel: number) => {
    let level = 0;
    try {
        const configJson = JsonMgr.get('system/vipConfig').datas;
        const config = configJson.vipLevels;
        if (!config) {
            return 10000;
        }
        const selfLevelScore = config.find(x => x.level == selfVipLevel).levelScore;
        const selfLevelRatio = config.find(x => x.level == selfVipLevel).ratio;
        const nextLevelScore = config.find(x => x.level == nextVipLevel).levelScore;
        const nextLevelRatio = config.find(x => x.level == nextVipLevel).ratio;
        return { selfLevelRatio, nextLevelRatio, nextLevelScore };
    } catch (e) {
        globalErrorLogger.info(`getPlayerLevel==:计算vip等级错误：${e.stack || e}`);
        return level;
    }
}


// 领取vip系统奖励的金币 ==== 根据玩家押注流水来的
export const receiveVipSystemCommission = async (player, lock, playCommission) => {
    // try {
    //     // 提取
    //     player.gold = CommonUtil.lotteryAddGolds(player.gold, playCommission);
    //     // 领完后重置
    //     player.yesterdayVipPlayFlowCount = 0;
    //     // 批量执行
    //     await Promise.all([
    //         PlayerManager.updateOnePlayer(player, ['gold', 'yesterdayVipPlayFlowCount'], lock),
    //         // 增加提佣记录
    //         // RecordManager.addGoldIncreaseRecord(DatabaseConst.LUCKY_ARROUND_MAIL_TYPE.VIP_PLAY_COMMISSION , playCommission, player)
    //     ]);
    //     return true;
    // } catch (error) {
    //     globalErrorLogger.error('CommissionService.receivePlayCommission ==>', error);
    //     return false;
    // } finally {
    //     await RedisManager.unlock(lock);
    // }
};

/**
 *   获取玩家自玩每把vip系统返的金额
 * @param player
 * @param lock
 * @param playCommission
 */
export const getSystemVipRatio = (vipScore) => {
    let ratio = 0;
    try {
        if (CommonUtil.isNullOrUndefined(vipScore)) {
            return 0;
        }
        const configJson = JsonMgr.get('system/vipConfig').datas;
        const config = configJson.vipLevels;
        config.sort((v1, v2) => {
            return v2.levelScore - v1.levelScore;
        });
        for (let value of config) {
            if (vipScore >= value.levelScore) {
                ratio = value.ratio;
                break;
            }
        }
        return ratio;
    } catch (error) {
        globalErrorLogger.error('CommissionService.receivePlayCommission ==>', error);
        return ratio;
    }
};


/**============================== */

type vipCfg = {
    level: number,
    des: string;
    levelScore: number;
    bonus: number;
    bonusForWeeks: number;
    bonusForMonth: number;
}

/**
 * @name 初始化vip等级、充值奖励、周奖励、月奖励配置信息
 */
export async function initVipConfig() {
    console.warn("初始化vip等级、充值奖励、周奖励、月奖励配置信息")
    const list = await VipConfigMysqlDao.findList({});
    if (list.length === 0) {
        const configJson = JsonMgr.get('system/vipConfig').datas;
        const cfgList: Array<vipCfg> = configJson.vipLevels;

        for await (const vipConfig of cfgList) {
            await VipConfigMysqlDao.insertOne(vipConfig);
        }
    }
}

/**
 * @name 判断玩家是否更新vip等级和奖励
 * @param uid       玩家编号
 * @param level     玩家当前vip等级
 * @param addRmb    玩家总充值(分)
 */
export async function checkVipLevelAndBouns(uid: string, level: number = 0, addRmb: number = 0) {
    const list = await VipConfigMysqlDao.findList({});
    addRmb = addRmb / 100;
    /**
     * Step 1:
     * 设置用于判断的等级区间
     * 结果集如下：
     * [
        [ 0, 500 ],             [ 500, 10000 ],
        [ 10000, 30000 ],       [ 30000, 80000 ],
        [ 80000, 150000 ],      [ 150000, 250000 ],
        [ 250000, 450000 ],     [ 450000, 750000 ],
        [ 750000, 1150000 ],    [ 1150000, 1650000 ],
        [ 1650000, 2350000 ],   [ 2350000, 3250000 ],
        [ 3250000, 4350000 ],   [ 4350000, 5650000 ],
        [ 5650000, 7150000 ],   [ 7150000, 8950000 ],
        [ 8950000, 11050000 ],  [ 11050000, 13450000 ],
        [ 13450000, 16150000 ], [ 16150000, 19150000 ]
        ]

        根据 addRmb 判断符合的区间下标，来表示等级
     */
    let lastlevelScore = 0;

    const l = list.reduce((res, info) => {

        if (lastlevelScore === 0 && info.levelScore === 0) {
            return res;
        }

        res.push([lastlevelScore, info.levelScore]);

        lastlevelScore = info.levelScore

        return res;
    }, []);

    // Step 2: 查询玩家当前充值额符合的vip等级
    const levelAfterPay = l.findIndex(info => addRmb >= info[0] && addRmb < info[1]);

    // Step 3: 若充值后的等级大于现在的等级
    if (levelAfterPay > level) {

        // 截取应获得奖励的区间
        const ll = list.slice(level + 1, levelAfterPay + 1);

        const playerVipBonusDetails = await VipBonusDetailsMysqlDao.findOne({ uid });

        let initDetails = {
            level: 0,
            bonus: 0,
            bonusForWeeks: 0,
            bonusForMonth: 0,
        }

        // 若当前玩家已有vip详情记录
        if (playerVipBonusDetails) {

            // 未领过等级奖励则累增，反之则覆盖
            if (playerVipBonusDetails.whetherToReceiveLeverBonus === 0) {
                initDetails.bonus = playerVipBonusDetails.bonus;
            }

            // 周奖励是否累增判断
            let bonusForWeeksLastDateFlag = !!playerVipBonusDetails.bonusForWeeksLastDate;
            if (bonusForWeeksLastDateFlag) {
                const currentDate = moment().format("YYYY-MM-DD hh:mm:ss");
                const lastDate = moment(playerVipBonusDetails.bonusForWeeksLastDate).format("YYYY-MM-DD hh:mm:ss");
                const diffDays = moment(lastDate).diff(moment(currentDate), "d");
                if (diffDays > 7) {
                    initDetails.bonusForWeeks += playerVipBonusDetails.bonusForWeeks;
                }
            } else {
                initDetails.bonusForWeeks += playerVipBonusDetails.bonusForWeeks;
            }

            // 月奖励是否累增判断
            let bonusForMonthLastDateFlag = !!playerVipBonusDetails.bonusForMonthLastDate;
            if (bonusForMonthLastDateFlag) {
                const currentDate = moment().format("YYYY-MM-DD hh:mm:ss");
                const lastDate = moment(playerVipBonusDetails.bonusForMonthLastDate).format("YYYY-MM-DD hh:mm:ss");
                const diffDays = moment(lastDate).diff(moment(currentDate), "d");
                if (diffDays > 30) {
                    initDetails.bonusForMonth += playerVipBonusDetails.bonusForMonth;
                }
            } else {
                initDetails.bonusForMonth += playerVipBonusDetails.bonusForMonth;
            }

        }

        const info = ll.reduce((result, info) => {
            result.level = info.level;
            result.bonus += info.bonus;
            result.bonusForWeeks += info.bonusForWeeks;
            result.bonusForMonth += info.bonusForMonth;

            return result;
        }, initDetails);

        // 有数据则修改, 无则新增
        if (playerVipBonusDetails) {
            // 初始化可领状态
            Object.assign(info, { whetherToReceiveLeverBonus: 0 });
            Object.assign(info, { bonusForWeeksLastDate: null });
            Object.assign(info, { bonusForMonthLastDate: null });
            await VipBonusDetailsMysqlDao.updateOne({ uid }, info);
        } else {
            Object.assign(info, { uid });
            await VipBonusDetailsMysqlDao.insertOne(info);
        }
        return levelAfterPay;
    }

    return level;
}
