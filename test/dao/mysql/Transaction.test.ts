import { RDSClient } from "../../../app/common/dao/mysql/lib/RDSClient";
import { Player } from "../../../app/common/dao/mysql/entity/Player.entity.js";
import { getConnection } from "typeorm";
import {describe, before, it} from "mocha";



describe("事务", function () {

    before("初始化连接池", async () => {
        await RDSClient.demoInit();
    });

    // 显式控制事务提交和回滚不可行
    describe("测试 createQueryRunner", () => {
        it("查询玩家，若没测创建测试号 | 初始金币 0", async () => {
            const queryRunner = getConnection().createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                // const p = await playerMysqlDao.findOneBySql({ thirdUid: "zzt1314134", groupRemark: "a5b08" })
                // console.log(p)

                const p = await queryRunner.manager.findOne(Player, { uid: "testAndy" });

                if (!p) {
                    console.log(`没有目标信息`);

                    const { generatedMaps } = await queryRunner.manager.insert(Player, {
                        uid: "testAndy",
                        thirdUid: "testAndy",
                        nickname: "Andy",
                        headurl: "head8"
                    });

                    console.log(generatedMaps[0]);
                } else {
                    console.log(`已有目标信息,初始化金币0`);

                    await queryRunner.manager.update(Player, {
                        uid: "testAndy"
                    }, {
                        gold: 0
                    });
                }

                await queryRunner.commitTransaction();
            } catch (e) {
                await queryRunner.rollbackTransaction();
                console.error(e.stack);
            }
            return true;
        });

        /* it("查询玩家并使金币累增1,确认 createQueryRunner 不会出现之前线上的70次后就阻塞", async () => {
            for (let i = 1; i <= 100; i++) {
                const queryRunner = getConnection().createQueryRunner();
                await queryRunner.connect();
                await queryRunner.startTransaction();
                try {
                    const p = await queryRunner.manager.findOne(Player, { uid: "testAndy" });

                    console.log(`第 ${i} 次 | 当前金币 ${p.gold} `);

                    await queryRunner.manager.update(Player, {
                        uid: "testAndy"
                    }, {
                        gold: p.gold + 1
                    });

                    await queryRunner.commitTransaction();

                } catch (e) {
                    await queryRunner.rollbackTransaction();
                    console.error(e.stack);
                } finally {
                    await queryRunner.release();
                }

            }

            return true;
        }); */

        it("查询玩家并使金币累增1 | 取余2 回滚", async () => {
            for (let i = 1; i <= 100; i++) {
                const queryRunner = getConnection().createQueryRunner();
                await queryRunner.connect();
                await queryRunner.startTransaction();
                try {
                    const p = await queryRunner.manager.findOne(Player, { uid: "testAndy" });

                    await queryRunner.manager.update(Player, {
                        uid: "testAndy"
                    }, {
                        gold: p.gold + 1
                    });

                    /** 人为回滚 */

                    if (i % 2 === 0) {
                        console.log(`第 ${i} 次 | 回滚 | 金币 ${p.gold}`);
                        await queryRunner.rollbackTransaction();

                    } else {
                        console.log(`第 ${i} 次 | 提交 | 金币 ${p.gold}`);
                        await queryRunner.commitTransaction();

                    }

                } catch (e) {
                    await queryRunner.rollbackTransaction();
                    console.error(e.stack);
                } finally {
                    await queryRunner.release();
                }

            }

            return true;
        });

    });

    describe("模拟人为回滚", () => {

        /* it("查询玩家，若没测创建测试号 | 初始金币 0", async () => {
            try {
                // const p = await playerMysqlDao.findOneBySql({ thirdUid: "zzt1314134", groupRemark: "a5b08" })
                // console.log(p)
                await getConnection().transaction(async entityManager => {

                    const p = await entityManager.findOne(Player, { uid: "testAndy" });

                    if (!p) {
                        console.log(`没有目标信息`);

                        const { generatedMaps } = await entityManager.insert(Player, {
                            uid: "testAndy",
                            thirdUid: "testAndy",
                            nickname: "Andy",
                            headurl: "head8"
                        });

                        console.log(generatedMaps[0]);
                    } else {
                        console.log(`已有目标信息,初始化金币0`);

                        await entityManager.update(Player, {
                            uid: "testAndy"
                        }, {
                            gold: 0
                        });
                    }

                });

            } catch (e) {
                console.error(e.stack);
            }
            return true;
        }); */

        /* it("查询玩家并使金币累增1", async () => {
            try {
                for (let i = 1; i <= 100; i++) {
                    await getConnection().transaction(async entityManager => {

                        const p = await entityManager.findOne(Player, { uid: "testAndy" });

                        await entityManager.update(Player, {
                            uid: "testAndy"
                        }, {
                            gold: p.gold + 1
                        });
                    });

                }

            } catch (e) {
                console.error(e.stack);
            }
            return true;
        }); */

        /*  it("查询玩家并使金币累增1 | 取余2 回滚", async () => {
             try {
                 for (let i = 1; i <= 100; i++) {
                     await getConnection().transaction(async entityManager => {
 
                         const p = await entityManager.findOne(Player, { uid: "testAndy" });
 
                         console.log(`第 ${i} 次 | 当前金币 ${p.gold} `);
 
                         await entityManager.update(Player, {
                             uid: "testAndy"
                         }, {
                             gold: p.gold + 1
                         });
 
                         if (i % 2 === 0) {
                             
                             throw "回滚";
                         }
                     });
 
                 }
 
             } catch (e) {
                 console.error(e.stack);
             }
             return true;
         }) */
    });
})
