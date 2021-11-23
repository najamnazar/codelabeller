import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IFile, IProject } from '@codelabeller/api-interfaces';
import { TreeNode } from 'primeng/api';
import { BehaviorSubject } from 'rxjs';
import { ConfigService } from '../config/config.service';
import { FileService } from '../file/file.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectNavigationTreeService {
  currentProjectTree$ = new BehaviorSubject<TreeNode[]>([]);

  constructor(private configService: ConfigService, private fileService: FileService, private http: HttpClient) {
    this.fileService.currentProject$.subscribe(async (project: IProject | null) => {
      if (!project) {
        return;
      }

      const treeNode = await this.buildRootProjectNode(project);
      this.currentProjectTree$.next([treeNode]);
    });
  }

  private async getFilesOfProjectFromRemoteDb(projectId: string): Promise<IFile[]> {
    // Get source code for file from remote DB and cache it locally.
    // await this.openFilesLocalDb();

    const project = await this.http.get<IFile[]>(`${await this.configService.getApiPrefix()}/project/${projectId}/files`).toPromise();
    // this.storeFileInLocalDb(file);

    return project;
  }

  private async buildRootProjectNode(project: IProject): Promise<TreeNode> {
    // Fetch project data.
    const files = await this.getFilesOfProjectFromRemoteDb(project.id);

    // Group files by path and build their individual TreeNode objects.
    const filesByPath: { [key: string]: TreeNode } = {};

    for (const file of files) {
      if (!filesByPath[file.path]) {
        filesByPath[file.path] = {
          label: file.path,
          data: file.path,
          expandedIcon: "fa fa-folder-open",
          collapsedIcon: "fa fa-folder",
          children: []
        } as TreeNode;
      }

      const fileNode = {
        label: file.name,
        data: file.id,
        icon: "fa fa-file-code",
        parent: filesByPath[file.path]
      } as TreeNode;

      filesByPath[file.path].children?.push(fileNode);
    }

    // Sort the path nodes.
    const paths = Object.values(filesByPath).sort((path1, path2) => {
      return path1.data.toLowerCase().localeCompare(path2.data.toLowerCase());
    });

    // Sort the file nodes.
    for (const path of paths) {
      path.children = path.children?.sort((path1: any, path2: any) => {
        if (path1 !== undefined && path2 !== undefined) {
          return path1.label?.toLowerCase().localeCompare(path2.label?.toLowerCase());
        }

        return 0;
      });
    }

    // Build the full project TreeNode.
    const rootProjectNode = {
      label: project.name,
      data: `proj-${project.id}`, // Data key stores ID of the project, use "proj-" prefix to differentiate between project ID and file ID.
      expandedIcon: "fa fa-folder-open",
      collapsedIcon: "fa fa-folder",
      children: paths
    } as TreeNode;

    // Expand the node for the path containing the current file so that users have a better navigation experience.
    rootProjectNode.expanded = true;

    if (rootProjectNode.children) {
      for (const path of rootProjectNode.children) {

        const currentFile = this.fileService.currentFile$.value;
        if (path.data === currentFile?.path) {
          path.expanded = true;
        }
      }
    }

    return rootProjectNode;
  }
}
