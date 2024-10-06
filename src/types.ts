type NodeType = 'participant' | 'topic' | 'message';

export interface INode {
  id: string;
  type: NodeType;
  content?: string;
  user?: string;
}

type IEdgeType =
  | 'authored'
  | 'mentions'
  | 'discusses'
  | 'references'
  | 'requestsSource'
  | 'providesSource'
  | 'introduces'
  | 'elaborates'
  | 'critiques'
  | 'dismisses'
  | 'supportsImpact'
  | 'agrees'
  | 'neutral'
  | 'concludes'
  | 'disagrees'
  | 'counterArgument'
  | 'factCheck'
  | 'providesInfo'
  | 'addsInfo'
  | 'corrects'
  | 'summarizes';

export interface IEdge {
  from: string;
  to: string;
  type: IEdgeType;
}

export interface IData {
  nodes: INode[];
  edges: IEdge[];
}
