import { Column, Entity, PrimaryColumn } from "typeorm";
@Entity("bienes_estatusrev", { schema: "sera" })
export class GoodsStatusrevEntity {
  @PrimaryColumn({
    type: "numeric",
    name: "no_bien",

    precision: 10,
  })
  goodNumber: number;

  @PrimaryColumn({
    type: "numeric",
    name: "id_evento",

    precision: 10,
  })
  eventId: number;

  @PrimaryColumn({
    type: "character varying",
    name: "estatus_inicial",
    length: "5",
  })
  statusInitial: string;

  @Column({
    type: "character varying",
    name: "motivos",
    length: "4000",
  })
  reasons: string;

  @Column({
    type: "character varying",
    name: "tipo_bien",
    length: "1",
  })
  goodType: string;

  @Column({
    type: "character varying",
    name: "nb_origen",
  })
  nbOrigin: string;
}
