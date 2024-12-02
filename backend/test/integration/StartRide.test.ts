import AcceptRide from "../../src/application/usecase/AcceptRide";
import GetRide from "../../src/application/usecase/GetRide";
import RequestRide from "../../src/application/usecase/RequestRide";
import Signup from "../../src/application/usecase/Signup";
import StartRide from "../../src/application/usecase/StartRide";
import DatabaseConnection, { PgPromiseAdapter } from "../../src/infra/database/DatabaseConnection";
import { MailerGatewayMemory } from "../../src/infra/gateway/MailerGateway";
import { AccountRepositoryDatabase } from "../../src/infra/repository/AccountRepository";
import { RideRepositoryDatabase } from "../../src/infra/repository/RideRepository";

let connection: DatabaseConnection;
let acceptRide: AcceptRide;
let getRide: GetRide;
let signup: Signup;
let requestRide: RequestRide;
let startRide: StartRide;

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
  startRide = new StartRide(
    rideRepository
  )
})

test("Deve iniciar uma corrida", async () => {
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

  const inputStartRide = {
    rideId: outputRequestRide.rideId
  }
  await startRide.execute(inputStartRide);

  const outputGetRide = await getRide.execute(outputRequestRide.rideId);

  expect(outputGetRide.status).toBe("in_progress");
})

test("Deve lançar um erro caso a corrida não estiver com o status accepted", async () => {
  const inputSignupPassenger = {
    name: "John Doe",
    email: `john.doe${Math.random()}@gmail.com`,
    cpf: "97456321558",
    password: "123456",
    isPassenger: true
  }
  const outputSignupPassenger = await signup.execute(inputSignupPassenger);
  const inputRequestRide = {
    passengerId: outputSignupPassenger.accountId,
    fromLat: -27.584905257808835,
    fromLong: -48.545022195325124,
    toLat: -27.496887588317275,
    toLong: -48.522234807851476
  }
  const outputRequestRide = await requestRide.execute(inputRequestRide);

  const inputStartRide = {
    rideId: outputRequestRide.rideId
  }
  
  expect(() => startRide.execute(inputStartRide)).rejects.toThrow(new Error("Ride not accepted"))
})

afterEach(async () => {
  await connection.close();
});