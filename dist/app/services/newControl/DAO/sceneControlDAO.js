"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SceneControl_entity_1 = require("../../../common/dao/mysql/entity/SceneControl.entity");
const redisConnection_1 = require("../../../common/dao/redis/lib/redisConnection");
const connectionManager_1 = require("../../../common/dao/mysql/lib/connectionManager");
class SceneControlInfoDAO {
    constructor() {
        this.model = null;
        this.cacheKeyPrefix = 'control:scene_control:';
    }
    static getInstance() {
        if (SceneControlInfoDAO.instance === null) {
            SceneControlInfoDAO.instance = new SceneControlInfoDAO();
        }
        return SceneControlInfoDAO.instance;
    }
    init() {
        if (!this.model) {
            this.model = connectionManager_1.default.getConnection().getRepository(SceneControl_entity_1.SceneControl);
        }
    }
    async create(params) {
        this.init();
        const sceneControl = this.model.create(params);
        await this.model.save(sceneControl);
        return true;
    }
    async initCache(nid) {
        const conn = await (0, redisConnection_1.default)();
        return await conn.del(this.getCacheKey(nid));
    }
    async updateOne(where, fields) {
        this.init();
        await this.model.update(where, fields);
        return true;
    }
    async findOne(params) {
        this.init();
        let data = await this.findToCache(params);
        if (data)
            return data;
        data = await this.model.findOne(params);
        if (data) {
            await this.saveToCache(data);
        }
        return data;
    }
    async saveToCache(params) {
        const conn = await (0, redisConnection_1.default)();
        await conn.hset(this.getCacheKey(params.nid), params.sceneId.toString(), JSON.stringify(params));
    }
    async removeOutOfCache({ nid, sceneId }) {
        const conn = await (0, redisConnection_1.default)();
        await conn.hdel(this.getCacheKey(nid), sceneId.toString());
    }
    async findToCache({ nid, sceneId }) {
        const conn = await (0, redisConnection_1.default)();
        return JSON.parse(await conn.hget(this.getCacheKey(nid), sceneId.toString()));
    }
    async findDB(where, fields = '-_id -updateTime -createTime') {
        this.init();
        return this.model.find(where);
    }
    getCacheKey(nid) {
        return `${this.cacheKeyPrefix}${nid}`;
    }
}
exports.default = SceneControlInfoDAO;
SceneControlInfoDAO.instance = null;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NlbmVDb250cm9sREFPLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vYXBwL3NlcnZpY2VzL25ld0NvbnRyb2wvREFPL3NjZW5lQ29udHJvbERBTy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLDhGQUFrRjtBQUNsRixtRkFBeUU7QUFDekUsdUZBQWdGO0FBT2hGLE1BQXFCLG1CQUFtQjtJQUF4QztRQXNCSSxVQUFLLEdBQTZCLElBQUksQ0FBQztRQUN2QyxtQkFBYyxHQUFXLHdCQUF3QixDQUFDO0lBMkZ0RCxDQUFDO0lBM0dHLE1BQU0sQ0FBQyxXQUFXO1FBQ2QsSUFBSSxtQkFBbUIsQ0FBQyxRQUFRLEtBQUssSUFBSSxFQUFFO1lBQ3ZDLG1CQUFtQixDQUFDLFFBQVEsR0FBRyxJQUFJLG1CQUFtQixFQUFFLENBQUM7U0FDNUQ7UUFFRCxPQUFPLG1CQUFtQixDQUFDLFFBQVEsQ0FBQztJQUN4QyxDQUFDO0lBRUQsSUFBSTtRQUNBLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ2IsSUFBSSxDQUFDLEtBQUssR0FBRywyQkFBaUIsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxhQUFhLENBQUMsa0NBQVksQ0FBQyxDQUFDO1NBQzlFO0lBQ0wsQ0FBQztJQVVELEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBd0I7UUFDakMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ1osTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0MsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUNwQyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBTUQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFXO1FBQ3ZCLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBQSx5QkFBWSxHQUFFLENBQUM7UUFDbEMsT0FBTyxNQUFNLElB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