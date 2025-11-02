import * as redisManager from './redisManager';
// import * as Test from './testNameSpace';
/// <reference path="./Test.ts" />
// Test.a()
// const d: keyof Test = 'a';
// const a: keyof Test = 'a'

import databaseService = require('../../../../services/databaseService');
import * as IORedis from 'ioredis';
import {KeyType} from "ioredis";


export default class RedisMulti {
    keys: KeyType[];
    lockKey: string;
    redisClient: IORedis.Redis;

    static async getRedisMulti(...keys: KeyType[]): Promise<RedisMulti> {
        const optimisticLock = new RedisMulti();
        await optimisticLock.init(...keys);
        return optimisticLock;
    }

    /**
     * 初始化连接并监听接下来事务所需的key
     * @param keys
     */
    private async init(...keys: KeyType[]) {
        this.keys = keys;
        this.redisClient = await databaseService.getRedisClient();
        // 监听keys的变化
        await this.redisClient.watch(...keys);
    }

    /**
     * 开始事务
     * @return
     */
    public async start(): Promise<IORedis.Redis> {
        this.redisClient.multi();
        return this.redisClient;
    }

    /**
     * 取消事务
     */
    public async closeMulti(): Promise<void> {
        await this.redisClient.discard();
    }

    /**
     * 提交事务
     */
    public async end(): Promise<boolean> {
        let transaction: boolean;
        const reply = await this.redisClient.exec();

        console.warn('事务运行情况', reply);

        // 为null代表事务运行失败
        if (!reply) {
            transaction = false;
        } else {
            transaction = true;
        }

        return transaction;
    }
}