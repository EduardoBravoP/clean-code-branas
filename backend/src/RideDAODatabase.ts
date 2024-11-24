import pgp from "pg-promise";

export default interface RideDAO {
	saveRide (ride: any): Promise<any>;
	getRideById (id: string): Promise<any>;
  getAllRidesByPassengerId (passengerId: string): Promise<any[]>;
}

export class RideDAODatabase implements RideDAO  {
	async saveRide(ride: any): Promise<any> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
		await connection.query("insert into ccca.ride (ride_id, passenger_id, status, from_lat, from_long, to_lat, to_long, date) values ($1, $2, $3, $4, $5, $6, $7, $8)", [ride.rideId, ride.passengerId, ride.status, ride.fromLong, ride.fromLat, ride.toLat, ride.toLong, ride.date]);
		await connection.$pool.end();
  }

  async getRideById(id: string): Promise<any> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
		const [rideData] = await connection.query("select * from ccca.ride inner join ccca.account on ccca.ride.passenger_id = ccca.account.account_id where ride_id = $1", [id]);
		await connection.$pool.end();
		return {
      rideId: rideData.ride_id, 
      passengerId: rideData.passenger_id, 
      driverId: rideData.driver_id, 
      status: rideData.status, 
      fare: rideData.fare, 
      distance: rideData.distance, 
      fromLong: rideData.from_long, 
      fromLat: rideData.from_lat, 
      toLat: rideData.to_lat, 
      toLong: rideData.to_long, 
      date: rideData.date
		};
  }

  async getAllRidesByPassengerId(passengerId: string): Promise<any> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const ridesData = await connection.query('select * from ccca.ride where passenger_id = $1', [passengerId])
    await connection.$pool.end();

    return ridesData.map((ride: any) => ({
      rideId: ride.ride_id, 
      passengerId: ride.passenger_id, 
      driverId: ride.driver_id,
      status: ride.status, 
      fare: ride.fare, 
      distance: ride.distance, 
      fromLong: ride.from_long, 
      fromLat: ride.from_lat, 
      toLat: ride.to_lat, 
      toLong: ride.to_long, 
      date: ride.date
		}))
  }
}

export class RideDAOMemory implements RideDAO  {
	rides: any[];

	constructor () {
		this.rides = [];
	}

	saveRide(ride: any): Promise<any> {
    this.rides.push(ride);

    return ride;
  }

  getRideById(id: string): Promise<any> {
    return this.rides.find(ride => ride.rideId === id);
  }

  getAllRidesByPassengerId(passengerId: string): any {
    return this.rides.filter(ride => ride.passengerId === passengerId);
  }
}
