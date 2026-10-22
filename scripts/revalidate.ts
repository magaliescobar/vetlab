/**
 * Revalidación post-seed — corre automáticamente vía el hook `postseed` de
 * package.json después de `npm run seed`.
 *
 * El seed escribe directo en Mongo y Next no se entera: hay que invalidar los
 * tags globales que quedaron stale. Los tags dinámicos (`owner:${id}`,
 * `owner-pets:${id}`) apuntan a ObjectIds nuevos que aún no están cacheados.
 *
 * Si el dev server no está corriendo no hay caché que invalidar: avisa y sale
 * sin error para no romper `npm run seed`.
 */
const base = process.env.APP_URL ?? "http://localhost:3000";
const secret = process.env.REVALIDATE_SECRET;
const TAGS = ["owners", "pets", "vets", "services"];

async function main() {
  if (!secret) {
    console.warn("REVALIDATE_SECRET no está definido; se omite la revalidación.");
    return;
  }

  for (const tag of TAGS) {
    let res: Response;
    try {
      res = await fetch(`${base}/api/revalidate`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-revalidate-secret": secret,
        },
        body: JSON.stringify({ tag }),
      });
    } catch {
      console.warn(
        `No se pudo contactar ${base} (¿está corriendo "npm run dev"?). ` +
          "Se omite la revalidación.",
      );
      return;
    }
    console.log(`revalidate "${tag}": ${res.status} ${await res.text()}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
