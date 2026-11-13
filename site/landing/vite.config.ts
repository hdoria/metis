import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type PluginOption } from "vite"

// Two build targets from one source:
// - "metis.md": the public site. `vite build --mode metis-md` (npm run build:metis-md), and the default whenever
//   ../preview is absent (e.g. after this folder is copied into the Métis repo). Output: ./dist (copy it over the
//   VitePress output; see IMPORT.md at the metis-landing repo root). No service worker, no search-engine opt-out, canonical
//   and share image on https://metisapp.com.br, docs links relative (/docs, /start/install, ...).
// - "preview": the private preview build. Adds what lives in ../preview (search-engine opt-out, private assets, service worker) and
//   writes ../public for the Worker.
const previewDir = resolve(import.meta.dirname, "../preview")
const licensePath = resolve(import.meta.dirname, "../../LICENSE")

const licenseAsset: PluginOption = {
  name: "metis-license",
  generateBundle() {
    this.emitFile({ type: "asset", fileName: "LICENSE.txt", source: readFileSync(licensePath, "utf8") })
  },
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      if (request.url?.split("?")[0] !== "/LICENSE.txt") return next()
      response.setHeader("Content-Type", "text/plain; charset=utf-8")
      response.end(readFileSync(licensePath, "utf8"))
    })
  },
}

export default defineConfig(async ({ mode }) => {
  const site = process.env.METIS_SITE ?? (mode === "metis-md" || !existsSync(previewDir) ? "metis.md" : "preview")
  const isPreview = site === "preview"
  const plugins: PluginOption[] = [react(), tailwindcss(), licenseAsset]
  if (isPreview) plugins.push((await import(resolve(previewDir, "vite-plugin.mjs"))).default())
  return {
    plugins,
    define: { __METIS_MD__: JSON.stringify(!isPreview) },
    resolve: {
      alias: {
        "@site-boot": isPreview ? resolve(previewDir, "src/boot.ts") : resolve(import.meta.dirname, "src/site-boot.ts"),
        "@": resolve(import.meta.dirname, "./src"),
      },
    },
    build: { outDir: resolve(import.meta.dirname, isPreview ? "../public" : "dist"), emptyOutDir: true, chunkSizeWarningLimit: 800 },
    server: { proxy: isPreview ? { "/api": "http://localhost:8787" } : undefined },
  }
})
