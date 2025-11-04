import { inject, Lazy } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Service } from './service';
import { Dialog } from '../../../au-components/dialog/dialog';
import { Base64Helper } from '../../../utils/base-64-coded-helper';


@inject(Router, Service, Dialog)
export class Edit {
    constructor(router, service, dialog) {
        this.router = router;
        this.service = service;
        this.dialog = dialog;
    }

    isEdit = true;
    isShowingAmount = true;

    async activate(params) {
        let id = params.id;
        let decoded = Base64Helper.decode(id);
        id = decoded;
        this.data = await this.service.getById(id);
    }

    cancelCallback(event) {
        const encoded = Base64Helper.encode(this.data.Id);
        this.router.navigateToRoute('view', { id: encoded });
    }

    saveCallback(event) {
        this.dialog.prompt('Apakah anda yakin akan menyimpan perubahan data ini?', 'Ubah Realisasi VB Non PO')
            .then((response) => {
                if (response.ok) {
                    this.service.update(this.data)
                        .then(result => {
                            const encoded = Base64Helper.encode(this.data.Id);
                            alert("Data berhasil Diubah");
                            this.router.navigateToRoute('view', { id: encoded });
                        })
                        .catch(e => {
                            this.error = e;
                        })
                }
            })

    }
}
