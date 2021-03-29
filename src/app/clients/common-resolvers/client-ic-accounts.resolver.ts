/** Angular Imports */
import { Injectable } from "@angular/core";
import { Resolve, ActivatedRouteSnapshot } from "@angular/router";

/** rxjs Imports */
import { Observable } from "rxjs";

/** Custom Services */
import { ClientsService } from "../clients.service";

/**
 * Client Accounts data resolver.
 */
@Injectable()
export class ClientIcAccountsResolver implements Resolve<Object> {
  /**
   * @param {ClientsService} ClientsService Clients service.
   */
  constructor(private clientsService: ClientsService) {}

  /**
   * Returns the Client Account data.
   * @returns {Observable<any>}
   */
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.clientsService.getICClientAccount();
  }
}