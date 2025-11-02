import { RDSClient } from "../../../app/common/dao/mysql/lib/RDSClient";
import PlayerMysqlDao from "../../../app/common/dao/mysql/Player.mysql.dao";
import PlayerManager from "../../../app/common/dao/daoManager/Player.manager";
import { getRedLockInstance } from "../../../app/common/dao/redis/lib/redisManager";
import RedisManager from "../../../app/common/dao/redis/lib/BaseRedisManager"
import {describe, before, afterEach} from "mocha";

describe("事务更新测试", function () {

    before(async () => {
        await RDSClient.demoInit();
        await getRedLockInstance();
        await Promise.all([
             RedisManager.getConnection(0),
             RedisManager.getConnection(1),
             RedisManager.getConnection(2)
        ])
        // await RedisManager.getConnection(0);
        // await RedisManager.getConnection(1);
        // await RedisManager.getConnection(2);
    });

    describe("单一事务", async () => {
        afterEach(async () => {
            const info = await PlayerMysqlDao.findOne({ uid: "12345678" });

            if (!!info) {
                await PlayerManager.delete({ uid: "12345678" });
            }

        });
    });

    describe("并行事务", async () => {

        afterEach(async () => {
            const info = await PlayerMysqlDao.findOne({ uid: "12345678" });

            if (!!info) {
                await PlayerManager.delete({ uid: "12345678" });
            }

        });
    });

    describe("连续事务: xiyouji", async () => {
        afterEach(async () => {
            const info = await PlayerMysqlDao.findOne({ uid: "12345678" });

            if (!!info) {
                await PlayerManager.delete({ uid: "12345678" });
            }
            return Promise.resolve()
        });
    });
});