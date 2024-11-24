import crypto from "crypto";
import RideDAO from "./RideDAODatabase";
import AccountDAO from "./data";

export default class RequestRide {
	constructor (
    readonly rideDAO: RideDAO,
    readonly accountDAO: AccountDAO
  ) {}

  passengerHasOngoingRide(passengerRides: any) {
    return passengerRides.some((ride: any) => ride.status !== 'completed');
  }

	async requestRide (input: any) {
    const passengerAccount = await this.accountDAO.getAccountById(input.passengerId)
    if (!passengerAccount || !passengerAccount.isPassenger) {
      throw new Error('User is not a passenger')
    }

    const passengerRides = await this.rideDAO.getAllRidesByPassengerId(input.passengerId)
    if (this.passengerHasOngoingRide(passengerRides)) {
      throw new Error("User has an ongoing ride")
    }

		const ride = {
      rideId: crypto.randomUUID(), 
      passengerId: input.passengerId, 
      status: 'requested',
      fromLong: input.fromLong, 
      fromLat: input.fromLat, 
      toLat: input.toLat, 
      toLong: input.toLong,
      date: new Date()
		};
		await this.rideDAO.saveRide(ride);
		return ride.rideId;
	}
}
