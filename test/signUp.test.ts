import axios from "axios"
import pgPromise from "pg-promise";

axios.defaults.validateStatus = function () {
	return true;
}

beforeAll(() => {
  deleteAccounts(); 
});

test('Deve criar uma conta de passageiro', async () => {
  const input = {
    name: 'John Doe Passenger',
    email: 'johndoepassenger@gmail.com',
    cpf: '36258952003',
    password: '12345',
    isPassenger: true
  }
  
  const response = await axios.post('http://localhost:3000/signup', input)
  const createdAccountId = response.data.accountId

  expect(createdAccountId).toBeDefined()

  const accountResponse = await axios.get(`http://localhost:3000/accounts/${createdAccountId}`)

  expect(accountResponse.data.is_driver).toBeFalsy()
  expect(accountResponse.data.is_passenger).toBeTruthy()
})

test('Deve criar uma conta de motorista', async () => {
  const input = {
    name: 'John Doe Driver',
    email: 'johndoedriver@gmail.com',
    cpf: '36258952003',
    carPlate: 'ABC1234',
    password: '12345',
    isDriver: true
  }
  
  const response = await axios.post('http://localhost:3000/signup', input)
  const createdAccountId = response.data.accountId

  expect(createdAccountId).toBeDefined()

  const accountResponse = await axios.get(`http://localhost:3000/accounts/${createdAccountId}`)

  expect(accountResponse.data.is_driver).toBeTruthy()
  expect(accountResponse.data.is_passenger).toBeFalsy()
})

test('Não deve criar uma nova conta com um email já existente', async () => {
  const input = {
    name: 'John Doe Passenger',
    email: 'johndoepassenger@gmail.com',
    cpf: '36258952003',
    password: '12345',
    isPassenger: true
  }

  const response = await axios.post('http://localhost:3000/signup', input)

  expect(response.status).toBe(422)
  expect(response.data.message).toBe("Account already exists")
})

test('Não deve criar uma conta com um nome inválido', async () => {
  const input = {
    name: 'John',
    email: 'john@gmail.com',
    cpf: '36258952003',
    password: '12345',
    isPassenger: true
  }

  const response = await axios.post('http://localhost:3000/signup', input)

  expect(response.status).toBe(422)
  expect(response.data.message).toBe("Invalid name")
})

test('Não deve criar uma conta com um email inválido', async () => {
  const input = {
    name: 'John Doe',
    email: 'john.com',
    cpf: '36258952003',
    password: '12345',
    isPassenger: true
  }

  const response = await axios.post('http://localhost:3000/signup', input)

  expect(response.status).toBe(422)
  expect(response.data.message).toBe("Invalid email")
})

test('Não deve criar uma conta com um cpf inválido', async () => {
  const input = {
    name: 'John Doe',
    email: 'john@gmail.com',
    cpf: '123123123',
    password: '12345',
    isPassenger: true
  }

  const response = await axios.post('http://localhost:3000/signup', input)

  expect(response.status).toBe(422)
  expect(response.data.message).toBe("Invalid cpf")
})

test('Não deve criar uma conta de motorista com uma placa inválida', async () => {
  const input = {
    name: 'John Doe Driver',
    email: 'johndoedriver2@gmail.com',
    cpf: '36258952003',
    carPlate: 'AB1234',
    password: '12345',
    isDriver: true
  }
  
  const response = await axios.post('http://localhost:3000/signup', input)

  expect(response.status).toBe(422)
  expect(response.data.message).toBe("Invalid car plate")
})

async function deleteAccounts() {
  const connection = pgPromise()("postgres://postgres:123456@localhost:5432/app");
  await connection.query("delete from ccca.account");
  await connection.$pool.end();
}