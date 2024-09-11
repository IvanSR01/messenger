import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class ReactionType {
	@PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; 

  @Column()
  emoji: string;  
}