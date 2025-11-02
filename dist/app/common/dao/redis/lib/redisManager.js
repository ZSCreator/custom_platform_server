'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.test_lua = exports.disconnect = exports.exists = exports.removeSortSetElement = exports.getSortSetSize = exports.getSortSetRange = exports.deleteSortedSetElement = exports.get_store_size = exports.addSortedSet = exports.incrby = exports.flushdb = exports.queryTimepastDue = exports.removeFromSet = exports.getAllFromSet = exports.isInSet = exports.spop = exports.storeInSet = exports.getHashTableKeys = exports.delFromHashTable = exports.storeFieldIntoHashTable = exports.storeMultiFieldsIntoHashTable = exports.getHashTableObject = exports.getFromHashTable = exports.getListRange = exports.deleteListValue = exports.getListIndex = exports.lPush = exports.getAllValuesSatisfyPattern = exports.getKeysSatisfyPattern = exports.deleteKeyFromRedis = exports.getObjectFromRedis = exports.setObjectIntoRedisNoExpiration = exports.setObjectIntoRedisHasExpiration = exports.isLockValid = exports.unlock = exports.lock = exports.getRedLockInstance = void 0;
const Redlock = require("redlock");
const commonUtil = require("../../../../utils/lottery/commonUtil");
const LogService = require("../../../../services/common/logService");
const databaseService = require("../../../../services/databaseService");
const pinus_logger_1 = require("pinus-logger");
const BaseRedisManager_1 = require("../../redis/lib/BaseRedisManager");
const DBCfg_enum_1 = require("../config/DBCfg.enum");
const Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
let redLockInstance;
async function getRedLockInstance() {
    return new Promise(async (resolve, reject) => {
        if (redLockInstance) {
            return resolve(redLockInstance);
        }
        const redisClient = await BaseRedisManager_1.default.getConnection(DBCfg_enum_1.RedisDB.RuntimeData);
        redLockInstance = new Redlock([redisClient], {
            driftFactor: 0.01,
            retryCount: 100,
            retryDelay: 200,
            retryJitter: 200
        });
        redLockInstance.on('clientError', err => {
            Logger.error('clientError ==> A redis error has occurred:', err);
            return reject(redLockInstance);
        });
        return resolve(redLockInstance);
    });
}
exports.getRedLockInstance = getRedLockInstance;
const lock = async (key, ttl = 4000) => {
    let errorMessage = 'RedisManager.lock ==> 加锁失败';
    if (!key) {
        return Promise.reject(errorMessage + "请传入key");
    }
    try {
        const lockInstance = await getRedLockInstance();
        const lock = await lockInstance.lock('locks:' + key, ttl);
        LogService.logLockInfo(key, lock);
        return Promise.resolve(lock);
    }
    catch (error) {
        LogService.logLockInfo(key);
        return Promise.reject(errorMessage);
    }
};
exports.lock = lock;
const unlock = async (lock) => {
    let errorMessage = 'RedisManager.unlock ==> 解锁失败:';
    if (!lock) {
        return Promise.resolve();
    }
    try {
        await lock.unlock();
        return Promise.resolve();
    }
    catch (error) {
        Logger.error(errorMessage, error);
        return Promise.resolve();
    }
};
exports.unlock = unlock;
const isLockValid = async (lock, resourceKey) => {
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
    }
    catch (error) {
        Logger.error(errorMessage, error.stack);
        return false;
    }
};
exports.isLockValid = isLockValid;
const setObjectIntoRedisHasExpiration = async (key, value, expiration) => {
    let errorMessage = 'RedisManager.setObjectIntoRedisHasExpiration ==>';
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        errorMessage += 'redis 客户端未连接';
        Logger.error(errorMessage);
        return Promise.reject(errorMessage);
    }
    try {
        await redisClient.setex(key, expiration, JSON.stringify(value));
        return Promise.resolve();
    }
    catch (error) {
        Logger.error(errorMessage, key, error);
        errorMessage += '出错' + error.message;
        return Promise.reject(errorMessage);
    }
};
exports.setObjectIntoRedisHasExpiration = setObjectIntoRedisHasExpiration;
const setObjectIntoRedisNoExpiration = async (key, value) => {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('redis 客户端未连接');
        return Promise.resolve();
    }
    try {
        await redisClient.set(key, JSON.stringify(value));
        return Promise.resolve();
    }
    catch (error) {
        Logger.error('RedisManager.setObjectIntoRedisNoExpiration==>', key, error);
        return Promise.resolve();
    }
};
exports.setObjectIntoRedisNoExpiration = setObjectIntoRedisNoExpiration;
async function getObjectFromRedis(key, callback) {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('redis 客户端未连接');
        callback && callback(null, null);
        return Promise.resolve();
    }
    try {
        let value = await redisClient.get(key);
        if (typeof value === "string") {
            value = JSON.parse(value);
        }
        callback && callback(value);
        return Promise.resolve(value);
    }
    catch (error) {
        callback && callback(null, null);
        return Promise.resolve();
    }
}
exports.getObjectFromRedis = getObjectFromRedis;
;
const deleteKeyFromRedis = async (keys) => {
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
    }
    catch (error) {
        Logger.error(errorMessage, '删除失败');
        return Promise.reject('删除失败');
    }
};
exports.deleteKeyFromRedis = deleteKeyFromRedis;
const getKeysSatisfyPattern = async (keyPattern, callback) => {
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
    }
    catch (error) {
        Logger.error(errorMessage, '获取出错');
        callback && callback();
        return Promise.reject('获取出错');
    }
};
exports.getKeysSatisfyPattern = getKeysSatisfyPattern;
const getAllValuesSatisfyPattern = async function (keyPattern, callback) {
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
    }
    catch (error) {
        Logger.error('RedisManager.getAllValuesSatisfyPattern ==>', error);
        callback && callback([]);
        return Promise.resolve([]);
    }
};
exports.getAllValuesSatisfyPattern = getAllValuesSatisfyPattern;
const lPush = async function (listKey, max, value, expiration = 0, cb) {
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
        expiration && await redisClient.expire(listKey, expiration);
        cb && cb(null);
        return Promise.resolve(null);
    }
    catch (error) {
        Logger.error('RedisManager.lPush==>', error);
        return Promise.reject('push数据出错');
    }
};
exports.lPush = lPush;
const getListIndex = async function (listKey, index, callback) {
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
    }
    catch (error) {
        Logger.error('RedisManager.getListIndex ', error);
        callback && callback(null);
        return Promise.resolve(null);
    }
};
exports.getListIndex = getListIndex;
const deleteListValue = async function (listKey, count, value) {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('redis 客户端未连接');
        return Promise.resolve(null);
    }
    try {
        return await redisClient.lrem(listKey, count, value);
    }
    catch (error) {
        Logger.error('RedisManager.getListRange ==> ', error);
        return 0;
    }
};
exports.deleteListValue = deleteListValue;
const getListRange = async function (listKey, start, stop, callback) {
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
    }
    catch (error) {
        Logger.error('RedisManager.getListRange ==> ', error);
        callback && callback(null);
        return Promise.resolve(null);
    }
};
exports.getListRange = getListRange;
const getFromHashTable = async function (hashKey, field) {
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
        }
        else {
            data = await redisClient.hgetall(hashKey);
            const dataList = [];
            for (let key in data) {
                dataList.push(JSON.parse(data[key]));
            }
            return Promise.resolve(dataList);
        }
    }
    catch (error) {
        Logger.warn('RedisManager.getFromHashTable ==> ', hashKey, (error.stack || error));
        return Promise.resolve(null);
    }
};
exports.getFromHashTable = getFromHashTable;
const getHashTableObject = async (hashKey, field) => {
    const redisClient = await databaseService.getRedisClient();
    try {
        if (!redisClient) {
            throw 'redis 客户端未连接';
        }
        let data;
        if (!commonUtil.isNullOrUndefined(field)) {
            return JSON.parse(await redisClient.hget(hashKey, field));
        }
        else {
            data = await redisClient.hgetall(hashKey);
            for (let key in data) {
                data[key] = JSON.parse(data[key]);
            }
            return data;
        }
    }
    catch (error) {
        Logger.error('RedisManager.getFromHashTable ==>', error);
        return;
    }
};
exports.getHashTableObject = getHashTableObject;
const storeMultiFieldsIntoHashTable = async (hashKey, fieldAndData, callback) => {
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
    }
    catch (error) {
        errorMessage += '存储数据出错';
        Logger.error(errorMessage, error);
        callback && callback(errorMessage);
        return Promise.reject(errorMessage);
    }
};
exports.storeMultiFieldsIntoHashTable = storeMultiFieldsIntoHashTable;
const storeFieldIntoHashTable = async (hashKey, field, data, callback) => {
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
    }
    catch (error) {
        errorMessage += '存储数据出错';
        Logger.error(errorMessage, error);
        callback && callback(errorMessage);
        return Promise.reject(errorMessage);
    }
};
exports.storeFieldIntoHashTable = storeFieldIntoHashTable;
const delFromHashTable = async (hashKey, field) => {
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
    }
    catch (error) {
        errorMessage += `删除${hashKey}的 ${field} 域失败`;
        Logger.error(errorMessage, error);
        return Promise.reject(errorMessage);
    }
};
exports.delFromHashTable = delFromHashTable;
const getHashTableKeys = async (hashKey) => {
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
    }
    catch (error) {
        errorMessage += `获取${hashKey}的所有域名失败`;
        Logger.error(errorMessage, error);
        return Promise.reject(errorMessage);
    }
};
exports.getHashTableKeys = getHashTableKeys;
const storeInSet = async (hashKey, valueOrArray) => {
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
exports.storeInSet = storeInSet;
const spop = async (setKey) => {
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
exports.spop = spop;
const isInSet = async (hashKey, value) => {
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
exports.isInSet = isInSet;
const getAllFromSet = async function (hashKey, callback) {
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
    }
    catch (error) {
        Logger.error(`RedisManager.storeInSet, 判断${hashKey}的数据是否在${hashKey}的集合中出错: ${error.message}`);
        callback && callback([]);
        return Promise.resolve([]);
    }
};
exports.getAllFromSet = getAllFromSet;
const removeFromSet = async (hashKey, valueOrArray) => {
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
    }
    catch (error) {
        Logger.error(`${errorMessage}移除集合${hashKey}的值${valueOrArray}出错:`, error);
        return Promise.reject(errorMessage + '移除出错');
    }
};
exports.removeFromSet = removeFromSet;
const queryTimepastDue = async (key) => {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('客户端未连接');
        return Promise.reject('客户端未连接');
    }
    try {
        const time = await redisClient.ttl(key);
        return Promise.resolve(time);
    }
    catch (error) {
        Logger.error('RedisManager.queryTimepastDue==>', error);
        return Promise.resolve(null);
    }
};
exports.queryTimepastDue = queryTimepastDue;
const flushdb = async () => {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('客户端未连接');
        return Promise.reject('客户端未连接');
    }
    try {
        await redisClient.flushdb();
        return Promise.resolve();
    }
    catch (error) {
        Logger.error('RedisManager.flushdb==>', error);
        return Promise.resolve(null);
    }
};
exports.flushdb = flushdb;
const incrby = async (key, increment) => {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('客户端未连接');
        return Promise.reject('客户端未连接');
    }
    try {
        const data = await redisClient.incrby(key, increment);
        return Promise.resolve(data);
    }
    catch (error) {
        Logger.error('RedisManager.incrby==>', error);
        return Promise.reject(error);
    }
};
exports.incrby = incrby;
const addSortedSet = async function (key, score, value) {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('客户端未连接');
        return Promise.reject('客户端未连接');
    }
    try {
        return await redisClient.zadd(key, score, value);
    }
    catch (error) {
        Logger.error('RedisManager.addSortedSet==>', error);
        return Promise.reject(error);
    }
};
exports.addSortedSet = addSortedSet;
async function get_store_size(key) {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('客户端未连接');
        return Promise.reject('客户端未连接');
    }
    try {
        return await redisClient.scard(key);
    }
    catch (error) {
        Logger.error('RedisManager.get_store_size==>', error);
        return Promise.reject(error);
    }
}
exports.get_store_size = get_store_size;
const deleteSortedSetElement = async function (key, value) {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('客户端未连接');
        return Promise.reject('客户端未连接');
    }
    try {
        return await redisClient.zrem(key, value);
    }
    catch (error) {
        Logger.error('RedisManager.deleteSortedSetElement==>', error);
        return Promise.reject(error);
    }
};
exports.deleteSortedSetElement = deleteSortedSetElement;
const getSortSetRange = async function (key, start, end = -1, withScores = false) {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('客户端未连接');
        return Promise.reject('客户端未连接');
    }
    try {
        return await redisClient.zrange(key, start, end);
    }
    catch (error) {
        Logger.error('RedisManager.getSortSetRange==>', error);
        return Promise.reject(error);
    }
};
exports.getSortSetRange = getSortSetRange;
const getSortSetSize = async function (key) {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('客户端未连接');
        return Promise.reject('客户端未连接');
    }
    try {
        return await redisClient.zcard(key);
    }
    catch (error) {
        Logger.error('RedisManager.getSortSetSize==>', error);
        return Promise.reject(error);
    }
};
exports.getSortSetSize = getSortSetSize;
const removeSortSetElement = async function (key, start, stop) {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('客户端未连接');
        return Promise.reject('客户端未连接');
    }
    try {
        return await redisClient.zremrangebyrank(key, start, stop);
    }
    catch (error) {
        Logger.error('RedisManager.removeSortSetElement==>', error);
        return Promise.reject(error);
    }
};
exports.removeSortSetElement = removeSortSetElement;
const exists = async (key) => {
    const redisClient = await databaseService.getRedisClient();
    if (!redisClient) {
        Logger.error('客户端未连接');
        return Promise.reject('客户端未连接');
    }
    try {
        return !!(await redisClient.exists(key));
    }
    catch (error) {
        Logger.error('RedisManager.exists==>', error);
        return Promise.reject(error);
    }
};
exports.exists = exists;
async function disconnect() {
    let redis = await databaseService.getRedisClient();
    redis.disconnect();
}
exports.disconnect = disconnect;
async function test_lua() {
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
exports.test_lua = test_lua;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVkaXNNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vYXBwL2NvbW1vbi9kYW8vcmVkaXMvbGliL3JlZGlzTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQWViLG1DQUFvQztBQUVwQyxtRUFBbUU7QUFFbkUscUVBQXNFO0FBQ3RFLHdFQUF5RTtBQUN6RSwrQ0FBeUM7QUFDekMsdUVBQTREO0FBQzVELHFEQUErQztBQUMvQyxNQUFNLE1BQU0sR0FBRyxJQUFBLHdCQUFTLEVBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBR25ELElBQUksZUFBd0IsQ0FBQztBQUd0QixLQUFLLFVBQVUsa0JBQWtCO0lBQ3BDLE9BQU8sSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUN6QyxJQUFJLGVBQWUsRUFBRTtZQUNqQixPQUFPLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztTQUNuQztRQUlELE1BQU0sV0FBVyxHQUFHLE1BQU0sMEJBQVksQ0FBQyxhQUFhLENBQUMsb0JBQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUUxRSxlQUFlLEdBQUcsSUFBSSxPQUFPLENBR3pCLENBQUMsV0FBVyxDQUFDLEVBQUU7WUFHZixXQUFXLEVBQUUsSUFBSTtZQUdqQixVQUFVLEVBQUUsR0FBRztZQUdmLFVBQVUsRUFBRSxHQUFHO1lBS2YsV0FBVyxFQUFFLEdBQUc7U0FDbkIsQ0FDQSxDQUFDO1FBRUYsZUFBZSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsR0FBRyxDQUFDLEVBQUU7WUFDcEMsTUFBTSxDQUFDLEtBQUssQ0FBQyw2Q0FBNkMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNqRSxPQUFPLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNuQyxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sT0FBTyxDQUFDLGVBQWUsQ0FBQyxD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