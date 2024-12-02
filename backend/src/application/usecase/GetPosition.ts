import PositionRepository from "../../infra/repository/PositionRepository";

export default class GetPosition {
	// DIP - Dependency Inversion Principle
	constructor (readonly positionRepository: PositionRepository) {
	}
	
	async execute (input: Input) {
		return await this.positionRepository.getPositionById(
      input.positionId
    );
	}
}

type Input = {
	positionId: string;
}
