import {describe, it, before, after} from 'mocha';
import * as assert from "assert";
import {getControlCards, getPai} from "../../../../app/servers/FiveCardStud/lib/FCS_logic";
import {random} from "../../../../app/utils";

describe('梭哈开奖方法测试', () => {
    before(async () => {
    })

    after(function () {
    });

    it('开奖结果测试1', () => {
        for (let i = 0; i < 10; i++) {
            let cards = getControlCards(2, 2, getPai())
            assert.ok(cards.length === 2);
            assert.ok(cards.every(cs => !!cs));
            assert.ok(!cards.find(cs => !!cs.find(c => c === undefined)));
        }
    })

    it('开奖结果测试2', () => {
        for (let i = 0; i < 10; i++) {
            const cards = getControlCards(3, 2, getPai())
            assert.ok(cards.length === 3);
            assert.ok(cards.every(cs => !!cs));
            assert.ok(!cards.find(cs => !!cs.find(c => c === undefined)));
        }
    })

    it('开奖结果测试3', () => {
        for (let i = 0; i < 10; i++) {
            const cards = getControlCards(4, 2, getPai());
            assert.ok(cards.length === 4);
            assert.ok(cards.every(cs => !!cs));
            assert.ok(!cards.find(cs => !!cs.find(c => c === undefined)));

        }
    })

    it('开奖结果测试4', () => {
        for (let i = 0; i < 10; i++) {
            const cards = getControlCards(5, 2, getPai())
            assert.ok(cards.length === 5);
            assert.ok(cards.every(cs => !!cs));
            assert.ok(!cards.find(cs => !!cs.find(c => !c)));
        }
    })

    it('随机发牌', () => {
        for (let i = 0; i < 100; i++) {
            const cards = [], tc = getPai();
            for (let i = 0, len = 5; i < len; i++) {
                const c = [];
                for (let j = 0; j < 5; j++) {
                    c.push(tc.splice(random(0, tc.length - 1), 1)[0]);
                }
                cards.push(c);
            }

            assert.ok(cards.length === 5);
            assert.ok(cards.every(cs => !!cs));
            assert.ok(!cards.find(cs => !!cs.find(c => !c)));
        }
    })
})
