import React from 'react';
import { IEdge } from '../types';

interface INodeDetailsProps {
  edge: IEdge;
}

const EdgeDetails: React.FC<INodeDetailsProps> = ({ edge }) => (
  <div>
    <p>
      <b>Type: </b> {edge?.type}
    </p>
    <p>
      <b>From: </b> {edge?.from}
    </p>
    <p>
      <b>To: </b> {edge?.to}
    </p>
  </div>
);
export default EdgeDetails;
