/** @format */

export class GraphEdge {
  id?: string;
  source?: string;
  target?: string;
  label?: string;
  color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
  type: 'versa' | 'oneway' = 'oneway';

  constructor(init: Partial<GraphEdge>) {
    Object.assign(this, init);
  }

  toCytoscapeEdge(): any {
    return {
      data: {
        id: this.id,
        source: this.source,
        target: this.target,
        label: this.label,
        color: this.color,
        type: this.type,
      },
    };
  }
}
