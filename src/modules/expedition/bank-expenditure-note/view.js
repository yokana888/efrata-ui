import { inject, Lazy, bindable } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import {Service } from './service';
import { Dialog } from '../../../au-components/dialog/dialog'


@inject(Router, Service, Dialog)
export class View {
    controlOptions = {
        label: {
            length: 4,
        },
        control: {
            length: 4,
        },
    };
    controlOptions1 = {
        label: {
            length: 4,
        }
    };

    sortingControlOptions = {
        label: {
            length: 4,
        },
        control: {
            length: 4,
        }
    };

    sortingOptions = ["", "Tanggal Invoice", "Tanggal Jatuh Tempo"];
    sortingTypeOptions = ["A - Z", "Z - A"];

    formOptions = {
        cancelText: 'Kembali',
        editText: 'Ubah',
        deleteText: 'Hapus'
    };

    constructor(router, service, dialog) {
        this.router = router;
        this.service = service;
        this.dialog = dialog;

        this.collection = {
            columns: ['No. SPB', 'Tanggal SPB', 'Tanggal Jatuh Tempo', 'Nomor BTU', 'Nomor Invoice', 'Supplier', 'Category', 'Divisi', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', 'Jumlah yang telah dibayar', 'Jumlah dibayar ke Supplier', 'Saldo Hutang', ''],
        };
    }

    bankView = "";
    async activate(params) {
        var id = params.id;
        this.data = await this.service.getById(id);
        
        for (var a of this.data.Details) {
            a.SupplierName = this.data.Supplier.name;
            a.Currency = this.data.CurrencyCode;
            a.PaymentDifference = a.TotalPaid - (a.AmountPaid + a.SupplierPayment);
        }

        if (this.data.IsPosted) {
            this.editCallback = undefined;
            this.deleteCallback = undefined;
        }

        this.IDR = false;
        this.sameCurrency = false;
        this.GrandTotal = this.data.GrandTotal;
        if (this.data.Bank.Currency.Code == "IDR") {
            this.IDR = true;
            if (this.data.CurrencyCode == "IDR") {
                this.sameCurrency = true;
            }
            this.GrandTotal = this.data.GrandTotal * this.data.CurrencyRate;

        }

        if (!this.IDR || this.sameCurrency) {
            this.collection = {
                columns: ['No. SPB', 'Tanggal SPB', 'Tanggal Jatuh Tempo', 'Nomor BTU', 'Nomor Invoice', 'Supplier', 'Category', 'Divisi', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', 'Jumlah yang telah dibayar', 'Jumlah dibayar ke Supplier', 'Saldo Hutang', ''],
            };
        } else {
            this.collection = {
                columns: ['No. SPB', 'Tanggal SPB', 'Tanggal Jatuh Tempo', 'Nomor BTU', 'Nomor Invoice', 'Supplier', 'Category', 'Divisi', 'PPN', 'PPh', 'Total Harga ((DPP + PPN) - PPh)', 'Mata Uang', 'Total Harga ((DPP + PPN) - PPh) (IDR)', 'Mata Uang', 'Jumlah yang telah dibayar', 'Jumlah dibayar ke Supplier', 'Saldo Hutang', ''],
            };
        }
        this.collectionOptions = {
            IDR: this.IDR,
            rate: this.data.CurrencyRate,
            SameCurrency: this.sameCurrency,
            DocumentNo: this.data.DocumentNo
        };
        
        this.bankView = this.data.Bank.AccountName ? `${this.data.Bank.AccountName} - A/C : ${this.data.Bank.AccountNumber}` : '';
        
        for(var d of this.data.Details){
            
            let arg = {
                page: 1,
                size: Number.MAX_SAFE_INTEGER,
                filter: JSON.stringify({ "BankExpenditureNoteNo":d.DocumentNo }) //CASHIER DIVISION
            };
    
            await this.service.searchAllByPosition(arg)
                .then((result) => {
                    d.AmountPaid=result.data[0].AmountPaid-d.SupplierPayment;
                    d.PaymentDifference=d.TotalPaid-(d.AmountPaid+d.SupplierPayment);
                });
        }

        var canUpdate= this.data.Details.find(a=>a.PaymentDifference>0);
        if(!canUpdate){
            this.editCallback=null;
        }
    }

    cancelCallback(event) {
        this.router.navigateToRoute('list');
    }

    editCallback(event) {
        this.router.navigateToRoute('edit', { id: this.data.Id });
    }

    deleteCallback(event) {
        this.dialog.prompt("Apakah anda yakin akan menghapus data?", "Hapus Data")
            .then(response => {
                if (response.ok) {
                    this.service.delete(this.data).then(result => {
                        this.cancelCallback();
                    });
                }
            });
    }

    @bindable selectedSortOption;
    selectedSortOptionChanged(newValue, oldValue) {
        if (newValue)
            this.sortItems();
    }

    @bindable selectedSortTypeOption
    selectedSortTypeOptionChanged(newValue, oldValue) {
        if (newValue)
            this.sortItems();
    }

    sortItems() {
        if (this.UPOResults && this.UPOResults.length > 0) {
            if (this.selectedSortTypeOption == "A - Z") {
                switch (this.selectedSortOption) {
                    case "Tanggal Invoice":
                        this.UPOResults = this.UPOResults.sort((item1, item2) => {
                            if (item1.UPODate < item2.UPODate) {
                                return -1;
                            }
                            if (item1.UPODate > item2.UPODate) {
                                return 1;
                            }
                            return 0;
                        });
                        break;
                    case "Tanggal Jatuh Tempo":
                        this.UPOResults = this.UPOResults.sort((item1, item2) => {
                            if (item1.DueDate < item2.DueDate) {
                                return -1;
                            }
                            if (item1.DueDate > item2.DueDate) {
                                return 1;
                            }
                            return 0;
                        });
                        break;
                    default:
                        this.UPOResults = this.UPOResults.sort((item1, item2) => {
                            if (item1.UnitPaymentOrderNo < item2.UnitPaymentOrderNo) {
                                return -1;
                            }
                            if (item1.UnitPaymentOrderNo > item2.UnitPaymentOrderNo) {
                                return 1;
                            }
                            return 0;
                        });
                        break;
                }
            } else if (this.selectedSortTypeOption == "Z - A") {
                switch (this.selectedSortOption) {
                    case "Tanggal Invoice":
                        this.UPOResults = this.UPOResults.sort((item1, item2) => {
                            if (item1.UPODate > item2.UPODate) {
                                return -1;
                            }
                            if (item1.UPODate < item2.UPODate) {
                                return 1;
                            }
                            return 0;
                        });
                        break;
                    case "Tanggal Jatuh Tempo":
                        this.UPOResults = this.UPOResults.sort((item1, item2) => {
                            if (item1.DueDate > item2.DueDate) {
                                return -1;
                            }
                            if (item1.DueDate < item2.DueDate) {
                                return 1;
                            }
                            return 0;
                        });
                        break;
                    default:
                        this.UPOResults = this.UPOResults.sort((item1, item2) => {
                            if (item1.UnitPaymentOrderNo > item2.UnitPaymentOrderNo) {
                                return -1;
                            }
                            if (item1.UnitPaymentOrderNo < item2.UnitPaymentOrderNo) {
                                return 1;
                            }
                            return 0;
                        });
                        break;
                }
            }
        }

        // this.Item
        // if (this.ItemsCollection) {
        //     this.ItemsCollection.bind();
        // }

        if (this.ItemsCollectionRate)
            this.ItemsCollectionRate.bind();
    }
}
