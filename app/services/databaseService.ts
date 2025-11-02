'use strict';

import { pinus } from "pinus";
import Mongoose = require('mongoose');
import IORedis = require("ioredis");
import databaseConst = require('../consts/databaseConst');
import { getLogger } from 'pinus-logger';

const Logger = getLogger('server_out', __filename);
const RedisConfig = require('../../config/db/redis.json');


/**初始化数据库连接 */
export const initDBConnection = async (mongoConfig) => {
  try {
    const serverType = pinus.app && pinus.app.getServerType();
    // await initMongoConnection(serverType, mongoConfig);
    const dataClient = await initRedisConnection(serverType);
    pinus.app.set(databaseConst.REDIS_CLIENT_NAME.DATA, dataClient);
    // pinus.app.set(databaseConst.REDIS_CLIENT_NAME.NOTICE, pubSubClient);
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};

/**建立到 mongo 数据库的连接 */
async function initMongoConnection(serverType: string, mongoConfig) {
  return new Promise((resolve, reject) => {
    const mongoConnectError = `${serverType}: mongo 数据库连接失败:`;
    let uri = "mongodb://" + mongoConfig.host + ":" + mongoConfig.port + "/" + mongoConfig.name;
    if (mongoConfig.user) {
      uri = 'mongodb://' + mongoConfig.user + ':' + mongoConfig.pwd + '@' + mongoConfig.host + ":" + mongoConfig.port + "/" + mongoConfig.name;
    }
    console.warn("连接数据库地址", uri);
    Mongoose.connect(uri, {
      useNewUrlParser: true,
      // auto_reconnect: true,
      // useUnifiedTopology: true,
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

/**建立到 redis 数据库的连接 */
export function initRedisConnection(serverType: string) {
  return new Promise((resolve, reject) => {
    let redisConnectError = `连接Redis失败:${serverType}:`;
    // 数据客户端
    let opts = {
      host: RedisConfig.host,
      port: RedisConfig.port,
      // password: RedisConfig.password
    }
    if (RedisConfig.password) {
      opts['password'] = RedisConfig.password
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

let dataClient: IORedis.Redis;

/**
 * 新建一个redis连接
 */
export async function createRedisConnection() {
  let  redisConnectError = `连接Redis失败:${pinus.app.getServerType()}:`;

  // 数据客户端
  let opts = {host: RedisConfig.host, port: RedisConfig.port};


  if (RedisConfig.password) {
    opts['password'] = RedisConfig.password
  }
  const dataClient = new IORedis(opts);
  dataClient.on("error", error => {
    redisConnectError += '数据客户端';
    return Promise.reject(redisConnectError);
  });

  dataClient.on('connect', () => {return dataClient});

  return dataClient;
}


/**获取指定类型的 Redis 客户端 */
export async function getRedisClient(clientType = databaseConst.REDIS_CLIENT_NAME.DATA): Promise<IORedis.Redis> {
  return new Promise((resolve, reject) => {
    let opts = {
      host: RedisConfig.host,
      port: RedisConfig.port,
      // password: RedisConfig.password
    }
    if (RedisConfig.password) {
      opts['password'] = RedisConfig.password
    }
    if (!pinus.app) {
      // console.log(dataClient, "0000")
      if (dataClient) {
        return resolve(dataClient);
      } else {
        // 数据客户端
        dataClient = new IORedis(opts);
        dataClient.on("error", error => {
          Logger.error('连接Redis失败', error);
          return;
        });
        dataClient.on('connect', () => {
          // console.log(dataClient, "1111")
          return resolve(dataClient);
        });
      }
    } else {
      if (pinus.app.get(clientType)) {
        return resolve(pinus.app.get(clientType));
      }
      let getRedisClientInterval = setInterval(() => {
        if (pinus.app.get(clientType)) {
          // 获取到之后清除 interval
          clearInterval(getRedisClientInterval);
          getRedisClientInterval = null;
          return resolve(pinus.app.get(clientType));
        }
      }, 1000);
    }
  });
}

/**测试时调用 */
export const initConnection = async (mongoConfig) => {
  try {
    await initMongoConnection(null, mongoConfig);
  } catch (error) {
    console.log('initConnection 连接失败：', error)
  }
};

