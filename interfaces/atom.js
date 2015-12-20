/*@flow*/

declare module "atom" {
  declare class CompositeDisposable {}
}

declare class atom {
  static workspace: Object;
  static views: Object;
  static commands: Object;
  static config: Object;
}
