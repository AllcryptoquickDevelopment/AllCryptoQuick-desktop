import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import {  finalize } from 'rxjs/operators';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { MarketManagementService } from '../../management.service';
import { CreateMarketRequest } from '../../management.models';
import { MarketType } from '../../../shared/market.models';
import { AddressHelper } from 'app/core/util/utils';


enum TextContent {
  ERROR_IMAGE_ADD = 'The image selected is not valid',
  MARKET_JOIN_SUCCESS = 'Successfully joined this market',
  MARKET_JOIN_ERROR = 'Failed to join the specified market'
}


@Component({
  templateUrl: './join-with-details-modal.component.html',
  styleUrls: ['./join-with-details-modal.component.scss']
})
export class JoinWithDetailsModalComponent implements AfterViewInit {


  readonly marketTypeOptions: typeof MarketType = MarketType;
  readonly optionsMarketRegions: {value: string; label: string}[];

  readonly marketForm: FormGroup;
  readonly MAX_NAME: number;
  readonly MAX_SUMMARY: number;


  @ViewChild('dropArea', {static: false}) private dropArea: ElementRef;
  @ViewChild('fileInputSelector', {static: false}) private fileInputSelector: ElementRef;


  constructor(
    private _dialogRef: MatDialogRef<JoinWithDetailsModalComponent>,
    private _manageService: MarketManagementService,
    private _snackbar: SnackbarService,
  ) {
    this.marketForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.maxLength(this.MAX_NAME)]),
      summary: new FormControl('', [Validators.maxLength(this.MAX_SUMMARY)]),
      image: new FormControl(''),
      region: new FormControl(''),
      keyReceive: new FormControl('', [Validators.required, Validators.minLength(25)]),
      keyPublish: new FormControl('', [Validators.required, Validators.minLength(25)])
    });

    this.optionsMarketRegions = this._manageService.getMarketRegions();
    this.MAX_NAME = this._manageService.MAX_MARKET_NAME;
    this.MAX_SUMMARY = this._manageService.MAX_MARKET_SUMMARY;
  }


  ngAfterViewInit() {
    const fileInput = this.fileInputSelector.nativeElement;
    const dropArea = this.dropArea.nativeElement;
    dropArea.ondragover = () => false;
    dropArea.ondragleave = () => false;
    dropArea.ondragend = () => false;

    dropArea.ondrop = (e: any) => {
      e.preventDefault();
      this.processPictures(e, true);
      return false;
    };
    fileInput.onchange = this.processPictures.bind(this);
  }


  get formImageControl(): AbstractControl {
    return this.marketForm.get('image');
  }


  addImage(): void {
    this.fileInputSelector.nativeElement.click();
  }


  doAction(): void {
    if (!this.marketForm.valid || this.marketForm.disabled) {
      return;
    }
    this.marketForm.disable();

    const descReq = this.marketForm.get('summary').value;
    const regionReq = this.marketForm.get('region').value;
    const imageReq = this.marketForm.get('image').value;
    const recKey = this.marketForm.get('keyReceive').value;
    const pubKey = this.marketForm.get('keyPublish').value;

    const createRequest: CreateMarketRequest = {
      name: this.marketForm.get('name').value,
      marketType: MarketType.MARKETPLACE,
    };

    if (descReq.length) {
      createRequest.description = descReq;
    }

    if (regionReq.length) {
      createRequest.region = regionReq;
    }

    if (imageReq.length) {
      createRequest.image = {
        data: imageReq,
        type: 'REQUEST'
      };
    }

    createRequest.receiveKey = recKey || '';
    createRequest.publishKey = pubKey || '';

    const addressHelper = new AddressHelper();

    if (addressHelper.testAddress(pubKey, 'public')) {
      createRequest.marketType = MarketType.STOREFRONT;
    } else if (recKey !== pubKey) {
      createRequest.marketType = MarketType.STOREFRONT_ADMIN;
    }

    this._manageService.createMarket(createRequest).pipe(
      finalize(() => this.marketForm.enable())
    ).subscribe(
      (market) => {
        this._snackbar.open(TextContent.MARKET_JOIN_SUCCESS);
        this._dialogRef.close();
      },
      (err) => {
        this._snackbar.open(TextContent.MARKET_JOIN_ERROR, 'warn');
      }
    );
  }


  private processPictures(event: any, dnd: boolean = false): void {
    let sourceFiles: File[] = [];
    if (dnd) {
      for (const f of event.dataTransfer.files) {
        sourceFiles.push(f as File);
      }
    } else {
      sourceFiles = Array.from(event.target.files);
    }

    const MAX_IMAGE_SIZE = 1024 * 1024 * 2; // (2MB)
    let failedImgs = false;
    sourceFiles.forEach((file: File) => {
      if (file.size > MAX_IMAGE_SIZE) {
        failedImgs = true;
      } else {
        const reader = new FileReader();
        reader.onloadend = (_event) => {
          if (reader.readyState === 2) {
            const res = <ArrayBuffer>reader.result;
            const uint = new Uint8Array(res, 0, 4);
            const bytes = [];
            uint.forEach(byte => {
              bytes.push(byte.toString(16));
            });
            const hex = bytes.join('').toUpperCase();
            if (this.isSupportedImageType(hex)) {
              const dataReader = new FileReader();

              dataReader.onload = _ev => {
                this.marketForm.get('image').setValue(<string>dataReader.result);
              };
              dataReader.readAsDataURL(file);
            } else {
              this._snackbar.open(TextContent.ERROR_IMAGE_ADD, 'warn');
            }
          }
        };
        reader.readAsArrayBuffer(file);
      }
    });
    if (failedImgs) {
      this._snackbar.open(TextContent.ERROR_IMAGE_ADD, 'warn');
    }
    this.fileInputSelector.nativeElement.value = '';
  }


  private isSupportedImageType(signature: string): boolean {
    // 89504E47 === 'image/png'
    // (FFD8) === 'image/jpeg'
    return signature.startsWith('FFD8') || signature.startsWith('89504E47');
  }

}
