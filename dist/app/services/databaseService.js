'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.initConnection = exports.getRedisClient = exports.createRedisConnection = exports.initRedisConnection = exports.initDBConnection = void 0;
const pinus_1 = require("pinus");
const Mongoose = require("mongoose");
const IORedis = require("ioredis");
const databaseConst = require("../consts/databaseConst");
const pinus_logger_1 = require("pinus-logger");
const Logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
const RedisConfig = require('../../config/db/redis.json');
const initDBConnection = async (mongoConfig) => {
    try {
        const serverType = pinus_1.pinus.app && pinus_1.pinus.app.getServerType();
        const dataClient = await initRedisConnection(serverType);
        pinus_1.pinus.app.set(databaseConst.REDIS_CLIENT_NAME.DATA, dataClient);
        return Promise.resolve();
    }
    catch (error) {
        return Promise.reject(error);
    }
};
exports.initDBConnection = initDBConnection;
async function initMongoConnection(serverType, mongoConfig) {
    return new Promise((resolve, reject) => {
        const mongoConnectError = `${serverType}: mongo 数据库连接失败:`;
        let uri = "mongodb://" + mongoConfig.host + ":" + mongoConfig.port + "/" + mongoConfig.name;
        if (mongoConfig.user) {
            uri = 'mongodb://' + mongoConfig.user + ':' + mongoConfig.pwd + '@' + mongoConfig.host + ":" + mongoConfig.port + "/" + mongoConfig.name;
        }
        console.warn("连接数据库地址", uri);
        Mongoose.connect(uri, {
            useNewUrlParser: true,
            poolSize: 10
        });
        Mongoose.connection.on('connected', err => {
            if (!err) {
                console.log(`${serverType}: mongo 数据库连接成功`);
                return resolve(1);
            }
            console.warn('数据库错误', JSON.stringify(err));
            Logger.error(mongoConnectError, err);
            return reject(mongoConnectError);
        });
        Mongoose.connection.on('error', err => {
            console.warn('数据库错误', JSON.stringify(err));
            Logger.error(mongoConnectError, err);
            return reject(mongoConnectError);
        });
    });
}
function initRedisConnection(serverType) {
    return new Promise((resolve, reject) => {
        let redisConnectError = `连接Redis失败:${serverType}:`;
        let opts = {
            host: RedisConfig.host,
            port: RedisConfig.port,
        };
        if (RedisConfig.password) {
            opts['password'] = RedisConfig.password;
        }
        const dataClient = new IORedis(opts);
        dataClient.on("error", error => {
            redisConnectError += '数据客户端';
            Logger.error(redisConnectError, error);
            return reject(redisConnectError);
        });
        dataClient.on('connect', () => {
            console.log(`${serverType}: Redis 数据客户端连接成功`);
            return resolve(dataClient);
        });
    });
}
exports.initRedisConnection = initRedisConnection;
let dataClient;
async function createRedisConnection() {
    let redisConnectError = `连接Redis失败:${pinus_1.pinus.app.getServerType()}:`;
    let opts = { host: RedisConfig.host, port: RedisConfig.port };
    if (RedisConfig.password) {
        opts['password'] = RedisConfig.password;
    }
    const dataClient = new IORedis(opts);
    dataClient.on("error", error => {
        redisConnectError += '数据客户端';
        return Promise.reject(redisConnectError);
    });
    dataClient.on('connect', () => { return dataClient; });
    return dataClient;
}
exports.createRedisConnection = createRedisConnection;
async function getRedisClient(clientType = databaseConst.REDIS_CLIENT_NAME.DATA) {
    return new Promise((resolve, reject) => {
        let opts = {
            host: RedisConfig.host,
            port: RedisConfig.port,
        };
        if (RedisConfig.password) {
            opts['password'] = RedisConfig.password;
        }
        if (!pinus_1.pinus.app) {
            if (dataClient) {
                return resolve(dataClient);
            }
            else {
                dataClient = new IORedis(opts);
                dataClient.on("error", error => {
                    Logger.error('连接Redis失败', error);
                    return;
                });
                dataClient.on('connect', () => {
                    return resolve(dataClient);
                });
            }
        }
        else {
            if (pinus_1.pinus.app.get(clientType)) {
                return resolve(pinus_1.pinus.app.get(clientType));
            }
            let getRedisClientInterval = setInterval(() => {
                if (pinus_1.pinus.app.get(clientType)) {
                    clearInterval(getRedisClientInterval);
                    getRedisClientInterval = null;
                    return resolve(pinus_1.pinus.app.get(clientType));
                }
            }, 1000);
        }
    });
}
exports.getRedisClient = getRedisClient;
const initConnection = async (mongoConfig) => {
    try {
        await initMongoConnection(null, mongoConfig);
    }
    catch (error) {
        console.log('initConnection 连接失败：', error);
    }
};
exports.initConnection = initConnection;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YWJhc2VTZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vYXBwL3NlcnZpY2VzL2RhdGFiYXNlU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUViLGlDQUE4QjtBQUM5QixxQ0FBc0M7QUFDdEMsbUNBQW9DO0FBQ3BDLHlEQUEwRDtBQUMxRCwrQ0FBeUM7QUFFekMsTUFBTSxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNuRCxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUluRCxNQUFNLGdCQUFnQixHQUFHLEtBQUssRUFBRSxXQUFXLEVBQUUsRUFBRTtJQUNwRCxJQUFJO1FBQ0YsTUFBTSxVQUFVLEdBQUcsYUFBSyxDQUFDLEdBQUcsSUFBSSxhQUFLLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBRTFELE1BQU0sVUFBVSxHQUFHLE1BQU0sbUJBQW1CLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDekQsYUFBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUVoRSxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUMxQjtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ2QsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQzlCO0FBQ0gsQ0FBQyxDQUFDO0FBWFcsUUFBQSxnQkFBZ0Isb0JBVzNCO0FBR0YsS0FBSyxVQUFVLG1CQUFtQixDQUFDLFVBQWtCLEVBQUUsV0FBVztJQUNoRSxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ3JDLE1BQU0saUJBQWlCLEdBQUcsR0FBRyxVQUFVLGtCQUFrQixDQUFDO1FBQzFELElB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