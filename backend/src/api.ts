import express from "express";
import cors from "cors";
import { AccountDAODatabase } from "./data";
import GetAccount from "./GetAccount";
import Signup from "./Signup";
import { MailerGatewayMemory } from "./MailerGateway";
import { RideDAODatabase } from "./RideDAODatabase";
import RequestRide from "./RequestRide";
import GetRideById from "./GetRideById";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/signup", async function (req, res) {
	const input = req.body;
	console.log("Signup", input);
	try {
		const accountDAO = new AccountDAODatabase();
		const mailerGateway = new MailerGatewayMemory();
		const signup = new Signup(accountDAO, mailerGateway);
		const output = await signup.signup(input);
		res.json(output);
	} catch (e: any) {
		res.status(422).json({ message: e.message });
	}
});

app.get("/accounts/:accountId", async function (req, res) {
	const accountDAO = new AccountDAODatabase();
	const getAccount = new GetAccount(accountDAO);
	const output = await getAccount.getAccount(req.params.accountId);
	res.json(output);
});

app.post("/rides/request", async function (req, res) {
	try {
		const rideDAO = new RideDAODatabase();
		const accountDAO = new AccountDAODatabase();

		const requestRide = new RequestRide(rideDAO, accountDAO);
		const rideId = await requestRide.requestRide(req.body);

		return res.json({ rideId });
	} catch (err: any) {
		res.status(422).json({ message: err.message })
	}
})

app.get("/rides/:rideId", async function (req, res) {
	try {
		const rideDAO = new RideDAODatabase();

		const getRideById = new GetRideById(rideDAO);
		const rideData = await getRideById.getRideById(req.params.rideId);

		return res.json(rideData);
	} catch (err: any) {
		return res.status(422).json({ message: err.message });
	}
})

app.listen(3000);
