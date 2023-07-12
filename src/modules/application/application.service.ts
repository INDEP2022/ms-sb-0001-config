import { Injectable, HttpStatus, HttpException } from "@nestjs/common";
import * as moment from 'moment';
import { LocalDate } from 'src/shared/custom/formats';
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CatReasonsrevEntity } from "../infrastructure/entities/cat-reasonsrev.entity";
import { EatEventsEntity } from "../infrastructure/entities/eat-events.entity";
import { GoodsStatusrevEntity } from "../infrastructure/entities/goods-statusrev.entity";
import { ResponsibleAttentionEntity } from "../infrastructure/entities/responsible-attention.entity";
import { InsertReasonsRevDto, ReasonsSeparateDto } from "./dto/param.dto";
import { VGoodsRevEntity } from "../infrastructure/views/v_goods_rev.entity";
import { CRUDMessages } from "src/shared/utils/message.enum";


@Injectable()
export class ApplicationService {

    constructor(
        @InjectRepository(EatEventsEntity) private EatEventsRepository: Repository<EatEventsEntity>,
        @InjectRepository(CatReasonsrevEntity) private CatReasonsrevRepository: Repository<CatReasonsrevEntity>,
        @InjectRepository(ResponsibleAttentionEntity) private ResponsibleAttentionRepository: Repository<ResponsibleAttentionEntity>,
        @InjectRepository(GoodsStatusrevEntity) private GoodsStatusrevRepository: Repository<GoodsStatusrevEntity>,
        @InjectRepository(VGoodsRevEntity) private VGoodsRevRepository: Repository<VGoodsRevEntity>,
    ) { }

    //#region PA_SEPARA_MOTIVOS
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
                respon: any, //RESPON
                exists: boolean, //EXISTE
                columns: string, //COLUMNAS
                values: string, //VALORES
                motCount: number = 0, //MOT_COUNT
                statusIni: string = 'AVA', //ESTATUS_INI
                goodNumberRe: number; //NO_BIEN_RE

            const qb = this.EatEventsRepository.createQueryBuilder()
                .select('direccion')
                .where('id_evento = :id_evento', { id_evento: dto.eventInId });
            address = await qb.getRawOne();

            if (dto.actionIn === "I") {

                const qbSelectNoBienRe = this.GoodsStatusrevRepository.createQueryBuilder("bienes_estatusrev")
                    .select("bienes_estatusrev.no_bien")
                    .where("bienes_estatusrev.no_bien = :no_bien", { no_bien: dto.goodInNumber })
                    .andWhere("bienes_estatusrev.id_evento = :id_evento", { id_evento: dto.eventInId })
                    .andWhere("bienes_estatusrev.estatus_inicial = :estatus_inicial", { estatus_inicial: statusIni })
                    .andWhere("bienes_estatusrev.tipo_bien = :tipo_bien", { tipo_bien: address });

                const result = await qbSelectNoBienRe.getRawOne();
                const goodNumberRe = result ? result.no_bien : null;

                if (!goodNumberRe) {

                    const qbInsertNoBienRe = `INSERT INTO sera.bienes_estatusrev
                    (no_bien, tipo_bien, id_evento, estatus_inicial, motivos)
                    VALUES ($1, $2, $3, $4, $5)`;

                    await this.GoodsStatusrevRepository.query(qbInsertNoBienRe, [
                        dto.goodInNumber,
                        "I",//address,
                        dto.eventInId,
                        statusIni,
                        dto.reasonsIn
                    ]);

                    respon = "Ejecución de insert bienes_estatusrev exitoso";

                }

                const qsSelectvQuery2 = `SELECT COUNT(*) FROM SERA.cat_motivosrev WHERE id_motivo IN ($1)`;
                const valuesvQuery2 = [ dto.reasonsInNumber ];
                vQuery2 = (await this.CatReasonsrevRepository.query(qsSelectvQuery2, valuesvQuery2))[ 0 ].count;

                const qsSelectvQuery = `SELECT area_responsable FROM SERA.cat_motivosrev WHERE id_motivo IN ($1) ORDER BY area_responsable ASC`;
                const valuesvQuery = [ dto.reasonsInNumber ];
                vQuery = await this.CatReasonsrevRepository.query(qsSelectvQuery, valuesvQuery);

                for (let index = 0; index < vQuery.length; index++) {
                    counter++;
                    areaResp = vQuery[ index ].area_responsable;

                    const qsSelectExiste = `SELECT EXISTS (
                        SELECT 1 FROM SERA.RESPONSABLES_ATENCION
                        WHERE no_bien = $1
                        AND estatus_inicial = $2
                    )`;

                    // Execute query
                    const results = await this.ResponsibleAttentionRepository.query(qsSelectExiste, [
                        dto.goodInNumber,
                        statusIni
                    ]);

                    if (results[ 0 ].exists) {

                        if (counter <= motCount) {
                            columns = ", ";
                            values = ",' ";
                        }
                        columns = columns + responsible + counter;
                        values = values + areaResp
                    }
                }

                if (columns && values && columns.length > 0 && values.length > 0) {

                    vQuery3 = `INSERT INTO SERA.RESPONSABLES_ATENCION (NO_BIEN, ID_EVENTO, ESTATUS_INICIAL${columns})
                    VALUES('${dto.goodInNumber}', '${dto.eventInId}', '${statusIni}' ${values}')`;
                    // Execute query
                    await this.ResponsibleAttentionRepository.query(vQuery3)

                    respon = respon + " Ejecución de insert RESPONSABLES_ATENCION exitoso";
                    const paSeparaMotivos = await this.reasonsSeparate({ goodNumber: dto.goodInNumber, eventId: dto.eventInId });

                }
            } else if (dto.actionIn === "D") {
                const qbDelete1 = `DELETE FROM sera.bienes_estatusrev
                WHERE no_bien = $1
                AND tipo_bien = $2
                AND estatus_inicial = $3
                AND id_evento = $4`;

                const del1 = await this.GoodsStatusrevRepository.query(qbDelete1, [
                    dto.goodInNumber,
                    address,
                    statusIni,
                    dto.eventInId
                ]);

                const qbDelete2 = `DELETE FROM sera.RESPONSABLES_ATENCION
                WHERE no_bien = $1
                AND estatus_inicial = $2
                AND id_evento = $3`;

                const del2 = await this.ResponsibleAttentionRepository.query(qbDelete2, [
                    dto.goodInNumber,
                    statusIni,
                    dto.eventInId
                ]);

                respon = del1 && del2 ? "Ejecución de delete exitoso" : "Ejecución de delete con algun error"
            }
            return {
                data: [ respon ],
                statusCode: HttpStatus.OK,
                message: CRUDMessages.GetSuccess
            };
        } catch (e) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: e.message,
            };
        }
    }
    //#endregion

    //#region PA_OBTIENE_MOTIVOS_CAN
    /**
     * PROCEDURE "SERA"."PA_OBTIENE_MOTIVOS_CAN"
     *
     * @param {number} eventId
     */
    async getReasonsCan(eventId: number) {
        try {
            const qsQuery = `SELECT ID_MOTIVO, DESCRIPCION_MOTIVO
                            FROM SERA.CAT_MOTIVOSREV
                            WHERE TIPO_BIEN = (SELECT DIRECCION FROM SERA.COMER_EVENTOS WHERE ID_EVENTO = $1)
                            AND ESTATUS_INICIAL = 'AVA';`;
            const valuesQ = [eventId];
            const result = await this.CatReasonsrevRepository.query(qsQuery, valuesQ);

            return {
                data: [result],
                statusCode: HttpStatus.OK,
                message: CRUDMessages.GetSuccess
            };
        } catch (e) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: e.message,
            };
        }
    }
    //#endregion

    //#region PA_SEPARA_MOTIVOS
    /**
     * PROCEDURE "SERA"."PA_SEPARA_MOTIVOS"
     *
     * @param {number} dto.goodInNumber
     * @param {number} dto.eventInId
     */
    async reasonsSeparate(dto: ReasonsSeparateDto) {
        try {
            let vSubindice: number = 0;
            let vSubindice2: number = 0;

            const goodsRev = await this.VGoodsRevRepository.query(`SELECT
                    ESTATUS,
                    RESPONSABLE,
                    MOTIVOS,
                    TIPO_BIEN,
                    ID_EVENTO,
                    LENGTH(RESPONSABLE) TAM_RESP
                FROM SERA.V_BIENES_REV
                ORDER BY TAM_RESP LIMIT 1;`)

            const motivesRev = async (vResponsable, vEstatus, vTipoBien) => {
                const res = await this.VGoodsRevRepository.query(`SELECT
                    DESCRIPCION_MOTIVO
                FROM SERA.CAT_MOTIVOSREV
                WHERE AREA_RESPONSABLE = '${vResponsable}'
                AND ESTATUS_INICIAL = '${vEstatus}'
                AND TIPO_BIEN = '${vTipoBien}'; `)
                return res
            }

            await this.VGoodsRevRepository.query(`
                DELETE FROM SERA.BIENES_MOTIVOSREV
                WHERE NO_BIEN = $1
                    AND ID_EVENTO = $2
                    AND ATENDIDO = 0;`,
                [dto.goodNumber, dto.eventId],
            );

            for (const goodRev of goodsRev) {
                const res = await motivesRev(goodRev.responsable, goodRev.estatus, goodRev.tipo_bien)

                for (const motiveRev in res) {
                    const valor = await this.VGoodsRevRepository.query(`SELECT * FROM SERA.FA_CUENTA_PALABRAS('${goodRev.motivos}','/')`)

                    for (let x = 0; x < (valor[0].fa_cuenta_palabras + 1); x++) {
                        const word = await this.VGoodsRevRepository.query(`SELECT * FROM SERA.GETWORD('${goodRev.motivos}','/',${x})`)

                        if (word[0].getword == valor[0].descripcion_motivo) {

                            const valResponsable = await this.VGoodsRevRepository.query(`SELECT * FROM SERA.FA_CUENTA_PALABRAS('${goodRev.responsable}','/')`)
                            const fdeladmbien = await this.VGoodsRevRepository.query(`SELECT * FROM SERA.FA_DELADMBIEN('${dto.goodNumber}','/',${x})`)
                            if ((valResponsable[0].fa_cuenta_palabras + 1) == 1) {
                                vSubindice = vSubindice + 1
                                if (vSubindice == 1) {
                                    await this.VGoodsRevRepository.query(`INSERT INTO SERA.BIENES_MOTIVOSREV
                                    (NO_BIEN, ID_EVENTO, TIPO_BIEN, ESTATUS, RESPONSABLE, DELEGACION, MOTIVO1, FEC_ESTATUS)
                                    VALUES
                                    (${dto.goodNumber}, ${dto.eventId}, ${goodRev.tipo_bien}, ${goodRev.estatus},${goodRev.responsable}, ${fdeladmbien[0].fa_deladmbien}, ${word[0].getword}, '${LocalDate.getNow()}');`)
                                } else if (vSubindice > 1) {
                                    await this.VGoodsRevRepository.query(`UPDATE SERA.BIENES_MOTIVOSREV
                                    SET MOTIVO${vSubindice} = ${word[0].getword}
                                    WHERE NO_BIEN = ${dto.goodNumber}
                                    AND RESPONSABLE = '${goodRev.responsable}'`)
                                }
                            } else if ((valResponsable[0].fa_cuenta_palabras + 1) > 1) {
                                for (let z = 0; z < (valResponsable[0].fa_cuenta_palabras + 1); z++) {
                                    const wordResponsable = await this.VGoodsRevRepository.query(`SELECT * FROM SERA.GETWORD('${goodRev.responsable}','/',${z})`)
                                    if (vSubindice2 == 1) {
                                        await this.VGoodsRevRepository.query(`INSERT INTO SERA.BIENES_MOTIVOSREV
                                        (NO_BIEN, ID_EVENTO, TIPO_BIEN, ESTATUS, RESPONSABLE, DELEGACION, MOTIVO1, FEC_ESTATUS)
                                        VALUES
                                        (${dto.goodNumber}, ${dto.eventId}, ${goodRev.tipo_bien}, ${goodRev.estatus},${wordResponsable[0].getword}, ${fdeladmbien[0].fa_deladmbien}, ${word[0].getword}, '${LocalDate.getNow()}');`)

                                    } else {
                                        await this.VGoodsRevRepository.query(`UPDATE SERA.BIENES_MOTIVOSREV
                                        SET MOTIVO${vSubindice2} = ${word[0].getword}
                                        WHERE NO_BIEN = ${dto.goodNumber}
                                        AND RESPONSABLE = '${wordResponsable[0].getword}'`)
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
                message: CRUDMessages.GetSuccess
            };
        } catch (e) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: e.message,
            };
        }
    }
    //#endregion
}