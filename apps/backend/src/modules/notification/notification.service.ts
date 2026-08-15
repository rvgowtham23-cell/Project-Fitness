import { Injectable } from '@nestjs/common';

// TODO(docs/architecture-plan.md §K, §L phase 9+): push/email delivery, read/unread state,
// and per-user preferences are V1 scope. This stub only proves the module boundary exists.
@Injectable()
export class NotificationService {
  listForUser(_userId: string): Promise<unknown[]> {
    return Promise.resolve([]);
  }
}
