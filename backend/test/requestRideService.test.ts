import { AccountDAODatabase, AccountDAOMemory } from "../src/data";
import GetRideById from "../src/GetRideById";
import { MailerGatewayMemory } from "../src/MailerGateway";
import RequestRide from "../src/RequestRide";
import { RideDAODatabase, RideDAOMemory } from "../src/RideDAODatabase"
import Signup from "../src/Signup";

test('Deve criar uma corrida', async () => {
  const rideDAO = new RideDAODatabase();
  const accountDAO = new AccountDAODatabase();
  const mailerGateway = new MailerGatewayMemory();
  const requestRide = new RequestRide(rideDAO, accountDAO);
  const getRide = new GetRideById(rideDAO);
  const signUp = new Signup(accountDAO, mailerGateway);

  const accountInput = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    password: "123456",
    isPassenger: true,
    carPlate: 'AAA9999'
  }

  const account = await signUp.signup(accountInput)

  const input = {
    passengerId: account.accountId,
    fromLat: 1,
    fromLong: 1,
    toLat: 2,
    toLong: 2
  }

  const rideData = await requestRide.requestRide(input);

  const getRideData = await getRide.getRideById(rideData)

  expect(getRideData.passengerId).toBe(input.passengerId);
})

test('Deve retornar um erro caso o solicitante não seja do tipo passageiro', async () => {
  const rideDAO = new RideDAODatabase();
  const accountDAO = new AccountDAODatabase();
  const mailerGateway = new MailerGatewayMemory();
  const requestRide = new RequestRide(rideDAO, accountDAO);
  const signUp = new Signup(accountDAO, mailerGateway);

  const accountInput = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    password: "123456",
    isPassenger: false,
    carPlate: 'AAA9999'
  }

  const account = await signUp.signup(accountInput)

  const input = {
    passengerId: account.accountId,
    fromLat: 1,
    fromLong: 1,
    toLat: 2,
    toLong: 2
  }

  await expect(requestRide.requestRide(input)).rejects.toThrow(new Error("User is not a passenger"));
})

test('Deve retornar um erro caso o passageiro já possui uma corrida ativa', async () => {
  const rideDAO = new RideDAODatabase();
  const accountDAO = new AccountDAODatabase();
  const mailerGateway = new MailerGatewayMemory();
  const requestRide = new RequestRide(rideDAO, accountDAO);
  const signUp = new Signup(accountDAO, mailerGateway);

  const accountInput = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    password: "123456",
    isPassenger: true,
  }

  const account = await signUp.signup(accountInput)

  const input = {
    passengerId: account.accountId,
    fromLat: 1,
    fromLong: 1,
    toLat: 2,
    toLong: 2
  }

  await requestRide.requestRide(input);

  await expect(requestRide.requestRide(input)).rejects.toThrow(new Error("User has an ongoing ride"));
})