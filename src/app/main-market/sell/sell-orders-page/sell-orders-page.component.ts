import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';


export interface Filter {
  value: string;
  title: string;
  count: string;
}

@Component({
  selector: 'app-sell-orders-page',
  templateUrl: './sell-orders-page.component.html',
  styleUrls: ['./sell-orders-page.component.scss']
})
export class SellOrdersPageComponent implements OnInit {

  searchQuery: FormControl = new FormControl('');
  filterQuery: FormControl = new FormControl('all');

  statusFilters: Filter[] = [
    {value: 'all', title: 'All orders', count: '11'},
    {value: 'bids', title: 'Bidding', count: '1'},
    {value: 'awaiting', title: 'Awaiting payment', count: '2'},
    {value: 'escrow', title: 'Escrow pending', count: '0'},
    {value: 'packaging', title: 'Packaging', count: '1'},
    {value: 'shipping', title: 'Shipping', count: '0'},
    {value: 'complete', title: 'Completed', count: '3'},
    {value: 'rejected', title: 'Rejected', count: '1'},
    {value: 'cancelled', title: 'Cancelled', count: '3'}
  ];

  public filters: any = {
    search: undefined,
    sort:   undefined,
    status: undefined
  };

  constructor() { }

  ngOnInit() {
  }

}
