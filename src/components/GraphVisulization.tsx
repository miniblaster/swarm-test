import React, { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import LegendItem from './LegendItem';

import { INode, IEdge } from '../types';
interface D3Node extends INode, d3.SimulationNodeDatum {}

interface GraphVisualizationProps {
  nodes: INode[];
  edges: IEdge[];
  onNodeClick: (node: INode) => void;
  onEdgeClick: (edge: IEdge) => void;
  selectedNodeId: string;
  selectedEdgeId: IEdge | null;
}
const legendItems = [
  { color: '#FF4136', label: 'Topics' },
  { color: '#0074D9', label: 'Participants' },
  { color: '#2ECC40', label: 'Messages' },
];
const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  nodes,
  edges,
  onNodeClick,
  onEdgeClick,
  selectedNodeId,
  selectedEdgeId,
}) => {
  const containerRef = useRef<SVGSVGElement | null>(null);

  // Check if the node is connected to the selected node
  const isConnectedNode = useCallback(
    (nodeId: string) => {
      return edges.some(
        (edge) =>
          (edge.from === selectedNodeId && edge.to === nodeId) ||
          (edge.to === selectedNodeId && edge.from === nodeId)
      );
    },
    [edges, selectedNodeId]
  );

  // Check if the edge is connected to the selected node
  const isConnectedEdge = useCallback(
    (edge: { source: D3Node; target: D3Node }) =>
      edge.source.id === selectedNodeId || edge.target.id === selectedNodeId,
    [selectedNodeId]
  );

  // Check if the edge is selected
  const isSelectedEdge = useCallback(
    (edge: { source: D3Node; target: D3Node }) => {
      if (selectedEdgeId) {
        return (
          selectedEdgeId.from === edge.source.id &&
          selectedEdgeId.to === edge.target.id
        );
      }
      return false;
    },
    [selectedEdgeId]
  );

  // Drag the node
  const drag = useCallback(
    (simulation: d3.Simulation<D3Node, undefined>) => {
      return d3
        .drag<SVGCircleElement, D3Node>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        });
    },
    [selectedNodeId]
  );

  // Draw the graph
  const drawGraph = useCallback(() => {
    if (!containerRef.current) return;

    const svg = d3.select(containerRef.current);
    svg.selectAll('*').remove();

    const width = containerRef?.current?.clientWidth;
    const height = 600;
    const g = svg.append('g');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create simulation nodes and node map
    const simulationNodes: D3Node[] = nodes.map((node) => ({ ...node }));
    const nodeMap = new Map<string, D3Node>(
      simulationNodes.map((node) => [node.id, node as D3Node])
    );

    // Filter valid edges
    const validEdges = edges
      .filter((edge) => nodeMap.has(edge.from) && nodeMap.has(edge.to))
      .map((edge) => ({
        source: nodeMap.get(edge.from)!,
        target: nodeMap.get(edge.to)!,
      }));
    // Create simulation
    const simulation = d3
      .forceSimulation<D3Node>(simulationNodes)
      .force(
        'link',
        d3
          .forceLink<D3Node, { source: D3Node; target: D3Node }>(validEdges)
          .id((d) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = g
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll<SVGLineElement, { source: D3Node; target: D3Node }>('line')
      .data(validEdges)
      .join('line')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .attr('stroke', (d) =>
        isSelectedEdge(d) ? 'purple' : isConnectedEdge(d) ? '#FFA500' : '#999'
      )
      .attr('stroke-width', (d) =>
        isConnectedEdge(d) || isSelectedEdge(d) ? 3 : 2
      )
      .on('click', (event, d) => {
        const originalEdge = edges.find(
          (edge) => edge.from === d.source.id && edge.to === d.target.id
        );
        if (originalEdge) {
          onEdgeClick(originalEdge);
        }
      });

    const nodeGroup = g.append('g');

    const node = nodeGroup
      .selectAll<SVGCircleElement, D3Node>('circle')
      .data(simulationNodes)
      .join('circle')
      .attr('r', 10)
      .attr('stroke', (d) =>
        d.id === selectedNodeId
          ? 'purple'
          : isConnectedNode(d.id)
          ? '#FFA500'
          : '#fff'
      )
      .attr('stroke-width', (d) =>
        d.id === selectedNodeId || isConnectedNode(d.id) ? 3 : 1.5
      )
      .attr('fill', (d) =>
        d.type === 'participant'
          ? '#0074D9'
          : d.type === 'topic'
          ? '#FF4136'
          : '#2ECC40'
      )
      .call(drag(simulation))
      .on('click', (event, d) => {
        if (d.fx == null && d.fy == null) {
          d.fx = d.x;
          d.fy = d.y;
        } else {
          d.fx = null;
          d.fy = null;
        }
        simulation.alpha(0.3).restart();
        onNodeClick(d);
      });
    const labels = nodeGroup
      .selectAll<SVGTextElement, D3Node>('text')
      .data(simulationNodes)
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', 16)
      .attr('fill', '#000')
      .text((d) => d.id);

    // Update the graph on each tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as D3Node).x!)
        .attr('y1', (d) => (d.source as D3Node).y!)
        .attr('x2', (d) => (d.target as D3Node).x!)
        .attr('y2', (d) => (d.target as D3Node).y!);

      node
        .attr('cx', (d) => {
          d.x = Math.max(20, Math.min(width - 20, d.x!));
          return d.x!;
        })
        .attr('cy', (d) => {
          if (d.y && d.y > height) {
            d.y = height - 20;
          } else d.y = Math.max(20, Math.min(height - 0, d.y!));
          return d.y!;
        });

      labels
        .attr('x', (d) => Math.max(20, Math.min(width - 20, d.x!)))
        .attr('y', (d) => Math.max(20, Math.min(height - 20, d.y!)) - 15);
    });
  }, [edges, selectedNodeId, selectedEdgeId]);

  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  return (
    <>
      <svg
        ref={containerRef}
        style={{
          borderWidth: '2px',
          borderStyle: 'solid',
          borderColor: '#000',
          width: '100%',
          height: '650px',
        }}
      />
      <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
        {legendItems.map((item) => (
          <LegendItem key={item.label} {...item} />
        ))}
      </div>
    </>
  );
};

export default React.memo(GraphVisualization);
