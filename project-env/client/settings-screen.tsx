import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";
import {
  type PluginSurfaceProps,
  type SettingsState,
  usePaseo,
  useRpc,
  useSettings,
} from "@getpaseo/plugin/client";
import {
  SettingsAction,
  SettingsCard,
  SettingsInput,
  type SettingsInputHandle,
  SettingsRow,
  SettingsSection,
  SettingsSelect,
} from "@getpaseo/plugin/client/ui";
import {
  importConductor,
  listRefs,
  type Project,
  projectEnv,
  storeToken,
  testProject,
  tokenStatus,
} from "../shared/config";
import { rowHint } from "../shared/cause";
import { pickVault, tokenRowText } from "../shared/token";

type Ready = Extract<SettingsState<typeof projectEnv.schema>, { status: "ready" }>;
type Theme = PluginSurfaceProps["theme"];

const basename = (path: string) => path.split("/").filter(Boolean).pop() ?? path;

function ProjectEditor({
  settings,
  initial,
  theme,
  onDone,
}: {
  settings: Ready;
  initial: Project;
  theme: Theme;
  onDone(): void;
}) {
  const [draft, setDraft] = useState(initial);
  const [revision] = useState(settings.revision);
  const [newName, setNewName] = useState("");
  const text = useMemo(() => ({ color: theme.colors.foreground }), [theme]);
  const muted = useMemo(() => ({ color: theme.colors.foregroundMuted }), [theme]);
  const promptStyle = useMemo(
    () => ({
      color: theme.colors.foreground,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 8,
      padding: 10,
      minHeight: 120,
      textAlignVertical: "top" as const,
    }),
    [theme],
  );

  const status = useRpc(tokenStatus);
  const saveToken = useRpc(storeToken);
  const tokenInput = useRef<SettingsInputHandle>(null);
  const [tokenDraft, setTokenDraft] = useState("");
  const refsRpc = useRpc(listRefs);
  const testRpc = useRpc(testProject);
  const importRpc = useRpc(importConductor);

  const account = draft.serviceAccount.trim();
  const [checked, setChecked] = useState(account);
  const token = useQuery({
    queryKey: ["token", checked],
    queryFn: () => status({ serviceAccount: checked }),
    enabled: checked.length > 0,
    staleTime: Infinity,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });
  const check = () => (account === checked ? void token.refetch() : setChecked(account));
  const store = useMutation({
    mutationFn: () => saveToken({ serviceAccount: account, token: tokenDraft }),
    onSuccess: () => {
      tokenInput.current?.replaceText("");
      setTokenDraft("");
      check();
    },
  });
  const refs = useMutation({
    mutationFn: () => refsRpc({ serviceAccount: account, vault: draft.vault }),
  });
  const test = useMutation({ mutationFn: () => testRpc({ project: draft }) });
  const doImport = useMutation({
    mutationFn: () => importRpc({ root: draft.root }),
    onSuccess: ({ names, prompt }) =>
      setDraft((d) => {
        const have = new Set(d.variables.map((v) => v.name));
        const added = names
          .filter((n) => !have.has(n))
          .map((name) => ({ name, ref: `op://${d.vault || "VAULT"}/${name}/credential` }));
        return { ...d, variables: [...d.variables, ...added], prompt: d.prompt || prompt };
      }),
  });

  const patch = useCallback((change: Partial<Project>) => setDraft((d) => ({ ...d, ...change })), []);
  const setRef = (name: string, ref: string) =>
    patch({ variables: draft.variables.map((v) => (v.name === name ? { ...v, ref } : v)) });

  const save = async () => {
    const others = settings.values.projects.filter((p) => p.root !== draft.root);
    if (await settings.save({ projects: [...others, draft] }, revision)) onDone();
  };
  const remove = async () => {
    const others = settings.values.projects.filter((p) => p.root !== draft.root);
    if (await settings.save({ projects: others }, revision)) onDone();
  };

  const current = account === checked && !token.isFetching ? token.data : undefined;
  const vaults = current?.vaults ?? [];
  useEffect(() => {
    const vault = pickVault(draft.vault, vaults);
    if (vault !== draft.vault) patch({ vault });
  }, [draft.vault, vaults, patch]);
  const tokenText = !account
    ? { label: "No service account named yet", hint: "Name it above, then press Check." }
    : account !== checked
      ? { label: `Not checked for ${account} yet`, hint: "Press Check." }
      : current
        ? tokenRowText(current)
        : { label: "Checking token…", hint: "Asking the Keychain and 1Password." };
  const vaultOptions = current?.state === "ok"
    ? [
        ...(draft.vault === "" ? [{ label: "Choose…", value: "" }] : []),
        ...(draft.vault && !vaults.includes(draft.vault)
          ? [{ label: `${draft.vault} (this token cannot read it)`, value: draft.vault }]
          : []),
        ...vaults.map((v) => ({ label: v, value: v })),
      ]
    : [];
  const refOptions = (refs.data?.refs ?? []).map((r) => ({ label: r, value: r }));

  return (
    <>
      <SettingsSection title={basename(draft.root)}>
        <SettingsCard>
          <SettingsRow label="Main checkout" hint={draft.root} />
          <SettingsInput
            label="1Password service account"
            hint="Keychain item name holding its token, e.g. relay-dev-read"
            initialValue={draft.serviceAccount}
            onChangeText={(serviceAccount) => patch({ serviceAccount })}
          />
          <SettingsAction
            label={tokenText.label}
            hint={tokenText.hint}
            actionLabel={token.isFetching ? "Checking…" : "Check"}
            disabled={!account || token.isFetching}
            onPress={check}
          />
          <SettingsInput
            ref={tokenInput}
            label="Service account token"
            hint="Stored in this Mac's Keychain; never shown again."
            placeholder="ops_…"
            secureTextEntry
            initialValue=""
            onChangeText={setTokenDraft}
            error={store.error ? (store.error as Error).message : undefined}
          />
          <SettingsAction
            label="Save token to Keychain"
            actionLabel={store.isPending ? "Saving…" : "Save token"}
            disabled={!account || !tokenDraft.trim() || store.isPending}
            onPress={() => store.mutate()}
          />
          {vaultOptions.length > 0 ? (
            <SettingsSelect
              label="Vault"
              value={draft.vault}
              options={vaultOptions}
              error={
                draft.vault && !vaults.includes(draft.vault)
                  ? "This token cannot read that vault. Choose one it can read."
                  : undefined
              }
              onValueChange={(vault) => patch({ vault })}
            />
          ) : (
            <SettingsInput
              label="Vault"
              initialValue={draft.vault}
              onChangeText={(vault) => patch({ vault })}
            />
          )}
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="Environment variables">
        <SettingsCard>
          {draft.variables.map((v) =>
            refOptions.length > 0 ? (
              <SettingsSelect
                key={v.name}
                label={v.name}
                value={v.ref}
                options={
                  refOptions.some((o) => o.value === v.ref)
                    ? refOptions
                    : [{ label: v.ref, value: v.ref }, ...refOptions]
                }
                onValueChange={(ref) => setRef(v.name, ref)}
              />
            ) : (
              <SettingsInput
                key={v.name}
                label={v.name}
                initialValue={v.ref}
                placeholder="op://vault/item/field"
                onChangeText={(ref) => setRef(v.name, ref)}
              />
            ),
          )}
          {draft.variables.map((v) => (
            <SettingsAction
              key={`remove-${v.name}`}
              label={`Remove ${v.name}`}
              actionLabel="Remove"
              onPress={() => patch({ variables: draft.variables.filter((x) => x.name !== v.name) })}
            />
          ))}
          <SettingsInput
            label="New variable name"
            initialValue=""
            placeholder="LINEAR_API_KEY"
            onChangeText={setNewName}
          />
          <SettingsAction
            label="Add variable"
            actionLabel="Add"
            disabled={!/^[A-Za-z_][A-Za-z0-9_]*$/.test(newName) || draft.variables.some((v) => v.name === newName)}
            onPress={() =>
              patch({
                variables: [
                  ...draft.variables,
                  { name: newName, ref: `op://${draft.vault || "VAULT"}/${newName}/credential` },
                ],
              })
            }
          />
          <SettingsAction
            label="Pick fields from the vault"
            hint="Lists item and field names only; values are never sent to the app."
            actionLabel={refs.isPending ? "Loading…" : "Browse vault"}
            disabled={current?.state !== "ok" || !vaults.includes(draft.vault) || refs.isPending}
            onPress={() => refs.mutate()}
            error={refs.error ? (refs.error as Error).message : undefined}
          />
          <SettingsAction
            label="Import names and prompt from Conductor"
            hint="Reads variable names and the general prompt from .conductor settings; no values."
            actionLabel="Import"
            onPress={() => doImport.mutate()}
          />
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="Default prompt for new agents">
        <View>
          <TextInput
            multiline
            style={promptStyle}
            placeholderTextColor={theme.colors.foregroundMuted}
            placeholder="Appended to the system prompt of every new agent in this project"
            value={draft.prompt}
            onChangeText={(prompt) => patch({ prompt })}
          />
        </View>
      </SettingsSection>

      <SettingsSection title="Check and save">
        <SettingsCard>
          <SettingsAction
            label="Resolve every variable now"
            hint="Shows set or failed per variable; never the value."
            actionLabel={test.isPending ? "Testing…" : "Test"}
            disabled={test.isPending}
            onPress={() => test.mutate()}
          />
          {(test.data?.results ?? []).map((r) => (
            <SettingsRow key={r.name} label={r.name} hint={rowHint(r)} />
          ))}
          <SettingsAction
            label="Save this project"
            actionLabel="Save"
            disabled={settings.saving}
            onPress={save}
            error={settings.saveError ?? undefined}
          />
          <SettingsAction label="Discard changes" actionLabel="Discard" onPress={onDone} />
          <SettingsAction label="Stop managing this project" actionLabel="Remove" onPress={remove} />
        </SettingsCard>
        <Text style={muted}>
          Values are injected into each agent's environment when its session opens, so the agent
          itself can read them.
        </Text>
        <Text style={text}> </Text>
      </SettingsSection>
    </>
  );
}

function Configured({ settings, theme }: { settings: Ready; theme: Theme }) {
  const paseo = usePaseo();
  const [editing, setEditing] = useState<Project | null>(null);
  const [session, setSession] = useState(0);
  const known = useQuery({ queryKey: ["projects"], queryFn: () => paseo.projects.list() });

  const configured = settings.values.projects;
  const candidates = (known.data?.projects ?? []).filter(
    (p) => !configured.some((c) => c.root === p.projectRootPath),
  );
  const open = (project: Project) => {
    setSession((n) => n + 1);
    setEditing(project);
  };
  const done = () => {
    setEditing(null);
    void settings.reload();
  };

  if (editing) {
    return (
      <ProjectEditor
        key={`${editing.root}-${session}`}
        settings={settings}
        initial={editing}
        theme={theme}
        onDone={done}
      />
    );
  }
  return (
    <SettingsSection title="Projects">
      <SettingsCard>
        {configured.map((p) => (
          <SettingsAction
            key={p.root}
            label={basename(p.root)}
            hint={`${p.variables.length} variables · ${p.serviceAccount || "no service account"}`}
            actionLabel="Edit"
            onPress={() => open(p)}
          />
        ))}
        {candidates.length > 0 ? (
          <SettingsSelect
            label="Add a project"
            value=""
            options={[
              { label: "Choose…", value: "" },
              ...candidates.map((p) => ({ label: p.projectDisplayName, value: p.projectRootPath })),
            ]}
            onValueChange={(root) =>
              root && open({ root, serviceAccount: "", vault: "", variables: [], prompt: "" })
            }
          />
        ) : null}
      </SettingsCard>
    </SettingsSection>
  );
}

export function ProjectEnvSettings({ theme }: PluginSurfaceProps) {
  const settings = useSettings(projectEnv);
  const style = useMemo(() => ({ color: theme.colors.foreground }), [theme]);
  if (settings.status === "loading") return <Text style={style}>Loading…</Text>;
  if (settings.status !== "ready") {
    return (
      <SettingsSection title="Projects">
        <Text style={style}>{settings.error}</Text>
        <SettingsAction label="Try again" actionLabel="Reload" onPress={settings.reload} />
      </SettingsSection>
    );
  }
  return <Configured settings={settings} theme={theme} />;
}
