import { Injectable } from '@nestjs/common';

// TODO(docs/architecture-plan.md §H AI Coach, §K V1): tool-calling architecture, scoped
// server-side tools, and the safety-classification layer are all V1 scope, explicitly not
// MVP. Stub only — do not wire this to the AI Gateway until the safety layer exists.
@Injectable()
export class CoachService {
  chat(_userId: string, _message: string): Promise<{ reply: string }> {
    return Promise.resolve({
      reply: 'The AI coach is not available yet — this feature ships in V1.',
    });
  }
}
