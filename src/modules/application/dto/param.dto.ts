import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, Length } from "class-validator";

export class InsertReasonsRevDto {

    @Type(() => Number)
    @IsNumber({}, { message: "debe ser numerico" })
    goodInNumber: number;

    @Type(() => Number)
    @IsNumber({}, { message: "debe ser numerico" })
    eventInId: number;

    @Type(() => String)
    @IsString({ message: "debe ser cadena de texto" })
    reasonsIn: string;

    @Type(() => Number)
    @IsNumber({}, { message: "debe ser numerico" })
    reasonsInNumber: string;

    @Type(() => String)
    @IsString({ message: "debe ser cadena de texto" })
    actionIn: string;

}