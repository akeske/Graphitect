/** @format */

import { Injectable } from '@angular/core';
import { GraphEdge } from '../models/graph/edge';
import { GraphNode } from '../models/graph/node';

@Injectable({
  providedIn: 'root',
})
export class GraphFunction {
  groupNodes: Map<string, GraphNode> = new Map();

  parseApplicationLine(line: string, index: number): GraphNode {
    // const appRegex = /application\s+(\w+):(\w+)/;
    // const appRegex = /^application\s+(.+?):(.+)$/;
    const appRegex = /^application\s+(.+?)(?::(.+))?$/;
    const match = RegExp(appRegex).exec(line);

    if (!match) {
      console.warn('Invalid application line:', line);
      throw new Error(`Invalid application line: ${line}`);
    }
    const id = match?.[1] ?? `node${index}`;
    const color = match?.[2] ?? 'blue';
    console.error('---------------');
    console.log('Parsed application:', { match });

    return new GraphNode({
      id: id.toLowerCase(),
      label: id,
      color: ['blue', 'red', 'green', 'yellow', 'purple', 'orange'].includes(color)
        ? (color as 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'orange')
        : 'blue',
      type: 'group',
    });
  }

  parseNodeLine(
    line: string,
    applicationNode: GraphNode,
    index: number
  ): { childNode: GraphNode; parentNode?: GraphNode } {
    const argRegex = /-(\w+)="([^"]+)"/g;
    const matchAttrs: any = {};
    let match;
    let parentNode: GraphNode | undefined = undefined;

    while ((match = argRegex.exec(line)) !== null) {
      matchAttrs[match[1]] = match[2];
    }

    // Remove "participant" or "node" prefix first
    let cleanLine = line.replace(/^participant\s+|^node\s+/, '').trim();

    // Find the id(label) first
    const idLabelRegex = /^(\w+)(?:\(([^)]+)\))?/;
    const idLabelMatch = RegExp(idLabelRegex).exec(cleanLine);
    if (!idLabelMatch) {
      throw new Error(`Invalid participant syntax at line: ${line}`);
    }

    const id = idLabelMatch[1];
    const label = idLabelMatch[2] || id;

    cleanLine = cleanLine.slice(idLabelMatch[0].length); // move cursor after id(label)

    let parentId: string | undefined = undefined;
    let parentLabel: string | undefined = undefined;
    let imageName: string | undefined = undefined;

    // Now extract both -> and : in any order
    const parts = cleanLine.split(/(?=->)|(?=:)/g).map((p) => p.trim());

    console.log('  Parsed node:', { id, label, matchAttrs, parts });

    for (const part of parts) {
      if (part.startsWith('->')) {
        imageName = part.replace('->', '').replace('.png', '').trim();
      } else if (part.startsWith(':')) {
        const groupRegex = /^:(\w+)(?:\(([^)]+)\))?/;
        const groupMatch = RegExp(groupRegex).exec(part);
        if (groupMatch) {
          parentId = groupMatch[1];
          parentLabel = groupMatch[2] || parentId;
        }
        console.log('  Parsed group:', { parentId, parentLabel });
      }
    }

    // console.error(this.groupNodes);
    if (parentId) {
      // if (parentId && !this.groupNodes.has(parentId.toLowerCase())) {
      parentNode = new GraphNode({
        id: parentId.toLowerCase(),
        label: parentLabel ?? parentId,
        parent: applicationNode?.id?.toLowerCase(),
        type: 'group',
      });
      this.groupNodes.set(parentId.toLowerCase(), parentNode);
    }
    const childNode = new GraphNode({
      id: id.toLowerCase(),
      label,
      parent: parentId?.toLowerCase() ?? applicationNode?.id?.toLocaleLowerCase() ?? undefined,
      type: matchAttrs['type'] ?? 'service',
      status: 'healthy',
      version: matchAttrs['version'] ?? '1.0.0',
      environment: matchAttrs['environment'] ?? 'prod',
      // position: { x: 100 + index * 150, y: 100 },
      image: imageName ? `/assets/${imageName}.png` : undefined,
    });

    return { childNode, parentNode };
  }

  parseEdgeLine(line: string, applicationColor: string | undefined, index: number): GraphEdge[] {
    // const edgePattern = /(\w+)\s*(<-|->|<->)\s*(\w+):\s*(.+)/;
    const edgePattern = /(\w+)\s*(<-|->|<->)\s*(\w+)(?::\s*(.+))?/;
    const match = RegExp(edgePattern).exec(line);

    const validColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'] as const;
    const color = validColors.includes(applicationColor as any)
      ? (applicationColor as 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange')
      : undefined;

    if (!match) {
      console.warn('Invalid edge line:', line);
      return [];
    }

    const from = match[1].toLowerCase();
    const arrow = match[2];
    const to = match[3].toLowerCase();
    const label = match[4] || '';

    const edges: GraphEdge[] = [];

    console.log('    Parsed edge:', { from, arrow, to, label });

    let labelString: string = `${index}`;
    if (label) {
      labelString += ` - ${label}`;
    }
    if (arrow === '->') {
      edges.push(
        new GraphEdge({
          id: `${from}-${to}`,
          source: from,
          target: to,
          label: labelString,
          type: 'oneway',
          color,
        })
      );
    } else if (arrow === '<-') {
      edges.push(
        new GraphEdge({
          id: `${to}-${from}`,
          source: to,
          target: from,
          label: labelString,
          type: 'oneway',
          color,
        })
      );
    } else if (arrow === '<->') {
      // edges.push(new GraphEdge({ id: `${from}-${to}`, source: from, target: to, label }));
      edges.push(
        new GraphEdge({
          id: `${to}-${from}`,
          source: to,
          target: from,
          label: labelString,
          type: 'versa',
          color,
        })
      );
    }

    return edges;
  }
}
