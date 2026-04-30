import i18next from 'i18next'
import es from './locales/es.json' with {type: 'json'}
import en from './locales/en.json' with {type: 'json'}

//Singleton
const i18n = i18next.createInstance() 

await i18n.init({
    lng: 'es', //idioma navegador - con navigator.language accedemos al idioma del usuario
    fallbackLng: 'es', //idioma respaldo
    resources: {
        es: { translation: es},
        en: { translation: en}
    }
})

export default i18n