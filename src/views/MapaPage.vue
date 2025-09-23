<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>{{ configApp.nome }} - Mapa de Riscos</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="obterLocalizacaoAtual">
            <ion-icon :icon="localizar"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    
    <ion-content :fullscreen="true" ref="contentRef" :scroll-events="true">
      
      <div class="search-wrapper">
        <div class="search-container">
          <ion-searchbar
            v-model="buscaTexto"
            placeholder="Digite um endereço ou região..."
            :debounce="configUI.tempoDebounce"
            @ionInput="buscaDebounce"
            @keyup.enter="realizarBusca"
            @ionClear="sugestoes = []"
            style="--color: black;"

            autocomplete="off"
            autocorrect="off"
          ></ion-searchbar>
          
          <ion-button 
            fill="solid" 
            color="primary"
            @click="realizarBusca"
            :disabled="!buscaTexto.trim() || buscando"
          >
            <ion-spinner v-if="buscando" name="crescent"></ion-spinner>
            <ion-icon v-else :icon="buscar"></ion-icon>
          </ion-button>
        </div>

        <ion-list v-if="sugestoes.length > 0" class="suggestions-list">
          <ion-item 
            v-for="sugestao in sugestoes" 
            :key="sugestao.place_id"
            button 
            @click="selecionarSugestao(sugestao)"
          >
            <ion-label>
              <h3>{{ sugestao.structured_formatting.main_text }}</h3>
              <p>{{ sugestao.structured_formatting.secondary_text }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </div>

      <div 
        id="map-container" 
        ref="mapaContainer"
        :class="{ 'map-loading': carregando }"
      ></div>

      <div v-if="carregando" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>{{ mensagemCarregamento }}</p>
      </div>
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="adicionarMarcadorTeste" :disabled="carregando">
          <ion-icon :icon="adicionar"></ion-icon>
        </ion-fab-button>
      </ion-fab>
      <div class="map-info" v-if="!carregando && centroMapa">
        <ion-chip color="medium" outline>
          <ion-icon :icon="iconeLocalizacao"></ion-icon>
          <ion-label>{{ formatarCoordenadas(centroMapa) }}</ion-label>
        </ion-chip>
        <ion-chip color="primary" outline v-if="pontosFiltrados.length > 0">
          <ion-label>{{ pontosFiltrados.length }} pontos visíveis</ion-label>
        </ion-chip>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonSearchbar, IonButton, IonIcon, IonButtons, IonSpinner,
  IonFab, IonFabButton, IonLabel,
  IonChip, toastController, alertController,
  // NOVO: Precisamos importar IonList e IonItem para a lista de sugestões
  IonList, IonItem
} from '@ionic/vue';
import { search as buscar, locate as localizar, add as adicionar, location as iconeLocalizacao } from 'ionicons/icons';

// Imports locais
import type { PontoRisco, TipoRisco, Coordenadas, OpcoesMensagem } from '@/types';
import { MapaService } from '@/services/mapaService';
import { LocalizacaoService } from '@/services/localizacaoService';
import { configApp, configUI, validarConfig } from '@/config';
import { debounce, formatarCoordenadas } from '@/utils/mapaUtils';

// Serviços
const servicoMapa = new MapaService();
const servicoLocalizacao = new LocalizacaoService();

// Reativos
const mapaContainer = ref<HTMLElement>();
const buscaTexto = ref('');
const filtroRiscoSelecionado = ref<TipoRisco | 'all'>('all');
const carregando = ref(true);
const buscando = ref(false);
const mensagemCarregamento = ref('Carregando mapa...');
const centroMapa = ref<Coordenadas | null>(null);

// NOVO: Uma "caixinha" para guardar as sugestões que o Google nos enviar
const sugestoes = ref<google.maps.places.AutocompletePrediction[]>([]);

// Tipos de risco para filtros
const tiposRisco: TipoRisco[] = ['buraco', 'ponto_cego', 'asfalto_liso', 'poca_agua', 'outro'];

// Lista real de pontos (inicialmente vazia)
const pontosRisco = ref<PontoRisco[]>([]);

// MUDANÇA: Agora o debounce não busca no mapa, ele pede sugestões
const buscaDebounce = debounce(() => {
  buscarSugestoes();
}, configUI.tempoDebounce);

// NOVO: Função que pede as sugestões para o nosso MapaService
const buscarSugestoes = async () => {
  // Se o campo de busca estiver vazio, limpa a lista de sugestões
  if (!buscaTexto.value.trim()) {
    sugestoes.value = [];
    return;
  }
  try {
    // Pede as sugestões e guarda na nossa "caixinha"
    sugestoes.value = await servicoMapa.obterSugestoesDeEndereco(buscaTexto.value);
  } catch (erro) {
    console.error('❌ Erro ao buscar sugestões:', erro);
    sugestoes.value = []; // Limpa em caso de erro
  }
};

// NOVO: Função que é chamada quando o usuário clica em um item da lista
const selecionarSugestao = (sugestao: google.maps.places.AutocompletePrediction) => {
  // Coloca o endereço completo da sugestão no campo de busca
  buscaTexto.value = sugestao.description;
  // Esconde a lista de sugestões
  sugestoes.value = [];
  // AGORA SIM, faz a busca final no mapa!
  realizarBusca();
};


// MUDANÇA: A função de busca foi um pouco ajustada
const realizarBusca = async () => {
  if (!buscaTexto.value.trim()) return;

  // Esconde qualquer sugestão que possa estar aberta
  sugestoes.value = [];
  
  try {
    buscando.value = true;
    const resultados = await servicoMapa.buscarEndereco(buscaTexto.value);
    if (resultados.length > 0) {
      const r = resultados[0];
      const coords = { lat: r.geometry.location.lat(), lng: r.geometry.location.lng() };
      servicoMapa.centralizarMapa(coords, 15);
      servicoMapa.adicionarMarcadorBusca(coords, r.formatted_address, 10000);
      atualizarCentro();
      await exibirToast({ mensagem: `📍 ${r.formatted_address}`, cor: 'success' });
      // Não vamos mais limpar o campo de busca, para o usuário ver o que procurou
      // buscaTexto.value = ''; 
    } else {
      await exibirToast({ mensagem: 'Local não encontrado. Tente outro endereço.', cor: 'warning' });
    }
  } catch (erro) {
    console.error('❌ Erro na busca:', erro);
    await exibirToast({ mensagem: 'Local não encontrado. Tente outro endereço.', cor: 'warning' });
  } finally {
    buscando.value = false;
  }
};

// O resto do seu código continua igual...
const exibirToast = async (opcoes: OpcoesMensagem) => {
  const toast = await toastController.create({ message: opcoes.mensagem, duration: opcoes.duracao || configUI.duracaoMensagem.media, color: opcoes.cor || 'primary', position: 'bottom' });
  await toast.present();
};
const inicializar = async () => {
  try {
    mensagemCarregamento.value = 'Validando configuração...';
    if (!validarConfig()) throw new Error('Configuração inválida');
    mensagemCarregamento.value = 'Inicializando mapa...';
    await servicoMapa.inicializar(mapaContainer.value!);
    mensagemCarregamento.value = 'Obtendo sua localização...';
    await obterLocalizacaoAtual(false);
    atualizarCentro();
    await exibirToast({ mensagem: '🗺️ Mapa carregado com sucesso!', cor: 'success' });
  } catch (erro) {
    console.error('❌ Erro ao inicializar:', erro);
    await alertController.create({
      header: 'Erro de Inicialização',
      message: erro instanceof Error ? erro.message : 'Erro desconhecido',
      buttons: [{ text: 'Tentar Novamente', handler: () => inicializar() }, { text: 'OK' }]
    }).then(alerta => alerta.present());
  } finally {
    carregando.value = false;
  }
};
const obterLocalizacaoAtual = async (mostrarToast = true) => {
  try {
    if (mostrarToast) {
      mensagemCarregamento.value = 'Obtendo localização...';
      carregando.value = true;
    }
    const coordenadas = await servicoLocalizacao.obterLocalizacaoAtual();
    servicoMapa.centralizarMapa(coordenadas, 15);
    servicoMapa.definirMarcadorLocalizacaoAtual(coordenadas);
    atualizarCentro();
    if (mostrarToast) {
      await exibirToast({ mensagem: '📍 Localização encontrada!', cor: 'success' });
    }
  } catch (erro) {
    console.error('❌ Erro ao obter localização:', erro);
    if (mostrarToast) {
      await exibirToast({
        mensagem: erro instanceof Error ? erro.message : 'Erro ao obter localização',
        cor: 'warning',
        duracao: configUI.duracaoMensagem.longa
      });
    }
  } finally {
    carregando.value = false;
    mensagemCarregamento.value = '';
  }
};
const alterarFiltro = () => {
  const pontosFiltrados = filtroRiscoSelecionado.value === 'all' ? pontosRisco.value : pontosRisco.value.filter(p => p.tipo === filtroRiscoSelecionado.value);
  servicoMapa.adicionarMarcadoresRisco(pontosFiltrados);
  exibirToast({
    mensagem: `Mostrando ${pontosFiltrados.length} pontos`,
    duracao: configUI.duracaoMensagem.curta
  });
};
const adicionarMarcadorTeste = async () => {
  const centro = servicoMapa.obterCentro();
  if (!centro) return;
  servicoMapa.adicionarMarcadorTeste(centro);
  await exibirToast({ mensagem: '📍 Novo ponto de teste adicionado!', cor: 'success' });
};
const atualizarCentro = () => {
  centroMapa.value = servicoMapa.obterCentro();
};
const pontosFiltrados = computed(() => {
  return filtroRiscoSelecionado.value === 'all' ? pontosRisco.value : pontosRisco.value.filter(p => p.tipo === filtroRiscoSelecionado.value);
});
onMounted(async () => {
  await nextTick();
  await inicializar();
});
onBeforeUnmount(async () => {
  servicoMapa.destruir();
  await servicoLocalizacao.destruir();
});
</script>


<style scoped>
/* NOVO: Estilos para posicionar a lista de sugestões */
.search-wrapper {
  position: relative;
  z-index: 10;
}

.suggestions-list {
  position: absolute;
  top: 100%;
  left: 16px;
  right: 16px;
  background: white;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.15);
  max-height: 300px;
  overflow-y: auto;
  margin-top: -12px;
  border: 1px solid var(--ion-color-step-150, #e0e0e0);
  border-top: none;
}

.suggestions-list ion-item::part(native) {
  padding-left: 16px;
}

.suggestions-list ion-label h3 {
  font-size: 1rem;
  font-weight: 500;
}

.suggestions-list ion-label p {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
}

/* Estilos originais */
#map-container {
  width: 100%;
  height: 100%; /* O mapa agora pode ocupar todo o espaço */
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1; /* Fica atrás da barra de busca */
}
.map-loading { opacity: 0.7; pointer-events: none; }
.search-container { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  padding: 12px 16px; 
  background: var(--ion-color-light); 
  border-bottom: 1px solid var(--ion-color-medium); 
}
.search-container ion-searchbar { flex: 1; --background: white; --border-radius: 12px; --box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.loading-container { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; z-index: 1000; background: rgba(255, 255, 255, 0.95); padding: 24px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); backdrop-filter: blur(10px); }
.loading-container p { margin-top: 16px; color: var(--ion-color-medium); font-weight: 500; }
.map-info { position: absolute; bottom: 100px; left: 16px; right: 16px; display: flex; gap: 8px; flex-wrap: wrap; pointer-events: none; z-index: 5; }
.map-info ion-chip { pointer-events: all; --background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); font-size: 12px; }
ion-fab-button { --background: var(--ion-color-primary); --color: white; --box-shadow: 0 4px 20px rgba(var(--ion-color-primary-rgb), 0.4); --transition: transform 0.2s ease, box-shadow 0.2s ease; }
ion-fab-button:hover { --transform: scale(1.05); --box-shadow: 0 6px 25px rgba(var(--ion-color-primary-rgb), 0.5); }
ion-content { --background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); }
</style>