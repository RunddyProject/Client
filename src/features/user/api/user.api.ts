import { api } from '@/shared/lib/http';

import type { UserFeedbackPostRequest } from '@/features/user/model/types';

export const UserApi = {
  postUserFeedback: async (body: UserFeedbackPostRequest): Promise<void> => {
    return api.post(`/feedback`, body);
  }
};
