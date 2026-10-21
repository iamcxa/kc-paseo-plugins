import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, it } from "node:test";
import type { Project } from "../shared/config.ts";
import { createSecrets } from "../server/secrets.ts";
import { makeWorld } from "./world.ts";

const cleanups: (() => void)[] = [];
afterEach(() => {
  for (const c of cleanups.splice(0)) c();
});

function layout() {
  const base = realpathSync(mkdtempSync(join(tmpdir(), "project-env-paths-")));
  cleanups.push(() => rmSync(base, { recursive: true, force: true }));
  for (const dir of ["real/repo", "real/wt", "real/wt2", "real/other"]) mkdirSync(join(base, dir), { recursive: true });
  symlinkSync(join(base, "real"), join(base, "linkA"));
  symlinkSync(join(base, "real"), join(base, "linkB"));
  return { base, at: (...parts: string[]) => join(base, ...parts) };
}

interface Cwd {
  cwd: string;
  commonDir: string;
  toplevel: string;
}

function gitAnswers(asks: Cwd[], registered: string[], rootForms: string[]) {
  const answers: Record<string, string> = {};
  const key = (...argv: string[]) => argv.join("\0");
  for (const { cwd, commonDir, toplevel } of asks) {
    answers[key("-C", cwd, "rev-parse", "--path-format=absolute", "--git-common-dir")] = `${commonDir}\n`;
    answers[key("-C", cwd, "rev-parse", "--show-toplevel")] = `${toplevel}\n`;
  }
  for (const root of rootForms) {
    answers[key("-C", root, "worktree", "list", "--porcelain")] =
      registered.map((p) => `worktree ${p}\nHEAD 0\n`).join("\n") + "\n";
  }
  return answers;
}

const project = (root: string): Project => ({ root, serviceAccount: "", vault: "", prompt: "", variables: [] });

function secretsFor(answers: Record<string, string>) {
  const world = makeWorld({ git: { answers } });
  cleanups.push(world.cleanup);
  return createSecrets(world.tools);
}

describe("project for a working directory", () => {
  it("finds a project stored through a symlink when git answers the real path", async () => {
    const { at } = layout();
    const stored = project(at("linkA", "repo"));
    const secrets = secretsFor(
      gitAnswers(
        [{ cwd: at("real", "repo"), commonDir: at("real", "repo", ".git"), toplevel: at("real", "repo") }],
        [at("real", "repo")],
        [at("real", "repo")],
      ),
    );
    const found = await secrets.projectForCwd([stored], at("real", "repo"));
    assert.equal(found, stored);
    assert.equal(found?.root, at("linkA", "repo"));
  });

  it("finds a project stored by its real path when git answers through a symlink", async () => {
    const { at } = layout();
    const stored = project(at("real", "repo"));
    const secrets = secretsFor(
      gitAnswers(
        [{ cwd: at("linkA", "repo"), commonDir: at("linkA", "repo", ".git"), toplevel: at("linkA", "repo") }],
        [at("real", "repo")],
        [at("real", "repo"), at("linkA", "repo")],
      ),
    );
    assert.equal(await secrets.projectForCwd([stored], at("linkA", "repo")), stored);
  });

  it("finds a project when the stored and git forms use two different symlinks", async () => {
    const { at } = layout();
    const stored = project(at("linkA", "repo"));
    const secrets = secretsFor(
      gitAnswers(
        [{ cwd: at("linkB", "repo"), commonDir: at("linkB", "repo", ".git"), toplevel: at("linkB", "repo") }],
        [at("real", "repo")],
        [at("real", "repo"), at("linkB", "repo")],
      ),
    );
    assert.equal(await secrets.projectForCwd([stored], at("linkB", "repo")), stored);
  });

  it("finds a project from a registered worktree reached through a symlink", async () => {
    const { at } = layout();
    const stored = project(at("linkB", "repo"));
    const secrets = secretsFor(
      gitAnswers(
        [{ cwd: at("linkA", "wt"), commonDir: at("real", "repo", ".git"), toplevel: at("linkA", "wt") }],
        [at("real", "repo"), at("linkB", "wt")],
        [at("real", "repo")],
      ),
    );
    assert.equal(await secrets.projectForCwd([stored], at("linkA", "wt")), stored);
  });

  it("returns null without throwing when the stored root is gone", async () => {
    const { at } = layout();
    mkdirSync(at("real", "removed"));
    const stored = project(at("linkA", "removed"));
    rmSync(at("real", "removed"), { recursive: true });
    const secrets = secretsFor(
      gitAnswers(
        [{ cwd: at("real", "repo"), commonDir: at("real", "repo", ".git"), toplevel: at("real", "repo") }],
        [at("real", "repo")],
        [at("real", "repo")],
      ),
    );
    assert.equal(await secrets.projectForCwd([stored], at("real", "repo")), null);
  });

  it("keeps other worktrees working when a registered worktree directory is gone", async () => {
    const { at } = layout();
    const stored = project(at("linkA", "repo"));
    const gone = at("real", "wt-gone");
    const registered = [at("real", "repo"), gone, at("real", "wt")];
    const secrets = secretsFor(
      gitAnswers(
        [
          { cwd: at("real", "wt"), commonDir: at("real", "repo", ".git"), toplevel: at("real", "wt") },
          { cwd: gone, commonDir: at("real", "repo", ".git"), toplevel: gone },
        ],
        registered,
        [at("real", "repo")],
      ),
    );
    assert.equal(await secrets.projectForCwd([stored], at("real", "wt")), stored);
    assert.equal(await secrets.projectForCwd([stored], gone), null);
  });

  it("returns null when the stored root is a different repository", async () => {
    const { at } = layout();
    const secrets = secretsFor(
      gitAnswers(
        [{ cwd: at("real", "repo"), commonDir: at("real", "repo", ".git"), toplevel: at("real", "repo") }],
        [at("real", "repo")],
        [at("real", "repo")],
      ),
    );
    assert.equal(await secrets.projectForCwd([project(at("linkA", "other"))], at("real", "repo")), null);
  });

  it("serves an agent in a linked worktree from a project saved at that worktree", async () => {
    const { at } = layout();
    const stored = project(at("real", "wt"));
    const secrets = secretsFor(
      gitAnswers(
        [{ cwd: at("real", "wt"), commonDir: at("real", "repo", ".git"), toplevel: at("real", "wt") }],
        [at("real", "repo"), at("real", "wt"), at("real", "wt2")],
        [at("real", "repo")],
      ),
    );
    assert.equal(await secrets.projectForCwd([stored], at("real", "wt")), stored);
  });

  it("keeps a project saved at the main checkout serving its registered worktree", async () => {
    const { at } = layout();
    const stored = project(at("real", "repo"));
    const secrets = secretsFor(
      gitAnswers(
        [{ cwd: at("real", "wt"), commonDir: at("real", "repo", ".git"), toplevel: at("real", "wt") }],
        [at("real", "repo"), at("real", "wt"), at("real", "wt2")],
        [at("real", "repo")],
      ),
    );
    assert.equal(await secrets.projectForCwd([stored], at("real", "wt")), stored);
  });

  it("does not serve a repository unconnected to the project saved at a worktree", async () => {
    const { at } = layout();
    const secrets = secretsFor(
      gitAnswers(
        [{ cwd: at("real", "other"), commonDir: at("real", "other", ".git"), toplevel: at("real", "other") }],
        [at("real", "other")],
        [at("real", "other")],
      ),
    );
    assert.equal(await secrets.projectForCwd([project(at("real", "wt"))], at("real", "other")), null);
  });

  it("does not serve a sibling worktree from a project saved at another worktree", async () => {
    const { at } = layout();
    const secrets = secretsFor(
      gitAnswers(
        [{ cwd: at("real", "wt2"), commonDir: at("real", "repo", ".git"), toplevel: at("real", "wt2") }],
        [at("real", "repo"), at("real", "wt"), at("real", "wt2")],
        [at("real", "repo")],
      ),
    );
    assert.equal(await secrets.projectForCwd([project(at("real", "wt"))], at("real", "wt2")), null);
  });

  it("lets a worktree's own project win in that worktree only, whatever the list order", async () => {
    const { at } = layout();
    const main = project(at("real", "repo"));
    const own = project(at("real", "wt"));
    const secrets = secretsFor(
      gitAnswers(
        [
          { cwd: at("real", "wt"), commonDir: at("real", "repo", ".git"), toplevel: at("real", "wt") },
          { cwd: at("real", "wt2"), commonDir: at("real", "repo", ".git"), toplevel: at("real", "wt2") },
        ],
        [at("real", "repo"), at("real", "wt"), at("real", "wt2")],
        [at("real", "repo")],
      ),
    );
    for (const list of [[main, own], [own, main]]) {
      assert.equal(await secrets.projectForCwd(list, at("real", "wt")), own);
      assert.equal(await secrets.projectForCwd(list, at("real", "wt2")), main);
    }
  });

  it("still refuses a worktree the main checkout did not register, even when its project is saved", async () => {
    const { at } = layout();
    const secrets = secretsFor(
      gitAnswers(
        [{ cwd: at("real", "wt"), commonDir: at("real", "repo", ".git"), toplevel: at("real", "wt") }],
        [at("real", "repo")],
        [at("real", "repo")],
      ),
    );
    assert.equal(await secrets.projectForCwd([project(at("real", "wt"))], at("real", "wt")), null);
  });
});
