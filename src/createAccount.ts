import pgPromise from "pg-promise"

type TAccountData = {
  id: string
  name: string
  email: string
  cpf: string
  carPlate: string
  password: string
  isDriver: boolean
  isPassenger: boolean
}

export async function createAccount(data: TAccountData): Promise<string> {
  const connection = pgPromise()("postgres://postgres:123456@localhost:5432/app");
  await connection.query("insert into ccca.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver, password) values ($1, $2, $3, $4, $5, $6, $7, $8)", [data.id, data.name, data.email, data.cpf, data.carPlate, !!data.isPassenger, !!data.isDriver, data.password]);
  await connection.$pool.end();

  return data.id;
}