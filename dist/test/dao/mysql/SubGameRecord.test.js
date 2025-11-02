"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../../app/common/dao/mysql/lib/RDSClient");
const GameRecord_entity_1 = require("../../../app/common/dao/mysql/entity/GameRecord.entity");
const typeorm_1 = require("typeorm");
const moment = require("moment");
const mocha_1 = require("mocha");
(0, mocha_1.describe)("游戏记录表 | 分表", function () {
    (0, mocha_1.before)(async () => {
        await RDSClient_1.RDSClient.demoInit();
    });
    (0, mocha_1.describe)("定时任务首次启动时", async () => {
        (0, mocha_1.it)("检测符合表备份的日期", async () => {
            return true;
            const record = await (0, typeorm_1.getConnection)()
                .getRepository(GameRecord_entity_1.GameRecord)
                .createQueryBuilder("gr")
                .orderBy("gr.createTimeDate")
                .getOne();
            if (record === null)
                return;
            const { createTimeDate } = record;
            const datediff = moment().diff(createTimeDate, "day");
            if (datediff < 2) {
                console.log(`没有需要分表的数据`);
                return true;
            }
            const year = moment(createTimeDate).format("YYYY-MM-DD");
            const startTime = `${year} 00:00:00`;
            const endTime = `${year} 23:59:59`;
            await (0, typeorm_1.getConnection)()
                .getRepository(GameRecord_entity_1.GameRecord)
                .createQueryBuilder("gr")
                .where("gr.createTimedate BETWEEN :startTime AND :endTime", {
                startTime,
                endTime
            })
                .getManyAndCount();
            return true;
        });
        (0, mocha_1.it)("检测目标表是否存在", async () => {
            const res = await (0, typeorm_1.getConnection)()
                .createQueryRunner()
                .query(`SELECT table_name FROM information_schema.TABLES WHERE table_name ='Sp_GameRecord';`);
            console.log(res.length);
            console = res;
            return true;
        });
        (0, mocha_1.it)("创建分表", async () => {
            const year = moment().format("YYYYMM");
            console.log(year);
            const tableName = `Sp_GameRecord_${year}`;
            console.log(tableName);
            const sql1 = `
            SET NAMES utf8mb4;

            SET FOREIGN_KEY_CHECKS = 0;

            CREATE TABLE IF NOT Exists ${tableName}  (
                id int(0) NOT NULL AUTO_INCREMENT,
                uid varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '游戏编号',
                thirdUid varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '第三方账号',
                gameName varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '游戏名字',
                groupRemark varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '租客的备注信息',
                game_id varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '游戏编号',
                sceneId int(0) NOT NULL COMMENT '场编号',
                roomId varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '房间编号',
                player_count_in_room int(0) NULL DEFAULT NULL COMMENT '在房间内的玩家数量',
                round_id varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '游戏该局编号',
                seat_num int(0) NULL DEFAULT NULL COMMENT '房间内座位号: 可为空',
                isDealer tinyint(0) NOT NULL DEFAULT 0 COMMENT '是否庄家: 0 关；1 开； 默认关',
                game_results varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT '' COMMENT '对局结果',
                gold int(0) NOT NULL DEFAULT 0 COMMENT '玩家此时金币携带量',
                input int(0) NOT NULL DEFAULT 0 COMMENT '下注额',
                validBet int(0) NOT NULL DEFAULT 0 COMMENT '有效下注额',
                profit int(0) NOT NULL DEFAULT 0 COMMENT '纯利',
                way int(0) NOT NULL DEFAULT 0 COMMENT '抽利方式',
                targetCharacter int(0) NOT NULL DEFAULT 0 COMMENT '抽利目标对象',
                bet_commission int(0) NOT NULL DEFAULT 0 COMMENT '下注佣金',
                win_commission int(0) NOT NULL DEFAULT 0 COMMENT '赢取佣金',
                settle_commission int(0) NOT NULL DEFAULT 0 COMMENT '结算佣金',
                multiple int(0) NOT NULL DEFAULT 0 COMMENT '盈利倍数',
                status int(0) NOT NULL DEFAULT 0 COMMENT '记录状态: 0 为生效；1 生效',
                game_order_id varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '订单编号',
                createTimeDate datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) COMMENT '创建时间',
                updateTime datetime(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6) COMMENT '最近修改时间',
                game_Records_live_result json NULL,
                PRIMARY KEY (id) USING BTREE,
                INDEX IDX_1f886d1e790f38a85aa23fbaae(game_order_id) USING BTREE,
                INDEX idx_uni_player_agent(uid, createTimeDate) USING BTREE
              ) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

              SET FOREIGN_KEY_CHECKS = 1;
            `;
            try {
                await (0, typeorm_1.getConnection)()
                    .createQueryRunner()
                    .query(sql1);
            }
            catch (e) {
            }
            return true;
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3ViR2FtZVJlY29yZC50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9kYW8vbXlzcWwvU3ViR2FtZVJlY29yZC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkVBQXdFO0FBQ3hFLDhGQUFvRjtBQUNwRixxQ0FBd0M7QUFDeEMsaUNBQWlDO0FBQ2pDLGlDQUEyQztBQUUzQyxJQUFBLGdCQUFRLEVBQUMsWUFBWSxFQUFFO0lBRW5CLElBQUEsY0FBTSxFQUFDLEtBQUssSUFBSSxFQUFFO1FBQ2QsTUFBTSxxQkFBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQy9CLENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBQSxnQkFBUSxFQUFDLFdBQVcsRUFBRSxLQUFLLElBQUksRUFBRTtRQVE3QixJQUFBLFVBQUUsRUFBQyxZQUFZLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDeEIsT0FBTyxJQUFJLENBQUM7WUFDWixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUEsdUJBQWEsR0FBRTtpQkFDL0IsYUFBYSxDQUFDLDhCQUFVLENBQUM7aUJBQ3pCLGtCQUFrQixDQUFDLElBQUksQ0FBQztpQkFDeEIsT0FBTyxDQUFDLG1CQUFtQixDQUFDO2lCQUM1QixNQUFNLEVBQUUsQ0FBQztZQUVkLElBQUksTUFBTSxLQUFLLElBQUk7Z0JBQUUsT0FBTztZQUU1QixNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsTUFBTSxDQUFBO1lBRWpDLE1BQU0sUUFBUSxHQUFHLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFdEQsSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFO2dCQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ3pCLE9BQU8sSUFBSSxDQUFDO2FBQ2Y7WUFFRCxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFBO1lBRXhELE1BQU0sU0FBUyxHQUFHLEdBQUcsSUFBSSxXQUFXLENBQUM7WUFFckMsTUFBTSxPQUFPLEdBQUcsR0FBRyxJQUFJLFdBQVcsQ0FBQztZQUVuQyxNQUFNLElBQUEsdUJBQWEsR0FBRTtpQkFDaEIsYUFBYSxDQUFDLDhCQUFVLENBQUM7aUJBQ3pCLGtCQUFrQixDQUFDLElBQUksQ0FBQztpQkFDeEIsS0FBSyxDQUFDLG1EQUFtRCxFQUFFO2dCQUN4RCxTQUFTO2dCQUNULE9BQU87YUFDVixDQUFDO2lCQUNELGVBQWUsRUFBRSxDQUFDO1lBRXZCLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBQSxVQUFFLEVBQUMsV0FBVyxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ3ZCLE1BQU0sR0FBRyxHQUFHLE1BQU0sSUFBQSx1QkFBYSxHQUFFO2lCQUM1QixpQkFBaUIsRUFBRTtpQkFDbkIsS0FBSyxDQUFDLHFGQUFxRixDQUFDLENBQUM7WUFFbEcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDeEIsT0FBTyxHQUFHLEdBQUcsQ0FBQztZQUVkLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBQSxVQUFFLEVBQUMsTUFBTSxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ2xCLE1BQU0sSUFBSSxHQUFHLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN2QyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2xCLE1BQU0sU0FBUyxHQUFHLGlCQUFpQixJQUFJLEVBQUUsQ0FBQztZQUMxQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZCLE1BQU0sSUFBSSxHQUFHOzs7Ozt5Q0FLZ0IsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7YUFtQ3JDLENBQUM7WUFHRixJQUFJO2dCQUNBLE1BQU0sSUFBQSx1QkFBYSxHQUFFO3FCQUNoQixpQkFBaUIsRUFBRTtxQkFDbkIsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBRXBCO1lBQUMsT0FBTyxDQUFDLEVBQUU7YUFFWDtZQUlELE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxDQUFDO0lBRVAsQ0FBQyxDQUFDLENBQUM7QUFFUCxDQUFDLENBQUMsQ0FBQyJ9