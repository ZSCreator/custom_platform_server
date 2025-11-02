import { RDSClient } from "../../app/common/dao/mysql/lib/RDSClient";
import {describe, before, afterEach} from "mocha";

describe("查询租户所属的玩家游戏记录 ", function () {

    before(async () => {
        await RDSClient.demoInit();
    });

    describe("dao 层操作", () => {
        let consoleResult;

        afterEach(() => {
            if (!!consoleResult)
                console.log(consoleResult);
        });
    });
});
