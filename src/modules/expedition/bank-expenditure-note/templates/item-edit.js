import { inject, Lazy, bindable } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import {Service } from '../service';

@inject(Router, Service)
export class Item {

    constructor(router, service) {
        this.router = router;
        this.service = service;
        this.queryUPO = { position: 1 };

        this.columns = ['Unit', 'Nama Barang', 'Jumlah', 'Satuan', 'Harga Total'];
    }

    async activate(context) {
        this.data = context.data
        this.isShowing = false;
        this.data.TotalPaidIDR = 0;
        this.DocumentNo = context.context.options.DocumentNo;
        console.log(context)

        if (this.data.IncomeTaxBy && this.data.IncomeTaxBy.toUpperCase() == "SUPPLIER")
            this.data.TotalPaid = this.data.TotalPaid - this.data.IncomeTax;

        if (context.context.options) {
            this.IDR = context.context.options.IDR;
            this.rate = context.context.options.rate;
            this.sameCurrency = context.context.options.SameCurrency;
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

        this.SupplierPayment = this.data.SupplierPayment;
        
        let arg = {
            page: 1,
            size: Number.MAX_SAFE_INTEGER,
            filter: JSON.stringify({ "BankExpenditureNoteNo":this.DocumentNo }) //CASHIER DIVISION
        };

        await this.service.searchAllByPosition(arg)
            .then((result) => {
                console.log(result)
                console.log(this.data)
                this.data.AmountPaid=result.data[0].AmountPaid-this.data.SupplierPayment;
                this.data.PaymentDifference=this.data.TotalPaid-(this.data.AmountPaid+this.data.SupplierPayment);
            });
    }
    
    toggle() {
        this.isShowing = !this.isShowing;
    }

    onRemove() {
        this.bind();
    }

    get unitPaymentOrderLoader() {
        return UnitPaymentOrderLoader;
    }

    @bindable SupplierPayment
    SupplierPaymentChanged(newValue) {
      this.data.SupplierPayment = newValue;
      this.data.PaymentDifference = this.data.TotalPaid - (this.data.AmountPaid + newValue);
    }
}
