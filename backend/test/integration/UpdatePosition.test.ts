import AcceptRide from "../../src/application/usecase/AcceptRide";
import GetPosition from "../../src/application/usecase/GetPosition";
import GetRide from "../../src/application/usecase/GetRide";
import RequestRide from "../../src/application/usecase/RequestRide";
import Signup from "../../src/application/usecase/Signup";
import StartRide from "../../src/application/usecase/StartRide";
import UpdatePosition from "../../src/application/usecase/UpdatePosition";
import DatabaseConnection, { PgPromiseAdapter } from "../../src/infra/database/DatabaseConnection";
import { MailerGatewayMemory } from "../../src/infra/gateway/MailerGateway";
import { AccountRepositoryDatabase } from "../../src/infra/repository/AccountRepository";
import { PositionRepositoryDatabase } from "../../src/infra/repository/PositionRepository";
import { RideRepositoryDatabase } from "../../src/infra/repository/RideRepository";

let connection: DatabaseConnection;
let acceptRide: AcceptRide;
let getRide: GetRide;
let signup: Signup;
let requestRide: RequestRide;
let startRide: StartRide;
let updatePosition: UpdatePosition;
let getPosition: GetPosition;

beforeEach(() => {
  connection = new PgPromiseAdapter();
  const accountRepository = new AccountRepositoryDatabase(connection);
  const rideRepository = new RideRepositoryDatabase(connection);
  const positionRepository = new PositionRepositoryDatabase(connection);
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
  updatePosition = new UpdatePosition(
    rideRepository,
    positionRepository
  )
  getPosition = new GetPosition(
    positionRepository
  )
})

test("Deve salvar o position", async () => {
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

  const inputUpdatePosition = {
    rideId: outputRequestRide.rideId,
    lat: -27.496887588317275,
    long: -48.545022195325124
  }
  const outputUpdatePosition = await updatePosition.execute(inputUpdatePosition);

  const inputGetPosition = {
    positionId: outputUpdatePosition.positionId
  }
  const outputGetPosition = await getPosition.execute(inputGetPosition);
  expect(outputGetPosition.positionId).toBe(outputUpdatePosition.positionId);
  expect(outputGetPosition.rideId).toBe(outputRequestRide.rideId);
  expect(outputGetPosition.lat).toBe(-27.496887588317275);
  expect(outputGetPosition.long).toBe(-48.545022195325124);
})

test("Deve lançar erro caso a corrida não esteja em andamento", async () => {
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

  const inputUpdatePosition = {
    rideId: outputRequestRide.rideId,
    lat: -27.496887588317275,
    long: -48.545022195325124
  }
  await expect(() => updatePosition.execute(inputUpdatePosition)).rejects.toThrow(new Error("Ride has not started"))
})

afterEach(async () => {
  await connection.close();
});