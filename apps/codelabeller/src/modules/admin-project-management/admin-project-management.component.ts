import { Component, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { IFile, IProject, IResponse } from '@codelabeller/api-interfaces';
import { MessageService } from 'primeng/api';
import { ProjectService } from '../../services/project/project.service';
import { FileService } from '../../services/file/file.service';
import { TableColumn } from '../data-table/table-column.interface';
import { DropdownBuilder } from '../input-form/input-field-builders/dropdown.builder';
import { TextBoxBuilder } from '../input-form/input-field-builders/text-box.builder';
import { InputField } from '../input-form/input-fields/input-field';
import { InputFormComponent } from '../input-form/input-form.component';
import * as JSZip from 'jszip';
import { FileUpload } from 'primeng/fileupload';
import { HttpEventType } from '@angular/common/http';
import { Checkbox } from 'primeng/checkbox';
import { OptionService } from '../../services/option/option.service';

@Component({
  selector: 'codelabeller-admin-project-management',
  templateUrl: './admin-project-management.component.html',
  styleUrls: ['./admin-project-management.component.scss']
})
export class AdminProjectManagementComponent {
  @ViewChild('addInputForm') addInputForm!: InputFormComponent<IProject>;
  @ViewChild('manageInputForm') manageInputForm!: InputFormComponent<IFile>;
  @ViewChild('deleteInputForm') deleteInputForm!: InputFormComponent<IProject>;
  @ViewChild('fileUploaderButton') fileUploaderButton!: FileUpload;
  @ViewChild('checkbox') checkbox!: Checkbox;

  readonly states = [
    { name: 'No', state: false },
    { name: 'Yes', state: true }
  ];

  loading = false;
  projects: IProject[] = [];
  projectFiles: IFile[] = [];
  currentProject!: IProject | null;

  managingFile = false;
  fileBeingManaged !: IFile;

  uploadedZip!: JSZip;
  filesToUpload: FileEntry[] = [];
  filesRejectedForUpload: FileEntry[] = [];
  selectedForUploadCount = 0;

  readonly BUTTON_SPINNING_FONT = 'pi pi-spinner pi-spin';
  readonly BUTTON_READY_FONT = 'pi pi-plus';
  buttonIcon = this.BUTTON_READY_FONT;

  readonly BUTTON_READY_TEXT = 'Upload';
  readonly BUTTON_PROCESSING_TEXT = 'Processing zip file for upload...'
  buttonText = this.BUTTON_READY_TEXT;

  showFiles = false;
  filesLoading = false;
  addingProject = false;
  deletingProject = false;
  zipSelected = false;
  isUploadingZip = false;
  percentageUploaded = 0;

  constructor(private projectService: ProjectService, private fileService: FileService, private messageService: MessageService, private optionService: OptionService) {
    this.projectService.getAllProjectsAsAdmin().then(projects => {
      this.projects = projects;
      this.loading = false;
    });
  }

  columns: TableColumn[] = [
    {
      field: 'name',
      header: 'Project Name',
      filterType: 'text',
    },
    {
      field: 'fileCount',
      header: '# Files',
      filterType: 'numeric',
    },
    {
      field: 'totalResponsesRequired',
      header: '# Required Responses',
      filterType: 'numeric',
    },
    {
      field: 'totalResponsesSubmitted',
      header: '# Submitted Responses',
      filterType: 'numeric',
    },
    {
      field: 'responseRatio',
      header: 'Completion (%)',
      filterType: 'numeric',
    },
    {
      field: 'isActive',
      header: 'Enabled?',
      filterType: 'text',
      dataTransformer: (data: boolean) => {
        return data ? 'Yes' : 'No';
      }
    }
  ];

  fileColumns: TableColumn[] = [
    {
      field: 'path',
      header: 'Path',
      filterType: 'text'
    },
    {
      field: 'name',
      header: 'Name'
    },
    {
      field: 'isActive',
      header: 'Enabled?',
      filterType: 'text',
      dataTransformer: (data: boolean) => {
        return data ? 'Yes' : 'No';
      }
    },
    {
      field: 'isAcceptingResponses',
      header: 'Accepting Responses?',
      filterType: 'text',
      dataTransformer: (data: boolean) => {
        return data ? 'Yes' : 'No';
      }
    },
    {
      field: 'numRequiredResponses',
      header: '# Responses Required',
      filterType: 'numeric'
    },
    {
      field: 'responses',
      header: '# Responses Submitted',
      filterType: 'numeric',
      dataTransformer: (data: IResponse[]) => {
        if (data == undefined) {
          return '';
        }

        return data.length.toString() ?? '0';
      }
    }
  ];

  filesPendingUploadColumns: TableColumn[] = [
    {
      field: 'project',
      header: 'Project',
      filterType: 'text'
    },
    {
      field: 'path',
      header: 'Path',
      filterType: 'text'
    },
    {
      field: 'fileName',
      header: 'File Name',
      filterType: 'text'
    },
    {
      field: 'isEnabled',
      header: 'Enabled?',
      filterType: 'text',
      dataTransformer: (data: boolean) => {
        return data ? 'Yes' : 'No';
      }
    },
    {
      field: 'isAcceptingResponses',
      header: 'Accepting Responses?',
      filterType: 'text',
      dataTransformer: (data: boolean) => {
        return data ? 'Yes' : 'No';
      }
    },
    {
      field: 'numResponsesRequired',
      header: '# Responses Required',
      filterType: 'numeric'
    },
    {
      field: 'selectedForUpload',
      header: 'Selected',
      filterType: 'text',
      dataTransformer: (data: boolean) => {
        return data ? 'Yes' : 'No';
      }
    },
  ];

  filesRejectedForUploadColumns: TableColumn[] = [
    {
      field: 'project',
      header: 'Project',
      filterType: 'text'
    },
    {
      field: 'path',
      header: 'Path',
      filterType: 'text'
    },
    {
      field: 'fileName',
      header: 'File Name',
      filterType: 'text'
    },
    {
      field: 'rejectionReasons',
      header: 'Rejection Reasons',
      filterType: 'text',
      dataTransformer: (data: string[]) => {
        if (!data) {
          return '';
        }

        return data.join(', ');
      }
    }
  ];

  addFormInputFields = [
    new TextBoxBuilder()
      .name('name')
      .displayName("Project Name")
      .defaultValue(null)
      .prompt('Please enter a project name.')
      .numRowsToShow(1)
      .required(true)
      .validators([Validators.required])
      .build()
  ]

  manageFormInputFields: InputField[] = [];

  async getManageFormInputFields(
    fileIsEnabled: boolean,
    fileIsAcceptingResponses: boolean,
    numRequiredResponses: number,
  ) {
    const isEnabled = fileIsEnabled ? this.states[1] : this.states[0];
    const isAcceptingResponses = fileIsAcceptingResponses ? this.states[1] : this.states[0];

    return [
      new DropdownBuilder()
        .name('isActive')
        .displayName("Is Enabled")
        .defaultValue(isEnabled)
        .prompt('Enable the file for user assignment and browsing?')
        .data(this.states)
        .displayKey('name')
        .required(true)
        .validators([Validators.required])
        .build(),

      new DropdownBuilder()
        .name('isAcceptingResponses')
        .displayName("Is Accepting Responses")
        .defaultValue(isAcceptingResponses)
        .prompt('Are responses currently being accepted for the file?')
        .data(this.states)
        .displayKey('name')
        .required(true)
        .validators([Validators.required])
        .build(),

      new TextBoxBuilder()
        .name('numRequiredResponses')
        .defaultValue(numRequiredResponses)
        .prompt('How many responses are required for this file?')
        .numRowsToShow(1)
        .required(false)
        .validators([Validators.required, Validators.pattern('^[0-9]+$'), Validators.min(0)])
        .build()
    ]
  }

  deleteFormInputFields: InputField[] = [];

  async getDeleteFormInputFields() {
    return [
      new DropdownBuilder()
        .name('name')
        .displayName("Project")
        .defaultValue(null)
        .prompt('Please select a project to delete.')
        .data(this.getDeletableProjects())
        .displayKey('name')
        .required(true)
        .validators([Validators.required])
        .build()
    ]
  }

  onAddProject() {
    this.addInputForm.clearForm();
    this.addingProject = true;
  }

  async onDeleteProject() {
    this.deleteInputForm.clearForm();
    this.deleteFormInputFields = await this.getDeleteFormInputFields();

    this.deletingProject = true;
  }

  async onSubmitAdd(newProject: IProject) {
    newProject.isActive = true;

    try {
      const createdProject = await this.projectService.addProjectAsAdmin(newProject);
      createdProject.files = [];

      this.projects = [createdProject, ...this.projects];
      this.addingProject = false;

      this.messageService.add({ severity: 'success', summary: 'Project Created', detail: `The project '${newProject.name}' has been successfully created.` });

    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Submission Error', detail: `Unable to create project. ${error.error?.message ?? error.message}` });

    } finally {
      this.addInputForm.isLoading = false;
      this.addInputForm.isEnabled = true;
    }
  }

  async onSubmitManage(formData: any) {
    const fileToUpdate: IFile = { ...formData, isActive: formData.isActive.state, isAcceptingResponses: formData.isAcceptingResponses.state, numRequiredResponses: parseInt(formData.numRequiredResponses) };
    fileToUpdate.id = this.fileBeingManaged.id;

    try {
      const updatedFile = await this.fileService.updateFileAsAdmin(fileToUpdate);

      const index = this.projectFiles.findIndex(designPattern => {
        return designPattern.id === fileToUpdate.id;
      });

      // Refresh table data
      if (index >= 0) {
        this.projectFiles[index] = updatedFile;
        this.projectFiles = [...this.projectFiles];
      }

      this.managingFile = false;

      this.messageService.add({ severity: 'success', summary: 'File Updated', detail: `The file '${fileToUpdate.path}/${fileToUpdate.name}' has been successfully updated.` });

    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Update Error', detail: `Unable to update file. ${error.error?.message ?? error.message}` });

    } finally {
      this.manageInputForm.isLoading = false;
      this.manageInputForm.isEnabled = true;
    }
  }

  async onSubmitDelete(formData: any) {
    const projectToDelete: IProject = formData.name;

    try {
      await this.projectService.deleteProjectAsAdmin(projectToDelete);

      this.projects = this.projects.filter(project => {
        return project.id !== projectToDelete.id;
      });

      this.deletingProject = false;

      this.messageService.add({ severity: 'success', summary: 'Project Deleted', detail: `The project '${projectToDelete.name}' has been successfully deleted.` });

    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Submission Error', detail: `Unable to delete project. ${error.error?.message ?? error.message}` });

    } finally {
      this.deleteInputForm.isLoading = false;
      this.deleteInputForm.isEnabled = true;
    }
  }

  async onChangeProjectEnablement() {
    const valueToSet = this.checkbox.checked;

    const confirmation = confirm(`Are you sure you want to ${valueToSet ? 'enable' : 'disable'} the project "${this.currentProject?.name}"?`);

    if (!confirmation) {
      this.checkbox.checked = !this.checkbox.checked;
      return;
    }

    try {
      if (!this.currentProject){
        return;
      }

      this.currentProject.isActive = this.checkbox.checked;

      await this.projectService.updateProjectAsAdmin(this.currentProject);

      this.messageService.add({ severity: 'success', summary: 'Project Enablement Setting Changed', detail: `The project "${this.currentProject?.name}" is now ${valueToSet ? 'enabled' : 'disabled'}.` });

    } catch (error) {
      this.checkbox.checked = !this.checkbox.checked;
      this.messageService.add({ severity: 'error', summary: 'Project Enablement Change Error', detail: `Unable to change project enablement setting. ${error.error?.message ?? error.message}` });
    }
  }

  onProjectRowClicked(row: IProject) {
    this.projectFiles = [];
    this.currentProject = row;

    this.showFiles = true;

    this.projectFiles = [...row.files];
    this.filesLoading = false;
  }

  onFileRowClicked(row: IFile) {
    this.onManageFile(row);
  }

  async onManageFile(file: IFile) {
    this.manageInputForm.clearForm();

    this.manageFormInputFields = await this.getManageFormInputFields(file.isActive, file.isAcceptingResponses, file.numRequiredResponses);
    this.fileBeingManaged = file;
    this.managingFile = true;
  }

  onBackToAllProjects() {
    this.projectFiles = [];
    this.currentProject = null;
    this.showFiles = false;
  }

  getDeletableProjects() {
    const deletableProjects = this.projects.filter(project => {
      return project.files == null || project.files.length == 0;
    });

    return deletableProjects;
  }

  async onSelect(fileSelectionEvent: any) {
    this.resetUploadButton();
    this.filesToUpload = [];
    this.filesRejectedForUpload = [];

    // Specify default file upload settings
    let isEnabledSetting = true;
    let isAcceptingResponsesSetting = true;
    let numResponsesRequiredSetting = 3;
    
    // Fetch current file upload settings
    try {
      isEnabledSetting = (await this.optionService.getDefaultAreUploadedFilesEnabledAsAdmin()).value;
    } catch {}
    
    try {
      isAcceptingResponsesSetting = (await this.optionService.getDefaultAreUploadedFilesAcceptingResponsesAsAdmin()).value;
    } catch {}
    
    try {
      numResponsesRequiredSetting = (await this.optionService.getDefaultUploadedFilesNumRequiredResponsesAsAdmin()).value;
    } catch {}

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    this.fileUploaderButton.clear();

    if (!fileSelectionEvent || fileSelectionEvent.currentFiles.length != 1) {
      this.messageService.add({ severity: 'error', summary: 'Upload Error', detail: `Upload must have exactly one zip file.` });
      return;
    }

    try {
      this.uploadedZip = await JSZip.loadAsync(fileSelectionEvent.currentFiles[0]);
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Upload Error', detail: `Only valid .zip files are accepted for upload.` });
      return;
    }

    this.zipSelected = true;

    this.uploadedZip.forEach((relativePath, file) => {
      if (file.dir) {
        return;
      }

      // Split path of current file into its constituents.
      let identifiedProject = '';
      let identifiedPath = '';
      let identifiedFileName = '';

      const splitPath = relativePath.split('/');

      if (splitPath.length > 2) {
        identifiedProject = splitPath[0];
        identifiedPath = splitPath.slice(1, -1).join('/');
        identifiedFileName = splitPath[splitPath.length - 1];
      }
      else if (splitPath.length == 2) {
        identifiedProject = splitPath[0];
        identifiedFileName = splitPath[1];
      }
      else if (splitPath.length == 1) {
        identifiedFileName = splitPath[0];
      }

      // Validate each file.
      let valid = true;
      const rejectionReasons: string[] = [];

      if (!identifiedFileName.endsWith('.java')) {
        valid = false;
        rejectionReasons.push('File is not of .java extension');
      }

      if (identifiedProject !== this.currentProject?.name) {
        valid = false;
        rejectionReasons.push('File is not in a root directory of the same name as the project');
      }

      const fileEntry: FileEntry = {
        fullPath: relativePath,
        project: identifiedProject,
        path: identifiedPath,
        fileName: identifiedFileName,
        isEnabled: isEnabledSetting,
        isAcceptingResponses: isAcceptingResponsesSetting,
        numResponsesRequired: numResponsesRequiredSetting,
        valid: valid,
        selectedForUpload: valid,
        rejectionReasons: rejectionReasons
      }

      if (fileEntry.valid) {
        this.filesToUpload.push(fileEntry);
      } else {
        this.filesRejectedForUpload.push(fileEntry);
      }
    });

    // Handle no valid files to upload.
    this.selectedForUploadCount = this.filesToUpload.length;
  }

  onPendingFileClicked(file: FileEntry) {
    for (const currentFile of this.filesToUpload) {
      if (currentFile.fullPath === file.fullPath) {
        currentFile.selectedForUpload = !currentFile.selectedForUpload;

        if (currentFile.selectedForUpload) {
          this.selectedForUploadCount++;
        } else {
          this.selectedForUploadCount--;
        }
      }
    }

    this.filesToUpload = [...this.filesToUpload];
  }

  async onUploadProjectFiles() {
    this.isUploadingZip = true;
    this.buttonIcon = this.BUTTON_SPINNING_FONT;

    for (const rejectedFile of this.filesRejectedForUpload) {
      this.uploadedZip = this.uploadedZip.remove(rejectedFile.fullPath);
    }

    for (const pendingFile of this.filesToUpload) {
      if (!pendingFile.selectedForUpload) {
        this.uploadedZip = this.uploadedZip.remove(pendingFile.fullPath);
      }
    }

    this.buttonText = this.BUTTON_PROCESSING_TEXT;
    const newZip = await this.uploadedZip.generateAsync({ type: 'blob' });
    this.buttonText = `Uploading... (0% done)`;

    if (this.currentProject) {
      (await this.projectService.addProjectFilesAsAdmin(this.currentProject, newZip)).subscribe(resp => {

        if (resp.type === HttpEventType.Response) {
          this.buttonText = `Upload complete`;
          this.zipSelected = false;
          this.messageService.add({ severity: 'success', summary: 'Upload Complete', detail: `Project files have been uploaded and is being processed by the server. This might take a while, so please check back later. Upload job ID: ${resp.body.jobId}`, life: 5000 });
        }
        if (resp.type === HttpEventType.UploadProgress) {
          if (resp.total) {
            const percentDone = Math.round(100 * resp.loaded / resp.total);
            this.buttonText = `Uploading... (${percentDone}% done)`;
          }
        }
      },
      (error)=>{
        this.messageService.add({ severity: 'error', summary: 'Upload Error', detail: `Unable to upload project files. ${error.error?.message ?? error.message}`, life: 5000 });
        this.resetUploadButton();
      });
    }
  }

  private resetUploadButton() {
    this.isUploadingZip = false;
    this.buttonIcon = this.BUTTON_READY_FONT;
    this.buttonText = this.BUTTON_READY_TEXT;
  }
}

interface FileEntry {
  fullPath: string;
  project: string;
  path: string;
  fileName: string;
  valid: boolean;
  selectedForUpload: boolean;
  rejectionReasons: string[];
  isEnabled?: boolean;
  isAcceptingResponses?: boolean;
  numResponsesRequired?: number;
}
