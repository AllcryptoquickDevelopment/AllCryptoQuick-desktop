import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, retryWhen } from 'rxjs/operators';
import { MarketRpcService } from '../market-rpc/market-rpc.service';

import { genericPollingRetryStrategy } from 'app/core/util/utils';
import { RespCategoryList, RespMarketListMarketItem } from '../../shared/market.models';
import { CategoryItem, Market } from './data.models';


@Injectable()
export class DataService {

  constructor(
    private _rpc: MarketRpcService
  ) {}


  loadCategories(marketId?: number): Observable<{categories: CategoryItem[]; rootId: number}> {
    return this._rpc.call('category', ['list', marketId]).pipe(
      map((category: RespCategoryList) => {
        const parsed = this.parseCategories(category);
        return {categories: parsed.children, rootId: category.id};
      })
    );
  }


  loadMarkets(profileId: number, identityId: number): Observable<Market[]> {
    return this._rpc.call('market', ['list']).pipe(
      retryWhen(genericPollingRetryStrategy()),
      map((marketsReq: RespMarketListMarketItem[]) => {
        const filteredMarkets: Market[] = [];
        for (const market of marketsReq) {
          if (
            (profileId ? market.profileId === profileId : true) &&
            (identityId ? market.identityId === identityId : true)
          ) {
            filteredMarkets.push({id: market.id, name: market.name, type: market.type, receiveAddress: market.receiveAddress});
          }
        }
        return filteredMarkets;
      })
    );
  }


  private parseCategories(category: RespCategoryList, marketKey: string = ''): CategoryItem {
    const item = {
      id: category.id,
      name: category.name,
      children: []
    };

    if (Object.prototype.toString.call(category.ChildItemCategories) === '[object Array]') {
      item.children = category.ChildItemCategories.reduce<CategoryItem[]>((acc: CategoryItem[], childItem: RespCategoryList) => {
        if (!marketKey || (childItem.market === marketKey)) {
          return acc.concat(this.parseCategories(childItem));
        }
        return acc;
      }, []);
    }

    return item;
  }

}
