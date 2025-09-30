import { Column, Entity, OneToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { MedicoModel } from "./medico.model";

@Entity("usuario")
export class UsuarioModel {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    email!: string;

    @Column("text")
    password!: string;

    @Column({
        type: "enum",
        enum: ["ADMIN_GLOBAL", "MEDICO"]
    })
    rol!: "ADMIN_GLOBAL" | "MEDICO";

    @Column({ nullable: true })
    medicoId!: string | null;

    @OneToOne(() => MedicoModel, (medico) => medico.usuario)
    @JoinColumn({ name: "medicoId" })
    medico!: MedicoModel | null;

    @Column({ default: true })
    activo!: boolean;
}
