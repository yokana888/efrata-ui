import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';


@inject(Router, Service)
export class View {
    hasCancel = true;
   // hasEdit = true;
    hasDelete = true;
    hasView = true;
    hasCreate = false;
    //hasEdit = false;

    constructor(router, service) {
        this.router = router;
        this.service = service;
    }
    isReceived = false;

    async activate(params) {
        var id = params.id;
        this.isCustomsDisplay = "Ya";
        this.data = await this.service.getById(id);
        this.supplier = this.data.supplier;
        // if(this.data.isCustoms==true)
        //     this.isCustomsDisplay="Ya"
        // else
        //     this.isCustomsDisplay="Tidak"
        if (this.data.isInvoice || this.data.isCustoms) {
            this.hasDelete = false;
            this.hasView = false;
            console.log(this.hasEdit)
        }
        
    }

    cancel(event) {
        this.router.navigateToRoute('list');
    }

    edit(event) {
        this.router.navigateToRoute('edit', { id: this.data.Id });
    }

    delete(event) {
        this.service.delete(this.data).then(result => {
            this.cancel();
        });
    }
}
