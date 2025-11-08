import {
  getCategoryLabel,
  getKeywordMeta
} from '@/features/course/model/constants';

import type {
  DisplayCategorySummary,
  DisplayKeywordSummary,
  DisplayReviewDetailItem,
  DisplayFormCategory,
  CourseReviewPatchRequest
} from '@/features/course/model/types';
import type {
  CourseReviewResponse,
  CourseReviewFormResponse
} from '@/features/course/model/types';

export function toDisplaySummary(data: CourseReviewResponse): {
  summary: DisplayCategorySummary[];
  detail: DisplayReviewDetailItem[];
} {
  const summary: DisplayCategorySummary[] = data.courseReviewSummary.map(
    (cat) => ({
      categoryCode: cat.categoryCode,
      label: getCategoryLabel(cat.categoryCode),
      keywords: cat.courseReviewKeywordList.map<DisplayKeywordSummary>((kw) => {
        const meta = getKeywordMeta(kw.keywordCode);
        return {
          keywordId: kw.keywordId,
          keywordCode: kw.keywordCode,
          count: kw.keywordCount,
          label: meta.label,
          emoji: meta.emoji,
          color: meta.color
        };
      })
    })
  );

  const detail: DisplayReviewDetailItem[] = data.courseReviewDetail.map(
    (d) => ({
      userName: d.userName,
      createdAt: d.createdAt,
      keywords: d.courseReviewKeywordList.map((kw) => {
        const meta = getKeywordMeta(kw.keywordCode);
        return {
          keywordId: kw.keywordId,
          keywordCode: kw.keywordCode,
          label: meta.label,
          emoji: meta.emoji
        };
      })
    })
  );

  return { summary, detail };
}

export function toDisplayForm(data: CourseReviewFormResponse) {
  return {
    hasMyReview: data.hasMyReview,
    categories: data.courseReviewFormDetail.map((cat) => ({
      categoryCode: cat.categoryCode,
      label: getCategoryLabel(cat.categoryCode),
      keywords: cat.courseReviewKeywordFormList.map((kw) => {
        const meta = getKeywordMeta(kw.keywordCode);
        return {
          ...kw,
          label: meta.label,
          emoji: meta.emoji,
          color: meta.color
        };
      })
    }))
  };
}

export function toPatchBodyFromDisplayForm(
  categories: DisplayFormCategory[]
): CourseReviewPatchRequest {
  const allKeywords = categories.flatMap((cat) => cat.keywords);

  return {
    courseReviewKeywordList: allKeywords.map((kw) => ({
      keywordId: kw.keywordId,
      keywordCode: kw.keywordCode,
      isSelected: kw.isSelected
    }))
  };
}
