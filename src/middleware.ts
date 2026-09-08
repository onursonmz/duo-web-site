import { defineMiddleware } from "astro:middleware";
import { assertContentGraphOnce } from "@lib/content/graph";
import { assertUniqueTranslationsOnce } from "@lib/content/selectors";

/**
 * Her sayfa üretiminde çalışır (statik build'de prerender sırasında da).
 *
 * Buradaki doğrulamalar, bir sayfanın ilgili koleksiyonu sorgulayıp
 * sorgulamadığından BAĞIMSIZ olarak içeriğin tamamını denetler. Bozuk bir
 * referans veya yinelenen bir `translationKey` varsa hata fırlatılır ve
 * `astro build` sıfırdan farklı exit code ile durur.
 */
export const onRequest = defineMiddleware(async (_context, next) => {
  await assertContentGraphOnce();
  await assertUniqueTranslationsOnce();
  return next();
});
