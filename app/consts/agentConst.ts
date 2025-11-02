'use strict';



// 代理等级
export const AGENT_LEVEL = {
    TOP_LEVEL: 1, // 顶级的
    BORDER: 0, // 边界的
};

// 操作某一组代理的锁的前缀
export const AGENT_LOCK_PREFIX = 'agent:';

// 大区锁定的 ttl
export const AGNET_LOCK_TTL = 20000;

// 代理免密token ttl
export const TOKEN_KEY_TTL = 60;

// 代理免密登录tokenkey
const redisTokenKey = 'agentToken';
/**
 * 构建Redis的token key
 * @param token
 * @returns {string}
 */
export function buildTokenKey(token: string) {
    return redisTokenKey + ":" + token;
};
