import type { ConfigMapa, Coordenadas, ConfigGeolocalizacao, ConfigUI, ConfigCache } from '@/types';

const variaveisObrigatorias = [
  'VITE_GOOGLE_MAPS_API_KEY',
  'VITE_DEFAULT_LOCATION_LAT',
  'VITE_DEFAULT_LOCATION_LNG'
];

for (const varEnv of variaveisObrigatorias) {
  if (!import.meta.env[varEnv]) {
    console.warn(`Variável de ambiente ${varEnv} não definida`);
  }
}

export const configMapa: ConfigMapa = {
  chaveApi: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  localizacaoPadrao: {
    lat: parseFloat(import.meta.env.VITE_DEFAULT_LOCATION_LAT) || -23.5505,
    lng: parseFloat(import.meta.env.VITE_DEFAULT_LOCATION_LNG) || -46.6333
  },
  zoomPadrao: 12,
  bibliotecas: ['places']
};

export const configFirebase = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

export const configApp = {
  nome: import.meta.env.VITE_APP_NAME || 'CaimDeMoto',
  versao: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ehDesenvolvimento: import.meta.env.DEV,
  ehProducao: import.meta.env.PROD
};

export const configGeolocalizacao: ConfigGeolocalizacao = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 60000
};

export const configCache: ConfigCache = {
  ttlGeocodificacao: 1000 * 60 * 30, // 30 minutos
  tamanhoMaximoCache: 100
};

export const configUI: ConfigUI = {
  duracaoMensagem: {
    curta: 2000,
    media: 3000,
    longa: 5000
  },
  tempoDebounce: 500,
  tamanhosMarcadores: {
    pequeno: { width: 24, height: 24 },
    medio: { width: 32, height: 32 },
    grande: { width: 40, height: 40 }
  }
};

export const urlsIcones = {
  base: 'https://maps.google.com/mapfiles/ms/icons/',
  marcadores: {
    buraco: 'red-dot.png',
    ponto_cego: 'yellow-dot.png',
    asfalto_liso: 'blue-dot.png',
    poca_agua: 'ltblue-dot.png',
    outro: 'purple-dot.png',
    localizacaoAtual: 'blue-dot.png',
    resultadoBusca: 'green-dot.png'
  }
};

export const labelsTipoRisco: Record<string, string> = {
  buraco: 'Buraco na Via',
  ponto_cego: 'Saída com Ponto Cego',
  asfalto_liso: 'Asfalto Escorregadio',
  poca_agua: 'Formação de Poças',
  outro: 'Outro Risco'
};

export const coresTipoRisco: Record<string, string> = {
  buraco: '#dc2626',        // Vermelho
  ponto_cego: '#eab308',    // Amarelo
  asfalto_liso: '#2563eb',  // Azul
  poca_agua: '#06b6d4',     // Ciano
  outro: '#7c3aed'          // Roxo
};

export const validarConfig = (): boolean => {
  const erros: string[] = [];

  if (!configMapa.chaveApi) {
    erros.push('Chave da API do Google Maps não configurada');
  }

  if (!configFirebase.apiKey && !configApp.ehDesenvolvimento) {
    erros.push('Firebase não configurado');
  }

  if (erros.length > 0) {
    console.error('Erros de configuração:', erros);
    return false;
  }

  return true;
};
