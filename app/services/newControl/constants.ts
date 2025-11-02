/**
 * 调控的三种状态
 * @property NONE 不调控
 * @property SYSTEM_WIN 系统赢
 * @property PLAYER_WIN 玩家赢
 */
export enum ControlState {
    NONE,
    SYSTEM_WIN,
    PLAYER_WIN,
}

export enum ControlKinds {
    NONE,
    PERSONAL,
    SCENE,
    PLATFORM
}

/**
 * 记录类型
 */
export enum RecordTypes {
    ALL = '1',
    SCENE = '2',
    TENANT_SCENE = '3',
}

/**
 * 平台调控类型
 */
export enum PlatformControlType {
    PLATFORM = '1',
    GAME = '2',
    TENANT = '3',
    TENANT_GAME = '4',
}

/**
 * 调控类型
 *
 */
export enum ControlTypes {
    /** 平台调控系统赢 */
    platformControlWin,

    /** 平台调控系统输 */
    platformControlLoss,

    /** 场控系统赢 */
    sceneControlWin,

    /** 场控系统输 */
    sceneControlLoss,

    /** 个人调控系统赢（包含必杀调控 */
    personalControlWin,

    /** 个人调控系统输 */
    personalControlLoss,

    /** 未调控 */
    none
}