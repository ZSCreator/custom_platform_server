'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../app/services/databaseService");
const MongoManager = require("../app/dao/dbManager/mongoManager");
const Utils = require("../app/utils");
const path = require("path");
const dbMongo = require('../config/db/mongo.json');
const fs = require("fs");
DatabaseService.initConnection({
    "host": '192.168.1.33',
    "port": 27017,
    "name": 'bobi_end',
});
async function statistic() {
    const PayInfo = MongoManager.getDao('pay_info');
    const PlayerInfo = MongoManager.getDao('player_info');
    const UserInfo = MongoManager.getDao('user_info');
    const allPlayer = await PlayerInfo.find({ isRobot: 0 }, 'uid nickname gold walletGold');
    let info = 'ID,手机号,昵称,持有金币数,钱包金币,充值总额';
    console.log("总共需要处理人数:", allPlayer.length);
    let cnt = 0;
    for (let player of allPlayer) {
        let uid = player.uid;
        let nickname = player.nickname;
        let gold = Utils.sum(player.gold, true);
        let walletGold = player.walletGold;
        let addRmb = 0;
        let user = await UserInfo.findOne({ uid }, 'cellPhone');
        let cellPhone = user ? "@" + user.cellPhone : '';
        let playerPayRecords = await PayInfo.find({ uid: uid }, 'total_fee');
        if (playerPayRecords.length != 0) {
            playerPayRecords.forEach(m => {
                addRmb += m.total_fee;
            });
        }
        info += "\r\n" + uid + "," + cellPhone + ',' + nickname + ',' + gold + ',' + walletGold + ',' + addRmb / 100;
        cnt++;
        console.log("当前处理:", cnt);
    }
    console.log('__dirname..', __dirname);
    let paths = path.resolve(__dirname, './data/');
    console.log('paths', paths);
    paths = paths + '/20181203_bobi.csv';
    fs.writeFile(paths, info, function (err) {
        console.log("文件生成地址：" + paths);
    });
}
statistic();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwb3J0UGxheWVyV2F0dGVyX2JvYmkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi90b29scy9leHBvcnRQbGF5ZXJXYXR0ZXJfYm9iaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBRWIsbUVBQW9FO0FBSXBFLGtFQUFtRTtBQUNuRSxzQ0FBdUM7QUFDdkMsNkJBQThCO0FBQzlCLE1BQU0sT0FBTyxHQUFHLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQ25ELHlCQUEwQjtBQUMxQixlQUFlLENBQUMsY0FBYyxDQUFDO0lBQzNCLE1BQU0sRUFBRSxjQUFjO0lBQ3RCLE1BQU0sRUFBRSxLQUFLO0lBQ2IsTUFBTSxFQUFFLFVBQVU7Q0FDckIsQ0FBQyxDQUFDO0FBRUgsS0FBSyxVQUFVLFNBQVM7SUFDcEIsTUFBTSxPQUFPLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNoRCxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3RELE1BQU0sUUFBUSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDbEQsTUFBTSxTQUFTLEdBQUcsTUFBTyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUMsT0FBTyxFQUFDLENBQUMsRUFBQyxFQUFDLDhCQUE4QixDQUFDLENBQUM7SUFDckYsSUFBSSxJQUFJLEdBQUUsMkJBQTJCLENBQUU7SUFDdkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQzFDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNaLEtBQUssSUFBSSxNQUFNLElBQUksU0FBUyxFQUFFO1FBQzFCLElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFDckIsSUFBSSxRQUFRLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztRQUMvQixJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDeEMsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztRQUNuQyxJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFDZixJQUFJLElBQUksR0FBRyxNQUFNLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBQyxHQUFHLEVBQUMsRUFBQyxXQUFXLENBQUMsQ0FBQztRQUNyRCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDL0MsSUFBSSxnQkFBZ0IsR0FBRyxNQUFNLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEVBQUMsV0FBVyxDQUFDLENBQUE7UUFDaEUsSUFBRyxnQkFBZ0IsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFDO1lBQzVCLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUEsRUFBRTtnQkFDcEIsTUFBTSxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDOUIsQ0FBQyxDQUFDLENBQUM7U0FDTjtRQUVELElBQUksSUFBSSxNQUFNLEdBQUcsR0FBRyxHQUFDLEdBQUcsR0FBRSxTQUFTLEdBQUMsR0FBRyxHQUFDLFFBQVEsR0FBQyxHQUFHLEdBQUMsSUFBSSxHQUFDLEdBQUcsR0FBRSxVQUFVLEdBQUcsR0FBRyxHQUFHLE1BQU0sR0FBQyxHQUFHLENBQUU7UUFDOUYsR0FBRyxFQUFFLENBQUM7UUFDTixPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBQyxHQUFHLENBQUMsQ0FBQztLQUM1QjtJQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3JDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQy9DLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRTVCLEtBQUssR0FBRyxLQUFLLEdBQUssb0JBQW9CLENBQUM7SUFDdkMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLFVBQVUsR0FBRztRQUNuQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNoQyxDQUFDLENBQUMsQ0FBQztBQUVQLENBQUM7QUFFRCxTQUFTLEVBQUUsQ0FBQyJ9