import JsonMgr = require('../../config/data/JsonMgr');

export interface robotConfigInterface {
    nid: string,
    open: boolean,
    number: number,
    fenscene: number[],
    name: string
}

/**games.json */
export interface games_inter {
    nid: string,
    // sort: number,
    name: string,
    // hot: boolean,
    minRoom: 5,
    roomUserLimit: number,
    zname: string,
    // topicon: string,
    // sceneType: number,
    lowLimit: number,
    serverName: string,
}
export function get_robotStatus(nid: string) {
    let robotStatus: robotConfigInterface = JsonMgr.get('robot/robotConfig').datas.find(m => m.nid === nid);
    return robotStatus;
}
export function get_all_robotStatus() {
    let robotStatus: robotConfigInterface[] = JsonMgr.get('robot/robotConfig').datas;
    return robotStatus;
}

/**JsonMgr.get('games').datas; */
export function get_games(nid: string) {
    const gamesConfig: games_inter[] = JsonMgr.get('games').datas;
    if (nid) {
        for (const Config of gamesConfig) {
            if (Config.nid == nid) {
                return Config;
            }
        }
    } else {
        // return gamesConfig;
    }
    return null;
}
/**JsonMgr.get('games').datas; */
export function get_games_all() {
    const gamesConfig: games_inter[] = JsonMgr.get('games').datas;
    return gamesConfig;
}

/**
 * 获取游戏的场配置
 * @param name
 */
export function getScenes(name: string) {
    return JsonMgr.get(`scenes/${name}`);
}