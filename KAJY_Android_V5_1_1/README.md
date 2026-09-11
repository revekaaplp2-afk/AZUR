# KAJY EXPRESS & Stock Pro — Android V5.1.1

Mise à jour Android de l'application web KAJY EXPRESS & Stock Pro 5.1.0.

## Inclus
- Interface HTML actuelle conservée.
- Version applicative 5.1.1.
- Wrapper Android WebView.
- JavaScript + DOM Storage + localStorage activés pour conserver les données locales.
- Sélection de fichiers Android pour logo, import et avatar.
- Accès réseau activé pour la synchronisation multi-PC et les ressources CDN.
- Autorisation HTTP claire pour permettre un endpoint de synchronisation local/réseau.
- Optimisations d'affichage mobile sans refonte du design.
- Bouton retour Android compatible avec la navigation WebView.

## Générer l'APK
Ouvrir ce dossier dans Android Studio, laisser Gradle télécharger les dépendances, puis :
`Build > Build App Bundle(s) / APK(s) > Build APK(s)`.

Le fichier APK de debug sera généralement dans `app/build/outputs/apk/debug/`.

## Important
Le fichier HTML référence encore des ressources CDN externes (Tailwind, Lucide, Chart.js, XLSX, jsPDF). L'application fonctionne pleinement en ligne. Pour un mode 100 % hors-ligne, ces dépendances doivent être embarquées localement dans l'application.
