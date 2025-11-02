import {PlayerInfo} from "../../pojo/entity/PlayerInfo";

/**
 * 游戏状态
 * GAME 游戏进行中
 * LEISURE 空闲
 */
enum State {
    GAME,
    LEISURE,
}

export default class SlotMachinePlayer extends PlayerInfo {
    private state: State = State.LEISURE;

    /**
     * 改变为游戏状态
     */
    changeGameState() {
        this.state = State.GAME;
    }

    /**
     * 改边为空闲状态
     */
    changeLeisureState() {
        this.state = State.LEISURE;
    }

    /**
     * 是否是游戏状态
     */
    isGameState() {
        return this.state === State.GAME;
    }

    /**
     * 设置离线
     */
    setOffline() {
        this.onLine = false;
    }

    /**
     * 设置离线
     */
    setOnline() {
        this.onLine = true;
    }
}