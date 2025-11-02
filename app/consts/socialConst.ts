'use strict';

// 玩家关系相关的常量


// 好友相关操作的类型
export const OP_TYPE = {
    APPLY: 1,           // 申请添加好友
    ACCEPT: 2,          // 同意添加请求
    REJECT: 3,          // 拒绝添加好友
    DELETE: 4,          // 删除好友
    EXPIRE: 5,          // 添加申请过期
};

// 推荐的玩家个数
export const RECOMMEND_LENGTH = 9;
// 最长申请条数
export const MAX_REQUEST_LENGTH = 30;
// 最多好友数量
export const MAX_FRIEND_LENGTH = {
    DEFAULT: 20, // 默认20
};
// 关系操作请求 route
export const ROUTE = {
    ON_RELATION_OP: 'onRelationOperate',    // 关系操作
    ON_RECEIVE_GIT: 'onReceiveGift',        // 收到礼物
};

// 添加申请的过期时间（3天），单位是：ms
export const APPLY_ADD_TTL = 259200000;