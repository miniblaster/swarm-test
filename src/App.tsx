import { useState, useEffect, Suspense } from 'react';
import GraphVisulization from './components/GraphVisulization';
import NodeDetails from './components/NodeDetails';
import EdgeDetails from './components/EdgeDetails';
import Loading from './components/Loading';

import { fetchData } from './api/fetchData';
import useIsMobile from './hook/useIsMobile';
import { IEdge, INode } from './types';

function App() {
  const [data, setData] = useState({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<INode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<IEdge | null>(null);
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedData = await fetchData();
        setData({ nodes: fetchedData.nodes, edges: fetchedData.edges });
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  console.log(data);

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
      <Suspense fallback={<Loading />}>
        {isLoading ? (
          <Loading />
        ) : error ? (
          <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>
        ) : (
          <>
            <GraphVisulization
              nodes={data.nodes}
              edges={data.edges}
              onNodeClick={handleNodeClick}
              onEdgeClick={handleEdgeClick}
              selectedNodeId={selectedNode?.id || ''}
              selectedEdgeId={selectedEdge ? selectedEdge : null}
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
          </>
        )}
      </Suspense>
    </div>
  );
}

export default App;
