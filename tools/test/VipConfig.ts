import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import ConnectionManager from "../../app/common/dao/mysql/lib/connectionManager";
import VipConfigMysqlDao from "../../app/common/dao/mysql/VipConfig.mysql.dao";
import * as moment from "moment";

async function run() {
    // await RDSClient.demoInit();
    /*  const sql = `
     CREATE TABLE Sp_VipBonusDetails  (
         id int(0) NOT NULL AUTO_INCREMENT,
         uid varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL COMMENT '玩家编号',
         level int(0) NULL DEFAULT 0 COMMENT 'vip等级',
         bonus int(0) NULL DEFAULT NULL COMMENT 'vip等级奖励',
         whetherToReceiveLeverBonus int(0) NULL DEFAULT 0 COMMENT '是否领取vip等级奖励 0 否 1 是',
         bonusForWeeks int(0) NULL DEFAULT NULL COMMENT '周签到奖励',
         bonusForWeeksLastDate datetime(0) NULL DEFAULT NULL COMMENT '最近一次周签到奖励时间',
         bonusForMonth int(0) NULL DEFAULT NULL COMMENT '月签到奖励',
         bonusForMonthLastDate datetime(0) NULL DEFAULT NULL COMMENT '最近一次月签到奖励时间',
         createDateTime datetime(0) NULL DEFAULT NULL COMMENT '创建时间',
         updateDateTime datetime(0) NULL DEFAULT NULL COMMENT '最近更新时间',
         PRIMARY KEY (id) USING BTREE
       ) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_bin ROW_FORMAT = Dynamic;
           `
 
     const res = await ConnectionManager.getConnection()
         .query(sql); */

    // const list = await VipConfigMysqlDao.findList({});

    // console.warn('结果', res);

    const level = 0;
    const addRmb = 80000;

    const list = [
        {
            "level": 0,
            "des": "vip等级0",
            "levelScore": 0,
            "bonus": 0,
            "bonusForWeeks": 0,
            "bonusForMonth": 0
        },
        {
            "level": 1,
            "des": "vip等级1",
            "levelScore": 500,
            "bonus": 0,
            "bonusForWeeks": 0,
            "bonusForMonth": 0
        },
        {
            "level": 2,
            "des": "vip等级2",
            "levelScore": 10000,
            "bonus": 10,
            "bonusForWeeks": 30,
            "bonusForMonth": 60
        },
        {
            "level": 3,
            "des": "vip等级3",
            "levelScore": 30000,
            "bonus": 15,
            "bonusForWeeks": 40,
            "bonusForMonth": 70
        },
        {
            "level": 4,
            "des": "vip等级4",
            "levelScore": 80000,
            "bonus": 20,
            "bonusForWeeks": 50,
            "bonusForMonth": 80
        },
        {
            "level": 5,
            "des": "vip等级5",
            "levelScore": 150000,
            "bonus": 25,
            "bonusForWeeks": 40,
            "bonusForMonth": 70
        },
        {
            "level": 6,
            "des": "vip等级6",
            "levelScore": 250000,
            "bonus": 30,
            "bonusForWeeks": 70,
            "bonusForMonth": 100
        },
        {
            "level": 7,
            "des": "vip等级7",
            "levelScore": 450000,
            "bonus": 35,
            "bonusForWeeks": 80,
            "bonusForMonth": 110
        },
        {
            "level": 8,
            "des": "vip等级8",
            "levelScore": 750000,
            "bonus": 40,
            "bonusForWeeks": 90,
            "bonusForMonth": 120
        },
        {
            "level": 9,
            "des": "vip等级9",
            "levelScore": 1150000,
            "bonus": 45,
            "bonusForWeeks": 100,
            "bonusForMonth": 130
        },
        {
            "level": 10,
            "des": "vip等级10",
            "levelScore": 1650000,
            "bonus": 45,
            "bonusForWeeks": 100,
            "bonusForMonth": 130
        },
        {
            "level": 11,
            "des": "vip等级11",
            "levelScore": 2350000,
            "bonus": 55,
            "bonusForWeeks": 120,
            "bonusForMonth": 150
        },
        {
            "level": 12,
            "des": "vip等级12",
            "levelScore": 3250000,
            "bonus": 60,
            "bonusForWeeks": 130,
            "bonusForMonth": 160
        },
        {
            "level": 13,
            "des": "vip等级13",
            "levelScore": 4350000,
            "bonus": 65,
            "bonusForWeeks": 140,
            "bonusForMonth": 170
        },
        {
            "level": 14,
            "des": "vip等级14",
            "levelScore": 5650000,
            "bonus": 70,
            "bonusForWeeks": 150,
            "bonusForMonth": 180
        },
        {
            "level": 15,
            "des": "vip等级15",
            "levelScore": 7150000,
            "bonus": 75,
            "bonusForWeeks": 160,
            "bonusForMonth": 190
        },
        {
            "level": 16,
            "des": "vip等级16",
            "levelScore": 8950000,
            "bonus": 80,
            "bonusForWeeks": 170,
            "bonusForMonth": 200
        },
        {
            "level": 17,
            "des": "vip等级17",
            "levelScore": 11050000,
            "bonus": 85,
            "bonusForWeeks": 180,
            "bonusForMonth": 210
        },
        {
            "level": 18,
            "des": "vip等级18",
            "levelScore": 13450000,
            "bonus": 90,
            "bonusForWeeks": 190,
            "bonusForMonth": 220
        },
        {
            "level": 19,
            "des": "vip等级19",
            "levelScore": 16150000,
            "bonus": 95,
            "bonusForWeeks": 200,
            "bonusForMonth": 230
        },
        {
            "level": 20,
            "des": "vip等级20",
            "levelScore": 19150000,
            "bonus": 100,
            "bonusForWeeks": 240,
            "bonusForMonth": 210
        }
    ];

    let lastlevelScore = 0;

    const l = list.reduce((res, info, idx) => {
        // 玩家若有初始等级
        /* if (idx < level) {
            return res;
        } */

        // 设置初始等级充值
        ///@ts-ignore
        /* if (level !== 0 && idx === level) {
            lastlevelScore = list[level - 1].levelScore;
        } */

        if (lastlevelScore === 0 && info.levelScore === 0) {
            return res;
        }

        res.push([lastlevelScore, info.levelScore]);

        lastlevelScore = info.levelScore

        return res;
    }, []);

    console.log(l);

    const idx = l.findIndex(info => addRmb >= info[0] && addRmb < info[1]);

    console.log(idx)

    if (idx > level) {
        const ll = list.slice(level + 1, idx + 1);
        // console.log(ll);
        const info = ll.reduce((result, info) => {
            result.level = info.level;
            result.bonus += info.bonus;
            result.bonusForWeeks += info.bonusForWeeks;
            result.bonusForMonth += info.bonusForMonth;

            return result;
        }, {
            level: 0,
            bonus: 0,
            bonusForWeeks: 0,
            bonusForMonth: 0,
        })

        console.log(info);
    }

    process.exit();
}

run();

async function dd() {
    await RDSClient.demoInit();
    const info = await VipConfigMysqlDao.findOne({ id: 2 });
    const start = moment(info.createDateTime).format("YYYY-MM-DD hh:mm:ss");
    console.log(start)
    const end = moment().format("YYYY-MM-DD hh:mm:ss");
    console.log(end);

    console.log(moment(end).diff(moment(start), "d"))
    process.exit();
}

// dd();