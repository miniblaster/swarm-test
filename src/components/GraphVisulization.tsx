import React, { useEffect, useRef } from 'react';
import { INode, IEdge } from '../types';
import * as d3 from 'd3';

interface D3Node extends INode, d3.SimulationNodeDatum {}

interface GraphVisualizationProps {
  nodes: INode[];
  edges: IEdge[];
  onNodeClick: (node: INode) => void;
  onEdgeClick: (edge: IEdge) => void;
  selectedNodeId: string;
}

const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  nodes,
  edges,
  onNodeClick,
  onEdgeClick,
  selectedNodeId,
}) => {
  const containerRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const svg = d3.select(containerRef.current);
    svg.selectAll('*').remove();

    const width = containerRef.current.clientWidth;
    const height = 600;
    const g = svg.append('g');

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    const simulationNodes: D3Node[] = nodes.map((node) => ({ ...node }));
    const nodeMap = new Map<string, D3Node>(
      simulationNodes.map((node) => [node.id, node as D3Node])
    );

    const validEdges = edges
      .filter((edge) => nodeMap.has(edge.from) && nodeMap.has(edge.to))
      .map((edge) => ({
        source: nodeMap.get(edge.from)!,
        target: nodeMap.get(edge.to)!,
      }));

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
      .attr('stroke', (d) => (d.id === selectedNodeId ? '#FFA500' : '#fff'))
      .attr('stroke-width', (d) => (d.id === selectedNodeId ? 3 : 1.5))
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

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as D3Node).x!)
        .attr('y1', (d) => (d.source as D3Node).y!)
        .attr('x2', (d) => (d.target as D3Node).x!)
        .attr('y2', (d) => (d.target as D3Node).y!);

      node
        .attr('cx', (d) => {
          d.x = Math.max(50, Math.min(width - 50, d.x!));
          return d.x!;
        })
        .attr('cy', (d) => {
          if (d.y && d.y > height) {
            d.y = height - 30;
          } else d.y = Math.max(30, Math.min(height - 0, d.y!));
          return d.y!;
        });

      labels
        .attr('x', (d) => Math.max(20, Math.min(width - 20, d.x!)))
        .attr('y', (d) => Math.max(25, Math.min(height - 10, d.y!)) - 15);
    });

    function drag(simulation: d3.Simulation<D3Node, undefined>) {
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
    }
  }, [nodes, edges, onNodeClick, onEdgeClick, selectedNodeId]);

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
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '30px',
          marginTop: '20px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
          {' '}
          <div
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#FF4136',
              borderRadius: '50%',
            }}
          ></div>{' '}
          Topics
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
          {' '}
          <div
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#0074D9',
              borderRadius: '50%',
            }}
          ></div>{' '}
          Participants
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
          {' '}
          <div
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#2ECC40',
              borderRadius: '50%',
            }}
          ></div>{' '}
          Messages
        </div>
      </div>
    </>
  );
};

export default GraphVisualization;
