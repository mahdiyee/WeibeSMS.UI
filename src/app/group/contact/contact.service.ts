import { Injectable } from '@angular/core';
import {ApiService} from '../../shared/api.service';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(private apiService:ApiService) { }

  getAllContacts(groupId:number) : Observable<any>{
    return this.apiService.get('Contact',true);
  }

  getContact(contactId:string) : Observable<any>{
    return this.apiService.get(`Contact/${contactId}`,true);
  }

  addContact(groupId:number,firstName:string,lastName:string,mobile:string,gender:number,email:string){
    let payload={
      'Gender':gender,
      'FirstName':firstName,
      'LastName':lastName,
      'Mobile':mobile,
      'ContactGroupId': groupId,
      'Email':email
    };

    return this.apiService.post(`Contact`,payload,true);
  }

  modifyContact(groupId:number,contactId:number,firstName:string,lastName:string,email:string,gender:number):Observable<any>{
    let payload={
      'Gender':gender,
      'FirstName':firstName,
      'LastName':lastName,
      'ContactGroupId': groupId,
      'Email':email
    };

    return this.apiService.put(`Contact/${contactId}`,payload,true);
  }

  removeContact(contactId:number):Observable<any>{
    return this.apiService.delete(`Contact/${contactId}`,true);
  }

  removeContactFromGroup(groupId:string,contactId:string){
    return this.apiService.delete(`Contact/${contactId}/group/${groupId}`,true);
  }
}
