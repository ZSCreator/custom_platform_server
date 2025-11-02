"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const Utils = require("../../app/utils");
const Player_manager_1 = require("../../app/common/dao/daoManager/Player.manager");
const GameRecordDateTable_mysql_dao_1 = require("../../app/common/dao/mysql/GameRecordDateTable.mysql.dao");
async function ss() {
    await RDSClient_1.RDSClient.demoInit();
    console.warn(`脚本充值给玩家充值开始`);
    try {
        let uid = "xxxxxxx";
        let orderPrice = 0;
        if (orderPrice > 100000) {
            return;
            process.exit();
        }
        const player = await Player_manager_1.default.findOne({ uid });
        if (!player) {
            return;
            process.exit();
        }
        let gold = orderPrice * 100;
        let withdrawalChips = 0;
        if (player.withdrawalChips >= 0) {
            withdrawalChips = Math.floor(player.withdrawalChips + gold);
        }
        else if (player.withdrawalChips < 0) {
            withdrawalChips = Math.floor(gold);
        }
        const gameInfo = {
            uid: player.uid,
            nid: "t1",
            gameName: "脚本补发",
            groupRemark: player.groupRemark,
            thirdUid: player.thirdUid,
            group_id: player.group_id ? player.group_id : null,
            sceneId: -1,
            roomId: '-1',
            input: 0,
            bet_commission: 0,
            win_commission: 0,
            settle_commission: 0,
            profit: gold,
            gold: Math.ceil(player.gold + gold),
            status: 1,
            gameOrder: Utils.id(),
        };
        await GameRecordDateTable_mysql_dao_1.default.insertOne(gameInfo);
        await Player_manager_1.default.updateOneForaddPlayerMoney(player.uid, {
            gold: gold,
            withdrawalChips: withdrawalChips,
            oneAddRmb: Math.floor(player.oneAddRmb + gold),
            addRmb: Math.floor(player.addRmb + gold),
            addDayRmb: Math.floor(player.addDayRmb + gold)
        });
        console.warn(`脚本充值给玩家uid:${uid}, 充值金额${orderPrice},充值完成`);
        process.exit();
    }
    catch (e) {
        process.exit();
        return;
    }
}
setTimeout(ss, 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWRkUGxheWVyR29sZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rvb2xzL3Rlc3QvYWRkUGxheWVyR29sZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHdFQUFxRTtBQUNyRSx5Q0FBeUM7QUFDekMsbUZBQThFO0FBSTlFLDRHQUFtRztBQUluRyxLQUFLLFVBQVUsRUFBRTtJQUNiLE1BQU0scUJBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBRTNCLElBQUk7UUFFQSxJQUFJLEdBQUcsR0FBRyxTQUFTLENBQUM7UUFFcEIsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBRW5CLElBQUcsVUFBVSxHQUFHLE1BQU0sRUFBQztZQUNuQixPQUFRO1lBQ1IsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ2xCO1FBRUQsTUFBTSxNQUFNLEdBQUcsTUFBTSx3QkFBZ0IsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDVCxPQUFRO1lBQ1IsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ2xCO1FBQ0QsSUFBSSxJQUFJLEdBQUcsVUFBVSxHQUFHLEdBQUcsQ0FBQztRQUU1QixJQUFJLGVBQWUsR0FBRyxDQUFDLENBQUM7UUFDeEIsSUFBSSxNQUFNLENBQUMsZUFBZSxJQUFJLENBQUMsRUFBRTtZQUM3QixlQUFlLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxDQUFDO1NBQy9EO2FBQU0sSUFBSSxNQUFNLENBQUMsZUFBZSxHQUFHLENBQUMsRUFBRTtZQUNuQyxlQUFlLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUN0QztRQW9CRCxNQUFNLFFBQVEsR0FBRztZQUNiLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRztZQUNmLEdBQUcsRUFBRSxJQUFJO1lBQ1QsUUFBUSxFQUFFLE1BQU07WUFDaEIsV0FBVyxFQUFFLE1BQU0sQ0FBQyxXQUFXO1lBQy9CLFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUTtZQUN6QixRQUFRLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSTtZQUNsRCxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ1gsTUFBTSxFQUFFLElBQUk7WUFDWixLQUFLLEVBQUUsQ0FBQztZQUNSLGNBQWMsRUFBRSxDQUFDO1lBQ2pCLGNBQWMsRUFBRSxDQUFDO1lBQ2pCLGlCQUFpQixFQUFFLENBQUM7WUFDcEIsTUFBTSxFQUFFLElBQUk7WUFDWixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztZQUNuQyxNQUFNLEVBQUUsQ0FBQztZQUNULFNBQVMsRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFO1NBQ3hCLENBQUM7UUFFRixNQUFNLHVDQUEyQixDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUd0RCxNQUFNLHdCQUFnQixDQUFDLDBCQUEwQixDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUU7WUFDMUQsSUFBSSxFQUFFLElBQUk7WUFDVixlQUFlLEVBQUUsZUFBZTtZQUNoQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUM5QyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztZQUN4QyxTQUFTLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztTQUVqRCxDQUFDLENBQUM7UUFFSCxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsR0FBRyxTQUFTLFVBQVUsT0FBTyxDQUFDLENBQUM7UUFDMUQsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ2xCO0lBQUEsT0FBTyxDQUFDLEVBQUU7UUFDUCxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDZixPQUFPO0tBQ1Y7QUFJTCxDQUFDO0FBRUQsVUFBVSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyJ9