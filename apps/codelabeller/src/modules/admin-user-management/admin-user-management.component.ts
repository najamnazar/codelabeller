import { DatePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { IFile, IUser } from '@codelabeller/api-interfaces';
import { TableColumn } from '../data-table/table-column.interface';
import { UserService } from '../../services/user/user.service';
import { InputFormComponent } from '../input-form/input-form.component';
import { TextBoxBuilder } from '../input-form/input-field-builders/text-box.builder';
import { Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DropdownBuilder } from '../input-form/input-field-builders/dropdown.builder';
import { InputField } from '../input-form/input-fields/input-field';
import { OptionService } from '../../services/option/option.service';
import { Checkbox } from 'primeng/checkbox';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'codelabeller-admin-user-management',
  templateUrl: './admin-user-management.component.html',
  styleUrls: ['./admin-user-management.component.scss']
})
export class AdminUserManagementComponent {
  @ViewChild('addInputForm') addInputForm!: InputFormComponent<IUser>;
  @ViewChild('manageInputForm') manageInputForm!: InputFormComponent<IUser>;
  @ViewChild('deleteInputForm') deleteInputForm!: InputFormComponent<IUser>;
  @ViewChild('checkbox') checkbox!: Checkbox;

  readonly states = [
    { name: 'No', state: false },
    { name: 'Yes', state: true }
  ];

  allowUnlisted = true;
  loading = false;
  users: IUser[] = [];

  addingUser = false;
  managingUser = false;
  deletingUser = false;

  userBeingManaged!: IUser;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private optionService: OptionService,
    private messageService: MessageService,
    private datePipe: DatePipe
  ) {
    this.userService.getAllUsersAsAdmin().then(users => {
      this.users = users;
      this.loading = false;
    });

    this.optionService.getAllowUnlistedUsersAsAdmin().then(allowed => {
      this.allowUnlisted = allowed.value;
    }).catch(() => {
      this.allowUnlisted = false;
    });
  }

  columns: TableColumn[] = [
    {
      field: 'email',
      header: 'Email',
      filterType: 'text',
    },
    {
      field: 'givenName',
      header: 'Given Name',
      filterType: 'text',
    },
    {
      field: 'familyName',
      header: 'Family Name',
      filterType: 'text',
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
      field: 'isAdmin',
      header: 'Admin?',
      filterType: 'text',
      dataTransformer: (data: boolean) => {
        return data ? 'Yes' : 'No';
      }
    },
    {
      field: 'responseCount',
      header: 'Response Count',
      filterType: 'numeric',
    },
    {
      field: 'currentFile',
      header: 'Current File',
      filterType: 'text',
      dataTransformer: (data: IFile) => {
        if (!data || !data.project) {
          return '';
        }

        return `${data.project.name}/${data.path}/${data.name}`;
      }
    },
    {
      field: 'timeCreated',
      header: 'Join Date',
      filterType: 'date',
      dataTransformer: (data: Date) => {
        return this.datePipe.transform(data, 'dd/MM/yy h:mm:ss a') ?? '';
      }
    },
    {
      field: 'lastSeen',
      header: 'Last Seen',
      filterType: 'date',
      dataTransformer: (data: Date) => {
        return this.datePipe.transform(data, 'dd/MM/yy h:mm:ss a') ?? '';
      }
    },
  ];

  addFormInputFields = [
    new TextBoxBuilder()
      .name('email')
      .displayName("Email")
      .defaultValue(null)
      .prompt('Please enter the new user\'s email address.')
      .numRowsToShow(1)
      .required(true)
      .validators([Validators.required, Validators.email])
      .build(),

    new TextBoxBuilder()
      .name('givenName')
      .displayName("Given Name")
      .defaultValue(null)
      .prompt('Please enter the new user\'s given name.')
      .numRowsToShow(1)
      .required(true)
      .validators([Validators.required])
      .build(),

    new TextBoxBuilder()
      .name('familyName')
      .displayName("Family Name")
      .defaultValue(null)
      .prompt('Please enter the new user\'s family name.')
      .numRowsToShow(1)
      .required(true)
      .validators([Validators.required])
      .build(),

    new DropdownBuilder()
      .name('isEnabled')
      .displayName("Is Enabled")
      .defaultValue({ name: 'Yes', state: true })
      .prompt('Should the new user be automatically enabled?')
      .data([
        { name: 'No', state: false },
        { name: 'Yes', state: true }
      ])
      .displayKey('name')
      .required(true)
      .validators([Validators.required])
      .build(),

    new DropdownBuilder()
      .name('isAdmin')
      .displayName("Is Admin")
      .defaultValue({ name: 'No', state: false })
      .prompt('Should the new user be an admin?')
      .data([
        { name: 'No', state: false },
        { name: 'Yes', state: true }
      ])
      .displayKey('name')
      .required(true)
      .validators([Validators.required])
      .build()
  ]

  manageFormInputFields: InputField[] = [];

  deleteFormInputFields: InputField[] = [];

  async getManageFormInputFields(
    givenName: string,
    familyName: string,
    userIsEnabled: boolean,
    userIsAdmin: boolean,
    enabledOptionDisabled: boolean,
    adminOptionDisabled: boolean
  ) {
    const isEnabled = userIsEnabled ? this.states[1] : this.states[0];
    const isAdmin = userIsAdmin ? this.states[1] : this.states[0];

    return [
      new TextBoxBuilder()
        .name('givenName')
        .displayName("Given Name")
        .defaultValue(givenName)
        .prompt('Given name')
        .numRowsToShow(1)
        .required(true)
        .validators([Validators.required])
        .build(),

      new TextBoxBuilder()
        .name('familyName')
        .displayName("Family Name")
        .defaultValue(familyName)
        .prompt('Family name')
        .numRowsToShow(1)
        .required(true)
        .validators([Validators.required])
        .build(),

      new DropdownBuilder()
        .name('isEnabled')
        .displayName("Is Enabled")
        .defaultValue(isEnabled)
        .prompt('Is enabled (system access allowed)?')
        .data(this.states)
        .displayKey('name')
        .required(true)
        .disabled(enabledOptionDisabled)
        .validators([Validators.required])
        .build(),

      new DropdownBuilder()
        .name('isAdmin')
        .displayName("Is Admin")
        .defaultValue(isAdmin)
        .prompt('Is admin?')
        .data(this.states)
        .displayKey('name')
        .required(true)
        .disabled(adminOptionDisabled)
        .validators([Validators.required])
        .build()
    ]
  }

  async getDeleteFormInputFields() {
    return [
      new DropdownBuilder()
        .name('email')
        .displayName("User")
        .defaultValue(null)
        .prompt('Please select a user to delete.')
        .data(this.getDeletableUsers())
        .displayKey('email')
        .required(true)
        .validators([Validators.required])
        .build()
    ]
  }

  onRowClicked(row: IUser) {
    this.onManageUser(row);
  }

  onAddUser() {
    this.addInputForm.clearForm();
    this.addingUser = true;
  }

  async onManageUser(user: IUser) {
    this.manageInputForm.clearForm();

    const enabledOptionDisabled = this.authService.getUserEmail() === user.email;
    const adminOptionDisabled = this.authService.getUserEmail() === user.email;

    this.manageFormInputFields = await this.getManageFormInputFields(user.givenName, user.familyName, user.isEnabled, user.isAdmin, enabledOptionDisabled, adminOptionDisabled);
    this.userBeingManaged = user;

    this.managingUser = true;
  }

  async onDeleteUser() {
    this.deleteInputForm.clearForm();
    this.deleteFormInputFields = await this.getDeleteFormInputFields();

    this.deletingUser = true;
  }

  async onSubmitAdd(formData: any) {
    const userToCreate: IUser = { ...formData, isEnabled: formData.isEnabled.state, isAdmin: formData.isAdmin.state };

    try {
      const createdUser = await this.userService.addUserAsAdmin(userToCreate);
      createdUser.responseCount = 0;

      this.users = [createdUser, ...this.users];
      this.addingUser = false;

      this.messageService.add({ severity: 'success', summary: 'User Created', detail: `The user '${userToCreate.email}' has been successfully created.` });

    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Creation Error', detail: `Unable to create user. ${error.error?.message ?? error.message}` });

    } finally {
      this.addInputForm.isLoading = false;
      this.addInputForm.isEnabled = true;
    }
  }

  async onSubmitManage(formData: any) {
    const userToUpdate: IUser = { ...formData, isEnabled: formData.isEnabled.state, isAdmin: formData.isAdmin.state };
    userToUpdate.id = this.userBeingManaged.id;
    userToUpdate.email = this.userBeingManaged.email;

    try {
      const updatedUser = await this.userService.updateUserAsAdmin(userToUpdate);

      const index = this.users.findIndex(user => {
        return user.id === userToUpdate.id;
      })

      // Refresh table data
      if (index >= 0) {
        this.users[index] = updatedUser;
        this.users = [...this.users];
      }

      this.managingUser = false;

      this.messageService.add({ severity: 'success', summary: 'User Updated', detail: `The user '${userToUpdate.email}' has been successfully updated.` });

    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Update Error', detail: `Unable to update user. ${error.error?.message ?? error.message}` });

    } finally {
      this.manageInputForm.isLoading = false;
      this.manageInputForm.isEnabled = true;
    }
  }

  async onSubmitDelete(formData: any) {
    const userToDelete: IUser = formData.email;

    try {
      await this.userService.deleteUserAsAdmin(userToDelete);

      this.users = this.users.filter(pattern => {
        return pattern.id !== userToDelete.id;
      });

      this.deletingUser = false;

      this.messageService.add({ severity: 'success', summary: 'User Deleted', detail: `The user '${userToDelete.email}' has been successfully deleted.` });

    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Deletion Error', detail: `Unable to delete user. ${error.error?.message ?? error.message}` });

    } finally {
      this.deleteInputForm.isLoading = false;
      this.deleteInputForm.isEnabled = true;
    }
  }

  getDeletableUsers() {
    const deletableUsers = this.users.filter(user => {
      return (user.responseCount == null || user.responseCount == 0) && user.email != this.authService.getUserEmail();
    });

    return deletableUsers;
  }

  async removeFileAssignment(user: IUser) {
    this.deleteInputForm.isLoading = true;
    this.deleteInputForm.isEnabled = false;

    const confirmation = confirm(
      `Are you sure you want to remove the file assignment for ${user.email}?\n\nThey will be automatically reassigned another file the next time they navigate to the home page.`
    );

    if (!confirmation) {
      return;
    }

    try {
      await this.userService.removeUserFileAssignmentAsAdmin(user);

      // Refresh table data
      user.currentFile = null as any;
      this.users = [...this.users];

      this.messageService.add({ severity: 'success', summary: 'File Assignment Removed', detail: `The file assignment for '${user.email}' has been successfully removed.` });

    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Removal Error', detail: `Unable to remove file assignment for user ${user.email}. ${error.error?.message ?? error.message}` });

    } finally {
      this.deleteInputForm.isLoading = false;
      this.deleteInputForm.isEnabled = true;
    }
  }

  async onChangeAllowUnlistedUsers() {
    const valueToSet = this.checkbox.checked;

    const confirmation = confirm(`Are you sure you want to ${valueToSet ? 'enable unlisted users to login (public access)' : 'disable unlisted users from logging in (private access)'}? Demo accounts will not be disabled from logging in.`);

    if (!confirmation) {
      this.checkbox.checked = !this.checkbox.checked;
      return;
    }

    try {
      await this.optionService.putAllowUnlistedUsersAsAdmin(valueToSet);

      this.messageService.add({ severity: 'success', summary: 'Unlisted Account Access', detail: `Unregistered users are now ${valueToSet ? 'able' : 'unable'} to login and access CodeLabeller.` });

    } catch (error) {
      this.checkbox.checked = !this.checkbox.checked;
      this.messageService.add({ severity: 'error', summary: 'Setting Change Error', detail: `Unable to change setting. ${error.error?.message ?? error.message}` });
    }
  }
}
