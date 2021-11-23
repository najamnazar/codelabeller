import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IResponse, IResponseEditHistory, IUser } from '@codelabeller/api-interfaces';
import { ResponseService } from '../../services/response/response.service';
import { TableColumn } from '../data-table/table-column.interface';

@Component({
  selector: 'codelabeller-admin-all-responses-management',
  templateUrl: './admin-all-responses-management.component.html',
  styleUrls: ['./admin-all-responses-management.component.scss']
})
export class AdminAllResponsesManagementComponent {
  loading = false;
  responses: IResponse[] = [];

  showEditHistory = false;
  editHistoryLoading = false;
  editHistories: IResponseEditHistory[] = [];
  editHistoryUser!: string;
  editHistoryFileName!: string;

  constructor(private responseService: ResponseService, private router: Router, private datePipe: DatePipe) {
    this.responseService.getAllResponsesAsAdmin().then(responses => {
      this.responses = responses;
      this.loading = false;
    });
  }

  columns: TableColumn[] = [
    {
      field: 'timeCreated',
      header: 'Date',
      filterType: 'date',
      dataTransformer: (data: Date) => {
        return this.datePipe.transform(data, 'dd/MM/yy h:mm:ss a') ?? '';
      }
    },
    {
      field: 'lastUpdated',
      header: 'Last Updated',
      filterType: 'date',
      dataTransformer: (data: Date) => {
        return this.datePipe.transform(data, 'dd/MM/yy h:mm:ss a') ?? '';
      }
    },
    {
      field: 'submittedBy',
      header: 'Who?',
      filterType: 'text',
      dataTransformer: (data: IUser) => {
        return data?.email;
      }
    },
    {
      field: 'file.project.name',
      header: 'Project'
    },
    {
      field: 'file.path',
      header: 'Path'
    },
    {
      field: 'file.name',
      header: 'File Name'
    },
    {
      field: 'designPattern.name',
      header: 'Pattern'
    },
    {
      field: 'confidenceRating',
      header: 'Confidence',
      filterType: 'numeric'
    },
    {
      field: 'patternExplanation',
      header: 'Pattern Explanation'
    },
    {
      field: 'ratingExplanation',
      header: 'Rating Explanation'
    },
    {
      field: 'summary',
      header: 'Summary'
    },
    {
      field: 'notes',
      header: 'Notes'
    }
  ];

  editHistoryColumns: TableColumn[] = [
    {
      field: 'timeCreated',
      header: 'Date',
      filterType: 'date',
      dataTransformer: (data: Date) => {
        return this.datePipe.transform(data, 'dd/MM/yy h:mm:ss a') ?? '';
      }
    },
    {
      field: 'newDesignPattern.name',
      header: 'Pattern'
    },
    {
      field: 'newConfidenceRating',
      header: 'Confidence',
      filterType: 'numeric'
    },
    {
      field: 'newPatternExplanation',
      header: 'Pattern Explanation'
    },
    {
      field: 'newRatingExplanation',
      header: 'Rating Explanation'
    },
    {
      field: 'newSummary',
      header: 'Summary'
    },
    {
      field: 'newNotes',
      header: 'Notes'
    }
  ];

  onRowClicked(row: IResponse) {
    this.editHistories = [];
    this.editHistoryUser = row.submittedBy as unknown as string;
    this.editHistoryFileName = `${row.file.project.name}/${row.file.path}/${row.file.name}`
    this.showEditHistory = true;

    this.responseService.getEditHistoryAsAdmin(row.id).then(history => {
      this.editHistories = history;
      this.editHistoryLoading = false;
    });
  }

  onBackToAllResponses() {
    this.editHistories = [];
    this.editHistoryUser = '';
    this.editHistoryFileName = '';
    this.showEditHistory = false;
  }
}
