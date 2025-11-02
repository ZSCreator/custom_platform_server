import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsBoolean, Min, IsInt } from "class-validator";

export class ChangePayTypeDTO {
    @ApiProperty({
        required: true,
        description: "主键"
    })
    @IsNotEmpty({
        message: "不能为空"
    })
    @IsString({
        message: "必须是字符串"
    })
    _id: string;

    @ApiProperty({
        required: true,
        description: "充值类型名称",
        example: "xx支付"
    })
    @IsNotEmpty({
        message: "不能为空"
    })
    @IsString({
        message: "必须是字符串"
    })
    name: string;

    @ApiProperty({
        required: true,
        description: "是否开启",
        example: false
    })
    @IsBoolean()
    isOpen: Boolean;

    @ApiProperty({
        required: true,
        description: "商户名称",
        example: "xx支付"
    })
    @IsNotEmpty({ message: "不能为空" })
    @IsString({ message: "必须是字符串" })
    shanghu: string;

    @ApiProperty({
        description: "费率",
        example: "0"
    })
    @IsInt()
    @Min(0)
    rate: number;

    @ApiProperty({
        description: "图标地址",
        example: "0"
    })
    url: string;

    @ApiProperty({
        description: "回调延迟"
    })
    callBackDelay: number;

    @ApiProperty({
        description: "备注信息"
    })
    remark: string;

    @ApiProperty({
        description: "图标"
    })
    icon: string;

    @ApiProperty({
        description: "排序"
    })
    @IsInt()
    sort: number;
}
