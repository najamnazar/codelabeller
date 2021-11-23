import { Component } from '@angular/core';
import { DatePipe, Location } from '@angular/common'
import { TableColumn } from '../../modules/data-table/table-column.interface';
import { ResponseService } from '../../services/response/response.service';
import { IResponse } from '@codelabeller/api-interfaces';
import { Router } from '@angular/router';
import { AuthService } from '../../modules/auth/auth.service';
import { PageService } from '../../services/page/page.service';

@Component({
  selector: 'codelabeller-my-responses',
  templateUrl: './my-responses.component.html',
  styleUrls: ['./my-responses.component.scss']
})
export class MyResponsesComponent {
  loading = false;
  responses: IResponse[] = [];

  constructor(
    private responseService: ResponseService,
    public authService: AuthService,
    private pageService: PageService,
    private router: Router,
    private datePipe: DatePipe,
    private location: Location
  ) {
    this.pageService.setTitle('My Responses');

    this.responseService.getAllResponses().then(responses => {
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

  onBack() {
    this.location.back();
  }

  onRowClicked(row: IResponse) {
    this.router.navigate([`/home/file/${row.file.id}`]);
  }
}
