export interface SavedGPX {
  id: string;
  name: string;
  uploadDate: Date;
  distance: number;
  duration: number;
  elevationGain: number;
  avgPace: string;
  maxElevation: number;
  minElevation: number;
  grade: 1 | 2 | 3 | 4 | 5;
  gpxData: any; // The parsed GPX data
  miniMapSvg?: string; // SVG representation of the route
}

const STORAGE_KEY = 'saved_gpx_courses';

export const gpxStorage = {
  // Get all saved GPX courses
  getAll(): SavedGPX[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // Save a new GPX course
  save(course: Omit<SavedGPX, 'id' | 'uploadDate'>): SavedGPX {
    const courses = this.getAll();
    const newCourse: SavedGPX = {
      ...course,
      id: Date.now().toString(),
      uploadDate: new Date(),
    };

    courses.push(newCourse);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
    return newCourse;
  },

  // Get a specific course by ID
  getById(id: string): SavedGPX | null {
    const courses = this.getAll();
    return courses.find((course) => course.id === id) || null;
  },

  // Delete a course
  delete(id: string): void {
    const courses = this.getAll();
    const filtered = courses.filter((course) => course.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  // Update a course
  update(id: string, updates: Partial<SavedGPX>): SavedGPX | null {
    const courses = this.getAll();
    const index = courses.findIndex((course) => course.id === id);

    if (index === -1) return null;

    courses[index] = { ...courses[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
    return courses[index];
  },
};
