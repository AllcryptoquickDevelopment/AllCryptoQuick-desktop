import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Store } from '@ngxs/store';
import { take, concatMap, finalize } from 'rxjs/operators';
import { Observable, from } from 'rxjs';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { MainRpcService } from 'app/main/services/main-rpc/main-rpc.service';
import { ApplicationRestartModalComponent } from 'app/main/components/application-restart-modal/application-restart-modal.component';
import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';
import { WalletBackupModalComponent } from './wallet-backup-modal/wallet-backup-modal.component';

import {
  PageInfo,
  TextContent,
  SettingType,
  SettingGroup,
  Setting
} from 'app/main-extra/global-settings/settings.types';
import { WalletInfoState, WalletSettingsState } from 'app/main/store/main.state';
import { WalletSettingsStateModel } from 'app/main/store/main.models';
import { WalletDetailActions } from 'app/main/store/main.actions';


enum SpecificTextContent {
  ERROR_UTXO_SPLIT_VALUE = 'Invalid value, number should be greater than ${num}'
}


@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class WalletSettingsComponent implements OnInit {

  settingType: (typeof SettingType) = SettingType;  // Template typings

  settingGroups: SettingGroup[] = [];
  isProcessing: boolean = false;   // Indicates that the current page is busy processing a change.
  currentChanges: number[][] = []; // (convenience helper) Tracks which setting items on the current page have changed

  readonly pageDetails: PageInfo = {
    title: 'Wallet Settings',
    description: 'Adjust settings and configuration that apply only to the currently selected wallet',
    help: 'For configuration of global app settings, click the settings icon in bottom right corner'
  } as PageInfo;

  private _currentGroupIdx: number = 0;


  constructor(
    private _store: Store,
    private _dialog: MatDialog,
    private _snackbar: SnackbarService,
    private _rpc: MainRpcService
  ) { }


  ngOnInit() {
    this.loadPageData();

    // Perform relevant data binding
    this.settingGroups.forEach((group: SettingGroup) => {
      group.settings.forEach((setting: Setting) => {
        if (setting.validate) {
          setting.validate = setting.validate.bind(this);
        }
        if (setting.onChange) {
          setting.onChange = setting.onChange.bind(this);
        }
      });

      this.currentChanges.push([]);
    });
    this.clearChanges();
  }


  get hasErrors(): boolean {
    return this.settingGroups.findIndex(group => group.errors.length > 0) > -1;
  }

  get hasChanges(): boolean {
    return this.currentChanges.findIndex(group => group.length > 0) > -1;
  }


  get currentGroup(): SettingGroup {
    return this.settingGroups[this._currentGroupIdx];
  }


  trackBySettingGroupFn(idx: number, item: SettingGroup) {
    return idx;
  }


  trackBySettingFn(idx: number, item: Setting) {
    return item.id;
  }


  changeSelectedGroup(idx: number) {
    if (idx >= 0 && idx < this.settingGroups.length) {
      this._currentGroupIdx = idx;
    }
  }


  settingChangedValue(settingIdx: number) {
    if (!(settingIdx >= 0 && settingIdx < this.currentGroup.settings.length)) {
        return;
    }

    this.isProcessing = true;
    const currentGroup = this.currentGroup;
    const groupIdx = this._currentGroupIdx;
    const setting = this.currentGroup.settings[settingIdx];

    if (setting.validate) {
      const response = setting.validate(setting.newValue, setting);
      setting.errorMsg = response ? response : '';
    }
    if (!setting.errorMsg && setting.onChange) {
      const response = setting.onChange(setting.newValue, setting);
      setting.errorMsg = response ? response : '';
    }
    const listedError = currentGroup.errors.findIndex(errItem => errItem === settingIdx);

    if (setting.errorMsg && (listedError === -1)) {
      currentGroup.errors.push(settingIdx);
    } else if (!setting.errorMsg && (listedError > -1)) {
      currentGroup.errors.splice(listedError, 1);
    }

    const changeIdx = this.currentChanges[groupIdx].findIndex((c) => c === settingIdx);

    if ((setting.currentValue !== setting.newValue) && (changeIdx === -1)) {
      this.currentChanges[groupIdx].push(settingIdx);
    } else if ((setting.currentValue === setting.newValue) && (changeIdx !== -1)) {
      this.currentChanges[groupIdx].splice(changeIdx, 1);
    }

    this.isProcessing = false;
  }


  clearChanges() {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;

    this.settingGroups.forEach(group => {
      group.settings.forEach(setting => {
        if ( !(setting.type === SettingType.BUTTON)) {
          setting.newValue = setting.currentValue;
        }
        setting.errorMsg = '';
        group.errors = [];
      });
    });

    this.currentChanges = this.currentChanges.map(change => []);
    this.isProcessing = false;
  }

  /**
   * Saves all modified changes on the current displayed page/tab.
   * Validates each modified setting if a validate function is specified.
   * If no setting validation errors occur, then the SettingPages's "save" function is invoked.
   */
  saveChanges() {
    if (this.isProcessing) {
      this._snackbar.open(TextContent.ERROR_BUSY_PROCESSING, 'err');
      return;
    }
    this.isProcessing = true;

    this.disableUI(TextContent.SAVING);

    // Validation of each changed setting ensures current settings are not in an error state
    let hasError = false;
    let hasChanged = false;
    this.settingGroups.forEach(group => {
      group.settings.forEach(setting => {
        if ( !(setting.type === SettingType.BUTTON)) {
          if (setting.currentValue !== setting.newValue) {
            hasChanged = true;

            if (setting.validate) {
              const response = setting.validate(setting.newValue, setting);
              if (response) {
                setting.errorMsg = response;
                hasError = true;
              }
            }
          }
        }
      });
    });

    if (!hasChanged || hasError) {
      const errMsg = !hasChanged ? TextContent.SAVE_NOT_NEEDED : TextContent.ERROR_INVALID_ITEMS;
      this.isProcessing = false;
      this.enableUI();
      this._snackbar.open(errMsg, 'err');
      return;
    }

    this.saveActualChanges().pipe(
      take(1),
      finalize(() => {
        this.isProcessing = false;
        this.enableUI();
      })
    ).subscribe(
      (doRestart: boolean) => {

        // Change current settings in case it has not been done
        this.settingGroups.forEach(group => {
          group.settings.forEach(setting => {
            if ( !(setting.type === SettingType.BUTTON)) {
              setting.currentValue = setting.newValue;
            }
            setting.errorMsg = '';
          });
          group.errors = [];
        });

        // reset the list of current changes
        this.currentChanges = this.currentChanges.map(change => []);
        this._snackbar.open(TextContent.SAVE_SUCCESSFUL);

        if (doRestart) {
          this.actionRestartApplication();
        }
      },
      (err) => {
        this._snackbar.open(TextContent.SAVE_FAILED, 'err');
      }
    );
  }


  private disableUI(message: string) {
    this._dialog.open(ProcessingModalComponent, {
      disableClose: true,
      data: {
        message: message
      }
    });
  }


  private enableUI() {
    this._dialog.closeAll();
  }

  /**
   * Extracts the changed settings for persistence: Modify this depending on the specific settings being configured
   */
  private saveActualChanges(): Observable<boolean> {
    return new Observable((observer) => {

      let restartRequired = false;
      const actions = [];

      const wName = <string>this._store.selectSnapshot(WalletInfoState.getValue('walletname'));

      this.settingGroups.forEach(group => {
        group.settings.forEach((setting) => {
          if ( (setting.type !== SettingType.BUTTON) && (setting.currentValue !== setting.newValue)) {
            actions.push(new WalletDetailActions.SetSetting(wName, setting.id, setting.newValue));
            if (setting.restartRequired) {
              restartRequired = true;
            }
          }
        });
      });

      from(actions).pipe(
        concatMap((action) => this._store.dispatch(action))
      ).subscribe(
        null,
        null,
        () => {
          observer.next(restartRequired);
          observer.complete();
        }
      );
    });
  }


  private actionRestartApplication() {
    const dialogRef = this._dialog.open(ApplicationRestartModalComponent);
    dialogRef.componentInstance.onConfirmation.subscribe(() => {
      this.disableUI(TextContent.RESTARTING_APPLICATION);
    });
  }


  private loadPageData() {

    const walletSettings: WalletSettingsStateModel = this._store.selectSnapshot(WalletSettingsState);

    const notificationsWallet = {
      name: 'System notifications',
      icon: 'part-notification-bell',
      settings: [],
      errors: []
    } as SettingGroup;

    notificationsWallet.settings.push({
      id: 'notifications_payment_received',
      title: 'Payment Received',
      description: 'Display a system notification message when a wallet payment has been received',
      isDisabled: false,
      type: SettingType.BOOLEAN,
      errorMsg: '',
      currentValue: walletSettings.notifications_payment_received,
      tags: [],
      restartRequired: false,
    } as Setting);

    notificationsWallet.settings.push({
      id: 'notifications_staking_reward',
      title: 'Staking Rewards',
      description: 'Display a system notification message when a stake has been found on this wallet',
      isDisabled: false,
      type: SettingType.BOOLEAN,
      errorMsg: '',
      currentValue: walletSettings.notifications_staking_reward,
      tags: [],
      restartRequired: false
    } as Setting);

    this.settingGroups.push(notificationsWallet);


    const walletActions = {
      name: 'Wallet Activity',
      icon: 'part-globe',
      settings: [],
      errors: []
    } as SettingGroup;

    walletActions.settings.push({
      id: 'anon_utxo_split',
      title: 'Split UTXOS on sending to Stealth Address',
      description: 'Creates a number of utxos when sending funds from this wallet to a stealth address. The higher the number, the greater the fees but the better for coin usage',
      isDisabled: false,
      type: SettingType.NUMBER,
      errorMsg: '',
      tags: [],
      restartRequired: false,
      currentValue: walletSettings.anon_utxo_split,
      limits: {min: 1},
      validate: this.actionValidateSplitUTXO
    } as Setting);

    this.settingGroups.push(walletActions);


    const dangerZone = {
      name: 'Danger zone',
      icon: 'part-alert',
      settings: [],
      errors: []
    } as SettingGroup;

    dangerZone.settings.push({
      id: '',
      title: 'Backup Wallet',
      description: 'Create a wallet file backup (the wallet.dat file for the current wallet) in a different folder location',
      isDisabled: false,
      type: SettingType.BUTTON,
      errorMsg: '',
      tags: [],
      restartRequired: false,
      currentValue: '',
      newValue: '',
      limits: {color: 'primary', icon: 'part-archive'},
      onChange: this.actionBackupWallet
    } as Setting);

    this.settingGroups.push(dangerZone);
  }


  private actionBackupWallet() {
    const dialogRef = this._dialog.open(WalletBackupModalComponent);
    dialogRef.componentInstance.onConfirmation.subscribe(async (folderPath: string) => {
      this.disableUI(TextContent.SAVING);
      const success = await this._rpc.call('backupwallet', [folderPath]).toPromise().then(() => true).catch(() => false);
      this.enableUI();
      const message = success ? TextContent.SAVE_SUCCESSFUL : TextContent.SAVE_FAILED;
      this._snackbar.open(message);
    });
  }

  private actionValidateSplitUTXO(newValue: number, setting: Setting): string {
    if (+newValue > 0) {
      return '';
    }
    return SpecificTextContent.ERROR_UTXO_SPLIT_VALUE.replace('${num}', '1');
  }

}
