import { FlatTreeControl, NestedTreeControl } from '@angular/cdk/tree';

export class ExtendTreeControl<T> extends NestedTreeControl<T> {
  /**
   * Recursively expand all parents of the passed node.
   */

  expandParents(node: T) {
    this.expand(node);
    const parent = this.getParent(node);
    //this.expand(parent);

    // if (parent && this.getLevel(parent) > 0) {
    //   this.expandParents(parent);
    // }
  }


  /**
   * Iterate over each node in reverse order and return the first node that has a lower level than the passed node.
   */
  getParent(node: T) {
    const currentLevel = node['level'];

    const startIndex = this.dataNodes.indexOf(node);

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.dataNodes[i];
      if (node['parentId'] === currentNode['nodeId']) {
        this.getParent(currentNode);
        this.expand(currentNode);
      }

      if (currentNode['nodeId'] === '0') {
        this.expand(currentNode);
      }
    }
  }
  getTreeNodebyNodeId(nodeId: T) {
    let node;
    this.dataNodes.forEach(element => {
      if (nodeId === element['nodeId']) {
        node = element;
        return;
      }
    });
    return node;
  }
}

