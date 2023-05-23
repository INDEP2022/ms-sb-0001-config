import { Injectable, HttpStatus, HttpException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CatReasonsrevEntity } from "../infrastructure/entities/cat-reasonsrev.entity";
import { EatEventsEntity } from "../infrastructure/entities/eat-events.entity";
import { GoodsStatusrevEntity } from "../infrastructure/entities/goods-statusrev.entity";
import { ResponsibleAttentionEntity } from "../infrastructure/entities/responsible-attention.entity";
import { InsertReasonsRevDto } from "./dto/param.dto";


@Injectable()
export class ApplicationService {

    constructor(
        @InjectRepository(EatEventsEntity) private EatEventsRepository: Repository<EatEventsEntity>,
        @InjectRepository(CatReasonsrevEntity) private CatReasonsrevRepository: Repository<CatReasonsrevEntity>,
        @InjectRepository(ResponsibleAttentionEntity) private ResponsibleAttentionRepository: Repository<ResponsibleAttentionEntity>,
        @InjectRepository(GoodsStatusrevEntity) private GoodsStatusrevRepository: Repository<GoodsStatusrevEntity>,

    ) { }
    /**
     * PROCEDURE "SERA"."SP_INSERTA_MOTIVOSREV"'
     *
     * @param {number} dto.goodInNumber = NO_BIEN_IN
     * @param {number} dto.eventInId = ID_EVENTO_IN
     * @param {string} fto.reasonsIn = MOTIVOS_IN
     * @param {number} dto.reasonsInNumber = NO_MOTIVOS_IN
     * @param {string} dto.actionIn = ACCION_IN
     * @memberof ApplicationService
     * @returns {Promise<any>}
    */
    async insertReasonsRev(dto: InsertReasonsRevDto): Promise<any> {
        try {
            let vQuery: any, //V_QUERY
                vQuery2: any, //V_QUERY2
                vQuery3: any, //V_QUERY3
                address: string, //DIREC
                responsible: string = 'RESPONSABLE_', //RESPONSABLE
                counter: number = 0, //CONTADOR
                areaResp: string, //AREA_RESP
                respon: string, //RESPON
                exists: boolean, //EXISTE
                columns: string, //COLUMNAS
                values: string, //VALORES
                motCount: number = 0, //MOT_COUNT
                statusIni: string = 'AVA', //ESTATUS_INI
                goodNumberRe: number; //NO_BIEN_RE

            const qb = this.EatEventsRepository.createQueryBuilder()
                .select('address')
                .where('eventId = :id_evento', { id_evento: dto.eventInId });
            address = await qb.getRawOne();

            if (dto.actionIn === "I") {
                const qbSelectNoBienRe = this.GoodsStatusrevRepository.createQueryBuilder()
                    .select('goodNumber')
                    .where('goodNumber = :no_bien', { no_bien: dto.goodInNumber })
                    .andWhere('eventId = :id_evento', { id_evento: dto.eventInId })
                    .andWhere('statusInitial = :estatus_inicial', { estatus_inicial: statusIni })
                    .andWhere('goodType = :tipo_bien', { tipo_bien: address });

                // Execute query
                const result = await qbSelectNoBienRe.getRawOne();
                goodNumberRe = result ? result.goodNumber : null;

                if (!goodNumberRe) {
                    const qbInsertNoBienRe = this.GoodsStatusrevRepository.createQueryBuilder('be')
                        .insert()
                        .into('be')
                        .values([
                            { no_bien: dto.goodInNumber, tipo_bien: address, id_evento: dto.eventInId, estatus_inicial: statusIni, motivos: dto.reasonsIn }
                        ]);

                    // Execute query
                    await qbInsertNoBienRe.execute();
                }

                const qbSelectvQuery2 = this.CatReasonsrevRepository.createQueryBuilder()
                    .select('areaResponsible')
                    .where('reasonId IN (:id_motivo)', { id_motivo: dto.reasonsInNumber });

                vQuery2 = await qbSelectvQuery2.getCount();
                motCount = vQuery2;

                const qbSelectvQuery = this.CatReasonsrevRepository.createQueryBuilder()
                    .select('areaResponsible')
                    .where('reasonId IN (:id_motivo)', { id_motivo: dto.reasonsInNumber })
                    .orderBy('areaResponsible', 'ASC');

                vQuery = await qbSelectvQuery.execute();

                for (let index = 0; index < vQuery.length; index++) {
                    counter++;
                    areaResp = vQuery[ index ].area_responsable;
                    const qsSelectExiste = this.ResponsibleAttentionRepository.createQueryBuilder()
                        .select('goodNumber')
                        .where('goodNumber = :no_bien', { no_bien: dto.goodInNumber })
                        .andWhere('statusInitial = :estatus_inicial', { estatus_inicial: statusIni });

                    // Execute query
                    exists = await qsSelectExiste.getExists();

                    if (exists) {
                        if (counter <= motCount) {
                            columns = ", ";
                            values = ",' ";
                        }
                        columns = columns + responsible + counter;
                        values = values + areaResp;
                    }
                }

                if (columns && values) {
                    vQuery3 = `INSERT INTO SERA.RESPONSABLES_ATENCION (NO_BIEN, ID_EVENTO, ESTATUS_INICIAL${columns})
                    VALUES( '${dto.goodInNumber}', '${dto.eventInId}', '${statusIni}' ${values}')`;
                    // Execute query
                    await this.ResponsibleAttentionRepository.query(vQuery3)

                    respon = "Ejecución de insert exitoso";
                    // TODO: descomentar este await cuando esté listo paSeparaMotivos
                    // await this.paSeparaMotivos(dto.goodInNumber, dto.eventInId);
                }
            } else if (dto.actionIn === "D") {
                const qbDelete1 = this.GoodsStatusrevRepository.createQueryBuilder()
                    .delete()
                    .where('goodNumber = :no_bien', { no_bien: dto.goodInNumber })
                    .andWhere('goodType = :tipo_bien', { tipo_bien: address })
                    .andWhere('statusInitial = :estatus_inicial', { estatus_inicial: statusIni })
                    .andWhere('eventId = :id_evento', { id_evento: dto.eventInId });

                await qbDelete1.execute();

                const qbDelete2 = this.ResponsibleAttentionRepository.createQueryBuilder()
                    .delete()
                    .where('goodNumber = :no_bien', { no_bien: dto.goodInNumber })
                    .andWhere('statusInitial = :estatus_inicial', { estatus_inicial: statusIni })
                    .andWhere('eventId = :id_evento', { id_evento: dto.eventInId });

                await qbDelete2.execute();

                respon = "Ejecución de delete exitoso"
            }
            return {
                data: [respon],
                statusCode: HttpStatus.OK,
                message: 'OK'
            };
        } catch (e) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: e.message,
            };
        }
    }

    /**
     * PROCEDURE "SERA"."PA_SEPARA_MOTIVOS"
     *
     * @param {number} dto.goodInNumber
     * @param {number} dto.eventInId
     */
    async paSeparaMotivos(goodInNumber: number, eventInId: number) {
        throw new Error("Function not implemented.");
    }
}