import { inject, useView } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';
import { Service, PurchasingService } from '../../service';
import { ServiceCore } from '../../service-core';

@inject(DialogController, Service, PurchasingService, ServiceCore)
@useView("modules/merchandiser/cost-calculation/template/data-form/do-item-dialog.html")
export class DOItemDialog {
    data = {};
    error = {};

    constructor(controller, service, prService, coreService) {
        this.controller = controller;
        this.answer = null;
        this.service = service;
        this.prService = prService;
        this.coreService = coreService;
    }

    options = {
        showColumns: false,
        showToggle: false,
        clickToSelect: true,
        height: 500
    }

    columns = [
        { field: "isSelected", radio: true, sortable: false, },
        // { field: "GarmentPurchaseRequest.PRNo", title: "Nomor PR" },
        { field: "RONo", title: "Nomor RO" },
        // { field: "GarmentPurchaseRequest.Article", title: "Artikel" },
        { field: "POSerialNumber", title: "No. PO" },
        { field: "Category.name", title: "Kategori" },
        { field: "Product.Code", title: "Kode Barang" },
        { field: "Composition.Composition", title: "Komposisi", sortable: false },
        { field: "Const.Const", title: "Konstruksi", sortable: false },
        { field: "Yarn.Yarn", title: "Yarn", sortable: false },
        { field: "Width.Width", title: "Width", sortable: false },
        { field: "ProductRemark", title: "Keterangan" },
        { field: "RemainingQuantity", title: "Jumlah" },
        { field: "UOMUnit", title: "Satuan" },
        { field: "AvailableQuantity", title: "Jumlah Tersedia", sortable: false },
    ];

    loader = (info) => {
        this.selectedData = [];

        var order = {};
        if (info.sort)
            order[info.sort] = info.order;

        var arg = {
            page: parseInt(info.offset / info.limit, 10) + 1,
            size: info.limit,
            keyword: info.search,
            search: JSON.stringify(["POSerialNumber", "RONo", "ProductCode", "ProductName"]),
            order: order,
            select: "new( " +
                "GarmentPRId, GarmentPRItemId, DOItemNo, RONo, POSerialNumber, CategoryId, CategoryCode,CategoryName, ProductId, ProductCode, ProductName, ProductRemark, RemainingQuantity, UOMId, UOMUnit" +
                ")",
            // filter: JSON.stringify(this.filter),  
        }

        return this.prService.searchDOItems(arg)
            .then(result => {
                result.data.map(data => {
                    return data;
                });

                let data = [];
                for (const d of result.data) {
                    data.push(Object.assign({
                        PRMasterId: d.GarmentPRId,
                        PRMasterItemId: d.GarmentPRItemId,
                        POMaster: d.DOItemNo,  //D.POSerialNumber,

                        PRNo: d.DOItemNo,
                        RONo: d.RONo,
                        Article: "-",                   
                        
                        Category: {
                            Id: d.CategoryId,
                            code:d.CategoryCode,
                            name: d.CategoryName,
                        },

                        Product: {
                            Id: d.ProductId,
                            Code: d.ProductCode,
                            Name: d.ProductName,
                        },

                        Description: d.ProductRemark,
                        Uom: {
                            Id: d.UOMId,
                            Unit: d.UOMUnit
                        },
                        BudgetPrice: d.BudgetPrice,
                        PriceUom: {
                            Id: d.UOMId,
                            Unit: d.UOMUnit
                        }

                    }, d));
                }

                let materialsFilter = {};
                //materialsFilter[`(CostCalculationGarmentId == ${this.CCId})`] = false;

                const doitemids = data.filter((item, index) => item.PRMasterItemId > 0 && data.findIndex(d => d.PRMasterItemId === item.PRMasterItemId) === index).map(item => item.PRMasterItemId);

                const materialsInfo = {
                    size: 0,
                    select: "new( PRMasterItemId, BudgetQuantity)",

                    doitemids: JSON.stringify(doitemids),
                    //filter: JSON.stringify(materialsFilter)

                };

                return this.service.getDOItemMaterials(materialsInfo)
                    .then(ccMaterialsResults => {
                        const ccMaterials = ccMaterialsResults.data || [];
                        data.forEach(d => {
                            const selectedCCMaterials = ccMaterials.filter(m => m.PRMasterItemId === d.PRMasterItemId);
                            const othersQuantity = selectedCCMaterials.reduce((acc, cur) => acc += cur.BudgetQuantity, 0);
                            d.AvailableQuantity = d.RemainingQuantity - othersQuantity;
                        });

                        let fabricItemsProductIds = data
                            .filter(i => i.Category.name === "FABRIC")
                            .map(i => i.Product.Id);

                        if (fabricItemsProductIds.length) {
                            return this.coreService.getGarmentProductsByIds(fabricItemsProductIds)
                                .then(garmentProductsResult => {
                                    data.filter(i => i.Category.name === "FABRIC")
                                        .forEach(i => {
                                            const product = garmentProductsResult.find(d => d.Id == i.Product.Id);

                                            i.Product = product;
                                            i.Composition = product;
                                            i.Const = product;
                                            i.Yarn = product;
                                            i.Width = product;
                                        });

                                    return {
                                        total: result.info.total,
                                        data: data
                                    }
                                });
                        } else {
                            return {
                                total: result.info.total,
                                data: data
                            }
                        }
                    });
            });
    }

    // activate(params) {
    //     this.CCId = params.CCId;
    //     this.filter = {};
    //     this.filter["GarmentPurchaseRequest.PRType == \"MASTER\" || GarmentPurchaseRequest.PRType == \"SAMPLE\""] = true;
    //     this.filter[`GarmentPurchaseRequest.SCId == ${params.SCId} || IsApprovedOpenPOKadivMd`] = true;
    //     this.filter["GarmentPurchaseRequest.IsValidatedMD2"] = true;
    // }

    select() {
        if (this.selectedData && this.selectedData.length > 0) {
            this.controller.ok(this.selectedData[0]);
        } else {
            alert("Belum ada yang dipilih!")
        }
    }
}
