import { IBaseScene } from "../../../../common/interface/IBaseScene";
import { BlackJackRoomImpl } from "../BlackJackRoomImpl";
export interface IBlackJackScene extends IBaseScene {
    /** 最低下注 */
    lowBet: number;

    tallBet: number;
    roomList: BlackJackRoomImpl[];
}
