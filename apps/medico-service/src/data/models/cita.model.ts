import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { HospitalModel } from "./hospital.model";
import { MedicoModel } from "./medico.model";
import { PacienteModel } from "./paciente.model";
import { UsuarioModel } from "./usuario.model";

@Entity("cita")
export class CitaModel {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => HospitalModel, (hospital) => hospital.citas, { onDelete: "CASCADE" })
    @JoinColumn({ name: "hospitalId" })
    hospital!: HospitalModel;

    @Column()
    hospitalId!: string | null;

    @ManyToOne(() => MedicoModel, (medico) => medico.citas, { onDelete: "CASCADE" })
    @JoinColumn({ name: "medicoId" })
    medico!: MedicoModel;

    @Column()
    medicoId!: string | null;

    @ManyToOne(() => PacienteModel, (paciente) => paciente.citas, { nullable: true })
    @JoinColumn({ name: "pacienteId" })
    paciente!: PacienteModel | null;

    @Column({ nullable: true })
    pacienteId!: string | null;

    @Column("text")
    motivo!: string;

    @Column({ type: "datetime" })
    fechaInicio!: Date;

    @Column({ type: "datetime" })
    fechaFin!: Date;

    @Column({
        type: "enum",
        enum: ["PROGRAMADA", "CANCELADA", "ATENDIDA"],
        default: "PROGRAMADA"
    })
    estado!: "PROGRAMADA" | "CANCELADA" | "ATENDIDA";

    @ManyToOne(() => UsuarioModel, { nullable: true })
    @JoinColumn({ name: "creadaPorId" })
    creadaPor!: UsuarioModel | null;

    @Column({ nullable: true })
    creadaPorId!: string | null;

    @ManyToOne(() => UsuarioModel, { nullable: true })
    @JoinColumn({ name: "actualizadaPorId" })
    actualizadaPor!: UsuarioModel | null;

    @Column({ nullable: true })
    actualizadaPorId!: string | null;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updatedAt!: Date;
}