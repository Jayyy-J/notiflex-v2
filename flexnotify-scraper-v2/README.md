# FlexNotify Scraper v2 — Accessibility Engine

## Cómo funciona

Usa Android Accessibility Services para leer la pantalla de Amazon Flex
sin necesitar token, proxy ni root.

## Flujo

1. Instala la app en el teléfono del operador
2. Ve a Ajustes → Accesibilidad → FlexNotify Scraper → Activar
3. Abre Amazon Flex → Available Blocks
4. FlexNotify detecta los bloques automáticamente
5. Los envía a Railway API → aparecen en la app de usuarios

## Build APK

```bash
# Requiere Android Studio y SDK instalado
cd android
./gradlew assembleRelease

# APK generado en:
# android/app/build/outputs/apk/release/app-release.apk
```

## Ventajas vs método anterior

- ✅ No requiere token de Amazon
- ✅ No requiere root
- ✅ No requiere proxy
- ✅ Legal (usa Accessibility Services oficiales de Android)
- ✅ No viola términos de Amazon (solo lee la pantalla)
- ✅ Funciona en cualquier Android con Amazon Flex instalado

## Configuración

- API URL: https://notiflex-production.up.railway.app
- API Key: valor de SCRAPER_API_KEY en Railway Variables
