'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const UserManager = require("../../app/dao/domainManager/hall/userManager");
const DatabaseService = require("../../app/services/databaseService");
const dbMongo = require('../../config/db/mongo.json');
DatabaseService.initConnection({
    "host": dbMongo.production.host,
    "port": dbMongo.production.port,
    "user": dbMongo.production.user,
    "pwd": dbMongo.production.pwd,
    "name": dbMongo.production.name,
});
exports.run = async () => {
    const userList = await UserManager.findUserList({
        $and: [
            { 'cellPhone': { $not: /^[+]86.*/ } },
            { 'cellPhone': /^.*[0-9].*/ }
        ]
    }, null);
    console.log(`size => ${userList.length}`);
    for (let index in userList) {
        let user = userList[index];
        if (/^86/.test(user.cellPhone)) {
            user.cellPhone = '+' + user.cellPhone;
        }
        else {
            user.cellPhone = '+86' + user.cellPhone;
        }
        console.log(`${user.uid} => ${user.cellPhone}`);
        UserManager.updateOneUser(user, ['cellPhone'], true);
    }
};
exports.run();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRml4VXNlckluZm9DZWxsUGhvbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90b29scy9ob3RmaXgvRml4VXNlckluZm9DZWxsUGhvbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOztBQU1iLDRFQUE0RTtBQUM1RSxzRUFBdUU7QUFDdkUsTUFBTSxPQUFPLEdBQUcsT0FBTyxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFFdEQsZUFBZSxDQUFDLGNBQWMsQ0FBQztJQUMzQixNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJO0lBQy9CLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7SUFDL0IsTUFBTSxFQUFFLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSTtJQUMvQixLQUFLLEVBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHO0lBQzlCLE1BQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUk7Q0FDbEMsQ0FBQyxDQUFDO0FBRVUsUUFBQSxHQUFHLEdBQUcsS0FBSyxJQUFJLEVBQUU7SUFFMUIsTUFBTSxRQUFRLEdBQUcsTUFBTSxXQUFXLENBQUMsWUFBWSxDQUFDO1FBQzVDLElBQUksRUFBRTtZQUNGLEVBQUUsV0FBVyxFQUFFLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUFFO1lBQ3JDLEVBQUUsV0FBVyxFQUFFLFlBQVksRUFBRTtTQUNoQztLQUNKLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDUixPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7SUFFekMsS0FBSyxJQUFJLEtBQUssSUFBSSxRQUFRLEVBQUU7UUFDeEIsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQzFCLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDNUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQTtTQUN4QzthQUFNO1lBQ0gsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQTtTQUMxQztRQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxPQUFPLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFBO1FBQy9DLFdBQVcsQ0FBQyxhQUFhLENBQUMsSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUE7S0FDdkQ7QUFDTCxDQUFDLENBQUE7QUFFRCxXQUFHLEVBQUUsQ0FBQSJ9