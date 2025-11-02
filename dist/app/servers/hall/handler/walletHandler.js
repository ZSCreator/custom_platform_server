'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.vipHandler = void 0;
const pinus_1 = require("pinus");
const hallConst_1 = require("../../../consts/hallConst");
const hallConst = require("../../../consts/hallConst");
const Player_manager_1 = require("../../../common/dao/daoManager/Player.manager");
const WalletRecord_mysql_dao_1 = require("../../../common/dao/mysql/WalletRecord.mysql.dao");
const langsrv = require("../../../services/common/langsrv");
const pinus_logger_1 = require("pinus-logger");
const moment = require("moment");
function default_1(app) {
    return new vipHandler(app);
}
exports.default = default_1;
class vipHandler {
    constructor(app) {
        this.app = app;
        this.app = app;
        this.logger = (0, pinus_logger_1.getLogger)('server_out', __filename);
    }
    async depositToWallet({ gold }, session) {
        const uid = session.uid;
        let language = null;
        this.logger.warn(`存钱到钱包===:uid:${uid} , gold : ${gold}, time :${moment().format("YYYY-MM-DD- HH:mm:ss")}`);
        try {
            const player = await Player_manager_1.default.findOne({ uid }, false);
            if (!player) {
                throw langsrv.getlanguage(language, langsrv.Net_Message.id_3);
            }
            if (!gold || typeof gold !== 'number' || gold <= 0) {
                throw langsrv.getlanguage(player.language, langsrv.Net_Message.id_100);
            }
            language = player.language;
            if (player.position == hallConst.PLAYER_POSITIONS.GAME) {
                throw langsrv.getlanguage(player.language, langsrv.Net_Message.id_235);
            }
            if (player.gold < gold) {
                throw langsrv.getlanguage(player.language, langsrv.Net_Message.id_233);
            }
            if (player.walletGold + gold > hallConst_1.MAX_DEPOSIT_COUNT * 100) {
                throw langsrv.getlanguage(player.language, langsrv.Net_Message.id_234);
            }
            player.gold -= gold;
            player.walletGold += gold;
            const walletRecord = {
                uid: player.uid,
                op_type: hallConst_1.OP_TYPE.DEPOSIT,
                changed_gold: gold,
                curr_gold: player.gold,
                curr_wallet_gold: player.walletGold,
            };
            await WalletRecord_mysql_dao_1.default.insertOne(walletRecord);
            await Player_manager_1.default.updateOne({ uid: player.uid }, { gold: player.gold, walletGold: player.walletGold });
            return { code: 200, gold: player.gold, walletGold: player.walletGold };
        }
        catch (error) {
            this.logger.error(`${error}error| 存钱到钱包 | 出错:${error.stack}`);
            !error && (error = langsrv.getlanguage(language, langsrv.Net_Message.id_235));
            return { code: 500, error };
        }
    }
    ;
    async withdrawFromWallet({ gold, walletPassword }, session) {
        let language = null;
        const uid = session.uid;
        this.logger.warn(`从钱包提取金币到身上===:uid:${uid} , gold : ${gold}, time :${moment().format("YYYY-MM-DD- HH:mm:ss")}`);
        try {
            const player = await Player_manager_1.default.findOne({ uid }, false);
            if (!player) {
                throw langsrv.getlanguage(language, langsrv.Net_Message.id_3);
            }
            language = player.language;
            if (!gold || typeof gold !== 'number' || gold <= 0) {
                return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_236) };
            }
            if (player.walletGold < gold) {
                throw langsrv.getlanguage(language, langsrv.Net_Message.id_238);
            }
            player.walletGold -= gold;
            player.gold += gold;
            const walletRecord = {
                uid: player.uid,
                op_type: hallConst_1.OP_TYPE.WITHDRAW,
                changed_gold: gold,
                curr_gold: player.gold,
                curr_wallet_gold: player.walletGold,
            };
            await WalletRecord_mysql_dao_1.default.insertOne(walletRecord);
            await Player_manager_1.default.updateOne({ uid: player.uid }, player);
            return { code: 200, gold: player.gold, walletGold: player.walletGold };
        }
        catch (error) {
            this.logger.error(`${pinus_1.pinus.app.getServerId()} | 从钱包提取金币到身上 | 出错:${error.stack}`);
            return { code: 500, error: langsrv.getlanguage(language, langsrv.Net_Message.id_99) };
        }
    }
    ;
}
exports.vipHandler = vipHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FsbGV0SGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2hhbGwvaGFuZGxlci93YWxsZXRIYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7O0FBQ2IsaUNBQTJEO0FBRTNELHlEQUF1RTtBQUN2RSx1REFBd0Q7QUFDeEQsa0ZBQTZFO0FBQzdFLDZGQUFvRjtBQUNwRiw0REFBNkQ7QUFFN0QsK0NBQXlDO0FBRXpDLGlDQUFpQztBQUNqQyxtQkFBeUIsR0FBZ0I7SUFDckMsT0FBTyxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMvQixDQUFDO0FBRkQsNEJBRUM7QUFDRCxNQUFhLFVBQVU7SUFFbkIsWUFBb0IsR0FBZ0I7UUFBaEIsUUFBRyxHQUFILEdBQUcsQ0FBYTtRQUNoQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBQSx3QkFBUyxFQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBUUQsS0FBSyxDQUFDLGVBQWUsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLE9BQXVCO1FBQ25ELE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFDeEIsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGFBQWEsSUFBSSxXQUFZLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBRSxFQUFFLENBQUMsQ0FBQztRQUM3RyxJQUFJO1lBRUEsTUFBTSxNQUFNLEdBQVcsTUFBTSx3QkFBZ0IsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUV0RSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNULE1BQU0sT0FBTyxDQUFD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