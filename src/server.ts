import pgp from "pg-promise";
import crypto from "crypto";
import express from "express";
import { validateCpf } from "./validateCpf";
import { createAccount } from "./createAccount";
import { getAccountByEmail } from "./getAccountByEmail";
import { getAccountById } from "./getAccountById";

const app = express();
app.use(express.json());

app.post("/signup", async function (req, res) {
	const input = req.body;
	try {
		const accountExists = await getAccountByEmail(input.email);
		if (accountExists) {
			return res.status(422).json({ message: 'Account already exists' });
		}
		const isNameInvalid = !input.name.match(/[a-zA-Z] [a-zA-Z]+/);
		if (isNameInvalid) {
			return res.status(422).json({ message: 'Invalid name' });
		}
		const isEmailInvalid = !input.email.match(/^(.+)@(.+)$/);
		if (isEmailInvalid) {
			return res.status(422).json({ message: 'Invalid email' });
		}
		const isCpfInvalid = !validateCpf(input.cpf);
		if (isCpfInvalid) {
			return res.status(422).json({ message: 'Invalid cpf' });
		}
		const isCarPlateInvalid = !!input.carPlate && !input.carPlate.match(/[A-Z]{3}[0-9]{4}/);
		if (input.isDriver && isCarPlateInvalid) {
			return res.status(422).json({ message: 'Invalid car plate' });
		}
		const id = crypto.randomUUID();
		const accountId = await createAccount({ id, ...input })

		res.json({
			accountId
		});
	} catch (error) {
		console.log(error);
		res.json({
			message: "Internal server error"
		})
	}
});

app.get('/accounts/:id', async function (req, res) {
	const id = req.params.id

	const account = await getAccountById(id)

	if (!account) {
		res.status(422).json({
			message: 'Account not found'
		})
	}

	res.json(account)
})

app.listen(3000);
