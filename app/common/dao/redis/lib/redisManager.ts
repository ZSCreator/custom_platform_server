'use strict';

/**
 * 使用方法：
 * 1.redis 中所有的字段都会存成字符串: 若存对象，用 JSON.stringify 和 JSON.parse；若存数字，请取出时转成数字
 *
 * 2.如设置每天24点的时候过期：
 * const todayEnd = new Date().setHours(23, 59, 59, 999);
 * RedisClient.expireat(key, parseInt(todayEnd/1000));
 *
 * 3.获取剩余的过期时间：
 * RedisClient.ttl(key, (error, res) => { console.log("剩余生存时间:", res)});
 * res的值：当key不存在时，返回-2, 当key存在但没有设置剩余生存时间时返回 -1；否则，res是剩余生存时间，以秒为单位。
 * */
import { pinus } from "pinus";
import Redlock = require('redlock');
// import * as hallConst from '../../../../consts/hallConst';
import * as commonUtil from '../../../../utils/lottery/commonUtil';
// import * as databaseConst from '../../../../consts/databaseConst';
import LogService = require('../../../../services/common/logService');
import databaseService = require('../../../../services/databaseService');
import { getLogger } from 'pinus-logger';
import RedisManager from "../../redis/lib/BaseRedisManager";
import { RedisDB } from "../config/DBCfg.enum";
const Logger = getLogger('server_out', __filename);


let redLockInstance: Redlock;

// 获取 redLockInstance，用于加锁
export async function getRedLockInstance(): Promise<Redlock> {
    return new Promise(async (resolve, reject) => {
        if (redLockInstance) {
            return resolve(redLockInstance);
        }
        // 否则，初始化一个
        // 先获取数据类型的 redisClient
        // const redisClient = await databaseService.getRedisClient();
        const redisClient = await RedisManager.getConnection(RedisDB.RuntimeData);
        // Redlock 对象实例，用于给指定资源加锁、释放锁
        redLockInstance = new Redlock(
            // you should have one client for each independent redis node
            // or cluster
            [redisClient], {
            // the expected clock drift; for more details
            // see http://redis.io/topics/distlock
            driftFactor: 0.01, // time in ms

            // Redlock 尝试获取指定资源的最大次数
            retryCount: 100,

            // 200 ms 试一次
            retryDelay: 200, // time in ms

            // the max time in ms randomly added to retries
            // to improve performance under high contention
            // see https://www.awsarchitectureblog.com/2015/03/backoff.html
            retryJitter: 200 // time in ms
        }
        );
        // 监听错误
        redLockInstance.on('clientError', err => {
            Logger.error('clientError ==> A redis error has occurred:', err);
            return reject(redLockInstance);
        });
        return resolve(redLockInstance);
    });
}

/**
 * 给指定资源加锁:
 * 注意：有个大坑，官方未明示，加锁的时候，所有的 key 对应的资源前面要加前缀：'locks:'
 * */
export const lock = async (key: string, ttl = 4000) => {
    let errorMessage = 'RedisManager.lock ==> 加锁失败';
    if (!key) {
        return Promise.reject(errorMessage + "请传入key");
    }
    try {
        const lockInstance = await getRedLockInstance();
        // 加锁
        const lock = await lockInstance.lock('locks:' + key, ttl);
        // 记录锁的信息
        LogService.logLockInfo(key, lock);
        return Promise.resolve(lock);
    } catch (error) {
        // 记录失败的信息
        LogService.logLockInfo(key);
        return Promise.reject(errorMessage);
    }
};

// 通过传入的锁对象解锁，解锁失败的时候只需要打印出来，因为锁是有生命周期的
export const unlock = async lock => {
    let errorMessage = 'RedisManager.unlock ==> 解锁失败:';
    if (!lock) {
        return Promise.resolve();
    }
    try {
        // 解锁
        await lock.unlock();
        return Promise.resolve();
    } catch (error) {
        Logger.error(errorMessage, error);
        return Promise.resolve();
    }
};

/**
 * 验证锁是否合法，验证方法：
 * 1.验证 lock.resource 的后缀是不是 resourceKey
 * 2.验证 redis 里面有没有存 lock.resource 对应的值
 * @param: lock 是锁、resourceKey 是资源在内存中的 key
 * 注：lock.resource 是锁的值在redis的键，如 locks:player_info:13799262，它锁住的资源是去掉 locks: 前缀的部分
 * */
export const isLockValid = async (lock, resourceKey) => {
    let errorMessage = `$| RedisManager.isLockValid ==>`;
    if (!lock || !resourceKey) {
        Logger.error(errorMessage, `参数错误,resourceKey:${resourceKey}|lock: ${lock}`);
        return false;
    }
    try {
        const redisClient = await databaseService.getRedisClient();
        const lockResourceKey = lock.resource;
        if (lockResourceKey.slice(6) !== resourceKey) {
            throw new Error(`锁对应的资源：${lockResourceKey.slice(6)}，传入的资源：${resourceKey}`);
        }
        if (await redisClient.exists(lockResourceKey.slice(6)) !== 1) {
            throw new Error(`锁不存在或已被释放`);
        }
        return true;
    } catch (error) {
        Logger.error(errorMessage, error.stack);
        return false;
    }
};

/**
 * 设置对象到Redis，过期时间设为 expiration，单位是秒
 */
export const setObjectIntoRedisHasExpiration = async (key, value, expiration) => {
    let errorMessage = 'RedisManager.setObjectIntoRedisHasExpiration ==>';
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        errorMessage += 'redis 客户端未连接';
        Logger.error(errorMessage);
        return Promise.reject(errorMessage)
    }
    try {
        await redisClient.setex(key, expiration, JSON.stringify(value));
        return Promise.resolve();
    } catch (error) {
        Logger.error(errorMessage, key, error);
        errorMessage += '出错' + error.message;
        return Promise.reject(errorMessage)
    }
};

/**
 * 设置对象到redis，无过期时间
 * */
export const setObjectIntoRedisNoExpiration = async (key, value) => {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('redis 客户端未连接');
        return Promise.resolve()
    }
    try {
        await redisClient.set(key, JSON.stringify(value));
        return Promise.resolve()
    } catch (error) {
        Logger.error('RedisManager.setObjectIntoRedisNoExpiration==>', key, error);
        return Promise.resolve()
    }
};

/**
 * 从redis中获取对象
 * */
export async function getObjectFromRedis(key, callback?): Promise<any> {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('redis 客户端未连接');
        callback && callback(null, null);
        return Promise.resolve()
    }
    try {
        let value = await redisClient.get(key);
        if (typeof value === "string") {
            value = JSON.parse(value);
        }
        callback && callback(value);
        return Promise.resolve(value)
    } catch (error) {
        // Logger.error('RedisManager.getObjectFromRedis==>', key, error);
        callback && callback(null, null);
        return Promise.resolve()
    }
};

/**
 * 删除 redis 中的所有 keys，可以是单个 key 或 key的数组
 * 删除成功返回删除的个数
 * */
export const deleteKeyFromRedis = async (keys: string) => {
    let errorMessage = 'RedisManager.deleteKeyFromRedis =>';
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error(errorMessage, 'redis 客户端未连接');
        return Promise.reject('redis 客户端未连接');
    }
    try {
        if (!keys || (Array.isArray(keys) && !keys.length)) {
            return Promise.resolve(0);
        }
        const deleteCount = await redisClient.del(keys);
        return Promise.resolve(deleteCount);
    } catch (error) {
        Logger.error(errorMessage, '删除失败');
        return Promise.reject('删除失败');
    }
};

/**
 * 获取所有满足 keyPattern 的所有 keys
 */
export const getKeysSatisfyPattern = async (keyPattern, callback?) => {
    let errorMessage = 'RedisManager.getKeysSatisfyPattern =>';
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error(errorMessage, 'redis 客户端未连接');
        callback && callback();
        return Promise.reject('redis 客户端未连接');
    }
    try {
        const keys = await redisClient.keys(keyPattern);
        callback && callback(keys);
        return Promise.resolve(keys);
    } catch (error) {
        Logger.error(errorMessage, '获取出错');
        callback && callback();
        return Promise.reject('获取出错');
    }
};

/**
 * 获取redis中所有 key 满足 keyPattern 前缀的所有值
 * 注意：只能获取以string方式设置到 缓存中的对象
 * */
export const getAllValuesSatisfyPattern = async function (keyPattern, callback?) {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('redis 客户端未连接');
        callback && callback([]);
        return Promise.resolve([]);
    }
    try {
        const keys = await redisClient.keys(keyPattern);
        if (!keys || !keys.length) {
            callback && callback([]);
            return Promise.resolve([]);
        }
        const valueArr = [];
        let bufferData;
        for (let key of keys) {
            bufferData = await getObjectFromRedis(key);
            bufferData && valueArr.push(bufferData);
        }
        callback && callback(valueArr);
        return Promise.resolve(valueArr);
    } catch (error) {
        Logger.error('RedisManager.getAllValuesSatisfyPattern ==>', error);
        callback && callback([]);
        return Promise.resolve([]);
    }
};


/**
 * 从数组左边push
 * listKey,max,value 键 list最大数量 值
 */
export const lPush = async function (listKey, max, value, expiration = 0, cb?) {
    try {
        const redisClient = await databaseService.getRedisClient();
        if (redisClient) {
            await redisClient.lpush(listKey, JSON.stringify(value));
        }
        if (max) {
            const data = await redisClient.llen(listKey);
            if (data > max) {
                await redisClient.rpop(listKey);
            }
        }
        //设置过期时间
        expiration && await redisClient.expire(listKey, expiration);
        cb && cb(null);
        return Promise.resolve(null);
    } catch (error) {
        Logger.error('RedisManager.lPush==>', error);
        return Promise.reject('push数据出错');
    }

};

/**
 * 获取list内指定位置的元素
 * listKey,index 键 list指定位置的下标
 */
export const getListIndex = async function (listKey, index, callback?) {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('redis 客户端未连接');
        callback && callback(null);
        return Promise.resolve(null);
    }
    try {
        const value = await redisClient.lindex(listKey, index);
        if (!value) {
            callback && callback(null);
            return Promise.resolve(null);
        }
        let valueInJson = value;
        if (typeof value === "string") {
            valueInJson = JSON.parse(value);
        }
        callback && callback(valueInJson);
        return Promise.resolve(valueInJson);
    } catch (error) {
        Logger.error('RedisManager.getListIndex ', error);
        callback && callback(null);
        return Promise.resolve(null);
    }
};


/**
 * 删除列表里的指定值
 * @param listKey
 * @param count  大于零表示从表尾开始搜索 移除与value相等的元素，数量为 count
 * @param value
 * @return 返回列表剩余长度
 */
export const deleteListValue = async function (listKey: string, count: number, value: any): Promise<number> {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('redis 客户端未连接');
        return Promise.resolve(null);
    }
    try {
        return await redisClient.lrem(listKey, count, value);
    } catch (error) {
        Logger.error('RedisManager.getListRange ==> ', error);
        return 0;
    }
};

/**
 * 获取列表指定范围类的值
 * listKey,start,stop 键 开始位置 结束位置
 */
export const getListRange = async function (listKey, start, stop, callback?) {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('redis 客户端未连接');
        callback && callback(null);
        return Promise.resolve(null);
    }
    try {
        const result = await redisClient.lrange(listKey, start, stop);
        let arr = [];
        result.forEach(m => {
            arr.push(JSON.parse(m));
        });
        callback && callback(arr);
        return Promise.resolve(arr);
    } catch (error) {
        Logger.error('RedisManager.getListRange ==> ', error);
        callback && callback(null);
        return Promise.resolve(null);
    }
};

/**从hash表中获取，field 是某个域，如果为null，获取所有域 */
export const getFromHashTable = async function (hashKey: string, field: string) {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('RedisManager.getFromHashTable ==>redis 客户端未连接');
        return Promise.resolve(null);
    }
    try {
        let data;
        if (field !== undefined && field !== null) {
            data = await redisClient.hget(hashKey, field);
            data = JSON.parse(data);
            return Promise.resolve(data);
        } else {
            data = await redisClient.hgetall(hashKey);
            const dataList = [];
            for (let key in data) {
                dataList.push(JSON.parse(data[key]));
            }
            return Promise.resolve(dataList);
        }
    } catch (error) {
        Logger.warn('RedisManager.getFromHashTable ==> ', hashKey, (error.stack || error));
        return Promise.resolve(null);
    }
};

// 获取整个对象形式的hashTable
export const getHashTableObject = async (hashKey, field?) => {
    const redisClient = await databaseService.getRedisClient();
    try {
        if (!redisClient) {
            throw 'redis 客户端未连接';
        }
        let data;
        if (!commonUtil.isNullOrUndefined(field)) {
            return JSON.parse(await redisClient.hget(hashKey, field));
        } else {
            data = await redisClient.hgetall(hashKey);
            for (let key in data) {
                data[key] = JSON.parse(data[key]);
            }
            return data;
        }
    } catch (error) {
        Logger.error('RedisManager.getFromHashTable ==>', error);
        return;
    }
};

//将数据保存到 hashTable
export const storeMultiFieldsIntoHashTable = async (hashKey, fieldAndData, callback?) => {
    let errorMessage = 'RedisManager.storeMultiFieldsIntoHashTable =>';
    try {
        const redisClient = await databaseService.getRedisClient();
        if (!redisClient) {
            errorMessage += ' redis 客户端未连接';
            Logger.error(errorMessage);
            callback && callback(errorMessage);
            return Promise.reject(errorMessage);
        }
        for (let key in fieldAndData) {
            fieldAndData[key] = JSON.stringify(fieldAndData[key]);
        }
        await redisClient.hmset(hashKey, fieldAndData);
        callback && callback(null, null);
        return Promise.resolve();
    } catch (error) {
        errorMessage += '存储数据出错';
        Logger.error(errorMessage, error);
        callback && callback(errorMessage);
        return Promise.reject(errorMessage);
    }
};

//将数据保存到 hashTable
export const storeFieldIntoHashTable = async (hashKey, field, data, callback?) => {
    let errorMessage = 'RedisManager.storeFieldIntoHashTable =>';
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        errorMessage += ' redis 客户端未连接';
        Logger.error(errorMessage);
        callback && callback(errorMessage);
        return Promise.reject(errorMessage);
    }
    try {
        await redisClient.hset(hashKey, field, JSON.stringify(data));
        callback && callback();
        return Promise.resolve();
    } catch (error) {
        errorMessage += '存储数据出错';
        Logger.error(errorMessage, error);
        callback && callback(errorMessage);
        return Promise.reject(errorMessage);
    }
};

/**
 * 如果给定的元素在集合中，则移除此元素
 * @return: 移除成功返回 移除的元素个数，移除失败或者元素不在集合中返回 0
 * */
export const delFromHashTable = async (hashKey, field) => {
    let errorMessage = 'RedisManager.delFromHashTable =>';
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        errorMessage += ' redis 客户端未连接';
        Logger.error(errorMessage);
        return Promise.reject(errorMessage);
    }
    if (!field) {
        errorMessage += `未指定域${field}`;
        Logger.error(errorMessage);
        return Promise.reject(errorMessage);
    }
    try {
        await redisClient.hdel(hashKey, field);
        return Promise.resolve();
    } catch (error) {
        errorMessage += `删除${hashKey}的 ${field} 域失败`;
        Logger.error(errorMessage, error);
        return Promise.reject(errorMessage);
    }
};

// 获取hashTable的
export const getHashTableKeys = async hashKey => {
    let errorMessage = 'RedisManager.getHashTableKeys =>';
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        errorMessage += ' redis 客户端未连接';
        Logger.error(errorMessage);
        return Promise.reject(errorMessage);
    }
    try {
        const keys = await redisClient.hkeys(hashKey);
        return Promise.resolve(keys);
    } catch (error) {
        errorMessage += `获取${hashKey}的所有域名失败`;
        Logger.error(errorMessage, error);
        return Promise.reject(errorMessage);
    }
};

/**
 * 把数据或者数据的数组存到 set 中
 * @param: valueOrArray 是需要存储的元素或者元素组成的数组
 * @return: error，出错时返回错误，成功时返回 null
 * */
export const storeInSet = async (hashKey: string, valueOrArray: any[] | any) => {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('redis 客户端未连接');
        return Promise.reject('redis 客户端未连接');
    }
    if (!Array.isArray(valueOrArray)) {
        valueOrArray = [valueOrArray];
    }
    let ret = await redisClient.sadd(hashKey, ...valueOrArray).catch(error => {
        if (error) {
            Logger.error(`RedisManager.storeInSet, 存储值${valueOrArray}的数据到${hashKey}的集合中出错: ${error.message}`);
            return Promise.reject(error.message);
        }
    });
    return ret;
};

// 移除并返回集合中的一个随机元素
export const spop = async setKey => {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('redis 客户端未连接');
        return;
    }
    return await redisClient.spop(setKey).catch(error => {
        Logger.error(`RedisManager.spop ==> setKey: ${setKey}, ${error.stack || error.message || error}`);
        return null;
    });
};

/**
 * 判断某个数据是否在集合中:
 * @return: 1表示存在，0表示不存在，出错时返回 0
 * */
export const isInSet = async (hashKey, value) => {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('redis 客户端未连接');
        return Promise.resolve(0);
    }
    return await redisClient.sismember(hashKey, value).catch(error => {
        Logger.error(`RedisManager.storeInSet, 判断${value}的数据是否在${hashKey}的集合中出错: ${error.message}`);
        return Promise.resolve(0);
    });
};

/**
 * 返回集合中的所有元素的值:
 * @return: 返回集合中所有元素组成的数组，出错时返回空数组
 * */
export const getAllFromSet = async function (hashKey, callback?) {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('redis 客户端未连接');
        callback && callback([]);
        return Promise.resolve([]);
    }
    try {
        const allMembers = await redisClient.smembers(hashKey);
        callback && callback(allMembers);
        return Promise.resolve(allMembers);
    } catch (error) {
        Logger.error(`RedisManager.storeInSet, 判断${hashKey}的数据是否在${hashKey}的集合中出错: ${error.message}`);
        callback && callback([]);
        return Promise.resolve([]);
    }
};

/**
 * 如果给定的元素在集合中，则移除此元素
 * return: 移除成功返回移除的元素个数，移除失败或者元素不在集合中返回 0
 * */
export const removeFromSet = async (hashKey, valueOrArray) => {
    let errorMessage = 'RedisManager.removeFromSet =>';
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        errorMessage += 'redis 客户端未连接';
        Logger.error(errorMessage);
        return Promise.reject(errorMessage);
    }
    if (!Array.isArray(valueOrArray)) {
        valueOrArray = [valueOrArray];
    }
    try {
        const removeCount = await redisClient.srem(hashKey, ...valueOrArray);
        return Promise.resolve(removeCount);
    } catch (error) {
        Logger.error(`${errorMessage}移除集合${hashKey}的值${valueOrArray}出错:`, error);
        return Promise.reject(errorMessage + '移除出错');
    }
};

//查询key的过期时间
export const queryTimepastDue = async (key) => {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('客户端未连接');
        return Promise.reject('客户端未连接');
    }
    try {
        const time = await redisClient.ttl(key);
        return Promise.resolve(time);
    } catch (error) {
        Logger.error('RedisManager.queryTimepastDue==>', error);
        return Promise.resolve(null);
    }
};

export const flushdb = async () => {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('客户端未连接');
        return Promise.reject('客户端未连接');
    }
    try {
        await redisClient.flushdb();
        return Promise.resolve();
    } catch (error) {
        Logger.error('RedisManager.flushdb==>', error);
        return Promise.resolve(null);
    }
};

// 将 key指向的数值 增加 increment
export const incrby = async (key: string | Buffer, increment) => {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('客户端未连接');
        return Promise.reject('客户端未连接');
    }
    try {
        const data = await redisClient.incrby(key, increment);
        return Promise.resolve(data);
    } catch (error) {
        Logger.error('RedisManager.incrby==>', error);
        return Promise.reject(error);
    }
};

/**
 * 添加到有序集合
 * @param key
 * @param score   排序数
 * @param value   值
 * @return 添加成功的新成员数量
 */
export const addSortedSet = async function (key: string, score: string, value: string): Promise<number | string> {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('客户端未连接');
        return Promise.reject('客户端未连接');
    }
    try {
        return await redisClient.zadd(key, score, value);
    } catch (error) {
        Logger.error('RedisManager.addSortedSet==>', error);
        return Promise.reject(error);
    }
};

/**查看集合的大小 */
export async function get_store_size(key: string) {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('客户端未连接');
        return Promise.reject('客户端未连接');
    }
    try {
        return await redisClient.scard(key);
    } catch (error) {
        Logger.error('RedisManager.get_store_size==>', error);
        return Promise.reject(error);
    }
}

/**
 * 删除有序集合的元素
 * @param key
 * @param value
 */
export const deleteSortedSetElement = async function (key: string, value: string): Promise<any> {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('客户端未连接');
        return Promise.reject('客户端未连接');
    }
    try {
        return await redisClient.zrem(key, value);
    } catch (error) {
        Logger.error('RedisManager.deleteSortedSetElement==>', error);
        return Promise.reject(error);
    }
};

/**
 * 获取有序集合的元素
 * @param key
 * @param start   其实下标
 * @param end     结束下标  默认为-1  -1为最后一个元素下标
 * @param withScores 显示分数
 */
export const getSortSetRange = async function (key: string, start: number, end: number = -1,
    withScores: boolean = false): Promise<any> {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('客户端未连接');
        return Promise.reject('客户端未连接');
    }
    try {
        return await redisClient.zrange(key, start, end);
    } catch (error) {
        Logger.error('RedisManager.getSortSetRange==>', error);
        return Promise.reject(error);
    }
};

/**
 * 获取有序结合的大小
 * @param key
 */
export const getSortSetSize = async function (key: string) {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('客户端未连接');
        return Promise.reject('客户端未连接');
    }
    try {
        return await redisClient.zcard(key);
    } catch (error) {
        Logger.error('RedisManager.getSortSetSize==>', error);
        return Promise.reject(error);
    }
};

/**
 * 移除指定区间所有成员
 * @param key
 * @param start
 * @param stop
 */
export const removeSortSetElement = async function (key: string, start: number, stop: number) {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('客户端未连接');
        return Promise.reject('客户端未连接');
    }
    try {
        return await redisClient.zremrangebyrank(key, start, stop);
    } catch (error) {
        Logger.error('RedisManager.removeSortSetElement==>', error);
        return Promise.reject(error);
    }
};

/**
 * key 是否存在
 * @param key
 */
export const exists = async (key: string) => {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('客户端未连接');
        return Promise.reject('客户端未连接');
    }
    try {
        return !!(await redisClient.exists(key));
    } catch (error) {
        Logger.error('RedisManager.exists==>', error);
        return Promise.reject(error);
    }
}

export async function disconnect() {
    let redis = await databaseService.getRedisClient()
    redis.disconnect();
}

export async function test_lua() {
    const redisClient = await databaseService.getRedisClient();
    redisClient.defineCommand('echo', {
        numberOfKeys: 2,
        lua: 'return {KEYS[1],KEYS[2],ARGV[1],ARGV[2]}'
    });
    redisClient.echo('k1', function (err, result) {
        console.log(err, result);
    });
    let result = await redisClient.script("return redis.call('get','hall:callCenter'");
    console.log(result);
}
