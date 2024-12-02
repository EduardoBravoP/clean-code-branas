import Ride from "../../domain/Ride";
import RideRepository from "../../infra/repository/RideRepository";
import AccountRepository from "../repository/AccountRepository";

export default class StartRide {
	// DIP - Dependency Inversion Principle
	constructor (readonly rideRepository: RideRepository) {
	}
	
	async execute (input: Input) {
    const ride = await this.rideRepository.getRideById(input.rideId);
    if (ride.status !== 'accepted') throw new Error('Ride not accepted');

		await this.rideRepository.startRide(
      input.rideId,
    );
	}
}

type Input = {
	rideId: string;
}
