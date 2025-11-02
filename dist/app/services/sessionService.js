"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionInfo = exports.sessionSet = void 0;
function sessionSet(session, settings) {
    for (const k in settings) {
        session.set(k, settings[k]);
    }
    return new Promise(resolve => {
        session.pushAll(() => {
            return resolve({});
        });
    });
}
exports.sessionSet = sessionSet;
;
function sessionInfo(session) {
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
    };
}
exports.sessionInfo = sessionInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Vzc2lvblNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9hcHAvc2VydmljZXMvc2Vzc2lvblNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBS0EsU0FBZ0IsVUFBVSxDQUFDLE9BQXlDLEVBQUUsUUFBZ0M7SUFDbEcsS0FBSyxNQUFNLENBQUMsSUFBSSxRQUFRLEVBQUU7UUFDdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDL0I7SUFDRCxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ3pCLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFO1lBQ2pCLE9BQU8sT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBVEQsZ0NBU0M7QUFBQSxDQUFDO0FBS0YsU0FBZ0IsV0FBVyxDQUFDLE9BQXlDO0lBQ2pFLE9BQU87UUFDSCxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztRQUN0QyxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7UUFDdkIsT0FBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDO1FBQy9CLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQztRQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUM7UUFDN0IsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQztRQUNqRCxlQUFlLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQztRQUMvQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUM7UUFDM0IsS0FBSyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDO1FBQzNCLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQztLQUNwQyxDQUFBO0FBQ0wsQ0FBQztBQWJELGtDQWFDIn0=