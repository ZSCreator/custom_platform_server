"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../../app/services/databaseService");
const RoyalAgentServices = require("../../app/services/thirdApi/http/service/royalAgentService");
const InfiniteAgentService = require("../../app/services/agent/infiniteAgentService");
const MongoManager = require("../../app/dao/dbManager/mongoManager");
const HallConst = require("../../app/consts/hallConst");
const Utils = require("../../app/utils");
const dbMongo = require('../../config/db/mongo.json');
const RedisManager = require('../../app/dao/dbManager/redisManager');
const GameRecord = MongoManager.getDao('game_record');
const PlayerInfo = MongoManager.getDao('player_info');
const DailyNetProfit = MongoManager.getDao('dailyNet_profit');
const DayQudaoProfitsInfo = MongoManager.getDao('day_qudao_profits_info');
const DayPlayerProfitsPayRecord = MongoManager.getDao('day_player_profits_pay_record');
DatabaseService.initConnection({
    "host": "127.0.0.1",
    "port": 27017,
    "name": "lobby"
});
async function statistic() {
    console.log('开始执行');
    try {
        console.log('开始执行,addQudaoProfits');
        const playerOfqudaoUid = await PlayerInfo.find({ isRobot: 0 }, 'uid');
        const dayTime = Date.now() - 5 * 60 * 60 * 1000;
        const startTime = Utils.zerotime(dayTime);
        const endTime = startTime + 24 * 60 * 60 * 1000;
        for (let item of playerOfqudaoUid) {
            const uid = item.uid;
            const players = await InfiniteAgentService.getSubordinates(uid, 'uid agentLevel', true, false);
            let list = [];
            players.forEach(m => {
                list.push(m.uid);
            });
            const info = await RoyalAgentServices.getDayAgentDateReport(startTime, endTime, uid, list);
            info.createTime = endTime - 60 * 60 * 1000;
            const dayPlayerGolds = await PlayerInfo.aggregate().match({ uid: { $in: list } })
                .group({ _id: {}, 'gold': { '$sum': '$gold.2' } });
            let allGolds = 0;
            if (dayPlayerGolds.length != 0) {
                allGolds = dayPlayerGolds[0].gold;
            }
            const gameTypeRecrod = await DailyNetProfit.aggregate().match({ uid: { $in: list }, createTime: { '$gt': startTime, '$lt': endTime } })
                .group({ _id: {}, 'caipiao': { '$sum': '$caipiao' }, 'puker': { '$sum': '$puker' }, 'dianwan': { '$sum': '$dianwan' }, 'liuhecai': { '$sum': '$liuhecai' }, 'zhenren': { '$sum': '$zhenren' } });
            const profitsRecord = await DayPlayerProfitsPayRecord.aggregate().match({ uid: { $in: list }, createTime: { '$gt': startTime, '$lt': endTime } })
                .group({ _id: {}, 'profits': { '$sum': '$profits' } });
            let nids = HallConst.ZENGSONG_NID_LIST;
            const gameRecord = await GameRecord.aggregate().match({ uid: { $in: list }, nid: { $in: nids }, createTime: { '$gt': startTime, '$lt': endTime } })
                .group({ _id: {}, 'profit': { '$sum': '$profit' } });
            let teamExhibit = 0;
            let profits = 0;
            if (gameTypeRecrod.length != 0) {
                teamExhibit = Utils.addTeamExhibit(gameTypeRecrod[0]);
            }
            if (profitsRecord.length != 0) {
                profits = profitsRecord[0].profits;
            }
            let lucksGold = 0;
            if (gameRecord.length != 0) {
                lucksGold = gameRecord[0].profit;
            }
            let gameInfo = {
                caipiao: 0,
                puker: 0,
                dianwan: 0,
                zhenren: 0,
                buyu: 0,
                liuhecai: 0,
            };
            if (gameTypeRecrod.length != 0) {
                gameInfo.caipiao = gameTypeRecrod[0].caipiao ? gameTypeRecrod[0].caipiao : 0;
                gameInfo.puker = gameTypeRecrod[0].puker ? gameTypeRecrod[0].puker : 0;
                gameInfo.dianwan = gameTypeRecrod[0].dianwan ? gameTypeRecrod[0].dianwan : 0;
                gameInfo.zhenren = gameTypeRecrod[0].zhenren ? gameTypeRecrod[0].zhenren : 0;
                gameInfo.liuhecai = gameTypeRecrod[0].liuhecai ? gameTypeRecrod[0].liuhecai : 0;
            }
            info.teamProfits = 0;
            info.teamExhibit = teamExhibit;
            info.nowPlayerGold = allGolds;
            info.gameTypeProfits = gameInfo;
            info.profits = profits;
            info.lucksGold = lucksGold;
            await DayQudaoProfitsInfo.create(info);
        }
        return Promise.resolve();
    }
    catch (error) {
        console.log('error,error');
    }
    console.log('結束,addQudaoProfits');
}
statistic();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0R2FtZVR5cGVGb3JXaW5JbnB1dEFuZFByb2ZpdHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy90aGlyZFRvb2xzL2dldEdhbWVUeXBlRm9yV2luSW5wdXRBbmRQcm9maXRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esc0VBQXVFO0FBQ3ZFLGlHQUFrRztBQUNsRyxzRkFBdUY7QUFHdkYscUVBQXNFO0FBQ3RFLHdEQUF3RDtBQUN4RCx5Q0FBeUM7QUFDekMsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFDdEQsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7QUFDckUsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUN0RCxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3RELE1BQU0sY0FBYyxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUM5RCxNQUFNLG1CQUFtQixHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsd0JBQXdCLENBQUMsQ0FBQztBQUMxRSxNQUFNLHlCQUF5QixHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsK0JBQStCLENBQUMsQ0FBQztBQUN2RixlQUFlLENBQUMsY0FBYyxDQUFDO0lBQzNCLE1BQU0sRUFBRSxXQUFXO0lBQ25CLE1BQU0sRUFBRSxLQUFLO0lBQ2IsTUFBTSxFQUFFLE9BQU87Q0FDbEIsQ0FBQyxDQUFDO0FBS0gsS0FBSyxVQUFVLFNBQVM7SUFDcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwQixJQUFJO1FBQ0EsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sZ0JBQWdCLEdBQUcsTUFBTSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxFQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xFLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7UUFDakQsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxQyxNQUFNLE9BQU8sR0FBRyxTQUFTLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2hELEtBQUksSUFBSSxJQUFJLElBQUksZ0JBQWdCLEVBQUM7WUFDN0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUNyQixNQUFNLE9BQU8sR0FBRyxNQUFNLG9CQUFvQixDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUMsZ0JBQWdCLEVBQUMsSUFBSSxFQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzVGLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztZQUNkLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBLEVBQUU7Z0JBQ2YsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDcEIsQ0FBQyxDQUFDLENBQUM7WUFDSCxNQUFNLElBQUksR0FBUyxNQUFNLGtCQUFrQixDQUFDLHFCQUFxQixDQUFDLFNBQVMsRUFBQyxPQUFPLEVBQUMsR0FBRyxFQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlGLElBQUksQ0FBQyxVQUFVLEdBQUcsT0FBTyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO1lBQzNDLE1BQVEsY0FBYyxHQUFHLE1BQVEsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDLEtBQUssQ0FBQyxFQUFDLEdBQUcsRUFBQyxFQUFDLEdBQUcsRUFBQyxJQUFJLEVBQUMsRUFBQyxDQUFDO2lCQUMxRSxLQUFLLENBQUMsRUFBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUMsRUFBQyxDQUFDLENBQUM7WUFDbkQsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFFO1lBQ2xCLElBQUcsY0FBYyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUU7Z0JBQzNCLFFBQVEsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO2FBQ3JDO1lBQ0QsTUFBTSxjQUFjLEdBQUcsTUFBTSxjQUFjLENBQUMsU0FBUyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUMsR0FBRyxFQUFDLEVBQUMsR0FBRyxFQUFDLElBQUksRUFBQyxFQUFDLFVBQVUsRUFBQyxFQUFDLEtBQUssRUFBQyxTQUFTLEVBQUMsS0FBSyxFQUFDLE9BQU8sRUFBQyxFQUFFLENBQUM7aUJBQ3RILEtBQUssQ0FBQyxFQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsU0FBUyxFQUFFLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBQyxFQUFDLE9BQU8sRUFBRSxFQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUMsRUFBQyxTQUFTLEVBQUUsRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFDLEVBQUMsVUFBVSxFQUFFLEVBQUMsTUFBTSxFQUFFLFdBQVcsRUFBQyxFQUFDLFNBQVMsRUFBRSxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUMsRUFBQyxDQUFDLENBQUM7WUFFckwsTUFBTSxhQUFhLEdBQUcsTUFBTSx5QkFBeUIsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBQyxHQUFHLEVBQUMsRUFBQyxHQUFHLEVBQUMsSUFBSSxFQUFDLEVBQUMsVUFBVSxFQUFDLEVBQUMsS0FBSyxFQUFDLFNBQVMsRUFBQyxLQUFLLEVBQUMsT0FBTyxFQUFDLEVBQUUsQ0FBQztpQkFDaEksS0FBSyxDQUFDLEVBQUMsR0FBRyxFQUFFLEVBQUUsRUFBQyxTQUFTLEVBQUUsRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFDLEVBQUMsQ0FBQyxDQUFDO1lBRXRELElBQUksSUFBSSxHQUFHLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQztZQUN2QyxNQUFNLFVBQVUsR0FBRyxNQUFNLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLEVBQUMsRUFBQyxHQUFHLEVBQUMsSUFBSSxFQUFDLEVBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxFQUFFLFVBQVUsRUFBRSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFLENBQUM7aUJBQ3pJLEtBQUssQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUV6RCxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7WUFFcEIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1lBQ2hCLElBQUcsY0FBYyxDQUFDLE1BQU0sSUFBSSxDQUFDLEVBQUM7Z0JBQzFCLFdBQVcsR0FBRyxLQUFLLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3pEO1lBQ0QsSUFBRyxhQUFhLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBQztnQkFDekIsT0FBTyxHQUFHLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7YUFDdEM7WUFFRCxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7WUFDbEIsSUFBRyxVQUFVLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBQztnQkFDdEIsU0FBUyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7YUFDcEM7WUFDRCxJQUFJLFFBQVEsR0FBRztnQkFDWCxPQUFPLEVBQUMsQ0FBQztnQkFDVCxLQUFLLEVBQUMsQ0FBQztnQkFDUCxPQUFPLEVBQUMsQ0FBQztnQkFDVCxPQUFPLEVBQUMsQ0FBQztnQkFDVCxJQUFJLEVBQUMsQ0FBQztnQkFDTixRQUFRLEVBQUMsQ0FBQzthQUNiLENBQUE7WUFDRCxJQUFHLGNBQWMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFDO2dCQUMxQixRQUFRLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0UsUUFBUSxDQUFDLEtBQUssR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZFLFFBQVEsQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUM3RSxRQUFRLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0UsUUFBUSxDQUFDLFFBQVEsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDbkY7WUFDRCxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztZQUNyQixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztZQUMvQixJQUFJLENBQUMsYUFBYSxHQUFJLFFBQVEsQ0FBQztZQUMvQixJQUFJLENBQUMsZUFBZSxHQUFHLFFBQVEsQ0FBQztZQUNoQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUN2QixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUMzQixNQUFNLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUMxQztRQUNELE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzVCO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0tBQzlCO0lBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQ3RDLENBQUM7QUFHRCxTQUFTLEVBQUUsQ0FBQyJ9