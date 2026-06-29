# Access, Assignment & Instrument Rework — Design Spec

**Date:** 2026-06-30
**Status:** Draft for review
**Type:** Foundational (the reporting feature — `2026-06-30-assessment-reporting-design.md` — layers on top of this and should be built after it).

---

## 1. Goal & Motivation

Make **assignment govern access** so each role's functions are real and privacy-respecting. Today the codebase intends this but defers it — `RecordsAccess` literally notes *"Per-psychologist 'assigned only' filtering is deferred."* Current gaps:
- **Children:** every psychologist sees **all** records (no `assigned_psychologist` filter).
- **Assessments:** a psychologist sees only assessments **they authored**, but can pick **any** child to assess.
- **Instruments:** every assessment-taker sees **all** active instruments — no ownership/targeting.

This rework finishes the intended RBAC: psychologists are isolated to their assigned children across every function, instruments are owned per-psychologist, and reassignment is an explicit, auditable action. It also bundles three small assessment-area UX refinements.

---

## 2. Scope

### In scope
1. **Psychologist isolation** to assigned children across Records, Assessment-taking, Results, and Dashboard.
2. **Assignment / reassignment workflow** (admin + staff), including a per-reassignment **"carry history?"** choice.
3. **Instrument ownership** — each instrument owned by exactly one psychologist (owner-only model).
4. **Server-side enforcement** (querysets + serializer validation), not just hidden UI.
5. **UX refinements:** (a) move "Assessment Instruments" nav into Casework below Records; (b) "View Results" shortcut on the Assessment page; (c) answers recap on Review & Sign.

### Out of scope
- The reporting feature itself (separate spec) — though this makes its "assigned children" assumptions real.
- The edit-with-audit lock (`is_locked`) — defined in the reporting spec.
- Multiple psychologists per child (a child has exactly **one** assigned psychologist at a time).
- Behavior-taxonomy instrument matching (rejected in favor of owner-only).

---

## 3. Role / Access Matrix

| Area | Psychologist | Admin | Staff |
|---|---|---|---|
| Records (children) | only `assigned_psychologist = self` | all | all |
| Assign / reassign psychologist | — | ✅ | ✅ |
| Take assessment | only **assigned** children + **owned** instruments | ✗ (psychologists only) | ✗ (cannot take) |
| Assessment results | own assigned children's, per carry-history rule | all | all (read-only) |
| Instruments | only ones they **own** | all + set/reassign owner | ✗ |
| Dashboard | metrics over assigned children | agency-wide | agency-wide |

> Admin + Staff keep **full access** (they create records and do the assigning). Only Psychologists are isolated.

---

## 4. Data Model Changes

- **`Questionnaire.owner`** → `ForeignKey(User, on_delete=SET_NULL, null=True, blank=True, related_name="owned_instruments")` — the one psychologist who owns the instrument. Null allowed for legacy rows (admin assigns later); SET_NULL so archiving/removing a user never deletes instruments.
- **`Child.assignee_sees_history`** → `BooleanField(default=True)` — set at (re)assignment; controls whether the **current** assignee sees the child's prior assessments.
- Migrations: `assessments/000X_questionnaire_owner.py`, `children/000X_child_assignee_sees_history.py`.

---

## 5. Access Rules (the heart)

**Records (`ChildViewSet.get_queryset` + object-level):**
- Psychologist → `Child.objects.filter(assigned_psychologist=self)`; Admin/Staff → all (existing archived filter unchanged).

**Assessment results (`AssessmentViewSet.get_queryset`, list/retrieve):**
- Psychologist → `Assessment.objects.filter(child__assigned_psychologist=self).filter(Q(child__assignee_sees_history=True) | Q(psychologist=self))`.
  - So with **carry = yes**, the assignee sees the child's full history; with **carry = no**, only assessments they authored for that child.
- Admin/Staff → all.

**Take assessment (`AssessmentWriteSerializer.validate`) — psychologists only (`ASSESSMENT_TAKER_ROLES = (Psychologist,)`):**
- Reject unless `child.assigned_psychologist == request.user` (`"That child is not assigned to you."`).
- Reject unless `questionnaire.owner == request.user` (`"That instrument is not yours."`).

**Instruments (`QuestionnaireViewSet` + `ActiveQuestionnaireListView`):**
- Psychologist → `filter(owner=self)`; Admin → all.
- Create: Psychologist → `owner` forced to `self`; Admin → `owner` taken from payload (required, must be a Psychologist).
- Admin may edit `owner` (reassign an instrument).

**Dashboard:** psychologist aggregates computed over `assigned_psychologist = self` children; admin/staff agency-wide (the reporting summary endpoint).

---

## 6. Assignment & Reassignment Workflow

- Admin/Staff set `assigned_psychologist` on a child (existing `psychologist` field in `ChildSerializer`).
- On **(re)assignment**, the UI presents **"Carry this child's assessment history over to the new psychologist?"** → writes `assignee_sees_history` (yes = True, no = False).
- The change is logged to the activity feed (`updated`, record, Child).
- Every assessment always keeps its original `psychologist` (author), so per-psychologist reporting stays accurate regardless of reassignment.

---

## 7. UX Refinements

1. **Navigation** (`Sidebar.jsx`): move **Assessment Instruments** from the Clinical section into **Casework**, directly below **Records**. Resulting groups: Casework = Records → Assessment Instruments; Clinical = Assessment → Assessment Results. (Governance drops Compliance & Audit per the reporting decision.)
2. **Assessment page shortcut** (`Assessment.jsx`): add a **"View Results"** button at the top that navigates to `/report` (Assessment Results).
3. **Review & Sign answers recap** (`Assessment.jsx` step 4): render a **read-only list of every question and the answer given** (from the wizard's local `answers` state — no backend change), so the psychologist reviews responses before signing. Satisfies the adviser's "psychologists can review children's assessment answers."

---

## 8. Backend Changes Summary

- Models + migrations (§4).
- `children/views.py` — scope `ChildViewSet.get_queryset` for psychologists.
- `accounts/permissions.py` — `ASSESSMENT_TAKER_ROLES = (Role.PSYCHOLOGIST,)` (remove Administrator; taking + analyze are psychologist-only).
- `assessments/views.py` — scope `AssessmentViewSet.get_queryset` (carry-history rule), scope `QuestionnaireViewSet.get_queryset` + `ActiveQuestionnaireListView` by owner, force/require `owner` on create.
- `assessments/serializers.py` — add `owner` to `QuestionnaireSerializer`; add assigned-child + owned-instrument validation to `AssessmentWriteSerializer`.
- `children/serializers.py` — expose `assignee_sees_history` (write) on `ChildSerializer`.
- Activity logging on (re)assignment.

## 9. Frontend Changes Summary

- `Children.jsx` — list now shows only the psychologist's caseload (backend-driven); the Assign Psychologist control gains the **carry-history** toggle on reassignment.
- `Assessment.jsx` — child + instrument pickers are auto-scoped (backend), plus the View Results shortcut and the answers recap.
- `Questionnaires.jsx` (Instruments) — psychologist sees own; admin sees all with an **owner** column + owner picker on create.
- `Sidebar.jsx` — nav move.
- Dashboard — psychologist view scoped to caseload.

---

## 10. Relationship to the Reporting Spec

The reporting spec's **Child Progress Report** (psychologist sees "assigned/own") and **Agency Summary** (admin/staff, full) already assume this model — this rework makes it real. Per-psychologist agency stats attribute by assessment author and are unaffected by reassignment. Build this spec **first**, then reporting on top.

---

## 11. Testing

- **Records scoping:** psychologist sees only assigned children; cannot retrieve an unassigned child by id (object-level 404/403).
- **Assessment results carry-history:** with `assignee_sees_history=True`, new assignee sees full history; with `False`, only own-authored; author attribution preserved.
- **Take-assessment validation:** rejects an unassigned child and an unowned instrument; admin bypasses.
- **Instrument ownership:** psychologist sees/manages only owned; create forces owner=self; admin can set/reassign owner.
- **Reassignment:** flag set correctly; activity logged.
- **UX:** manual verification via run/preview per role (caseload scoping visible, nav placement, View Results shortcut, answers recap on sign).

---

## 12. Success Criteria

1. A psychologist sees **only their assigned children** in Records, the assessment child-picker, Results, and Dashboard — and cannot reach others' data via direct API calls.
2. A psychologist sees/uses **only instruments they own**; admin can create instruments for, and reassign them between, psychologists.
3. Reassigning a child offers the **carry-history** choice and it governs what the new psychologist sees.
4. The three UX refinements are in place (nav move, View Results shortcut, answers recap).
5. All new access rules are covered by passing backend tests.

---

## 13. Resolved Decisions
- **Assessment-taking is psychologist-only** — `ASSESSMENT_TAKER_ROLES = (Role.PSYCHOLOGIST,)`; admins no longer take or analyze assessments (they oversee/report).
- **Staff can flip carry-history** — both Admin and Staff assign/reassign and set the "carry history?" choice.
