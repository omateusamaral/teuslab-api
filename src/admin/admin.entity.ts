import { encriptPassword } from '../utils/bcrypt-password';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Article } from '../article/article.entity';

@Entity()
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  adminId: string;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Article, (article) => article.admin)
  article: Article[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await encriptPassword(this.password);
  }
}
