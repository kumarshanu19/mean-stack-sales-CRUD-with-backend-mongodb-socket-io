import { Component, OnInit, ViewChild } from '@angular/core';
import * as io from 'socket.io-client';
import { ChartType, ChartOptions } from 'chart.js';
import { Label } from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { ApiService } from '../api.service';
import { Sales } from '../sales';
import { Chart } from '../chart';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit {

  socket = io('http://localhost:4000');
  @ViewChild(MatSort,{ static: false }) sort: MatSort;
  @ViewChild(MatPaginator,{ static: false }) paginator: MatPaginator;
  chartData: Chart[] = [];

  public pieChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      position: 'top',
    },
    plugins: {
      datalabels: {
        formatter: (value, ctx) => {
          const label = ctx.chart.data.labels[ctx.dataIndex];
          return label;
        },
      },
    }
  };
  public pieChartLabels: Label[] = [];
  public pieChartData: number[] = [];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [pluginDataLabels];
  public pieChartColors = [];

  displayedColumns: string[] = ['itemId', 'itemName', 'totalPrice'];
  data: Sales[] = [];
  isLoadingResults = true;
  // data: MatTableDataSource<any>;
  constructor(private api: ApiService) { }

  ngOnInit(): void {
    this.getSales();
    this.getChartData();
    // this.listData = new MatTableDataSource(any);
    // this.data.sort = this.sort;
    // this.data.paginator = this.paginator;
    this.socket.on('update-data', function(data: any) {
      this.getSales();
      this.getChartData();
    }.bind(this));
  }

  getSales() {
    this.api.getSales()
    .subscribe((res: any) => {
      this.data = res;
      console.log(this.data);
      this.isLoadingResults = false;
    }, err => {
      console.log(err);
      this.isLoadingResults = false;
    });
  }

  getChartData() {
    this.api.getChart()
    .subscribe((res: any) => {
      console.log(res);
      this.chartData = res;
      this.pieChartLabels = [];
      this.pieChartData = [];
      this.pieChartColors = [];
      const backgrounds = [];
      this.chartData.forEach((ch, idx) => {
        this.pieChartLabels.push(ch._id.itemName);
        this.pieChartData.push(ch.totalPrice);
        backgrounds.push(`rgba(${0 + (idx * 10)}, ${255 - (idx * 20)}, ${0 + (idx * 10)}, 0.3)`);
      });
      this.pieChartColors = [
        {
          backgroundColor: backgrounds
        }
      ];
    }, err => {
      console.log(err);
    });
  }

}
