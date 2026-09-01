// Spatial Analysis & PostGIS Simulation Engine

export interface Point2D {
  lat: number;
  lng: number;
}

// Earth radius in meters (WGS84 mean radius)
const EARTH_RADIUS = 6378137;

/**
 * Calculates Haversine distance between two coordinates in meters
 */
export function haversineDistance(p1: Point2D, p2: Point2D): number {
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const lat1 = (p1.lat * Math.PI) / 180;
  const lat2 = (p2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS * c;
}

/**
 * Calculates the geodesic surface area of a polygon in square meters
 * GeoJSON polygon coordinates are [[lng, lat], [lng, lat], ...]
 */
export function calculateGeodesicArea(coordinates: number[][]): number {
  if (!coordinates || coordinates.length < 3) return 0;

  let area = 0;
  const n = coordinates.length;

  for (let i = 0; i < n; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[(i + 1) % n];

    const lng1 = (p1[0] * Math.PI) / 180;
    const lat1 = (p1[1] * Math.PI) / 180;
    const lng2 = (p2[0] * Math.PI) / 180;
    const lat2 = (p2[1] * Math.PI) / 180;

    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = Math.abs((area * EARTH_RADIUS * EARTH_RADIUS) / 2);
  return area;
}

/**
 * Calculates perimeter of a polygon in meters
 */
export function calculatePerimeter(coordinates: number[][]): number {
  if (!coordinates || coordinates.length < 2) return 0;
  let totalDist = 0;
  for (let i = 0; i < coordinates.length - 1; i++) {
    const p1 = { lng: coordinates[i][0], lat: coordinates[i][1] };
    const p2 = { lng: coordinates[i + 1][0], lat: coordinates[i + 1][1] };
    totalDist += haversineDistance(p1, p2);
  }
  return totalDist;
}

/**
 * Calculate centroid of coordinates
 */
export function calculateCentroid(coordinates: number[][]): [number, number] {
  if (!coordinates || coordinates.length === 0) return [0, 0];
  let sumLng = 0;
  let sumLat = 0;
  const count = coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
                coordinates[0][1] === coordinates[coordinates.length - 1][1]
                ? coordinates.length - 1
                : coordinates.length;

  for (let i = 0; i < count; i++) {
    sumLng += coordinates[i][0];
    sumLat += coordinates[i][1];
  }
  return [sumLng / count, sumLat / count];
}

/**
 * Area conversions for Indian agricultural metrics
 */
export function convertArea(sqM: number) {
  const acres = sqM * 0.000247105;
  const hectares = sqM * 0.0001;
  const gunthas = acres * 40; // 1 acre = 40 Gunthas (Maharashtra/Karnataka/AP)
  const cents = acres * 100;  // 1 acre = 100 Cents (Tamil Nadu/Kerala)
  return {
    sqM: Number(sqM.toFixed(2)),
    acres: Number(acres.toFixed(4)),
    hectares: Number(hectares.toFixed(4)),
    gunthas: Number(gunthas.toFixed(2)),
    cents: Number(cents.toFixed(2)),
  };
}

/**
 * Check if a point is inside a polygon using ray casting
 */
export function isPointInPolygon(point: [number, number], polygon: number[][]): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Check if two line segments intersect
 */
function doSegmentsIntersect(
  p1: number[],
  p2: number[],
  p3: number[],
  p4: number[]
): boolean {
  function ccw(a: number[], b: number[], c: number[]) {
    return (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0]);
  }
  return (
    ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4)
  );
}

/**
 * Validate polygon: check minimum points, closedness, self-intersection
 */
export function validatePolygon(coords: number[][]): { isValid: boolean; error?: string } {
  if (!coords || coords.length < 4) {
    return { isValid: false, error: 'A valid land parcel polygon must have at least 3 distinct boundary points.' };
  }

  // Ensure closed
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (Math.abs(first[0] - last[0]) > 0.0000001 || Math.abs(first[1] - last[1]) > 0.0000001) {
    return { isValid: false, error: 'Polygon must be closed (first and last points must coincide).' };
  }

  // Check self-intersection
  const n = coords.length - 1;
  for (let i = 0; i < n; i++) {
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue; // adjacent in cycle
      if (doSegmentsIntersect(coords[i], coords[i + 1], coords[j], coords[j + 1])) {
        return { isValid: false, error: `Self-intersecting boundary detected between segment ${i + 1} and segment ${j + 1}.` };
      }
    }
  }

  const area = calculateGeodesicArea(coords);
  if (area < 10) {
    return { isValid: false, error: 'Polygon area is too small (< 10 sq.m) for an agricultural parcel.' };
  }

  return { isValid: true };
}

/**
 * Calculate max and mean displacement between two polygon boundaries
 */
export function calculateBoundaryDisplacement(oldCoords: number[][], newCoords: number[][]): { maxM: number; meanM: number } {
  let maxDist = 0;
  let totalDist = 0;
  let count = 0;

  const pts1 = oldCoords.slice(0, -1);
  const pts2 = newCoords.slice(0, -1);

  for (const p1 of pts1) {
    let minDist = Infinity;
    for (const p2 of pts2) {
      const d = haversineDistance({ lng: p1[0], lat: p1[1] }, { lng: p2[0], lat: p2[1] });
      if (d < minDist) minDist = d;
    }
    if (minDist !== Infinity) {
      if (minDist > maxDist) maxDist = minDist;
      totalDist += minDist;
      count++;
    }
  }

  return {
    maxM: Number(maxDist.toFixed(3)),
    meanM: Number((count > 0 ? totalDist / count : 0).toFixed(3)),
  };
}

/**
 * Calculate overlap polygon and approximate overlap area between two polygons
 */
export function computePolygonOverlap(polyA: number[][], polyB: number[][]): {
  hasOverlap: boolean;
  overlapAreaSqM: number;
  overlapCoords?: number[][];
} {
  // Simple bounding box fast rejection
  let minXA = Infinity, maxXA = -Infinity, minYA = Infinity, maxYA = -Infinity;
  for (const [x, y] of polyA) {
    if (x < minXA) minXA = x;
    if (x > maxXA) maxXA = x;
    if (y < minYA) minYA = y;
    if (y > maxYA) maxYA = y;
  }
  let minXB = Infinity, maxXB = -Infinity, minYB = Infinity, maxYB = -Infinity;
  for (const [x, y] of polyB) {
    if (x < minXB) minXB = x;
    if (x > maxXB) maxXB = x;
    if (y < minYB) minYB = y;
    if (y > maxYB) maxYB = y;
  }

  // If bounding boxes do not intersect with slight margin
  if (maxXA < minXB || minXA > maxXB || maxYA < minYB || minYA > maxYB) {
    return { hasOverlap: false, overlapAreaSqM: 0 };
  }

  // Grid sample method for robust intersection area calculation
  const gridSteps = 25;
  const iMinX = Math.max(minXA, minXB);
  const iMaxX = Math.min(maxXA, maxXB);
  const iMinY = Math.max(minYA, minYB);
  const iMaxY = Math.min(maxYA, maxYB);

  if (iMaxX <= iMinX || iMaxY <= iMinY) {
    return { hasOverlap: false, overlapAreaSqM: 0 };
  }

  let insideCount = 0;
  const totalSamples = gridSteps * gridSteps;
  const dx = (iMaxX - iMinX) / gridSteps;
  const dy = (iMaxY - iMinY) / gridSteps;
  const intersectionPoints: [number, number][] = [];

  for (let ix = 0; ix < gridSteps; ix++) {
    for (let iy = 0; iy < gridSteps; iy++) {
      const samplePt: [number, number] = [iMinX + (ix + 0.5) * dx, iMinY + (iy + 0.5) * dy];
      if (isPointInPolygon(samplePt, polyA) && isPointInPolygon(samplePt, polyB)) {
        insideCount++;
        intersectionPoints.push(samplePt);
      }
    }
  }

  const bbArea = calculateGeodesicArea([
    [iMinX, iMinY],
    [iMaxX, iMinY],
    [iMaxX, iMaxY],
    [iMinX, iMaxY],
    [iMinX, iMinY],
  ]);

  const overlapArea = (insideCount / totalSamples) * bbArea;

  if (overlapArea > 5) {
    // Generate convex hull of intersection points for display
    return {
      hasOverlap: true,
      overlapAreaSqM: Number(overlapArea.toFixed(2)),
      overlapCoords: [
        [iMinX, iMinY],
        [iMaxX, iMinY],
        [iMaxX, iMaxY],
        [iMinX, iMaxY],
        [iMinX, iMinY],
      ],
    };
  }

  return { hasOverlap: false, overlapAreaSqM: 0 };
}
