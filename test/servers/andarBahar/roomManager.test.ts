import {describe, it, before, after} from 'mocha';
import * as JsonMgr from "../../../config/data/JsonMgr";
import roomManager from "../../../app/servers/andarBahar/lib/roomManager";
import {RDSClient} from "../../../app/common/dao/mysql/lib/RDSClient";
import BaseRedisManager from "../../../app/common/dao/redis/lib/BaseRedisManager";
import { pinus } from 'pinus';
import * as assert from "assert";

describe('猜AB房间测试', () => {
    const player = {lineCode: 1, group_id:2, uid: '2342', sid: '23432'};

    before(async () => {
        await JsonMgr.init();
        await RDSClient.demoInit();
        await roomManager.init();
        pinus.createApp({base: process.cwd()});
        pinus.app.load(pinus.components.channel, pinus.app.get('channelConfig'));
    })

    after(function () {
        RDSClient.closeConnections();
        BaseRedisManager.closeConnection();
        roomManager.close();
    });

    it('猜AB添加房间', () => {
        roomManager.getTenantScene((player) as any);
        const group = roomManager.findGroup(player as any);
        assert.strictEqual(!!group, true);
        assert.ok(group.getRooms().length > 0)
    });

    it('猜AB删除房间', () => {
        const group = roomManager.findGroup(player as any);
        roomManager.removePlayer(player as any);
        roomManager._testDestructGroup(group);
        assert.ok(group.getRooms().length === 0)
    });
})
