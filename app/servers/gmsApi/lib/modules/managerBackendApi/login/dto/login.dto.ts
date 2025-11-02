import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsArray, IsBoolean, Min, IsPositive, IsNegative } from "class-validator";

export class LoginDTO {
    @ApiProperty({
        description: "后台管理员名称"
    })
    @IsString({ message: "必须是字符串" })
    @IsNotEmpty({ message: "不能为空" })
    userName: string;
    passName: string;
}