import { Admin } from '../admin/admin.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
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

  @Column({ type: 'longtext' })
  body: string;

  @Column()
  imageUrl: string;

  @OneToOne(() => Admin)
  @JoinColumn()
  admin: Admin;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
