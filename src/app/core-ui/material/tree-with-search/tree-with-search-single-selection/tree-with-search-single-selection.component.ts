import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Input, Output, OnInit, EventEmitter, AfterViewInit, OnDestroy } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Log } from 'ng2-logger';
import { ItemFlatNode } from 'app/core-ui/material/tree-with-search/model/item-flat-node';
import { ItemNode } from 'app/core-ui/material/tree-with-search/model/item-node';
import { ChecklistDatabaseService } from 'app/core-ui/material/tree-with-search/checklist-database.service';
import { takeWhile } from 'rxjs/operators';
import { Category } from 'app/core/market/api/category/category.model';

@Component({
  selector: 'app-tree-with-search-single-selection',
  templateUrl: './tree-with-search-single-selection.component.html',
  styleUrls: ['./tree-with-search-single-selection.component.scss']
})
export class TreeWithSearchSingleSelectionComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroyed: boolean = false;

  log: any = Log.create('tree-with-search-single-selection');
  @Input() options: any = [];
  @Input() selected: ItemFlatNode | Category;
  @Output() onChange: EventEmitter<any> = new EventEmitter<any>();
  defaultSelected: ItemFlatNode | Category;
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap: any = new Map<ItemFlatNode, ItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap: any = new Map<ItemNode, ItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: ItemFlatNode | null = null;

  /** The new item's name */
  newItemName: string = '';

  treeControl: FlatTreeControl<ItemFlatNode>;

  treeFlattener: MatTreeFlattener<ItemNode, ItemFlatNode>;

  dataSource: MatTreeFlatDataSource<ItemNode, ItemFlatNode>;

  /** The selection for checklist */
  checklistSelection: any = new SelectionModel<ItemFlatNode>();

  constructor(private database: ChecklistDatabaseService) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<ItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    database.dataChange.pipe(takeWhile(() => !this.destroyed)).subscribe(data => {
      this.dataSource.data = data;
    });

  }

  ngOnInit() {
    if (this.options) {
      this.database.initialize(this.options);
      this.defaultSelected = this.selected;
    } else {
      this.log.d('category options are not available');
    }
  }

  ngAfterViewInit() {
    if (this.selected) {
      // open the parent node from which the child is selected if any.
      document.getElementById(`node-${this.selected['parent']['id']}`).click();
    }
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  getLevel = (node: ItemFlatNode) => node.level;

  isExpandable = (node: ItemFlatNode) => node.expandable;

  getChildren = (node: ItemNode): ItemNode[] => node.children;

  hasChild = (_: number, _nodeData: ItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: ItemFlatNode) => _nodeData.item === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: ItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item
      ? existingNode
      : new ItemFlatNode();

    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.id = node.id;
    flatNode.expandable = !!node.children;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  /* Get the parent node of a node */
  getParentNode(node: ItemFlatNode): ItemFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: ItemFlatNode): void {
    if (!this.defaultSelected || this.defaultSelected.id !== node.id) {
      this.checklistSelection.toggle(node);
    }

    this.defaultSelected = null;
    if (this.checklistSelection.isSelected(node)) {
      const parent = this.getParentNode(node);
      node['parent'] = parent;
      this.onChange.emit(node);
    } else {
      this.onChange.emit(null);
    }
  }

}
