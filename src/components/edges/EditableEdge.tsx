import React, { useState, useCallback, useEffect } from 'react';
import {
  EdgeProps,
  useReactFlow,
  Node,
} from 'reactflow';

// Interface for the intermediate points
interface IntermediatePoint {
  x: number;
  y: number;
}

// Interface for edge data including intermediate points
interface EditableEdgeData {
  intermediatePoints?: IntermediatePoint[];
  lineType?: 'straight' | 'step';
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

// Get path based on line type
const getPath = (
  sourceX: number, sourceY: number,
  targetX: number, targetY: number,
  intermediatePoints: IntermediatePoint[] = [],
  lineType: 'straight' | 'step' = 'straight'
) => {
  if (lineType === 'straight') {
    return getPolylinePath(sourceX, sourceY, targetX, targetY, intermediatePoints);
  } else if (lineType === 'step') {
    // For step, we'll use intermediate points to create custom step paths
    if (intermediatePoints.length === 0) {
      // Default step path if no points
      const midX = (sourceX + targetX) / 2;
      return `M ${sourceX},${sourceY} H ${midX} V ${targetY} H ${targetX}`;
    }
    // Custom step path using intermediate points
    let path = `M ${sourceX},${sourceY}`;
    intermediatePoints.forEach((point, index) => {
      if (index === 0) {
        // First point: horizontal then vertical
        path += ` H ${point.x} V ${point.y}`;
      } else {
        // Subsequent points: horizontal then vertical
        path += ` H ${point.x} V ${point.y}`;
      }
    });
    // Final step to target
    path += ` H ${targetX} V ${targetY}`;
    return path;
  }
  return getPolylinePath(sourceX, sourceY, targetX, targetY);
};

export default function EditableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  data,
  selected,
}: EdgeProps) {
  const reactFlowInstance = useReactFlow();
  const [draggedPointIndex, setDraggedPointIndex] = useState<number | null>(null);
  
  // Ensure we have a valid data object with intermediatePoints array and lineType
  const edgeData: EditableEdgeData = data || {};
  const intermediatePoints = edgeData.intermediatePoints || [];
  const lineType = edgeData.lineType || 'straight';

  // Create a path drawing function for the edge
  const path = getPath(sourceX, sourceY, targetX, targetY, intermediatePoints, lineType);

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
    // Apply snapping to the new point
    const gridSize = 24;
    const gridThreshold = 12;
    const nodeThreshold = 15;
    
    // First check if we should snap to a node connection point
    const nearestNodePoint = findNearestNodePoint(
      closestSegment.point.x, 
      closestSegment.point.y, 
      reactFlowInstance,
      nodeThreshold
    );
    
    // Determine the final coordinates with snapping
    let finalX, finalY;
    
    if (nearestNodePoint.isSnapped) {
      // Snap to the node point
      finalX = nearestNodePoint.x;
      finalY = nearestNodePoint.y;
    } else {
      // Fall back to grid snapping
      finalX = snapToGridWithThreshold(closestSegment.point.x, gridSize, gridThreshold);
      finalY = snapToGridWithThreshold(closestSegment.point.y, gridSize, gridThreshold);
    }
    
    const newPoint = { x: finalX, y: finalY };
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

  // Function to find the nearest grid point with a threshold for snapping
  const snapToGridWithThreshold = (value: number, gridSize: number, threshold: number = 10): number => {
    const nearestGridPoint = Math.round(value / gridSize) * gridSize;
    const distanceToGridPoint = Math.abs(value - nearestGridPoint);
    
    // If we're within the threshold distance of a grid point, snap to it
    if (distanceToGridPoint <= threshold) {
      return nearestGridPoint;
    }
    
    // Otherwise, return the original value
    return value;
  };
  
  // Function to find the nearest node connection point
  const findNearestNodePoint = (
    x: number, y: number,
    reactFlowInstance: any,
    threshold: number = 15
  ): { x: number, y: number, isSnapped: boolean } => {
    // Get all nodes from the flow
    const allNodes = reactFlowInstance.getNodes();
    let closestPoint = { x, y, isSnapped: false };
    let minDistance = threshold;
    
    // Check each node for potential snap points
    allNodes.forEach((node: Node) => {
      // Node center point
      const nodeX = node.position.x + (node.width || 0) / 2;
      const nodeY = node.position.y + (node.height || 0) / 2;
      
      // Check distance to node center
      const dist = distance(x, y, nodeX, nodeY);
      if (dist < minDistance) {
        minDistance = dist;
        closestPoint = { x: nodeX, y: nodeY, isSnapped: true };
      }
      
      // Check node corners and connection points
      // Top-left, top-right, bottom-left, bottom-right
      const corners = [
        { x: node.position.x, y: node.position.y },
        { x: node.position.x + (node.width || 0), y: node.position.y },
        { x: node.position.x, y: node.position.y + (node.height || 0) },
        { x: node.position.x + (node.width || 0), y: node.position.y + (node.height || 0) }
      ];
      
      corners.forEach(corner => {
        const dist = distance(x, y, corner.x, corner.y);
        if (dist < minDistance) {
          minDistance = dist;
          closestPoint = { x: corner.x, y: corner.y, isSnapped: true };
        }
      });
    });
    
    return closestPoint;
  };

  const [isDragging, setIsDragging] = useState(false);

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
      
  

      
      // Convert client coords to flow coords accounting for pan and zoom
      const flowPosition = reactFlowInstance.screenToFlowPosition({
        x: moveEvent.clientX,
        y: moveEvent.clientY,
      });
      
      // Snap to grid - using 24 as the grid size (matching the Background gap in CircuitCanvas)
      const gridSize = 24;
      // Use enhanced snapping with threshold for better UX
      const gridThreshold = 12; // Half of the grid size for optimal snapping feel
      const nodeThreshold = 15; // Threshold for snapping to node connection points
      
      // First check if we should snap to a node connection point
      const nearestNodePoint = findNearestNodePoint(
        flowPosition.x, 
        flowPosition.y, 
        reactFlowInstance,
        nodeThreshold
      );
      
      // If we found a close node point, use that; otherwise use grid snapping
      let finalX, finalY;
      let isSnapped = false;
      
      if (nearestNodePoint.isSnapped) {
        // Snap to the node point
        finalX = nearestNodePoint.x;
        finalY = nearestNodePoint.y;
        isSnapped = true;
      } else {
        // Fall back to grid snapping
        finalX = snapToGridWithThreshold(flowPosition.x, gridSize, gridThreshold);
        finalY = snapToGridWithThreshold(flowPosition.y, gridSize, gridThreshold);
        
        // Check if we snapped to grid
        isSnapped = (
          Math.abs(finalX - flowPosition.x) <= gridThreshold || 
          Math.abs(finalY - flowPosition.y) <= gridThreshold
        );
      }
      
      // Update the position of the dragged point with snapped coordinates
      const newIntermediatePoints = [...intermediatePoints];
      newIntermediatePoints[index] = {
        x: finalX,
        y: finalY,
      };
      
      // Visual feedback for snapping (could be enhanced with CSS)
      if (isSnapped) {
        // Add a class to the body to indicate snapping
        document.body.classList.add('snapping-active');
      } else {
        document.body.classList.remove('snapping-active');
      }
      
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
      
      // Remove all classes from the body related to dragging and snapping
      document.body.classList.remove('dragging-point');
      document.body.classList.remove('snapping-active');
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
      // Remove any lingering drag and snap classes
      document.body.classList.remove('dragging-point');
      document.body.classList.remove('snapping-active');
    };
  }, []);
  
  // Add CSS styles for snapping visual feedback
  useEffect(() => {
    // Add a style element for our custom CSS if it doesn't exist
    if (!document.getElementById('editable-edge-styles')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'editable-edge-styles';
      styleEl.innerHTML = `
        .snapping-active .point-handle {
          filter: drop-shadow(0 0 5px #3b82f6);
          transform: scale(1.2);
          transition: transform 0.1s ease-out;
        }
        .dragging-point {
          cursor: grabbing !important;
        }
      `;
      document.head.appendChild(styleEl);
    }
    
    // Clean up the style element when component unmounts
    return () => {
      const styleEl = document.getElementById('editable-edge-styles');
      if (styleEl) {
        document.head.removeChild(styleEl);
      }
    };
  }, []);

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
      
      {/* Render control points for all line types when selected */}
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