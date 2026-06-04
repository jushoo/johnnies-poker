import { createSignal, onMount, Show } from "solid-js";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { Dialog, DialogTitle, DialogDescription } from "~/components/ui/Dialog";
import { Input } from "~/components/ui/Input";
import { vars } from "~/styles/theme.css";
import { grain } from "~/styles/grain.css";

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [name, setName] = createSignal("");
  const [joinCode, setJoinCode] = createSignal("");
  const [dialogOpen, setDialogOpen] = createSignal(false);

  onMount(() => {
    const savedName = sessionStorage.getItem("johnnies-poker-name");
    if (savedName) setName(savedName);

    const redirect = Array.isArray(searchParams.redirect)
      ? searchParams.redirect[0]
      : searchParams.redirect;
    if (redirect) {
      const code = redirect.replace(/^\//, "").toUpperCase();
      setJoinCode(code);
      setDialogOpen(true);
    }
  });

  const handleCreate = () => {
    sessionStorage.setItem("johnnies-poker-name", name().trim());
    navigate(`/${generateRoomCode()}`);
  };

  const handleJoin = (e: Event) => {
    e.preventDefault();
    const code = joinCode().trim().toUpperCase();
    if (code && name().trim()) {
      sessionStorage.setItem("johnnies-poker-name", name().trim());
      navigate(`/${code}`);
    }
  };

  const openJoinDialog = () => {
    setJoinCode("");
    setDialogOpen(true);
  };

  const joinCodeFromUrl = () => !!searchParams.redirect;

  return (
    <>
      <div class={grain} />
      <main
        style={{
          flex: "1",
          display: "flex",
          "flex-direction": "column",
          "align-items": "center",
          "justify-content": "center",
          padding: vars.space.lg,
          "background-color": vars.color.surface,
          position: "relative",
          "z-index": "2",
        }}
      >
        <div
          style={{
            "text-align": "center",
            "margin-bottom": vars.space["3xl"],
          }}
        >
          <div
            style={{
              "font-size": "3rem",
              "line-height": "1",
              "margin-bottom": vars.space.lg,
              opacity: "0.08",
              "user-select": "none",
            }}
          >
            ♠
          </div>
          <h1
            style={{
              "font-size": vars.fontSize["3xl"],
              "font-weight": vars.fontWeight.semibold,
              "letter-spacing": "-0.04em",
              "margin-bottom": vars.space.sm,
            }}
          >
            Johnnie's Poker
          </h1>
          <p
            style={{
              "font-size": vars.fontSize.sm,
              color: vars.color.textMuted,
              "letter-spacing": "0.02em",
              "text-transform": "uppercase",
            }}
          >
            Planning poker for agile teams
          </p>
        </div>

        <div
          style={{
            width: "100%",
            "max-width": "360px",
            display: "flex",
            "flex-direction": "column",
            gap: vars.space.lg,
          }}
        >
          <Card padding="lg" shadow="sm">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreate();
              }}
              style={{
                display: "flex",
                "flex-direction": "column",
                gap: vars.space.md,
              }}
            >
              <label
                style={{
                  display: "block",
                  "font-size": vars.fontSize.sm,
                  "font-weight": vars.fontWeight.medium,
                  color: vars.color.text,
                }}
              >
                Your name
              </label>
              <Input
                placeholder="Enter your display name"
                value={name()}
                onInput={setName}
                autofocus
              />
              <Button
                type="submit"
                size="lg"
                fullWidth
                disabled={!name().trim()}
              >
                Create room
              </Button>
            </form>
          </Card>

          <div style={{ "text-align": "center" }}>
            <button
              onClick={openJoinDialog}
              style={{
                "font-size": vars.fontSize.sm,
                color: vars.color.textMuted,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: `${vars.space.sm} ${vars.space.md}`,
                "border-radius": vars.radius.md,
                transition: "color 150ms ease, background-color 150ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = vars.color.text;
                e.currentTarget.style.backgroundColor = vars.color.surfaceHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = vars.color.textMuted;
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Have a code? <span style={{ "text-decoration": "underline" }}>Join room</span>
            </button>
          </div>
        </div>
      </main>

      <Dialog open={dialogOpen()} onClose={() => setDialogOpen(false)}>
        <Show when={!joinCodeFromUrl()}>
          <DialogTitle>Join a room</DialogTitle>
          <DialogDescription>
            Enter the room code shared with you.
          </DialogDescription>
        </Show>
        <Show when={joinCodeFromUrl()}>
          <DialogTitle>Almost there</DialogTitle>
          <DialogDescription>
            Enter your name to join room {joinCode()}.
          </DialogDescription>
        </Show>

        <form
          onSubmit={handleJoin}
          style={{
            display: "flex",
            "flex-direction": "column",
            gap: vars.space.md,
          }}
        >
          <Show when={!joinCodeFromUrl()}>
            <div>
              <label
                style={{
                  display: "block",
                  "font-size": vars.fontSize.sm,
                  "font-weight": vars.fontWeight.medium,
                  color: vars.color.text,
                  "margin-bottom": vars.space.sm,
                }}
              >
                Room code
              </label>
              <Input
                placeholder="ABCD"
                value={joinCode()}
                onInput={(v) => setJoinCode(v.toUpperCase())}
                autofocus
              />
            </div>
          </Show>

          <div>
            <label
              style={{
                display: "block",
                "font-size": vars.fontSize.sm,
                "font-weight": vars.fontWeight.medium,
                color: vars.color.text,
                "margin-bottom": vars.space.sm,
              }}
            >
              Your name
            </label>
            <Input
              placeholder="Enter your display name"
              value={name()}
              onInput={setName}
              autofocus={joinCodeFromUrl()}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: vars.space.sm,
              "margin-top": vars.space.xs,
            }}
          >
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              fullWidth
              disabled={!joinCode().trim() || !name().trim()}
            >
              Join room
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
