'use strict';

// gate 服务器机器人和真实玩家分开
// 大厅服务器负载均衡
import { pinus, ServerInfo } from 'pinus';



// 给机器人分配 gate 地址
export function dispatchGate(fromRobot = true) {
    const gateServers = pinus.app.getServersByType('gate');
    if (!Array.isArray(gateServers) || !gateServers.length) {
        return;
    }
    let chosenGate: any;
    // 只有一台 gate，或者不是机器人
    if (gateServers.length === 1 || !fromRobot) {
        chosenGate = gateServers[0];
    } else {
        // 按照 server.id 最后一位的数字按升序排列
        gateServers.sort((a, b) => {
            return parseInt(a.id.split('-').pop()) - parseInt(b.id.split('-').pop());
        });
        let ran = gateServers.length - 1;
        chosenGate = gateServers[ran];
    }
    // 因为机器人都是走的内网，所以使用 localHost 配置
    return { host: chosenGate.clientHost, port: chosenGate.clientPort }
};