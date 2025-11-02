import { RDSClient } from "../../../app/common/dao/mysql/lib/RDSClient";
import dao from "../../../app/common/dao/daoManager/Player.manager";
import playerMysqlDao from "../../../app/common/dao/mysql/Player.mysql.dao";
import {describe, before, it} from "mocha";



describe("测试玩家 => Sp_Player ", function () {
    before("初始化连接池", async () => {
        await RDSClient.demoInit();
    });

    describe("Player 测试用例", () => {
        return;
        const testPlayer = {
            uid: "testAndy",
            thirdUid: "testAndy",
            nickname: "Andy",
            headurl: "head8"
        };

        it("查询", async () => {
            try {
                const p = await playerMysqlDao.findOne({ uid: testPlayer.uid });

                if (!p) {
                    await playerMysqlDao.insertOne(testPlayer);
                } else {
                    await playerMysqlDao.updateOne({ uid: testPlayer.uid }, { gold: 0 })
                }

            } catch (e) {
                console.error(e.stack);
            }
            return true;
        });
    });

    /* describe("RecordGeneralManager | 单测试玩家更新", () => {

        it("初始化测试玩家信息", async () => {
            const testPlayer = {
                uid: "testAndy",
                thirdUid: "testAndy",
                nickname: "Andy",
                headurl: "head8"
            };
            try {
                const p = await dao.findOne({ uid: testPlayer.uid });

                if (!p) {
                    await dao.insertOne(testPlayer);
                } else {
                    await dao.updateOne({ uid: testPlayer.uid }, {
                        gold: 0,
                        instantNetProfit: 0,
                        oneWin: 0,
                        dailyFlow: 0,
                        flowCount: 0,
                        maxBetGold: 0,
                    })
                }

                // console.log(p);
            } catch (e) {
                console.error(e.stack);
            }
            return true;

        });

        it("updateOneForRecordGeneral | 测试金币增加", async () => {
            const testPlayer = {
                uid: "testAndy",
                thirdUid: "testAndy",
                nickname: "Andy",
                headurl: "head8"
            };

            const partial = {
                instantNetProfit: 1,
                oneWin: 1,
                dailyFlow: 1,
                flowCount: 1,
                maxBetGold: 1,
                gold: 100
            };

            await dao.updateOneForRecordGeneral(testPlayer.uid, partial);

            const p = await playerRedisDao.findOne({ uid: testPlayer.uid });
            console.log("测试金币增加", p);

            return true;
        });

        it("updateOneForRecordGeneral | 测试金币减少", async () => {
            const testPlayer = {
                uid: "testAndy",
                thirdUid: "testAndy",
                nickname: "Andy",
                headurl: "head8"
            };

            const partial = {
                instantNetProfit: 2,
                oneWin: 2,
                dailyFlow: 2,
                flowCount: 2,
                maxBetGold: 2,
                gold: -50
            };

            await dao.updateOneForRecordGeneral(testPlayer.uid, partial);

            const p = await playerRedisDao.findOne({ uid: testPlayer.uid });
            console.log("测试金币减少", p);

            return true;
        });

        it("updateOneForRecordGeneral | 测试金币清0", async () => {
            const testPlayer = {
                uid: "testAndy",
                thirdUid: "testAndy",
                nickname: "Andy",
                headurl: "head8"
            };

            const partial = {
                instantNetProfit: 3,
                oneWin: 3,
                dailyFlow: 3,
                flowCount: 3,
                maxBetGold: 3,
                gold: -100
            };

            await dao.updateOneForRecordGeneral(testPlayer.uid, partial, true);

            const p = await playerRedisDao.findOne({ uid: testPlayer.uid });
            console.log("测试金币清0", p);

            return true;
        });
    }); */

    /* describe("RecordGeneralManager | 单测试玩家更新", async () => {

        it("初始化测试玩家信息", async () => {
            const testPlayer = {
                uid: "testAndy",
                thirdUid: "testAndy",
                nickname: "Andy",
                headurl: "head8"
            };
            try {
                const p = await dao.findOne({ uid: testPlayer.uid });

                if (!p) {
                    await dao.insertOne(testPlayer);
                } else {
                    await dao.updateOne({ uid: testPlayer.uid }, {
                        gold: 0,
                        instantNetProfit: 0,
                        oneWin: 0,
                        dailyFlow: 0,
                        flowCount: 0,
                        maxBetGold: 0,
                    })
                }

                // console.log(p);
            } catch (e) {
                console.error(e.stack);
            }
            return true;

        });

        it("RecordGeneralManager | 结算测试 | 盈利50", async () => {
            let res = await createPlayerRecordService()
                .setPlayerBaseInfo("testAndy", false, 0)
                .setGameInfo("81", 0, "001")
                .setGameRecordInfo(10, 10, 50, true)
                .setGameRoundInfo("1111", 20, -1)
                .addResult("11111")
                .sendToDB(1)
            console.log(res.gold);
            return true;
        });

        it("RecordGeneralManager | 结算测试 | 盈利20", async () => {
            let res = await createPlayerRecordService()
                .setPlayerBaseInfo("testAndy", false, 0)
                .setGameInfo("81", 0, "001")
                .setGameRecordInfo(10, 10, 20, true)
                .setGameRoundInfo("1111", 20, -1)
                .addResult("11111")
                .sendToDB(1)
            console.log(res.gold);
            return true;
        });

        it("RecordGeneralManager | 结算测试 | 盈利-500", async () => {
            let res = await createPlayerRecordService()
                .setPlayerBaseInfo("testAndy", false, 0)
                .setGameInfo("81", 0, "001")
                .setGameRecordInfo(10, 10, -500, true)
                .setGameRoundInfo("1111", 20, -1)
                .addResult("11111")
                .sendToDB(1)
            console.log(res.gold);
            return true;
        });
    }); */

    /* describe("third.service", () => {
        it("初始化测试玩家信息", async () => {
            const testPlayer = {
                uid: "testAndy",
                thirdUid: "testAndy",
                nickname: "Andy",
                headurl: "head8"
            };
            try {
                const p = await dao.findOne({ uid: testPlayer.uid });

                if (!p) {
                    await dao.insertOne(testPlayer);
                } else {
                    await dao.updateOne({ uid: testPlayer.uid }, {
                        instantNetProfit: 0,
                        dailyFlow: 0,
                        flowCount: 0,
                        maxBetGold: 0,

                        gold: 0,
                        oneWin: 0,
                        addDayRmb: 0,
                        oneAddRmb: 0,
                        addRmb: 0
                    })
                }

                // console.log(p);
            } catch (e) {
                console.error(e.stack);
            }
            return true;

        });

        it("third.service | updateOneForaddPlayerMoney", async () => {
            await dao.updateOneForaddPlayerMoney("testAndy", {
                gold: 500,
                oneAddRmb: 500,
                addRmb: 500,
                addDayRmb: 500
            });

            await dao.updateOneForaddPlayerMoney("testAndy", {
                gold: 600,
                oneAddRmb: 600,
                addRmb: 600,
                addDayRmb: 600
            });

            return true;
        })


    }) */

    describe("并行模拟", () => {
        it("初始化测试玩家信息", async () => {
            const testPlayer = {
                uid: "testAndy",
                thirdUid: "testAndy",
                nickname: "Andy",
                headurl: "head8"
            };
            try {
                const p = await dao.findOne({ uid: testPlayer.uid });

                if (!p) {
                    await dao.insertOne(testPlayer);
                } else {
                    await dao.updateOne({ uid: testPlayer.uid }, {
                        instantNetProfit: 0,
                        dailyFlow: 0,
                        flowCount: 0,
                        maxBetGold: 0,

                        gold: 0,
                        oneWin: 0,
                        addDayRmb: 0,
                        oneAddRmb: 0,
                        addRmb: 0
                    })
                }

                // console.log(p);
            } catch (e) {
                console.error(e.stack);
            }
            return true;

        });
    })
});
