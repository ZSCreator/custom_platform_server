import { Application, RouteCallback, FrontendSession } from "pinus";
import { sessionSet, sessionInfo } from "../sessionService";

export async function redPacketRouteDispatch(session: FrontendSession, msg: any, app: Application, callBack: RouteCallback) {
    const { args: [{ route }, { }] } = msg;

    const serverId = session.get('backendServerId');

    callBack(null, serverId);

}
