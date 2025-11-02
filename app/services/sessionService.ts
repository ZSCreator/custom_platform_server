import { FrontendSession, BackendSession, } from 'pinus';
import { ISessionDTO } from '../common/pojo/dto/ISessionDTO';
/**
 * session 设置
 */
export function sessionSet(session: BackendSession | FrontendSession, settings: { [key: string]: any }) {
    for (const k in settings) {
        session.set(k, settings[k]);
    }
    return new Promise(resolve => {
        session.pushAll(() => {
            return resolve({});
        });
    });
};

/**
 * session 获取
 */
export function sessionInfo(session: BackendSession | FrontendSession): ISessionDTO {
    return {
        uid: session.uid || session.get("uid"),
        nid: session.get('nid'),
        isRobot: session.get('isRobot'),
        sceneId: session.get('sceneId'),
        roomId: session.get('roomId'),
        frontendServerId: session.get('frontendServerId'),
        backendServerId: session.get('backendServerId'),
        isVip: session.get('isVip'),
        viper: session.get('viper'),
        language: session.get('language')
    }
}