import { Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Schedule {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column({nullable: true})
    clientId?: string;
    
    @Column({nullable: true})
    clientName?: string;
    
    @Column({nullable: true})
    description?: string;
    
    @Column()
    date: String;
    
    @Column({nullable: true})
    groupId?: string;
    
    @Column({nullable: true})
    organizationId?: string;
    
    @Column({nullable: true})
    serviceId?: string;
}
