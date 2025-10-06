import { api } from './api';

export type CourseLevel = 1 | 2 | 3;
// PARK("공원"), TRAIL("산책로"), TRACK("트랙"), URBAN("도심"), BEACH("해변"), MOUNTAIN("산"), FOREST("숲"), ETC("기타")
export type CourseCategory = '공원' | '산책로' | '트랙' | '도심' | '해변' | '산' | '숲' | '기타';
// LOOP("순환형"),OUT_AND_BACK("왕복형"),POINT_TO_POINT("직선형"),ART("예술형"),ETC("기타")
export type CourseType = 'LOOP' | 'OUT_AND_BACK' | 'LINEAR' | 'ART' | 'ETC';

export interface Course {
  courseUuid: string;
  lat: number;
  lng: number;
  name: string;
  level: CourseLevel;
  category: CourseCategory;
  distance: number;
  courseType: CourseType;
  isBookmarked?: boolean;
}

export interface CoursesResponse {
  courseList: Course[];
}

export const CoursesApi = {
  getCourses: async (lat: number, lng: number): Promise<CoursesResponse> => {
    return api.get<CoursesResponse>(`/course?lat=${lat}&lng=${lng}`, { requiresAuth: false });
  },
};
