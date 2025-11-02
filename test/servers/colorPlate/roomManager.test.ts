import {describe, it, before, after} from 'mocha';
import * as JsonMgr from "../../../config/data/JsonMgr";
import roomManager from "../../../app/servers/colorPlate/lib/roomManager";
import {RDSClient} from "../../../app/common/dao/mysql/lib/RDSClient";
import BaseRedisManager from "../../../app/common/dao/redis/lib/BaseRedisManager";
import { pinus } from 'pinus';
import * as assert from "assert";

describe('色碟房间测试', () => {
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

    it('色碟添加房间', () => {
        const group = roomManager.getTenantScene((player) as any);
        assert.strictEqual(!!group, true);
        assert.ok(group.getRooms().length > 0)
    });

    it('色碟删除房间', () => {
        const group = roomManager.findGroup(player as any);
        roomManager.removePlayer(player as any);
        roomManager._testDestructGroup(group);
        assert.ok(group.getRooms().length === 0)
    });

    it('色碟房间数量检测', () => {
        const players = [];
        // 生成90个租户数据
        for (let i = 0; i < 90; i++) {
            players.push({lineCode: `1`, group_id: `${i}_0`, uid: `${i}_2342`, sid: '23432'})
        }

        players.forEach(p => {
            const group = roomManager.getTenantScene((p) as any);
            const rooms = group.getRooms();
            const s = new Set(rooms.map(r => r.roomId));
            assert.ok(rooms.length === s.size);
        });

        players.forEach(p => {
            const group = roomManager.getTenantScene((p) as any);
            roomManager.removePlayer(p as any);
            roomManager._testDestructGroup(group);
        });

        assert.ok(roomManager.runningGroupList.length === 0 && roomManager.leisureGroupList.length === 0);
    });
})
