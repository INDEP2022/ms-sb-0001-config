import { Controller, Get, HttpStatus } from "@nestjs/common";
import { ApiCreatedResponse } from "@nestjs/swagger";
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger/dist";

import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { Body, Post, Query } from "@nestjs/common/decorators";
import { ApplicationService } from "./application.service";
// import { QueryParams, ResponseDataDTO } from "sigebi-lib-common";

@ApiTags('config applications ')
@Controller('config/apps')
export class ApplicationController {
    constructor(private readonly service: ApplicationService) { }

    @ApiOperation({ summary: 'Procedure insertMotivosRev' })
    // @ApiResponse({
    //     status: 200,
    //     type: ResponseDataDTO
    // })
    @Post("/insertMotivosRev")
    async registerGoodTrackerNsbdb1(@Body() goodInNumber: number, eventInId: number, reasonsIn: string, reasonsInNumber: string, actionIn: string) {
        return this.service.insertMotivosRev(goodInNumber, eventInId, reasonsIn, reasonsInNumber, actionIn);
    }
}