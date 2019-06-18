import {Component, OnInit} from '@angular/core';
import {DraftService} from '../draft.service';
import _ from 'node_modules/lodash/lodash.js';
import {DraftInterface} from '../draft/models/draft.interface';
import {RemoveDraftInterface} from '../draft/models/remove-draft.interface';
import {RemoveGroupNameResponseInterface} from "../../group/group-list/models/remove-group-name-response.interface";
import {DialogComponent} from "../../../../shared/component/dialog/dialog.component";
import {MatDialog} from "@angular/material";
import {NotificationService} from "../../../../shared/notification.service";

@Component({
    selector: 'app-draft-list',
    templateUrl: './draft-list.component.html',
    styleUrls: ['./draft-list.component.scss']
})
export class DraftListComponent implements OnInit {

    drafts: any[] = [];
    pageNumber: number = 1;
    pageSize: number = 10;
    totalItemsCount: number;
    phrase = '';

    constructor(private draftService: DraftService,
                private dialog: MatDialog,
                private notificationService: NotificationService) {
    }

    ngOnInit() {
        this.getAllDrafts();
    }

    getAllDrafts() {
        this.draftService.getAllDrafts(this.pageNumber, this.pageSize, this.phrase)
            .subscribe((res: DraftInterface) => {
                this.drafts = res.data.items;
                this.totalItemsCount = res.data.totalItemsCount;
            });
    }

    removeDraft(index, draft) {
        this.openDeleteDialog('480px', 'auto', '', {
            modalType: 'deleteDraft',
            modalHeader: 'Delete Draft',
            modalText: 'are you sure to remove this draft?',
            id: draft.id,
            index
        });
    }

    openDeleteDialog(width, height, panelClass, data): void {
        const dialogRef = this.dialog.open(DialogComponent, {
            width,
            height,
            panelClass,
            data
        });

        dialogRef.afterClosed()
            .subscribe(result => {
                if (result && result.remove) {
                    if (result.remove.modalType === 'deleteDraft') {
                        this.draftService.removeDraft(result.remove.data.id)
                            .subscribe((res: RemoveDraftInterface) => {
                                this.drafts.splice(result.remove.data.index, 1);
                                this.notificationService.success('Draft removed successfully', '');
                            });
                    }
                }
            });
    }

    getDataWithSearch() {
        this.pageNumber = 1;
        this.getAllDrafts();
    }

    doPaging(e) {
        this.pageNumber = e;
        this.getAllDrafts();
    }

    getData(event) {
        this.phrase = event;
        this.getAllDrafts();
    }
}
