import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { UserApi } from '@/features/user/api/user.api';

import type { FeedbackPostRequest } from '@/features/user/model/types';

export function usePostFeedback() {
  const mutation = useMutation({
    mutationFn: (body: FeedbackPostRequest) => UserApi.postFeedback(body),
    onSuccess: () => {
      toast.success('소중한 의견 감사해요');
    },
    onError: (error) => {
      console.error('[Feedback] submit failed:', error);
    }
  });

  return {
    submitFeedback: mutation.mutate,
    submitFeedbackAsync: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    reset: mutation.reset
  };
}
