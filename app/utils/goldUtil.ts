'use strict';

// 金币相关
import commonUtil = require('../utils/lottery/commonUtil');


/**
 * 扣金币接口：
 * 返回值是一个数组，位置 0 表示错误，位置 1 表示需要更新的字段数组
 * */
export function deductGold(player, profit: number) {
    if (!player) {
        return { err: '玩家不存在', result: [''] };
    }
    if (typeof profit !== 'number') {
        return { err: `金币不是数字${profit}`, result: null };
    }
    if (profit < 0) {
        return { err: `扣除的金币不能为负：${profit}`, result: null };
    }
    if (commonUtil.isNullOrUndefined(player.gold)) {
        return { err: '玩家金币字段不存在', result: null };
    }
    // gold 够扣
    if (player.gold >= profit) {
        player.gold -= profit;
        return { err: null, result: ['gold'] };
    } else {
        player.gold = 0;
        return { err: `金币不足`, result: ['gold'] };
    }
};