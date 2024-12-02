import AcceptRide from "../../src/application/usecase/AcceptRide";
import GetRide from "../../src/application/usecase/GetRide";
import RequestRide from "../../src/application/usecase/RequestRide";
import Signup from "../../src/application/usecase/Signup";
import DatabaseConnection, { PgPromiseAdapter } from "../../src/infra/database/DatabaseConnection";
import { MailerGatewayMemory } from "../../src/infra/gateway/MailerGateway";
import { AccountRepositoryDatabase } from "../../src/infra/repository/AccountRepository";
import { RideRepositoryDatabase } from "../../src/infra/repository/RideRepository";

let connection: DatabaseConnection;
let acceptRide: AcceptRide;
let getRide: GetRide;
let signup: Signup;
let requestRide: RequestRide;

beforeEach(() => {
  connection = new PgPromiseAdapter();
  const accountRepository = new AccountRepositoryDatabase(connection);
  const rideRepository = new RideRepositoryDatabase(connection);
  const mailerGateway = new MailerGatewayMemory();
  getRide = new GetRide(
    accountRepository,
    rideRepository
  )
  signup = new Signup(
    accountRepository,
    mailerGateway
  );
  requestRide = new RequestRide(
    accountRepository,
    rideRepository
  );
  acceptRide = new AcceptRide(
    accountRepository,
    rideRepository
  );
})

test('Deve aceitar uma corrida', async () => {
  const inputSignupDriver = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    password: "123456",
    carPlate: 'AAA9999',
    isDriver: true
  }
  const inputSignupPassenger = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    password: "123456",
    isPassenger: true
  }
  const outputSignupDriver = await signup.execute(inputSignupDriver);
  const outputSignupPassenger = await signup.execute(inputSignupPassenger);
  const inputRequestRide = {
    passengerId: outputSignupPassenger.accountId,
    fromLat: -27.584905257808835,
    fromLong: -48.545022195325124,
    toLat: -27.496887588317275,
    toLong: -48.522234807851476
  }
  const outputRequestRide = await requestRide.execute(inputRequestRide);
  
  const inputAcceptRide = {
    rideId: outputRequestRide.rideId,
    driverId: outputSignupDriver.accountId
  }

  await acceptRide.execute(inputAcceptRide);

  const outputGetRide = await getRide.execute(outputRequestRide.rideId);

  expect(outputGetRide.status).toBe("accepted");
  expect(outputGetRide.driverId).toBeDefined();
})

test('Deve lançar um erro caso o usuário não é motorista', async () => {
  const inputSignupDriver = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    password: "123456",
    carPlate: 'AAA9999',
    isDriver: true
  }
  const inputSignupPassenger = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    password: "123456",
    isPassenger: true
  }
  const outputSignupDriver = await signup.execute(inputSignupDriver);
  const outputSignupPassenger = await signup.execute(inputSignupPassenger);
  const inputRequestRide = {
    passengerId: outputSignupPassenger.accountId,
    fromLat: -27.584905257808835,
    fromLong: -48.545022195325124,
    toLat: -27.496887588317275,
    toLong: -48.522234807851476
  }
  const outputRequestRide = await requestRide.execute(inputRequestRide);
  
  const inputAcceptRide = {
    rideId: outputRequestRide.rideId,
    driverId: outputSignupPassenger.accountId
  }

  expect(() => acceptRide.execute(inputAcceptRide)).rejects.toThrow(new Error('User is not a driver'));

  const outputGetRide = await getRide.execute(outputRequestRide.rideId);

  expect(outputGetRide.status).toBe("requested");
  expect(outputGetRide.driverId).toBeNull();
})

test('Deve lançar um erro caso o status da corrida for diferente de requested', async () => {
  const inputSignupDriver = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    password: "123456",
    carPlate: 'AAA9999',
    isDriver: true
  }
  const inputSignupPassenger = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    password: "123456",
    isPassenger: true
  }
  const outputSignupDriver = await signup.execute(inputSignupDriver);
  const outputSignupPassenger = await signup.execute(inputSignupPassenger);
  const inputRequestRide = {
    passengerId: outputSignupPassenger.accountId,
    fromLat: -27.584905257808835,
    fromLong: -48.545022195325124,
    toLat: -27.496887588317275,
    toLong: -48.522234807851476
  }
  const outputRequestRide = await requestRide.execute(inputRequestRide);

  const inputAcceptRide = {
    rideId: outputRequestRide.rideId,
    driverId: outputSignupDriver.accountId
  }

  await acceptRide.execute(inputAcceptRide);

  expect(() => acceptRide.execute(inputAcceptRide)).rejects.toThrow(new Error('Ride is not requested'));
})

test('Deve lançar um erro caso o motorista já estiver em uma corrida', async () => {
  const inputSignupDriver = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    password: "123456",
    carPlate: 'AAA9999',
    isDriver: true
  }
  const inputSignupPassenger = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    password: "123456",
    isPassenger: true
  }
  const inputSignupPassenger2 = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    password: "123456",
    isPassenger: true
  }
  const outputSignupDriver = await signup.execute(inputSignupDriver);
  const outputSignupPassenger = await signup.execute(inputSignupPassenger);
  const outputSignupPassenger2 = await signup.execute(inputSignupPassenger2);
  const inputRequestRide = {
    passengerId: outputSignupPassenger.accountId,
    fromLat: -27.584905257808835,
    fromLong: -48.545022195325124,
    toLat: -27.496887588317275,
    toLong: -48.522234807851476
  }
  const inputRequestRide2 = {
    passengerId: outputSignupPassenger2.accountId,
    fromLat: -27.584905257808835,
    fromLong: -48.545022195325124,
    toLat: -27.496887588317275,
    toLong: -48.522234807851476
  }
  const outputRequestRide = await requestRide.execute(inputRequestRide);
  const outputRequestRide2 = await requestRide.execute(inputRequestRide2);

  const inputAcceptRide = {
    rideId: outputRequestRide.rideId,
    driverId: outputSignupDriver.accountId
  }
  const inputAcceptRide2 = {
    rideId: outputRequestRide2.rideId,
    driverId: outputSignupDriver.accountId
  }

  await acceptRide.execute(inputAcceptRide);

  expect(() => acceptRide.execute(inputAcceptRide2)).rejects.toThrow(new Error('Driver is already in a ride'));

  const outputGetRide = await getRide.execute(outputRequestRide2.rideId);

  expect(outputGetRide.status).toBe("requested");
  expect(outputGetRide.driverId).toBeNull();
})

afterEach(async () => {
  await connection.close();
});