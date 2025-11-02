'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.setOffLineData = void 0;
const Player_manager_1 = require("../../common/dao/daoManager/Player.manager");
async function setOffLineData(uid) {
    try {
        await Player_manager_1.default.updateOne({ uid }, { kickedOutRoom: true, abnormalOffline: false });
    }
    catch (error) {
        console.log(error);
    }
}
exports.setOffLineData = setOffLineData;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2ZmTGluZVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9hcHAvc2VydmljZXMvaGFsbC9vZmZMaW5lU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7OztBQUNiLCtFQUEwRTtBQUluRSxLQUFLLFVBQVUsY0FBYyxDQUFDLEdBQVc7SUFDNUMsSUFBSTtRQUNBLE1BQU0sd0JBQWdCLENBQUMsU0FBUyxDQUFDLEVBQUMsR0FBRyxFQUFDLEVBQUUsRUFBQyxhQUFhLEVBQUMsSUFBSSxFQUFHLGVBQWUsRUFBRyxLQUFLLEVBQUMsQ0FBQyxDQUFDO0tBQzNGO0lBQUMsT0FBTyxLQUFLLEVBQUU7UUFDWixPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO0tBQ3JCO0FBQ0wsQ0FBQztBQU5ELHdDQU1DO0FBQUEsQ0FBQyJ9