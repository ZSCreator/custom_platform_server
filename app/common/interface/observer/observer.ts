/**
 * 观察者接口
 * @property themeName 观察的主题
 */
export interface IObserver {
    themeName: string;

    update(message?: any): Promise<any>;
    update(message?: any): any;
}