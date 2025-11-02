import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsBoolean, Min, IsPositive } from "class-validator";

export class CustomerPayToPlayerDTO {



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
        description: "订单金额",
        example: 50
    })
    @IsPositive({
        message: "订单金额必须为正整数"
    })
    orderPrice: number;

    @ApiProperty({
        required: true,
        description: "新增彩金",
        example: 20
    })
    @Min(0)
    bonus: number;

    @ApiProperty({
        required: true,
        description: "码量",
        example: 70
    })
    @Min(0)
    chips: number;

    @ApiProperty({
        required: true,
        description: "是否发送邮件",
        example: false
    })
    @IsNotEmpty()
    @IsBoolean()
    beSendEmail: boolean;

    @ApiProperty({
        description: "邮件内容",
        example: ""
    })
    @IsString()
    emailContent: string;

    // @ApiProperty({
    //     description: "IP地址",
    //     example: "114.144.114.141"
    // })
    // @IsString()
    // ip: string;

    @ApiProperty({
        description: "备注说明",
        example: "skr"
    })
    @IsString()
    remark: string;


    manager: string;
}
