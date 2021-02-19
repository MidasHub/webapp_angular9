import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';

//** Logger */
import {Logger} from "../core/logger/logger.service";
const log = new Logger("Bank-Service");
@Injectable({
  providedIn: 'root'
})
export class BanksService {
  private credentialsStorageKey = 'midasCredentials';
  private accessToken: any;
  private GatewayApiUrlPrefix: any;
  public cards: any;
  public banks: any;
  public cardTypes: any;
  public documentCardBanks: any[];
  public documentCardTypes: any[];

  constructor(private http: HttpClient) {
    this.accessToken = JSON.parse(
      sessionStorage.getItem(this.credentialsStorageKey)
      || localStorage.getItem(this.credentialsStorageKey)
    );
    this.GatewayApiUrlPrefix = environment.GatewayApiUrlPrefix;
  }

  addBank(bank: any) {
    const banks = this.banks.getValue();
    banks.push({
      ...bank,
      cards: [],
      status: 'O'
    });
    this.banks.next(banks);
  }

  addCard(card: any) {
    const cards = this.cards.getValue();
    this.cards.next([...cards, card]);
    const banks = this.banks.getValue();
    banks.map((bank: any) => {
      if (bank.bankCode === card.bankCode) {
        bank.cards.push(card);
      }
    });
    this.banks.next(banks);
  }

  updateCard(card: any) {
    const cards = this.cards.getValue().map((c: any) => {
      if (card.refid === c.refid) {
        return {
          ...c,
          ...card
        };
      }
      return c;
    });
    this.cards.next(cards);
    const banks = this.banks.getValue();
    banks.map((bank: any) => {
      if (bank.bankCode === card.bankCode) {
        bank.cards = bank.cards.map((c: any) => {
          if (card.refid === c.refid) {
            return {
              ...c,
              ...card
            };
          }
          return c;
        });
      }
    });
    this.banks.next(banks);
  }

  getBanks(): BehaviorSubject<any> {
    if (!this.banks) {
      this.getData();
    }
    return this.banks;
  }

  storeBank(bankCode: string, bankName: string): Observable<any> {
    const httpParams = new HttpParams()
      .set('createdBy', this.accessToken.userId)
      .set('bankCode', bankCode)
      .set('bankName', bankName)
      .set('accessToken', this.accessToken.base64EncodedAuthenticationKey);
    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/common/store_bank_info`, httpParams);
  }

  getData() {
    if (!this.cards) {
      this.cards = new BehaviorSubject(null);
    }
    if (!this.banks) {
      this.banks = new BehaviorSubject(null);
    }
    if (!this.cardTypes) {
      this.cardTypes = new BehaviorSubject(null);
    }
    const httpParams = new HttpParams()
      .set('createdBy', this.accessToken.userId)
      .set('accessToken', this.accessToken.base64EncodedAuthenticationKey);
    this.http.post<any>(`${this.GatewayApiUrlPrefix}/card/get_all_bincode_info`, httpParams).subscribe(result => {
      if (result?.result) {
        const {ListBinCodeEntity = [], listBank = [], listCardType = []} = result.result;
        listBank.map((bank: any) => {
          bank.cards = ListBinCodeEntity.filter((v: any) => v.bankCode === bank.bankCode);
        });
        this.cards.next(ListBinCodeEntity);
        this.banks.next(listBank);
        this.cardTypes.next(listCardType);
      }
    });
  }

  getCards(): BehaviorSubject<any> {
    if (!this.cards) {
      this.getData();
    }
    return this.cards;
  }

  getCardInfo(binCode: string): Observable<any> {
    const httpParams = new HttpParams()
      .set('createdBy', this.accessToken.userId)
      .set('bincode', binCode)
      .set('accessToken', this.accessToken.base64EncodedAuthenticationKey);
    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/card/get_bincode_info`, httpParams);
  }

  storeBinCode(binCode: string, bankCode: string, cardType: string, cardClass: string): Observable<any> {
    const httpParams = new HttpParams()
      .set('createdBy', this.accessToken.userId)
      .set('bincode', binCode)
      .set('bankCode', bankCode)
      .set('cardType', cardType)
      .set('cardClass', cardClass)
      .set('accessToken', this.accessToken.base64EncodedAuthenticationKey);
    return this.http.post<any>(`${this.GatewayApiUrlPrefix}/card/store_bincode_info`, httpParams);
  }


  getCardTypes(): BehaviorSubject<any> {
    if (!this.cardTypes) {
      this.getData();
    }
    return this.cardTypes;
  }

  getInfoBinCode(binCode: string): BehaviorSubject<any> {
    const result = new BehaviorSubject(null);
    // if (!this.cards) {
    //   this.getData();
    // }
    log.debug('This Card:',this.cards)
    this.cards.subscribe((values: any) => {
      if (values) {
        log.debug('Value is: ',values)
        let have = false;
        for (const v of values) {
          if (v.binCode == binCode) {
            have = true;
            result.next({...v, existBin: true});
            break;
          }
        }
        if (!have) {
          result.next({existBin: false});
        }
      }
    });
    return result;
  }

  storeInfoBinCode(body: any): Observable<any> {
    const httpParams = new HttpParams()
      .set('binCode', body.binCode)
      .set('cardType', body.cardType)
      .set('bankCode', body.bankCode)
      .set('createdBy', this.accessToken.userId)
      .set('accessToken', this.accessToken.base64EncodedAuthenticationKey);
    return this.http.post(`${this.GatewayApiUrlPrefix}/common/store_info_bin_code`, httpParams);
  }

  storeExtraCardInfo(body: any): Observable<any> {
    const httpParams = new HttpParams()
      .set('userId', body.userId)
      .set('userIdentifyId', body.userIdentifyId)
      .set('clientName', body.clientName)
      .set('cardNumber', body.cardNumber)
      .set('mobileNo', body.mobileNo)
      .set('dueDay', body.dueDay)
      .set('expireDate', `${body.dueDay}/${body.expireDate}`)
      .set('createdBy', this.accessToken.userId)
      .set('accessToken', this.accessToken.base64EncodedAuthenticationKey);

    return this.http.post(`${this.GatewayApiUrlPrefix}/card/store_extra_card_info`, httpParams);
  }

  bankCardDataInit() {
    this.getBanks().subscribe((result: any) => {
      if (result) {
        this.documentCardBanks = result;
      }
      });
    this.getCardTypes().subscribe((result:any)=>{
      if (result) {
        this.documentCardTypes = result;
      }
    }
    );
  }
//----end Class---//
}
