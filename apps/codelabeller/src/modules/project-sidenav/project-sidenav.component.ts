import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TreeNode } from 'primeng/api';

@Component({
  selector: 'codelabeller-project-sidenav',
  templateUrl: './project-sidenav.component.html',
  styleUrls: ['./project-sidenav.component.scss']
})
export class ProjectSidenavComponent {
  public selectedNode!: TreeNode;

  private _files!: TreeNode[];

  @Input() headerText!: string;
  @Input() emptyMessage!: string;
  @Input()
  get files(): TreeNode[] {
    return this._files;
  }

  set files(files: TreeNode[]) {
    this._files = files;

    // Expand the root node to show all folders when a project is set.
    for (const folder of this._files) {
      folder.expanded = true;
    }
  }

  @Output() selectedFile = new EventEmitter<string>();
  @Output() selectedFolder = new EventEmitter<string>();

  onNodeSelect(event: { originalEvent: Event, node: TreeNode }) {
    const currentNode = event.node;

    // Leaf nodes are files. 
    if (!currentNode.children) {
      this.selectedFile.emit(currentNode.data);
      return;
    }

    // Folder selection event should not be emitted if it is the root node,
    // as root node represents the project root and the view just shows one project at a time anyways.
    if (currentNode.parent && !currentNode.expanded) {
      this.selectedFolder.emit(currentNode.data);
    }

    // Clicking any node should cause its visibility to be toggled.
    currentNode.expanded = !currentNode.expanded;
  }

  onNodeExpand(event: { originalEvent: Event, node: TreeNode }) {
    const currentNode = event.node;

    // Folder selection event should not be emitted if it is the root node,
    // as root node represents the project root and the view just shows one project at a time anyways.
    if (currentNode.parent) {
      this.selectedFolder.emit(currentNode.data);
    }

    currentNode.expanded = true;
  }

  onNodeCollapse(event: { originalEvent: Event, node: TreeNode }) {
    const currentNode = event.node;
    currentNode.expanded = false;
  }
}
