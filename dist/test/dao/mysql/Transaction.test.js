"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../../app/common/dao/mysql/lib/RDSClient");
const Player_entity_js_1 = require("../../../app/common/dao/mysql/entity/Player.entity.js");
const typeorm_1 = require("typeorm");
const mocha_1 = require("mocha");
(0, mocha_1.describe)("事务", function () {
    (0, mocha_1.before)("初始化连接池", async () => {
        await RDSClient_1.RDSClient.demoInit();
    });
    (0, mocha_1.describe)("测试 createQueryRunner", () => {
        (0, mocha_1.it)("查询玩家，若没测创建测试号 | 初始金币 0", async () => {
            const queryRunner = (0, typeorm_1.getConnection)().createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                const p = await queryRunner.manager.findOne(Player_entity_js_1.Player, { uid: "testAndy" });
                if (!p) {
                    console.log(`没有目标信息`);
                    const { generatedMaps } = await queryRunner.manager.insert(Player_entity_js_1.Player, {
                        uid: "testAndy",
                        thirdUid: "testAndy",
                        nickname: "Andy",
                        headurl: "head8"
                    });
                    console.log(generatedMaps[0]);
                }
                else {
                    console.log(`已有目标信息,初始化金币0`);
                    await queryRunner.manager.update(Player_entity_js_1.Player, {
                        uid: "testAndy"
                    }, {
                        gold: 0
                    });
                }
                await queryRunner.commitTransaction();
            }
            catch (e) {
                await queryRunner.rollbackTransaction();
                console.error(e.stack);
            }
            return true;
        });
        (0, mocha_1.it)("查询玩家并使金币累增1 | 取余2 回滚", async () => {
            for (let i = 1; i <= 100; i++) {
                const queryRunner = (0, typeorm_1.getConnection)().createQueryRunner();
                await queryRunner.connect();
                await queryRunner.startTransaction();
                try {
                    const p = await queryRunner.manager.findOne(Player_entity_js_1.Player, { uid: "testAndy" });
                    await queryRunner.manager.update(Player_entity_js_1.Player, {
                        uid: "testAndy"
                    }, {
                        gold: p.gold + 1
                    });
                    if (i % 2 === 0) {
                        console.log(`第 ${i} 次 | 回滚 | 金币 ${p.gold}`);
                        await queryRunner.rollbackTransaction();
                    }
                    else {
                        console.log(`第 ${i} 次 | 提交 | 金币 ${p.gold}`);
                        await queryRunner.commitTransaction();
                    }
                }
                catch (e) {
                    await queryRunner.rollbackTransaction();
                    console.error(e.stack);
                }
                finally {
                    await queryRunner.release();
                }
            }
            return true;
        });
    });
    (0, mocha_1.describe)("模拟人为回滚", () => {
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHJhbnNhY3Rpb24udGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvZGFvL215c3FsL1RyYW5zYWN0aW9uLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyRUFBd0U7QUFDeEUsNEZBQStFO0FBQy9FLHFDQUF3QztBQUN4QyxpQ0FBMkM7QUFJM0MsSUFBQSxnQkFBUSxFQUFDLElBQUksRUFBRTtJQUVYLElBQUEsY0FBTSxFQUFDLFFBQVEsRUFBRSxLQUFLLElBQUksRUFBRTtRQUN4QixNQUFNLHFCQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDL0IsQ0FBQyxDQUFDLENBQUM7SUFHSCxJQUFBLGdCQUFRLEVBQUMsc0JBQXNCLEVBQUUsR0FBRyxFQUFFO1FBQ2xDLElBQUEsVUFBRSxFQUFDLHdCQUF3QixFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ3BDLE1BQU0sV0FBVyxHQUFHLElBQUEsdUJBQWEsR0FBRSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDeEQsTUFBTSxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDNUIsTUFBTSxXQUFXLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUNyQyxJQUFJO2dCQUlBLE1BQU0sQ0FBQyxHQUFHLE1BQU0sV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMseUJBQU0sRUFBRSxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDO2dCQUV6RSxJQUFJLENBQUMsQ0FBQyxFQUFFO29CQUNKLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBRXRCLE1BQU0sRUFBRSxhQUFhLEVBQUUsR0FBRyxNQUFNLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLHlCQUFNLEVBQUU7d0JBQy9ELEdBQUcsRUFBRSxVQUFVO3dCQUNmLFFBQVEsRUFBRSxVQUFVO3dCQUNwQixRQUFRLEVBQUUsTUFBTTt3QkFDaEIsT0FBTyxFQUFFLE9BQU87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