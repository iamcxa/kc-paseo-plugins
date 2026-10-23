import { useMutation, useQuery } from "@tanstack/react-query";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, Text, TextInput, useWindowDimensions, View } from "react-native";
import { Icon, Modal, useToast } from "@getpaseo/plugin/client/react-native";
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
  projectEnv,
  storeToken,
  testProject,
  tokenStatus,
  hasPendingSave,
  unsavedCount,
} from "../shared/config";
import { type MarkEvent, type MarkView, nextMark, rowReason, summaryParts, type Run } from "../shared/test-marks";
import { type Anchor, BUBBLE_WIDTH, FailureMark, MarkBubble } from "./failure-mark";
import { FieldPicker, type VaultList } from "./field-picker";
import { type PillView, pillView } from "../shared/ref";
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

const DIFFERS = "The field name differs from the variable name.";
const WRAP = { overflowWrap: "anywhere" } as object;

function FieldPill({
  name,
  view,
  failed,
  theme,
  onOpen,
}: {
  name: string;
  view: PillView;
  failed: boolean;
  theme: Theme;
  onOpen(): void;
}) {
  const [shown, setShown] = useState(false);
  const [hover, setHover] = useState(false);
  const muted = theme.colors.foregroundMuted;
  const dashed = view.kind === "empty" || view.kind === "raw";
  const label =
    view.kind === "ref"
      ? `${view.vault ? `${view.vault} ` : ""}${view.item} ${view.field}`
      : view.kind === "raw"
        ? view.text
        : "no field picked";
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Field for ${name}: ${label}`}
        onPress={onOpen}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          backgroundColor: view.kind === "empty" ? "transparent" : theme.colors.surface2,
          borderWidth: 1,
          borderStyle: dashed ? "dashed" : "solid",
          borderColor: failed || view.kind === "raw" ? theme.colors.statusDanger : view.kind === "empty" ? muted : "transparent",
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
      >
        {view.kind === "empty" ? (
          <Text style={{ flex: 1, color: muted, fontSize: 14 }}>Pick a field</Text>
        ) : view.kind === "raw" ? (
          <Text style={{ flex: 1, minWidth: 0, color: theme.colors.foreground, fontSize: 14, ...WRAP }}>{view.text}</Text>
        ) : (
          <Text style={{ flex: 1, minWidth: 0, fontSize: 14, color: theme.colors.foreground, ...WRAP }}>
            <Text style={{ color: muted }}>
              {view.vault ? `${view.vault} · ` : ""}
              {view.item} ›{" "}
            </Text>
            {view.field}
          </Text>
        )}
        {view.kind === "ref" && view.differs ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Why ${name} is marked different`}
            hitSlop={12}
            onPress={() => setShown((v) => !v)}
            onHoverIn={() => setHover(true)}
            onHoverOut={() => setHover(false)}
            style={{ borderWidth: 1, borderColor: theme.colors.statusWarning, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 }}
          >
            <Text style={{ color: theme.colors.statusWarning, fontSize: 12 }}>≠</Text>
          </Pressable>
        ) : null}
        <Icon name="ChevronDown" size={14} color={muted} />
      </Pressable>
      {view.kind === "raw" ? (
        <Text style={{ color: theme.colors.statusDanger, fontSize: 12, paddingTop: 4, paddingHorizontal: 4 }}>
          Not a field reference. It looks like op://vault/item/field.
        </Text>
      ) : null}
      {view.kind === "ref" && view.differs && (shown || hover) ? (
        <Text style={{ color: muted, fontSize: 12, paddingTop: 4, paddingHorizontal: 4 }}>{DIFFERS}</Text>
      ) : null}
    </View>
  );
}

function VariableRow({
  variable,
  first,
  reason,
  shown,
  theme,
  pill,
  onMark,
  onRemove,
}: {
  variable: Variable;
  first: boolean;
  reason: string | null;
  shown: boolean;
  theme: Theme;
  pill: ReactNode;
  onMark(event: MarkEvent["type"], anchor: Anchor): void;
  onRemove(): void;
}) {
  const { name } = variable;
  const compact = useWindowDimensions().width < 600;
  const nameText = (
    <Text style={{ color: theme.colors.foreground, fontSize: 14, ...WRAP }}>{name}</Text>
  );
  const cross = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Remove ${name}`}
      hitSlop={10}
      onPress={onRemove}
      style={{ padding: 6 }}
    >
      <Icon name="X" size={16} color={theme.colors.foregroundMuted} />
    </Pressable>
  );
  const mark = (
    <FailureMark
      name={name}
      reason={reason}
      shown={shown}
      theme={theme}
      onPress={(anchor) => onMark("press", anchor)}
      onHover={(on, anchor) => onMark(on ? "hoverIn" : "hoverOut", anchor)}
    />
  );
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: theme.colors.border,
        gap: 8,
      }}
    >
      {compact ? (
        <>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
            <View style={{ flex: 1, minWidth: 0 }}>{nameText}</View>
            {cross}
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 0 }}>
            {pill}
            {mark}
          </View>
        </>
      ) : (
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
          <View style={{ width: 200, paddingTop: 9 }}>{nameText}</View>
          {pill}
          {mark}
          <View style={{ marginTop: 4 }}>{cross}</View>
        </View>
      )}
    </View>
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
      style={{
        flexDirection: "row",
        alignItems: compact ? "flex-start" : "center",
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 11,
      }}
    >
      <View
        accessible
        accessibilityLabel={`${headline}, service account ${account}, vault ${vault}`}
        style={{ flex: 1, flexDirection: "row", alignItems: compact ? "flex-start" : "center", gap: 10 }}
      >
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot, marginTop: compact ? 7 : 0, alignSelf: compact ? "flex-start" : "center" }} />
        <View style={{ flex: 1, flexDirection: compact ? "column" : "row", alignItems: compact ? "flex-start" : "baseline", columnGap: 6 }}>
          <Text style={{ color: theme.colors.foreground, fontSize: 14 }}>{headline}</Text>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ color: theme.colors.foregroundMuted }}>{`${compact ? "" : "·\u00a0"}${account}`}</Text>
            <Text style={{ color: vaultColor }}>{`\u00a0·\u00a0${vault}`}</Text>
          </Text>
        </View>
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

const barButton = (theme: Theme, tone: "plain" | "primary" | "danger" | "dangerSolid", disabled = false) => ({
  borderWidth: 1,
  borderColor:
    tone === "primary"
      ? disabled
        ? theme.colors.border
        : theme.colors.foreground
      : tone === "danger" || tone === "dangerSolid"
        ? theme.colors.statusDanger
        : theme.colors.border,
  backgroundColor:
    tone === "primary" && !disabled
      ? theme.colors.foreground
      : tone === "dangerSolid"
        ? theme.colors.statusDanger
        : "transparent",
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 7,
  opacity: disabled ? 0.5 : 1,
});
const barText = (theme: Theme, tone: "plain" | "primary" | "danger" | "dangerSolid", disabled = false) => ({
  fontSize: 14,
  color:
    tone === "primary"
      ? disabled
        ? theme.colors.foregroundMuted
        : theme.colors.surface0
      : tone === "danger"
        ? theme.colors.statusDanger
        : tone === "dangerSolid"
          ? theme.colors.surface0
          : theme.colors.foreground,
});

function SaveBar({
  count,
  isSaved,
  saving,
  error,
  theme,
  onDiscard,
  onSave,
}: {
  count: number;
  isSaved: boolean;
  saving: boolean;
  error: string | null;
  theme: Theme;
  onDiscard(): void;
  onSave(): void;
}) {
  const pending = hasPendingSave(count, isSaved);
  const canSave = pending && !saving;
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          backgroundColor: theme.colors.surface1,
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          marginTop: 16,
        },
        Platform.OS === "web" ? ({ position: "sticky", bottom: 12, boxShadow: "0 -10px 18px rgba(0,0,0,0.35)" } as object) : null,
      ]}
    >
      <View style={{ flexShrink: 1, flexGrow: 1, gap: 2 }}>
        {error ? (
          <Text accessibilityLiveRegion="polite" style={{ fontSize: 14, color: theme.colors.statusDanger }}>
            {`Not saved: ${error}`}
          </Text>
        ) : null}
        <Text
          accessibilityLiveRegion="polite"
          style={{
            fontSize: error ? 13 : 14,
            color: pending && !error ? theme.colors.foreground : theme.colors.foregroundMuted,
          }}
        >
          {error
            ? count === 0
              ? isSaved
                ? "No unsaved changes. Close reloads the settings."
                : "This new project is still not saved. Discard drops it and reloads the settings."
              : `${count} unsaved ${count === 1 ? "change is" : "changes are"} still here. Discard drops them and reloads the settings.`
            : count > 0
              ? `${count} unsaved ${count === 1 ? "change" : "changes"}`
              : pending
                ? "New project, not saved yet"
                : "No unsaved changes"}
        </Text>
      </View>
      <View style={{ flexDirection: "row", gap: 8, marginLeft: "auto" }}>
        <Pressable accessibilityRole="button" onPress={onDiscard} style={barButton(theme, "plain")}>
          <Text style={barText(theme, "plain")}>{pending ? "Discard" : "Close"}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSave }}
          disabled={!canSave}
          onPress={onSave}
          style={barButton(theme, "primary", !canSave)}
        >
          <Text style={barText(theme, "primary", !canSave)}>{saving ? "Saving…" : "Save"}</Text>
        </Pressable>
      </View>
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
  const { draft, initial, revision } = open;
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
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const toast = useToast();
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
    mutationFn: async (sent: Project): Promise<Run> => ({ sent, results: (await testRpc({ project: sent })).results }),
  });
  const run = test.data;
  const [markView, setMarkView] = useState<MarkView>(null);
  const [bubbleAt, setBubbleAt] = useState({ left: 0, top: 0 });
  const bubbleOrigin = useRef<View>(null);
  const placeBubble = (anchor: Anchor) =>
    bubbleOrigin.current?.measure((_x, _y, _w, _h, originX, originY) =>
      setBubbleAt({
        left: anchor.pageX + anchor.width - BUBBLE_WIDTH - originX,
        top: anchor.pageY + anchor.height / 2 + 18 - originY,
      }),
    );
  const markEvent = (name: string, type: MarkEvent["type"], anchor: Anchor) => {
    if (type !== "hoverOut") placeBubble(anchor);
    setMarkView((view) => nextMark(view, { type, name }));
  };
  const summary = summaryParts(draft, run, test.isPending);
  const width = useWindowDimensions().width;
  const compactHeader = width < 600;
  useEffect(() => setMarkView(null), [width]);
  const shownVariable = draft.variables.find((v) => v.name === markView?.name);
  const shownReason = shownVariable ? rowReason(draft, run, shownVariable) : null;
  const summaryNode = (
    <Text accessibilityLiveRegion="polite" numberOfLines={1} style={{ fontSize: 13 }}>
      {summary.map((p, i) => (
        <Text key={p.text} style={{ color: p.tone === "bad" ? theme.colors.statusDanger : theme.colors.foregroundMuted }}>
          {i > 0 ? " · " : ""}
          {p.text}
        </Text>
      ))}
    </Text>
  );
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
    if (await settings.save({ projects: [...others, draft] }, revision)) {
      toast.show(`Saved ${basename(draft.root)}`, { variant: "success" });
      onDone();
    }
  };
  const isSaved = settings.values.projects.some((p) => p.root === draft.root);
  const count = unsavedCount(initial, draft);
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
  const fix = "Close this list, fix the 1Password connection on this page, then open it again.";
  const unusable =
    current?.state === "ok"
      ? vaultReadable
        ? null
        : {
            message: draft.vault ? "This token cannot read that vault." : "No vault chosen yet.",
            hint: "Choose a vault it can read, then open this list again.",
          }
      : token.isFetching
        ? null
        : { message: tokenText.label, hint: `${tokenText.hint} ${fix}` };
  const list: VaultList = refs.isError
    ? {
        status: "error",
        message: (refs.error as Error).message.replace(/^Request failed:\s*/, "").replace(/\s+requestType=.*$/s, ""),
        hint: fix,
      }
    : refs.data
      ? { status: "ready", refs: refs.data.refs, skipped: refs.data.skipped }
      : unusable
        ? { status: "error", ...unusable }
        : { status: "loading" };
  const [picking, setPicking] = useState<string | null>(null);
  const pickingVariable = draft.variables.find((v) => v.name === picking);
  useEffect(() => {
    refs.reset();
  }, [account, draft.vault]);
  useEffect(() => {
    if (picking !== null && !refs.data && !refs.isPending && !refs.isError && current?.state === "ok" && vaultReadable) {
      refs.mutate();
    }
  }, [picking, refs, current?.state, vaultReadable]);

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

      <SettingsSection
        title="Variables"
        info="Test resolves every variable now and never shows a value. Set means a value came back from 1Password; it does not prove the service accepts that key."
        trailing={
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {compactHeader ? null : summaryNode}
            {draft.variables.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Test"
                disabled={test.isPending}
                onPress={() => {
                  setMarkView(null);
                  test.mutate(draft);
                }}
                style={{
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  opacity: test.isPending ? 0.5 : 1,
                }}
              >
                <Text style={{ color: theme.colors.foreground, fontSize: 14 }}>Test</Text>
              </Pressable>
            ) : null}
          </View>
        }
      >
        {compactHeader && summary.length > 0 ? <View style={{ paddingBottom: 8 }}>{summaryNode}</View> : null}
        <SettingsCard>
          {draft.variables.map((v, i) => {
            const reason = rowReason(draft, run, v);
            return (
              <VariableRow
                key={v.name}
                variable={v}
                first={i === 0}
                reason={reason}
                shown={markView?.name === v.name && reason !== null}
                theme={theme}
                onMark={(type, anchor) => markEvent(v.name, type, anchor)}
                onRemove={() => patch({ variables: draft.variables.filter((x) => x.name !== v.name) })}
                pill={
                  <FieldPill
                    name={v.name}
                    view={pillView(v.ref, v.name, draft.vault)}
                    failed={reason !== null}
                    theme={theme}
                    onOpen={() => {
                      if (refs.isError) refs.reset();
                      setPicking(v.name);
                    }}
                  />
                }
              />
            );
          })}
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
            label="Import names and prompt from Conductor"
            hint={importNote ?? "Reads variable names and the general prompt from .conductor settings; no values."}
            actionLabel={doImport.isPending ? "Importing…" : "Import"}
            disabled={doImport.isPending}
            onPress={() => doImport.mutate()}
          />
        </SettingsCard>
        <View ref={bubbleOrigin} pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, width: 0, height: 0, zIndex: 20 }}>
          {markView !== null && shownReason !== null ? (
            <MarkBubble reason={shownReason} left={bubbleAt.left} top={bubbleAt.top} theme={theme} />
          ) : null}
        </View>
      </SettingsSection>

      <FieldPicker
        title={`Field for ${picking ?? ""}`}
        open={picking !== null}
        onOpenChange={(o) => !o && setPicking(null)}
        name={picking}
        vault={draft.vault}
        current={pickingVariable?.ref ?? ""}
        holders={draft.variables}
        list={list}
        theme={theme}
        onPick={(ref) => {
          if (picking !== null) setRef(picking, ref);
          setPicking(null);
        }}
      />

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

      <View style={{ marginTop: -6, marginBottom: 28 }}>
        <Text style={muted}>
          Values are injected into each agent's environment when its session opens, so the agent
          itself can read them.
        </Text>
      </View>

      {isSaved ? (
        <SettingsSection title="Danger zone">
          <SettingsCard>
            <SettingsRow
              label="Stop managing this project"
              hint="Deletes its variables and default prompt now, without Save. The Keychain token stays."
            >
              <Pressable accessibilityRole="button" onPress={() => setConfirmStop(true)} style={barButton(theme, "danger")}>
                <Text style={barText(theme, "danger")}>Stop managing</Text>
              </Pressable>
            </SettingsRow>
          </SettingsCard>
        </SettingsSection>
      ) : null}
      <Modal title={`Stop managing ${basename(draft.root)}?`} open={confirmStop} onOpenChange={setConfirmStop}>
        <Modal.Content>
          <Text style={text}>
            This deletes the project's variables and default prompt from this plugin right away,
            without Save. Agents already open keep the values they have. The token stays in the
            Keychain.{count > 0 ? ` Your ${count} unsaved ${count === 1 ? "change is" : "changes are"} dropped too.` : ""}
          </Text>
          {settings.saveError ? <Text style={{ color: theme.colors.statusDanger }}>{settings.saveError}</Text> : null}
          <View style={{ flexDirection: "row", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <Pressable accessibilityRole="button" onPress={() => setConfirmStop(false)} style={barButton(theme, "plain")}>
              <Text style={barText(theme, "plain")}>Keep this project</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={settings.saving}
              onPress={remove}
              style={barButton(theme, "dangerSolid", settings.saving)}
            >
              <Text style={barText(theme, "dangerSolid")}>Stop managing</Text>
            </Pressable>
          </View>
        </Modal.Content>
      </Modal>

      <Modal
        title={`Discard ${count} unsaved ${count === 1 ? "change" : "changes"}?`}
        open={confirmDiscard}
        onOpenChange={setConfirmDiscard}
      >
        <Modal.Content>
          <Text style={text}>They are dropped and the project list reads the saved settings again.</Text>
          <View style={{ flexDirection: "row", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <Pressable accessibilityRole="button" onPress={() => setConfirmDiscard(false)} style={barButton(theme, "plain")}>
              <Text style={barText(theme, "plain")}>Keep editing</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onDone} style={barButton(theme, "dangerSolid")}>
              <Text style={barText(theme, "dangerSolid")}>Discard changes</Text>
            </Pressable>
          </View>
        </Modal.Content>
      </Modal>

      <SaveBar
        count={count}
        isSaved={isSaved}
        saving={settings.saving}
        error={settings.saveError}
        theme={theme}
        onDiscard={() => (count > 0 ? setConfirmDiscard(true) : onDone())}
        onSave={save}
      />
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
