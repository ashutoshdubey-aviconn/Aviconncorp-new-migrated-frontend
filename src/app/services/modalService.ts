// ModalService archived to `patches/unused/modalService.ts`.
// This file is intentionally left as a noop shim to avoid import errors.
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ModalService {
  // Archived — no-op methods. Use the copy in `patches/unused` if you need
  // the original implementation for recovery.
  add(_modal: any): void { }
  remove(_id: string): void { }
  open(_id: string): void { }
  close(_id: string): void { }
}