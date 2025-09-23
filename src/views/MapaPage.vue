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
    
    <ion-content :fullscreen="true">

      <div class="search-container">
        <ion-searchbar
          v-model="buscaTexto"
          placeholder="Digite um endereço ou região..."
          :debounce="configUI.tempoDebounce"
          @ionInput="buscaDebounce"
          @keyup.enter="realizarBusca"
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

      <!-- Filtros de tipo de risco 
      <div class="filters-container" v-if="pontosRiscoMock.length > 0">
        <ion-segment v-model="filtroRiscoSelecionado" @ionChange="alterarFiltro">
          <ion-segment-button value="all">
            <ion-label>Todos</ion-label>
          </ion-segment-button>
          <ion-segment-button 
            v-for="tipo in tiposRisco" 
            :key="tipo"
            :value="tipo"
          >
            <ion-label>{{ obterLabelTipoRisco(tipo) }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>-->

      <!-- Container do mapa -->
      <div 
        id="map-container" 
        ref="mapaContainer"
        :class="{ 'map-loading': carregando }"
      ></div>

      <!-- Overlay de carregamento -->
      <div v-if="carregando" class="loading-container">
        <ion-spinner name="crescent"></ion-spinner>
        <p>{{ mensagemCarregamento }}</p>
      </div>

      <!-- Botão adicionar -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button 
          @click="adicionarMarcadorTeste"
          :disabled="carregando"
        >
          <ion-icon :icon="adicionar"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <!-- Informações do mapa -->
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
import { ref, onMounted, onBeforeUnmount, nextTick,computed } from 'vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonSearchbar, IonButton, IonIcon, IonButtons, IonSpinner,
  IonFab, IonFabButton, IonLabel,
  IonChip, toastController, alertController
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

// Tipos de risco para filtros
const tiposRisco: TipoRisco[] = ['buraco', 'ponto_cego', 'asfalto_liso', 'poca_agua', 'outro'];

// Lista real de pontos (inicialmente vazia)
const pontosRisco = ref<PontoRisco[]>([]);

// Busca com debounce
const buscaDebounce = debounce(() => {
  if (buscaTexto.value.trim()) realizarBusca();
}, configUI.tempoDebounce);

// Toast utilitário
const exibirToast = async (opcoes: OpcoesMensagem) => {
  const toast = await toastController.create({
    message: opcoes.mensagem,
    duration: opcoes.duracao || configUI.duracaoMensagem.media,
    color: opcoes.cor || 'primary',
    position: 'bottom'
  });
  await toast.present();
};

// Inicializar app
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
      buttons: [
        { text: 'Tentar Novamente', handler: () => inicializar() },
        { text: 'OK' }
      ]
    }).then(alerta => alerta.present());
  } finally {
    carregando.value = false;
  }
};

// Obter localização atual
// Obter localização atual
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
    carregando.value = false;           // sempre libera o loading
    mensagemCarregamento.value = '';    // sempre limpa a mensagem
  }
};


// Buscar endereço
const realizarBusca = async () => {
  if (!buscaTexto.value.trim()) return;
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
      buscaTexto.value = '';
    }
  } catch (erro) {
    console.error('❌ Erro na busca:', erro);
    await exibirToast({ mensagem: 'Local não encontrado. Tente outro endereço.', cor: 'warning' });
  } finally {
    buscando.value = false;
  }
};

// Alterar filtro (quando já tiver dados reais)
const alterarFiltro = () => {
  const pontosFiltrados = filtroRiscoSelecionado.value === 'all'
    ? pontosRisco.value
    : pontosRisco.value.filter(p => p.tipo === filtroRiscoSelecionado.value);

  servicoMapa.adicionarMarcadoresRisco(pontosFiltrados);

  exibirToast({
    mensagem: `Mostrando ${pontosFiltrados.length} pontos`,
    duracao: configUI.duracaoMensagem.curta
  });
};

// Adicionar marcador de teste manual
const adicionarMarcadorTeste = async () => {
  const centro = servicoMapa.obterCentro();
  if (!centro) return;
  servicoMapa.adicionarMarcadorTeste(centro);
  await exibirToast({ mensagem: '📍 Novo ponto de teste adicionado!', cor: 'success' });
};

// Atualizar centro
const atualizarCentro = () => {
  centroMapa.value = servicoMapa.obterCentro();
};

const pontosFiltrados = computed(() => {
  return filtroRiscoSelecionado.value === 'all'
    ? pontosRisco.value
    : pontosRisco.value.filter(p => p.tipo === filtroRiscoSelecionado.value);
});

// Ciclo de vida
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
/* (mantive o estilo original, apenas em português nos comentários) */
#map-container {
  width: 100%;
  height: calc(100vh - 140px);
  min-height: 400px;
  border-radius: 12px;
  margin: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: opacity 0.3s ease;
}
.map-loading { opacity: 0.7; pointer-events: none; }
.search-container { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: var(--ion-color-light); border-bottom: 1px solid var(--ion-color-medium); }
.search-container ion-searchbar { flex: 1; --background: white; --border-radius: 12px; --box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.filters-container { padding: 8px 16px; background: var(--ion-color-light); border-bottom: 1px solid var(--ion-color-medium); overflow-x: auto; }
.filters-container ion-segment { min-width: max-content; }
.loading-container { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; z-index: 1000; background: rgba(255, 255, 255, 0.95); padding: 24px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); backdrop-filter: blur(10px); }
.loading-container p { margin-top: 16px; color: var(--ion-color-medium); font-weight: 500; }
.map-info { position: absolute; bottom: 100px; left: 16px; right: 16px; display: flex; gap: 8px; flex-wrap: wrap; pointer-events: none; }
.map-info ion-chip { pointer-events: all; --background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); font-size: 12px; }
ion-fab-button { --background: var(--ion-color-primary); --color: white; --box-shadow: 0 4px 20px rgba(var(--ion-color-primary-rgb), 0.4); --transition: transform 0.2s ease, box-shadow 0.2s ease; }
ion-fab-button:hover { --transform: scale(1.05); --box-shadow: 0 6px 25px rgba(var(--ion-color-primary-rgb), 0.5); }
ion-content { --background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); }
ion-segment-button { --indicator-color: var(--ion-color-primary); font-size: 12px; min-width: 80px; }
@media (max-width: 768px) {
  .filters-container { padding: 6px 12px; }
  .search-container { padding: 8px 12px; }
  #map-container { margin: 4px; height: calc(100vh - 160px); }
}
</style>
