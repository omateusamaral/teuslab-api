import * as bcrypt from 'bcrypt';

export async function encriptPassword(password: string): Promise<string> {
  const saltOrRounds = bcrypt.genSaltSync();

  const passwordHashed = await bcrypt.hash(password, saltOrRounds);

  return passwordHashed;
}
