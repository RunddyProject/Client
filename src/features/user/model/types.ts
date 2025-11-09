export interface FeedbackPostRequest {
  feedbackType: 'FEEDBACK' | 'COURSE';
  courseUuid?: string;
  content: string;
}
