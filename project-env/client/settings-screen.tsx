import { useMutation, useQuery } from "@tanstack/react-query";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, TextInput, useWindowDimensions, View } from "react-native";
import { Icon, Modal, TextInput as HostInput } from "@getpaseo/plugin/client/react-native";
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
  type Variable,
  newVariable,
  refusal,
  splitImported,
  variableLine,
  projectEnv,
  storeToken,
  testProject,
  tokenStatus,
} from "../shared/config";
import type { Cause } from "../shared/cause";
import { type OpenProject, openProject, useOpenProject } from "./open-project";
import {
  canReadVault,
  connectionLine,
  pickVault,
  projectsUsingName,
  serviceAccountNameError,
  tokenRowText,
  tokenShapeError,
  vaultChoices,
} from "../shared/token";

type Ready = Extract<SettingsState<typeof projectEnv.schema>, { status: "ready" }>;
type Theme = PluginSurfaceProps["theme"];

type Result = { name: string; ok: boolean; cause?: Cause };

function RefPicker({
  name,
  value,
  options,
  theme,
  onPick,
}: {
  name: string;
  value: string;
  options: { label: string; value: string }[];
  theme: Theme;
  onPick(ref: string): void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Field for ${name}`}
        onPress={() => setOpen(true)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          width: 260,
          backgroundColor: theme.colors.surface2,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
      >
        <Text
          numberOfLines={1}
          style={{ flex: 1, color: value ? theme.colors.foreground : theme.colors.foregroundMuted, fontSize: 14 }}
        >
          {value || "Pick a field"}
        </Text>
        <Icon name="ChevronDown" size={14} color={theme.colors.foregroundMuted} />
      </Pressable>
      <Modal title={`Field for ${name}`} open={open} onOpenChange={setOpen}>
        <Modal.Content>
          {options.map((o) => (
            <Pressable
              key={o.value}
              accessibilityRole="button"
              onPress={() => {
                onPick(o.value);
                setOpen(false);
              }}
              style={{ paddingVertical: 8 }}
            >
              <Text style={{ color: o.value === value ? theme.colors.accent : theme.colors.foreground, fontSize: 14 }}>
                {o.label}
              </Text>
            </Pressable>
          ))}
        </Modal.Content>
      </Modal>
    </>
  );
}

function VariableRow({
  variable,
  result,
  theme,
  children,
  onRemove,
}: {
  variable: Variable;
  result: Result | undefined;
  theme: Theme;
  children: ReactNode;
  onRemove(): void;
}) {
  const { name } = variable;
  const line = variableLine(variable, result);
  return (
    <SettingsRow
      label={name}
      hint={line && !line.failed ? line.text : undefined}
      error={line?.failed ? line.text : undefined}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 }}>
        {children}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Remove ${name}`}
          onPress={onRemove}
          style={{
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 7,
          }}
        >
          <Text style={{ color: theme.colors.foreground, fontSize: 14 }}>Remove</Text>
        </Pressable>
      </View>
    </SettingsRow>
  );
}

function ConnectionLineRow({
  line,
  account,
  vault,
  theme,
  onChange,
}: {
  line: ReturnType<typeof connectionLine>;
  account: string;
  vault: string;
  theme: Theme;
  onChange(): void;
}) {
  const dot =
    line.kind === "connected"
      ? theme.colors.statusSuccess
      : line.kind === "problem"
        ? theme.colors.statusDanger
        : theme.colors.foregroundMuted;
  const headline = line.kind === "connected" ? "Connected" : line.kind === "problem" ? line.label : "Checking…";
  const compact = useWindowDimensions().width < 520;
  const vaultColor = line.kind === "problem" ? theme.colors.foregroundMuted : theme.colors.foreground;
  return (
    <View
      accessible
      accessibilityLabel={`${headline}, service account ${account}, vault ${vault}`}
      style={{
        flexDirection: "row",
        alignItems: compact ? "flex-start" : "center",
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 11,
      }}
    >
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot, marginTop: compact ? 7 : 0, alignSelf: compact ? "flex-start" : "center" }} />
      <View style={{ flex: 1, flexDirection: compact ? "column" : "row", alignItems: compact ? "flex-start" : "baseline", columnGap: 6 }}>
        <Text style={{ color: theme.colors.foreground, fontSize: 14 }}>{headline}</Text>
        <Text style={{ fontSize: 14 }}>
          <Text style={{ color: theme.colors.foregroundMuted }}>{`${compact ? "" : "·\u00a0"}${account}`}</Text>
          <Text style={{ color: vaultColor }}>{`\u00a0·\u00a0${vault}`}</Text>
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Change the 1Password connection"
        onPress={onChange}
        style={{
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 7,
        }}
      >
        <Text style={{ color: theme.colors.foreground, fontSize: 14 }}>Change</Text>
      </Pressable>
    </View>
  );
}

const basename = (path: string) => path.split("/").filter(Boolean).pop() ?? path;

function ProjectEditor({
  settings,
  open,
  theme,
  onDone,
}: {
  settings: Ready;
  open: OpenProject;
  theme: Theme;
  onDone(): void;
}) {
  const { draft, edits, revision } = open;
  const [newName, setNewName] = useState("");
  const nameInput = useRef<SettingsInputHandle>(null);
  const [importNote, setImportNote] = useState<string | null>(null);
  const [confirmStop, setConfirmStop] = useState(false);
  const resumed = open.changing;
  const [before, setBefore] = useState(resumed ?? { serviceAccount: draft.serviceAccount, vault: draft.vault });
  const [view, setView] = useState<"line" | "setup" | "change">(
    resumed ? "change" : draft.serviceAccount.trim() !== "" && draft.vault !== "" ? "line" : "setup",
  );
  const backToLine = () => {
    openProject.setChanging(null, open.session);
    setView("line");
  };
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
  const latestToken = useRef("");
  const [tokenRefusal, setTokenRefusal] = useState<string | null>(null);
  const [sharedWith, setSharedWith] = useState<string[] | null>(null);
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
    mutationFn: (submitted: { serviceAccount: string; token: string }) => saveToken(submitted),
    onSuccess: ({ stored, ...status }, { token: pasted }) => {
      if (!stored) {
        if (latestToken.current === pasted) setTokenRefusal(`Not saved: ${tokenRowText(status).label}`);
        return;
      }
      if (latestToken.current === pasted) {
        tokenInput.current?.replaceText("");
        setTokenDraft("");
      }
      check();
    },
    onError: (error, { token: pasted }) => {
      if (latestToken.current === pasted) setTokenRefusal(error.message);
    },
  });
  const pressSave = () => {
    const refused = tokenShapeError(tokenDraft, account) ?? serviceAccountNameError(account);
    setTokenRefusal(refused);
    if (refused) return;
    const others = projectsUsingName(settings.values.projects, draft.root, account);
    if (others.length > 0) setSharedWith(others);
    else store.mutate({ serviceAccount: account, token: tokenDraft });
  };
  const clearTokenMessages = () => {
    setTokenRefusal(null);
    setSharedWith(null);
  };
  const refs = useMutation({
    mutationFn: () => refsRpc({ serviceAccount: account, vault: draft.vault }),
  });
  const test = useMutation({
    mutationFn: ({ project }: { project: Project; edits: number }) => testRpc({ project }),
  });
  const testResults = test.variables?.edits === edits ? test.data?.results : undefined;
  const doImport = useMutation({
    mutationFn: () => importRpc({ root: draft.root }),
    onSuccess: ({ names, prompt }) => {
      const { skipped } = splitImported(names, []);
      setImportNote(
        skipped.length === 0
          ? null
          : `Skipped ${skipped.map((x) => x.name).join(", ")}: reserved names, so the agent keeps its own value.`,
      );
      openProject.update(
        (d) => ({
          ...d,
          variables: [
            ...d.variables,
            ...splitImported(names, d.variables.map((v) => v.name)).add.map(newVariable),
          ],
          prompt: d.prompt || prompt,
        }),
        true,
        open.session,
      );
    },
  });

  const patch = useCallback((change: Partial<Project>) => {
    openProject.update((d) => ({ ...d, ...change }), true);
  }, []);
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

  const nameRefusal = refusal(newName, draft.variables.map((v) => v.name));
  const current = account === checked && !token.isFetching ? token.data : undefined;
  const vaults = current?.vaults ?? [];
  const vaultIds = current?.vaultIds ?? [];
  const vaultReadable = canReadVault({ vaults, vaultIds }, draft.vault);
  useEffect(() => {
    const vault = pickVault(draft.vault, vaults);
    if (vault !== draft.vault) patch({ vault });
  }, [draft.vault, vaults, patch]);
  const tokenText = !account
    ? { label: "No service account named yet", hint: "Name it above, then press Check." }
    : account !== checked
      ? { label: `Not checked for ${account} yet`, hint: "Press Check." }
      : current
        ? tokenDraft.trim() !== "" && current.state === "ok"
          ? { label: "Saved token works", hint: `${tokenRowText(current).hint ?? ""}. The token you typed is not saved yet.` }
          : tokenRowText(current)
        : { label: "Checking token…", hint: "Asking the Keychain and 1Password." };
  const vaultOptions = current?.state === "ok"
    ? [
        ...(draft.vault === "" ? [{ label: "Choose…", value: "" }] : []),
        ...(draft.vault && !vaultReadable
          ? [{ label: `${draft.vault} (this token cannot read it)`, value: draft.vault }]
          : []),
        ...vaultChoices({ vaults, vaultIds }, draft.vault),
      ]
    : [];
  const line = connectionLine({
    vault: draft.vault,
    fetching: token.isFetching || account !== checked,
    failed: token.isError,
    status: token.data,
  });
  const nothingPending = tokenDraft.trim() === "" && sharedWith === null && !store.isPending;
  useEffect(() => {
    if (view === "setup" && line.kind === "connected" && nothingPending) setView("line");
  }, [view, line.kind, nothingPending]);
  const refOptions = (refs.data?.refs ?? []).map((r) => ({ label: r, value: r }));

  return (
    <>
      <View style={{ gap: 2, marginBottom: 20 }}>
        <Text style={{ color: theme.colors.foreground, fontSize: 20, fontWeight: "500" }}>{basename(draft.root)}</Text>
        <Text style={{ color: theme.colors.foregroundMuted, fontSize: 12 }}>{draft.root}</Text>
      </View>
      <SettingsSection title="1Password">
        {view === "line" ? (
          <SettingsCard>
            <ConnectionLineRow
              line={line}
              account={account}
              vault={draft.vault}
              theme={theme}
              onChange={() => {
                const snapshot = { serviceAccount: draft.serviceAccount, vault: draft.vault };
                openProject.setChanging(snapshot, open.session);
                setBefore(snapshot);
                setView("change");
              }}
            />
          </SettingsCard>
        ) : (
        <SettingsCard>
          <SettingsInput
            label="1Password service account"
            hint="Keychain item name holding its token, e.g. relay-dev-read"
            initialValue={draft.serviceAccount}
            onChangeText={(serviceAccount) => {
              patch({ serviceAccount });
              clearTokenMessages();
            }}
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
            onChangeText={(text) => {
              latestToken.current = text;
              setTokenDraft(text);
              clearTokenMessages();
            }}
            error={tokenRefusal ?? undefined}
          />
          <SettingsAction
            label="Save token to Keychain"
            actionLabel={store.isPending ? "Checking…" : "Save token"}
            disabled={!account || !tokenDraft.trim() || store.isPending || sharedWith !== null}
            onPress={pressSave}
          />
          {sharedWith !== null ? (
            <>
              <SettingsRow
                label={`${account} is also used by ${sharedWith.map(basename).join(" and ")}`}
                hint={`Replacing its token changes it for ${sharedWith.length > 1 ? "all of them" : basename(sharedWith[0])} too. The new token is checked first; a rejected token is not saved.`}
              />
              <SettingsAction
                label={`Replace the token under ${account}`}
                actionLabel="Replace"
                onPress={() => {
                  setSharedWith(null);
                  store.mutate({ serviceAccount: account, token: tokenDraft });
                }}
              />
              <SettingsAction
                label="Keep the current token"
                actionLabel="Cancel"
                onPress={() => setSharedWith(null)}
              />
            </>
          ) : null}
          {vaultOptions.length > 0 ? (
            <SettingsSelect
              label="Vault"
              value={draft.vault}
              options={vaultOptions}
              error={
                draft.vault && !vaultReadable
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
          {view === "change" ? (
            <SettingsAction
              label="Use this connection"
              hint={
                tokenDraft.trim() !== ""
                  ? "Save the token or clear the field first."
                  : line.kind !== "connected"
                    ? "Available once the connection works."
                    : undefined
              }
              actionLabel="Done"
              disabled={line.kind !== "connected" || !nothingPending}
              onPress={backToLine}
            />
          ) : null}
          {view === "change" ? (
            <SettingsAction
              label="Keep the current connection"
              actionLabel="Cancel"
              onPress={() => {
                if (draft.serviceAccount !== before.serviceAccount || draft.vault !== before.vault) patch(before);
                setChecked(before.serviceAccount.trim());
                setTokenDraft("");
                latestToken.current = "";
                clearTokenMessages();
                backToLine();
              }}
            />
          ) : null}
        </SettingsCard>
        )}
      </SettingsSection>

      <SettingsSection title="Environment variables">
        <SettingsCard>
          {draft.variables.map((v) => (
            <VariableRow
              key={v.name}
              variable={v}
              theme={theme}
              result={testResults?.find((r) => r.name === v.name)}
              onRemove={() => patch({ variables: draft.variables.filter((x) => x.name !== v.name) })}
            >
              {refOptions.length > 0 ? (
                <RefPicker
                  name={v.name}
                  value={v.ref}
                  options={
                    v.ref === "" || refOptions.some((o) => o.value === v.ref)
                      ? refOptions
                      : [{ label: v.ref, value: v.ref }, ...refOptions]
                  }
                  theme={theme}
                  onPick={(ref) => setRef(v.name, ref)}
                />
              ) : (
                <HostInput
                  defaultValue={v.ref}
                  placeholder="op://vault/item/field"
                  placeholderTextColor={theme.colors.foregroundMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={(ref) => setRef(v.name, ref)}
                  style={{
                    color: theme.colors.foreground,
                    backgroundColor: theme.colors.surface2,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    width: 260,
                    fontSize: 14,
                  }}
                />
              )}
            </VariableRow>
          ))}
          {draft.variables.length > 0 ? (
            <SettingsAction
              label="Check the variables"
              hint="Resolves every variable now and shows the result on its row; never the value. Set means a value came back from 1Password; it does not prove the service accepts that key."
              actionLabel={test.isPending ? "Testing…" : "Test"}
              disabled={test.isPending}
              onPress={() => test.mutate({ project: draft, edits })}
            />
          ) : null}
          <SettingsInput
            ref={nameInput}
            label="New variable name"
            initialValue=""
            placeholder="LINEAR_API_KEY"
            onChangeText={setNewName}
            error={nameRefusal ?? undefined}
          />
          <SettingsAction
            label="Add variable"
            actionLabel="Add"
            disabled={newName === "" || nameRefusal !== null}
            onPress={() => {
              if (nameRefusal !== null) return;
              patch({
                variables: [
                  ...draft.variables,
                  newVariable(newName),
                ],
              });
              nameInput.current?.replaceText("");
              setNewName("");
            }}
          />
          <SettingsAction
            label="Pick fields from the vault"
            hint="Lists item and field names only; values are never sent to the app."
            actionLabel={refs.isPending ? "Loading…" : "Browse vault"}
            disabled={current?.state !== "ok" || !vaultReadable || refs.isPending}
            onPress={() => refs.mutate()}
            error={refs.error ? (refs.error as Error).message : undefined}
          />
          {(refs.data?.skipped ?? []).map((s, i) => (
            <SettingsRow key={`${i}-${s.item}`} label={s.item} hint={`Not listed: ${s.reason}`} />
          ))}
          <SettingsAction
            label="Import names and prompt from Conductor"
            hint={importNote ?? "Reads variable names and the general prompt from .conductor settings; no values."}
            actionLabel={doImport.isPending ? "Importing…" : "Import"}
            disabled={doImport.isPending}
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
            onChangeText={(prompt) => openProject.update((d) => ({ ...d, prompt }), false)}
          />
        </View>
      </SettingsSection>

      <SettingsSection title="Save">
        <SettingsCard>
          <SettingsAction
            label="Save this project"
            actionLabel="Save"
            disabled={settings.saving}
            onPress={save}
            error={settings.saveError ?? undefined}
          />
          <SettingsAction label="Discard changes" actionLabel="Discard" onPress={onDone} />
          <SettingsAction
            label="Stop managing this project"
            hint="Deletes its variables and default prompt now. The Keychain token stays."
            actionLabel="Stop managing"
            onPress={() => setConfirmStop(true)}
          />
        </SettingsCard>
        <Modal title={`Stop managing ${basename(draft.root)}?`} open={confirmStop} onOpenChange={setConfirmStop}>
          <Modal.Content>
            <Text style={text}>
              This deletes the project's variables and default prompt from this plugin right away,
              without Save. Agents already open keep the values they have. The token stays in the
              Keychain.
            </Text>
            <SettingsCard>
              <SettingsAction label="Keep this project" actionLabel="Keep" onPress={() => setConfirmStop(false)} />
              <SettingsAction
                label="Stop managing"
                actionLabel="Stop managing"
                disabled={settings.saving}
                onPress={remove}
                error={settings.saveError ?? undefined}
              />
            </SettingsCard>
          </Modal.Content>
        </Modal>
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
  const editing = useOpenProject();
  const known = useQuery({ queryKey: ["projects"], queryFn: () => paseo.projects.list() });

  const configured = settings.values.projects;
  const candidates = (known.data?.projects ?? []).filter(
    (p) => !configured.some((c) => c.root === p.projectRootPath),
  );
  const open = (project: Project) => openProject.begin(project, settings.revision);
  const done = () => {
    openProject.close(editing?.session);
    void settings.reload();
  };

  if (editing) {
    return (
      <ProjectEditor
        key={`${editing.initial.root}-${editing.session}`}
        settings={settings}
        open={editing}
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
