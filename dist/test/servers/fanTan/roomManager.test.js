"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const JsonMgr = require("../../../config/data/JsonMgr");
const roomManager_1 = require("../../../app/servers/fanTan/lib/roomManager");
const RDSClient_1 = require("../../../app/common/dao/mysql/lib/RDSClient");
const BaseRedisManager_1 = require("../../../app/common/dao/redis/lib/BaseRedisManager");
const pinus_1 = require("pinus");
const assert = require("assert");
(0, mocha_1.describe)('番摊房间测试', () => {
    const player = { lineCode: 1, group_id: 2, uid: '2342', sid: '23432' };
    (0, mocha_1.before)(async () => {
        await JsonMgr.init();
        await RDSClient_1.RDSClient.demoInit();
        await roomManager_1.default.init();
        pinus_1.pinus.createApp({ base: process.cwd() });
        pinus_1.pinus.app.load(pinus_1.pinus.components.channel, pinus_1.pinus.app.get('channelConfig'));
    });
    (0, mocha_1.after)(function () {
        RDSClient_1.RDSClient.closeConnections();
        BaseRedisManager_1.default.closeConnection();
        roomManager_1.default.close();
    });
    (0, mocha_1.it)('番摊添加房间', () => {
        roomManager_1.default.getTenantScene((player));
        const group = roomManager_1.default.findGroup(player);
        assert.strictEqual(!!group, true);
        assert.ok(group.getRooms().length > 0);
    });
    (0, mocha_1.it)('番摊删除房间', () => {
        const group = roomManager_1.default.findGroup(player);
        roomManager_1.default.removePlayer(player);
        roomManager_1.default._testDestructGroup(group);
        assert.ok(group.getRooms().length === 0);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbU1hbmFnZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3Qvc2VydmVycy9mYW5UYW4vcm9vbU1hbmFnZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGlDQUFrRDtBQUNsRCx3REFBd0Q7QUFDeEQsNkVBQXNFO0FBQ3RFLDJFQUFzRTtBQUN0RSx5RkFBa0Y7QUFDbEYsaUNBQThCO0FBQzlCLGlDQUFpQztBQUVqQyxJQUFBLGdCQUFRLEVBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTtJQUNwQixNQUFNLE1BQU0sR0FBRyxFQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUMsQ0FBQztJQUVwRSxJQUFBLGNBQU0sRUFBQyxLQUFLLElBQUksRUFBRTtRQUNkLE1BQU0sT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3JCLE1BQU0scUJBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMzQixNQUFNLHFCQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDekIsYUFBSyxDQUFDLFNBQVMsQ0FBQyxFQUFDLElBQUksRUFBRSxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUMsQ0FBQyxDQUFDO1FBQ3ZDLGFBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLGFBQUssQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLGFBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7SUFDN0UsQ0FBQyxDQUFDLENBQUE7SUFFRixJQUFBLGFBQUssRUFBQztRQUNGLHFCQUFTLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUM3QiwwQkFBZ0IsQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUNuQyxxQkFBVyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3hCLENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBQSxVQUFFLEVBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTtRQUNkLHFCQUFXLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxDQUFRLENBQUMsQ0FBQztRQUM1QyxNQUFNLEtBQUssR0FBRyxxQkFBVyxDQUFDLFNBQVMsQ0FBQyxNQUFhLENBQUMsQ0FBQztRQUNuRCxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQzFDLENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBQSxVQUFFLEVBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTtRQUNkLE1BQU0sS0FBSyxHQUFHLHFCQUFXLENBQUMsU0FBUyxDQUFDLE1BQWEsQ0FBQyxDQUFDO1FBQ25ELHFCQUFXLENBQUMsWUFBWSxDQUFDLE1BQWEsQ0FBQyxDQUFDO1FBQ3hDLHFCQUFXLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFBO0lBQzVDLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUEifQ==