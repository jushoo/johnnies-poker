import { createSignal, onMount } from "solid-js";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { Button } from "~/components/ui/Button";
import { Card } from "~/components/ui/Card";
import { Input } from "~/components/ui/Input";
import { vars } from "~/styles/theme.css";

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
  const [joinCode, setJoinCode] = createSignal("");
  const [name, setName] = createSignal("");

  onMount(() => {
    const savedName = sessionStorage.getItem("johnnies-poker-name");
    if (savedName) {
      setName(savedName);
    }
    const redirect = searchParams.redirect;
    if (redirect) {
      const code = redirect.replace(/^\//, "").toUpperCase();
      setJoinCode(code);
    }
  });

  const handleCreate = () => {
    sessionStorage.setItem("johnnies-poker-name", name().trim());
    const code = generateRoomCode();
    navigate(`/${code}`);
  };

  const handleJoin = (e: Event) => {
    e.preventDefault();
    const code = joinCode().trim().toUpperCase();
    if (code && name().trim()) {
      sessionStorage.setItem("johnnies-poker-name", name().trim());
      navigate(`/${code}`);
    }
  };

  return (
    <main
      style={{
        "flex": "1",
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "center",
        padding: vars.space.lg,
        "background-color": vars.color.surface,
      }}
    >
      <div style={{ "text-align": "center", "margin-bottom": vars.space["2xl"] }}>
        <h1
          style={{
            "font-size": vars.fontSize["3xl"],
            "font-weight": vars.fontWeight.semibold,
            "margin-bottom": vars.space.sm,
          }}
        >
          Johnnie's Poker
        </h1>
        <p style={{ "font-size": vars.fontSize.base }}>
          Minimalist planning poker for agile teams
        </p>
      </div>

      <Card padding="lg" shadow="sm" style={{ width: "100%", "max-width": "420px" }}>
        <div style={{ display: "flex", "flex-direction": "column", gap: vars.space.lg }}>
          <div>
            <label
              style={{
                display: "block",
                "font-size": vars.fontSize.sm,
                "font-weight": vars.fontWeight.medium,
                "margin-bottom": vars.space.sm,
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
          </div>

          <Button onClick={handleCreate} size="lg" fullWidth disabled={!name().trim()}>
            Create new room
          </Button>

          <div
            style={{
              display: "flex",
              "align-items": "center",
              gap: vars.space.md,
              color: vars.color.textMuted,
              "font-size": vars.fontSize.sm,
            }}
          >
            <div style={{ flex: 1, height: "1px", "background-color": vars.color.border }} />
            or
            <div style={{ flex: 1, height: "1px", "background-color": vars.color.border }} />
          </div>

          <form onSubmit={handleJoin} style={{ display: "flex", "flex-direction": "column", gap: vars.space.md }}>
            <Input
              placeholder="Enter room code"
              value={joinCode()}
              onInput={(v) => setJoinCode(v.toUpperCase())}
            />
            <Button variant="secondary" type="submit" fullWidth disabled={!joinCode().trim() || !name().trim()}>
              Join room
            </Button>
          </form>
        </div>
      </Card>
    </main>
  );
}
