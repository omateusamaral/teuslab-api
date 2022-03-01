import { User } from '../user/user.entity';

export interface IGetUsers {
  users: User[];
  page: number;
  usersPerPage: number;
  countUsers: number;
}
