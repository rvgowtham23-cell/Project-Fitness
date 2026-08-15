import { Injectable } from '@nestjs/common';

// TODO(docs/architecture-plan.md §K V2, §L phase 12): quota/entitlement enforcement and
// payment-webhook handling are explicitly deferred past MVP. Stubbed so AI Gateway's future
// per-tier quota checks have a real module to call into rather than a hardcoded stand-in.
@Injectable()
export class SubscriptionService {
  getForUser(_userId: string): Promise<{ tier: 'free' }> {
    return Promise.resolve({ tier: 'free' });
  }
}
