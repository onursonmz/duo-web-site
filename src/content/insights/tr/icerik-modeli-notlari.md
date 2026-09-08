---
translationKey: content-model-notes
locale: tr
slug: icerik-modeli-notlari
status: draft
title: İçerik modeli notları
excerpt: >-
  Fail-closed bir içerik modeli neden doğrulanmamış iddiaları yayınlamaz ve bu
  kural build sırasında nasıl zorlanır?
series: Mimari Notları
tags:
  - icerik-modeli
  - i18n
authorRef: duosis-ekibi
relatedSolutionRefs:
  - tr/operasyonel-gorunurluk
publishedAt: 2026-09-09
seo:
  title: İçerik modeli notları
  description: >-
    Fail-closed içerik modeli: doğrulanmamış iddia public çıktıya giremez.
  noindex: true
---

Bu not, sitenin içerik modelinin mühendislik kaydıdır. Bir iş iddiası veya
müşteri verisi içermez; bu yüzden yayınlanabilir durumdadır. Sayfa yine de
arama motorlarına kapalı kalır çünkü site geneli hâlâ geliştirme sürümündedir.

## Fail-closed ne demek?

İçerik modeli, bir kaydın public çıktıya girmesi için **açıkça izin verilmiş**
olmasını arar. Varsayılan davranış gizlemektir:

- `status !== "published"` kayıt görünmez.
- `verificationStatus !== "verified"` iddia veya metrik görünmez.
- `logoPermission !== "allowed"` logo hiç render edilmez.
- Teknoloji ancak `lifecycle === "active"` **ve** `decisionNeeded === false`
  ise görünür.

Bu kuralların hepsi merkezi bir seçici katmanından geçer; sayfalar kendi
filtre mantığını yazmaz.

## Neden build'i kırıyoruz?

Sessizce gizlemek, onaylandığı sanılan bir kaydın fark edilmeden görünmez
kalmasına yol açar. Bu yüzden çelişkili bir kayıt — örneğin aynı anda "yayına
hazır" ve "karar bekliyor" olan bir teknoloji — doğrulamada reddedilir ve
build durur. Hata, yayına çıktıktan sonra değil, derleme sırasında görünür.
