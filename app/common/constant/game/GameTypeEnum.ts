/**
 *  游戏类型
 */
export enum GameTypeEnum {
    /** @property HeroFight  全部游戏 */
    ALL_GAME = 1,
    /** @property HeroFight  常用游戏 */
    COMMON_GAME = 2,
    /** @property HeroFight  棋牌游戏 */
    QIPAI_GAME = 3,
    /** @property HeroFight  刺激游戏 */
    CIJI_GAME = 4,
    /** @property HeroFight  真人视讯 */
    ZHENREN_GAME = 5,
    /** @property HeroFight  彩票足球 */
    CAIPIAO_GAME = 6,
    /** @property HeroFight  街机电玩 */
    SLOTS_GAME = 7,
}

/**
 * 内部游戏类型
 */
export enum InteriorGameType {
    None,
    // 百人游戏
    Br,
    // 对战游戏
    Battle,
    // 电玩游戏
    Slots
}

export const GameTypeEnumList = [
    {name:'全部游戏' , typeId:1},
    {name:'常用游戏' , typeId:2},
    {name:'棋牌游戏' , typeId:3},
    {name:'刺激游戏' , typeId:4},
    {name:'真人视讯' , typeId:5},
    {name:'彩票足球' , typeId:6},
    {name:'街机电玩' , typeId:7},
];

export enum GameTypeNameEnum {

    /** @property HeroFight  全部游戏 */
    ALL_GAME = "全部游戏",
    /** @property HeroFight  常用游戏 */
    COMMON_GAME = "常用游戏",
    /** @property HeroFight  棋牌游戏 */
    QIPAI_GAME = "棋牌游戏",
    /** @property HeroFight  刺激游戏 */
    CIJI_GAME = "刺激游戏",
    /** @property HeroFight  真人视讯 */
    ZHENREN_GAME = "真人视讯",
    /** @property HeroFight  彩票足球 */
    CAIPIAO_GAME = "彩票足球",
    /** @property HeroFight  街机电玩 */
    SLOTS_GAME = "街机电玩",

}
