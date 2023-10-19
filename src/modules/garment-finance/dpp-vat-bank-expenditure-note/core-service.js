import { RestService } from '../../../utils/rest-service';

const currencyServiceUri = "master/garment-currencies";

export class CoreService extends RestService {
    constructor(http, aggregator, config, api) {
        super(http, aggregator, config, "core");
    }

    getCurrency(info) {
        var endpoint = `${currencyServiceUri}`;
        return super.list(endpoint, info);
    }

}