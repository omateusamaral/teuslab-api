export interface IValidateTypes {
  email: string;
  role: RoleType;
}

export enum RoleType {
  ADMIN = 'admin',
  USER = 'user',
}
