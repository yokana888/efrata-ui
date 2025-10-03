import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
import { Base64Helper } from '../../../utils/base-64-coded-helper';
//import { ServiceLocal } from './service-local';



@inject(Router, Service)
//@inject(Router, ServiceLocal)
export class View {
  hasCancel = true;
  hasEdit = true;
  hasDelete = true;
  constructor(router, service) {
    this.router = router;
    this.service = service;
  }

  async activate(params) {
    var id = params.id;
    const decoded = Base64Helper.decode(id);
    id = decoded;
    this.data = await this.service.getById(id);
    this.currency = this.data.currency;
    this.supplier = this.data.supplier;
  }

  cancel(event) {
    this.router.navigateToRoute('list');
  }
}
