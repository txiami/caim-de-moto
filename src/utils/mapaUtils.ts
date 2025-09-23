declare const google: any;

import type { TipoRisco, Coordenadas, PontoRisco, ConfigUI } from '@/types';
import { urlsIcones, configUI, labelsTipoRisco, coresTipoRisco } from '@/config';

/**
 * Obtém o ícone apropriado para cada tipo de risco
 */
export const obterIconeRisco = (tipo: TipoRisco): google.maps.Icon => {
  const nomeArquivoIcone = urlsIcones.marcadores[tipo] || urlsIcones.marcadores.outro;

  return {
    url: urlsIcones.base + nomeArquivoIcone,
    scaledSize: new google.maps.Size(
        configUI.tamanhosMarcadores.medio.width,
        configUI.tamanhosMarcadores.medio.height
    )
  };
};

/**
 * Cria ícone da localização atual
 */
export const obterIconeLocalizacaoAtual = (): google.maps.Icon => {
  return {
    url: urlsIcones.base + urlsIcones.marcadores.localizacaoAtual,
    scaledSize: new google.maps.Size(
        configUI.tamanhosMarcadores.grande.width,
        configUI.tamanhosMarcadores.grande.height
    )
  };
};

/**
 * Cria ícone para resultado de busca
 */
export const obterIconeResultadoBusca = (): google.maps.Icon => {
  return {
    url: urlsIcones.base + urlsIcones.marcadores.resultadoBusca,
    scaledSize: new google.maps.Size(
        configUI.tamanhosMarcadores.medio.width,
        configUI.tamanhosMarcadores.medio.height
    )
  };
};

/**
 * Calcula distância entre dois pontos usando fórmula Haversine
 */
export const calcularDistancia = (
    ponto1: Coordenadas,
    ponto2: Coordenadas
): number => {
  const R = 6371; // Raio da Terra em km
  const dLat = (ponto2.lat - ponto1.lat) * Math.PI / 180;
  const dLng = (ponto2.lng - ponto1.lng) * Math.PI / 180;

  const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(ponto1.lat * Math.PI / 180) *
      Math.cos(ponto2.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Formata coordenadas para exibição
 */
export const formatarCoordenadas = (coords: Coordenadas): string => {
  return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
};

/**
 * Converte coordenadas do Google Maps para nosso formato
 */
export const converterCoordenadasGoogleMaps = (
    latLng: google.maps.LatLng | google.maps.LatLngLiteral
): Coordenadas => {
  if (latLng instanceof google.maps.LatLng) {
    return {
      lat: latLng.lat(),
      lng: latLng.lng()
    };
  }
  return {
    lat: latLng.lat,
    lng: latLng.lng
  };
};

/**
 * Cria conteúdo HTML para InfoWindow
 */
export const criarConteudoInfoWindow = (ponto: PontoRisco): string => {
  const labelTipo = labelsTipoRisco[ponto.tipo] || 'Tipo desconhecido';
  const corTipo = coresTipoRisco[ponto.tipo] || '#666';

  return `
    <div style="padding: 12px; min-width: 250px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <h4 style="margin: 0 0 8px 0; color: ${corTipo}; font-size: 16px; font-weight: 600; border-bottom: 2px solid ${corTipo}; padding-bottom: 4px;">
        🚨 ${labelTipo}
      </h4>
      
      <div style="margin: 8px 0; display: flex; align-items: center; gap: 8px;">
        <span style="color: #495057; font-size: 14px;">
          <strong>👤 Reportado por:</strong> ${ponto.nomeUsuario}
        </span>
      </div>
      
      <div style="margin: 12px 0 0 0; padding-top: 8px; border-top: 1px solid #dee2e6;">
        <span style="color: #6c757d; font-size: 12px;">
          📍 ${formatarCoordenadas(ponto.coordenadas)}
        </span>
      </div>
    </div>
  `;
};

/**
 * Formata data e hora para exibição
 */
export const formatarDataHora = (data: Date): string => {
  const hoje = new Date();
  const diferenca = hoje.getTime() - data.getTime();
  const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));

  if (dias === 0) {
    return `Hoje às ${data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  } else if (dias === 1) {
    return `Ontem às ${data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  } else if (dias < 7) {
    return `${dias} dias atrás`;
  } else {
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
};

/**
 * Função debounce para otimizar busca
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    espera: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), espera);
  };
};

/**
 * Verifica se as coordenadas estão dentro de um raio
 */
export const estaDentroDoRaio = (
    centro: Coordenadas,
    ponto: Coordenadas,
    raioKm: number
): boolean => {
  return calcularDistancia(centro, ponto) <= raioKm;
};

/**
 * Obtém bounds para centralizar múltiplos pontos
 */
export const obterBoundsParaPontos = (pontos: Coordenadas[]): google.maps.LatLngBounds => {
  const bounds = new google.maps.LatLngBounds();

  pontos.forEach(ponto => {
    bounds.extend(new google.maps.LatLng(ponto.lat, ponto.lng));
  });

  return bounds;
};

/**
 * Converte tipo de risco para cor
 */
export const obterCorTipoRisco = (tipo: TipoRisco): string => {
  return coresTipoRisco[tipo] || '#666';
};

/**
 * Obtém label amigável para tipo de risco
 */
export const obterLabelTipoRisco = (tipo: TipoRisco): string => {
  return labelsTipoRisco[tipo] || 'Tipo desconhecido';
};

/**
 * Cache simples para geocodificação
 */
class CacheSimples<K, V> {
  private cache = new Map<K, V>();
  private tamanhoMaximo: number;

  constructor(tamanhoMaximo: number = 100) {
    this.tamanhoMaximo = tamanhoMaximo;
  }

  obter(chave: K): V | undefined {
    return this.cache.get(chave);
  }

  definir(chave: K, valor: V): void {
    if (this.cache.size >= this.tamanhoMaximo) {
      // Remove o primeiro item (mais antigo)
      const primeiraChave = this.cache.keys().next().value;
      this.cache.delete(primeiraChave);
    }
    this.cache.set(chave, valor);
  }

  tem(chave: K): boolean {
    return this.cache.has(chave);
  }

  limpar(): void {
    this.cache.clear();
  }

  tamanho(): number {
    return this.cache.size;
  }
}

export const cacheGeocodificacao = new CacheSimples<string, google.maps.GeocoderResult[]>();

/**
 * Valida se as coordenadas são válidas
 */
export const validarCoordenadas = (coords: Coordenadas): boolean => {
  return (
      typeof coords.lat === 'number' &&
      typeof coords.lng === 'number' &&
      coords.lat >= -90 &&
      coords.lat <= 90 &&
      coords.lng >= -180 &&
      coords.lng <= 180 &&
      !isNaN(coords.lat) &&
      !isNaN(coords.lng)
  );
};

/**
 * Converte metros para quilômetros formatado
 */
export const formatarDistancia = (distanciaKm: number): string => {
  if (distanciaKm < 1) {
    return `${Math.round(distanciaKm * 1000)}m`;
  } else if (distanciaKm < 10) {
    return `${distanciaKm.toFixed(1)}km`;
  } else {
    return `${Math.round(distanciaKm)}km`;
  }
};

/**
 * Obtém bounds para centralizar um ponto com raio
 */
export const obterBoundsParaPonto = (
    centro: Coordenadas,
    raioKm: number
): google.maps.LatLngBounds => {
  const latOffset = raioKm / 111; // Aproximadamente 111km por grau de latitude
  const lngOffset = raioKm / (111 * Math.cos(centro.lat * Math.PI / 180));

  return new google.maps.LatLngBounds(
      new google.maps.LatLng(centro.lat - latOffset, centro.lng - lngOffset),
      new google.maps.LatLng(centro.lat + latOffset, centro.lng + lngOffset)
  );
};

/**
 * Filtra pontos por tipo de risco
 */
export const filtrarPontosPorTipo = (
    pontos: PontoRisco[],
    tipos: TipoRisco[]
): PontoRisco[] => {
  return pontos.filter(ponto => tipos.includes(ponto.tipo));
};

/**
 * Obtém pontos próximos a uma localização
 */
export const obterPontosProximos = (
    pontos: PontoRisco[],
    centro: Coordenadas,
    raioKm: number
): PontoRisco[] => {
  return pontos.filter(ponto =>
      estaDentroDoRaio(centro, ponto.coordenadas, raioKm)
  );
};