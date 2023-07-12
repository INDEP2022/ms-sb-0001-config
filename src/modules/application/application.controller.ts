import { Controller, Get, HttpStatus } from "@nestjs/common";
import { ApiCreatedResponse } from "@nestjs/swagger";
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger/dist";

import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { Body, Param, Post, Query } from "@nestjs/common/decorators";
import { ApplicationService } from "./application.service";
import { ResponseDataDTO } from "src/shared/dto/response.data.dto";
import { InsertReasonsRevDto, ReasonsSeparateDto } from "./dto/param.dto";

@ApiTags('config applications ')
@Controller('application')
export class ApplicationController {
    constructor(private readonly service: ApplicationService) { }

    @ApiOperation({ summary: 'Procedure SP_INSERTA_MOTIVOSREV' })
    @ApiBody({ type: InsertReasonsRevDto })
    @ApiResponse({
        status: 200,
        type: ResponseDataDTO,
    })
    @Post("/insertReasonsRev")
    async insertReasonsRev(@Body() dto: InsertReasonsRevDto) {
        return this.service.insertReasonsRev(dto);
    }

    @ApiOperation({ summary: 'Procedure SP_SEPARA_MOTIVOS' })
    @ApiResponse({
        status: 200,
        type: ResponseDataDTO,
    })
    @Post("/reasonsSeparate")
    async reasonsSeparate(@Body() dto: ReasonsSeparateDto) {
        return this.service.reasonsSeparate(dto);
    }

    @ApiOperation({ summary: 'Procedure PA_OBTIENE_MOTIVOS_CAN' })
    @ApiResponse({
        status: 200,
        type: ResponseDataDTO,
    })
    @Get("/getReasonsCan/:eventId")
    async getReasonsCan(@Param('eventId') eventId: number) {
        return this.service.getReasonsCan(eventId);
    }
}