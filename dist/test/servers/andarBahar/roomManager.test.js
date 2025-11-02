"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const JsonMgr = require("../../../config/data/JsonMgr");
const roomManager_1 = require("../../../app/servers/andarBahar/lib/roomManager");
const RDSClient_1 = require("../../../app/common/dao/mysql/lib/RDSClient");
const BaseRedisManager_1 = require("../../../app/common/dao/redis/lib/BaseRedisManager");
const pinus_1 = require("pinus");
const assert = require("assert");
(0, mocha_1.describe)('猜AB房间测试', () => {
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
    (0, mocha_1.it)('猜AB添加房间', () => {
        roomManager_1.default.getTenantScene((player));
        const group = roomManager_1.default.findGroup(player);
        assert.strictEqual(!!group, true);
        assert.ok(group.getRooms().length > 0);
    });
    (0, mocha_1.it)('猜AB删除房间', () => {
        const group = roomManager_1.default.findGroup(player);
        roomManager_1.default.removePlayer(player);
        roomManager_1.default._testDestructGroup(group);
        assert.ok(group.getRooms().length === 0);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbU1hbmFnZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3Qvc2VydmVycy9hbmRhckJhaGFyL3Jvb21NYW5hZ2VyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpQ0FBa0Q7QUFDbEQsd0RBQXdEO0FBQ3hELGlGQUEwRTtBQUMxRSwyRUFBc0U7QUFDdEUseUZBQWtGO0FBQ2xGLGlDQUE4QjtBQUM5QixpQ0FBaUM7QUFFakMsSUFBQSxnQkFBUSxFQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7SUFDckIsTUFBTSxNQUFNLEdBQUcsRUFBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFDLENBQUM7SUFFcEUsSUFBQSxjQUFNLEVBQUMsS0FBSyxJQUFJLEVBQUU7UUFDZCxNQUFNLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNyQixNQUFNLHFCQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDM0IsTUFBTSxxQkFBVyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3pCLGFBQUssQ0FBQyxTQUFTLENBQUMsRUFBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFDLENBQUMsQ0FBQztRQUN2QyxhQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxhQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO0lBQzdFLENBQUMsQ0FBQyxDQUFBO0lBRUYsSUFBQSxhQUFLLEVBQUM7UUFDRixxQkFBUyxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDN0IsMEJBQWdCLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDbkMscUJBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN4QixDQUFDLENBQUMsQ0FBQztJQUVILElBQUEsVUFBRSxFQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7UUFDZixxQkFBVyxDQUFDLGNBQWMsQ0FBQyxDQUFDLE1BQU0sQ0FBUSxDQUFDLENBQUM7UUFDNUMsTUFBTSxLQUFLLEdBQUcscUJBQVcsQ0FBQyxTQUFTLENBQUMsTUFBYSxDQUFDLENBQUM7UUFDbkQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2xDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUMxQyxDQUFDLENBQUMsQ0FBQztJQUVILElBQUEsVUFBRSxFQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7UUFDZixNQUFNLEtBQUssR0FBRyxxQkFBVyxDQUFDLFNBQVMsQ0FBQyxNQUFhLENBQUMsQ0FBQztRQUNuRCxxQkFBVyxDQUFDLFlBQVksQ0FBQyxNQUFhLENBQUMsQ0FBQztRQUN4QyxxQkFBVyxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQTtJQUM1QyxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFBIn0=