import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UidMatchNickNameDTO {
    @ApiProperty({
        required: true,
        description: "用户编号",
        example: "000000000"
    })
    @IsNotEmpty({ message: "uid不能为空" })
    @IsString({ message: "必须是字符串" })
    uid: string;
}