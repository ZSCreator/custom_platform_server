import { ApiProperty } from "@nestjs/swagger";
import { Max, IsInt,IsNotEmpty } from "class-validator";

export class UpdateOneTelegramCustomerDTO {
    @ApiProperty({
        required: true,
        description: "客服编号",
        example: 1
    })
    @IsNotEmpty()
    id: number;

    @ApiProperty({
        description: "链接地址",
        example: "https://t.me/andy127"
    })
    // @Min(0)
    url: string;

    @ApiProperty({
        description: "昵称",
        example: "andy"
    })
    // @Min(0)
    nickname: string;

    @ApiProperty({
        description: "下发比例,总和不能超过100",
        example: 20
    })
    @Max(100)
    per: number;

    @ApiProperty({
        description: "状态: 0停用,1启用",
        example: 1
    })
    @IsInt()
    status: number;
}