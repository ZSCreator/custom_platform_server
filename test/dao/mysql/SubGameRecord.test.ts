import { RDSClient } from "../../../app/common/dao/mysql/lib/RDSClient";
import { GameRecord } from "../../../app/common/dao/mysql/entity/GameRecord.entity";
import { getConnection } from "typeorm";
import * as moment from "moment";
import {describe, before, it} from "mocha";

describe("游戏记录表 | 分表", function () {

    before(async () => {
        await RDSClient.demoInit();
    });

    describe("定时任务首次启动时", async () => {

        /* it("检测当前游戏记录表", async () => {
            const list = await Dao.findList({});
            
            return Promise.resolve();
        }); */

        it("检测符合表备份的日期", async () => {
            return true;
            const record = await getConnection()
                .getRepository(GameRecord)
                .createQueryBuilder("gr")
                .orderBy("gr.createTimeDate")
                .getOne();

            if (record === null) return;

            const { createTimeDate } = record

            const datediff = moment().diff(createTimeDate, "day");

            if (datediff < 2) {
                console.log(`没有需要分表的数据`);
                return true;
            }

            const year = moment(createTimeDate).format("YYYY-MM-DD")

            const startTime = `${year} 00:00:00`;

            const endTime = `${year} 23:59:59`;

            await getConnection()
                .getRepository(GameRecord)
                .createQueryBuilder("gr")
                .where("gr.createTimedate BETWEEN :startTime AND :endTime", {
                    startTime,
                    endTime
                })
                .getManyAndCount();

            return true;
        });

        it("检测目标表是否存在", async () => {
            const res = await getConnection()
                .createQueryRunner()
                .query(`SELECT table_name FROM information_schema.TABLES WHERE table_name ='Sp_GameRecord';`);

            console.log(res.length);
            console = res;

            return true;
        });

        it("创建分表", async () => {
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

            // let sql2 = `SELECT table_name FROM information_schema.TABLES WHERE table_name ='Sp_GameRecord';`
            try {
                await getConnection()
                    .createQueryRunner()
                    .query(sql1);

            } catch (e) {
                // console.error(e.stack);
            }

            // console.log(res);

            return true;
        });

    });

});
