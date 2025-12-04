**ngModel Audit**

This short audit lists occurrences of Angular `ngModel` in the codebase and notes whether the file also uses reactive form bindings (`formControlName`). `avg-data` was fixed (removed mixed usage).

- **Scope**: files under `src/` were scanned for `ngModel`.

- **Findings**:
  - `src/app/login/login.component.html`:
    - Several inputs use `[(ngModel)]` (forgot/reset flows).
    - This template also uses `formControlName` for the login form fields (`username`, `password`). Recommendation: migrate the template-driven parts to reactive forms or mark `ngModel` bindings as standalone when intentionally separate.

  - `src/app/warehouse/warehouse.component.html`:
    - Uses `[(ngModel)]` for change-password inputs (pure template-driven). No `formControlName` found in the same file.

  - `src/app/submetering/submetering.component.html`:
    - Uses `[(ngModel)]` for change-password inputs (pure template-driven). No `formControlName` found in the same file.

  - `src/app/baseline/baseline.component.html`:
    - Uses `[(ngModel)]` in table row editors for `row.CurrentConsump`. No `formControlName` found.

  - `src/app/avg-data/avg-data.component.html` and `.ts`:
    - Previously mixed `formControlName` with `[(ngModel)]` on the same inputs. This has been fixed: `[(ngModel)]` removed and the component now updates reactive controls using `avgDataForm.patchValue(...)` after data fetch.

  - `src/app/dashboard/dashboard.component.html`:
    - Uses `[(ngModel)]` for password change inputs (pure template-driven). No `formControlName` found in this file.

- **Recommendations**:
  - Preferred: migrate forms to a single strategy per form — for complex forms prefer reactive (`FormGroup` + `formControlName`).
  - Quick fix when not migrating: for intentionally standalone `ngModel` bindings, add `[ngModelOptions]="{standalone:true}"` to avoid Angular trying to register the control with a parent reactive form.
  - If you'd like, I can:
    - Migrate chosen templates to reactive forms (one component at a time), or
    - Apply `ngModelOptions` where you prefer to keep template-driven controls, or
    - Generate a more detailed per-line report (with exact line numbers) for code review.

- **Status**: `avg-data` mixed usage fixed and verified (lint + tests passed).

Generated on: 2025-12-04
