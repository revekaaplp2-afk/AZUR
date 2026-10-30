# KAJY POS Android — version 8.1.0

Ce projet transforme la version HTML de KAJY POS en application Android plein écran avec WebViewAssetLoader. Le HTML et le service worker sont embarqués dans l'application; les données métier restent stockées dans le navigateur Android (localStorage / IndexedDB) sur l'appareil.

## Générer l'APK

1. Installer Android Studio (version récente) et le JDK 17.
2. Ouvrir le dossier `KAJY_POS_Android_Studio_v8.1.0` dans Android Studio.
3. Laisser Gradle synchroniser les dépendances.
4. Choisir **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
5. L'APK debug sera dans `app/build/outputs/apk/debug/app-debug.apk`.

Pour une diffusion, utiliser **Build > Generate Signed Bundle / APK** et créer une clé de signature à conserver en lieu sûr.

## Fonctionnement et limites

- L'écran de caisse est embarqué et démarre depuis l'origine HTTPS locale Android `appassets.androidplatform.net`.
- JavaScript, DOM Storage et IndexedDB sont activés pour conserver les données localement.
- Le service worker fourni peut gérer le cache sur cette origine HTTPS virtuelle.
- Les bibliothèques CSS/JS externes (Tailwind, Chart.js, XLSX, jsPDF, icônes et polices) sont encore chargées depuis leurs CDN. Une première ouverture avec Internet est donc nécessaire pour que le service worker puisse tenter de les mettre en cache. Si vous exigez un fonctionnement totalement autonome dès la première ouverture sans réseau, il faudra intégrer localement ces bibliothèques dans `assets/`.
- L'autorisation Internet est conservée pour les CDN et une éventuelle synchronisation. Les données locales ne sont pas envoyées automatiquement par ce wrapper.
- La compilation APK n'a pas été exécutée dans cet environnement faute de SDK Android/Gradle installé.

Identifiant Android : `mg.kajy.pos` — Version : `8.1.0`.
