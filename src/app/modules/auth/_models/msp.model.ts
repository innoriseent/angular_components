export class MspModel {
  logo: string;
  domain: string;
  email: string;
  name: string;
  deletedAt: string;
  createdAt: string;
  updatedAt: string;

  setMsp(msp: any) {
    this.logo = msp.logo || '';
    this.domain = msp.domain;
    this.email = msp.email;
    this.name = msp.name || '';
    this.deletedAt = msp.deleted_at || '';
    this.createdAt = msp.created_at || '';
    this.updatedAt = msp.updated_at || '';
  }
}
