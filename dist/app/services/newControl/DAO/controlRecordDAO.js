"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordsCount = exports.getRecords = exports.addRecord = exports.ControlRecordType = void 0;
const ControlRecord_entity_1 = require("../../../common/dao/mysql/entity/ControlRecord.entity");
const connectionManager_1 = require("../../../common/dao/mysql/lib/connectionManager");
var ControlRecordType;
(function (ControlRecordType) {
    ControlRecordType["PERSONAL"] = "1";
    ControlRecordType["TOTAL_PERSONAL"] = "2";
    ControlRecordType["SCENE"] = "3";
    ControlRecordType["BANKER"] = "4";
    ControlRecordType["LOCK_JACKPOT"] = "5";
    ControlRecordType["REMOVE_TOTAL_PERSONAL"] = "6";
    ControlRecordType["REMOVE_PERSONAL"] = "7";
    ControlRecordType["TENANT_GAME_SCENE"] = "8";
    ControlRecordType["REMOVE_TENANT_GAME_SCENE"] = "9";
    ControlRecordType["CHANGE_PLATFORM_KILL_RATE"] = "10";
    ControlRecordType["CHANGE_TENANT_KILL_RATE"] = "11";
})(ControlRecordType = exports.ControlRecordType || (exports.ControlRecordType = {}));
async function addRecord(params) {
    const repository = connectionManager_1.default.getConnection().getRepository(ControlRecord_entity_1.ControlRecord);
    const record = repository.create(params);
    await repository.save(record);
    return true;
}
exports.addRecord = addRecord;
async function getRecords(where, page, count, timeSort = -1) {
    if (Object.keys(where).length) {
        let str;
        if (where.uid && where.nid) {
            str = "record.uid = :uid AND record.game_id = :nid";
        }
        else if (where.uid) {
            str = "record.uid = :uid";
        }
        else {
            str = "record.game_id = :nid";
        }
        return connectionManager_1.default.getConnection()
            .getRepository(ControlRecord_entity_1.ControlRecord)
            .createQueryBuilder('record')
            .where(str, where)
            .orderBy({ "record.createTime": "DESC" })
            .skip(page * count)
            .take(count)
            .getManyAndCount();
    }
    return connectionManager_1.default.getConnection()
        .getRepository(ControlRecord_entity_1.ControlRecord)
        .createQueryBuilder('record')
        .orderBy({ "record.createTime": "DESC" })
        .skip(page * count)
        .take(count)
        .getManyAndCount();
}
exports.getRecords = getRecords;
async function recordsCount(where) {
    return connectionManager_1.default.getConnection()
        .getRepository(ControlRecord_entity_1.ControlRecord)
        .createQueryBuilder('record')
        .getCount();
}
exports.recordsCount = recordsCount;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udHJvbFJlY29yZERBTy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2aWNlcy9uZXdDb250cm9sL0RBTy9jb250cm9sUmVjb3JkREFPLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLGdHQUFvRjtBQUNwRix1RkFBZ0Y7QUFrQmhGLElBQVksaUJBWVg7QUFaRCxXQUFZLGlCQUFpQjtJQUN6QixtQ0FBYyxDQUFBO0lBQ2QseUNBQW9CLENBQUE7SUFDcEIsZ0NBQVcsQ0FBQTtJQUNYLGlDQUFZLENBQUE7SUFDWix1Q0FBa0IsQ0FBQTtJQUNsQixnREFBMkIsQ0FBQTtJQUMzQiwwQ0FBcUIsQ0FBQTtJQUNyQiw0Q0FBdUIsQ0FBQTtJQUN2QixtREFBOEIsQ0FBQTtJQUM5QixxREFBZ0MsQ0FBQTtJQUNoQyxtREFBOEIsQ0FBQTtBQUNsQyxDQUFDLEVBWlcsaUJBQWlCLEdBQWpCLHlCQUFpQixLQUFqQix5QkFBaUIsUUFZNUI7QUFtQk0sS0FBSyxVQUFVLFNBQVMsQ0FBQyxNQUFzQjtJQUNsRCxNQUFNLFVBQVUsR0FBRywyQkFBaUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxhQUFhLENBQUMsb0NBQWEsQ0FBQyxDQUFDO0lBQ2xGLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDekMsTUFBTSxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRTlCLE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUM7QUFORCw4QkFNQztBQVNNLEtBQUssVUFBVSxVQUFVLENBQUMsS0FBVSxFQUFFLElBQVksRUFBRSxLQUFhLEVBQUUsV0FBaUIsQ0FBQyxDQUFDO0lBQ3pGLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUU7UUFDM0IsSUFBSSxHQUFHLENBQUM7UUFDUixJQUFJLEtBQUssQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUN4QixHQUFHLEdBQUcsNkNBQTZDLENBQUM7U0FDdkQ7YUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDbEIsR0FBRyxHQUFHLG1CQUFtQixDQUFBO1NBQzVCO2FBQU07WUFDSCxHQUFHLEdBQUcsdUJBQXVCLENBQUE7U0FDaEM7UUFFRCxPQUFPLDJCQUFpQixDQUFDLGFBQWEsRUFBRTthQUNuQyxhQUFhLENBQUMsb0NBQWEsQ0FBQzthQUM1QixrQkFBa0IsQ0FBQyxRQUFRLENBQUM7YUFDNUIsS0FBSyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUM7YUFDakIsT0FBTyxDQUFDLEVBQUMsbUJBQW1CLEVBQUUsTUFBTSxFQUFDLENBQUM7YUFDdEMsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7YUFDbEIsSUFBSSxDQUFDLEtBQUssQ0FBQzthQUNYLGVBQWUsRUFBRSxDQUFDO0tBQzFCO0lBRUQsT0FBTywyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7U0FDbkMsYUFBYSxDQUFDLG9DQUFhLENBQUM7U0FDNUIsa0JBQWtCLENBQUMsUUFBUSxDQUFDO1NBQzVCLE9BQU8sQ0FBQyxFQUFDLG1CQUFtQixFQUFFLE1BQU0sRUFBQyxDQUFDO1NBQ3RDLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO1NBQ2xCLElBQUksQ0FBQyxLQUFLLENBQUM7U0FDWCxlQUFlLEVBQUUsQ0FBQztBQUMzQixDQUFDO0FBNUJELGdDQTRCQztBQU1NLEtBQUssVUFBVSxZQUFZLENBQUMsS0FBVTtJQUN6QyxPQUFRLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtTQUNwQyxhQUFhLENBQUMsb0NBQWEsQ0FBQztTQUM1QixrQkFBa0IsQ0FBQyxRQUFRLENBQUM7U0FDNUIsUUFBUSxFQUFFLENBQUM7QUFDcEIsQ0FBQztBQUxELG9DQUtDIn0=