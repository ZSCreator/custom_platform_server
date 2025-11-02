'use strict'


// 为充值且领取了救济金玩家的slots游戏返奖率
export function awardRate(num: number) {
    switch (num) {
        case 2:
            return 15;
        case 3:
            return 12;
        case 4:
            return 10;
        case 5:
            return 8;
        case 6:
            return 6;
        default:
            return 5;
    }
};

/**
 * slots游戏返奖率限制
 * @param nid
 */
export function slotsAwardRateLimit(nid?: string): number {
    switch (nid) {
        default:
            return 40;
    }
}