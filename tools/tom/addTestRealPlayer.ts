import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import {createTestPlayer} from "../../app/servers/robot/lib/AiAutoCreat";

async function run() {
    await RDSClient.demoInit();

    // 创建测试平台玩家
    await createTestPlayer();

    console.warn('创建完成');

    process.exit();
}

process.nextTick(run);