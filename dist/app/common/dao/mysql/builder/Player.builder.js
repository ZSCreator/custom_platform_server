"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerBuilder = void 0;
const Player_entity_1 = require("../entity/Player.entity");
const RoleEnum_1 = require("../../../constant/player/RoleEnum");
const utils_1 = require("../../../../utils");
const general_1 = require("../../../../utils/general");
const Player_manager_1 = require("../../daoManager/Player.manager");
const hallConst_1 = require("../../../../consts/hallConst");
const connectionManager_1 = require("../lib/connectionManager");
class BuilderTool {
    constructor(build) {
        this.build = build;
    }
    async generateUid() {
        while (true) {
            const prefixList = [0, 1, 2, 3, 4, 5, 6, 8, 9];
            const prefix = prefixList[Math.floor(Math.random() * prefixList.length)];
            const uid = (0, general_1.createPlayerUid)(prefix);
            const isExist = await this.build.conn.getRepository(Player_entity_1.Player)
                .findOne({ uid });
            if (!isExist) {
                this.build.playerImpl.uid = uid;
                break;
            }
        }
        const { nickname, uid } = this.build.playerImpl;
        if (!nickname || (typeof nickname === "string" && nickname.length === 0)) {
            this.build.playerImpl.nickname = `P${uid}`;
        }
    }
    generateNickname(nameType = "cn") {
        this.build.playerImpl.headurl = 'P' + this.build.playerImpl.uid;
    }
    generateHead() {
        this.build.playerImpl.headurl = (0, utils_1.getHead)();
    }
    checkBeforeSaveToDB() {
        this.build.playerImpl.isRobot = typeof this.build.playerImpl.isRobot === "number" ? this.build.playerImpl.isRobot : 0;
    }
    checkLanguageBeforeSaveToDB() {
        this.build.playerImpl.language = hallConst_1.LANGUAGE.DEFAULT;
    }
}
class PlayerBuilder {
    constructor() {
        this.conn = connectionManager_1.default.getConnection();
        this.tool = new BuilderTool(this);
        this.playerImpl = this.conn.getRepository(Player_entity_1.Player)
            .create();
    }
    createPlayer() {
        this.tool.generateHead();
        this.tool.checkLanguageBeforeSaveToDB();
        return this;
    }
    setPlayerRole(role = RoleEnum_1.RoleEnum.REAL_PLAYER) {
        this.playerImpl.isRobot = role;
        return this;
    }
    setGuestId(guestId = null) {
        if (guestId) {
            this.playerImpl.guestid = guestId;
        }
        else {
            this.playerImpl.guestid = (0, general_1.generateID)();
        }
        return this;
    }
    setThirdUid(superior = null, group_id = null, thirdUid = null, groupRemark = null, language = null, lineCode = null, shareUid = null, rom_type = null) {
        this.playerImpl.superior = superior;
        this.playerImpl.group_id = group_id;
        this.playerImpl.thirdUid = thirdUid;
        this.playerImpl.groupRemark = groupRemark;
        this.playerImpl.shareUid = shareUid;
        this.playerImpl.lineCode = lineCode;
        this.playerImpl.rom_type = rom_type;
        if (language) {
            this.playerImpl.language = language;
        }
        return this;
    }
    async getPlayerImpl() {
        this.tool.checkBeforeSaveToDB();
        await this.tool.generateUid();
        return this.playerImpl;
    }
    async sendToDB() {
        this.tool.checkBeforeSaveToDB();
        await this.tool.generateUid();
        return await Player_manager_1.default.insertOne(this.playerImpl);
    }
}
exports.PlayerBuilder = PlayerBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmJ1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvY29tbW9uL2Rhby9teXNxbC9idWlsZGVyL1BsYXllci5idWlsZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLDJEQUFpRDtBQUVqRCxnRUFBNkQ7QUFDN0QsNkNBQTRDO0FBQzVDLHVEQUF1RTtBQUN2RSxvRUFBNEQ7QUFDNUQsNERBQXdEO0FBQ3hELGdFQUF5RDtBQUV6RCxNQUFNLFdBQVc7SUFFYixZQUFvQixLQUFvQjtRQUFwQixVQUFLLEdBQUwsS0FBSyxDQUFlO0lBQUksQ0FBQztJQUs3QyxLQUFLLENBQUMsV0FBVztRQUNiLE9BQU8sSUFBSSxFQUFFO1lBQ0wsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQTtZQUN4RSxNQUFNLEdBQUcsR0FBRyxJQUFBLHlCQUFlLEVBQUMsTUFBTSxDQUFDLENBQUM7WUFDcEMsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsc0JBQU0sQ0FBQztpQkFDdEQsT0FBTyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUV0QixJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNWLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7Z0JBQ2hDLE1BQU07YUFDVDtTQUVSO1FBRUQsTUFBTSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsR0FB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