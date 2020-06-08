
export type MarketType = 'MARKETPLACE' | 'STOREFRONT' | 'STOREFRONT_ADMIN';
export type SALES_TYPE = 'SALE';
export type ESCROW_TYPE = 'MAD_CT';
export type ESCROW_RELEASE_TYPE = 'ANON' | 'BLIND';
export type CURRENCY_TYPE = 'PART';
export type SHIPPING_AVAIL_TYPE = 'SHIPS' | 'DOES_NOT_SHIP' | 'ASK' | 'UNKNOWN';
export type IMAGE_PROTOCOL = 'HTTPS' | 'LOCAL' | 'IPFS';
export type IMAGE_ENCODING = 'BASE64';
export type IMAGE_VERSION = 'ORIGINAL' | 'RESIZED' | 'THUMBNAIL' | 'MEDIUM' | 'LARGE';


export interface RespCategoryList {
  id: number;
  key: string;
  name: string;
  market: string;
  description: string;
  parentItemCategoryId: number | null;
  updatedAt: number;
  createdAt: number;
  ChildItemCategories?: RespCategoryList[];
}


export interface RespMarketListMarketItem {
  id: number;
  name: string;
  type: MarketType;
  receiveKey: string;
  receiveAddress: string;
  publishKey: string;
  publishAddress: string;
  updatedAt: number;
  createdAt: number;
  profileId: number;
  identityId: number;
  removed: 0 | 1;
}


export interface RespListingTemplateInformation {
  id: number;
  title: string;
  shortDescription: string;
  longDescription: string;
  itemCategoryId: number | null;
  listingItemId: number | null;
  listingItemTemplateId: number;
  updatedAt: number;
  createdAt: number;
  ItemLocation?: {
    id: number;
    country: string;
    address: string | null;
    description: string | null;
    itemInformationId: number;
    updatedAt: number;
    createdAt: number;
    LocationMarker: any;
  };
  ItemCategory?: {
    id: number;
    key: string | null;
    name: string;
    market: number | null;
    description: string;
    parentItemCategoryId: number | null;
    updatedAt: number;
    createdAt: number;
    ParentItemCategory: {
      id: number;
      key: string | null;
      name: string;
      market: number | null;
      description: string;
      parentItemCategoryId: number | null;
      updatedAt: number;
      createdAt: number;
    }
  };
  ItemImages?: Array<{
    id: number;
    hash: string;
    itemInformationId: number;
    featured: 0 | 1;
    ItemImageDatas: Array<{
      id: number;
      protocol: IMAGE_PROTOCOL,
      encoding: IMAGE_ENCODING,
      imageVersion: IMAGE_VERSION,
      imageHash: string;
      dataId: string;
      data: string;
      itemImageId: number,
      updatedAt: number;
      createdAt: number;
      originalMime: string | null;
      originalName: string | null;
    }>;
  }>;
  ShippingDestinations?: Array<{id: number; country: string; shippingAvailability: SHIPPING_AVAIL_TYPE}>;
}


export interface RespListingTemplate {
  id: number;
  hash: string | null;
  market: string | null;
  generatedAt: number;
  profileId: number;
  parentListingItemTemplateId: number | null;
  updatedAt: number;
  createdAt: number;
  ItemInformation: RespListingTemplateInformation;
  PaymentInformation: {
    id: number;
    type: SALES_TYPE;
    listingItemId: number | null;
    listingItemTemplateId: number;
    updatedAt: number;
    createdAt: number;
    Escrow?: {
      id: number;
      type: ESCROW_TYPE;
      secondsToLock: number;
      paymentInformationId: number;
      updatedAt: number;
      createdAt: number;
      Ratio?: {
        id: number;
        buyer: number;
        seller: number;
        escrowId: number;
        updatedAt: number;
        createdAt: number;
      };
    };
    ItemPrice?: {
      id: number;
      currency: CURRENCY_TYPE;
      basePrice: number;
      paymentInformationId: number;
      cryptocurrencyAddressId: number | null,
      updatedAt: number;
      createdAt: number;
      ShippingPrice?: {
        id: number;
        domestic: number;
        international: number;
        itemPriceId: number;
        updatedAt: number;
        createdAt: number;
      };
    };
  };
  MessagingInformation: any[];
  ListingItemObjects: any[];
  ListingItems: any[];
  Profile: any;
  ChildListingItemTemplate: RespListingTemplate[];
}


export interface RespCategoryAdd {
  id: number;
  key: string;
  name: string;
  market: string;
  description: string;
  parentItemCategoryId: number;
  updatedAt: number;
  createdAt: number;
  ParentItemCategory: {
    id: number;
    key: string;
    name: string;
    market: string;
    description: string;
    parentItemCategoryId: number | null;
    updatedAt: number;
    createdAt: number;
  };
  ChildItemCategories: any[];
}


export interface RespTemplateSize {
  fits: boolean;
  messageData: number;
  spaceLeft: number;
}
