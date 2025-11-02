
/**
 * @property OnlieWithUid                   在线玩家uid
 * @property OnlieInfo                      在线玩家信息（包含机器人）
 * @property OnlieInfoWithoutRobot          在线真实玩家信息
 * @property SystemNotice                   公告
 * @property CallCenter                     客服信息
 * @property CustomerPayInfo                客服充值记录
 * @property SystemConfig                   系统配置
 * @property SystemGames                    游戏信息
 * @property SystemScenes                   场信息
 * @property SystemRooms                    房间信息
 * @property ServerMaxNumberPlayers         服务器最大承载数
 * @property ServerCurrentNumbersPlayers    服务器当前承载数
 * @property GameJackpot                    游戏奖池
 * @property GAME_TYPE                      游戏有哪些类型
 * @property GameDishRoadChannel            Redis消息通道 : 用于公共内存统计和判断玩家是否订阅
 * @property DayLoginPlayer                 今日登陆的玩家
 * @property DayCreatePlayer                今日新增玩家
 */
export enum DB1 {
    OnlieWithUid = 'hall:online_uid_set',
    OnlieInfo = 'hall:online_game_hash',
    OnlieInfoWithoutRobot = 'hall:online_game_no_robot_hash',
    SystemNotice = 'hall:system_notice',
    CallCenter = 'hall:callCenter',
    CustomerPayInfo = 'hall:customer_pay_info',
    SystemConfig = 'hall:system_config',
    // SystemGames = 'hall:system_games',
    SystemScenes = 'hall:scenes',
    SystemRooms = 'hall:rooms',
    ServerMaxNumberPlayers = 'cluster:maxNumberPlayers',
    ServerCurrentNumbersPlayers = 'cluster:currentNumberPlayers',
    IsolationRoomPool = 'isolationRoom',
    GameJackpot = 'hall:game_jackpot',
    GAME_TYPE = 'hall:system_game_type',
    GameDishRoadChannel = 'hall:GameDishRoad',
    DayLoginPlayer = 'hall:DayLoginPlayer',
    DayCreatePlayer = 'hall:DayCreatePlayer',
    /** 第三方平台api */
    thirdApiAuthToken = 'thirdApi:token',
    platformNameAgentList = 'thirdApi:platformAgent',
    platformKillRate = 'thirdApi:platformKillRate',
    platformAgentUid = 'thirdApi:platformAgentUid',
    platformCloseGame = 'thirdApi:platformCloseGame',
    warnGoldConfig = 'thirdApi:warnGold',
    TenantBetKill = 'control:tenant:bet_kill',
    TenantReturnAwardRateKill = 'control:tenant:return_award_rate',
    TenantTotalBetKill = 'control:tenant:total_bet_kill',
    TenantGame = 'control:tenant:game',
    AlarmEvent_Thing = "Sp:AlarmEvent_Thing",
    AlarmEvent_Thing_Length = "Sp:AlarmEvent_Thing_Length",
    ThirdGold_Length = "Sp:ThirdGold_Length",
    ThirdGold = "Sp:ThirdGold",
    ServerList = "Sp:ServerList",
}

export enum DB2 {
    RealPlayer = "Sp:player",
    playerAgent = "Sp:playerAgent",
    Robot = "Sp:robot",
    BigWinNotice = "Sp:bigWinNotice",
    Online_game_hash = "Sp:online_game_hash",
    Black_ip = "Sp:black_ip",
    FileExportData = "Sp:FileExportData",
    Online_max = "Sp:online_max",
    DayLoginPlayer = "Sp:dayLoginPlayer",
    player_in_room = "Room:PlayerCounts",
    robot_in_room = "Room:RobotCounts",
    DayCreatePlayer = "Sp:dayCreatePlayer",
    GameRecord = "Sp:gameRecord",
    AUTH_CODE = "Sp:AUTH_CODE",
    white_ip = "Sp:whiteIp",
    manager_info = "manager:manager_info",
    tenantOperationalData = "Sp:TenantOperationalData",
    tenantGameData = "Sp:TenantGameData",
    platformProfitAndLossData = "Sp:PlatformProfitAndLossData",
    agentProfitAndLossData = "Sp:AgentProfitAndLossData",
    RobotLeaveTaskQueue = "Task:RobotLeave",
    RestPlayerTaskQueue = "Task:RestPlayer",
    LowerPlayerMoney = "Task:LowerPlayerMoney",
    AddPlayerMoney = "Task:AddPlayerMoney",
    ChangePlayerMoney = "Task:ChangePlayerMoney",
    SHARE_TENANT_ROOM_SITUATION_KEY = "Task:test_tenant_room_situation",
    IPL_token = "IPL:token"
}

export enum DB3 {
    game = "Sys:game",
    commission = "Sys:gameCommission",
    systemConfig = 'Sys:systemConfig',
    shopGold = 'Sys:shopGold',
    gameType = 'Sys:systemGameType',
    scene = "Sys:scene",
    room = "Sys:room",
}


export enum DB4 {
    GameRecordData = "Sp:GameRecordData",

}