/**
 * 被观察者
 * @property themeName 观察的主题
 */
export interface ISubject {
    themeName: string;

    /**
     * 注册
     */
    registration(observer?: any): Promise<any>;
    registration(observer?: any): any;

    /**
     * 取消注册
     */
    unregister(observer?: any): Promise<any>;
    unregister(observer?: any): any;


    /**
     * 调用
     * @param msg
     */
    invoke(msg?: any): any;
    invoke(msg?: any): Promise<any>;
}