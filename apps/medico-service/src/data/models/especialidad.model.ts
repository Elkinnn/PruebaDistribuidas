import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("especialidad")
export class EspecialidadModel {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 100 })
    nombre!: string;

    @Column({ type: "text", nullable: true })
    descripcion!: string | null;
}
