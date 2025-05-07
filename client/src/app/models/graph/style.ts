/** @format */

import { StylesheetStyle } from 'cytoscape';

export const customStyle: StylesheetStyle[] = [
  {
    selector: 'node[!image = undefined]',
    style: {
      'background-color': '#adb5bd',
      'background-opacity': 1,
      'border-width': 1,
      'border-color': '#000',
      'border-opacity': 1,
      width: 64,
      height: 64,
      label: 'data(label)',
      'text-valign': 'bottom',
      'text-halign': 'center',
      'text-margin-y': 5,
      'text-wrap': 'wrap',
      'font-size': 14,
      color: '#212529',
    },
  },
  {
    selector: 'node[image]',
    style: {
      'background-image': 'data(image)',
      'background-fit': 'contain', // cover
      'background-clip': 'node',
      'background-opacity': 0, // Transparent background behind image
      'border-width': 1,
      'border-color': '#000',
      'border-opacity': 1,
      width: 64,
      height: 64,
      label: 'data(label)',
      'text-valign': 'bottom',
      'text-halign': 'center',
      'text-margin-y': 5,
      'text-wrap': 'wrap',
      'font-size': 14,
      color: '#212529', // Bootstrap dark text
    },
  },
  {
    selector: '$node > node',
    style: {
      'background-color': '#f8f9fa',
      'border-color': '#6c757d',
      label: 'data(label)',
      'text-valign': 'top',
      shape: 'roundrectangle',
      padding: '20px',
    },
  },
  {
    selector: 'node#e',
    style: {
      'corner-radius': '10',
    },
  },
  {
    selector: ':parent',
    style: {
      label: 'data(label)',
      'text-valign': 'bottom',
      'text-halign': 'center',
      'text-margin-y': 5,
      shape: 'round-rectangle',
      'background-color': '#ffffff',
      'corner-radius': '10',
      'border-width': 1,
      'border-opacity': 0.3,
      'font-size': 14,
    },
  },
  {
    selector: 'edge',
    style: {
      width: 3,
      'line-color': '#9dbaea',
      'target-arrow-color': '#9dbaea',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'font-size': 16,
      'text-background-color': '#ffffff',
      'text-background-opacity': 1,
      'text-rotation': 'autorotate',
      label: 'data(label)',
      color: '#212529', // Edge text color
    },
  },
  {
    selector: 'edge[color = "red"]',
    style: {
      'line-color': '#dc3545',
      'target-arrow-color': '#dc3545',
    },
  },
  {
    selector: 'edge[color = "green"]',
    style: {
      'line-color': '#198754',
      'target-arrow-color': '#198754',
    },
  },
  {
    selector: 'edge[color = "yellow"]',
    style: {
      'line-color': '#ffc107',
      'target-arrow-color': '#ffc107',
    },
  },
  {
    selector: 'edge[color = "orange"]',
    style: {
      'line-color': '#fd7e14',
      'target-arrow-color': '#fd7e14',
    },
  },
  {
    selector: 'edge[color = "purple"]',
    style: {
      'line-color': '#6f42c1',
      'target-arrow-color': '#6f42c1',
    },
  },
  {
    selector: 'edge[type = "oneway"]',
    style: {
      'target-arrow-shape': 'triangle',
    },
  },
  {
    selector: 'edge[type = "versa"]',
    style: {
      'target-arrow-shape': 'triangle',
      'source-arrow-shape': 'triangle',
    },
  },
];
