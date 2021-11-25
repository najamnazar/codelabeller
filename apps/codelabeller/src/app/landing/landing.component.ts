import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DemoAccount } from '@codelabeller/api-interfaces';
import { MessageService } from 'primeng/api';
import jwt_decode, { JwtPayload } from "jwt-decode";
import { DemoAuthService } from '../../services/demo-auth/demo-auth.service';
import { PageService } from '../../services/page/page.service';

@Component({
  selector: 'codelabeller-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  private readonly CREATE_ACCOUNT_OPTION = {
    accountInfo: '--Create a new demo account--',
    email: null
  };

  demoAccounts: { accountInfo: string, email: string | null | undefined }[] = [];
  demoAccountsOptions: { accountInfo: string, email: string | null | undefined }[] = [];

  selectedDemoAccount: { accountInfo: string, email: string | null | undefined } | undefined = undefined;

  constructor(
    private demoAuthService: DemoAuthService,
    private messageService: MessageService,
    private pageService: PageService,
    private router: Router,
  ) {
    this.pageService.setTitle('Welcome');

    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state?.loggedOut) {
      this.messageService.add({ severity: 'success', summary: 'Logout', detail: `You have successfully logged out.` });
    }

    this.getDemoAccounts();
  }

  async loginDemo() {
    let loginEmail = this.selectedDemoAccount?.email;

    // Create a new account if the user has chosen to do so.
    if (!loginEmail) {
      // Automatically login as that new account once it has been created.
      const newAccount: DemoAccount = await this.demoAuthService.createDemoAccount();
      loginEmail = newAccount.email;

      const accountObj = {
        accountInfo: `${newAccount.givenName} ${newAccount.familyName} <${loginEmail}>`,
        email: loginEmail
      }

      // Save the new demo account into the list and save into storage so that it can be quickly re-selected by the user in the future.
      this.demoAccounts.push(accountObj);
      localStorage.setItem('demo_accounts', JSON.stringify(this.demoAccounts));

      // Update list of demo account options
      this.demoAccountsOptions = [...this.demoAccounts, this.CREATE_ACCOUNT_OPTION]
      this.selectedDemoAccount = accountObj;
    }

    // Get auth token to enable login with demo account.
    const jwt = (await this.demoAuthService.loginDemoAccount(loginEmail)).token;

    // Set the token data into local storage as these are required by the OAuth library,
    // to recognise the user as being logged in.
    const decodedJwt = jwt_decode<JwtPayload>(jwt);
    const issueTime = (decodedJwt.iat as number * 1000).toString() ?? '';
    const expiryTime = (decodedJwt.exp as number * 1000).toString() ?? '';

    localStorage.setItem('id_token', jwt);
    localStorage.setItem('id_token_claims_obj', JSON.stringify(decodedJwt));
    localStorage.setItem('id_token_stored_at', issueTime);
    localStorage.setItem('id_token_expires_at', expiryTime);
    localStorage.setItem('access_token', jwt);
    localStorage.setItem('access_token_stored_at', issueTime);
    localStorage.setItem('expires_at', expiryTime);

    // Take note of the last selected demo account so that it can be automatically selected for the user in the future when logging in.
    if (this.selectedDemoAccount?.email) {
      localStorage.setItem('last_demo_account', this.selectedDemoAccount.email);
    }

    this.login();
  }

  login() {
    this.router.navigate(['/login']);
  }

  private async getDemoAccounts() {
    const tempAccounts = JSON.parse(localStorage.getItem('demo_accounts') ?? '[]');
    let lastUsedFound = false;

    if (Array.isArray(tempAccounts) && tempAccounts.length > 0) {
      const lastUsedAccount = localStorage.getItem('last_demo_account');

      for (const account of tempAccounts) {
        const exists = (await this.demoAuthService.checkDemoAccountExists(account.email)).exists;
        if (!exists) {
          continue;
        }

        this.demoAccounts.push(account);

        // Automatically select the user's last used demo account, if any.
        if (account.email == lastUsedAccount) {
          this.selectedDemoAccount = account;
          lastUsedFound = true;
        }
      }

      if (!lastUsedFound) {
        localStorage.removeItem('last_demo_account');
      }

      localStorage.setItem('demo_accounts', JSON.stringify(this.demoAccounts));

      this.demoAccountsOptions.push(...this.demoAccounts);
    }

    // Add the ability to create a new demo account as the last option.
    this.demoAccountsOptions.push(this.CREATE_ACCOUNT_OPTION);
  }
}
