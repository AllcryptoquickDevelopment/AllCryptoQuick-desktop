import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GalleryModule } from '@ngx-gallery/core';
import { LightboxModule } from '@ngx-gallery/lightbox';
import { GallerizeModule } from '@ngx-gallery/gallerize';
import 'hammerjs';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { TreeSelectComponent } from './tree-select/tree-select.component';
import { QuestionThreadListItemComponent } from './question-thread-list-item/question-thread-list-item.component';
import { ListingDetailModalComponent } from './listing-detail-modal/listing-detail-modal.component';
import { ShippingProfileAddressComponent } from './shipping-profile-address/shipping-profile-address.component';

@NgModule({
  imports: [
    CommonModule,
    CoreUiModule,
    GalleryModule,
    LightboxModule,
    GallerizeModule,
    InfiniteScrollModule
  ],
  declarations: [
    TreeSelectComponent,
    QuestionThreadListItemComponent,
    ListingDetailModalComponent,
    ShippingProfileAddressComponent
  ],
  exports: [
    TreeSelectComponent,
    QuestionThreadListItemComponent,
    ListingDetailModalComponent,
    ShippingProfileAddressComponent,
    GalleryModule,
    LightboxModule,
    GallerizeModule,
    InfiniteScrollModule
  ],
  entryComponents: [
    ListingDetailModalComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MarketSharedModule { }

export { TreeSelectComponent } from './tree-select/tree-select.component';
