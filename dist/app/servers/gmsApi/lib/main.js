"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nestRun = void 0;
const core_1 = require("@nestjs/core");
const app_module_1 = require("./modules/main/app.module");
const session = require("express-session");
const httpException_filter_1 = require("./support/code/httpException.filter");
const validate_pipe_1 = require("./support/code/validate.pipe");
const swagger_1 = require("./swagger");
const checkTransformData_pipe_1 = require("./support/code/checkTransformData.pipe");
const pinus_1 = require("pinus");
async function nestRun() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { logger: ['error', 'warn'] });
    if ("development" === pinus_1.pinus.app.get("env")) {
        (0, swagger_1.setupSwagger)(app);
    }
    app.enableCors();
    app.use(session({
        secret: 'development',
        cookie: {
            maxAge: 24 * 60 * 60 * 1000,
            secure: true
        },
        resave: false,
        saveUninitialized: true
    }));
    app.useGlobalPipes(new checkTransformData_pipe_1.CheckTransformDataPipe(), new validate_pipe_1.ValidationPipe());
    app.useGlobalFilters(new httpException_filter_1.HttpExceptionFilter());
    await app.listen(3320);
}
exports.nestRun = nestRun;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2FwcC9zZXJ2ZXJzL2dtc0FwaS9saWIvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBMkM7QUFDM0MsMERBQXNEO0FBQ3RELDJDQUEyQztBQUMzQyw4RUFBMEU7QUFDMUUsZ0VBQThEO0FBQzlELHVDQUF5QztBQUN6QyxvRkFBZ0Y7QUFDaEYsaUNBQThCO0FBRXZCLEtBQUssVUFBVSxPQUFPO0lBQzNCLE1BQU0sR0FBRyxHQUFHLE1BQU0sa0JBQVcsQ0FBQyxNQUFNLENBQUMsc0JBQVMsRUFBRSxFQUFFLE1BQU0sRUFBRSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDL0UsSUFBSSxhQUFhLEtBQUssYUFBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDMUMsSUFBQSxzQkFBWSxFQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ25CO0lBQ0QsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ2pCLEdBQUcsQ0FBQyxHQUFHLENBQ0wsT0FBTyxDQUFDO1FBQ04sTUFBTSxFQUFFLGFBQWE7UUFDckIsTUFBTSxFQUFFO1lBQ04sTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUk7WUFDM0IsTUFBTSxFQUFFLElBQUk7U0FDYjtRQUNELE1BQU0sRUFBRSxLQUFLO1FBQ2IsaUJBQWlCLEVBQUUsSUFBSTtLQUN4QixDQUFDLENBQ0gsQ0FBQztJQUtGLEdBQUcsQ0FBQyxjQUFjLENBQUMsSUFBSSxnREFBc0IsRUFBRSxFQUFFLElBQUksOEJBQWMsRUFBRSxDQUFDLENBQUM7SUFDdkUsR0FBRyxDQUFDLGdCQUFnQixDQUFDLElBQUksMENBQW1CLEVBQUUsQ0FBQyxDQUFDO0lBQ2hELE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN6QixDQUFDO0FBeEJELDBCQXdCQyJ9