import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsBoolean, Min, IsPositive } from "class-validator";

export class GetPayInfoDTO {

    @ApiProperty({
        required: false,
        description: "用户编号",
        example: "000000000"
    })
    // @IsNotEmpty({ message: "uid不能为空" })
    // @IsString({ message: "必须是字符串" })
    uid: string;

    @ApiProperty({
        required: true,
        description: "页数",
        example: 1
    })
    @Min(0)
    page: number;

    @ApiProperty({
        required: true,
        description: "每页数量",
        example: 20
    })
    @Min(0)
    pageSize: number;

    @ApiProperty({
        required: false,
        description: "开始时间",
        example: 12312312
    })
    startTime: string;

    @ApiProperty({
        required: false,
        description: "结束时间",
        example: 12312312
    })
    endTime: string;

    @ApiProperty({
        description: "充值途径"
    })
    remark: string;

}