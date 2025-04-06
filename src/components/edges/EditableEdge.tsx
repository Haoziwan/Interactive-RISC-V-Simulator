import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Edge,
  EdgeProps,
  getBezierPath,
  BaseEdge,
  EdgeLabelRenderer,
  useReactFlow,
  Position,
} from 'reactflow';

// Interface for the intermediate points
interface IntermediatePoint {
  x: number;
  y: number;
}

// Interface for edge data including intermediate points
interface EditableEdgeData {
  intermediatePoints?: IntermediatePoint[];
  [key: string]: any;
}

// Calculate the distance between two points
const distance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

// Find the closest point on a line segment to a given point
const closestPointOnLine = (
  x: number, y: number,
  x1: number, y1: number,
  x2: number, y2: number
) => {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  return { x: xx, y: yy, distance: distance(x, y, xx, yy), t: param };
};

// Get polyline path from source, target, and intermediate points
const getPolylinePath = (
  sourceX: number, sourceY: number,
  targetX: number, targetY: number,
  intermediatePoints: IntermediatePoint[] = []
) => {
  // Start with move to source
  let path = `M ${sourceX},${sourceY}`;

  // Add line to each intermediate point
  intermediatePoints.forEach((point) => {
    path += ` L ${point.x},${point.y}`;
  });

  // End with line to target
  path += ` L ${targetX},${targetY}`;

  return path;
};

export default function EditableEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}: EdgeProps) {
  const reactFlowInstance = useReactFlow();
  const [draggedPointIndex, setDraggedPointIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Ensure we have a valid data object with intermediatePoints array
  const edgeData: EditableEdgeData = data || {};
  const intermediatePoints = edgeData.intermediatePoints || [];

  // Create a path drawing function for the edge
  const path = getPolylinePath(sourceX, sourceY, targetX, targetY, intermediatePoints);

  // Handle click on the edge path to add a new point
  const handleEdgeClick = useCallback((event: React.MouseEvent) => {
    // Only allow adding points when the edge is selected
    if (!selected) return;
    
    event.stopPropagation();
    
    // Skip if we clicked on a handle
    if ((event.target as HTMLElement).classList.contains('point-handle')) {
      return;
    }

    // Get the click coordinates relative to the flow
    const panePosition = reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    // Find the closest segment of the edge
    let closestSegment = { index: -1, point: { x: 0, y: 0, distance: Infinity, t: 0 } };
    let points = [{ x: sourceX, y: sourceY }, ...intermediatePoints, { x: targetX, y: targetY }];
    
    for (let i = 0; i < points.length - 1; i++) {
      const point = closestPointOnLine(
        panePosition.x, panePosition.y,
        points[i].x, points[i].y,
        points[i + 1].x, points[i + 1].y
      );
      
      if (point.distance < closestSegment.point.distance) {
        closestSegment = { index: i, point };
      }
    }

    if (closestSegment.index === -1) return;

    // Create a new list of intermediate points with the new point inserted at the right position
    const newPoint = { x: closestSegment.point.x, y: closestSegment.point.y };
    const newIntermediatePoints = [...intermediatePoints];
    newIntermediatePoints.splice(closestSegment.index, 0, newPoint);

    // Update the edge data
    reactFlowInstance.setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === id) {
          return {
            ...edge,
            data: {
              ...edge.data,
              intermediatePoints: newIntermediatePoints,
            },
          };
        }
        return edge;
      })
    );
  }, [id, sourceX, sourceY, targetX, targetY, intermediatePoints, reactFlowInstance, selected]);

  // Handle starting to drag a point
  const handlePointDragStart = useCallback((event: React.MouseEvent, index: number) => {
    // Prevent default and stop propagation to avoid triggering other events
    event.preventDefault();
    event.stopPropagation();
    
    // Store which point is being dragged
    setDraggedPointIndex(index);
    setIsDragging(true);
    
    // Define the handlers inline to avoid dependency issues
    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      
      // Get the current viewport to account for panning and zooming
      const viewport = reactFlowInstance.getViewport();
      
      // Convert client coords to flow coords accounting for pan and zoom
      const flowPosition = reactFlowInstance.screenToFlowPosition({
        x: moveEvent.clientX,
        y: moveEvent.clientY,
      });
      
      // Update the position of the dragged point
      const newIntermediatePoints = [...intermediatePoints];
      newIntermediatePoints[index] = {
        x: flowPosition.x,
        y: flowPosition.y,
      };
      
      // Update the edge
      reactFlowInstance.setEdges((edges) =>
        edges.map((edge) => {
          if (edge.id === id) {
            return {
              ...edge,
              data: {
                ...edge.data,
                intermediatePoints: newIntermediatePoints,
              },
            };
          }
          return edge;
        })
      );
    };
    
    const handleMouseUp = (upEvent: MouseEvent) => {
      if (upEvent) {
        upEvent.preventDefault();
        upEvent.stopPropagation();
      }
      
      // Clear dragging state
      setDraggedPointIndex(null);
      setIsDragging(false);
      
      // Remove the event listeners
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      // Remove the class from the body to indicate dragging has ended
      document.body.classList.remove('dragging-point');
    };
    
    // Add the event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Add a class to the body to indicate dragging (can be used for cursor styling)
    document.body.classList.add('dragging-point');
  }, [id, intermediatePoints, reactFlowInstance]);
  
  // Handle right-click to delete a point
  const handlePointRightClick = useCallback((event: React.MouseEvent, index: number) => {
    event.preventDefault();
    event.stopPropagation();
    
    // Remove the point at the specified index
    const newIntermediatePoints = [...intermediatePoints];
    newIntermediatePoints.splice(index, 1);
    
    // Update the edge
    reactFlowInstance.setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === id) {
          return {
            ...edge,
            data: {
              ...edge.data,
              intermediatePoints: newIntermediatePoints,
            },
          };
        }
        return edge;
      })
    );
  }, [id, intermediatePoints, reactFlowInstance]);

  // Cleanup event listeners if component unmounts
  useEffect(() => {
    return () => {
      // Remove any lingering drag classes
      document.body.classList.remove('dragging-point');
    };
  }, []);

  const getForegroundColor = () => {
    if (style && typeof style.stroke === 'string') {
      return style.stroke;
    }
    return '#555';
  };

  return (
    <>
      {/* Draw a transparent wider path to make clicking easier */}
      <path
        className="react-flow__edge-interaction"
        d={path}
        strokeWidth={20}
        stroke="transparent"
        fill="none"
        onClick={handleEdgeClick}
      />
      
      {/* Visible path */}
      <path
        className="react-flow__edge-path"
        d={path}
        id={id}
        style={style}
        markerEnd={markerEnd}
      />
      
      {/* Only render control points if the edge is selected */}
      {selected && intermediatePoints.map((point, index) => (
        <g 
          key={`${id}-${index}`} 
          className="editable-edge-point-group"
          data-id={`${id}-${index}`}
          data-testid={`edge-point-${id}-${index}`}
          transform={`translate(${point.x}, ${point.y})`}
          pointerEvents="all"
        >
          {/* Larger invisible hit area */}
          <circle
            r={15}
            fill="transparent"
            style={{ cursor: 'grab' }}
            onMouseDown={(event) => handlePointDragStart(event, index)}
          />
          
          {/* Visible handle */}
          <circle
            className="point-handle"
            r={7}
            fill={draggedPointIndex === index ? '#ff0072' : '#ff6b00'}
            stroke="#fff"
            strokeWidth={2}
            onMouseDown={(event) => handlePointDragStart(event, index)}
            onContextMenu={(event) => handlePointRightClick(event, index)}
            style={{ cursor: 'grab' }}
          />
        </g>
      ))}
    </>
  );
} 