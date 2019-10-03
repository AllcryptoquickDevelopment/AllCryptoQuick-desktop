import { Component, OnInit, OnDestroy } from '@angular/core';

import { MultiwalletService, IWallet } from './multiwallet.service';
import { RpcService } from 'app/core/rpc/rpc.service';
import { Log } from 'ng2-logger';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { SnackbarService } from 'app/core/core.module';

@Component({
  selector: 'multiwallet-sidebar',
  templateUrl: './multiwallet-sidebar.component.html',
  styleUrls: ['./multiwallet-sidebar.component.scss']
})
export class MultiwalletSidebarComponent implements OnInit, OnDestroy {
  private log: any = Log.create(
    'multiwallet-sidebar.component id:' + Math.floor(Math.random() * 1000 + 1)
  );
  private destroyed: boolean = false;

  public list: Array<IWallet> = [];
  public activeWallet: IWallet;

  constructor(
    private walletRpc: RpcService,
    private router: Router,
    private multi: MultiwalletService,
    private flashNotification: SnackbarService
  ) {
    // get wallet list
    this.multi.list.pipe(takeWhile(() => !this.destroyed)).subscribe(list => {
      this.list = list;
    });
  }

  isWalletActive(w: IWallet): boolean {
    return this.walletRpc.wallet === w.name;
  }

  async switchToWallet(wallet: IWallet) {
    this.log.d('setting wallet to ', wallet);
    this.navigateToLoading(wallet.name);
  }

  private navigateToLoading(walletName: string) {
    this.walletRpc.wallet = walletName;
    this.router.navigate(['/loading'], {
      queryParams: { wallet: walletName }
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.destroyed = true;
  }
}
