import { Column, Entity, PrimaryColumn } from "typeorm";
@Entity("comer_eventos", { schema: "sera" })
export class EatEventsEntity {
  @PrimaryColumn({
    type: "numeric",
    name: "id_evento",

    precision: 7,
  })
  eventId: number;

  @Column({
    type: "numeric",
    name: "id_tpevento",

    precision: 2,
  })
  tpeventId: number;

  @Column({
    type: "character varying",
    name: "id_estatusvta",
    length: "4",
  })
  statusId: string;

  @Column({
    type: "character varying",
    name: "cve_proceso",
    length: "60",
  })
  processKey: string;

  @Column({
    type: "character varying",
    name: "observaciones",
    length: "300",
  })
  observations: string;

  @Column({
    type: "character varying",
    name: "direccion",
    length: "1",
  })
  address: string;

  @Column({
    type: "date",
    name: "fec_fallo",
  })
  failedDate: Date;

  @Column({
    type: "character varying",
    name: "lugar",
    length: "100",
  })
  place: string;

  @Column({
    type: "date",
    name: "fec_evento",
  })
  eventDate: Date;

  @Column({
    type: "character varying",
    name: "texto1",
    length: "4000",
  })
  text1: string;

  @Column({
    type: "character varying",
    name: "texto2",
    length: "4000",
  })
  text2: string;

  @Column({
    type: "character varying",
    name: "firmante",
    length: "50",
  })
  signatory: string;

  @Column({
    type: "character varying",
    name: "firmante_cargo",
    length: "50",
  })
  signatoryPost: string;

  @Column({
    type: "character varying",
    name: "notas",
    length: "300",
  })
  grades: string;

  @Column({
    type: "character varying",
    name: "textofin3",
    length: "4000",
  })
  endtext3: string;

  @Column({
    type: "character varying",
    name: "textofin4",
    length: "4000",
  })
  endtext4: string;

  @Column({
    type: "numeric",
    name: "costo_base",

    precision: 10,
  })
  costBase: number;

  @Column({
    type: "numeric",
    name: "num_base_vend",

    precision: 5,
  })
  numBaseSell: number;

  @Column({
    type: "character varying",
    name: "usuario",
    length: "30",
  })
  user: string;

  @Column({
    type: "numeric",
    name: "mes",

    precision: 2,
  })
  month: number;

  @Column({
    type: "numeric",
    name: "anio",

    precision: 4,
  })
  year: number;

  @Column({
    type: "numeric",
    name: "no_delegacion",

    precision: 3,
  })
  delegationNumber: number;

  @Column({
    type: "numeric",
    name: "fase_inmu",

    precision: 2,
  })
  phaseImmu: number;

  @Column({
    type: "numeric",
    name: "id_tercerocomer",

    precision: 3,
  })
  thirdtoEatId: number;

  @Column({
    type: "date",
    name: "fecha_notificacion",
  })
  notificationDate: Date;

  @Column({
    type: "date",
    name: "fecha_cierre_evento",
  })
  closingEventDate: Date;

  @Column({
    type: "numeric",
    name: "id_tpsolaval",

    precision: 10,
  })
  tpsolavalId: number;

  @Column({
    type: "character varying",
    name: "aplica_iva",
    length: "2",
  })
  applyvat: string;
}
