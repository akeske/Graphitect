/** @format */

import { Component, ElementRef, ViewChild, OnDestroy, AfterViewInit, OnInit, TemplateRef } from '@angular/core';
import cytoscape, { Core } from 'cytoscape';
import { GraphNode } from '../../models/graph/node';
import { GraphEdge } from '../../models/graph/edge';
import { customStyle } from '../../models/graph/style';
import { GraphFunction } from '../../services/graph-function.service';
import { faFloppyDisk, faPenToSquare, faImage, faTrash, faPlus, faFileCode } from '@fortawesome/free-solid-svg-icons';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Architecture } from '../../models/architecture.model';
import { ApiService } from '../../services/api.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NewArchitectureModal } from './modals/new-architecture/new-arch.component';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  standalone: false,
  styleUrls: ['./graph.component.scss'],
})
export class GraphComponent implements OnDestroy, OnInit, AfterViewInit {
  @ViewChild('cy') cyRef!: ElementRef;

  @ViewChild('textArea') textAreaRef!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('backdrop') backdropRef!: ElementRef<HTMLDivElement>;
  @ViewChild('lineNumbers') lineNumbersRef!: ElementRef<HTMLDivElement>;

  faFloppyDisk = faFloppyDisk;
  faImage = faImage;
  faFileCode = faFileCode;
  faTrash = faTrash;
  faPlus = faPlus;
  faPenToSquare = faPenToSquare;

  architectures: Architecture[] = [];
  selectedArchitecture: Architecture | undefined = undefined;
  highlightedText: SafeHtml = '';
  lineNumbersText: string = '';
  suggestions: string[] = [];
  selectedSuggestion = 0;
  suggestionBox = { top: 0, left: 0 };
  graphParentNodes: GraphNode[] = [];
  graphNodes: GraphNode[] = [];
  graphEdges: GraphEdge[] = [];
  selectedOnGraph: string = '';
  // nodeInput: string = '';
  nodeInput: string = `
participant User->user
participant Imperva(WAF Imperva):LandingZone(Security)->imperva
participant AppGw(Application Gateway):LandingZone->appgw
participant Firewall:LandingZone->fw

application Enterprise App:blue
  participant WebApp(Web App)->appserv
  participant APIM(Api Management)->apim
  participant WebAPI(Web API)->container

  User->Imperva
  Imperva->AppGw
  AppGw->Firewall
  Firewall->WebApp
  WebApp->APIM:Request API protected by Api Management
  APIM->WebAPI:Request API

  `;

  private cyInstance: Core | null = null;
  private readonly triggerCharRegex = /[\w]+$/;
  private readonly colorMap: Record<string, Partial<CSSStyleDeclaration>> = {
    application: { color: 'red', fontWeight: 'bold' },
    ':': { color: 'red' },
    participant: { color: 'green', fontWeight: 'bold' },
    aks: { color: '#6d7f8d', fontWeight: 'bold' },
    apim: { color: '#6d7f8d', fontWeight: 'bold' },
    appgw: { color: '#6d7f8d', fontWeight: 'bold' },
    appserv: { color: '#6d7f8d', fontWeight: 'bold' },
    cache: { color: '#6d7f8d', fontWeight: 'bold' },
    cloud: { color: '#6d7f8d', fontWeight: 'bold' },
    cloudfin: { color: '#6d7f8d', fontWeight: 'bold' },
    confluent: { color: '#6d7f8d', fontWeight: 'bold' },
    container: { color: '#6d7f8d', fontWeight: 'bold' },
    'event-hub': { color: '#6d7f8d', fontWeight: 'bold' },
    file: { color: '#6d7f8d', fontWeight: 'bold' },
    'file-server': { color: '#6d7f8d', fontWeight: 'bold' },
    fw: { color: '#6d7f8d', fontWeight: 'bold' },
    imperva: { color: '#6d7f8d', fontWeight: 'bold' },
    sql: { color: '#6d7f8d', fontWeight: 'bold' },
    'storage-blob': { color: '#6d7f8d', fontWeight: 'bold' },
    'storage-files': { color: '#6d7f8d', fontWeight: 'bold' },
    user: { color: '#6d7f8d', fontWeight: 'bold' },
    vm: { color: '#6d7f8d', fontWeight: 'bold' },
    waf: { color: '#6d7f8d', fontWeight: 'bold' },
    webhooks: { color: '#6d7f8d', fontWeight: 'bold' },
    wprkstation: { color: '#6d7f8d', fontWeight: 'bold' },
  };

  constructor(
    private readonly api: ApiService,
    private readonly modalService: NgbModal,
    private readonly graphFunction: GraphFunction,
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadArchitectures();
  }

  ngOnDestroy(): void {
    this.cyInstance?.destroy();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.onInput());
  }

  onInput(): void {
    const colored = this.applyColors(this.nodeInput);
    const lineCount = this.nodeInput.split('\n').length;
    // Delay to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.highlightedText = this.sanitizer.bypassSecurityTrustHtml(colored);
      this.lineNumbersText = Array.from({ length: lineCount }, (_, i) => i + 1).join('<br>');
      this.syncScroll();
    });
  }

  syncScroll(): void {
    const scrollTop = this.textAreaRef.nativeElement.scrollTop;
    this.backdropRef.nativeElement.scrollTop = scrollTop;
    this.lineNumbersRef.nativeElement.scrollTop = scrollTop;
  }

  onKeyup(event: KeyboardEvent): void {
    const textarea = this.textAreaRef.nativeElement;
    const value = textarea.value.slice(0, textarea.selectionStart || 0);
    const match = RegExp(this.triggerCharRegex).exec(value);
    if (match) {
      const word = match[0].toLowerCase();
      this.suggestions = Object.keys(this.colorMap).filter((key) => key.startsWith(word) && key !== word);
      this.selectedSuggestion = 0;
      this.positionAutocomplete();
    } else {
      this.suggestions = [];
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.suggestions.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedSuggestion = (this.selectedSuggestion + 1) % this.suggestions.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedSuggestion = (this.selectedSuggestion - 1 + this.suggestions.length) % this.suggestions.length;
    } else if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      this.applySuggestion(this.suggestions[this.selectedSuggestion]);
    } else if (event.key === 'Escape') {
      this.suggestions = [];
    }
  }

  loadElements(graphParentNodes: GraphNode[], graphNodes: GraphNode[], graphEdges: GraphEdge[]): void {
    let parentNodes = graphParentNodes.map((n) => n.toCytoscapeNode());
    let nodes = graphNodes.map((n) => n.toCytoscapeNode());
    const edges = graphEdges.map((e) => e.toCytoscapeEdge());

    nodes = this.layoutGroupsInGrid(nodes, parentNodes).nodes;
    parentNodes = this.layoutGroupsInGrid(nodes, parentNodes).parentNodes;
    // const nodes = [
    //   {
    //     data: { id: 'a', parent: 'group1', label: 'Service A' },
    //     position: { x: 200, y: 100 },
    //   },
    //   { data: { id: 'b', parent: 'group1', label: 'Service B' }, position: { x: 300, y: 100 } },
    //   { data: { id: 'c', label: 'Service C' } },
    //   { data: { id: 'group1', parent: 'group2', label: 'App Group 1' } }, // 👈 parent node with label
    //   { data: { id: 'group2', label: 'App Group 2' } }, // 👈 parent node with label
    // ];
    // const edges = [
    //   { data: { id: 'adsfsa', source: 'a', target: 'b', label: 'calls /getUsers' } },
    //   { data: { id: 'ab', source: 'a', target: 'b', label: 'streams events' } },
    //   { data: { id: 'a1', source: 'a', target: 'b', label: 'streams events' } },
    //   { data: { id: 'a2', source: 'a', target: 'b', label: 'streams events' } },
    //   { data: { id: 'a3', source: 'a', target: 'b', label: 'streams events' } },
    //   { data: { id: 'dfassab', source: 'c', target: 'group2', label: 'streams events' } },
    // ];
    const elements = [...parentNodes, ...nodes, ...edges];

    this.refreshGraph(elements);
  }

  refreshGraph(elements: any[]): void {
    // 💣 Step 1: Destroy the old instance if it exists
    if (this.cyInstance) {
      this.cyInstance.destroy();
      this.cyInstance = null;
    }

    // Step 2: Rebuild a fresh instance
    this.cyInstance = cytoscape({
      minZoom: 0.1, // minimum 50% zoom
      maxZoom: 2, // maximum 200% zoom
      wheelSensitivity: 0.2, // optional: smooth wheel zoom
      // Restrict user interaction
      userZoomingEnabled: true,
      userPanningEnabled: true,
      // Lock the graph from flying offscreen
      motionBlur: true,
      autoungrabify: false, // still allow dragging nodes
      autolock: false, // still allow drag/drop
      autounselectify: true,
      // This is key 👇
      boxSelectionEnabled: false,
      container: this.cyRef.nativeElement,
      // elements: [...this.graphNodes.map((n) => n.toCytoscapeNode())],
      style: customStyle,
      elements: elements,
      layout: {
        // name: 'circle',
        // padding: 1, // padding used on fit
        // // boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
        // avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
        // startAngle: Math.PI,
        // nodeDimensionsIncludeLabels: true,
        // fit: true,
        name: 'grid',
        fit: true,
        padding: 50,
        avoidOverlap: true,
        rows: undefined, // auto-calculate
        cols: undefined,
        // name: 'preset',
      },
    });

    // Step 3: Re-bind any click events
    this.bindCyEvents();
  }

  parseDsl(): void {
    const lines = this.nodeInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    this.graphParentNodes = [];
    this.graphNodes = [];
    this.graphEdges = [];

    let index = 0;
    let applicationNode: GraphNode | null = null;
    let applicationEdgesIndex: number = 0;
    for (const line of lines) {
      if (line.startsWith('application')) {
        applicationEdgesIndex = 0;
        applicationNode = this.graphFunction.parseApplicationLine(line, index++)!;
        this.graphParentNodes.push(applicationNode);
      } else if (line.startsWith('participant') || line.startsWith('node')) {
        const { childNode, parentNode } = this.graphFunction.parseNodeLine(line, applicationNode!, index++);
        this.graphNodes.push(childNode);
        if (parentNode && !this.graphParentNodes.some((parent) => parent.id === parentNode.id)) {
          this.graphParentNodes.push(parentNode);
        }
      } else {
        applicationEdgesIndex++;
        const parsedEdges = this.graphFunction.parseEdgeLine(line, applicationNode!.color, applicationEdgesIndex);
        this.graphEdges.push(...parsedEdges);
      }
    }

    this.loadElements(this.graphParentNodes, this.graphNodes, this.graphEdges);
  }

  selectGroup(parentNodeGraph: GraphNode): void {
    let graphParentNodes = this.graphParentNodes;
    let graphNodes = this.graphNodes;
    let graphEdges = this.graphEdges;
    graphParentNodes = graphParentNodes.filter((parentNode) => {
      return parentNode.id == parentNodeGraph.id;
    });

    graphNodes = graphNodes.filter((node) => {
      return node.parent === parentNodeGraph.id;
    });

    const nodeIds = new Set(graphNodes.map((node) => (node.id ?? '').toLowerCase()));

    graphEdges = graphEdges.filter((edge) => {
      return nodeIds.has((edge.source ?? '').toLowerCase()) && nodeIds.has((edge.target ?? '').toLowerCase());
    });

    const parentNodes = graphParentNodes.map((n) => n.toCytoscapeNode());
    const nodes = graphNodes.map((n) => n.toCytoscapeNode());
    const edges = graphEdges.map((e) => e.toCytoscapeEdge());
    const result = this.getNodesFromEdges(graphEdges, this.graphNodes);

    this.graphNodes.push(...result);

    const elements = [...parentNodes, ...nodes, ...edges];
    this.refreshGraph(elements);
  }

  // highlightEdges(): void {
  //   if (!this.cyInstance) return;

  //   // Example: highlight edges with IDs 'ad' and 'eb'
  //   const edgeIdsToHighlight = ['API', 'CACHE'];

  //   this.cyInstance.edges().forEach((edge) => {
  //     if (edgeIdsToHighlight.includes(edge.id())) {
  //       edge.style('line-color', '#ff0000'); // red line
  //       edge.style('target-arrow-color', '#ff0000'); // red arrow
  //     }
  //   });

  //   // console.log('Highlighted edges:', edgeIdsToHighlight);
  // }

  exportAsPng(): void {
    if (!this.cyInstance) {
      console.error('Cytoscape instance is not initialized.');
      return;
    }
    const pngData = this.cyInstance.png({
      full: true,
      scale: 2,
      bg: '#ffffff',
    });

    const link = document.createElement('a');
    link.href = pngData;
    link.download = 'graph.png';
    link.click();
  }

  newArchitecture(): void {
    this.selectedArchitecture = undefined;
  }

  saveArchitecture(): void {
    const modalRef = this.modalService.open(NewArchitectureModal, {
      size: 'sm',
      centered: true,
      scrollable: false,
      modalDialogClass: 'dark-modal',
      backdropClass: 'light-blue-backdrop',
      windowClass: 'dark-modal',
    });
    modalRef.componentInstance.currentArchName = this.selectedArchitecture?.name;
    modalRef.result.then((result) => {
      if (result.status === 'Save') {
        const graphElements = [...this.graphParentNodes, ...this.graphNodes, ...this.graphEdges];

        // refresh Architecture
        if (this.selectedArchitecture && this.selectedArchitecture.id) {
          this.selectedArchitecture.name = result.archName;
          this.selectedArchitecture.graph = JSON.stringify(graphElements);
          this.selectedArchitecture.schema = this.nodeInput;
          this.api.updateArchitecture(this.selectedArchitecture.id, this.selectedArchitecture).subscribe(() => {
            this.loadArchitectures();
          });
        } else {
          this.selectedArchitecture = {
            name: result.archName,
            description: 'description',
            schema: this.nodeInput,
            graph: JSON.stringify(graphElements),
          };
          // create new architecture
          this.api.createArchitecture(this.selectedArchitecture).subscribe(() => {
            this.loadArchitectures();
          });
        }
      }
    });
  }

  loadArchitectures(): void {
    this.api.getArchitectures().subscribe((data) => {
      this.architectures = data;
    });
  }

  loadArchitecture(architecture: Architecture): void {
    this.selectedArchitecture = architecture;
    this.nodeInput = architecture.schema ?? '';
    setTimeout(() => {
      this.onInput();
    });
  }

  deleteArchitecture(content: TemplateRef<any>, architecture: Architecture | undefined): void {
    this.modalService.open(content, { centered: true }).result.then(
      (result) => {
        if (result === 'yes') {
          if (architecture && architecture.id) {
            this.api.deleteArchtiecture(architecture.id).subscribe((data) => {
              this.loadArchitectures();
              this.selectedArchitecture = undefined;
            });
          }
          // await lastValueFrom(this.notesService.deleteNote(noteId));
        }
      },
      () => {}
    );
  }

  private getNodesFromEdges(edges: GraphEdge[], nodes: GraphNode[]): GraphNode[] {
    const idSet = new Set<string>();
    edges.forEach((edge) => {
      idSet.add(edge.source ?? '');
      idSet.add(edge.target ?? '');
    });

    return nodes.filter((node) => node.id && idSet.has(node.id));
  }

  private bindCyEvents(): void {
    if (!this.cyInstance) return;

    this.cyInstance.on('tap', 'node', (event) => {
      const nodeId = event.target.id();
      console.log('Clicked node:', nodeId);
      this.onNodeClick(nodeId);
    });

    this.cyInstance.on('tap', 'edge', (event) => {
      const edge = event.target;
      const edgeId = edge.id();
      const sourceId = edge.source().id();
      const targetId = edge.target().id();
      console.log('Clicked edge:', { edgeId, sourceId, targetId });
      this.onEdgeClick(edgeId, sourceId, targetId);
    });
    // this.cyInstance.on('dragfree', 'node', (evt) => {
    //   const node = evt.target;
    //   const position = node.position();
    //   console.log(`Node ${node.id()} moved to: x=${position.x}, y=${position.y}`);
    // });
    // this.cyInstance.fit(); // initially fit to screen

    // this.cyInstance.on('pan zoom', () => {
    //   const pan = this.cyInstance?.pan();
    //   const zoom = this.cyInstance?.zoom();
    //   const minPan = { x: -300, y: -300 };
    //   const maxPan = { x: 300, y: 300 };
    //   if (pan) {
    //     this.cyInstance?.pan({
    //       x: Math.min(Math.max(pan.x, minPan.x), maxPan.x),
    //       y: Math.min(Math.max(pan.y, minPan.y), maxPan.y),
    //     });
    //   }
    //   if (zoom && this.cyInstance) {
    //     this.cyInstance.zoom(Math.min(Math.max(zoom, 0.5), 2));
    //   }
    // });
  }

  private onEdgeClick(edgeId: string, sourceId: string, targetId: string) {
    this.selectedOnGraph = `${edgeId}`;
  }

  private onNodeClick(nodeId: string) {
    this.selectedOnGraph = nodeId;
  }
  private toKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  private layoutGroupsInGrid(nodes: any, parentNodes: any) {
    const groupSpacing = 800;
    const cellSpacing = 300;
    const columnsPerGroup = 3; // how many columns per group

    // Step 1: Group child nodes by parent ID
    const groupMap: Record<string, any[]> = {};
    nodes.forEach((node: { data: { parent: any } }) => {
      const parentId = node.data.parent;
      if (parentId) {
        if (!groupMap[parentId]) groupMap[parentId] = [];
        groupMap[parentId].push(node);
      }
    });

    // Step 2: Position each group
    let groupIndex = 0;

    for (const [parentId, children] of Object.entries(groupMap)) {
      const offsetX = (groupIndex % 4) * groupSpacing;
      const offsetY = Math.floor(groupIndex / 4) * groupSpacing;

      // Arrange child nodes in a grid
      children.forEach((node, i) => {
        const col = i % columnsPerGroup;
        const row = Math.floor(i / columnsPerGroup);
        node.position = {
          x: offsetX + col * cellSpacing,
          y: offsetY + row * cellSpacing + 60, // slightly below parent
        };
      });

      // Center the parent node above its grid
      const parentNode = parentNodes.find((n: { data: { id: string } }) => n.data.id === parentId);
      if (parentNode) {
        parentNode.position = {
          x: offsetX + ((columnsPerGroup - 1) * cellSpacing) / 2,
          y: offsetY - 80, // above children
        };
      }

      groupIndex++;
    }

    // Optional: non-grouped nodes go to the bottom or a separate section
    const ungrouped = nodes.filter((n: { data: { parent: any } }) => !n.data.parent);
    ungrouped.forEach((node: { position: { x: number; y: number } }, i: number) => {
      node.position = {
        x: i * 120,
        y: Math.ceil(groupIndex / 4) * groupSpacing + 100,
      };
    });

    return { nodes, parentNodes };
  }

  private positionAutocomplete(): void {
    const textarea = this.textAreaRef.nativeElement;
    const rect = textarea.getBoundingClientRect();
    const lineHeight = 20;

    const line = this.nodeInput.substring(0, textarea.selectionStart!).split('\n').length - 1;
    const column = textarea.selectionStart! - this.nodeInput.lastIndexOf('\n', textarea.selectionStart! - 1) - 1;

    this.suggestionBox = {
      top: line * lineHeight + 20,
      left: column * 8 + 45, // + gutter + padding
    };
  }

  private applyColors(text: string): string {
    // const escaped = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const escapaed = text;
    const re = new RegExp(Object.keys(this.colorMap).join('|'), 'gi');

    // const re = new RegExp(
    //   Object.keys(this.colorMap)
    //     .map((w) => w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'))
    //     .sort((a, b) => b.length - a.length)
    //     .join('|'),
    //   'gi'
    // );

    // Step: Apply colorMap styling
    let colored = text.replace(re, (match) => {
      const styles = this.colorMap[match.toLowerCase()];
      if (!styles) return match;

      const styleString = Object.entries(styles)
        .map(([key, value]) => `${this.toKebabCase(key)}:${value}`)
        .join(';');

      return `<span style="${styleString}">${match}</span>`;
    });

    // Step 3: Deep blue for text inside parentheses
    colored = colored.replace(/\(([^()]+)\)/g, (match, innerText) => {
      if (match.includes('<span')) return match;
      return `(<span style="color:#5a9bd4">${innerText}</span>)`;
    });

    // Step: Deep red for text inside square brackets
    colored = colored.replace(/\[([^[\]]+)\]/g, (match, innerText) => {
      if (match.includes('<span')) return match;
      return `[<span style="color:#5a9bd4">${innerText}</span>]`;
    });

    // Step: Deep red for words after colon
    // colored = colored.replace(/: *([a-zA-Z0-9_]+)/g, (match, innerText) => {
    //   if (match.includes('<span')) return match;
    //   return `(<span style="color:#8B0000">${innerText}</span>)`;
    // });

    // Step: Color before/after -> IF not in participant/application
    const lines = colored.split('\n');
    const processedLines = lines.map((line) => {
      const rawLine = line.replace(/<[^>]*>/g, ''); // Strip HTML for detection

      const skipArrowColoring = rawLine.includes('participant ') || rawLine.includes('application ');

      if (!skipArrowColoring && line.includes('->')) {
        console.error('line:', line);
        const arrowIndex = line.indexOf('->');
        const before = line.substring(0, arrowIndex);
        const after = line.substring(arrowIndex + 2);
        console.error('  line:  ', `${before}|${after}`);
        return (
          `<span style="color:#3ca374">${before}</span>` +
          `<span style="color:red">-></span>` +
          `<span style="color:#d9534f">${after}</span>`
        );
      }

      return line;
    });

    // return colored.replace(/\n/g, '<br>');
    return processedLines.join('<br>');
  }

  applySuggestion(suggestion: string): void {
    const textarea = this.textAreaRef.nativeElement;
    const pos = textarea.selectionStart || 0;
    const before = textarea.value.slice(0, pos).replace(this.triggerCharRegex, suggestion);
    const after = textarea.value.slice(pos);
    this.nodeInput = before + after;

    // Move cursor to end of inserted word
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = before.length;
      this.textAreaRef.nativeElement.focus();
      this.suggestions = [];
      this.onInput();
    });
  }
}
