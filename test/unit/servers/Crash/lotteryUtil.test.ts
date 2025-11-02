import {describe, it, before, after} from 'mocha';
import * as assert from "assert";
import {LotteryUtil, calculateOdds} from "../../../../app/servers/Crash/lib/util/lotteryUtil";

describe('Crash开奖方法测试', () => {
    const lotteryUtil = new LotteryUtil();

    before(async () => {
        // await JsonMgr.init();
        // await RDSClient.demoInit();
        // pinus.createApp({base: process.cwd()});
        // pinus.app.load(pinus.components.channel, pinus.app.get('channelConfig'));
    })

    after(function () {
        // RDSClient.closeConnections();
    });

    it('开奖结果', () => {
        for (let i = 0; i < 10000; i++) {
            lotteryUtil.lottery();
            const result = lotteryUtil.getResult();

            assert.ok(result >= 0);
            assert.ok(result <= 450);
        }
    });

    it('开奖时间', () => {
        for (let i = 0; i < 100000; i++) {
            lotteryUtil.lottery();
            const time = lotteryUtil.getFlyTime();

            assert.ok(time >= 0);
            assert.ok(time <= 100 * 1000);
        }
    });

    it('计算倍数', () => {
        let odds = calculateOdds(99000);
        assert.ok(odds > 400 && odds < 450);
        odds = calculateOdds(500);
        assert.ok(odds > 0 && odds < 1.063);
    });
})
