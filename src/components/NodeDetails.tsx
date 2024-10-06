import React from 'react';
import { INode } from '../types';

interface INodeDetailsProps {
  node: INode;
}

const NodeDetails: React.FC<INodeDetailsProps> = ({ node }) => (
  <div>
    <p>
      <b>ID:</b> {node?.id}
    </p>
    <p>
      <b>Type:</b> {node?.type}
    </p>
    <p>
      <b>Content:</b> {node?.content || 'No Content'}
    </p>
  </div>
);
export default NodeDetails;
