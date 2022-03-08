import { Admin } from '../admin/admin.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Article {
  @PrimaryGeneratedColumn('uuid')
  articleId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column()
  imageUrl: string;

  @ManyToOne(() => Admin, (admin) => admin.article)
  admin: Admin;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
