import RideDAO from "./RideDAODatabase";

export default class GetRideById {

	constructor (readonly rideDAO: RideDAO) {
	}
	
	async getRideById (rideId: string) {
		const rideData = await this.rideDAO.getRideById(rideId);
		return rideData;
	}
}
