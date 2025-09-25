<template>
  <ion-page>
    <ion-header :translucent="true">
      <div class="header-top">
        <img src="@/assets/icon-logo.png" class="tab-icon" />
        <ion-title>Mapa de Riscos</ion-title>
        <ion-buttons slot="end">
          <ion-chip
            :color="usuarioLogado ? 'success' : 'danger'"
            outline
            style="margin-right: 8px"
          >
            <ion-icon
              :icon="usuarioLogado ? checkmarkCircle : closeCircle"
              style="margin-right: 4px"
            ></ion-icon>
            <ion-label style="font-size: 12px">
              {{
                usuarioLogado
                  ? usuarioLogado.displayName || usuarioLogado.email || "Logado"
                  : "Não logado"
              }}
            </ion-label>
          </ion-chip>
        </ion-buttons>
      </div>
      <div class="search-wrapper">
        <div class="search-container">
          <ion-searchbar
            v-model="buscaTexto"
            placeholder="Digite um endereço"
            :debounce="configUI.tempoDebounce"
            @ionInput="buscaDebounce"
            @keyup.enter="realizarBusca"
            @ionClear="sugestoes = []"
            style="--color: black"
            autocomplete="off"
            autocorrect="off"
          />
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
      </div>
    </ion-header>

    <ion-content :fullscreen="true" ref="contentRef" :scroll-events="true">
      <!-- Alerta para usuários não logados -->
      <ion-card v-if="!usuarioLogado && !carregando" class="login-alert">
        <ion-card-content>
          <div style="display: flex; align-items: center; gap: 12px">
            <ion-icon
              :icon="warningOutline"
              color="warning"
              style="font-size: 24px"
            ></ion-icon>
            <div>
              <strong>Login necessário</strong>
              <p
                style="
                  margin: 4px 0 0 0;
                  font-size: 14px;
                  color: var(--ion-color-medium);
                "
              >
                Faça login para adicionar pontos de risco no mapa
              </p>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <div class="search-wrapper">
        <!-- <div class="search-container">
          <ion-searchbar
            v-model="buscaTexto"
            placeholder="Digite um endereço"
            :debounce="configUI.tempoDebounce"
            @ionInput="buscaDebounce"
            @keyup.enter="realizarBusca"
            @ionClear="sugestoes = []"
            style="--color: black"
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
        </div> -->

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

      <!-- FAB de localização -->
      <ion-fab
        vertical="bottom"
        horizontal="end"
        slot="fixed"
        style="margin-bottom: 125px"
      >
        <ion-fab-button @click="obterLocalizacaoAtual">
          <img src="@/assets/localizacao.png" class="tab-icon" />
        </ion-fab-button>
      </ion-fab>

      <!-- FAB com indicação visual para usuários não logados -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button
          @click="adicionarMarcadorTeste"
          :disabled="carregando"
          :color="usuarioLogado ? 'primary' : 'medium'"
        >
          <ion-icon :icon="usuarioLogado ? adicionar : lockClosed"></ion-icon>
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
import {
  ref,
  onMounted,
  onBeforeUnmount,
  nextTick,
  computed,
  watch,
} from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonButton,
  IonIcon,
  IonButtons,
  IonSpinner,
  IonFab,
  IonFabButton,
  IonLabel,
  IonChip,
  toastController,
  alertController,
  IonList,
  IonItem,
  IonCard,
  IonCardContent,
} from "@ionic/vue";
import {
  search as buscar,
  locate as localizar,
  add as adicionar,
  location as iconeLocalizacao,
  checkmarkCircle,
  closeCircle,
  warningOutline,
  lockClosed,
} from "ionicons/icons";
import { auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { MapaService } from "@/services/mapaService";
import { LocalizacaoService } from "@/services/localizacaoService";
import { configApp, configUI, validarConfig } from "@/config";
import { debounce, formatarCoordenadas } from "@/utils/mapaUtils";
import {
  cadastrarPontoRisco,
  buscarTodosPontosRisco,
} from "@/services/pontosRiscoService";
import type {
  PontoRisco,
  TipoRisco,
  Coordenadas,
  OpcoesMensagem,
} from "@/types";
import { GeoPoint } from "firebase/firestore";

const servicoMapa = new MapaService();
const servicoLocalizacao = new LocalizacaoService();

const mapaContainer = ref<HTMLElement>();
const buscaTexto = ref("");
const filtroRiscoSelecionado = ref<TipoRisco | "all">("all");
const carregando = ref(true);
const buscando = ref(false);
const mensagemCarregamento = ref("Carregando mapa...");
const centroMapa = ref<Coordenadas | null>(null);
const sugestoes = ref<google.maps.places.AutocompletePrediction[]>([]);
const pontosRisco = ref<PontoRisco[]>([]);

const tiposRisco: TipoRisco[] = [
  "buraco",
  "ponto_cego",
  "asfalto_liso",
  "poca_agua",
  "outro",
];
const buscaDebounce = debounce(() => {
  buscarSugestoes();
}, configUI.tempoDebounce);

const usuarioLogado = ref<null | typeof auth.currentUser>(null);

onAuthStateChanged(auth, (user) => {
  usuarioLogado.value = user;
});

const buscarSugestoes = async () => {
  if (!buscaTexto.value.trim()) {
    sugestoes.value = [];
    return;
  }
  try {
    sugestoes.value = await servicoMapa.obterSugestoesDeEndereco(
      buscaTexto.value
    );
  } catch {
    sugestoes.value = [];
  }
};

const selecionarSugestao = (
  sugestao: google.maps.places.AutocompletePrediction
) => {
  buscaTexto.value = sugestao.description;
  sugestoes.value = [];
  realizarBusca();
};

const realizarBusca = async () => {
  if (!buscaTexto.value.trim()) return;
  sugestoes.value = [];
  try {
    buscando.value = true;
    const resultados = await servicoMapa.buscarEndereco(buscaTexto.value);
    if (resultados.length > 0) {
      const r = resultados[0];
      const coords = {
        lat: r.geometry.location.lat(),
        lng: r.geometry.location.lng(),
      };
      servicoMapa.centralizarMapa(coords, 15);
      servicoMapa.adicionarMarcadorBusca(coords, r.formatted_address, 10000);
      atualizarCentro();
      await exibirToast({
        mensagem: `📍 ${r.formatted_address}`,
        cor: "success",
      });
    } else {
      await exibirToast({ mensagem: "Local não encontrado.", cor: "warning" });
    }
  } catch {
    await exibirToast({ mensagem: "Local não encontrado.", cor: "warning" });
  } finally {
    buscando.value = false;
  }
};

const exibirToast = async (opcoes: OpcoesMensagem) => {
  const toast = await toastController.create({
    message: opcoes.mensagem,
    duration: opcoes.duracao || configUI.duracaoMensagem.media,
    color: opcoes.cor || "primary",
    position: "bottom",
  });
  await toast.present();
};

const inicializar = async () => {
  try {
    mensagemCarregamento.value = "Validando configuração...";
    if (!validarConfig()) throw new Error("Configuração inválida");
    mensagemCarregamento.value = "Inicializando mapa...";
    await servicoMapa.inicializar(mapaContainer.value!);
    mensagemCarregamento.value = "Obtendo sua localização...";
    await obterLocalizacaoAtual(false);
    atualizarCentro();
    await exibirToast({
      mensagem: "🗺️ Mapa carregado com sucesso!",
      cor: "success",
    });
  } catch (erro) {
    console.error(erro);
    await alertController
      .create({
        header: "Erro de Inicialização",
        message: erro instanceof Error ? erro.message : "Erro desconhecido",
        buttons: [
          { text: "Tentar Novamente", handler: () => inicializar() },
          { text: "OK" },
        ],
      })
      .then((a) => a.present());
  } finally {
    carregando.value = false;
  }
};

const obterLocalizacaoAtual = async (mostrarToast = true) => {
  try {
    if (mostrarToast) {
      mensagemCarregamento.value = "Obtendo localização...";
      carregando.value = true;
    }
    const coordenadas = await servicoLocalizacao.obterLocalizacaoAtual();
    servicoMapa.centralizarMapa(coordenadas, 15);
    servicoMapa.definirMarcadorLocalizacaoAtual(coordenadas);
    atualizarCentro();
    if (mostrarToast)
      await exibirToast({
        mensagem: "📍 Localização encontrada!",
        cor: "success",
      });
  } catch (erro) {
    if (mostrarToast)
      await exibirToast({
        mensagem:
          erro instanceof Error ? erro.message : "Erro ao obter localização",
        cor: "warning",
        duracao: configUI.duracaoMensagem.longa,
      });
  } finally {
    carregando.value = false;
    mensagemCarregamento.value = "";
  }
};

// FUNÇÃO CORRIGIDA: Agora exibe os pontos no mapa corretamente
const alterarFiltro = () => {
  const pontosFiltrados =
    filtroRiscoSelecionado.value === "all"
      ? pontosRisco.value
      : pontosRisco.value.filter(
          (p) => p.tipo === filtroRiscoSelecionado.value
        );

  // Converter coordenadas GeoPoint para o formato esperado pelo mapa
  const pontosConvertidos = pontosFiltrados.map((ponto) => ({
    ...ponto,
    coordenadas: {
      lat: ponto.coordenadas.latitude,
      lng: ponto.coordenadas.longitude,
    },
  }));

  servicoMapa.adicionarMarcadoresRisco(pontosConvertidos);
  console.log(`Exibindo ${pontosConvertidos.length} pontos no mapa`);
};

// FUNÇÃO CORRIGIDA: Verificar login antes de adicionar
const adicionarMarcadorTeste = async () => {
  // Verificar se está logado ANTES de tentar adicionar
  if (!usuarioLogado.value) {
    await exibirToast({
      mensagem: "🔒 Você precisa estar logado para adicionar pontos",
      cor: "warning",
      duracao: configUI.duracaoMensagem.longa,
    });
    return;
  }

  const centro = servicoMapa.obterCentro();
  if (!centro) {
    await exibirToast({
      mensagem: "❌ Não foi possível obter a localização central do mapa",
      cor: "danger",
    });
    return;
  }

  // Mostrar dialog para selecionar tipo de risco
  const alert = await alertController.create({
    header: "Tipo de Risco",
    message: "Selecione o tipo de risco que deseja cadastrar:",
    inputs: [
      {
        type: "radio",
        label: "Buraco na pista",
        value: "buraco",
        checked: true,
      },
      { type: "radio", label: "Ponto cego", value: "ponto_cego" },
      { type: "radio", label: "Asfalto liso", value: "asfalto_liso" },
      { type: "radio", label: "Poça d'água", value: "poca_agua" },
      { type: "radio", label: "Outro", value: "outro" },
    ],
    buttons: [
      {
        text: "Cancelar",
        role: "cancel",
      },
      {
        text: "Adicionar",
        handler: (tipoSelecionado) => {
          if (tipoSelecionado) {
            adicionarNovoPonto(centro, tipoSelecionado as TipoRisco);
          }
        },
      },
    ],
  });

  await alert.present();
};

const atualizarCentro = () => {
  centroMapa.value = servicoMapa.obterCentro();
};
const pontosFiltrados = computed(() =>
  filtroRiscoSelecionado.value === "all"
    ? pontosRisco.value
    : pontosRisco.value.filter((p) => p.tipo === filtroRiscoSelecionado.value)
);

// FUNÇÃO CORRIGIDA: Melhor tratamento de erros e validação
const adicionarNovoPonto = async (
  coordenadas: Coordenadas,
  tipo: TipoRisco
) => {
  // Dupla verificação de segurança
  if (!usuarioLogado.value) {
    await exibirToast({
      mensagem: "🔒 Usuário não autenticado. Faça login primeiro.",
      cor: "danger",
      duracao: configUI.duracaoMensagem.longa,
    });
    return;
  }

  const novoPonto: Omit<PontoRisco, "id"> = {
    coordenadas: new GeoPoint(coordenadas.lat, coordenadas.lng),
    tipo,
    usuario_id: usuarioLogado.value.uid,
    nomeUsuario:
      usuarioLogado.value.displayName || usuarioLogado.value.email || "Usuário",
    dataCadastro: new Date(),
  };

  try {
    carregando.value = true;
    mensagemCarregamento.value = "Cadastrando ponto de risco...";

    console.log("Dados do ponto:", novoPonto);
    console.log("Usuário logado:", {
      uid: usuarioLogado.value.uid,
      email: usuarioLogado.value.email,
      displayName: usuarioLogado.value.displayName,
    });

    await cadastrarPontoRisco(novoPonto);
    await carregarPontosRisco(); // Recarregar pontos

    await exibirToast({
      mensagem: "✅ Ponto de risco cadastrado com sucesso!",
      cor: "success",
    });
  } catch (erro) {
    console.error("Erro ao cadastrar ponto:", erro);

    let mensagemErro = "❌ Erro ao cadastrar ponto";

    if (erro instanceof Error) {
      if (
        erro.message.includes("permission") ||
        erro.message.includes("insufficient")
      ) {
        mensagemErro = "🔒 Sem permissão para cadastrar. Verifique seu login.";
      } else if (erro.message.includes("auth")) {
        mensagemErro = "🔒 Erro de autenticação. Faça login novamente.";
      } else if (erro.message.includes("network")) {
        mensagemErro = "🌐 Erro de conexão. Tente novamente.";
      }
    }

    await exibirToast({
      mensagem: mensagemErro,
      cor: "danger",
      duracao: configUI.duracaoMensagem.longa,
    });
  } finally {
    carregando.value = false;
    mensagemCarregamento.value = "";
  }
};

// FUNÇÃO CORRIGIDA: Carregar e exibir pontos no mapa automaticamente
const carregarPontosRisco = async () => {
  try {
    console.log("Carregando pontos do banco...");
    pontosRisco.value = await buscarTodosPontosRisco();
    console.log(
      `${pontosRisco.value.length} pontos carregados:`,
      pontosRisco.value
    );

    // Aguardar um momento para garantir que o mapa está pronto
    await nextTick();

    // Exibir automaticamente os pontos no mapa
    alterarFiltro();

    await exibirToast({
      mensagem: `📌 ${pontosRisco.value.length} pontos carregados no mapa`,
      cor: "success",
      duracao: configUI.duracaoMensagem.curta,
    });
  } catch (erro) {
    console.error("Erro ao carregar pontos:", erro);
    await exibirToast({
      mensagem: "❌ Erro ao carregar pontos do mapa",
      cor: "danger",
    });
  }
};

// Watch para reagir a mudanças nos pontos e reexibir no mapa
watch(
  pontosRisco,
  () => {
    alterarFiltro();
  },
  { deep: true }
);

// LISTENER DE CLIQUE CORRIGIDO: Verificar login e mostrar dialog
onMounted(async () => {
  await nextTick();
  await inicializar();
  await carregarPontosRisco();

  servicoMapa.adicionarListenerClique(async (coordenadas) => {
    // Verificar login ANTES de qualquer ação
    if (!usuarioLogado.value) {
      await exibirToast({
        mensagem: "🔒 Faça login antes de adicionar pontos no mapa",
        cor: "warning",
        duracao: configUI.duracaoMensagem.longa,
      });
      return;
    }

    // Mostrar dialog para selecionar tipo de risco
    const alert = await alertController.create({
      header: "Adicionar Ponto de Risco",
      message: "Que tipo de risco você quer cadastrar neste local?",
      inputs: [
        {
          type: "radio",
          label: "Buraco na pista",
          value: "buraco",
          checked: true,
        },
        { type: "radio", label: "Ponto cego", value: "ponto_cego" },
        { type: "radio", label: "Asfalto liso", value: "asfalto_liso" },
        { type: "radio", label: "Poça d'água", value: "poca_agua" },
        { type: "radio", label: "Outro", value: "outro" },
      ],
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
        },
        {
          text: "Cadastrar",
          handler: (tipoSelecionado) => {
            if (tipoSelecionado) {
              adicionarNovoPonto(coordenadas, tipoSelecionado as TipoRisco);
            }
          },
        },
      ],
    });

    await alert.present();
  });
});

onBeforeUnmount(async () => {
  servicoMapa.destruir();
  await servicoLocalizacao.destruir();
});
</script>

<style scoped>
.header-top {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 2px;
  padding: 12px 12px 2px;
}

.header-top img.tab-icon {
  width: 45px !important;     
  height: 45px !important;
  max-width: none !important;
  max-height: none !important;
}

.header-top ion-title {
  margin: 0;            
  font-size: 22px;
  font-weight: 700;
  color: var(--preto-carvao);
}

.header-top ion-buttons {
  justify-self: end;
}

ion-header {
  --background: var(--cinza-medio);
  --border-color: transparent;
  --border-width: 0;
  box-shadow: none;
  padding-bottom: 8px;
}
ion-header::after,
ion-toolbar::after {
  display: none !important;
}

.search-wrapper {
  position: relative;
  z-index: 10;
  padding: 0 6px 5px;  
}

.search-container {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0;                    
  background: transparent !important;
  border-bottom: none !important;
}

.search-container ion-searchbar {
  flex: 1;
  --background: var(--branco);
  --color: var(--preto-carvao);
  --placeholder-color: #70757a;
  --border-radius: 12px;
  --box-shadow: 0 2px 8px rgba(0,0,0,0.10);
}

ion-content {
  --background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

@media (max-width: 680px) {
  .header-top {
    grid-template-columns: auto 1fr auto;
    row-gap: 6px;
  }
}

ion-header {
  padding-bottom: 5px;
  background-color: var(--cinza-medio);
}

ion-title {
  color: var(--preto-carvao);
}

/* Estilo para o alerta de login */
.login-alert {
  margin: 16px;
  margin-bottom: 0;
  --background: #fff3cd;
  border: 1px solid #ffeaa7;
}

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
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
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

#map-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
}
.map-loading {
  opacity: 0.7;
  pointer-events: none;
}
.search-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 6px;
  /* background: var(--ion-color-light); */
  border-bottom: 1px solid var(--ion-color-medium);
}
.search-container ion-searchbar {
  flex: 1;
  --background: white;
  --border-radius: 12px;
  --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.loading-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}
.loading-container p {
  margin-top: 16px;
  color: var(--ion-color-medium);
  font-weight: 500;
}
.map-info {
  position: absolute;
  bottom: 100px;
  left: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  pointer-events: none;
  z-index: 5;
}
.map-info ion-chip {
  pointer-events: all;
  --background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  font-size: 12px;
}
ion-fab-button {
  --background: var(--ion-color-primary);
  --color: white;
  --box-shadow: 0 4px 20px rgba(var(--ion-color-primary-rgb), 0.4);
  --transition: transform 0.2s ease, box-shadow 0.2s ease;
}
ion-fab-button:hover {
  --transform: scale(1.05);
  --box-shadow: 0 6px 25px rgba(var(--ion-color-primary-rgb), 0.5);
}
ion-content {
  --background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
</style>
