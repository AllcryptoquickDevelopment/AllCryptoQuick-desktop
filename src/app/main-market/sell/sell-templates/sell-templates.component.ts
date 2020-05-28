import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Subject, merge, Observable, iif, defer, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap, takeUntil, switchMap, startWith, concatMap, take } from 'rxjs/operators';
import { SellService } from '../sell.service';
import { TEMPLATE_SORT_FIELD_TYPE, ListingTemplate, TEMPLATE_STATUS_TYPE } from '../sell.models';
import { Store } from '@ngxs/store';
import { MarketState } from 'app/main-market/store/market.state';
import { DeleteTemplateModalComponent } from '../modals/delete-template-modal/delete-template-modal.component';
import { ListingDetailModalComponent } from '../../shared/listing-detail-modal/listing-detail-modal.component';


@Component({
  selector: 'market-sell-templates',
  templateUrl: './sell-templates.component.html',
  styleUrls: ['./sell-templates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SellTemplatesComponent implements OnInit, OnDestroy {

  TEMPLATE_STATUS: typeof TEMPLATE_STATUS_TYPE = TEMPLATE_STATUS_TYPE; // type for template


  readonly sortCriteria: {title: string; value: TEMPLATE_SORT_FIELD_TYPE}[] = [
    {title: 'By Title', value: 'item_informations.title'},
    {title: 'By Creation', value: 'created_at'},
    {title: 'By Updated', value: 'updated_at'}
  ];

  readonly filterStatusCriteria: {title: string; value: string}[] = [
    {title: 'All', value: ''},
    {title: 'Unpublished', value: '0'},
    {title: 'Published', value: '1'},
  ];

  readonly savedTemplate$: Observable<ListingTemplate[]>;
  // @FIXME: batch action selection select (hehe)
  readonly batchSelectCriteria: {title: string; value: string}[] = [
    {title: 'All', value: ''},
    {title: 'Unpublished', value: 'unpublished'},
    {title: 'None', value: '0'},
  ];

  isLoadingMore: boolean = false;
  doTemplatesExist: boolean = true;

  // @FIXME: showing/hiding batch action checkboxes in product/listing list items
  batchEditingActive: boolean = false;

  searchQuery: FormControl = new FormControl();
  sortOrder: FormControl = new FormControl();
  filterStatus: FormControl = new FormControl();


  private destroy$: Subject<void> = new Subject();
  private templates$: BehaviorSubject<ListingTemplate[]> = new BehaviorSubject([]);
  private doFilterChange: FormControl = new FormControl();
  private readonly PAGE_COUNT: number = 30;
  private currentPage: number = 0;


  constructor(
    private _sellService: SellService,
    private _store: Store,
    private _router: Router,
    private _dialog: MatDialog,
  ) {
    this.savedTemplate$ = this.templates$.asObservable();
  }


  ngOnInit() {
    this.setControlDefaults();

    const search$ = this.searchQuery.valueChanges.pipe(
      startWith(''),
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    const sort$ = this.sortOrder.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    const filterStatus$ = this.filterStatus.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    );

    const profile$ = this._store.select(MarketState.currentProfile);

    merge(
      search$,
      sort$,
      filterStatus$,
      profile$
    ).pipe(
      tap(() => {
        this.doFilterChange.setValue(true);
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.doFilterChange.valueChanges.pipe(
      tap(() => {
        this.templates$.next([]);
      }),
      switchMap(() => {
        return this.fetchTemplates();
      }),
      takeUntil(this.destroy$)
    ).subscribe(
      (templates: ListingTemplate[]) => {
        if (this.currentPage === 0) {
          const defaults = this.getControlDefaults();
          const formFields = Object.keys(defaults);
          let isDefaultsSet = true;
          for (const field of formFields) {
            if (this[field].value !== defaults[field]) {
              isDefaultsSet = false;
              break;
            }
          }
          this.doTemplatesExist = !((templates.length === 0) && isDefaultsSet);
        }
        this.templates$.next(templates);
      }
    );
  }


  ngOnDestroy() {
    this.templates$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }


  trackBySavedTemplates(idx: number, item: ListingTemplate) {
    return item.id;
  }


  resetFilters() {
    this.setControlDefaults();
  }


  cloneListing(id: number) {
    // TODO
    this._sellService.cloneTemplate(id).pipe(
      // tap((resp) => console.log('@@@@ clone resp: ', resp)),
      // concatMap((resp) => this._router.navigate(['new-listing'], {queryParams:{ templateID: resp.id }}))
    ).subscribe();
  }

  deleteTemplate(id: number) {
    const doDelete$ = this._sellService.deleteTemplate(id).pipe(
      concatMap((ok) =>
        iif(
          () => ok,
          defer(() => this.fetchTemplates().pipe(
            tap((templates) => {
              // Deleting an entry anywhere in the current list of templates means the last page reloaded return 1 new item.
              // So find the new item(s) in the resp, and append to the end of the current list
              const newItems = [];
              const templs = this.templates$.value;
              for (let ii = templates.length - 1; ii >= 0; ii--) {
                if (templs[templs.length - 1].id === templates[ii].id) {
                  break;
                }
                newItems.push(templates[ii]);
              }
              newItems.forEach(templ => templs.push(templ));
              this.templates$.next(templs);
            })
          ))
        )
      )
    );

    const dialog = this._dialog.open(DeleteTemplateModalComponent);
    dialog.afterClosed().pipe(take(1)).subscribe(() => subs.unsubscribe());

    const subs = dialog.componentInstance.isConfirmed.pipe(
      take(1),
      concatMap(() => doDelete$)
    ).subscribe();
  }


  openPreview(id: number) {
    // TODO
    const dialog = this._dialog.open(ListingDetailModalComponent);
  }


  private setControlDefaults() {
    const defaults = this.getControlDefaults();
    const fieldKeys = Object.keys(defaults);

    for (const field of fieldKeys) {
      const formField = this[field] as FormControl;
      if (formField.value !== defaults[field]) {
        formField.setValue(defaults[field]);
      }
    }
  }


  private getControlDefaults(): {[key: string]: string} {
    return {
      searchQuery: '',
      sortOrder: 'updated_at',
      filterStatus: ''
    };
  }


  private fetchTemplates(): Observable<ListingTemplate[]> {
    const profileId = this._store.selectSnapshot(MarketState.currentProfile).id;
    this.isLoadingMore = true;

    return this._sellService.findTemplates(
      profileId,
      this.currentPage,
      this.PAGE_COUNT,
      this.sortOrder.value,
      this.searchQuery.value,
      this.filterStatus.value.length > 0 ? (this.filterStatus.value === '1') : null
    ).pipe(tap(() => {
      this.isLoadingMore = false;
      })
    );
  }
}
