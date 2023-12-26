import { inject } from 'aurelia-framework'
import { Service } from "./service";
import numeral from 'numeral';

@inject(Service)
export class Monitoring {
    constructor(service) {
        this.service = service;
    }

    controlOptions = {
        label: { length: 4 },
        control: { length: 3 }
    }

    yearOptions = [];

    get filter() {
        return {
            year: this.selectedYear
        };
    }

    bind() {
        const now = new Date();

        const selectedYear = now.getFullYear();
        for (let i = selectedYear - 5; i <= selectedYear + 5; i++) {
            this.yearOptions.push(i.toString());
        }
        this.selectedYear = selectedYear.toString();
    }

    // search() {
    //     const arg = Object.assign({}, this.filter);
    //     this.service.search(arg)
    //             .then(result => {
    //                 this.data = result.data;
    //             });
    // }

    // xls() {
    //     this.service.xls(this.filter);
    // }

    reset() {
        const now = new Date();

        this.selectedYear = now.getFullYear().toString();

        this.data = {};
    }

    searching() {    
        {
         var info = {
                 year : this.selectedYear ? this.selectedYear : "",
               }
             
                 this.service.search(info)
                     .then(result => {
                         this.data = result;   
                         console.log(result);                
                         var dataByInvoice = {};
                         var subTotalInv1 = {};
                         var subTotalInv2 = {};
                         var subTotalInv3 = {};
                         var subTotalInv4 = {};                   
                         
                         for (var data of result) {
                             var Invoice = data.month;
                              if (!dataByInvoice[Invoice]) dataByInvoice[Invoice] = [];                 
                                  dataByInvoice[Invoice].push({   
     
                                  monthName : data.monthName,
                                  amount1 : data.amount1.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                                  amount1IDR : data.amount1IDR.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                                  
                              });
                                     
                                 if (!subTotalInv1[Invoice]) {
                                    subTotalInv1[Invoice] = 0;
                                 } 
                                    subTotalInv1[Invoice] += data.amount1;
     
                                 if (!subTotalInv2[Invoice]) {
                                     subTotalInv2[Invoice] = 0;
                                  } 
                                     subTotalInv2[Invoice] += data.amount1IDR;
                                  
                                                                    
                             }
           
                     var invoices = [];
                     this.AmountTtlUSD1 = 0;
                     this.AmountTtlIDR1 = 0;

                     this.AvgTtlUSD1 = 0;
                     this.AvgTtlIDR1 = 0;

                     for (var data in dataByInvoice) {
                         invoices.push({
                         data: dataByInvoice[data],
                         month1: dataByInvoice[data][0].month,
                         month2: dataByInvoice[data][0].monthName,                                                     
                     });
                         this.AmountTtlUSD1 += subTotalInv1[data];   
                         this.AmountTtlIDR1 += subTotalInv2[data]; 
                         this.AmountTtlUSD2 += subTotalInv3[data];   
                         this.AmountTtlIDR2 += subTotalInv4[data]; 

                         this.AvgTtlUSD1 += (subTotalInv1[data]/12);
                         this.AvgTtlIDR1 += (subTotalInv2[data]/12);
                         this.AvgTtlUSD2 += (subTotalInv3[data]/12);
                         this.AvgTtlIDR2 += (subTotalInv4[data]/12);                    
                     }
                     
                      
                     this.AmountTtlUSD1 = this.AmountTtlUSD1.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                     this.AmountTtlIDR1 = this.AmountTtlIDR1.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                     this.AvgTtlUSD1 = this.AvgTtlUSD1.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                     this.AvgTtlIDR1 = this.AvgTtlIDR1.toLocaleString('en-EN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                     this.invoices = invoices;
                     });
                 }               
         }
     
    ExportToExcel() {
        {
        var info = {
            year : this.selectedYear ? this.selectedYear : "",
            }
     
        this.service.xls(info)
            .catch(e => {
                alert(e.replace(e, "Error: ",""))
            });
        }
    }
}