import { Player } from "../entity/Player.entity";
import { Connection } from "typeorm";
import { RoleEnum } from "../../../constant/player/RoleEnum";
import { getHead } from "../../../../utils";
import { generateID ,createPlayerUid} from "../../../../utils/general";
import PlayerManager from "../../daoManager/Player.manager";
import { LANGUAGE } from "../../../../consts/hallConst";
import ConnectionManager from "../lib/connectionManager";

class BuilderTool {

    constructor(private build: PlayerBuilder) { }

    /**
     * 生成uid
     */
    async generateUid() {
        while (true) {
                const prefixList = [0,1,2,3,4,5,6,8,9];
                const prefix = prefixList[Math.floor(Math.random() * prefixList.length)]
                const uid = createPlayerUid(prefix);
                const isExist = await this.build.conn.getRepository(Player)
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

    /**
     * 生成昵称
     */
    generateNickname(nameType: string = "cn") {
        // if(nameType==="cn"){
        //     this.build.playerImpl.nickname = getRandomNickname();
        // }
        this.build.playerImpl.headurl = 'P' + this.build.playerImpl.uid;
    }

    /**
     * 生成头像
     */
    generateHead() {
        this.build.playerImpl.headurl = getHead();
        // this.build.playerImpl.headurl = 'P'+ this.build.playerImpl.uid;
    }

    checkBeforeSaveToDB() {
        this.build.playerImpl.isRobot = typeof this.build.playerImpl.isRobot === "number" ? this.build.playerImpl.isRobot : 0;
    }

    checkLanguageBeforeSaveToDB() {
        this.build.playerImpl.language = LANGUAGE.DEFAULT;
    }
}

export class PlayerBuilder {

    public conn: Connection | null;

    public playerImpl: Player;

    private tool: BuilderTool;

    constructor() {
        this.conn = ConnectionManager.getConnection();
        this.tool = new BuilderTool(this);
        this.playerImpl = this.conn.getRepository(Player)
            .create();
    }

    /**
     * 生成昵称和头像
     */
    public createPlayer() {

        // this.tool.generateNickname();

        this.tool.generateHead();

        this.tool.checkLanguageBeforeSaveToDB();
        return this;
    }

    /**
     * 设置角色身份
     * @param role 角色身份
     * @description 就算不调用此函数，默认真实玩家；
     */
    public setPlayerRole(role: RoleEnum = RoleEnum.REAL_PLAYER) {

        this.playerImpl.isRobot = role;

        return this;
    }

    public setGuestId(guestId: string = null) {
        if (guestId) {
            this.playerImpl.guestid = guestId;
        } else {
            this.playerImpl.guestid = generateID();
        }

        return this;
    }


    public setThirdUid(superior: string = null , group_id: string = null ,thirdUid: string = null, groupRemark: string = null ,language : string = null ,lineCode:string = null,shareUid:string = null ,rom_type : string =null) {
        this.playerImpl.superior = superior;
        this.playerImpl.group_id = group_id;
        this.playerImpl.thirdUid = thirdUid;
        this.playerImpl.groupRemark = groupRemark;
        this.playerImpl.shareUid = shareUid;
        this.playerImpl.lineCode = lineCode;
        this.playerImpl.rom_type = rom_type;
        if(language){
            this.playerImpl.language = language;
        }

        return this;
    }

    public async getPlayerImpl() {
        this.tool.checkBeforeSaveToDB();

        await this.tool.generateUid();

        return this.playerImpl;
    }

    /**
     * 存进数据库
     */
    public async sendToDB() {
        this.tool.checkBeforeSaveToDB();

        await this.tool.generateUid();
        return await PlayerManager.insertOne(this.playerImpl);
    }

}
