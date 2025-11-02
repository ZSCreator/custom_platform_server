import { RDSClient } from "../../../app/common/dao/mysql/lib/RDSClient";
import GameRedisDao from "../../../app/common/dao/redis/Game.redis.dao";
import PlayerManager from "../../../app/common/dao/daoManager/Player.manager";
import GameCommissionRedisDao from "../../../app/common/dao/redis/GameCommission.redis.dao";
import {describe, before, it, beforeEach, afterEach} from "mocha";



describe("轮子: 游戏记录测试 => ", () => {

    // console.log(__dirname);
    before(async () => {
        await RDSClient.demoInit();
    })


    describe(`游戏基础信息: gameManager `, async () => {

        let consoleResult = null;

        beforeEach(() => {
            consoleResult = null;
        });

        afterEach(() => {
            if (!!consoleResult) {
                console.log(consoleResult);
            }
        });

        it("redis: 判断游戏信息是否存在", async () => {
            const flag = await GameRedisDao.exits("81");
            consoleResult = `是否存在 ${flag}`;
            return flag;
        });
    })

    describe("玩家基础信息: player", async () => {
        let consoleResult = null;

        beforeEach(() => {
            consoleResult = null;
        });

        afterEach(() => {
            if (!!consoleResult) {
                console.log(consoleResult);
            }
        });

        it(`玩家信息是否存在,不存在则补充`, async () => {

            const p = await PlayerManager.findOne({ uid: "12345678" }, true);

            if (!p) {

                return await PlayerManager.insertOne({
                    uid: "12345678",
                    thirdUid: "12345678",
                    nickname: "Andy",
                    headurl: "head8",
                    gold: 200000
                });
            }

            return p;

        });
    });

    describe("红包扫雷 | 测试游戏记录", async () => {
        let consoleResult = null;

        beforeEach(() => {
            consoleResult = null;
        });

        afterEach(() => {
            if (!!consoleResult) {
                console.log(consoleResult);
            }
        });

        it("校验是否有配套的游戏抽利设置，若有则删除", async () => {
            /* const com = new GameCommissionInRedis({
                nid: "81",
                way: 4,
                targetCharacter: 3,
                bet: 0.05,
                win: 0.01,
                settle: 0
            });


            await GameCommissionRedisDao.insertOne(com); */

            const exits = await GameCommissionRedisDao.exits("81");

            if (exits) {
                await GameCommissionRedisDao.delete({ nid: "81" });

            }

            return 1;
        });


        /* it("模拟对局:红包扫雷 | 有抽利 | 有中雷抢包对局 | 下注(中雷) 100元 ，抢包50元", async () => {
            console.time("总耗时");

            const exits = await GameCommissionRedisDao.exits("81");

            if (!exits) {
                const com = new GameCommissionInRedis({
                    nid: "81",
                    way: 4,
                    targetCharacter: 3,
                    bet: 0.05,
                    win: 0.01,
                    settle: 0
                });
                await GameCommissionRedisDao.insertOne(com);
            }

            const t = new Date();
            const res = await RecordGeneralManager
                .setPlayerBaseInfo("12345678", false)
                .setGameInfo("81", 0, "001")
                .setStartTimeForGameRecord(t)
                .setEndTimeForGameRecord(t)
                .setGameRecordInfo(10000, 10000, 5000, false)
                .sendToDB(1);
            consoleResult = res;
            console.timeEnd("总耗时");
        }); */
    });

})
