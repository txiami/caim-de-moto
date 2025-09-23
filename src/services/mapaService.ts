// Importa os tipos do Google Maps
/// <reference types="@types/google.maps" />
declare const google: typeof google;

import { Loader } from "@googlemaps/js-api-loader";
import type { Coordenadas, PontoRisco } from "@/types";
import { configMapa } from "@/config";
import {
  obterIconeRisco,
  obterIconeLocalizacaoAtual,
  obterIconeResultadoBusca,
  criarConteudoInfoWindow,
  cacheGeocodificacao,
} from "@/utils/mapaUtils";

export class MapaService {
  private mapa: google.maps.Map | null = null;
  private geocoder: google.maps.Geocoder | null = null;
  private marcadores: google.maps.Marker[] = [];
  private marcadorLocalizacaoAtual: google.maps.Marker | null = null;
  private infoWindowsAbertas: google.maps.InfoWindow[] = [];
  private inicializado = false;
  private autocompleteService: google.maps.places.AutocompleteService | null =
    null;

  /**
   * Inicializa o Google Maps
   */
  async inicializar(container: HTMLElement): Promise<void> {
    if (this.inicializado) {
      throw new Error("MapaService já foi inicializado");
    }

    if (!configMapa.chaveApi) {
      throw new Error("Chave da API do Google Maps não configurada");
    }

    try {
      const loader = new Loader({
        apiKey: configMapa.chaveApi,
        version: "weekly",
        libraries: [...configMapa.bibliotecas, "places"], // Biblioteca 'places' adicionada
      });

      await loader.load();

      // Criar mapa
      this.mapa = new google.maps.Map(container, {
        center: configMapa.localizacaoPadrao,
        zoom: configMapa.zoomPadrao,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: this.obterEstilosMapa(),
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM,
        },
      });

      // Inicializar geocoder
      this.geocoder = new google.maps.Geocoder();
      this.autocompleteService = new google.maps.places.AutocompleteService();
      this.inicializado = true;
    } catch (error) {
      console.error("Erro ao inicializar MapaService:", error);
      throw error;
    }
  }

  async obterSugestoesDeEndereco(
    input: string
  ): Promise<google.maps.places.AutocompletePrediction[]> {
    if (!this.autocompleteService) {
      throw new Error("AutocompleteService não inicializado");
    }
    if (!input.trim()) {
      return [];
    }

    return new Promise((resolve, reject) => {
      this.autocompleteService!.getPlacePredictions(
        {
          input: input,
          componentRestrictions: { country: "br" }, // Prioriza resultados no Brasil
        },
        (predictions, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            resolve(predictions);
          } else if (
            status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS
          ) {
            resolve([]); // Retorna array vazio se não houver resultados
          } else {
            console.error(`Autocomplete falhou: ${status}`);
            reject(new Error("Erro ao buscar sugestões."));
          }
        }
      );
    });
  }

  /**
   * Obtém a instância do mapa
   */
  obterMapa(): google.maps.Map {
    if (!this.mapa) {
      throw new Error("MapaService não foi inicializado");
    }
    return this.mapa;
  }

  /**
   * Define estilos customizados do mapa
   */
  private obterEstilosMapa(): google.maps.MapTypeStyle[] {
    return [
      {
        featureType: "poi",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "transit",
        stylers: [{ visibility: "simplified" }],
      },
      {
        featureType: "road",
        elementType: "labels",
        stylers: [{ visibility: "on" }],
      },
    ];
  }

  /**
   * Centraliza o mapa em uma coordenada
   */
  centralizarMapa(coordenadas: Coordenadas, zoom?: number): void {
    if (!this.mapa) return;

    this.mapa.setCenter(coordenadas);
    if (zoom) {
      this.mapa.setZoom(zoom);
    }
  }

  /**
   * Adiciona marcadores de pontos de risco
   */
  adicionarMarcadoresRisco(pontosRisco: PontoRisco[]): void {
    if (!this.mapa) return;

    // Limpar marcadores existentes
    this.limparMarcadoresRisco();

    pontosRisco.forEach((ponto) => {
      const marcador = new google.maps.Marker({
        position: ponto.coordenadas,
        map: this.mapa!,
        icon: obterIconeRisco(ponto.tipo),
        title: ponto.descricao || `Risco: ${ponto.tipo}`,
        animation: google.maps.Animation.DROP,
      });

      // InfoWindow
      const infoWindow = new google.maps.InfoWindow({
        content: criarConteudoInfoWindow(ponto),
      });

      marcador.addListener("click", () => {
        // Fechar outras info windows
        this.fecharTodasInfoWindows();
        infoWindow.open(this.mapa!, marcador);
        this.infoWindowsAbertas.push(infoWindow);
      });

      this.marcadores.push(marcador);
    });
  }

  /**
   * Limpa marcadores de risco
   */
  limparMarcadoresRisco(): void {
    this.marcadores.forEach((marcador) => marcador.setMap(null));
    this.marcadores = [];
    this.fecharTodasInfoWindows();
  }

  /**
   * Adiciona/atualiza marcador da localização atual
   */
  definirMarcadorLocalizacaoAtual(coordenadas: Coordenadas): void {
    if (!this.mapa) return;

    // Remove marcador anterior
    if (this.marcadorLocalizacaoAtual) {
      this.marcadorLocalizacaoAtual.setMap(null);
    }

    // Adiciona novo marcador
    this.marcadorLocalizacaoAtual = new google.maps.Marker({
      position: coordenadas,
      map: this.mapa,
      icon: obterIconeLocalizacaoAtual(),
      title: "Sua localização atual",
      zIndex: 1000,
      animation: google.maps.Animation.BOUNCE,
    });

    // Para a animação após 2 segundos
    setTimeout(() => {
      if (this.marcadorLocalizacaoAtual) {
        this.marcadorLocalizacaoAtual.setAnimation(null);
      }
    }, 2000);
  }

  /**
   * Busca endereço usando Geocoding API
   */
  async buscarEndereco(
    endereco: string
  ): Promise<google.maps.GeocoderResult[]> {
    if (!this.geocoder) {
      throw new Error("Geocoder não inicializado");
    }

    const enderecoLimpo = endereco.trim().toLowerCase();

    // Verificar cache primeiro
    if (cacheGeocodificacao.tem(enderecoLimpo)) {
      return cacheGeocodificacao.obter(enderecoLimpo)!;
    }

    return new Promise((resolve, reject) => {
      this.geocoder!.geocode(
        {
          address: endereco,
          region: "BR", // Priorizar resultados do Brasil
        },
        (results, status) => {
          if (status === "OK" && results) {
            // Salvar no cache
            cacheGeocodificacao.definir(enderecoLimpo, results);
            resolve(results);
          } else {
            console.error(`Geocoding falhou: ${status}`);
            reject(
              new Error(
                `Falha na busca: ${this.obterMensagemErroGeocode(status)}`
              )
            );
          }
        }
      );
    });
  }

  /**
   * Obtém mensagem de erro amigável para geocoding
   */
  private obterMensagemErroGeocode(status: google.maps.GeocoderStatus): string {
    switch (status) {
      case google.maps.GeocoderStatus.ZERO_RESULTS:
        return "Endereço não encontrado";
      case google.maps.GeocoderStatus.OVER_QUERY_LIMIT:
        return "Limite de consultas excedido";
      case google.maps.GeocoderStatus.REQUEST_DENIED:
        return "Solicitação negada";
      case google.maps.GeocoderStatus.INVALID_REQUEST:
        return "Solicitação inválida";
      case google.maps.GeocoderStatus.UNKNOWN_ERROR:
        return "Erro desconhecido";
      default:
        return "Erro na busca";
    }
  }

  /**
   * Adiciona marcador temporário para resultado de busca
   */
  adicionarMarcadorBusca(
    coordenadas: Coordenadas,
    titulo: string,
    duracao: number = 10000
  ): void {
    if (!this.mapa) return;

    const marcador = new google.maps.Marker({
      position: coordenadas,
      map: this.mapa,
      icon: obterIconeResultadoBusca(),
      title: `Resultado da busca: ${titulo}`,
      animation: google.maps.Animation.DROP,
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <h4 style="margin: 0 0 8px 0; color: #28a745;">📍 Local Encontrado</h4>
          <p style="margin: 0; color: #495057; font-size: 14px;">${titulo}</p>
        </div>
      `,
    });

    // Abrir info window automaticamente
    infoWindow.open(this.mapa, marcador);
    this.infoWindowsAbertas.push(infoWindow);

    // Remover após o tempo especificado
    setTimeout(() => {
      marcador.setMap(null);
      infoWindow.close();
    }, duracao);
  }

  /**
   * Adiciona marcador temporário de teste
   */
  adicionarMarcadorTeste(coordenadas: Coordenadas): void {
    if (!this.mapa) return;

    const marcador = new google.maps.Marker({
      position: coordenadas,
      map: this.mapa,
      icon: obterIconeRisco("buraco"),
      title: "Ponto de teste",
      animation: google.maps.Animation.BOUNCE,
    });

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <h4 style="margin: 0 0 8px 0; color: #dc2626;">🚨 PONTO DE TESTE</h4>
          <div style="margin: 8px 0; padding: 8px; background: #f8f9fa; border-radius: 4px;">
            <p style="margin: 4px 0; color: #495057; font-size: 14px;">
              <strong>Tipo:</strong> Buraco na via
            </p>
            <p style="margin: 4px 0; color: #495057; font-size: 14px;">
              <strong>Coordenadas:</strong> ${coordenadas.lat.toFixed(
                6
              )}, ${coordenadas.lng.toFixed(6)}
            </p>
            <p style="margin: 4px 0 0 0; color: #6c757d; font-size: 12px;">
              📅 Adicionado agora para teste
            </p>
          </div>
        </div>
      `,
    });

    marcador.addListener("click", () => {
      this.fecharTodasInfoWindows();
      infoWindow.open(this.mapa!, marcador);
      this.infoWindowsAbertas.push(infoWindow);
    });

    // Para a animação após 3 segundos
    setTimeout(() => {
      marcador.setAnimation(null);
    }, 3000);

    this.marcadores.push(marcador);
  }

  /**
   * Obtém o centro atual do mapa
   */
  obterCentro(): Coordenadas | null {
    if (!this.mapa) return null;

    const centro = this.mapa.getCenter();
    if (!centro) return null;

    return {
      lat: centro.lat(),
      lng: centro.lng(),
    };
  }

  /**
   * Obtém o zoom atual do mapa
   */
  obterZoom(): number {
    return this.mapa?.getZoom() || configMapa.zoomPadrao;
  }

  /**
   * Ajusta o mapa para mostrar todos os marcadores
   */
  ajustarParaMostrarTodosMarcadores(): void {
    if (!this.mapa || this.marcadores.length === 0) return;

    const bounds = new google.maps.LatLngBounds();

    this.marcadores.forEach((marcador) => {
      const position = marcador.getPosition();
      if (position) {
        bounds.extend(position);
      }
    });

    // Incluir localização atual se existir
    if (this.marcadorLocalizacaoAtual) {
      const position = this.marcadorLocalizacaoAtual.getPosition();
      if (position) {
        bounds.extend(position);
      }
    }

    this.mapa.fitBounds(bounds);

    // Garantir zoom mínimo
    const listener = google.maps.event.addListener(
      this.mapa,
      "bounds_changed",
      () => {
        if (this.mapa!.getZoom()! > 18) {
          this.mapa!.setZoom(18);
        }
        google.maps.event.removeListener(listener);
      }
    );
  }

  /**
   * Fecha todas as InfoWindows abertas
   */
  private fecharTodasInfoWindows(): void {
    this.infoWindowsAbertas.forEach((infoWindow) => {
      infoWindow.close();
    });
    this.infoWindowsAbertas = [];
  }

  /**
   * Adiciona listener para cliques no mapa
   */
  adicionarListenerClique(callback: (coordenadas: Coordenadas) => void): void {
    if (!this.mapa) return;

    this.mapa.addListener("click", (evento: google.maps.MapMouseEvent) => {
      if (evento.latLng) {
        const coordenadas: Coordenadas = {
          lat: evento.latLng.lat(),
          lng: evento.latLng.lng(),
        };
        callback(coordenadas);
      }
    });
  }

  /**
   * Remove todos os marcadores (incluindo localização atual)
   */
  limparTodosMarcadores(): void {
    this.limparMarcadoresRisco();

    if (this.marcadorLocalizacaoAtual) {
      this.marcadorLocalizacaoAtual.setMap(null);
      this.marcadorLocalizacaoAtual = null;
    }
  }

  /**
   * Obtém informações sobre o mapa
   */
  obterInfoMapa() {
    if (!this.mapa) return null;

    return {
      centro: this.obterCentro(),
      zoom: this.obterZoom(),
      totalMarcadores: this.marcadores.length,
      temLocalizacaoAtual: this.marcadorLocalizacaoAtual !== null,
      inicializado: this.inicializado,
    };
  }

  /**
   * Verifica se o serviço está pronto para uso
   */
  estaInicializado(): boolean {
    return this.inicializado && this.mapa !== null;
  }

  /**
   * Libera recursos e limpa o mapa
   */
  destruir(): void {
    this.limparTodosMarcadores();
    this.fecharTodasInfoWindows();

    if (this.mapa) {
      // Limpar todos os listeners
      google.maps.event.clearInstanceListeners(this.mapa);
    }

    this.mapa = null;
    this.geocoder = null;
    this.inicializado = false;
  }
}
