"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_1 = require("pinus");
const DatabaseService = require("../../app/services/databaseService");
const dbMongo = require('../../config/db/mongo.json');
const RDSClient_1 = require("../../app/common/dao/mysql/lib/RDSClient");
const sessionService_1 = require("pinus/lib/common/service/sessionService");
const sessionService_2 = require("../../app/services/sessionService");
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
RDSClient_1.RDSClient.demoInit();
async function clean() {
    let session = new sessionService_1.FrontendSession(new pinus_1.Session(1, "", null, null));
    await sessionService_2.sessionSet(session, { uid: "xxxxxxx", roomId: "001", sceneId: 0 });
    pinus_1.pinus.app.components.__server__.handle({
        id: 1,
        route: "BlackJack.mainHandler.bet",
        body: {}
    }, session, (err, resp) => {
        console.warn(`err`, err);
        console.warn(`resp`, resp);
    });
    process.exit();
    return;
}
setTimeout(clean, 2000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFpbkhhbmRsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy9tb25nZGJUb015c3FsL01haW5IYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQTBFO0FBQzFFLHNFQUF1RTtBQUN2RSxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsNEJBQTRCLENBQUMsQ0FBQztBQUN0RCx3RUFBcUU7QUFDckUsNEVBQXdFO0FBQ3hFLHNFQUE2RDtBQUU3RCxlQUFlLENBQUMsY0FBYyxDQUFDO0lBQzNCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLEtBQUssRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUc7SUFDN0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtDQUNsQyxDQUFDLENBQUM7QUFFSCxxQkFBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3JCLEtBQUssVUFBVSxLQUFLO0lBQ2hCLElBQUksT0FBTyxHQUFHLElBQUksZ0NBQWUsQ0FBQyxJQUFJLGVBQU8sQ0FBQyxDQUFDLEVBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2pFLE1BQU0sMkJBQVUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUUsYUFBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQztRQUNuQyxFQUFFLEVBQUMsQ0FBQztRQUNKLEtBQUssRUFBQywyQkFBMkI7UUFDakMsSUFBSSxFQUFDLEVBQUU7S0FDVixFQUFDLE9BQU8sRUFBQyxDQUFDLEdBQUcsRUFBQyxJQUFJLEVBQUMsRUFBRTtRQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBQyxHQUFHLENBQUUsQ0FBQztRQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBQyxJQUFJLENBQUMsQ0FBQztJQUM5QixDQUFDLENBQUMsQ0FBQTtJQUNGLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNmLE9BQU87QUFDWCxDQUFDO0FBQ0QsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQyJ9