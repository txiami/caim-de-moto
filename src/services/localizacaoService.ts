import { Geolocation } from '@capacitor/geolocation';
import type { Coordenadas } from '@/types';
import { configGeolocalizacao } from '@/config';

export class LocalizacaoService {
  private ultimaLocalizacaoConhecida: Coordenadas | null = null;
  private idMonitoramento: string | null = null;
  private precisaoUltimaLocalizacao: number | null = null;

  /**
   * Obtém a localização atual do usuário
   */
  async obterLocalizacaoAtual(): Promise<Coordenadas> {
    try {
      
      const posicao = await Geolocation.getCurrentPosition(configGeolocalizacao);
      
      const coordenadas: Coordenadas = {
        lat: posicao.coords.latitude,
        lng: posicao.coords.longitude
      };

      this.ultimaLocalizacaoConhecida = coordenadas;
      this.precisaoUltimaLocalizacao = posicao.coords.accuracy;
            
      return coordenadas;
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      throw this.tratarErroLocalizacao(error);
    }
  }

  /**
   * Inicia o monitoramento contínuo da localização
   */
  async iniciarMonitoramentoLocalizacao(
    aoAtualizarLocalizacao: (coordenadas: Coordenadas, precisao?: number) => void,
    aoOcorrerErro?: (erro: Error) => void
  ): Promise<void> {
    try {
      
      this.idMonitoramento = await Geolocation.watchPosition(
        configGeolocalizacao,
        (posicao) => {
          if (posicao) {
            const coordenadas: Coordenadas = {
              lat: posicao.coords.latitude,
              lng: posicao.coords.longitude
            };
            
            this.ultimaLocalizacaoConhecida = coordenadas;
            this.precisaoUltimaLocalizacao = posicao.coords.accuracy;
            
            aoAtualizarLocalizacao(coordenadas, posicao.coords.accuracy);
          }
        }
      );

    } catch (error) {
      console.error('Erro ao iniciar monitoramento:', error);
      throw this.tratarErroLocalizacao(error);
    }
  }

  /**
   * Para o monitoramento da localização
   */
  async pararMonitoramentoLocalizacao(): Promise<void> {
    if (this.idMonitoramento) {
      await Geolocation.clearWatch({ id: this.idMonitoramento });
      this.idMonitoramento = null;
    }
  }

  /**
   * Verifica se as permissões de localização foram concedidas
   */
  async verificarPermissoes(): Promise<boolean> {
    try {
      const permissoes = await Geolocation.checkPermissions();
      const concedida = permissoes.location === 'granted';
      
      return concedida;
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return false;
    }
  }

  /**
   * Solicita permissões de localização
   */
  async solicitarPermissoes(): Promise<boolean> {
    try {
      const permissoes = await Geolocation.requestPermissions();
      const concedida = permissoes.location === 'granted';
      
      return concedida;
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
      return false;
    }
  }

  /**
   * Obtém a última localização conhecida (cache)
   */
  obterUltimaLocalizacaoConhecida(): Coordenadas | null {
    return this.ultimaLocalizacaoConhecida;
  }

  /**
   * Obtém a precisão da última localização
   */
  obterPrecisaoUltimaLocalizacao(): number | null {
    return this.precisaoUltimaLocalizacao;
  }

  /**
   * Verifica se o serviço de localização está disponível
   */
  async localizacaoEstaDisponivel(): Promise<boolean> {
    try {
      // Tenta obter uma localização com timeout curto para testar disponibilidade
      await Geolocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000 // 5 minutos
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifica se uma localização é considerada precisa
   */
  localizacaoEhPrecisa(precisao?: number): boolean {
    const precisaoParaVerificar = precisao || this.precisaoUltimaLocalizacao;
    if (precisaoParaVerificar === null) return false;
    
    // Considera preciso se precisão for menor que 100 metros
    return precisaoParaVerificar < 100;
  }

  /**
   * Obtém descrição da qualidade da localização baseada na precisão
   */
  obterQualidadeLocalizacao(precisao?: number): string {
    const precisaoParaAvaliar = precisao || this.precisaoUltimaLocalizacao;
    
    if (precisaoParaAvaliar === null) return 'Desconhecida';
    
    if (precisaoParaAvaliar <= 5) return 'Excelente';
    if (precisaoParaAvaliar <= 20) return 'Muito Boa';
    if (precisaoParaAvaliar <= 50) return 'Boa';
    if (precisaoParaAvaliar <= 100) return 'Razoável';
    if (precisaoParaAvaliar <= 500) return 'Baixa';
    return 'Muito Baixa';
  }

  /**
   * Tenta obter localização com fallback para menos precisão
   */
  async obterLocalizacaoComFallback(): Promise<Coordenadas> {
    try {
      // Primeira tentativa: alta precisão
      return await this.obterLocalizacaoAtual();
    } catch (error) {
      
      try {
        // Segunda tentativa: menor precisão, mais rápido
        const posicao = await Geolocation.getCurrentPosition({
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000
        });
        
        const coordenadas: Coordenadas = {
          lat: posicao.coords.latitude,
          lng: posicao.coords.longitude
        };
        
        this.ultimaLocalizacaoConhecida = coordenadas;
        this.precisaoUltimaLocalizacao = posicao.coords.accuracy;
        
        return coordenadas;
      } catch (errorFallback) {
        // Se ainda assim falhar, usar última localização conhecida se disponível
        if (this.ultimaLocalizacaoConhecida) {
          return this.ultimaLocalizacaoConhecida;
        }
        
        throw this.tratarErroLocalizacao(errorFallback);
      }
    }
  }

  /**
   * Converte erro de geolocalização em mensagem amigável
   */
  private tratarErroLocalizacao(error: any): Error {
    let mensagem = 'Erro desconhecido ao obter localização';

    if (error?.message) {
      const mensagemErro = error.message.toLowerCase();
      
      if (mensagemErro.includes('permission') || mensagemErro.includes('denied')) {
        mensagem = 'Permissão de localização negada. Ative nas configurações do aplicativo.';
      } else if (mensagemErro.includes('timeout')) {
        mensagem = 'Tempo esgotado ao obter localização. Verifique se o GPS está ativado.';
      } else if (mensagemErro.includes('unavailable') || mensagemErro.includes('network')) {
        mensagem = 'Serviço de localização indisponível. Verifique sua conexão.';
      } else if (mensagemErro.includes('accuracy')) {
        mensagem = 'Não foi possível obter localização precisa.';
      }
    }

    return new Error(mensagem);
  }

  /**
   * Obtém informações sobre o estado do serviço
   */
  async obterStatusServico() {
    const permissoesOk = await this.verificarPermissoes();
    const servicoDisponivel = await this.localizacaoEstaDisponivel();
    
    return {
      permissoesOk,
      servicoDisponivel,
      monitorandoAtivamente: this.idMonitoramento !== null,
      temLocalizacaoConhecida: this.ultimaLocalizacaoConhecida !== null,
      ultimaLocalizacao: this.ultimaLocalizacaoConhecida,
      precisaoUltimaLocalizacao: this.precisaoUltimaLocalizacao,
      qualidadeLocalizacao: this.obterQualidadeLocalizacao()
    };
  }

  /**
   * Cleanup do serviço
   */
  async destruir(): Promise<void> {
    await this.pararMonitoramentoLocalizacao();
    this.ultimaLocalizacaoConhecida = null;
    this.precisaoUltimaLocalizacao = null;
  }
}
