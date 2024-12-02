import Position from "../../domain/Position";
import PositionRepository from "../../infra/repository/PositionRepository";
import RideRepository from "../../infra/repository/RideRepository";
import AccountRepository from "../repository/AccountRepository";

export default class UpdatePosition {
	// DIP - Dependency Inversion Principle
	constructor (readonly rideRepository: RideRepository, readonly positionRepository: PositionRepository) {
	}
	
	async execute (input: Input) {
    const ride = await this.rideRepository.getRideById(input.rideId);
    if (ride.status !== 'in_progress') {
      throw new Error("Ride has not started")
    }
    const position = Position.create(input.rideId, input.lat, input.long)
		await this.positionRepository.savePosition(
      position
    );

    return {
      positionId: position.positionId
    }
	}
}

type Input = {
	rideId: string;
  lat: number;
  long: number;
}
