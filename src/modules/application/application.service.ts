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
        let vQuery: any, //V_QUERY
            vQuery2: any, //V_QUERY2
            vQuery3: any, //V_QUERY3
            direc: string, //DIREC
            responsable: string = 'RESPONSABLE_', //RESPONSABLE
            contador: number = 0, //CONTADOR
            areaResp: string, //AREA_RESP
            respon: string, //RESPON
            existe: boolean, //EXISTE
            columnas: string, //COLUMNAS
            valores: string, //VALORES
            motCount: number = 0, //MOT_COUNT
            estatusIni: string = 'AVA', //ESTATUS_INI
            noBienRe: number; //NO_BIEN_RE

        try {
            const qb = this.EatEventsRepository.createQueryBuilder('sera.comer_eventos')
                .select('sera.comer_eventos.direccion')
                .where('sera.comer_eventos.id_evento = :id_evento', { id_evento: dto.eventInId });

            direc = await qb.execute().then((data) => { return data[0].direccion });

            if (dto.actionIn == "I") {
                const qbSelectNoBienRe = this.GoodsStatusrevRepository.createQueryBuilder('sera.bienes_estatusrev')
                    .select('sera.bienes_estatusrev.no_bien')
                    .where('sera.bienes_estatusrev.no_bien = :no_bien', { no_bien: dto.goodInNumber })
                    .andWhere('sera.bienes_estatusrev.id_evento = :id_evento', { id_evento: dto.eventInId })
                    .andWhere('sera.bienes_estatusrev.estatus_inicial = :estatus_inicial', { estatus_inicial: estatusIni })
                    .andWhere('sera.bienes_estatusrev.tipo_bien = :tipo_bien', { tipo_bien: direc });

                // excute query
                noBienRe = await qbSelectNoBienRe.execute().then((data) => { return data });

                if (noBienRe == null) {
                    const qbInsertNoBienRe = this.GoodsStatusrevRepository.createQueryBuilder('sera.bienes_estatusrev')
                        .insert()
                        .into('sera.bienes_estatusrev')
                        .values([
                            { no_bien: dto.goodInNumber, tipo_bien: direc, id_evento: dto.eventInId, estatus_inicial: estatusIni, motivos: dto.reasonsIn }
                        ]);

                    // excute query
                    try {
                        await qbInsertNoBienRe.execute();
                    } catch (error) {
                        throw new HttpException(error, HttpStatus.NOT_IMPLEMENTED);
                    }
                }

                const qbSelectvQuery2 = this.CatReasonsrevRepository.createQueryBuilder('sera.cat_motivosrev')
                    .select('sera.cat_motivosrev.area_responsable')
                    .where('sera.cat_motivosrev.id_motivo IN (:id_motivo)', { id_motivo: dto.reasonsInNumber });

                vQuery2 = await qbSelectvQuery2.getCount();
                // OPEN salida FOR vQuery2 ;
                for (let index = 0; index < vQuery2; index++) {
                    motCount++;
                }

                const qbSelectvQuery = this.CatReasonsrevRepository.createQueryBuilder('sera.cat_motivosrev')
                    .select('sera.cat_motivosrev.area_responsable')
                    .where('sera.cat_motivosrev.id_motivo IN (:id_motivo)', { id_motivo: dto.reasonsInNumber })
                    .orderBy('sera.cat_motivosrev.area_responsable', 'ASC');

                vQuery = await qbSelectvQuery.execute();

                let vQueryCount = await qbSelectvQuery.getCount();
                // OPEN salida FOR vQuery;
                for (let index = 0; index < vQueryCount; index++) {
                    contador++;
                    areaResp = vQuery[index].area_responsable;
                    respon = responsable + areaResp;
                    const qsSelectExiste = this.ResponsibleAttentionRepository.createQueryBuilder('sera.responsables_atencion')
                        .select('sera.responsables_atencion.no_bien')
                        .where('sera.responsables_atencion.no_bien = :no_bien', { no_bien: dto.goodInNumber })
                        .andWhere('sera.responsables_atencion.estatus_inicial = :estatus_inicial', { estatus_inicial: estatusIni });

                    // excute query
                    existe = await qsSelectExiste.getExists();

                    if (existe) {

                        if (contador <= motCount) {
                            columnas = ", ";
                            valores = ",' ";
                        }
                        columnas = columnas + responsable + contador;
                        valores = valores + areaResp;
                    }
                }

                if (columnas != null && valores != null) {
                    vQuery3 = `INSERT INTO SERA.RESPONSABLES_ATENCION (NO_BIEN, ID_EVENTO, ESTATUS_INICIAL${columnas})
                    VALUES( '${dto.goodInNumber}', '${dto.eventInId}', '${estatusIni}' ${valores}')`;

                    // excute query
                    await this.ResponsibleAttentionRepository.query(vQuery3)

                    // PA_SEPARA_MOTIVOS
                    //TODO: descomentar este await cuando este listo paSeparaMotivos
                    //await this.paSeparaMotivos(dto.goodInNumber, dto.eventInId);
                }
            } else if (dto.actionIn == "D") {
                const qbDelete1 = this.GoodsStatusrevRepository.createQueryBuilder('sera.bienes_estatusrev')
                    .delete()
                    .where('sera.bienes_estatusrev.no_bien = :no_bien', { no_bien: dto.goodInNumber })
                    .andWhere('sera.bienes_estatusrev.tipo_bien = :tipo_bien', { tipo_bien: direc })
                    .andWhere('sera.bienes_estatusrev.estatus_inicial = :estatus_inicial', { estatus_inicial: estatusIni })
                    .andWhere('sera.bienes_estatusrev.id_evento = :id_evento', { id_evento: dto.eventInId });

                await qbDelete1.execute();

                const qbDelete2 = this.ResponsibleAttentionRepository.createQueryBuilder('sera.responsables_atencion')
                    .delete()
                    .where('sera.responsables_atencion.no_bien = :no_bien', { no_bien: dto.goodInNumber })
                    .andWhere('sera.responsables_atencion.estatus_inicial = :estatus_inicial', { estatus_inicial: estatusIni })
                    .andWhere('sera.responsables_atencion.id_evento = :id_evento', { id_evento: dto.eventInId });

                await qbDelete2.execute();

            }

            return {
                data: [respon],
                statusCode: HttpStatus.OK,
                message: 'OK'
            };
        } catch (e) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: e,
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