'use strict';

// 服务器的启动前和关闭前的 初始化和清理操作
import { Application, pinus } from "pinus";
import messageService = require('../MessageService');
import logService = require('./logService');

// 需要在服务器启动之后设置的数据
export async function initAfterStartAll(app: Application) {
    const currServerID = pinus.app.getServerId();
    try {
        // 有多个大厅，则第一个大厅服务器留给玩家使用，不做定时任务
        if (currServerID === 'hall-server-1') {
            // 开启定时播放跑马灯
            messageService.startBigWinNotice();
            return;
        }
        logService.logSyncLog(`initAfterStartAll|${currServerID}|初始化正常`);
        return Promise.resolve();
    } catch (error) {
        logService.logSyncLog(`initAfterStartAll|${currServerID}|初始化出错|${error}`);
        return Promise.resolve();
    }
};


