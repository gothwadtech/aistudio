import { GrixFileNode } from "../types/github";

export const updateTreeWithChildren = (
  tree: GrixFileNode[],
  path: string,
  children: GrixFileNode[]
): GrixFileNode[] => {
  return tree.map(node => {
    if (node.path === path) {
      return { ...node, children, isOpen: true, isLoaded: true };
    } else if (node.type === "dir" && node.children && path.startsWith(node.path)) {
      return {
        ...node,
        children: updateTreeWithChildren(node.children, path, children)
      };
    }
    return node;
  });
};

export const toggleDirectoryInTree = (
  tree: GrixFileNode[],
  path: string
): GrixFileNode[] => {
  return tree.map(node => {
    if (node.path === path) {
      return { ...node, isOpen: !node.isOpen };
    } else if (node.type === "dir" && node.children && path.startsWith(node.path)) {
      return {
        ...node,
        children: toggleDirectoryInTree(node.children, path)
      };
    }
    return node;
  });
};

export const updateFileNodeInTree = (
  tree: GrixFileNode[],
  path: string,
  updatedNode: GrixFileNode
): GrixFileNode[] => {
  return tree.map(node => {
    if (node.path === path) {
      return { ...node, ...updatedNode };
    } else if (node.type === "dir" && node.children) {
      return {
        ...node,
        children: updateFileNodeInTree(node.children, path, updatedNode)
      };
    }
    return node;
  });
};
