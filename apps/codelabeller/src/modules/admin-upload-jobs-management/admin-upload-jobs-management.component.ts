import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { IProject, IProjectFileUploadJob, IProjectFileUploadJobLine } from '@codelabeller/api-interfaces';
import { ProjectFileUploadJobService } from '../../services/project-file-upload-job/project-file-upload-job.service';
import { TableColumn } from '../data-table/table-column.interface';

@Component({
  selector: 'codelabeller-admin-upload-jobs-management',
  templateUrl: './admin-upload-jobs-management.component.html',
  styleUrls: ['./admin-upload-jobs-management.component.scss']
})
export class AdminUploadJobsManagementComponent {
  jobs: IProjectFileUploadJob[] = [];
  jobLogLines: IProjectFileUploadJobLine[] = [];

  viewingUploadJob = false;
  uploadJobBeingViewed !: IProjectFileUploadJob;

  loading = false;

  constructor(private projectFileUploadJobService: ProjectFileUploadJobService, private datePipe: DatePipe) {
    this.projectFileUploadJobService.getAllFileUploadJobsAsAdmin().then(jobs => {
      this.jobs = jobs;
      this.loading = false;
    });
  }

  columns: TableColumn[] = [
    {
      field: 'jobId',
      header: 'Job ID',
      filterType: 'text',
    },
    {
      field: 'timeCreated',
      header: 'Time Submitted',
      filterType: 'date',
      dataTransformer: (data: Date) => {
        return this.datePipe.transform(data, 'dd/MM/yy h:mm:ss a') ?? '';
      }
    },
    {
      field: 'project',
      header: 'Project',
      filterType: 'text',
      dataTransformer: (data: IProject) => {
        return data.name;
      }
    },
    {
      field: 'isCompleted',
      header: 'Completed?',
      filterType: 'text',
      dataTransformer: (data: boolean) => {
        return data ? 'Yes' : 'No';
      }
    },
    {
      field: 'isFailed',
      header: 'Failed?',
      filterType: 'text',
      dataTransformer: (data: boolean) => {
        return data ? 'Yes' : 'No';
      }
    },
    {
      field: 'progressRatio',
      header: 'Job Progress (%)',
      filterType: 'numeric',
    }
  ];

  fileUploadJobLogsColumns: TableColumn[] = [
    {
      field: 'timeCreated',
      header: 'Time Logged',
      filterType: 'date',
      dataTransformer: (data: Date) => {
        return this.datePipe.transform(data, 'dd/MM/yy h:mm:ss.SSS a') ?? '';
      }
    },
    {
      field: 'isDone',
      header: 'Completed?',
      filterType: 'text',
      dataTransformer: (data: boolean) => {
        return data ? 'Yes' : 'No';
      }
    },
    {
      field: 'isRejected',
      header: 'Failed?',
      filterType: 'text',
      dataTransformer: (data: boolean) => {
        return data ? 'Yes' : 'No';
      }
    },
    {
      field: 'messages',
      header: 'Messages',
      filterType: 'text',
      dataTransformer: (data: string[]) => {
        return data.join("\n\n");
      }
    },
  ];

  async onRowClicked(row: IProjectFileUploadJob) {
    this.onViewUploadJob(row);
  }

  async onViewUploadJob(uploadJob: IProjectFileUploadJob) {
    this.uploadJobBeingViewed = uploadJob;
    this.jobLogLines = uploadJob.jobLines ?? [];
    this.viewingUploadJob = true;
  }
}
