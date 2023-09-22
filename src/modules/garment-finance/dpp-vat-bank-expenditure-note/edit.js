import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';


@inject(Router, Service)
export class Edit {
    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    isNotEditable = true;
    isEdit=true;
    async activate(params) {
        let id = params.id;
        this.data = await this.service.getById(id);
        for(var item of this.data.Items){
            var paid=0;
            var outstanding=0;
            for(var detail of item.InternalNote.Items){
                var dt= await this.service.getDetailByNIId(detail.Invoice.Id);
                var paidAmount=dt ? dt.PaidAmount : 0;
                paid+=paidAmount;
                if(detail.Invoice.Amount-paidAmount>0){
                    detail.Invoice.Amount=item.InternalNote.TotalAmount-paid + detail.Invoice.PaidAmount;
                    outstanding+=detail.Invoice.Amount+ detail.Invoice.PaidAmount;
                }
            }
            item.OutstandingAmount=outstanding;
        }
    }

    cancelCallback(event) {
        this.router.navigateToRoute('view', { id: this.data.Id });
    }

    saveCallback(event) {

        this.service.update(this.data)
            .then(result => {
                this.router.navigateToRoute('view', { id: this.data.Id });
            })
            .catch(e => {
                this.error = e;
            })
    }
}
