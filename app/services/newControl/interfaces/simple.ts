
import {ControlState} from "../constants";
import {GameNidEnum} from "../../../common/constant/game/GameNidEnum";

/**
 * 个控调控玩家数据
 * @property uid 玩家唯一uid
 * @property probability 调控概率 -100 <-> 100;
 * @property killCondition 必杀条件
 * @property remark 标记备注
 * @property managerId 调控人
 */
export interface PersonalControlPlayer {
    uid: string;
    probability: number;
    killCondition?: number;
    remark?: string;
    managerId?: string
}


/**
 * 场信息
 * @property nid 场所属游戏nid
 * @property sceneId 场id
 * @property name 场名字
 */
export interface Scene {
   nid: GameNidEnum;
   id: number;
   name?: string
}


/**
 * 调控玩家信息
 * @property uid 玩家uid
 * @property blacklist 黑名单等级
 * @property isBanker 是否是庄
 * @property isRobot 是否是机器人
 * @property isNewPlayer 是否是新玩家
 * @property groupRemark 租户名字
 * @property platformId 平台名字
 */
export interface ControlPlayer {
    uid: string;
    blacklist: number;
    platformId: string;
    groupRemark: string;
    isBanker?: boolean;
    isRobot?: number;
    isNewPlayer?: boolean;
}

/**
 * 场控信息
 */
export interface SceneControlInfo {
    nid: string,                    // 游戏nid
    gameName: string,               // 游戏名称
    sceneName: string,              // 场名称
    baseSystemWinRate: number,      // 系统基础胜率
    sceneId: number,                // 场id
    bankerGame: boolean,            // 有庄游戏
    bankerKillProbability: number,  // 庄杀概率
    weights: number,                // 权重值
    lockPool: boolean,              // 是否锁定奖池
    updateTime?: number,
    createTime?: number,
}

/**
 * 场控对战类游戏单个玩家胜率
 * @property uid 玩家uid
 * @property winRate 玩家胜率
 */
export interface PlayersWinRate {
    uid: string,
    winRate: number
}

/**
 * 调控结果
 * @property personalControlPlayers 个控玩家
 * @property sceneWeights 场控权重值
 * @property sceneControlState 场控状态
 * @property playersWinRate 对战真实胜率
 * @property bankerKill 有场控玩家的玩家
 */
export interface ControlResult {
    personalControlPlayers: PersonalControlPlayer[],
    sceneWeights: number,
    sceneControlState?: ControlState,
    platformControlState?: ControlState,
    isPlatformControl?: boolean,
    playersWinRate?: PlayersWinRate[],
    bankerKill?: boolean;
}

/**
 * 个控
 */
export interface  PersonalControlInfo {
    nid: string,                                                    // 游戏nid
    gameName: string,                                               // 游戏名称
    sceneId: number,                                                // 游戏场
    sceneName: string                                               // 场名字
    conditionDescription: string,                                   // 调控条件描述
    playersCount: number,                                           // 调控玩家
    controlPlayersMap: {[uid: string]: PersonalControlPlayer},      // 调控玩家
    updateTime?: number,                                            // 更新时间
    createTime?: number,                                            // 创建时间
}

/**
 * 后台显示接口
 */
export interface BackendDisplaySceneControl {
    nid: GameNidEnum,                             // 游戏nid
    sceneId: number,                              // 游戏场id
    sceneName: string,                            // 游戏场名称
    gameName: string,                             // 游戏名称
    wights: number,                               // 场控权重值
    poolCorrectedValue: number,                   // 奖池当前修正值
    poolAmount: number,                           // 当前场奖池
    lockPool: boolean,                            // 是否锁定奖池
    bankerKillProbability: number,                // 庄杀概率
}

