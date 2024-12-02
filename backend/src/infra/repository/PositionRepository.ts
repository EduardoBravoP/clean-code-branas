import Position from "../../domain/Position";
import DatabaseConnection from "../database/DatabaseConnection";

export default interface PositionRepository {
  savePosition (position: Position): Promise<void>;
  getPositionById (positionId: string): Promise<any>;
}

export class PositionRepositoryDatabase implements PositionRepository {
  constructor(
    readonly connection: DatabaseConnection
  ) {}

  async savePosition(position: Position) {
		await this.connection.query("insert into ccca.position (position_id, ride_id, lat, long, date) values ($1, $2, $3, $4, $5)", [position.positionId, position.rideId, position.lat, position.long, position.date]);
  }

  async getPositionById(positionId: string) {
    const [positionData] = await this.connection.query("select * from ccca.position where position_id = $1", [positionId]);

    return {
      positionId,
      rideId: positionData.ride_id,
      lat: parseFloat(positionData.lat),
      long: parseFloat(positionData.long),
      date: positionData.date
    }
  }
}