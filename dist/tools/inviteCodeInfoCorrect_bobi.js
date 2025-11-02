'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../app/services/databaseService");
const MongoManager = require("../app/dao/dbManager/mongoManager");
const dbMongo = require('../config/db/mongo.json');
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function statistic() {
    const InviteCodeInfo = MongoManager.getDao('invite_code_info');
    const PlayerInfo = MongoManager.getDao('player_info');
    const allPlayer = await PlayerInfo.find({ isRobot: 0 }, 'uid inviteCode');
    const allInvites = await InviteCodeInfo.find({}, 'uid firstDegree secondDegree thirdDegree inviteCode agentLevel');
    for (let player of allPlayer) {
        const inviteCode = player.inviteCode;
        const invite = allInvites.find(x => x.uid == player.uid);
        if (invite && inviteCode && !invite.secondDegree) {
            console.log('修正邀请码：uid,', player.uid, player.inviteCode);
            const selfInvite = allInvites.find(x => x.uid == player.uid);
            const superiorInvite = allInvites.find(x => x.inviteCode == player.inviteCode);
            if (!superiorInvite || !selfInvite) {
                continue;
            }
            let superior = superiorInvite.uid;
            let firstDegree = '';
            let secondDegree = '';
            let thirdDegree = '';
            console.log('superiorInvite', superiorInvite);
            if (selfInvite.agentLevel == 0 || selfInvite.agentLevel == 4) {
                thirdDegree = superiorInvite.uid;
                const playerThird = allPlayer.find(x => x.uid == thirdDegree);
                const playerThirdInvite = allInvites.find(x => x.uid == thirdDegree);
                const playerSecondInvite = allInvites.find(x => x.inviteCode == playerThird.inviteCode);
                secondDegree = playerSecondInvite.uid;
                const playerSecond = allPlayer.find(x => x.uid == secondDegree);
                const playerFirstInvite = allInvites.find(x => x.inviteCode == playerSecond.inviteCode);
                firstDegree = playerFirstInvite.uid;
            }
            else if (selfInvite.agentLevel == 3) {
                thirdDegree = player.uid;
                secondDegree = superiorInvite.uid;
                const playerSecond = allPlayer.find(x => x.uid == secondDegree);
                const playerFirstInvite = allInvites.find(x => x.inviteCode == playerSecond.inviteCode);
                firstDegree = playerFirstInvite.uid;
            }
            else if (selfInvite.agentLevel == 2) {
                secondDegree = player.uid;
                firstDegree = superiorInvite.uid;
            }
            ;
            console.log('player.uid', player.uid, firstDegree, thirdDegree, secondDegree, superior);
            await InviteCodeInfo.updateOne({ uid: player.uid }, { $set: { firstDegree, thirdDegree, secondDegree, superior } });
        }
    }
    console.log('邀请码的错误数据修正成功');
}
statistic();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW52aXRlQ29kZUluZm9Db3JyZWN0X2JvYmkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi90b29scy9pbnZpdGVDb2RlSW5mb0NvcnJlY3RfYm9iaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBRWIsbUVBQW9FO0FBR3BFLGtFQUFtRTtBQUluRSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUNuRCxlQUFlLENBQUMsY0FBYyxDQUFDO0lBQzNCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQ2hDLEtBQUssRUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUc7SUFDL0IsTUFBTSxFQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtDQUNuQyxDQUFDLENBQUM7QUFFSCxLQUFLLFVBQVUsU0FBUztJQUNwQixNQUFNLGNBQWMsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDL0QsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN0RCxNQUFNLFNBQVMsR0FBRyxNQUFNLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBQyxPQUFPLEVBQUMsQ0FBQyxFQUFDLEVBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUN0RSxNQUFNLFVBQVUsR0FBRyxNQUFNLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFDLGdFQUFnRSxDQUFDLENBQUM7SUFDbEgsS0FBSyxJQUFJLE1BQU0sSUFBSSxTQUFTLEVBQUU7UUFDMUIsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztRQUNyQyxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFD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