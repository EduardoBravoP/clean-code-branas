import GetAccount from "../../application/usecase/GetAccount";
import HttpServer from "../http/HttpServer";
import AcceptRide from "../../application/usecase/AcceptRide";

// Interface Adapter

export default class RideController {

    constructor (readonly httpServer: HttpServer, readonly acceptRide: AcceptRide) {
        httpServer.register("post", "/rides/accept", async (params: any, body: any) => {
            const output = await acceptRide.execute(body);
            return output;
        });
    }
}
