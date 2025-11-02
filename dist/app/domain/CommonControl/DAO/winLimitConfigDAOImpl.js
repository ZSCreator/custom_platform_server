"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SlotsWinLimit_entity_1 = require("../../../common/dao/mysql/entity/SlotsWinLimit.entity");
const redisConnection_1 = require("../../../common/dao/redis/lib/redisConnection");
const connectionManager_1 = require("../../../common/dao/mysql/lib/connectionManager");
class SlotWinLimitDAO {
    constructor() {
        this.model = null;
        this.CacheKey = 'control:gameWinLimitConfig';
    }
    static getInstance() {
        if (SlotWinLimitDAO.instance === null) {
            SlotWinLimitDAO.instance = new SlotWinLimitDAO();
        }
        return SlotWinLimitDAO.instance;
    }
    init() {
        if (!this.model) {
            this.model = connectionManager_1.default.getConnection().getRepository(SlotsWinLimit_entity_1.SlotsWinLimit);
        }
    }
    async create(params) {
        this.init();
        const config = this.model.create(params);
        await this.model.save(config);
        return true;
    }
    async updateOneConfig(where, fields) {
        this.init();
        await this.model.update(where, fields);
    }
    async update(params) {
        this.init();
        Object.assign(params.updateFields, { updateTime: Date.now() });
        await this.model.update({ nid: params.nid }, { winLimitConfig: params.updateFields });
        await this.deleteCache(params.nid);
        return true;
    }
    async findOneConfig(nid) {
        this.init();
        const conn = await (0, redisConnection_1.default)();
        let winLimitConfig = JSON.parse(await conn.hget(this.CacheKey, nid));
        if (winLimitConfig) {
            return winLimitConfig;
        }
        const dbResult = await this.model.findOne({ nid });
        if (dbResult) {
            await this.setDataIntoTheCache(nid, dbResult.winLimitConfig);
            return dbResult.winLimitConfig;
        }
        return;
    }
    async setDataIntoTheCache(nid, data) {
        const conn = await (0, redisConnection_1.default)();
        await conn.hset(this.CacheKey, nid, JSON.stringify(data));
    }
    async deleteCache(nid) {
        const conn = await (0, redisConnection_1.default)();
        conn.hdel(this.CacheKey, nid);
    }
}
exports.default = SlotWinLimitDAO;
SlotWinLimitDAO.instance = null;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2luTGltaXRDb25maWdEQU9JbXBsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL2RvbWFpbi9Db21tb25Db250cm9sL0RBTy93aW5MaW1pdENvbmZpZ0RBT0ltcGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSxnR0FBb0Y7QUFDcEYsbUZBQXlFO0FBQ3pFLHVGQUFnRjtBQU9oRixNQUFxQixlQUFlO0lBQXBDO1FBR0ksVUFBSyxHQUE4QixJQUFJLENBQUM7UUFDeEMsYUFBUSxHQUFXLDRCQUE0QixDQUFDO0lBd0dwRCxDQUFDO0lBbEdHLE1BQU0sQ0FBQyxXQUFXO1FBQ2QsSUFBSSxlQUFlLENBQUMsUUFBUSxLQUFLLElBQUksRUFBRTtZQUNuQyxlQUFlLENBQUMsUUFBUSxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7U0FDcEQ7UUFFRCxPQUFPLGVBQWUsQ0FBQyxRQUFRLENBQUM7SUFDcEMsQ0FBQztJQUVELElBQUk7UUFDQSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNiLElBQUksQ0FBQyxLQUFLLEdBQUcsMkJBQWlCLENBQUMsYUFBYSxFQUFFLENBQUMsYUFBYSxDQUFDLG9DQUFhLENBQUMsQ0FBQztTQUMvRTtJQUNMLENBQUM7SUFFTSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQTREO1FBQzVFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNaLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3pDLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDOUIsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQU9NLEtBQUssQ0FBQyxlQUFlLENBQUMsS0FBYSxFQUFFLE1BQWM7UUFDdEQsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBSVosTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQU1NLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBdUQ7UUFDdkUsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ1osTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFFL0QsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxjQUFjLEVBQUUsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7UUFFdEYsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuQyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBTU0sS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFXO1FBQ2xDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVaLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBQSx5QkFBWSxHQUFFLENBQUM7UUFHbEMsSUFBSSxjQUFjLEdBQXFCLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUd2RixJQUFJLGNBQWMsRUFBRTtZQUNoQixPQUFPLGNBQWMsQ0FBQztTQUN6QjtRQUdELE1BQU0sUUFBUSxHQUFRLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBQyxHQUFHLEVBQUMsQ0FBQyxDQUFDO1FBR3RELElBQUksUUFBUSxFQUFFO1lBRVYsTUFBTSxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUM3RCxPQUFPLFFBQVEsQ0FBQyxjQUFjLENBQUM7U0FDbEM7UUFFRCxPQUFPO0lBQ1gsQ0FBQztJQVFPLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxHQUFXLEVBQUUsSUFBc0I7UUFDakUsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFBLHlCQUFZLEdBQUUsQ0FBQztRQUVsQyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzlELENBQUM7SUFNRCxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQVc7UUFDekIsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFBLHlCQUFZLEdBQUUsQ0FBQztRQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDbEMsQ0FBQzs7QUEzR0wsa0NBNEdDO0FBM0dVLHdCQUFRLEdBQW9CLElBQUksQ0FBQyJ9