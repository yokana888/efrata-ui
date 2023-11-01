import { inject, Lazy, bindable } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import {Service } from '../service';

@inject(Router, Service)
export class ItemView {

    constructor(router, service) {
        this.router = router;
        this.service = service;

        this.columns = ['Unit', 'Nama Barang', 'Jumlah', 'Satuan', 'Harga Total'];
    }

    async activate(context) {
        this.data = context.data
        this.isShowing = false;
        if (context.context.options) {
            this.IDR = context.context.options.IDR;
            this.rate = context.context.options.rate;
            this.sameCurrency = context.context.options.SameCurrency;
            this.DocumentNo = context.context.options.DocumentNo;
            if (this.IDR) {
                this.data.TotalPaidIDR = this.data.TotalPaid * this.rate;
                this.data.CurrencyIDR = "IDR";
            }

            let listURNNo = [];
            for (let item of this.data.Items) {
                if (item.URNNo != null)
                    listURNNo.push(item.URNNo);
            }

            this.listURNNo = listURNNo.length != 0 ? listURNNo.join('\n') : listURNNo;

        }
    }

    toggle() {
        this.isShowing = !this.isShowing;
    }
}
