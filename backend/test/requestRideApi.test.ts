import axios from "axios";
import crypto from 'crypto'
import pgPromise from "pg-promise";

axios.defaults.validateStatus = function () {
    return true;
}

beforeEach(() => {
  deleteRides();
  deleteAccounts();
})

test('Deve solicitar uma corrida com sucesso', async () => {
  const accountInput = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    password: "123456",
    isPassenger: true,
    carPlate: 'AAA9999'
  }

  const accountResponse = await axios.post('http://localhost:3000/signup', accountInput);

  const input = {
    passengerId: accountResponse.data.accountId,
    fromLat: 1,
    fromLong: 1,
    toLat: 2,
    toLong: 2
  }

  const response = await axios.post('http://localhost:3000/rides/request', input);

  const createdRideId = response.data.rideId

  const rideResponse = await axios.get( `http://localhost:3000/rides/${createdRideId}`);

  expect(response.status).toBe(200);
  expect(createdRideId).toBeDefined();
  expect(rideResponse.data.status).toBe('requested');
})

test('Deve retornar um erro caso o solicitante da corrida não for do tipo passageiro', async () => {
  const accountInput = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    password: "123456",
    isPassenger: false,
    carPlate: 'AAA9999'
  }

  const accountResponse = await axios.post('http://localhost:3000/signup', accountInput);

  const rideInput = {
    passengerId: accountResponse.data.accountId,
    fromLat: 1,
    fromLong: 1,
    toLat: 2,
    toLong: 2
  }
  const rideResponse = await axios.post('http://localhost:3000/rides/request', rideInput);

  expect(rideResponse.status).toBe(422);
  expect(rideResponse.data.message).toBe("User is not a passenger");
})

test('Deve retornar um erro caso o passageiro já tenha uma corrida com status diferente de completed', async () => {
  const accountInput = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    password: "123456",
    isPassenger: true,
    carPlate: 'AAA9999'
  }

  const accountResponse = await axios.post('http://localhost:3000/signup', accountInput);

  const input = {
    passengerId: accountResponse.data.accountId,
    fromLat: 1,
    fromLong: 1,
    toLat: 2,
    toLong: 2
  }

  const rideResponse = await axios.post('http://localhost:3000/rides/request', input);

  expect(rideResponse.status).toBe(200);
  expect(rideResponse.data.rideId).toBeDefined();

  const rideResponse2 = await axios.post('http://localhost:3000/rides/request', input);

  expect(rideResponse2.status).toBe(422);
  expect(rideResponse2.data.message).toBe("User has an ongoing ride");
})

async function deleteRides() {
  const connection = pgPromise()("postgres://postgres:123456@localhost:5432/app");
  await connection.query("delete from ccca.ride");
  await connection.$pool.end();
}

async function deleteAccounts() {
  const connection = pgPromise()("postgres://postgres:123456@localhost:5432/app");
  await connection.query("delete from ccca.account");
  await connection.$pool.end();
}