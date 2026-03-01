import { act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { renderHook } from '@/test/utils';

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock('@/features/course-upload/api/course-upload.api', () => ({
  CourseUploadApi: {
    uploadCourse: vi.fn()
  }
}));

vi.mock('@/features/map/lib/geocode', () => ({
  reverseGeocode: vi.fn().mockResolvedValue('서울특별시 강남구')
}));

import { CourseUploadApi } from '@/features/course-upload/api/course-upload.api';
import { reverseGeocode } from '@/features/map/lib/geocode';

import { useCourseUpload } from '../useCourseUpload';

import type { CoursePreviewData, StravaPreviewState } from '../../model/types';

const mockUploadCourse = vi.mocked(CourseUploadApi.uploadCourse);
const mockReverseGeocode = vi.mocked(reverseGeocode);

// ─── Fixtures ────────────────────────────────────────────────────────────────
const mockFile = new File(['gpx content'], 'route.gpx', {
  type: 'application/gpx+xml'
});

const mockStravaFile = new File(['strava gpx'], 'run.gpx', {
  type: 'application/gpx+xml'
});

const mockCoursePoints = [
  { pointSeq: 1, lat: 37.5, lng: 127.0, ele: 10 },
  { pointSeq: 2, lat: 37.6, lng: 127.1, ele: 20 }
];

const mockPreviewData: CoursePreviewData = {
  file: mockFile,
  totalDistance: 5000,
  svg: '<svg></svg>',
  coursePointList: mockCoursePoints
};

const mockStravaPreview: StravaPreviewState = {
  file: mockStravaFile,
  activityName: '한강 새벽 러닝',
  totalDistance: 10000,
  svg: '<svg></svg>',
  coursePointList: mockCoursePoints,
  elevationChartData: {
    series: [{ dKm: 0, ele: 10 }],
    totalDistanceKm: 10,
    elevationGain: 100,
    elevationLoss: 50,
    minEle: 10,
    maxEle: 100
  }
};

// ─────────────────────────────────────────────────────────────────────────────

describe('useCourseUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReverseGeocode.mockResolvedValue('서울특별시 강남구');
  });

  // ── 초기 상태 ──────────────────────────────────────────────────────────────
  describe('초기 상태', () => {
    it('formData 초기값', () => {
      const { result } = renderHook(() => useCourseUpload(null));

      expect(result.current.formData).toEqual({
        name: '',
        isMarathon: null,
        envType: null,
        shapeType: null
      });
    });

    it('데이터 없으면 isFormValid=false', () => {
      const { result } = renderHook(() => useCourseUpload(null));

      expect(result.current.isFormValid).toBe(false);
    });
  });

  // ── Strava 이름 자동 입력 ──────────────────────────────────────────────────
  describe('Strava 활동명 자동 입력', () => {
    it('stravaPreview.activityName으로 name 사전 입력', async () => {
      const { result } = renderHook(() => useCourseUpload(null, mockStravaPreview));

      await waitFor(() => {
        expect(result.current.formData.name).toBe('한강 새벽 러닝');
      });
    });

    it('이미 name이 있으면 덮어쓰지 않음', async () => {
      const { result } = renderHook(() => useCourseUpload(null, mockStravaPreview));

      act(() => {
        result.current.setFormData((prev) => ({ ...prev, name: '내가 지은 이름' }));
      });

      await waitFor(() => {
        expect(result.current.formData.name).toBe('내가 지은 이름');
      });
    });
  });

  // ── 주소 자동 조회 ─────────────────────────────────────────────────────────
  describe('주소 자동 조회', () => {
    it('previewData 제공 시 출발/도착 주소 조회', async () => {
      const { result } = renderHook(() => useCourseUpload(mockPreviewData));

      await waitFor(() => {
        expect(result.current.startAddress).toBe('서울특별시 강남구');
        expect(result.current.endAddress).toBe('서울특별시 강남구');
      });

      expect(mockReverseGeocode).toHaveBeenCalledTimes(2);
      expect(mockReverseGeocode).toHaveBeenCalledWith(37.5, 127.0); // start
      expect(mockReverseGeocode).toHaveBeenCalledWith(37.6, 127.1); // end
    });

    it('stravaPreview 제공 시 주소 조회', async () => {
      const { result } = renderHook(() => useCourseUpload(null, mockStravaPreview));

      await waitFor(() => {
        expect(result.current.startAddress).not.toBe('');
      });

      expect(mockReverseGeocode).toHaveBeenCalledTimes(2);
    });

    it('reverseGeocode가 null 반환하면 폴백 메시지 표시', async () => {
      mockReverseGeocode.mockResolvedValue(null);

      const { result } = renderHook(() => useCourseUpload(mockPreviewData));

      await waitFor(() => {
        expect(result.current.startAddress).toBe('주소를 불러올 수 없습니다');
        expect(result.current.endAddress).toBe('주소를 불러올 수 없습니다');
      });
    });

    it('reverseGeocode 중 isLoadingAddresses=true', async () => {
      let resolveGeocode!: (v: string) => void;
      mockReverseGeocode.mockReturnValue(
        new Promise((r) => (resolveGeocode = r))
      );

      const { result } = renderHook(() => useCourseUpload(mockPreviewData));

      expect(result.current.isLoadingAddresses).toBe(true);

      act(() => resolveGeocode('서울'));

      await waitFor(() => {
        expect(result.current.isLoadingAddresses).toBe(false);
      });
    });

    it('coursePointList 없으면 주소 조회 안 함', () => {
      const noPoints: CoursePreviewData = { ...mockPreviewData, coursePointList: [] };
      renderHook(() => useCourseUpload(noPoints));

      expect(mockReverseGeocode).not.toHaveBeenCalled();
    });
  });

  // ── 폼 유효성 검사 ─────────────────────────────────────────────────────────
  describe('isFormValid', () => {
    it('name + isMarathon=true이면 valid (non-marathon 필드 불필요)', async () => {
      const { result } = renderHook(() => useCourseUpload(mockPreviewData));

      act(() => {
        result.current.setFormData({
          name: '테스트 코스',
          isMarathon: true,
          envType: null,
          shapeType: null
        });
      });

      await waitFor(() => expect(result.current.isFormValid).toBe(true));
    });

    it('isMarathon=false이면 envType + shapeType 필수', async () => {
      const { result } = renderHook(() => useCourseUpload(mockPreviewData));
      await waitFor(() => expect(result.current.isLoadingAddresses).toBe(false));

      await act(async () => {
        result.current.setFormData({
          name: '코스',
          isMarathon: false,
          envType: null,
          shapeType: null
        });
      });
      expect(result.current.isFormValid).toBe(false);

      await act(async () => {
        result.current.setFormData({
          name: '코스',
          isMarathon: false,
          envType: 'PARK',
          shapeType: null
        });
      });
      expect(result.current.isFormValid).toBe(false);

      await act(async () => {
        result.current.setFormData({
          name: '코스',
          isMarathon: false,
          envType: 'PARK',
          shapeType: 'LOOP'
        });
      });
      expect(result.current.isFormValid).toBe(true);
    });

    it('name이 공백만이면 invalid', async () => {
      const { result } = renderHook(() => useCourseUpload(mockPreviewData));
      await waitFor(() => expect(result.current.isLoadingAddresses).toBe(false));

      await act(async () => {
        result.current.setFormData({
          name: '   ',
          isMarathon: true,
          envType: null,
          shapeType: null
        });
      });

      expect(result.current.isFormValid).toBe(false);
    });

    it('isMarathon=null이면 invalid', async () => {
      const { result } = renderHook(() => useCourseUpload(mockPreviewData));
      await waitFor(() => expect(result.current.isLoadingAddresses).toBe(false));

      await act(async () => {
        result.current.setFormData({
          name: '코스',
          isMarathon: null,
          envType: null,
          shapeType: null
        });
      });

      expect(result.current.isFormValid).toBe(false);
    });
  });

  // ── 직접 업로드 뮤테이션 ──────────────────────────────────────────────────
  describe('직접 GPX 업로드', () => {
    it('uploadCourse 호출 시 CourseUploadApi.uploadCourse 사용', async () => {
      mockUploadCourse.mockResolvedValue({ courseUuid: 'uuid-123' });
      mockReverseGeocode.mockResolvedValue('서울 강남구');

      const { result } = renderHook(() => useCourseUpload(mockPreviewData));

      await waitFor(() => expect(result.current.isLoadingAddresses).toBe(false));

      act(() => {
        result.current.setFormData({
          name: '한강 코스',
          isMarathon: true,
          envType: null,
          shapeType: null
        });
      });

      await act(async () => {
        await result.current.uploadCourseAsync();
      });

      expect(mockUploadCourse).toHaveBeenCalledWith(
        expect.objectContaining({
          file: mockFile,
          courseName: '한강 코스',
          isMarathon: true
        })
      );
    });

    it('업로드 성공 시 uploadResult에 courseUuid 저장', async () => {
      mockUploadCourse.mockResolvedValue({ courseUuid: 'abc-def' });

      const { result } = renderHook(() => useCourseUpload(mockPreviewData));

      await waitFor(() => expect(result.current.isLoadingAddresses).toBe(false));

      act(() => {
        result.current.setFormData({
          name: '코스',
          isMarathon: true,
          envType: null,
          shapeType: null
        });
      });

      await act(async () => {
        await result.current.uploadCourseAsync();
      });

      await waitFor(() => {
        expect(result.current.uploadResult).toEqual({ courseUuid: 'abc-def' });
      });
    });
  });

  // ── Strava 업로드 뮤테이션 ─────────────────────────────────────────────────
  describe('Strava 활동 업로드', () => {
    it('stravaPreview 있을 때 uploadCourse 사용 (GPX 파일 포함)', async () => {
      mockUploadCourse.mockResolvedValue({ courseUuid: 'strava-uuid' });

      const { result } = renderHook(() =>
        useCourseUpload(null, mockStravaPreview)
      );

      await waitFor(() => expect(result.current.isLoadingAddresses).toBe(false));

      act(() => {
        result.current.setFormData({
          name: '한강 새벽 러닝',
          isMarathon: false,
          envType: 'RIVER',
          shapeType: 'LINEAR'
        });
      });

      await act(async () => {
        await result.current.uploadCourseAsync();
      });

      expect(mockUploadCourse).toHaveBeenCalledWith(
        expect.objectContaining({
          file: mockStravaFile,
          courseName: '한강 새벽 러닝',
          isMarathon: false,
          courseEnvType: 'RIVER',
          courseShapeType: 'LINEAR'
        })
      );
    });
  });

  // ── resetUpload ────────────────────────────────────────────────────────────
  describe('resetUpload', () => {
    it('폼 데이터와 주소 초기화', async () => {
      const { result } = renderHook(() => useCourseUpload(mockPreviewData));

      await waitFor(() => expect(result.current.startAddress).not.toBe(''));

      act(() => {
        result.current.setFormData({
          name: '테스트',
          isMarathon: true,
          envType: null,
          shapeType: null
        });
      });

      act(() => {
        result.current.resetUpload();
      });

      expect(result.current.formData.name).toBe('');
      expect(result.current.formData.isMarathon).toBeNull();
    });
  });
});
