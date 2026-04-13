import { runSeed } from "./seed/runSeed";
import { createSeedRuntime, disposeSeedRuntime } from "./seed/runtime";

async function main() {
  const runtime = createSeedRuntime();
  try {
    await runSeed(runtime.prisma);
  } finally {
    await disposeSeedRuntime(runtime);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

