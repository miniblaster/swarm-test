import { useState, useEffect } from 'react';
import { fetchData } from './api/fetchData';
import GraphVisulization from './components/GraphVisulization';
import NodeDetails from './components/NodeDetails';
import { IEdge, INode } from './types';
import EdgeDetails from './components/EdgeDetails';
import useIsMobile from './hook/useIsMobile';

function App() {
  const [data, setData] = useState({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<INode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<IEdge | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    (async () => {
      const fetchedData = await fetchData();
      setData({ nodes: fetchedData.nodes, edges: fetchedData.edges });
    })();
  }, []);

  const handleNodeClick = (node: INode) => {
    setSelectedNode(node);
  };

  const handleEdgeClick = (edge: IEdge) => {
    setSelectedEdge(edge);
  };
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <h1 style={{ textAlign: 'center' }}>Conversation Graph</h1>
      <GraphVisulization
        nodes={data.nodes}
        edges={data.edges}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        selectedNodeId={selectedNode?.id || ''}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '20px' : '60px',
        }}
      >
        {selectedNode && <NodeDetails node={selectedNode} />}
        {selectedEdge && <EdgeDetails edge={selectedEdge} />}
      </div>
    </div>
  );
}

export default App;
