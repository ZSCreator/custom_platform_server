import { Logger } from "pinus";
import { getLogger } from "pinus-logger";
import { BlackJackRoomImpl } from "../../BlackJackRoomImpl";

/**
 * 庄家行为策略
 */
export class BlackJackDealerActionStrategy {

    private logger: Logger;

    private room: BlackJackRoomImpl;

    static roomIdList: string[] = [];

    static instanceMap: object = {};

    static getInstance(room: BlackJackRoomImpl, paramRoomId: string): BlackJackDealerActionStrategy {
        if (this.roomIdList.findIndex(roomId => roomId === paramRoomId) < 0) {
            this.roomIdList.push(paramRoomId);
            this.instanceMap[paramRoomId] = new BlackJackDealerActionStrategy(room)
        }

        return this.instanceMap[paramRoomId];
    }

    constructor(room: BlackJackRoomImpl) {
        this.room = room;

        this.logger = getLogger('server_out', __filename);
    }

    checkHandPoker() {

    }
    
}
