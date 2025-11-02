import { BlackJackRobotImpl } from "../../robot/BlackJackRobotImpl";
import { ApiResult } from "../../../../../common/pojo/ApiResult";
import { BlackJackState } from "../../../../../common/systemState/blackJack.state";

/**
 * 机器人通信
 */
export class BlackJackRobotAgent {

    robot: BlackJackRobotImpl;

    constructor(robot: BlackJackRobotImpl) {
        this.robot = robot;
    }

    public async loaded(): Promise<false | ApiResult> {
        try {
            return await this.robot.requestByRoute('BlackJack.mainHandler.loaded', {});
        } catch (error) {
            return false;
        }
    }

    /**
     * 加倍
     * @param areaIdx 加倍区域
     */
    public async addMultiple(areaIdx: number) {
        try {
            await this.robot.requestByRoute('BlackJack.mainHandler.addMultiple', { areaIdx });
        } catch (error) {

        }
    }

    /**
     * 分牌
     * @param areaIdx 分牌区域
     */
    public async separatePoker(areaIdx: number) {
        try {
            await this.robot.requestByRoute('BlackJack.mainHandler.separatePoker', { areaIdx });
        } catch (error) {

        }
    }

    /**
     * 要牌
     * @param areaIdx 要牌区域
     * 
     * @description 核心
     */
    public async getOnePoker(areaIdx: number) {
        try {
            await this.robot.requestByRoute('BlackJack.mainHandler.getOnePoker', { areaIdx });
        } catch (error) {

        }
    }

    /**
     * 保险
     * @param areaIdx 保险区域
     */
    public async insurance(areaIdx: number) {
        try {
            await this.robot.requestByRoute('BlackJack.mainHandler.insurance', { areaIdx });
        } catch (error) {

        }
    }

    public destroy() {
        this.robot = null;
    }
}
