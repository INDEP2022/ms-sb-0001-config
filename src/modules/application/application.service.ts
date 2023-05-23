import { Injectable, HttpStatus, HttpException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CatReasonsrevEntity } from "../infrastructure/entities/cat-reasonsrev.entity";
import { EatEventsEntity } from "../infrastructure/entities/eat-events.entity";
import { GoodsStatusrevEntity } from "../infrastructure/entities/goods-statusrev.entity";
import { ResponsibleAttentionEntity } from "../infrastructure/entities/responsible-attention.entity";
import { InsertReasonsRevDto, InsertSeparateMotivesDto } from "./dto/param.dto";
import { VGoodsRevEntity } from "../infrastructure/views/v_goods_rev.entity";


@Injectable()
export class ApplicationService {

    constructor(
        @InjectRepository(EatEventsEntity) private EatEventsRepository: Repository<EatEventsEntity>,
        @InjectRepository(CatReasonsrevEntity) private CatReasonsrevRepository: Repository<CatReasonsrevEntity>,
        @InjectRepository(ResponsibleAttentionEntity) private ResponsibleAttentionRepository: Repository<ResponsibleAttentionEntity>,
        @InjectRepository(GoodsStatusrevEntity) private GoodsStatusrevRepository: Repository<GoodsStatusrevEntity>,
        @InjectRepository(VGoodsRevEntity) private VGoodsRevRepository: Repository<VGoodsRevEntity>,
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
                    await this.paSeparaMotivos({ goodNumber: dto.goodInNumber, eventId: dto.eventInId});
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
                data: [ respon ],
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
    async paSeparaMotivos(dto: InsertSeparateMotivesDto) {
        try {
            let vSubindice: number = 0;
            let vSubindice2: number = 0;

            const goodsRev = await this.VGoodsRevRepository.query(`SELECT ESTATUS, RESPONSABLE, MOTIVOS, TIPO_BIEN, ID_EVENTO, LENGTH(RESPONSABLE) TAM_RESP
                FROM SERA.V_BIENES_REV
            ORDER BY TAM_RESP LIMIT 1;`)

            const motivesRev = async (vResponsable, vEstatus, vTipoBien) => {
                const res = await this.VGoodsRevRepository.query(`SELECT DESCRIPCION_MOTIVO
                FROM SERA.CAT_MOTIVOSREV
               WHERE AREA_RESPONSABLE = '${vResponsable}'
                 AND ESTATUS_INICIAL = '${vEstatus}'
                 AND TIPO_BIEN = '${vTipoBien}'; `)
                return res
            }

            for (const goodRev of goodsRev) {
                console.log(goodRev)

                const res = await motivesRev(goodRev.responsable, goodRev.estatus, goodRev.tipo_bien)
                console.log(res)
                for (const motiveRev in res) {
                    const valor = await this.VGoodsRevRepository.query(`SELECT * FROM SERA.FA_CUENTA_PALABRAS('${goodRev.motivos}','/')`)

                    for (let x = 0; x < (valor[ 0 ].fa_cuenta_palabras + 1); x++) {
                        const word = await this.VGoodsRevRepository.query(`SELECT * FROM SERA.GETWORD('${goodRev.motivos}','/',${x})`)
                        if (word[ 0 ].getword == valor[ 0 ].descripcion_motivo) {

                            const valResponsable = await this.VGoodsRevRepository.query(`SELECT * FROM SERA.FA_CUENTA_PALABRAS('${goodRev.responsable}','/')`)
                            const fdeladmbien = await this.VGoodsRevRepository.query(`SELECT * FROM SERA.FA_DELADMBIEN('${dto.goodNumber}','/',${x})`)
                            if ((valResponsable[ 0 ].fa_cuenta_palabras + 1) == 1) {
                                vSubindice = vSubindice + 1
                                if (vSubindice == 1) {
                                    await this.VGoodsRevRepository.query(`INSERT INTO BIENES_MOTIVOSREV
                                (NO_BIEN, ID_EVENTO, TIPO_BIEN, ESTATUS, RESPONSABLE, DELEGACION, MOTIVO1, FEC_ESTATUS)
                            VALUES
                                (${dto.goodNumber}, ${dto.eventId}, ${goodRev.tipo_bien}, ${goodRev.estatus},${goodRev.responsable}, ${fdeladmbien[ 0 ].fa_deladmbien}, ${word[ 0 ].getword}, SYSDATE);`)
                                } else if (vSubindice > 1) {
                                    await this.VGoodsRevRepository.query(`UPDATE SERA.BIENES_MOTIVOSREV 
                                SET MOTIVO${vSubindice} = ${word[ 0 ].getword} 
                              WHERE NO_BIEN = ${dto.goodNumber}
                                AND RESPONSABLE = '${goodRev.responsable}'`)
                                }
                            } else if ((valResponsable[ 0 ].fa_cuenta_palabras + 1) > 1) {
                                for (let z = 0; z < (valResponsable[ 0 ].fa_cuenta_palabras + 1); z++) {
                                    const wordResponsable = await this.VGoodsRevRepository.query(`SELECT * FROM SERA.GETWORD('${goodRev.responsable}','/',${z})`)
                                    if (vSubindice2 == 1) {
                                        await this.VGoodsRevRepository.query(`INSERT INTO BIENES_MOTIVOSREV
                                (NO_BIEN, ID_EVENTO, TIPO_BIEN, ESTATUS, RESPONSABLE, DELEGACION, MOTIVO1, FEC_ESTATUS)
                                    VALUES
                                        (${dto.goodNumber}, ${dto.eventId}, ${goodRev.tipo_bien}, ${goodRev.estatus},${wordResponsable[ 0 ].getword}, ${fdeladmbien[ 0 ].fa_deladmbien}, ${word[ 0 ].getword}, SYSDATE);`)

                                    } else {
                                        await this.VGoodsRevRepository.query(`UPDATE SERA.BIENES_MOTIVOSREV 
                                        SET MOTIVO${vSubindice2} = ${word[ 0 ].getword} 
                                    WHERE NO_BIEN = ${dto.goodNumber}
                                        AND RESPONSABLE = '${wordResponsable[ 0 ].getword}'`)
                                    }
                                }
                            }
                        }
                    }
                }
                vSubindice = 0;
            }

            return {
                data: [],
                statusCode: HttpStatus.OK,
                message: 'Ejecucion exitosa'
            };
        } catch (e) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: e.message,
            };
        }
    }
}