"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_1 = require("@nestjs/swagger");
const constants_1 = require("./constants");
const setupSwagger = (app) => {
    const options = new swagger_1.DocumentBuilder()
        .setTitle(constants_1.SWAGGER_API_NAME)
        .setDescription(constants_1.SWAGGER_API_DESCRIPTION)
        .setVersion(constants_1.SWAGGER_API_CURRENT_VERSION)
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, options);
    swagger_1.SwaggerModule.setup(constants_1.SWAGGER_API_ROOT, app, document);
};
exports.setupSwagger = setupSwagger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9hcHAvc2VydmVycy9nbXNBcGkvbGliL3N3YWdnZXIvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsNkNBQWlFO0FBQ2pFLDJDQUtxQjtBQUVkLE1BQU0sWUFBWSxHQUFHLENBQUMsR0FBcUIsRUFBRSxFQUFFO0lBQ3BELE1BQU0sT0FBTyxHQUFHLElBQUkseUJBQWUsRUFBRTtTQUNsQyxRQUFRLENBQUMsNEJBQWdCLENBQUM7U0FDMUIsY0FBYyxDQUFDLG1DQUF1QixDQUFDO1NBQ3ZDLFVBQVUsQ0FBQyx1Q0FBMkIsQ0FBQztTQUN2QyxLQUFLLEVBQUUsQ0FBQztJQUNYLE1BQU0sUUFBUSxHQUFHLHVCQUFhLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUM1RCx1QkFBYSxDQUFDLEtBQUssQ0FBQyw0QkFBZ0IsRUFBRSxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDdkQsQ0FBQyxDQUFDO0FBUlcsUUFBQSxZQUFZLGdCQVF2QiJ9