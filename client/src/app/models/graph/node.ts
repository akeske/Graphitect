/** @format */

export class GraphNode {
  id?: string;
  parent?: string;
  label?: string;
  type?: 'storage' | 'service' | 'gateway' | 'database' | 'queue' | 'group';
  status?: 'healthy' | 'degraded' | 'offline';
  version?: string;
  environment?: 'dev' | 'staging' | 'prod' | 'sit';
  position?: { x: number; y: number };
  color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
  image?: string;

  constructor(init: Partial<GraphNode>) {
    Object.assign(this, init);
  }

  toCytoscapeNode(): any {
    return {
      data: {
        id: this.id,
        parent: this.parent,
        label: this.label,
        type: this.type,
        status: this.status,
        version: this.version,
        environment: this.environment,
        color: this.color,
        image: this.image,
      },
      position: this.position,
    };
  }
}
