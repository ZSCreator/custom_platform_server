"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const JsonMgr = require("../../../config/data/JsonMgr");
const RedBlackMgr_1 = require("../../../app/servers/RedBlack/lib/RedBlackMgr");
const RDSClient_1 = require("../../../app/common/dao/mysql/lib/RDSClient");
const BaseRedisManager_1 = require("../../../app/common/dao/redis/lib/BaseRedisManager");
const pinus_1 = require("pinus");
const assert = require("assert");
(0, mocha_1.describe)('红黑大战房间测试', () => {
    const player = { lineCode: 1, group_id: 2, uid: '2342', sid: '23432' };
    (0, mocha_1.before)(async () => {
        await JsonMgr.init();
        await RDSClient_1.RDSClient.demoInit();
        await RedBlackMgr_1.default.init();
        pinus_1.pinus.createApp({ base: process.cwd() });
        pinus_1.pinus.app.load(pinus_1.pinus.components.channel, pinus_1.pinus.app.get('channelConfig'));
    });
    (0, mocha_1.after)(function () {
        RDSClient_1.RDSClient.closeConnections();
        BaseRedisManager_1.default.closeConnection();
        RedBlackMgr_1.default.close();
    });
    (0, mocha_1.it)('红黑大战添加房间', () => {
        RedBlackMgr_1.default.getTenantScene((player));
        const group = RedBlackMgr_1.default.findGroup(player);
        assert.strictEqual(!!group, true);
        assert.ok(group.getRooms().length > 0);
    });
    (0, mocha_1.it)('红黑大战删除房间', () => {
        const group = RedBlackMgr_1.default.findGroup(player);
        RedBlackMgr_1.default.removePlayer(player);
        RedBlackMgr_1.default._testDestructGroup(group);
        assert.ok(group.getRooms().length === 0);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9vbU1hbmFnZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3Qvc2VydmVycy9SZWRCbGFjay9yb29tTWFuYWdlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQWtEO0FBQ2xELHdEQUF3RDtBQUN4RCwrRUFBd0U7QUFDeEUsMkVBQXNFO0FBQ3RFLHlGQUFrRjtBQUNsRixpQ0FBOEI7QUFDOUIsaUNBQWlDO0FBRWpDLElBQUEsZ0JBQVEsRUFBQyxVQUFVLEVBQUUsR0FBRyxFQUFFO0lBQ3RCLE1BQU0sTUFBTSxHQUFHLEVBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBQyxDQUFDO0lBRXBFLElBQUEsY0FBTSxFQUFDLEtBQUssSUFBSSxFQUFFO1FBQ2QsTUFBTSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDckIsTUFBTSxxQkFBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzNCLE1BQU0scUJBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN6QixhQUFLLENBQUMsU0FBUyxDQUFDLEVBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBQyxDQUFDLENBQUM7UUFDdkMsYUFBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsYUFBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztJQUM3RSxDQUFDLENBQUMsQ0FBQTtJQUVGLElBQUEsYUFBSyxFQUFDO1FBQ0YscUJBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQzdCLDBCQUFnQixDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ25DLHFCQUFXLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDeEIsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFBLFVBQUUsRUFBQyxVQUFVLEVBQUUsR0FBRyxFQUFFO1FBQ2hCLHFCQUFXLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxDQUFRLENBQUMsQ0FBQztRQUM1QyxNQUFNLEtBQUssR0FBRyxxQkFBVyxDQUFDLFNBQVMsQ0FBQyxNQUFhLENBQUMsQ0FBQztRQUNuRCxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQzFDLENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBQSxVQUFFLEVBQUMsVUFBVSxFQUFFLEdBQUcsRUFBRTtRQUNoQixNQUFNLEtBQUssR0FBRyxxQkFBVyxDQUFDLFNBQVMsQ0FBQyxNQUFhLENBQUMsQ0FBQztRQUNuRCxxQkFBVyxDQUFDLFlBQVksQ0FBQyxNQUFhLENBQUMsQ0FBQztRQUN4QyxxQkFBVyxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3RDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQTtJQUM1QyxDQUFDLENBQUMsQ0FBQztBQXdCUCxDQUFDLENBQUMsQ0FBQSJ9