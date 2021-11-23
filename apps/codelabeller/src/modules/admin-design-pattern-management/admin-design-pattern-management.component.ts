import { Component, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { IDesignPattern } from '@codelabeller/api-interfaces';
import { MessageService } from 'primeng/api';
import { DesignPatternService } from '../../services/design-pattern/design-pattern.service';
import { TableColumn } from '../data-table/table-column.interface';
import { DropdownBuilder } from '../input-form/input-field-builders/dropdown.builder';
import { TextBoxBuilder } from '../input-form/input-field-builders/text-box.builder';
import { InputField } from '../input-form/input-fields/input-field';
import { InputFormComponent } from '../input-form/input-form.component';

@Component({
  selector: 'codelabeller-admin-design-pattern-management',
  templateUrl: './admin-design-pattern-management.component.html',
  styleUrls: ['./admin-design-pattern-management.component.scss']
})
export class AdminDesignPatternManagementComponent {
  @ViewChild('addInputForm') addInputForm!: InputFormComponent<IDesignPattern>;
  @ViewChild('manageInputForm') manageInputForm!: InputFormComponent<IDesignPattern>;
  @ViewChild('deleteInputForm') deleteInputForm!: InputFormComponent<IDesignPattern>;

  readonly states = [
    { name: 'No', state: false },
    { name: 'Yes', state: true }
  ];

  allowUnlisted = false;
  loading = false;
  patterns: IDesignPattern[] = [];

  addingDesignPattern = false;
  managingDesignPattern = false;
  deletingDesignPattern = false;

  designPatternBeingManaged !: IDesignPattern;

  constructor(private designPatternService: DesignPatternService, private messageService: MessageService) {
    this.designPatternService.getAllDesignPatterns().then(patterns => {
      this.patterns = patterns;
      this.loading = false;
    });
  }

  columns: TableColumn[] = [
    {
      field: 'name',
      header: 'Pattern Name',
      filterType: 'text',
    },
    {
      field: 'responseCount',
      header: 'Response Count',
      filterType: 'numeric',
    },
    {
      field: 'isActive',
      header: 'Enabled?',
      filterType: 'text',
      dataTransformer: (data: boolean) => {
        if (data == undefined) {
          return '';
        }

        return data ? 'Yes' : 'No';
      }
    },
    {
      field: 'explanationRequired',
      header: 'Explanation Required?',
      filterType: 'text',
      dataTransformer: (data: boolean) => {
        if (data == undefined) {
          return '';
        }

        return data ? 'Yes' : 'No';
      }
    }
  ];

  addFormInputFields = [
    new TextBoxBuilder()
      .name('name')
      .displayName("Design Pattern Name")
      .defaultValue(null)
      .prompt('Please enter a design pattern name.')
      .numRowsToShow(1)
      .required(true)
      .validators([Validators.required])
      .build(),
    new DropdownBuilder()
      .name('isActive')
      .displayName("Is Enabled?")
      .defaultValue({ name: 'Yes', state: true })
      .prompt('Should this new design pattern be enabled?')
      .data([
        { name: 'Yes', state: true },
        { name: 'No', state: false }
      ])
      .displayKey('name')
      .required(true)
      .validators([Validators.required])
      .build(),
    new DropdownBuilder()
      .name('explanationRequired')
      .displayName("Explanation Required?")
      .defaultValue({ name: 'Yes', state: true })
      .prompt('Should this new design pattern require an explanation if selected?')
      .data([
        { name: 'Yes', state: true },
        { name: 'No', state: false }
      ])
      .displayKey('name')
      .required(true)
      .validators([Validators.required])
      .build()
  ]

  manageFormInputFields: InputField[] = [];

  async getManageFormInputFields(
    name: string,
    designPatternExplanationRequired: boolean,
    designPatternIsEnabled: boolean,
  ) {
    const isExplanationRequired = designPatternExplanationRequired ? this.states[1] : this.states[0];
    const isEnabled = designPatternIsEnabled ? this.states[1] : this.states[0];

    return [
      new TextBoxBuilder()
        .name('name')
        .displayName("Design Pattern Name")
        .defaultValue(name)
        .prompt('Please enter a design pattern name.')
        .numRowsToShow(1)
        .required(true)
        .validators([Validators.required])
        .build(),

      new DropdownBuilder()
        .name('isActive')
        .displayName("Is Enabled")
        .defaultValue(isEnabled)
        .prompt('Is enabled?')
        .data(this.states)
        .displayKey('name')
        .required(true)
        .validators([Validators.required])
        .build(),

      new DropdownBuilder()
        .name('explanationRequired')
        .displayName("Is Explanation Required")
        .defaultValue(isExplanationRequired)
        .prompt('Is an explanation required when selecting this design pattern?')
        .data(this.states)
        .displayKey('name')
        .required(true)
        .validators([Validators.required])
        .build()
    ]
  }

  deleteFormInputFields: InputField[] = [];

  async getDeleteFormInputFields() {
    return [
      new DropdownBuilder()
        .name('name')
        .displayName("Design Pattern")
        .defaultValue(null)
        .prompt('Please select a design pattern to delete.')
        .data(this.getDeletableDesignPatterns())
        .displayKey('name')
        .required(true)
        .validators([Validators.required])
        .build()
    ]
  }

  async onRowClicked(row: IDesignPattern) {
    this.onManageDesignPattern(row);
  }

  onAddDesignPattern() {
    this.addInputForm.clearForm();
    this.addingDesignPattern = true;
  }

  async onDeleteDesignPattern() {
    this.deleteInputForm.clearForm();
    this.deleteFormInputFields = await this.getDeleteFormInputFields();

    this.deletingDesignPattern = true;
  }

  async onManageDesignPattern(designPattern: IDesignPattern) {
    this.manageInputForm.clearForm();

    this.manageFormInputFields = await this.getManageFormInputFields(designPattern.name, designPattern.explanationRequired, designPattern.isActive);
    this.designPatternBeingManaged = designPattern;

    this.managingDesignPattern = true;
  }

  async onSubmitAdd(formData: any) {
    const designPatternToCreate: IDesignPattern = { ...formData, explanationRequired: formData.explanationRequired.state, isActive: formData.isActive.state };

    try {
      const createdDesignPattern = await this.designPatternService.addDesignPatternAsAdmin(designPatternToCreate);
      createdDesignPattern.responses = [];
      createdDesignPattern.responseCount = 0;

      this.patterns = [createdDesignPattern, ...this.patterns];
      this.addingDesignPattern = false;

      this.messageService.add({ severity: 'success', summary: 'Project Created', detail: `The project '${designPatternToCreate.name}' has been successfully created.` });

    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Submission Error', detail: `Unable to create project. ${error.error?.message ?? error.message}` });

    } finally {
      this.addInputForm.isLoading = false;
      this.addInputForm.isEnabled = true;
    }
  }

  async onSubmitManage(formData: any) {
    const designPatternToUpdate: IDesignPattern = { ...formData, explanationRequired: formData.explanationRequired.state, isActive: formData.isActive.state };
    designPatternToUpdate.id = this.designPatternBeingManaged.id;

    try {
      const updatedDesignPattern = await this.designPatternService.updateDesignPatternAsAdmin(designPatternToUpdate);

      const index = this.patterns.findIndex(designPattern => {
        return designPattern.id === designPatternToUpdate.id;
      })

      // Refresh table data
      if (index >= 0) {
        this.patterns[index] = updatedDesignPattern;
        this.patterns = [...this.patterns];
      }

      this.managingDesignPattern = false;

      this.messageService.add({ severity: 'success', summary: 'Design Pattern Updated', detail: `The design pattern '${designPatternToUpdate.name}' has been successfully updated.` });

    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Update Error', detail: `Unable to update design pattern. ${error.error?.message ?? error.message}` });

    } finally {
      this.manageInputForm.isLoading = false;
      this.manageInputForm.isEnabled = true;
    }
  }

  async onSubmitDelete(formData: any) {
    const designPatternToDelete: IDesignPattern = formData.name;

    try {
      await this.designPatternService.deleteDesignPatternAsAdmin(designPatternToDelete);

      this.patterns = this.patterns.filter(pattern => {
        return pattern.id !== designPatternToDelete.id;
      });

      this.deletingDesignPattern = false;

      this.messageService.add({ severity: 'success', summary: 'Design Pattern Deleted', detail: `The design pattern '${designPatternToDelete.name}' has been successfully deleted.` });

    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Deletion Error', detail: `Unable to delete design pattern. ${error.error?.message ?? error.message}` });

    } finally {
      this.deleteInputForm.isLoading = false;
      this.deleteInputForm.isEnabled = true;
    }
  }

  getDeletableDesignPatterns() {
    const deletableDesignPatterns = this.patterns.filter(pattern => {
      return pattern.responseCount == null || pattern.responseCount == 0;
    });

    return deletableDesignPatterns;
  }
}
