import { AuthModel } from './auth.model';
import { AddressModel } from './address.model';
import { SocialNetworksModel } from './social-networks.model';

export class UserModel extends AuthModel {
  accountId: number;
  createdAt: string;
  email: string;
  id: number;
  lastLoggedIn: any;
  mspId: number;
  name: string;
  roleCode: string;
  updatedAt: string;

  setUser(user: any) {
    this.accountId = user.account_id;
    this.createdAt = user.created_at || '';
    this.email = user.email || '';
    this.id = user.id || 0;
    this.lastLoggedIn = user.last_loged_in || '';
    this.mspId = user.msp_id || 0;
    this.name = user.name || '';
    this.roleCode = user.role_code || 'user';
    this.updatedAt = user.updated_at || '';
  }
}
