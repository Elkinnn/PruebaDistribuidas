import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { HospitalModel } from "./hospital.model";
import { UsuarioModel } from "./usuario.model";
import { CitaModel } from "./cita.model";

@Entity("medico")
export class MedicoModel {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nombres!: string;

    @Column()
    apellidos!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    activo!: boolean;

    @ManyToOne(() => HospitalModel, (hospital) => hospital.medicos)
    @JoinColumn({ name: "hospitalId" })
    hospital!: HospitalModel;

    @OneToOne(() => UsuarioModel, (usuario) => usuario.medico)
    usuario!: UsuarioModel;

    @OneToMany(() => CitaModel, (cita) => cita.medico)
    citas!: CitaModel[];
}