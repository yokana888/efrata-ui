import { inject, Lazy } from "aurelia-framework";
import { Router } from "aurelia-router";
import { Service } from "./service";
import { activationStrategy } from "aurelia-router";
import { CoreService } from './core-service';

@inject(Router, Service,CoreService)
export class Create {
    constructor(router, service,coreService) {
        this.router = router;
        this.service = service;
        this.coreService = coreService;
        this.data = {};
    }

    async activate(context) {
        let currencyResult=await this.coreService.getCurrency({ size: 1, filter: JSON.stringify({ Code:"IDR" }) });
        this.currency = currencyResult.data[0];
        this.data.Currency=this.currency;
    }
    list() {
        this.router.navigateToRoute("list");
    }

    determineActivationStrategy() {
        return activationStrategy.replace;
    }

    cancelCallback(event) {
        this.list();
    }

    saveCallback(event) {
        this.service
            .create(this.data)
            .then(result => {
                alert("Data berhasil dibuat");
                this.router.navigateToRoute(
                    "create",
                    {},
                    { replace: true, trigger: true }
                );
            })
            .catch(e => {
                this.error = e;
            });
    }
}
