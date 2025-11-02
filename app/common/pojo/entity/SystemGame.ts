// 游戏对象定义
export default class SystemGame {
    nid: string;
    /**排序 */
    sort: number
    name: string;
    zname: string;
    roomUserLimit: number;
    onlineAwards: any;
    opened: boolean;
    closeTime: any;
    whetherToShowScene: boolean;// 是否展示场选择
    whetherToShowRoom: boolean;// 是否展示房间选择
    whetherToShowGamingInfo: boolean;// 是否展示游戏内信息(盘路)
    roomCount: number;// 房间数
    constructor(opts) {
        this.nid = opts.nid;                                            // 游戏ID
        this.sort = opts.sort || 1;
        this.name = opts.name || '';                                    // 英文名
        this.zname = opts.zname || '';                                  // 中文名
        this.roomUserLimit = opts.roomUserLimit || 0;                   // 房间人数上限
        this.onlineAwards = opts.onlineAwards || 0;                     // 联机大奖奖池
        this.opened = opts.opened || true;                              // 游戏是否处于开放状态（默认是开放状态）：true是开放状态、false是关闭状态
        this.closeTime = opts.closeTime || 0;                           // 最近一次的游戏关闭时间
        this.whetherToShowScene = opts.whetherToShowScene || false;
        this.whetherToShowRoom = opts.whetherToShowRoom || false;
        this.whetherToShowGamingInfo = opts.whetherToShowGamingInfo || false;
        this.roomCount = opts.roomCount || 1;
    }
}