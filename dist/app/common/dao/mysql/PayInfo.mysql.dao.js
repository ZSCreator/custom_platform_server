"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ADao_abstract_1 = require("../ADao.abstract");
const PayInfo_entity_1 = require("./entity/PayInfo.entity");
const connectionManager_1 = require("../mysql/lib/connectionManager");
class PayInfoMysqlDao extends ADao_abstract_1.AbstractDao {
    async findList(parameter) {
        try {
            const list = await connectionManager_1.default.getConnection()
                .getRepository(PayInfo_entity_1.PayInfo)
                .find(parameter);
            return list;
        }
        catch (e) {
            return [];
        }
    }
    async findOne(parameter) {
        try {
            const payInfo = await connectionManager_1.default.getConnection()
                .getRepository(PayInfo_entity_1.PayInfo)
                .findOne(parameter);
            return payInfo;
        }
        catch (e) {
            return null;
        }
    }
    async insertOne(parameter) {
        try {
            const payInfoRepository = connectionManager_1.default.getConnection()
                .getRepository(PayInfo_entity_1.PayInfo);
            const p = payInfoRepository.create(parameter);
            return await payInfoRepository.save(p);
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    async updateOne(parameter, partialEntity) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(PayInfo_entity_1.PayInfo)
                .update(parameter, partialEntity);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async delete(parameter) {
        try {
            const { affected } = await connectionManager_1.default.getConnection()
                .getRepository(PayInfo_entity_1.PayInfo)
                .delete(parameter);
            return !!affected;
        }
        catch (e) {
            return false;
        }
    }
    async findListToLimit(page, limit, startTime, endTime) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection()
                .getRepository(PayInfo_entity_1.PayInfo)
                .createQueryBuilder("PayInfo")
                .where("PayInfo.createDate BETWEEN :start AND :end", { start: startTime, end: endTime })
                .orderBy("PayInfo.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            console.error(`查询充值记录出错 ${e.stack}`);
            return false;
        }
    }
    async findListToLimitByUid(uid, page, limit, startTime, endTime) {
        try {
            const [list, count] = await connectionManager_1.default.getConnection()
                .getRepository(PayInfo_entity_1.PayInfo)
                .createQueryBuilder("PayInfo")
                .where("PayInfo.fk_uid = :uid AND PayInfo.createDate BETWEEN :start AND :end", { uid, start: startTime, end: endTime })
                .orderBy("PayInfo.id", "DESC")
                .skip((page - 1) * limit)
                .take(limit)
                .getManyAndCount();
            return { list, count };
        }
        catch (e) {
            console.error(`查询充值记录出错 ${e.stack}`);
            return false;
        }
    }
    async todayAddTotal_fee(startTime, endTime) {
        try {
            const sql = `SELECT
                    IFNULL(payInfo.groupRemark,'无') AS agentName,					
					IFNULL(SUM(payInfo.total_fee),0) AS todayAddRmb
            FROM
                    Sp_PayInfo AS payInfo
            WHERE           
                 payInfo.createDate >= "${startTime}"
			AND  payInfo.createDate < "${endTime}"
             GROUP BY agentName`;
            const result = await connectionManager_1.default.getConnection(true).query(sql);
            return result;
        }
        catch (e) {
            return null;
        }
    }
    async todayAddTotal_fee_uid(groupRemarkList, startTime, endTime) {
        try {
            let list = [];
            groupRemarkList.forEach(x => {
                list.push(`"${x}"`);
            });
            const sql = `SELECT
                    IFNULL(payInfo.groupRemark,'无') AS agentName,					
					 payInfo.fk_uid AS uid,
					IFNULL(SUM(payInfo.total_fee),0) AS todayAddRmb
            FROM
                    Sp_PayInfo AS payInfo
            WHERE           
                 payInfo.createDate >= "${startTime}"
			AND  payInfo.createDate < "${endTime}"
			AND  payInfo.groupRemark in (${list})
             GROUP BY agentName , uid`;
            const result = await connectionManager_1.default.getConnection(true).query(sql);
            return result;
        }
        catch (e) {
            return null;
        }
    }
    async todayAddTotal_fee_groupRemark(groupRemark, startTime, endTime) {
        try {
            const sql = `SELECT
                    IFNULL(payInfo.groupRemark,'无') AS agentName,					
					IFNULL(SUM(payInfo.total_fee),0) AS todayAddRmb
            FROM
                    Sp_PayInfo AS payInfo
            WHERE           
                 payInfo.createDate >= "${startTime}"
			AND  payInfo.createDate < "${endTime}"
			AND  payInfo.groupRemark = "${groupRemark}"
             GROUP BY agentName`;
            const result = await connectionManager_1.default.getConnection(true).query(sql);
            return result;
        }
        catch (e) {
            return null;
        }
    }
    async distinctPlayer(startTime, endTime) {
        try {
            const sql = `SELECT
                    IFNULL(payInfo.groupRemark,'无') AS agentName,					
                    IFNULL(payInfo.fk_uid,'无') AS uid,					
					IFNULL(SUM(payInfo.total_fee),0) AS todayAddRmb
            FROM
                    Sp_PayInfo AS payInfo
            WHERE           
                 payInfo.createDate >= "${startTime}"
			AND  payInfo.createDate < "${endTime}"
              GROUP BY agentName,uid`;
            const result = await connectionManager_1.default.getConnection(true).query(sql);
            return result;
        }
        catch (e) {
            return null;
        }
    }
}
exports.default = new PayInfoMysqlDao();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGF5SW5mby5teXNxbC5kYW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9QYXlJbmZvLm15c3FsLmRhby50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9EQUErQztBQUMvQyw0REFBa0Q7QUFDbEQsc0VBQStEO0FBSS9ELE1BQU0sZUFBZ0IsU0FBUSwyQkFBb0I7SUFDOUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUE2QjtRQUN4QyxJQUFJO1lBQ0EsTUFBTSxJQUFJLEdBQUcsTUFBTSwyQkFBaUIsQ0FBQyxhQUFhLEVBQUU7aUJBQy9DLGFBQWEsQ0FBQyx3QkFBTyxDQUFDO2lCQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDckIsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxFQUFFLENBQUM7U0FDYjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQTZCO1FBQ3ZDLElBQUk7WUFDQSxNQUFNLE9BQU8sR0FBRyxNQUFNLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDbEQsYUFBYSxDQUFDLHdCQUFPLENBQUM7aUJBQ3RCLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUN4QixPQUFPLE9BQU8sQ0FBQztTQUNsQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxJQUFJLENBQUM7U0FDZjtJQUNMLENBQUM7SUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQTZCO1FBQ3pDLElBQUk7WUFDQSxNQUFNLGlCQUFpQixHQUFHLDJCQUFpQixDQUFDLGFBQWEsRUFBRTtpQkFDdEQsYUFBYSxDQUFDLHdCQUFPLENBQUMsQ0FBQztZQUU1QixNQUFNLENBQUMsR0FBRyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDOUMsT0FBTyxNQUFNLGlCQUFpQixDQUFDLElBQUksQ0FBQyxD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