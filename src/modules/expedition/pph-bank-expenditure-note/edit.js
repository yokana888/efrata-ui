import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
import { Base64Helper } from '../../../utils/base-64-coded-helper';


@inject(Router, Service)
export class Edit {
    constructor(router, service) {
        this.router = router;
        this.service = service;
    }

    async activate(params) {
        let id = params.id;
        let decoded = Base64Helper.decode(id);
        id = decoded;
        this.data = await this.service.getById(id);
        this.data.UnitPaymentOrders = [];
        this.data.UnitPaymentOrders.push(...this.data.PPHBankExpenditureNoteItems);

        for (let item of this.data.UnitPaymentOrders) {
            item.PPHId = item.Id;
            item.Check = true;
        }

        this.bank = this.data.Bank;
        this.incomeTax = this.data.IncomeTax;
    }

    cancelCallback(event) {
        const encoded = Base64Helper.encode(this.data.Id);
        this.router.navigateToRoute('view', { id: encoded });
    }

    saveCallback(event) {
        this.data.PPHBankExpenditureNoteItems = [];

        for (let item of this.data.UnitPaymentOrders.filter(p => p.Check === true)) {
            if (!item.PPHId) {
                item.PurchasingDocumentExpeditionId = item.Id;
                item.Id = 0;
            }

            this.data.PPHBankExpenditureNoteItems.push(item);
        }

        if (this.data.PPHBankExpenditureNoteItems.length > 0) {
            let totalDPP = 0, totalPPH = 0;

            for (let i of this.data.PPHBankExpenditureNoteItems) {
                totalDPP += i.TotalPaid - i.Vat;
                totalPPH += i.IncomeTax;
            }

            this.data.TotalDPP = totalDPP;
            this.data.TotalIncomeTax = totalPPH;
        }
        
        this.service.update(this.data)
            .then(result => {
                const encoded = Base64Helper.encode(this.data.Id);
                this.router.navigateToRoute('view', { id: encoded });
            })
            .catch(e => {
                this.error = e;
            })
    }
}
