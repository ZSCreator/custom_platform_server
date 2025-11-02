import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsBoolean, IsNegative } from "class-validator";

export class ReducePlayerGoldDTO {
    @ApiProperty({
        required: true,
        description: "用户编号",
        example: "000000000"
    })
    @IsNotEmpty({ message: "uid不能为空" })
    @IsString({ message: "必须是字符串" })
    uid: string;

    @ApiProperty({
        required: true,
        description: "用户名",
        example: "大帅比"
    })
    @IsNotEmpty({ message: "不能为空" })
    @IsString({ message: "必须是字符串" })
    userName: string;

    @ApiProperty({
        description: "钱包",
    })
    walletGold: number;

    @ApiProperty({
        description: "持有金币",
        example: -10
    })
    @IsNegative({ message: "必须为负整数" })
    orderPrice: number;

    @ApiProperty({
        description: "邮件内容",
        example: ""
    })
    emailContent: string;

    @ApiProperty({
        description: "是否邮件通知",
        example: false
    })
    @IsBoolean()
    beSendEmail: boolean;
}