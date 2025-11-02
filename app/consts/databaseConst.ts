'use strict';

/**
 * 游戏中所有数据库相关的常量
 */


//数据库分表相关
export const DB_TABLE = {
    // 分表数量
    SEPARATE_NUMBER: 5,
    // 表名
    NAME: {
        GOLD_RECORD: "gold_record_info"
    },
    // 钓鱼表名
    FISHING: {
        TABLE_PREFIX: 'fishing_lottery',
        LOTTERY_TABLES: ['fishing_lottery_11_5', 'fishing_lottery_6_3', 'fishing_lottery_10_5'],
    },
    REGULATION: {
        SCHEMA_DEF: 'regulation_setting',
        TABLES: ['regulation_racing', 'regulation_fishing_11_5', 'regulation_fishing_6_3', 'regulation_fishing_10_5']
    },

    //game_record备份表
    GAME:{
        GAMERECORD: 'game_record',
        TABLES: ['game_record','game_record_backup', ]
    }
};

// 内存中数据过期时间
export const BUFFER_EXPIRATION = {
    ONE_DAY: 86400,             // 单位是秒，24小时
    ONE_HOUR: 3600,             // 单位是秒，1小时
    LOTTERY_BET_SETTING: 600,   // 单位是秒，10分钟
    ONE_MINUTE: 60,             // 单位是秒，1分钟
};




// 标识是否已经做过清理的缓存 key
export const SERVER_OP_MARK_KEY = {
    BEFORE_SHUTDOWN: 'server_clean_up_after_shutdown',      // 大厅关闭前清理标志
    AFTER_START_ALL: 'server_init_mark_after_start_all',    // 服务器全部启动之后初始化标志
    BEFORE_START: 'server_init_mark_before_start',          // 大厅服务器启动之前初始化标志
};

// 跑马灯数组键
export const BIG_WIN_NOTICE_ARR_SET = 'big_win_notice_arr_set';

// app上挂载的redis客户端名称
export const REDIS_CLIENT_NAME = {
    DATA: 'redisDataClient',
    NOTICE: 'redisNoticeClient',
};



// 保存验证码信息
export const AUTH_CODE_INFO_KEY = 'auth_code_info';



