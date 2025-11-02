'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const DatabaseService = require("../app/services/databaseService");
const UserManager = require("../app/dao/domainManager/hall/userManager");
const dbMongo = require('../config/db/mongo.json');
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
async function test() {
    try {
        const users = await UserManager.findUserList({}, 'uid cellPhone ');
        for (let m of users) {
            let cellPhone = m.cellPhone;
            if (m.cellPhone && m.cellPhone.substring(0, 3) != '+86') {
                m.cellPhone = '+86' + m.cellPhone;
                await UserManager.updateOneUser(m, ['cellPhone']);
                console.log('更新电话号码', m.uid, cellPhone, m.cellPhone);
            }
        }
    }
    catch (error) {
        console.log('更改玩家的userinfo的电话好吗', error);
    }
}
test();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhbmdlVXNlckluZm8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi90b29scy9jaGFuZ2VVc2VySW5mby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBSWIsbUVBQW9FO0FBRXBFLHlFQUEwRTtBQU0xRSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUVuRCxlQUFlLENBQUMsY0FBYyxDQUFDO0lBQzNCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQ2hDLEtBQUssRUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUc7SUFDL0IsTUFBTSxFQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtDQUNuQyxDQUFDLENBQUM7QUFHSCxLQUFLLFVBQVUsSUFBSTtJQUNmLElBQUk7UUFDRCxNQUFNLEtBQUssR0FBRyxNQUFNLFdBQVcsQ0FBQyxZQUFZLENBQUMsRUFBRSxFQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDbEUsS0FBSSxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQUM7WUFDZCxJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBRTVCLElBQUcsQ0FBQyxDQUFDLFNBQVMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxFQUFDO2dCQUNsRCxDQUFDLENBQUMsU0FBUyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDO2dCQUNsQyxNQUFNLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQyxFQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQTtnQkFDaEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBQyxTQUFTLEVBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQ3JEO1NBQ0w7S0FFSDtJQUFDLE9BQU8sS0FBSyxFQUFFO1FBQ1osT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUM1QztBQUNMLENBQUM7QUFFRCxJQUFJLEVBQUUsQ0FBQyJ9