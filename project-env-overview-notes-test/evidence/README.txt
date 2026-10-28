Throwaway copy: git archive d973876 into a temp dir, npm ci in project-env (no branch; the repository was not touched).
Baseline, before the diff: npm test -> tests 306, pass 298, fail 8.
With agent-notice.test.ts.diff applied: npm test -> tests 306, pass 306, fail 0; npm run typecheck clean.
mutation-run.txt: each of the 8 cause headings deleted from OVERVIEW.md in turn -> pass 305, fail 1, the one failure is that cause's own test; restored -> 306/0; one heading demoted to a plain line -> exactly that cause fails.
Reproduce: mkdir d && git archive d973876 | tar -x -C d; cd d && git init -q && git apply <this folder>/agent-notice.test.ts.diff; cd project-env && npm ci && npm test
