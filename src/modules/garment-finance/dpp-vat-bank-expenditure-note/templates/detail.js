import {computedFrom } from 'aurelia-framework';
export class Detail {

    activate(context) {
        this.data = context.data;
		this.error = context.error;
        this.readOnly = context.options.readOnly;
        this.data.Amount=this.data.Invoice.Amount;
    }
    @computedFrom("data.Invoice","data.Invoice.PaidAmount")
    get amount() {
        var result= this.data.Invoice.Amount - this.data.Invoice.PaidAmount;
        this.data.Amount=result;
        return result;
    }
}