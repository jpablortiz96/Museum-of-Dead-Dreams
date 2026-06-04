import { useEffect, useState } from "react";
import { ArrowRight, Github, Search, Skull } from "lucide-react";
import { ParticleCanvas } from "./ParticleCanvas";
import { TypewriterText } from "./TypewriterText";

interface WelcomeScreenProps {
  onSubmit: (username: string) => void;
  isLoading: boolean;
  error?: string | null;
  initialUsername?: string;
}

const sampleUsers = ["octocat", "gaearon", "torvalds"];
const githubUsernamePattern = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

export function WelcomeScreen({
  onSubmit,
  isLoading,
  error,
  initialUsername = "",
}: WelcomeScreenProps) {
  const [username, setUsername] = useState(initialUsername);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setUsername(initialUsername);
  }, [initialUsername]);

  const handleSubmit = () => {
    const normalizedUsername = username.trim();

    if (!normalizedUsername) {
      setLocalError("Enter a GitHub username to open the museum.");
      return;
    }

    if (!githubUsernamePattern.test(normalizedUsername)) {
      setLocalError("Use a valid GitHub username. Letters, numbers, and single hyphens only.");
      return;
    }

    setLocalError(null);
    onSubmit(normalizedUsername);
  };

  const activeError = localError ?? error ?? null;

  return (
    <div className="relative min-h-screen museum-gradient overflow-hidden">
      <ParticleCanvas color="120, 119, 198" count={90} />
      <div className="scanline absolute inset-0 z-10" />

      <div className="relative z-20 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-4xl rounded-[2rem] border border-white/10 bg-black/25 p-8 shadow-2xl backdrop-blur-md md:p-12">
          <div className="mb-10 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
              <Github className="h-4 w-4 text-white/70" />
              <span className="text-xs font-mono-code tracking-[0.25em] text-white/60">
                GITHUB GRAVEYARD GENERATOR
              </span>
            </div>

            <h1 className="font-display text-5xl font-bold tracking-wider text-white md:text-7xl">
              <span className="glow-text">Museum of</span>
              <br />
              <span className="glow-text-red text-[#e94560]">Dead Dreams</span>
            </h1>

            <div className="mx-auto my-6 h-px w-28 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <p className="mx-auto max-w-2xl text-base font-light text-white/55 md:text-lg">
              <TypewriterText
                text="Every developer has a graveyard. Let's find yours."
                speed={28}
              />
            </p>
          </div>

          <div className="mx-auto grid max-w-3xl gap-8 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="rounded-2xl border border-white/10 bg-[#0f111a]/80 p-6">
              <label
                htmlFor="github-username"
                className="mb-3 block text-xs font-mono-code uppercase tracking-[0.3em] text-white/45"
              >
                Enter the developer
              </label>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <input
                    id="github-username"
                    value={username}
                    onChange={(event) => {
                      setUsername(event.target.value);
                      if (localError) {
                        setLocalError(null);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleSubmit();
                      }
                    }}
                    placeholder="github username"
                    autoComplete="off"
                    spellCheck={false}
                    className="museum-input w-full pl-11 pr-4"
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="btn-museum-primary inline-flex min-w-[180px] items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Skull className="h-4 w-4" />
                  <span>Enter Museum</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {activeError && (
                <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {activeError}
                </div>
              )}

              <div className="mt-6">
                <div className="mb-3 text-xs font-mono-code uppercase tracking-[0.25em] text-white/35">
                  Sample graveyards
                </div>
                <div className="flex flex-wrap gap-3">
                  {sampleUsers.map((sampleUser) => (
                    <button
                      key={sampleUser}
                      type="button"
                      onClick={() => {
                        setUsername(sampleUser);
                        setLocalError(null);
                      }}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                    >
                      {sampleUser}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#151826] to-[#0c0e16] p-6">
              <div className="mb-4 text-xs font-mono-code uppercase tracking-[0.3em] text-blue-300/70">
                What the curator does
              </div>
              <div className="space-y-4 text-sm leading-relaxed text-white/65">
                <p>1. Fetches public repositories from GitHub.</p>
                <p>2. Finds the most abandoned ones by time since last push.</p>
                <p>3. Autogenerates epitaphs, causes of death, artifacts, and Copilot commentary.</p>
                <p>4. Builds a museum unique to that username, ready to explore and share.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
