export interface Pin {
  id: string;
  type: 'input' | 'output';
  name: string;
  value?: number;
  bitWidth: number;
}

export interface Component {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    pins: Pin[];
    properties?: Record<string, any>;
  };
}

export interface Wire {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

export interface Circuit {
  id: string;
  name: string;
  components: Component[];
  wires: Wire[];
}