/** Angular Imports */
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { ClientsService } from 'app/clients/clients.service';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */

/**
 * Clients data resolver.
 */
@Injectable()
export class MidasClientViewResolver implements Resolve<Object> {

    /**
     * @param {ClientsService} ClientsService Clients service.
     */
    constructor(private clientsService: ClientsService) { }

    /**
     * Returns the Clients data.
     * @returns {Observable<any>}
     */
    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const clientId = route.paramMap.get('clientId');
        return this.clientsService.getClientData(clientId);
    }

}
