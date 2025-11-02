'use strict';

/** 玩家列表一页多少条数据
 * @property  COUNT              20 玩家列表一页多少条数据
 */
export enum PLAYER_LIST_COUNT {
    COUNT  = 20 ,

}

/** 间隔多少秒，缓存数据没用
 * @property  TIME              10 * 60 * 1000  毫秒
 */
export enum GET_CACHE_DATA  {
    TIME  = 10 * 60 * 1000 ,
}

/** 一天时间
 * @property  TIME              10 * 60 * 1000  毫秒
 */
export enum ONE_DAY  {
    TIME  = 24 * 60 * 60 * 1000 ,
}