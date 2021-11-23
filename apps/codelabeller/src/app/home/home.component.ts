import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IDesignPattern, IResponse } from '@codelabeller/api-interfaces';
import { MessageService, TreeNode } from 'primeng/api';
import { Subscription } from 'rxjs';
import { AuthService } from '../../modules/auth/auth.service';
import { SourceFile } from '../../modules/code-viewer/source-file.interface';
import { DropdownBuilder } from '../../modules/input-form/input-field-builders/dropdown.builder';
import { SliderBuilder } from '../../modules/input-form/input-field-builders/slider.builder';
import { TextBoxBuilder } from '../../modules/input-form/input-field-builders/text-box.builder';
import { InputField } from '../../modules/input-form/input-fields/input-field';
import { NavigationComponent } from '../../modules/navigation/navigation.component';
import { ResponseAreaComponent } from '../../modules/response-area/response-area.component';
import { ResponseState } from '../../modules/response-area/response-state.enum';
import { DesignPatternService } from '../../services/design-pattern/design-pattern.service';
import { FileService } from '../../services/file/file.service';
import { PageService } from '../../services/page/page.service';
import { ProjectNavigationTreeService } from '../../services/project-navigation-tree/project-navigation-tree.service';
import { ResponseService } from '../../services/response/response.service';
import { SubmissionStatus } from '../../services/response/submission-status.enum';

@Component({
  selector: 'codelabeller-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild(NavigationComponent) navigationComponent !: NavigationComponent;
  @ViewChild(ResponseAreaComponent) responseAreaComponent !: ResponseAreaComponent;

  private currentFileSubscription!: Subscription;
  private currentFileSubscription2!: Subscription;
  private hasRespondedToAllSubscription!: Subscription;
  private currentProjectTreeSubscription!: Subscription;

  private _sideNavVisible = true;
  private _explanationRequired = false;

  readonly newResponseInfoText = 'Changes are auto-saved (but not auto-submitted).';
  readonly updateResponseInfoText = 'Changes are <b>NOT</b> auto-saved and will be lost on file change';

  currentSourceFile !: SourceFile | undefined;
  inputFields: InputField[] = [];

  files: TreeNode[] = [];

  constructor(
    public fileService: FileService,
    public projectNavigationTreeService: ProjectNavigationTreeService,
    public designPatternService: DesignPatternService,
    private responseService: ResponseService,
    public authService: AuthService,
    private pageService: PageService,
    private messageService: MessageService,
    private route: ActivatedRoute
  ) {
    this.pageService.setTitle('Home');
  }

  async ngAfterViewInit() {
    const fileId = this.route.snapshot.params.fileId;

    if (fileId) {
      await this.fileService.setActiveFile(fileId);

    } else {
      await this.fileService.getNextAssignedFile();
    }

    this.inputFields = await this.getInputFields();

    // Watch for current file changes and show messages / source code accordingly.
    this.currentFileSubscription = this.fileService.currentFile$.subscribe(file => {
      if (!file) {
        this.currentSourceFile = undefined;
        return;
      }

      this.currentSourceFile = {
        path: file.path,
        name: file.name,
        source: file.source
      };
    });

    this.hasRespondedToAllSubscription = this.fileService.hasRespondedToAllFiles$.subscribe(state => {
      if (state) {
        this.messageService.clear();
        this.messageService.add({
          severity: 'success',
          sticky: true,
          summary: 'No more files available',
          detail: `You have submitted responses for all available files. Thank you for your time and participation! You may still view and edit your previous responses at any time.`
        });
      }
    });

    this.currentFileSubscription2 = this.fileService.currentFile$.subscribe(async (file) => {
      if (this.fileService.hasRespondedToAllFiles$.value) {
        this.responseAreaComponent?.setResponseState(ResponseState.NOT_ALLOWED);
        return;
      }

      if (this.fileService.hasSubmittedCurrentFile$.value) {
        this.responseAreaComponent?.setResponseState(ResponseState.SUBMITTED);

        // Responses are only locally saved for files which the user has not submitted a response for, yet.
        // Data for existing responses will always be fetched from server each time they are viewed.
        if (file) {
          this.responseService.clearLocalResponse(this.authService.getUserEmail(), file?.id)
          const response = await this.responseService.getRemoteResponse(file?.id);
          this.responseAreaComponent?.restoreForm(response);
        }

        return;

      } else if (!this.fileService.canSubmitCurrentFile$.value) {
        this.responseAreaComponent?.setResponseState(ResponseState.NOT_ALLOWED);
        return;

      } else {
        this.responseAreaComponent?.setResponseState(ResponseState.UNSUBMITTED);
      }

      // Also, if the file has not been responded to yet, restore the responses area with a saved copy local response, if any.
      this.responseAreaComponent?.clearForm();

      if (!file) {
        return;
      }

      const localResponse = await this.responseService.getLocalResponse(this.authService.getUserEmail(), file.id);
      if (localResponse) {
        this.responseAreaComponent.restoreForm(localResponse);
      }
    });

    this.currentProjectTreeSubscription = this.projectNavigationTreeService.currentProjectTree$.subscribe(tree => {
      this.files = tree;
    })
  }

  ngOnDestroy(): void {
    this.currentFileSubscription?.unsubscribe();
    this.currentFileSubscription2?.unsubscribe();
    this.hasRespondedToAllSubscription?.unsubscribe();
    this.currentProjectTreeSubscription?.unsubscribe();
  }

  toggleSideNav() {
    this._sideNavVisible = !this._sideNavVisible;
    if (this._sideNavVisible) {
      this.navigationComponent.showSideNav();
    } else {
      this.navigationComponent.hideSideNav();
    }
  }

  async onBackToCurrentFile() {
    await this.fileService.getNextAssignedFile();
  }

  async onFileSelected(fileId: string) {
    await this.fileService.setActiveFile(fileId);
  }

  onResponseChange(response: IResponse) {
    const currentFile = this.fileService.currentFile$.value;

    if (!currentFile) {
      return;
    }

    // Only save working copies of responses when user has not submitted a response for the file,
    // i.e. not updating their previously submitted response.
    if (!this.fileService.hasSubmittedCurrentFile$.value) {
      this.responseService.storeLocalResponse(this.authService.getUserEmail(), currentFile.id, response);
    }

    this.configurePatternExplanationField(response);
  }

  async onResponseSubmit(response: IResponse) {
    try {
      const submissionStatus = await this.responseService.submitResponse(response);

      if (submissionStatus == SubmissionStatus.FAILED) {
        throw new Error('No file is currently selected.');
      }

      this.responseAreaComponent.responseState = ResponseState.SUBMITTED;

      // Show success message
      const outcome = submissionStatus == SubmissionStatus.CREATED ? 'created' : 'updated';
      this.messageService.add({ severity: 'success', summary: 'Submission Success', detail: `Your response has been successfully ${outcome}.` })

      // Restore form to disable submission button.
      this.responseAreaComponent.restoreForm(response);

      // Move user to next file automatically if they were not updating an existing response.
      // Clear the local stored copy of the response as it is no longer needed.
      if (submissionStatus == SubmissionStatus.CREATED) {

        const currentFile = this.fileService.currentFile$.value;
        if (currentFile) {
          this.responseService.clearLocalResponse(this.authService.getUserEmail(), currentFile.id);
        }

        this.fileService.hasSubmittedCurrentFile$.next(true);
        this.fileService.getNextAssignedFile();
      }
    } catch (error) {
      // Display error toast
      this.messageService.add({ severity: 'error', summary: 'Submission Error', detail: `Unable to submit response. ${error.error?.message ?? error.message}` })

    } finally {
      // Put form back into ready state again.
      this.responseAreaComponent.isLoading = false;
      this.responseAreaComponent.isEnabled = true;
    }
  }

  async getInputFields() {
    let patterns: IDesignPattern[] = [];

    try {
      patterns = await this.designPatternService.getDesignPatterns()
    } catch (error) {
      // Treat an error here as if no patterns are available.
    }

    return [
      new DropdownBuilder()
        .name('designPattern')
        .displayName('Design Pattern')
        .defaultValue(null)
        .prompt('What design pattern is this?')
        .data(patterns)
        .displayKey('name')
        .required(true)
        .validators([Validators.required])
        .build(),

      new TextBoxBuilder()
        .name('patternExplanation')
        .displayName('Design Pattern Explanation')
        .defaultValue(null)
        .prompt('If you wish, please explain why you have chosen the pattern? (optional)')
        .numRowsToShow(3)
        .required(false)
        .validators([Validators.maxLength(1000)])
        .build(),

      new SliderBuilder()
        .name('confidenceRating')
        .displayName('Confidence Rating')
        .defaultValue(-1)
        .prompt('How confident are you, on a scale of 0 to 5?')
        .minValue(-1)
        .maxValue(5)
        .increment(1)
        .required(true)
        .validators([Validators.required, Validators.min(0)])
        .build(),

      new TextBoxBuilder()
        .name('ratingExplanation')
        .defaultValue(null)
        .prompt('If you wish, please explain why you have given the rating? (optional)')
        .numRowsToShow(3)
        .required(false)
        .validators([Validators.maxLength(1000)])
        .build(),

      new TextBoxBuilder()
        .name('summary')
        .displayName('Summary')
        .defaultValue(null)
        .prompt('Write a 2-3 sentence summary of what the code in the file does.')
        .numRowsToShow(3)
        .required(true)
        .validators([Validators.required, Validators.maxLength(1000)])
        .build(),

      new TextBoxBuilder()
        .name('notes')
        .defaultValue(null)
        .prompt('General notes about the source code (optional)')
        .numRowsToShow(3)
        .required(false)
        .validators([Validators.maxLength(1000)])
        .build(),
    ]
  }

  async configurePatternExplanationField(currentResponse: IResponse) {
    if (currentResponse.designPattern && currentResponse.designPattern.explanationRequired !== this._explanationRequired) {
      this._explanationRequired = currentResponse.designPattern.explanationRequired

      const patternExplanation = this.responseAreaComponent.inputFormComponent.formFieldControlMapping['patternExplanation'];
      patternExplanation.inputField.required = this._explanationRequired;

      const prompt = `${this._explanationRequired ? 'P' : 'If you wish, p'}lease explain why you have chosen the pattern?${this._explanationRequired ? '' : ' (optional)'}`;
      patternExplanation.inputField.prompt = prompt;

      const patternExplanationControl = patternExplanation.formControl;

      const validators = [Validators.maxLength(1000)];
      if (this._explanationRequired) {
        validators.push(Validators.required);
      }

      patternExplanationControl.setValidators(validators);
      patternExplanationControl.updateValueAndValidity();
    }
  }
}
