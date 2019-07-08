import {Component, OnInit} from '@angular/core';
import {ContactService} from '../single-add-contact/contact.service';
import {NotificationService} from '../../../../../shared/notification.service';
import {GroupService} from '../../group.service';
import _ from 'node_modules/lodash/lodash.js';
import {ActivatedRoute, Router} from '@angular/router';
import {GroupListInterface} from '../../group-list/models/group-list.interface';
import {GetAllContactGroupInterface} from './models/get-all--contact-group.interface';
import {ContactGroupMoveCopyResponseInterface} from './models/contact-group-move-copy-response.interface';

@Component({
  selector: 'app-import-contact-from-other-lists',
  templateUrl: './import-contact-from-other-lists.component.html',
  styleUrls: ['./import-contact-from-other-lists.component.scss']
})
export class ImportContactFromOtherListsComponent implements OnInit {

  groupId: number;
  groupPageNumber: number = 1;
  groupPageSize: number = 100;
  contactPageSize: number = 10;
  groups = [];
  clickedGroup: any;
  phrase = '';
  contactsSelectedFromGrid: Map<number, number[]> = new Map<number, number[]>();
  groupSelectedFromLeft: number[] = [];
  totalContactsSelectedCount;

  constructor(private contactService: ContactService,
              private groupService: GroupService,
              private activatedRoute: ActivatedRoute,
              private notificationService: NotificationService,
              private router: Router) {
  }

  ngOnInit() {
    this.contactService.addMode = 'list';
    const strGroupId =this.activatedRoute.parent.snapshot.paramMap.get('groupId');
    if (strGroupId){
      this.groupId = parseInt(strGroupId);
    }
    this.getAllGroupList();
  }

  getAllGroupList() {
    this.groupService.getAllGroupList(this.groupPageNumber, this.groupPageSize, this.phrase)
      .subscribe((res: GroupListInterface) => {
        this.groups = res.data.items.filter(i => i.id !== this.groupId);
        this.groups.forEach(g => {
          g.isSelected = false;
          g.pageNumber = 1;
          g.loadedPageNumbers = [];
          g.totalItems = g.contactsCount;
        });
      });
  }

  totalContactsSelectedCountCalculate() {
    let count = 0;

    this.groupSelectedFromLeft.forEach(g => {
      const group = _.find(this.groups, grp => grp.id === g);
      count += group.contactsCount;
    });

    this.contactsSelectedFromGrid.forEach(value => {
      count += value.length;
    });

    this.totalContactsSelectedCount = count;
  }

  contactCheckedChanged(e, c) {
    this.clickedGroup.contacts.forEach(cc => {
      if (cc.id === c.id) {
        cc.isSelected = e;
      }
    });

    const keyExists = this.contactsSelectedFromGrid.has(this.clickedGroup.id);
    if (e) {
      if (keyExists) {
        this.contactsSelectedFromGrid.get(this.clickedGroup.id).push(c.id);
      } else {
        this.contactsSelectedFromGrid.set(this.clickedGroup.id, [c.id]);
      }
    } else {
      this.clickedGroup.isSelected = false;
      //TODO: use splice instead of lodash in all components!
      _.remove(this.groupSelectedFromLeft, id => id === this.clickedGroup.id);

      const selectedContacts = this.clickedGroup.contacts.filter(c => c.isSelected);
      if (!this.contactsSelectedFromGrid.has(this.clickedGroup.id)) {
        this.contactsSelectedFromGrid.set(this.clickedGroup.id, []);
      } else {
        const array = this.contactsSelectedFromGrid.get(this.clickedGroup.id);
        selectedContacts.forEach(sc => {
          if (!_.includes(array, sc.id)) {
            array.push(sc.id);
          }
        });
      }

      if (keyExists) {
        _.remove(this.contactsSelectedFromGrid.get(this.clickedGroup.id), id => id == c.id);
      }
    }

    this.totalContactsSelectedCountCalculate();
  }

  groupCheckedChanged(e, g) {
    if (e) {
      this.groupSelectedFromLeft.push(g.id);
      this.contactsSelectedFromGrid.delete(g.id);
    } else {
      _.remove(this.groupSelectedFromLeft, id => id == g.id);
    }

    if (g.contacts) {
      g.contacts.forEach(c => c.isSelected = e);
    }
    this.totalContactsSelectedCountCalculate();
  }

  loadContacts(group) {
    this.clickedGroup = group;
      group.contacts = [];
      this.getContactsFromServer(this.clickedGroup);
  }

  getContactsFromServer(group) {
    this.contactService.getAllContacts(group.id, group.pageNumber, this.contactPageSize,this.phrase)
      .subscribe((res: GetAllContactGroupInterface) => {
        res.data.items.forEach(i => {
          group.contacts.push(i);
        });
        group.loadedPageNumbers.push(group.pageNumber);
        group.contacts.forEach(c => c.isSelected = this.clickedGroup.isSelected);
      });
  }

  operation(isCut: boolean) {
    const apiModel = new Map<number, number[]>();
    this.contactsSelectedFromGrid.forEach((value, key) => {
      apiModel.set(key, value);
    });

    this.groupSelectedFromLeft.forEach(g => {
      apiModel.set(g, []);
    });

    this.contactService.addContactFromGroups(this.groupId, apiModel, isCut)
      .subscribe((res: ContactGroupMoveCopyResponseInterface) => {
        this.notificationService.success('Operation done successfully', '');
        this.router.navigateByUrl(`group/${this.groupId}`);
      });
  }

  doPaging(e) {
    this.clickedGroup.pageNumber = e;

    for (let i=0;this.clickedGroup.loadedPageNumbers.length > i;i++){
      let num = this.clickedGroup.loadedPageNumbers[i];
      if (num == e)
        return;
    }

    this.getContactsFromServer(this.clickedGroup);
  }

  getData(event) {
    // this.phrase = event;
    // this.loadContacts(this.clickedGroup);
  }
}
