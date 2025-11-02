"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../../app/common/dao/mysql/lib/RDSClient");
const Player_manager_1 = require("../../../app/common/dao/daoManager/Player.manager");
const Player_mysql_dao_1 = require("../../../app/common/dao/mysql/Player.mysql.dao");
const mocha_1 = require("mocha");
(0, mocha_1.describe)("测试玩家 => Sp_Player ", function () {
    (0, mocha_1.before)("初始化连接池", async () => {
        await RDSClient_1.RDSClient.demoInit();
    });
    (0, mocha_1.describe)("Player 测试用例", () => {
        return;
        const testPlayer = {
            uid: "testAndy",
            thirdUid: "testAndy",
            nickname: "Andy",
            headurl: "head8"
        };
        (0, mocha_1.it)("查询", async () => {
            try {
                const p = await Player_mysql_dao_1.default.findOne({ uid: testPlayer.uid });
                if (!p) {
                    await Player_mysql_dao_1.default.insertOne(testPlayer);
                }
                else {
                    await Player_mysql_dao_1.default.updateOne({ uid: testPlayer.uid }, { gold: 0 });
                }
            }
            catch (e) {
                console.error(e.stack);
            }
            return true;
        });
    });
    (0, mocha_1.describe)("并行模拟", () => {
        (0, mocha_1.it)("初始化测试玩家信息", async () => {
            const testPlayer = {
                uid: "testAndy",
                thirdUid: "testAndy",
                nickname: "Andy",
                headurl: "head8"
            };
            try {
                const p = await Player_manager_1.default.findOne({ uid: testPlayer.uid });
                if (!p) {
                    await Player_manager_1.default.insertOne(testPlayer);
                }
                else {
                    await Player_manager_1.default.updateOne({ uid: testPlayer.uid }, {
                        instantNetProfit: 0,
                        dailyFlow: 0,
                        flowCount: 0,
                        maxBetGold: 0,
                        gold: 0,
                        oneWin: 0,
                        addDayRmb: 0,
                        oneAddRmb: 0,
                        addRmb: 0
                    });
                }
            }
            catch (e) {
                console.error(e.stack);
            }
            return true;
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L2Rhby9teXNxbC9QbGF5ZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJFQUF3RTtBQUN4RSxzRkFBb0U7QUFDcEUscUZBQTRFO0FBQzVFLGlDQUEyQztBQUkzQyxJQUFBLGdCQUFRLEVBQUMsb0JBQW9CLEVBQUU7SUFDM0IsSUFBQSxjQUFNLEVBQUMsUUFBUSxFQUFFLEtBQUssSUFBSSxFQUFFO1FBQ3hCLE1BQU0scUJBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMvQixDQUFDLENBQUMsQ0FBQztJQUVILElBQUEsZ0JBQVEsRUFBQyxhQUFhLEVBQUUsR0FBRyxFQUFFO1FBQ3pCLE9BQU87UUFDUCxNQUFNLFVBQVUsR0FBRztZQUNmLEdBQUcsRUFBRSxVQUFVO1lBQ2YsUUFBUSxFQUFFLFVBQVU7WUFDcEIsUUFBUSxFQUFFLE1BQU07WUFDaEIsT0FBTyxFQUFFLE9BQU87U0FDbkIsQ0FBQztRQUVGLElBQUEsVUFBRSxFQUFDLElBQUksRUFBRSxLQUFLLElBQUksRUFBRTtZQUNoQixJQUFJO2dCQUNBLE1BQU0sQ0FBQyxHQUFHLE1BQU0sMEJBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0JBRWhFLElBQUksQ0FBQyxDQUFDLEVBQUU7b0JBQ0osTUFBTSwwQkFBYyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztpQkFDOUM7cUJBQU07b0JBQ0gsTUFBTSwwQkFBYyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxVQUFVLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQTtpQkFDdkU7YUFFSjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzFCO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztJQThPSCxJQUFBLGdCQUFRLEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtRQUNsQixJQUFBLFVBQUUsRUFBQyxXQUFXLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDdkIsTUFBTSxVQUFVLEdBQUc7Z0JBQ2YsR0FBRyxFQUFFLFVBQVU7Z0JBQ2YsUUFBUSxFQUFFLFVBQVU7Z0JBQ3BCLFFBQVEsRUFBRSxNQUFNO2dCQUNoQixPQUFPLEVBQUUsT0FBTzthQUNuQixDQUFDO1lBQ0YsSUFBSTtnQkFDQSxNQUFNLENBQUMsR0FBRyxNQUFNLHdCQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO2dCQUVyRCxJQUFJLENBQUMsQ0FBQyxFQUFFO29CQUNKLE1BQU0sd0JBQUcsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7aUJBQ25DO3FCQUFNO29CQUNILE1BQU0sd0JBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLEVBQUUsVUFBVSxDQUFDLEdBQUcsRUFBRSxFQUFFO3dCQUN6QyxnQkFBZ0IsRUFBRSxDQUFDO3dCQUNuQixTQUFTLEVBQUUsQ0FBQzt3QkFDWixTQUFTLEVBQUUsQ0FBQzt3QkFDWixVQUFVLEVBQUUsQ0FBQzt3QkFFYixJQUFJLEVBQUUsQ0FBQzt3QkFDUCxNQUFNLEVBQUUsQ0FBQzt3QkFDVCxTQUFTLEVBQUUsQ0FBQzt3QkFDWixTQUFTLEVBQUUsQ0FBQzt3QkFDWixNQUFNLEVBQUUsQ0FBQztxQkFDWixDQUFDLENBQUE7aUJBQ0w7YUFHSjtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQzFCO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFFaEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUMsQ0FBQyxDQUFDIn0=