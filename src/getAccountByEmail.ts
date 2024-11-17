import pgPromise from "pg-promise";

type TOutput = {
  id: string
  name: string
  email: string
  cpf: string
  car_plate: string
  password: string
  is_driver: boolean
  is_passenger: boolean
} | undefined

export async function getAccountByEmail(email: string): Promise<TOutput> {
  const connection = pgPromise()("postgres://postgres:123456@localhost:5432/app");
  const result = await connection.query('select * from ccca.account where email=$1', [email]);
  const accountData = result[0] as TOutput;
  await connection.$pool.end();

  return accountData;
}