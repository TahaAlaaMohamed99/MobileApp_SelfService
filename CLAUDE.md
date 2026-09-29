# MegaHR Mobile App - Self Service

## Critical Rules

### ⚠️ Code Ownership & Preservation

**DO NOT:**
- Delete or remove code that the user added
- Restore or re-add code that the user deleted, even if it looks needed
- Restore the same code under a different name after the user deleted it

**DO:**
- Treat user deletions as deliberate decisions
- If removing code seems to break something or leaves a gap, ask the user what they want instead
- Never silently restore or add equivalent code without explicit permission

---

## Language & Communication

- Reply only in Arabic
- Include clarifying questions in Arabic when needed

---

## Data & Forms

- Use `useFocusEffect` hook, not `useEffect` for fetch-on-focus patterns
- No `react-query` — use native data hooks
- Every AddEdit page ([id].jsx) uses `VacationTransactionForm` as base template
- Employee field always comes from `useUserData` hook (employeeId), never use HR employee-picker

## Layout & Styling

- Keep `flexDirection` as `'row'` — never flip to `'row-reverse'` for RTL
- No new column flags (fullWidth-style) — use unique `rowGroup` values for full-width layout instead
- Never add null/empty check guards in `fieldBlock` in useFormatCell.jsx

## Web-to-Mobile Port

- Match web conditions and status values exactly
- No added branches — only deviate when React Native forces it

## Resources & Configuration

- `resources.json` is append-only during page work
- Never edit/restructure existing keys, only add genuinely missing ones
