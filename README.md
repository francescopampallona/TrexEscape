Spostare tutti gli asset web nella cartella www

**GENERAZIONE PROGETTO ANDROID CON CAPACITOR**

npm init -y

npm install @capacitor/core @capacitor/android

npm install -D @capacitor/cli

npx cap init

npx cap add android

npx cap sync

npx cap open android

**GENERAZIONE PROGETTO IOS CON CAPACITOR**

npm install @capacitor/ios

npx cap add ios

npx cap sync ios

npx cap open ios

**IN SEGUITO A UNA MODIFICA ESEGUIRE**

npx cap sync android

npx cap sync ios
