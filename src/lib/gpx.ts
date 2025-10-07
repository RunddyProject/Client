import type GPXParser from 'gpxparser';
import type { Point } from 'gpxparser';
import type { SavedGPX } from '@/lib/gpx-storage';

// Calculate course statistics from GPX data
export const calculateGPXStats = (gpxData: GPXParser) => {
  if (!gpxData?.tracks?.[0]?.points?.length) {
    return null;
  }

  const points = gpxData.tracks[0].points;
  let distance = 0;
  let elevationGain = 0;
  let minElevation = Infinity;
  let maxElevation = -Infinity;

  // Calculate distance and elevation
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const elevation = point.ele || 0;

    minElevation = Math.min(minElevation, elevation);
    maxElevation = Math.max(maxElevation, elevation);

    if (i > 0) {
      const prevPoint = points[i - 1];
      const d = getDistance(prevPoint.lat, prevPoint.lon, point.lat, point.lon);
      distance += d;

      const elevDiff = elevation - (prevPoint.ele || 0);
      if (elevDiff > 0) {
        elevationGain += elevDiff;
      }
    }
  }

  // Calculate duration (if time data available)
  let duration = 0;
  if (points[0]?.time && points[points.length - 1]?.time) {
    const startTime = new Date(points[0].time);
    const endTime = new Date(points[points.length - 1].time);
    duration = (endTime.getTime() - startTime.getTime()) / 1000; // in seconds
  }

  // Calculate average pace (min/km)
  const avgPace = duration > 0 ? formatPace(duration / (distance / 1000)) : 'N/A';

  // Calculate grade
  const grade = calculateGrade(distance, elevationGain);

  return {
    distance: Math.round(distance),
    duration,
    elevationGain: Math.round(elevationGain),
    avgPace,
    maxElevation: Math.round(maxElevation),
    minElevation: Math.round(minElevation),
    grade,
  };
};

// Haversine formula for distance calculation
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Format pace as MM:SS
const formatPace = (paceInSeconds: number): string => {
  if (!isFinite(paceInSeconds) || paceInSeconds <= 0) return 'N/A';

  const minutes = Math.floor(paceInSeconds / 60);
  const seconds = Math.round(paceInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Unified grade calculation based on average gradient
export const calculateGradeFromGradient = (
  distanceKm: number,
  elevationGain: number
): {
  grade: SavedGPX['grade'];
  gradeKo: string;
  color: string;
  bgColor: string;
  description: string;
  gradient: number;
} => {
  const avgGradient = distanceKm > 0 ? (elevationGain / (distanceKm * 1000)) * 100 : 0;

  if (avgGradient < 2) {
    return {
      grade: 1,
      gradeKo: '쉬움',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: '평탄한 코스로 초보자도 편하게 달릴 수 있습니다.',
      gradient: avgGradient,
    };
  } else if (avgGradient < 5) {
    return {
      grade: 2,
      gradeKo: '보통',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: '적당한 경사가 있어 재미있는 러닝을 즐길 수 있습니다.',
      gradient: avgGradient,
    };
  } else if (avgGradient < 8) {
    return {
      grade: 3,
      gradeKo: '어려움',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: '경사가 가파른 구간이 있어 체력 관리가 필요합니다.',
      gradient: avgGradient,
    };
  } else {
    return {
      grade: 4,
      gradeKo: '매우 어려움',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: '매우 가파른 경사로 고급 러너에게 추천합니다.',
      gradient: avgGradient,
    };
  }
};

// Make calculateGrade function exportable
export const calculateGrade = (distance: number, elevationGain: number): SavedGPX['grade'] => {
  const distanceKm = distance / 1000;
  return calculateGradeFromGradient(distanceKm, elevationGain).grade;
};

// Convert English grade to Korean
export const getGradeInKorean = (grade: SavedGPX['grade']): string => {
  switch (grade) {
    case 1:
      return '쉬움';
    case 2:
      return '보통';
    case 3:
      return '어려움';
    case 4:
      return '매우 어려움';
    default:
      return '알 수 없음';
  }
};

// Generate elevation chart data
export const generateElevationChartData = (gpxData: GPXParser) => {
  if (!gpxData?.tracks?.[0]?.points?.length) {
    return { chartData: [], keyPoints: [], stats: null };
  }

  const points = gpxData.tracks[0].points;

  // Calculate cumulative distance and prepare chart data
  const chartData = points.map((point: Point, index: number) => {
    let cumulativeDistanceMeters = 0;

    // Calculate cumulative distance up to this point in meters
    for (let i = 1; i <= index; i++) {
      const prev = points[i - 1];
      const curr = points[i];

      // Haversine formula for distance calculation (returns meters)
      cumulativeDistanceMeters += getDistance(prev.lat, prev.lon, curr.lat, curr.lon);
    }

    return {
      distance: Number((cumulativeDistanceMeters / 1000).toFixed(2)), // Convert to km for display
      distanceMeters: cumulativeDistanceMeters,
      elevation: point.ele || 0,
      lat: point.lat,
      lon: point.lon,
      index: index,
    };
  });

  // Calculate stats
  const totalDistance = chartData[chartData.length - 1]?.distance || 0;
  const totalDistanceMeters = chartData[chartData.length - 1]?.distanceMeters || 0;
  const minElevation = Math.min(...chartData.map((d) => d.elevation));
  const maxElevation = Math.max(...chartData.map((d) => d.elevation));

  // Calculate actual cumulative elevation gain
  let elevationGain = 0;
  for (let i = 1; i < points.length; i++) {
    const prevElevation = points[i - 1].ele || 0;
    const currentElevation = points[i].ele || 0;
    const elevDiff = currentElevation - prevElevation;
    if (elevDiff > 0) {
      elevationGain += elevDiff;
    }
  }

  // Get key points (start, middle, end, highest, lowest)
  const minElevationPoint = chartData.reduce((min, point) => (point.elevation < min.elevation ? point : min));
  const maxElevationPoint = chartData.reduce((max, point) => (point.elevation > max.elevation ? point : max));

  const keyPoints = [
    { ...chartData[0], label: '시작점', type: 'start' },
    { ...minElevationPoint, label: '최저점', type: 'lowest' },
    { ...maxElevationPoint, label: '최고점', type: 'highest' },
    { ...chartData[chartData.length - 1], label: '도착점', type: 'end' },
  ].filter(
    (point, index, arr) =>
      // Remove duplicates based on distance
      arr.findIndex((p) => Math.abs(p.distance - point.distance) < 0.01) === index
  );

  const stats = {
    totalDistance,
    totalDistanceMeters,
    minElevation,
    maxElevation,
    elevationGain,
    gradeInfo: calculateGradeFromGradient(totalDistance, elevationGain),
  };

  return { chartData, keyPoints, stats };
};

// Generate SVG mini-map from GPX data
export const generateMiniMapSVG = (gpxData: GPXParser, width = 200, height = 120): string => {
  if (!gpxData?.tracks?.[0]?.points?.length) {
    return '';
  }

  const points = gpxData.tracks[0].points;

  // Find bounds
  let minLat = Infinity,
    maxLat = -Infinity;
  let minLon = Infinity,
    maxLon = -Infinity;

  points.forEach((point: Point) => {
    minLat = Math.min(minLat, point.lat);
    maxLat = Math.max(maxLat, point.lat);
    minLon = Math.min(minLon, point.lon);
    maxLon = Math.max(maxLon, point.lon);
  });

  const padding = 10;
  const drawWidth = width - 2 * padding;
  const drawHeight = height - 2 * padding;

  // Create path
  const pathPoints = points
    .map((point: Point, index: number) => {
      const x = padding + ((point.lon - minLon) / (maxLon - minLon)) * drawWidth;
      const y = padding + ((maxLat - point.lat) / (maxLat - minLat)) * drawHeight;
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="hsl(210 40% 96.1%)" rx="4"/>
      <path d="${pathPoints}" 
            stroke="hsl(200 100% 50%)" 
            stroke-width="8" 
            fill="none" 
            stroke-linecap="round" 
            stroke-linejoin="round"/>
      <!-- Start point -->
      <circle cx="${padding + ((points[0].lon - minLon) / (maxLon - minLon)) * drawWidth}" 
              cy="${padding + ((maxLat - points[0].lat) / (maxLat - minLat)) * drawHeight}" 
              r="3" 
              fill="hsl(140 80% 55%)"/>
      <!-- End point -->
      <circle cx="${padding + ((points[points.length - 1].lon - minLon) / (maxLon - minLon)) * drawWidth}" 
              cy="${padding + ((maxLat - points[points.length - 1].lat) / (maxLat - minLat)) * drawHeight}" 
              r="3" 
              fill="hsl(0 84.2% 60.2%)"/>
    </svg>
  `.trim();
};
