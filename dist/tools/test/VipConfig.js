"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const VipConfig_mysql_dao_1 = require("../../app/common/dao/mysql/VipConfig.mysql.dao");
const moment = require("moment");
async function run() {
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
        if (lastlevelScore === 0 && info.levelScore === 0) {
            return res;
        }
        res.push([lastlevelScore, info.levelScore]);
        lastlevelScore = info.levelScore;
        return res;
    }, []);
    console.log(l);
    const idx = l.findIndex(info => addRmb >= info[0] && addRmb < info[1]);
    console.log(idx);
    if (idx > level) {
        const ll = list.slice(level + 1, idx + 1);
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
        });
        console.log(info);
    }
    process.exit();
}
run();
async function dd() {
    await RDSClient_1.RDSClient.demoInit();
    const info = await VipConfig_mysql_dao_1.default.findOne({ id: 2 });
    const start = moment(info.createDateTime).format("YYYY-MM-DD hh:mm:ss");
    console.log(start);
    const end = moment().format("YYYY-MM-DD hh:mm:ss");
    console.log(end);
    console.log(moment(end).diff(moment(start), "d"));
    process.exit();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlwQ29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdG9vbHMvdGVzdC9WaXBDb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx3RUFBcUU7QUFFckUsd0ZBQStFO0FBQy9FLGlDQUFpQztBQUVqQyxLQUFLLFVBQVUsR0FBRztJQTBCZCxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDaEIsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDO0lBRXJCLE1BQU0sSUFBSSxHQUFHO1FBQ1Q7WUFDSSxPQUFPLEVBQUUsQ0FBQztZQUNWLEtBQUssRUFBRSxRQUFRO1lBQ2YsWUFBWSxFQUFFLENBQUM7WUFDZixPQUFPLEVBQUUsQ0FBQztZQUNWLGVBQWUsRUFBRSxDQUFDO1lBQ2xCLGVBQWUsRUFBRSxDQUFDO1NBQ3JCO1FBQ0Q7WUFDSSxPQUFPLEVBQUUsQ0FBQztZQUNWLEtBQUssRUFBRSxRQUFRO1lBQ2YsWUFBWSxFQUFFLEdBQUc7WUFDakIsT0FBTyxFQUFFLENBQUM7WUFDVixlQUFlLEVBQUUsQ0FBQztZQUNsQixlQUFlLEVBQUUsQ0FBQztTQUNyQjtRQUNEO1lBQ0ksT0FBTyxFQUFFLENBQUM7WUFDVixLQUFLLEVBQUUsUUFBUTtZQUNmLFlBQVksRUFBRSxLQUFLO1lBQ25CLE9BQU8sRUFBRSxFQUFFO1lBQ1gsZUFBZSxFQUFFLEVBQUU7WUFDbkIsZUFBZSxFQUFFLEVBQUU7U0FDdEI7UUFDRDtZQUNJLE9BQU8sRUFBRSxDQUFDO1lBQ1YsS0FBSyxFQUFFLFFBQVE7WUFDZixZQUFZLEVBQUUsS0FBSztZQUNuQixPQUFPLEVBQUUsRUFBRTtZQUNYLGVBQWUsRUFBRSxFQUFFO1lBQ25CLGVBQWUsRUFBRSxFQUFFO1NBQ3RCO1FBQ0Q7WUFDSSxPQUFPLEVBQUUsQ0FBQztZQUNWLEtBQUssRUFBRSxRQUFRO1lBQ2YsWUFBWSxFQUFFLEtBQUs7WUFDbkIsT0FBTyxFQUFFLEVBQUU7WUFDWCxlQUFlLEVBQUUsRUFB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