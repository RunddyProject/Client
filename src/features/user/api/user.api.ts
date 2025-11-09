import { api } from '@/shared/lib/http';

import type { FeedbackPostRequest } from '@/features/user/model/types';

export const UserApi = {
  postFeedback: async (body: FeedbackPostRequest): Promise<void> => {
    return api.post(`/feedback`, body);
  }
};
