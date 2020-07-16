import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { map, mapTo, catchError } from 'rxjs/operators';
import { MarketRpcService } from '../services/market-rpc/market-rpc.service';

import { MarketState } from '../store/market.state';
import { formatImagePath, getValueOrDefault, isBasicObjectType } from '../shared/utils';

import { PartoshiAmount } from 'app/core/util/utils';
import { RespListingItem, RespCartItemAdd, RespItemFlag, RespItemVote } from '../shared/market.models';
import { ListingOverviewItem } from './listings.models';
import { MarketSettings } from '../store/market.models';


@Injectable()
export class ListingsService {

  constructor(
    private _rpc: MarketRpcService,
    private _store: Store
  ) {}


  getListenerNewListings() {
    return this._rpc.getSocketMessageListener('MPA_LISTING_ADD_03');
  }


  searchListingItems(
    market: string,
    page: number,
    count: number,
    searchTerm: string = '',
    categories: string[] = [],
    seller: string = '',
    sourceCountry: string = '',
    destinationCountry: string = '',
    isFlagged: boolean = false
  ): Observable<ListingOverviewItem[]> {
    const params: any[] = [
      page,
      count,
      'DESC',
      'created_at',
      market,
      categories || null,
      seller || null,
      null,
      null,
      sourceCountry || null,
      destinationCountry || null,
      searchTerm || '*',
      isFlagged
    ];

    return this._rpc.call('item', ['search', ...params]).pipe(
      map((resp: RespListingItem[]) => {
        const marketSettings = this._store.selectSnapshot(MarketState.settings);
        const profileId = this._store.selectSnapshot(MarketState.currentProfile).id;
        return resp.map((item) => this.createOverviewItem(item, profileId, marketSettings));
      })
    );
  }


  addFavourite(listingId: number): Observable<number | null> {
    const profileId = this._store.selectSnapshot(MarketState.currentProfile).id;
    return this._rpc.call('favorite', ['add', profileId, listingId]).pipe(
      map(item => item.id),
      catchError(() => of(null)),
    );
  }


  removeFavourite(favouriteId: number): Observable<boolean> {
    return this._rpc.call('favorite', ['remove', favouriteId]).pipe(
      mapTo(true),
      catchError(() => of(false))
    );
  }


  reportItem(listingId: number): Observable<boolean> {
    const identityId = this._store.selectSnapshot(MarketState.currentIdentity).id;
    return this._rpc.call('item', ['flag', listingId, identityId]).pipe(
      map((resp: RespItemFlag) => {
        return resp && resp.result && String(resp.result).toLowerCase() === 'sent.';
      })
    );
  }


  voteOnItem(marketId: number, proposalHash: string, voteOptionId: number): Observable<boolean> {
    return this._rpc.call('vote', ['post', marketId, proposalHash, voteOptionId]).pipe(
      map((resp: RespItemVote) => {
        return resp && resp.result && String(resp.result).toLowerCase() === 'sent.';
      })
    );
  }


  addItemToCart(listingId: number, cartId: number): Observable<RespCartItemAdd> {
    return this._rpc.call('cartitem', ['add', cartId, listingId]);
  }


  private createOverviewItem(from: RespListingItem, profileId: number, marketSettings: MarketSettings): ListingOverviewItem {
    let listingId = 0,
        title = '',
        summary = '',
        listingSeller = '',
        imageSelected = './assets/images/placeholder_4-3.jpg',
        isLocalShipping = false,
        isOwnListing = false,
        favId = null,
        commentCount = 0,
        flagHash = '',
        flaggedVoteKeepId = 0,
        flaggedVoteRemoveId = 0;
    const price = new PartoshiAmount(0);

    const fromDetails = from.ItemInformation;

    if (isBasicObjectType(fromDetails)) {

      // Set item information values
      title = getValueOrDefault(fromDetails.title, 'string', title);
      summary = getValueOrDefault(fromDetails.shortDescription, 'string', summary);

      listingId = getValueOrDefault(from.id, 'number', 0);
      listingSeller = getValueOrDefault(from.seller, 'string', '');

      if (isBasicObjectType(fromDetails.ItemLocation)) {
        isLocalShipping = marketSettings.userRegion === getValueOrDefault(fromDetails.ItemLocation.country, 'string', '');
      }

      // Image selection and processing
      if (Object.prototype.toString.call(fromDetails.ItemImages) === '[object Array]') {
        if (fromDetails.ItemImages.length) {
          let featured = fromDetails.ItemImages.find(img => img.featured);
          if (featured === undefined) {
            featured = fromDetails.ItemImages[0];
          }

          const imgDatas = Object.prototype.toString.call(featured.ItemImageDatas) === '[object Array]' ? featured.ItemImageDatas : [];
          const selected = imgDatas.find(d => d.imageVersion && d.imageVersion === 'MEDIUM');
          if (selected) {
            imageSelected = formatImagePath(
              getValueOrDefault(selected.dataId, 'string', ''), marketSettings.port) || imageSelected;
          }
        }
      }
    }

    // Calculate price value to be displayed
    const priceInfo = from.PaymentInformation;

    if (isBasicObjectType(priceInfo)) {
      if (isBasicObjectType(priceInfo.ItemPrice)) {
        price.add(new PartoshiAmount(priceInfo.ItemPrice.basePrice, true));

        if (marketSettings.userRegion.length > 0) {
          if (isLocalShipping) {
            price.add( new PartoshiAmount(priceInfo.ItemPrice.ShippingPrice.domestic, true) );
          } else {
            price.add( new PartoshiAmount(priceInfo.ItemPrice.ShippingPrice.international, true) );
          }
        }
      }
    }

    // Favourite?
    if (Object.prototype.toString.call(from.FavoriteItems) === '[object Array]') {

      for (let ii = 0; ii < from.FavoriteItems.length; ii++) {
        favId = from.FavoriteItems[ii].profileId === profileId ? from.FavoriteItems[ii].id : favId;
        if (favId) { break; }
      }
    }

    // Process extra info
    isOwnListing = isBasicObjectType(from.ListingItemTemplate) && (+from.ListingItemTemplate.id > 0);
    commentCount = Object.prototype.toString.call(from.MessagingInformation) === '[object Array]' ?
        from.MessagingInformation.length : 0;

    const expirationTime = getValueOrDefault(from.expiredAt, 'number', 0);
    const itemIsFlagged = isBasicObjectType(from.FlaggedItem) && +from.FlaggedItem.id > 0;

    if (itemIsFlagged && isBasicObjectType(from.FlaggedItem.Proposal)) {
       flagHash = getValueOrDefault(from.FlaggedItem.Proposal.hash, 'string', flagHash);

       from.FlaggedItem.Proposal.ProposalOptions.forEach((option) => {
         if (option && +option.optionId) {
           if (option.description === 'KEEP') {
            flaggedVoteKeepId = option.optionId;
           } else if (option.description === 'REMOVE') {
            flaggedVoteRemoveId = option.optionId;
           }
         }
       });
    }


    const newItem: ListingOverviewItem = {
      id: listingId,
      title: title,
      summary: summary,
      hash: getValueOrDefault(from.hash, 'string', ''),
      seller: listingSeller,
      expiry: expirationTime,
      image: imageSelected,
      price: {
        whole: price.particlStringInteger(),
        sep: price.particlStringSep(),
        decimal: price.particlStringFraction()
      },
      extras: {
        commentCount: commentCount,
        favouriteId: favId,
        isFlagged: itemIsFlagged,
        usersVote: {
          voteId: 0,  // TODO: um, sort this out
          hash: flagHash,
          keepId: flaggedVoteKeepId,
          removeId: flaggedVoteRemoveId
        },
        isOwn: isOwnListing,
        canAddToCart: !isOwnListing && (expirationTime > Date.now())
      }
    };

    return newItem;
  }

}
