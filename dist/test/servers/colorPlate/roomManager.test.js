"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const JsonMgr = require("../../../config/data/JsonMgr");
const roomManager_1 = require("../../../app/servers/colorPlate/lib/roomManager");
const RDSClient_1 = require("../../../app/common/dao/mysql/lib/RDSClient");
const BaseRedisManager_1 = require("../../../app/common/dao/redis/lib/BaseRedisManager");
const pinus_1 = require("pinus");
const assert = require("assert");
(0, mocha_1.describe)('色碟房间测试', () => {
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
    (0, mocha_1.it)('色碟添加房间', () => {
        const group = roomManager_1.default.getTenantScene((player));
        assert.strictEqual(!!group, true);
        assert.ok(group.getRooms().length > 0);
    });
    (0, mocha_1.it)('色碟删除房间', () => {
        const group = roomManager_1.default.findGroup(player);
        roomManager_1.default.removePlayer(player);
        roomManager_1.default._testDestructGroup(group);
        assert.ok(group.getRooms().length === 0);
    });
    (0, mocha_1.it)('色碟房间数量检测', () => {
        const players = [];
        for (let i = 0; i < 90; i++) {
            players.push({ lineCode: `1`, group_id: `${i}_0`, uid: `${i}_2342`, sid: '23432' });
        }
        players.forEach(p => {
            const group = roomManager_1.default.getTenantScene((p));
            const rooms = group.getRooms();
            const s = new Set(rooms.map(r => r.roomId));
            assert.ok(rooms.length === s.size);
        });
        players.forEach(p => {
            const group = roomManager_1.default.getTenantScene((p));
            roomManager_1.default.removePlayer(p);
            roomManager_1.default._testDestructGroup(group);
        });
        assert.ok(roomManager_1.default.runningGroupList.length === 0 && roomManager_1.default.leisureGroupList.length === 0);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbU1hbmFnZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3Qvc2VydmVycy9jb2xvclBsYXRlL3Jvb21NYW5hZ2VyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpQ0FBa0Q7QUFDbEQsd0RBQXdEO0FBQ3hELGlGQUEwRTtBQUMxRSwyRUFBc0U7QUFDdEUseUZBQWtGO0FBQ2xGLGlDQUE4QjtBQUM5QixpQ0FBaUM7QUFFakMsSUFBQSxnQkFBUSxFQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUU7SUFDcEIsTUFBTSxNQUFNLEdBQUcsRUFBQyxRQUFRLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFDLENBQUM7SUFFcEUsSUFBQSxjQUFNLEVBQUMsS0FBSyxJQUFJLEVBQUU7UUFDZCxNQUFNLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNyQixNQUFNLHFCQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDM0IsTUFBTSxxQkFBVyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3pCLGFBQUssQ0FBQyxTQUFTLENBQUMsRUFBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFDLENBQUMsQ0FBQztRQUN2QyxhQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxhQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO0lBQzdFLENBQUMsQ0FBQyxDQUFBO0lBRUYsSUFBQSxhQUFLLEVBQUM7UUFDRixxQkFBUyxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDN0IsMEJBQWdCLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDbkMscUJBQVcsQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN4QixDQUFDLENBQUMsQ0FBQztJQUVILElB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