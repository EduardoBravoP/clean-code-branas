import Ride from "../../domain/Ride";
import RideRepository from "../../infra/repository/RideRepository";
import AccountRepository from "../repository/AccountRepository";

export default class AcceptRide {
	// DIP - Dependency Inversion Principle
	constructor (readonly accountRepository: AccountRepository, readonly rideRepository: RideRepository) {
	}
	
	async execute (input: Input) {    
    const account = await this.accountRepository.getAccountById(input.driverId);
    if (!account.isDriver) throw new Error("User is not a driver");
    const ride = await this.rideRepository.getRideById(input.rideId);
    if (ride.status !== 'requested') throw new Error("Ride is not requested");
    const driverHasAnActiveRide = await this.rideRepository.hasActiveRideByDriverId(input.driverId);
    if (driverHasAnActiveRide) throw new Error("Driver is already in a ride");
		await this.rideRepository.acceptRide(
      input.rideId,
      input.driverId
    );
	}
}

type Input = {
	rideId: string;
  driverId: string;
}
