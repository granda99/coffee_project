import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Months, nodoServices } from 'src/services/nodoServices';
import { colorParams, labelsParams, SharedService } from 'src/services/shared.services';
import { UserService } from 'src/services/user.service';
import { Chart } from 'chart.js';
import { DataService, tableDataset } from 'src/services/data.service';
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { InfoCardComponent } from '../components/infoCard/infoCard.component';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.page.html',
  styleUrls: ['./reporting.page.scss'],
})
export class ReportingPage implements OnInit {

  //REPORTES
  param = "";
  reportTitle;
  fechaInit
  fechaFin;
  anio;
  factor = "";
  factor_key = "";
  meses = [];

  //DATOS
  jsonObj
  dataset = []
  filtro = []
  cont = 0;
  tot_hum_tierra = 0;
  tot_ph = 0;
  tot_hum_ambi = 0;
  tot_temp_ambi = 0;
  tot_luz_ambi = 0;
  tot_presion = 0;

  //FUNCIONALIDADES
  dowReport: Boolean = true;
  showLine: Boolean = true;
  showReportInfo: Boolean = true;
  active: Boolean = true;
  activeParam: Boolean = true;
  showReport = [false, false, false, false];

  // Importando ViewChild. Necesitamos el decorador @ViewChild para obtener una referencia a la variable local 
  // que hemos agregado al elemento canvas en la plantilla HTML.
  @ViewChild('lineCanvas') private lineCanvas: ElementRef;
  @ViewChild('lineCanvas1') private lineCanvas1: ElementRef;
  @ViewChild('lineCanvas2') private lineCanvas2: ElementRef;
  @ViewChild('lineCanvas3') private lineCanvas3: ElementRef;
  @ViewChild('lineCanvas4') private lineCanvas4: ElementRef;
  @ViewChild('lineCanvas5') private lineCanvas5: ElementRef;
  @ViewChild('lineCanvas6') private lineCanvas6: ElementRef;

  @ViewChild('doughnutCanvas') private doughnutCanvas: ElementRef;
  @ViewChild('doughnutCanvas1') private doughnutCanvas1: ElementRef;
  @ViewChild('doughnutCanvas2') private doughnutCanvas2: ElementRef;
  @ViewChild('doughnutCanvas3') private doughnutCanvas3: ElementRef;
  @ViewChild('doughnutCanvas4') private doughnutCanvas4: ElementRef;
  @ViewChild('doughnutCanvas5') private doughnutCanvas5: ElementRef;

  lineChart: any;
  lineChart1: any;
  lineChart2: any;
  lineChart3: any;
  lineChart4: any;
  lineChart5: any;

  doughnutChart: any;
  doughnutChart1: any;
  doughnutChart2: any;
  doughnutChart3: any;
  doughnutChart4: any;
  doughnutChart5: any;

  config: SwiperOptions = {
    slidesPerView: 1.15,
    spaceBetween: 15,
    navigation: true,
    autoplay: {
      delay: 2500,
      disableOnInteraction: false
    },
    //loop: true,
    //pagination: { clickable: true },
  };

  constructor(
    private nodos: nodoServices,
    private authServ: UserService,
    private share: SharedService,
    private dataActions: DataService,
    private platafrom: Platform,
    private router: Router
  ) {
    for (let plat of platafrom.platforms()) {
      if (plat == "desktop")
        this.dowReport = false;
    }
  }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    await this.getData();
  }

  async getData() {
    try {
      if (sessionStorage.getItem('metricas') == null || sessionStorage.getItem('metricas') == '') {
        const response = await this.nodos.getInformacion().toPromise();
        sessionStorage.setItem('metricas', JSON.stringify(response))

        this.jsonObj = response;
      } else {
        this.jsonObj = JSON.parse(sessionStorage.getItem('metricas'));
      }
    } catch (ex) {
      console.log(ex);
      if (ex.status == 401) {
        //this.authServ.onIdTokenRevocation();
        this.share.showToastColor('Alerta', 'La sesión a caducado, vuelva a iniciar sesión', 'w', 'm')
        this.router.navigate(['/login']).then(r => { });
      }
    }
  }

  selectedAnio(anio) {
    if (anio != "") {
      this.activeParam = false
      this.anio = anio;
      this.showLine = false;
      this.calcularValoresAnio();
    }
    else {
      this.showReportInfo = true;
      this.activeParam = true;
    }
    //this.show = true;
  }

  cleanOldData() {
    this.cont = 0;
    this.tot_hum_tierra = 0;
    this.tot_ph = 0;
    this.tot_hum_ambi = 0;
    this.tot_temp_ambi = 0;
    this.tot_luz_ambi = 0;
    this.tot_presion = 0;
  }

  filtrarLista(type) {
    this.filtro = [];
    let inicio = this.share.jsonDate(this.fechaInit);

    switch (type) {
      case 'Rango':
        let fin = this.share.jsonDate(this.fechaFin);
        let i = new Date(inicio.mes + '/' + inicio.dia + '/' + inicio.año);
        let f = new Date(fin.mes + '/' + fin.dia + '/' + fin.año);

        if (i.getTime() > f.getTime() || f.getTime() < i.getTime()) {
          this.share.showToastColor('Alerta!!', 'Seleccione un rango de fechas válido', 'w', 's');
        } else {
          Object.keys(this.jsonObj).forEach((k) => {
            let kDate = this.share.jsonDate(this.jsonObj[k].fecha);
            if ((kDate.mes >= inicio.mes &&
              kDate.año >= inicio.año) &&
              (kDate.mes <= fin.mes &&
                kDate.año <= fin.año)
            ) {
              if (inicio.mes == fin.mes) {
                if (kDate.dia >= inicio.dia && kDate.dia <= fin.dia)
                  this.filtro.push(this.jsonObj[k]);
              } else if (kDate.mes == inicio.mes) {
                if (kDate.dia >= inicio.dia)
                  this.filtro.push(this.jsonObj[k]);
              }
              else if (kDate.mes == fin.mes) {
                if (kDate.dia <= fin.dia)
                  this.filtro.push(this.jsonObj[k]);
              }
              else
                this.filtro.push(this.jsonObj[k]);
            }
          });
        }
        break;
      case 'Hasta':
        Object.keys(this.jsonObj).forEach((k) => {
          let kDate = this.share.jsonDate(this.jsonObj[k].fecha);
          if (kDate.mes <= inicio.mes &&
            kDate.año <= inicio.año
          ) {
            if (kDate.mes == inicio.mes) {
              if (kDate.dia <= inicio.dia)
                this.filtro.push(this.jsonObj[k]);
            }
            else
              this.filtro.push(this.jsonObj[k]);
          }
        });
        break;
      case 'Día':
        Object.keys(this.jsonObj).forEach((k) => {
          let kDate = this.share.jsonDate(this.jsonObj[k].fecha);
          if (kDate.mes == inicio.mes &&
            kDate.año == inicio.año &&
            kDate.dia == inicio.dia
          ) {
            this.filtro.push(this.jsonObj[k]);
          }
        });
        break;
    }
  }

  dataListParam(meses, p) {
    let datos = [];
    for (let x = 0; x < meses.length; x++)
      datos.push(meses[x][p]);
    return datos;
  }

  prepareDataLine(meses, p) {
    let dataList = [];

    if (p == "")
      Object.keys(colorParams).forEach((p) => {
        let newParam = {
          label: colorParams[p].sig,
          fill: true,
          lineTension: 0.1,
          //backgroundColor: colorParams[p].backgroundColor,
          borderColor: colorParams[p].selected,
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: colorParams[p].selected,
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: colorParams[p].selected,
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: this.dataListParam(meses, p),
          spanGaps: false,
        }

        dataList.push(newParam);
      });

    else {
      let mesParam = [];
      meses.forEach((mes) => {

        mesParam.push(mes[p]);

      });

      dataList.push({
        label: colorParams[p].sig,
        fill: true,
        lineTension: 0.1,
        backgroundColor: colorParams[p].backgroundColor,
        borderColor: colorParams[p].selected,
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: colorParams[p].selected,
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: colorParams[p].selected,
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: mesParam,
        spanGaps: false,
      })
    }
    return dataList;
  }

  lineChartMethod() {
    /*     if (this.lineChart) {
          this.lineChart.clear()
        } */
    this.showReportInfo = false;
    this.lineChart = new Chart(this.lineCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        datasets: this.prepareDataLine(this.meses, ""),
      }
    });
    this.lineChart.update();


    this.lineChart1 = new Chart(this.lineCanvas1.nativeElement, {
      type: 'line',
      data: {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        datasets: this.prepareDataLine(this.meses, "HT"),
      }
    });
    this.lineChart1.update();


    this.lineChart2 = new Chart(this.lineCanvas2.nativeElement, {
      type: 'line',
      data: {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        datasets: this.prepareDataLine(this.meses, "HA"),
      }
    });
    this.lineChart2.update();


    this.lineChart3 = new Chart(this.lineCanvas3.nativeElement, {
      type: 'line',
      data: {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        datasets: this.prepareDataLine(this.meses, "TA"),
      }
    });
    this.lineChart3.update();


    this.lineChart4 = new Chart(this.lineCanvas4.nativeElement, {
      type: 'line',
      data: {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        datasets: this.prepareDataLine(this.meses, "LA"),
      }
    });
    this.lineChart4.update();


    this.lineChart5 = new Chart(this.lineCanvas5.nativeElement, {
      type: 'line',
      data: {
        labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        datasets: this.prepareDataLine(this.meses, "PA"),
      }
    });
    this.lineChart5.update();


  }

  exportData(op) {
    let fileName = 'DataSet completo';
    this.dataset = [];
    if (op != 'all') {
      fileName = 'Coffee-ISH-Reporte-' + this.reportTitle;
      for (let key of this.filtro) {
        let row = this.jsonToTable(key);
        this.dataset.push(row);
      }
    } else {
      for (let key in this.jsonObj) {
        if (this.jsonObj.hasOwnProperty(key)) {
          let typeParams = this.jsonToTable(this.jsonObj[key]);
          this.dataset.push(typeParams);
        }
      }
    }

    this.dataActions.exportToExcel(this.dataset, fileName)

  }

  jsonToTable(json: any): tableDataset {
    console.log(json);
    
    let item: tableDataset = {
      dispositivo: json.dispositivo,
      usuario: json.usuario,
      Humedad_tierra: json.parametros_tierra.HT,
      /* PH_tierra: json.parametros_tierra.PH, */
      Humedad_ambiente: json.parametros_ambiente.HA,
      Luz_ambiente: json.parametros_ambiente.LA,
      Tempetarura_ambiente: json.parametros_ambiente.TA,
      Presion: json.parametros_ambiente.PA,
      fecha: json.fecha,
    };
    return item;
  }

  dateStart(value) {
    this.showLine = true;
    this.fechaInit = this.share.toShortDate(value)
    if (this.reportTitle != 'Rango') {
      this.activeParam = false;
      this.filtrarLista(this.reportTitle);
      this.calcularValores();
    } else {
      if (this.fechaFin.length > 0) {
        this.filtrarLista(this.reportTitle);
      }
    }
  }

  dateEnd(value) {
    this.fechaFin = this.share.toShortDate(value)
    this.activeParam = false;
    this.filtrarLista(this.reportTitle);
    this.calcularValores();
  }

  async selectReport(value) {
    await this.share.startLoading();
    this.showReportInfo = true;
    this.activeParam = true;
    this.showReport = [false, false, false, false];
    this.reportTitle = value;
    this.fechaInit = "";
    this.fechaFin = "";
    this.factor = "";

    switch (value) {
      case 'Rango':
        this.showReport[0] = true;
        this.active = false;
        break;
      case 'Hasta':
        this.showReport[1] = true;
        this.active = false;
        break;
      case 'Día':
        this.showReport[2] = true;
        this.active = false;
        break;
      case 'Anual':
        this.showReport[3] = true;
        this.active = false;
        break;
      default:
        this.showReportInfo = true;
        this.active = true;
    }

    this.share.stopLoading();
  }

  async doRefresh(ev) {
    sessionStorage.removeItem('metricas')
    await this.getData()
    ev.target.complete();
  }

  doughnutChartMethod() {
    this.showReportInfo = false;
    this.doughnutChart = null;
    this.doughnutChart1 = null;
    this.doughnutChart2 = null;
    this.doughnutChart3 = null;
    this.doughnutChart4 = null;
    this.doughnutChart5 = null;
    let cien;
    /* TODOS LOS PARÁMETROS */
    let allData: number[];
    if (this.tot_hum_tierra > 0 && this.tot_hum_ambi > 0 && this.tot_temp_ambi > 0 && this.tot_luz_ambi > 0 && this.tot_presion > 0)
      allData = [this.tot_hum_tierra, this.tot_hum_ambi, this.tot_temp_ambi, this.tot_luz_ambi, this.tot_presion]
    else {
      allData = [0, 0, 0, 0, 0, 100]

    }
    let ht: number[];
    let ha: number[];
    let ta: number[];
    let la: number[];
    let pa: number[];


    /* HUMEDAD DE LA TIERRA */
    cien = this.share.trunc(100 - this.tot_hum_tierra, 2);
    ht = [this.tot_hum_tierra, 0, 0, 0, 0, cien];

    /*  case "PH":
        cien = 100 - this.tot_ph
       break; */

    /* HUMEDAD DEL AMBIENTE */
    cien = this.share.trunc(100 - this.tot_hum_ambi, 2);
    ha = [0, this.tot_hum_ambi, 0, 0, 0, cien];

    /* TEMPERATURA DEL AMBIENTE */
    cien = this.share.trunc(100 - this.tot_temp_ambi, 2);
    ta = [0, 0, this.tot_temp_ambi, 0, 0, cien];


    /* LUZ DEL AMBIENTE */
    cien = this.share.trunc(100 - this.tot_luz_ambi, 2);
    la = [0, 0, 0, this.tot_luz_ambi, 0, cien]

    /* PRESION DEL AMBIENTE */
    cien = this.share.trunc(100 - this.tot_presion, 2);
    pa = [0, 0, 0, 0, this.tot_presion, cien]



    /*COLORES Y VARIACIÓN DEL COLOR, PARA LA TEMPERATURA, BAJA AZUL, MEDIA AMARILLA, ALTA ROJA */
    let colors = this.share.getColorsParams(this.param, this.tot_temp_ambi);

    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        labels: colors.labels,
        datasets: [{
          label: '# of Votes',
          data: allData,
          backgroundColor: colors.base,
          hoverBackgroundColor: colors.selected
        }]
      }
    });

    this.doughnutChart1 = new Chart(this.doughnutCanvas1.nativeElement, {
      type: 'doughnut',
      data: {
        //labels: colors.labels,
        datasets: [{
          label: '# of Votes',
          data: ht,
          backgroundColor: colors.base,
          hoverBackgroundColor: colors.selected
        }]
      }
    });

    this.doughnutChart2 = new Chart(this.doughnutCanvas2.nativeElement, {
      type: 'doughnut',
      data: {
        //labels: colors.labels,
        datasets: [{
          label: '# of Votes',
          data: ha,
          backgroundColor: colors.base,
          hoverBackgroundColor: colors.selected
        }]
      }
    });

    this.doughnutChart3 = new Chart(this.doughnutCanvas3.nativeElement, {
      type: 'doughnut',
      data: {
        //labels: colors.labels,
        datasets: [{
          label: '# of Votes',
          data: ta,
          backgroundColor: colors.base,
          hoverBackgroundColor: colors.selected
        }]
      }
    });

    this.doughnutChart4 = new Chart(this.doughnutCanvas4.nativeElement, {
      type: 'doughnut',
      data: {
        //labels: colors.labels,
        datasets: [{
          label: '# of Votes',
          data: la,
          backgroundColor: colors.base,
          hoverBackgroundColor: colors.selected
        }]
      }
    });

    this.doughnutChart5 = new Chart(this.doughnutCanvas5.nativeElement, {
      type: 'doughnut',
      data: {
        //labels: colors.labels,
        datasets: [{
          label: '# of Votes',
          data: pa,
          backgroundColor: colors.base,
          hoverBackgroundColor: colors.selected
        }]
      }
    });
  }

  async calcularValores() {
    try {
      await this.share.startLoading();
      this.cleanOldData()
      for (let key of this.filtro) {
        this.cont++;
        let typeParams = key;

        this.tot_hum_tierra += parseFloat(typeParams.parametros_tierra.HT ?? 0);
        /*  this.tot_ph += parseFloat(typeParams.parametros_tierra.PH?? 0); */
        this.tot_hum_ambi += parseFloat(typeParams.parametros_ambiente.HA ?? 0);
        this.tot_temp_ambi += parseFloat(typeParams.parametros_ambiente.TA ?? 0);
        this.tot_luz_ambi += parseFloat(typeParams.parametros_ambiente.LA ?? 0);
        this.tot_presion += parseFloat(typeParams.parametros_ambiente.PA ?? 0);
      }
      if (this.cont > 0) {
        this.tot_hum_tierra /= this.cont;
        this.tot_hum_tierra = this.share.trunc(this.tot_hum_tierra, 2)
        /* this.tot_ph /= this.cont; */
        this.tot_hum_ambi /= this.cont;
        this.tot_hum_ambi = this.share.trunc(this.tot_hum_ambi, 2)
        this.tot_temp_ambi /= this.cont;
        this.tot_temp_ambi = this.share.trunc(this.tot_temp_ambi, 2)
        this.tot_luz_ambi /= this.cont;
        this.tot_luz_ambi = this.share.trunc(this.tot_luz_ambi, 2)
        this.tot_presion /= this.cont;
        this.tot_presion = this.share.trunc(this.tot_presion, 2)
      }
      this.share.stopLoading();
      this.doughnutChartMethod()
    } catch (ex) {
      this.showReportInfo = true;
      this.share.showToastColor('No se encontró datos', 'No hay datos disponibles para la fecha seleccionada', 'w', 's');
      this.share.stopLoading();
    }
  }

  calcularValoresAnio() {
    this.meses = [];
    this.filtro = [];
    for (var mes = 1; mes <= 12; mes++) {
      let month: Months = {
        HT: 0,
        PH: 0,
        HA: 0,
        LA: 0,
        TA: 0,
        PA: 0,
      }
      for (let key in this.jsonObj) {
        if (this.jsonObj.hasOwnProperty(key)) {
          let kDate = this.share.jsonDate(this.jsonObj[key].fecha);
          let typeParams = this.jsonObj[key];

          if (kDate.mes == mes && kDate.año == this.anio) {
            this.filtro.push(this.jsonObj[key]);
            this.cont++;
            month.HT += parseFloat(typeParams.parametros_tierra.HT ?? 0);
            //month.tot_ph += parseFloat(typeParams.parametros_tierra.PH);
            month.HA += parseFloat(typeParams.parametros_ambiente.HA ?? 0);
            month.TA += parseFloat(typeParams.parametros_ambiente.TA ?? 0);
            month.LA += parseFloat(typeParams.parametros_ambiente.LA ?? 0);
            month.PA += parseFloat(typeParams.parametros_ambiente.PA ?? 0);

          }
        }
      }
      if (this.cont == 0)
        this.cont = 1;

      month.HT /= this.cont;
      month.HA /= this.cont;
      month.LA /= this.cont;
      month.TA /= this.cont;
      month.PA /= this.cont;

      this.meses.push(month);
    }

    this.lineChartMethod();
  }

  presentInfo() {
    this.share.presentPopover(InfoCardComponent);
  }
}
