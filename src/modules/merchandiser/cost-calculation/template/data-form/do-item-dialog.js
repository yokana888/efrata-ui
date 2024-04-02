import { inject, useView } from "aurelia-framework";
import { DialogController } from "aurelia-dialog";
import { Service, PurchasingService } from "../../service";
import { ServiceCore } from "../../service-core";

@inject(DialogController, Service, PurchasingService, ServiceCore)
@useView(
  "modules/merchandiser/cost-calculation/template/data-form/do-item-dialog.html"
)
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
    height: 500,
  };

  columns = [
    { field: "isSelected", radio: true, sortable: false },
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
    if (info.search) {
      this.selectedData = [];

      var order = {};
      if (info.sort) order[info.sort] = info.order;

      var arg = {
        page: parseInt(info.offset / info.limit, 10) + 1,
        size: info.limit,
        keyword: info.search,
        order: order,
        filter: JSON.stringify(this.filter),
      };

      return this.prService.searchDOItems(arg).then((result) => {
        result.data.map((data) => {
          return data;
        });

        let data = [];
        for (const d of result.data) {
          data.push(
            Object.assign(
              {
                //   PRMasterId: d.GarmentPRId,
                PRMasterItemId: d.GarmentPRItemId,
                POMaster: d.POSerialNumber,

                PRNo: d.DOItemNo,
                RONo: d.RONo,
                Article: "-",

                Category: {
                  Id: d.CategoryId,
                  code: d.CategoryCode,
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
                  Unit: d.UOMUnit,
                },
                BudgetPrice: d.BudgetPrice,
                PriceUom: {
                  Id: d.UOMId,
                  Unit: d.UOMUnit,
                },
                AvailableQuantity: d.RemainingQuantity,
                DOItemsId: d.GarmentPRId,
              },
              d
            )
          );
        }

        let fabricItemsProductIds = data
          .filter((i) => i.Category.name === "FABRIC")
          .map((i) => i.Product.Id);

        if (fabricItemsProductIds.length) {
          return this.coreService
            .getGarmentProductsByIds(fabricItemsProductIds)
            .then((garmentProductsResult) => {
              data
                .filter((i) => i.Category.name === "FABRIC")
                .forEach((i) => {
                  const product = garmentProductsResult.find(
                    (d) => d.Id == i.Product.Id
                  );

                  i.Product = product;
                  i.Composition = product;
                  i.Const = product;
                  i.Yarn = product;
                  i.Width = product;
                });

              return {
                total: result.info.total,
                data: data,
              };
            });
        } else {
          return {
            total: result.info.total,
            data: data,
          };
        }
        // });
      });
    }
  };

  activate(params) {
    this.DOItemsIds = params.DOItemsIds;
    this.filter = {};

    var doitemIds = this.DOItemsIds.filter(
      (x) => x.data.DOItemsId != undefined
    ).map((m) => `Id==${m.data.DOItemsId}`);

    if (doitemIds.length) {
      this.filter[`(${doitemIds.join("||")})`] = false;
    }
  }

  select() {
    if (this.selectedData && this.selectedData.length > 0) {
      this.controller.ok(this.selectedData[0]);
    } else {
      alert("Belum ada yang dipilih!");
    }
  }
}
