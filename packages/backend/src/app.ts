// Legacy entry point kept for `pnpm --filter @marketplace/backend dev` (tsx src/app.ts).
// Real wiring lives in src/interfaces/http/app.ts.
export { app } from './interfaces/http/app.js';

import { app } from './interfaces/http/app.js';

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`Marketplace Lite Backend API running on :${port}`);
});
