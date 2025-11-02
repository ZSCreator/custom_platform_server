import { ApiProperty } from "@nestjs/swagger";
import { Min } from "class-validator";

export class findListTelegramCustomerDTO {

    @ApiProperty({
        required: true,
        description: "页数",
        example: 1
    })
    @Min(0)
    page: number;

    @ApiProperty({
        required: true,
        description: "每页展示条数",
        example: 20
    })
    @Min(0)
    pageSize: number;

}