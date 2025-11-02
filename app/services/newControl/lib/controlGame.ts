import {buildControlScene, ControlScene, SheetDTO} from "./controlScene";
import SceneManager from "../../../common/dao/daoManager/Scene.manager";
import PlatformControlDao from '../../../common/dao/daoManager/PlatformControl.manager';
import PlatformControlStateDao from '../../../common/dao/daoManager/PlatformControlState.manager';
import {PlatformControlType, RecordTypes} from "../constants";
import {getLogger} from "pinus-logger";
import {buildControlState, ControlState} from "./controlState";
import {summaryList} from './utils';
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

const logger = getLogger('server_out', __filename);

/**
 * 构造一个租户或者平台调控游戏类
 * @param tenantId 租户id
 * @param platformId 平台id
 * @param nid 游戏id
 */
export function buildControlGame(platformId: string, tenantId: string, nid: GameNidEnum) {
    return new ControlGame(platformId, tenantId,  nid);
}

export class ControlGame {
    /** 租户id */
    platformId: string;
    /** 租户id */
    tenantId: string;
    /** 类型 */
    type: RecordTypes;
    nid: GameNidEnum;
    /** 场列表 */
    sceneList: ControlScene[];
    /** 调控状态 */
    controlState: ControlState;

    constructor(platformId: string, tenantId: string, nid: GameNidEnum) {
        this.platformId = platformId;
        this.tenantId = tenantId || '';
        this.nid = nid;
        this.sceneList = [];
        this.type = this.tenantId ? RecordTypes.TENANT_SCENE : RecordTypes.SCENE;
    }

    /**
     * 初始化一个场
     * @param sceneId
     */
    async initScene(sceneId: number) {
        // 已经初始化则不再初始化
        if (this.sceneList.find(s => s.sceneId === sceneId)) {
            return;
        }

        const scene = buildControlScene(this.platformId, this.tenantId, this.nid, sceneId)

        const sceneData = this.type === RecordTypes.TENANT_SCENE ?
            await PlatformControlDao.findOneByTenantIdAndSceneId(this.platformId, this.tenantId, scene.nid, scene.sceneId) :
        await PlatformControlDao.findOneBySceneId(RecordTypes.SCENE, this.platformId, scene.nid, scene.sceneId);

        // 如果没有就是第一次
        if (!!sceneData) {
            scene.init(false, sceneData);
        } else {
            scene.init(true);
            await scene.crateToDB();
        }

        this.sceneList.push(scene);
    }

    async init() {
        // 获取该游戏的场配置
        const scenes = await SceneManager.findList({nid: this.nid});
        for (let scene of scenes) {
            await this.initScene(scene.sceneId);
        }

        await this.initControlState();
    }

    /**
     * 初始化调控状态
     */
    async initControlState() {
        // 如果已经初始化则不再进行初始化 因为内存数据总是最新的
        if (this.controlState) {
            return;
        }

        const type = this.type === RecordTypes.TENANT_SCENE ? PlatformControlType.TENANT_GAME : PlatformControlType.GAME;

        // 查找是否有调控状态
        let result = await PlatformControlStateDao.findOne(
            {platformId: this.platformId, tenantId: this.tenantId, type, nid: this.nid});

        if (result) {
            this.controlState = buildControlState(result, type);

            // 这个月的打码 和 系统收益
            const monthBill = await PlatformControlDao.getMonthlyGameBill(
                {type: this.type, platformId: this.platformId, nid: this.nid, tenantId: this.tenantId});

            this.controlState.init(monthBill.betGoldAmount, monthBill.profit);
        }
    }

    /**
     * 零点清空
     */
    async timingInitial() {
        return await Promise.all(this.sceneList.map(async s => {
            s.init(true);
            await s.crateToDB();
        }));
    }

    /**
     * 月初初始化
     */
    beginningMonthInit() {
        if (this.controlState) {
            this.controlState.init(0, 0);
        }
    }

    /**
     * 更新进数据库
     */
    async updateToDB() {
        const sceneList = this.sceneList.filter(s => s.needToBeUpdate());

        if (sceneList.length > 0) {
            return Promise.all(sceneList.map(s => s.updateToDB()));
        }
    }

    /**
     * 获取调控状态
     */
    getKillRateConfig(): number | null {
        return !!this.controlState ? this.controlState.getKillRate() : null;
    }

    /**
     * 添加平台调控
     * @param killRate
     */
    async addControlGame(killRate: number) {
        if (this.controlState) {
            await this.controlState.changeKillRate(killRate);
            return {success: true, killRate};
        }

        const type = this.type === RecordTypes.SCENE ? PlatformControlType.GAME : PlatformControlType.TENANT_GAME;
        const result = await PlatformControlStateDao.findOne({platformId: this.platformId, nid: this.nid,
            tenantId: this.tenantId, type});

        if (!result) {
            this.controlState = buildControlState({
                    platformId: this.platformId, nid: this.nid, killRate: killRate / 100, tenantId: this.tenantId},
                type);
            // 这个月的打码 和 系统收益
            const monthBill = await PlatformControlDao.getMonthlyGameBill(
                {platformId: this.platformId, nid: this.nid, tenantId: this.tenantId, type: this.type});

            this.controlState.init(monthBill.betGoldAmount, monthBill.profit);
            await this.controlState.createToDB();

            return {success: true, killRate};
        } else {
            this.controlState = buildControlState({
                    platformId: this.platformId, nid: this.nid, killRate: result.killRate, tenantId: this.tenantId},
                type);

            await this.controlState.changeKillRate(killRate);
        }

        return {success: true, killRate};
    }

    change(sheet: SheetDTO) {
        const scene = this.sceneList.find(s => s.sceneId === sheet.sceneId);

        if (!scene) {
            logger.warn(`PlatformControlGame 未找到场, 数据 nid:${sheet.nid}, sceneId:${sheet.sceneId}` );
            return;
        }

        scene.dealWithSheet(sheet);

        if (this.controlState) {
            this.controlState.change(sheet.betGold, sheet.profit);
        }
    }

    /**
     * 汇总
     */
    summary(backend = false) {
        const data = this.sceneList.map(s => s.getBaseData());

        return {
            nid: this.nid,
            details: backend ? this.sceneList.map(s => s.getBaseData(true)) : data,
            comprehensive: summaryList(data),
            killRateConfig: this.getKillRateConfig(),
        }
    }
}