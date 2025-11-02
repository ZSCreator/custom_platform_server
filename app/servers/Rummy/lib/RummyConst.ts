
export const CHANNEL_NAME = 'Rummy';




/**
 * 获取牌型
 */
export enum CardsType {
    /**单张 */
    SINGLE = 'SINGLE',
    /**如果是顺子又是金花包含鬼牌和变牌 --- 顺金 */
    SHUN_GOLDENFLOWER = 'SHUN_GOLDENFLOWER',
    /**豹子：三张或者4张点相同的牌。例：AAA、2222*/
    BAOZI = 'BAOZI',
    /**如果是顺子又是金花 --- 顺金 */
    SHUN_GOLDENFLOWER_ONE = 'SHUN_GOLDENFLOWER_ONE',
};


/**
 * 要牌和思考牌型时间
 */
export enum  LookCardTime {
    TIME = 45
} ;


/**
 *  玩家最大的分值
 */
export enum  PLAYER_POINT {
    VALUE = 80
} ;

/**
 *  玩家第一轮弃牌输最大分数的1/4 ， 第二轮弃牌输最大分数的1/2
 */
export enum  PLAYER_LOSE {
    ONE = 0.25,
    TWO = 0.5,
} ;

/**
 *  是哪个牌堆里面获取的
 */
export enum  PUKE_TYPE {
    LOST = 'lost',
    PUKE = 'puke',
} ;

/**
 *  鬼牌类型
 */
export   const CARD_TYPE_GUIPAI  = [52,53];
/**
 *  牌色的分类 0 ，1 ，2 ，3
 */
export   const  CARD_COLOR_TYPE = [0,1,2,3];

/**
 *  记录是10分的数值  JQKA
 */
export const  CARD_POINT_TYPE  = [0,10,11,12,13,23,24,25,26,38,37,36,51,50,49,39];

/**
 * 拉米游戏的获取好牌的参数,所有参数都为随机0-100,然后大于该值就触发
 * 真人是赢家就会获取一组纯连作为底牌，
 */
export const Rummy_Data = {
    GoodCardForChange : 70,  //如果机器人是赢家，初始化13张牌的时候大于这个参数就会有2张变牌，否则就1张
    GetNeedCardForRobot_ForWinRobot : 50,  //如果机器人是赢家，给机器人需要的牌大于这个参数就能得到需要的牌
    GetNeedCardForRobot_ForWinPlayer : 65,  //如果真人是赢家，给机器人需要的牌大于这个参数就能得到需要的牌
    GetGoodBaoZi: 50,           // 好牌是否需要条子的牌型,有的概率获取差一张形成条子的牌型(K,K)
    GetNeedCardForPlayer: 60, //如果真人是赢家，概率给真人需要的牌
    GetLoseCardForPlayer: 65, // 机器人是赢家,给玩家差牌，不能组合的牌
    WinPlayerGoodRobotCard_start: 0, //如果真人是赢家，开始发13张牌进行组合牌，给机器人需要的大于这个参数就能得一个纯连组合,其他的就是随机牌
    WinPlayerGoodRobotCard_end: 50, //如果真人是赢家，开始发13张牌进行组合牌，给机器人需要的大于这个参数就能得一个纯连组合,其他的就是随机牌
    WinPlayerRandomRobotCard_start: 50, //如果真人是赢家，开始发13张牌进行组合牌，给机器人需要的大于这个参数就全是随机牌
    WinPlayerRandomRobotCard_end: 70, //如果真人是赢家，开始发13张牌进行组合牌，给机器人需要的小于这个参数就全是随机牌
    WinPlayerGropRobotCard_start: 70, //如果真人是赢家，开始发13张牌进行组合牌，给机器人需要的大于这个参数就全是投降牌
    WinPlayerGropRobotCard_end: 100, //如果真人是赢家，开始发13张牌进行组合牌，给机器人需要的小于这个参数就全是投降牌
}

