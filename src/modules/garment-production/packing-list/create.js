import { inject, bindable } from "aurelia-framework";
import { Router } from "aurelia-router";
import { Service } from "./service";

@inject(Router, Service)
export class Create {
  hasCancel = true;
  hasSave = true;
  isCreate = true;
  @bindable packingList;

  constructor(router, service) {
    this.router = router;
    this.service = service;
  }

  bind() {
    this.data = {
      date: new Date(),
      createdUtc: new Date(),
    };
    this.error = {};
  }

  formOptions = {
    cancelText: "Kembali",
    saveText: "Buat",
  };

  controlOptions = {
    label: {
      length: 3,
    },
    control: {
      length: 5,
    },
  };

  cancel(event) {
    this.router.navigateToRoute("list");
  }

  save(event) {
    this.service
      .create(this.data)
      .then((result) => {
        alert("Data berhasil dibuat, No Invoice: " + result);
        this.router.navigateToRoute("list");
      })
      .catch((error) => {
        this.error = error;

        let errorNotif = "";
        if (
          error.InvoiceType ||
          error.Type ||
          error.Date ||
          error.ItemsCount ||
          error.Items
        ) {
          errorNotif += "Tab DESCRIPTION ada kesalahan pengisian.\n";
        }
        if (
          error.GrossWeight ||
          error.NettWeight ||
          error.totalCartons ||
          error.SayUnit ||
          error.MeasurementsCount ||
          error.Measurements
        ) {
          errorNotif += "Tab DETAIL MEASUREMENT ada kesalahan pengisian.\n";
        }
        if (error.ShippingMark || error.SideMark || error.Remark) {
          errorNotif +=
            "Tab SHIPPING MARK - SIDE MARK - REMARK ada kesalahan pengisian.";
        }

        if (errorNotif) {
          alert(errorNotif);
        }
      });
  }
}
