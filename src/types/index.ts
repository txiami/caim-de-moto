export type TipoRisco = 'buraco' | 'ponto_cego' | 'asfalto_liso' | 'poca_agua' | 'outro';

export interface Coordenadas {
  lat: number;
  lng: number;
}

export interface PontoRisco {
  id: string;
  tipo: TipoRisco;
  coordenadas: Coordenadas;
  idUsuario: string;
  nomeUsuario: string;
  emailUsuario?: string;
}

export interface NovoPontoRisco {
  tipo?: TipoRisco;
  coordenadas?: Coordenadas;
  descricao?: string;
}

export interface PerfilUsuario {
  uid: string;
  email: string;
  nomeExibicao: string;
  totalPosts: number;
}

export interface RankingUsuario {
  idUsuario: string;
  nomeUsuario: string;
  emailUsuario: string;
  totalPosts: number;
}

export interface ConfigMapa {
  chaveApi: string;
  localizacaoPadrao: Coordenadas;
  zoomPadrao: number;
  bibliotecas: string[];
}

export interface EstatisticasApp {
  totalPontos: number;
  pontosPorTipo: Record<TipoRisco, number>;
  totalUsuarios: number;
  pontosRecentes: number;
}

export interface OpcoesMensagem {
  mensagem: string;
  duracao?: number;
  cor?: 'success' | 'warning' | 'danger' | 'primary';
}

export interface OpcoesAlerta {
  titulo: string;
  mensagem: string;
  botoes?: string[];
}

// Tipos para geolocalização
export interface ConfigGeolocalizacao {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}

// Tipos para UI
export interface ConfigUI {
  duracaoMensagem: {
    curta: number;
    media: number;
    longa: number;
  };
  tempoDebounce: number;
  tamanhosMarcadores: {
    pequeno: { width: number; height: number };
    medio: { width: number; height: number };
    grande: { width: number; height: number };
  };
}

// Tipos para cache
export interface ConfigCache {
  ttlGeocodificacao: number;
  tamanhoMaximoCache: number;
}