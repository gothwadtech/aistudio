import { GrixFileNode } from "../../../types/github";

// Flat file extractor to map workspace file structure to plain paths
export function getFlatFilePaths(nodes: GrixFileNode[]): string[] {
  const paths: string[] = [];
  function recurse(list: GrixFileNode[]) {
    for (const node of list) {
      if (node.type === "file") {
        paths.push(node.path);
      } else if (node.type === "dir" && node.children) {
        recurse(node.children);
      }
    }
  }
  recurse(nodes);
  return paths;
}
