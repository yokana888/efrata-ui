import { inject, bindable, computedFrom } from 'aurelia-framework';
import { Service } from './service';
import { PurchasingService } from './purchasing-service';
import { CoreService } from './core-service';
import moment from 'moment';

const BankLoader = require('../shared/bank-account-loader');
const SupplierLoader = require('../shared/garment-supplier-loader');
// const CurrencyLoader = require('../shared/garment-currency-loader');
const CurrencyLoader = require('../../../loader/garment-currencies-by-latest-date-loader');

@inject(Service, PurchasingService,CoreService)
export class DataForm {
    @bindable title;
    @bindable readOnly;

    formOptions = {
        cancelText: "Kembali",
        saveText: "Simpan",
        deleteText: "Hapus",
        editText: "Ubah",
    };

    controlOptions = {
        label: {
            length: 4,
        },
        control: {
            length: 4,
        },
    };

    constructor(service, purchasingService,coreService) {
        this.service = service;
        this.purchasingService = purchasingService;
        this.coreService = coreService;
    }

    async bind(context) {
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;
        this.currency=this.data.Currency;
        this.isNotEditable = this.context.isNotEditable;
        this.isEdit = this.context.isEdit;

        this.cancelCallback = this.context.cancelCallback;

        this.saveCallback = this.context.saveCallback;

        if (!this.data.IsPosted) {
            this.deleteCallback = this.context.deleteCallback;
            this.editCallback = this.context.editCallback;
        }
       
        if (!this.readOnly) {
            this.collection = {
                columns: ['__check', 'No NI', 'Tanggal NI', 'Tanggal Jatuh Tempo', 'Supplier', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', 'Total Outstanding', '']
            };
        } else {
            this.collection = {
                columns: ['No NI', 'Tanggal NI', 'Tanggal Jatuh Tempo', 'Supplier', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', 'Total Outstanding', '']
            };
        }

        this.bankAccount = this.data.Bank || null;
        //this.currency = this.data.Currency || null;
        this.supplier = this.data.Supplier || null;

        this.sameCurrency = true;
        this.bankCurrency = null;
        this.currencyCodeValue = null;
    }

    onCheckAll(event) {
        for (var item of this.data.Items) {
            item.Select = event.detail.target.checked;
            for (var itemInvoice of item.InternalNote.Items) {
                itemInvoice.SelectInvoice = event.detail.target.checked;
            }
        }
    }

    get bankLoader() {
        return BankLoader;
    }

    get currencyLoader() {
        return CurrencyLoader;
    }

    get supplierLoader() {
        return SupplierLoader;
    }

    bankView = (bank) => {
        return bank.BankName + " " + bank.Currency.Code + " - " + bank.AccountNumber
    }

    @bindable bankAccount;
    bankAccountChanged(newValue, oldValue) {
      this.data.Bank = newValue;
      if (newValue) {
        this.bankCurrency = newValue.Currency.Code;
        if (this.bankCurrency == "IDR" && this.currencyCodeValue != "IDR" && this.currencyCodeValue != null && !this.readOnly) {
            this.sameCurrency = false;
        }
        else {
            this.sameCurrency = true;
        }
      }
    }

    // @bindable currency;
    // async currencyChanged(newValue, oldValue) {
    //     this.data.Currency = newValue;

    //     if (newValue) {
    //         this.currencyCodeValue = this.data.Currency.Code;
    //         if (this.supplier && !this.readOnly && !this.isEdit) {
    //             let newItems = await this.purchasingService.dppVATBankExpenditureNotes({ supplierId: newValue.Id, currencyCode: this.currency.Code })
    //                 .then((items) => {
    //                     return items.map((item) => {
    //                         item.Id = 0;
    //                         item.InternalNote.Items = item.InternalNote.Items.map((internalNoteItem) => {
    //                             internalNoteItem.Id = 0;
    //                             return internalNoteItem;
    //                         })

    //                         return item;
    //                     })
    //                 });
                    
    //             if (newItems) {
    //                 this.data.Items = this.data.Items.map((item) => {
    //                     var newItem = newItems.find((element => element.InternalNote.Id == item.InternalNote.Id));

    //                     if (newItem) {
    //                         item.InternalNote.Items = item.InternalNote.Items.concat(newItem.InternalNote.Items)
    //                     }

    //                     return item;
    //                 })

    //                 let items = newItems.filter((element) => {
    //                     let exist = this.data.Items.find((item) => item.InternalNote.Id == element.InternalNote.Id);

    //                     return !exist
    //                 });
    //                 var dtItems = this.data.Items.concat(items);
    //                 var dataItems=[];
    //                 for(var dataItem of dtItems){
    //                     var dataDetails=[];
    //                     var paid=0;
    //                     for(var dataDetail of dataItem.InternalNote.Items){
    //                         var dt= await this.service.getDetailByNIId(dataDetail.Invoice.Id);
    //                         var paidAmount=dt ? dt.PaidAmount : 0;
    //                         paid+=paidAmount;
    //                         if(dataDetail.Invoice.Amount-paidAmount>0){
    //                             dataDetail.Invoice.PaidAmount=dataDetail.Invoice.Amount-paidAmount;
    //                             dataDetail.Invoice.Amount=dataDetail.Invoice.Amount-paidAmount;
    //                             dataDetails.push(dataDetail);
    //                         }
    //                     }
    //                     dataItem.OutstandingAmount= dataItem.InternalNote.TotalAmount-paid;
    //                     if(dataDetails.length>0){
    //                         dataItem.InternalNote.Items=dataDetails;
    //                         dataItems.push(dataItem);
    //                     }
    //                 }
    //                 if(dataItems.length>0){
    //                     this.data.Items =dataItems;
    //                 }
    //                 else{
    //                     this.data.Items =dtItems;
    //                 }
    //             }
    //         }
    //         if (this.bankCurrency == "IDR" && this.currencyCodeValue != "IDR" && this.currencyCodeValue != null && !this.readOnly) {
    //             this.sameCurrency = false;
    //         }
    //         else {
    //             this.sameCurrency = true;
    //         }
    //     } else {
    //         this.data.Items = [];
    //     }
    // }

    @bindable supplier;
    async supplierChanged(newValue, oldValue) {
        this.data.Supplier = newValue;

        if (newValue) {
            if (this.currency && !this.readOnly && !this.isEdit) {
                let newItems = await this.purchasingService.dppVATBankExpenditureNotes({ supplierId: newValue.Id, currencyCode: this.currency.code })
                    .then((items) => {
                        return items.map((item) => {
                            item.Id = 0;
                            item.InternalNote.Items = item.InternalNote.Items.map((internalNoteItem) => {
                                internalNoteItem.Id = 0;
                                return internalNoteItem;
                            })
                            return item;
                        })
                    });
                    
                if (newItems) {
                    this.data.Items = this.data.Items.map((item) => {
                        var newItem = newItems.find((element => element.InternalNote.Id == item.InternalNote.Id));

                        if (newItem) {
                            item.InternalNote.Items = item.InternalNote.Items.concat(newItem.InternalNote.Items)
                        }
                        return item;
                    })

                    let items = newItems.filter((element) => {
                        let exist = this.data.Items.find((item) => item.InternalNote.Id == element.InternalNote.Id);

                        return !exist
                    });
                    var dtItems = this.data.Items.concat(items);
                    var dataItems=[];
                    for(var dataItem of dtItems){
                        var dataDetails=[];
                        var paid=0;
                        for(var dataDetail of dataItem.InternalNote.Items){
                            var dt= await this.service.getDetailByNIId(dataDetail.Invoice.Id);
                            var paidAmount=dt ? dt.PaidAmount : 0;
                            paid+=paidAmount;
                            if(dataDetail.Invoice.Amount-paidAmount>0){
                                dataDetail.Invoice.PaidAmount=dataDetail.Invoice.Amount-paidAmount;
                                dataDetail.Invoice.Amount=dataDetail.Invoice.Amount-paidAmount;
                                dataDetails.push(dataDetail);
                            }
                        }
                        dataItem.OutstandingAmount= dataItem.InternalNote.TotalAmount-paid;
                        if(dataDetails.length>0){
                            dataItem.InternalNote.Items=dataDetails;
                            dataItems.push(dataItem);
                        }
                    }
                    if(dataItems.length>0){
                        this.data.Items =dataItems;
                    }
                    else{
                        this.data.Items =dtItems;
                    }
                }
            }
        } else {
            this.data.Items = [];
        }
    }
}
