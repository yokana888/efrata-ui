import { bindable, inject, computedFrom } from "aurelia-framework";
import { Service,CoreService } from "./service";

const UnitLoader = require('../../../loader/garment-sample-unit-loader');

@inject(Service,CoreService)
export class DataForm {
    @bindable readOnly = false;
    @bindable isEdit = false;
    @bindable title;
    @bindable data = {};
    @bindable itemOptions = {};
    @bindable selectedUnit;
    @bindable selectedComodity;
    constructor(service,coreService) {
        this.service = service;
        this.coreService = coreService;
    }

    formOptions = {
        cancelText: "Kembali",
        saveText: "Simpan",
        deleteText: "Hapus",
        editText: "Ubah"
    };

    controlOptions = {
        label: {
            length: 2
        },
        control: {
            length: 7
        }
    };


    itemsColumns = [""];


    async bind(context) {
        this.context = context;
        this.data = this.context.data;
        this.error = this.context.error;
        this.itemOptions = {
            isEdit: this.isEdit,
            checkedAll: true
        }
        this.data.Date=new Date();
        
    }

    unitView = (unit) => {
        return `${unit.Code} - ${unit.Name}`;
    }

    get unitLoader() {
        return UnitLoader;
    }

    comodityView = (comodity) => {
        return `${comodity.Code}-${comodity.Name}`;
    }

    get comodityLoader() {
        return (keyword) => {
            var info = {
              keyword: keyword
            };
            return this.coreService.getGarmentComodity(info)
                .then((result) => {
                    // return this.service.search({ filter: JSON.stringify({ UnitId: this.data.Unit.Id, IsValid:true }),size:10000 })
                    //     .then((price) => {
                    //         var comoList=[];
                    //         for(var a of result.data){
                    //             if(price.data.length>0){
                    //                 var dup= price.data.find(c=>c.Comodity.Id==a.Id);
                    //                 if(dup)
                    //                     continue;
                    //                 else
                    //                 comoList.push(a);
                    //             }
                    //             else{
                    //                 comoList.push(a);
                    //             }
                    //         }
                    //         return comoList;
                    //     })

                    return result.data;
                    
                });
        }
    }


    async selectedUnitChanged(newValue){
        this.data.Items.splice(0);
        if(newValue){
            this.data.Unit=newValue;
            // if(this.isEdit){
            //     Promise.resolve(this.service.search({ filter: JSON.stringify({ UnitId: this.data.Unit.Id }),size:10000 }))
            //     .then(result => {
            //         for(var data of result.data){
            //             var item={};
            //             item.Comodity=data.Comodity;
            //             item.Unit=data.Unit;
            //             item.Price=data.Price;
            //             item.NewPrice=data.Price;
            //             item.Id=data.Id;
            //             item.Date=data.Date;
            //             this.data.Items.push(item);
            //         }
            //     });
            // }
        }
        else{
            this.data.Unit=null;
            this.data.Items.splice(0);
        }
    }

    async selectedComodityChanged(newValue){
        this.data.Items.splice(0);
        if (newValue) {
            this.data.Comodity = newValue;
            if(this.isEdit){
                Promise.resolve(this.service.search({ filter: JSON.stringify({ UnitId: this.data.Unit.Id, ComodityId : this.data.Comodity.Id  }),size:10000 }))
                .then(result => {
                    for(var data of result.data){
                        var item={};
                        item.Comodity=data.Comodity;
                        item.Unit=data.Unit;
                        item.Price=data.Price;
                        item.NewPrice=data.Price;
                        item.Id=data.Id;
                        item.Date=data.Date;
                        this.data.Items.push(item);
                    }
                });
            }
        }
        else{
            this.data.Comodity=null;
            this.data.Items.splice(0);
        }
    }

    
    itemsInfo = {
        columns: [
            "Komoditi",
            "Tarif"
        ]
    }

    itemsInfoEdit = {
        columns: [
            "Komoditi",
            "Unit",
            "Tarif Lama",
            "Tarif Baru"
        ]
    }

    get addItems() {
        return (event) => {
            this.data.Items.push({
                Unit: this.data.Unit,
            })
        };
    }
}