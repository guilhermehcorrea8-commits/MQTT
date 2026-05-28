//====================================
// MQTT
//====================================

const client = mqtt.connect(
  "wss://3a2c5e78e4fa4b9488eb0da3307566b1.s1.eu.hivemq.cloud:8884/mqtt",
  {
    username: "MqGuiTT",
    password: "2px9p7Q@J7JNYpq",
  }
);

//====================================
// TOPICOS
//====================================

const TOPICOS = {
  temperatura: "industria/temperatura",

  umidade: "industria/umidade",

  vibracao: "industria/vibracao",

  status: "industria/status",

  comando: "industria/comando",
};

//====================================
// ELEMENTOS
//====================================

const mqttStatus = document.getElementById("mqttStatus");

const alertas = document.getElementById("alertas");

const temperaturaEl = document.getElementById("temperatura");

const umidadeEl = document.getElementById("umidade");

const vibracaoEl = document.getElementById("vibracao");

const statusEl = document.getElementById("status");

let ultimoPacote = Date.now();

//====================================
// GRAFICOS
//====================================

function criarGrafico(id, nome) {
  return new Chart(document.getElementById(id), {
    type: "line",

    data: {
      labels: [],

      datasets: [
        {
          label: nome,
          data: [],
        },
      ],
    },

    options: {
      responsive: true,
    },
  });
}

const graficoTemp = criarGrafico("graficoTemp", "Temperatura");

const graficoUmidade = criarGrafico("graficoUmidade", "Umidade");

const graficoVibracao = criarGrafico("graficoVibracao", "Vibração");

//====================================
// MQTT
//====================================

client.on("connect", () => {
  console.log("MQTT conectado");

  mqttStatus.innerHTML = "🟢 MQTT Online";

  mqttStatus.style.background = "green";

  Object.values(TOPICOS).forEach((topico) => {
    if (topico !== TOPICOS.comando) {
      client.subscribe(topico);

      console.log("SUBSCRIBE:", topico);
    }
  });
});

client.on("close", () => {
  mqttStatus.innerHTML = "🔴 MQTT Offline";

  mqttStatus.style.background = "red";

  alerta("⚠ Falha de comunicação MQTT");
});

//======================
// RECEBER DADOS MQTT
//======================

client.on("message", (topic, message) => {
  console.log("Recebido:", topic, message.toString());

  const valor = message.toString();

  const hora = new Date().toLocaleTimeString();

  // última atualização
  document.getElementById("ultimaAtualizacao").innerText = hora;

  // remove alerta offline
  alertas.innerHTML = "";

  //==================
  // TEMPERATURA
  //==================

  if (topic === TOPICOS.temperatura) {
    document.getElementById("temperatura").innerText = valor + " °C";

    atualizarGrafico(graficoTemp, Number(valor));

    if (Number(valor) > 40) {
      alerta("⚠ ALERTA DE SUPERAQUECIMENTO");
    }
  }

  //==================
  // UMIDADE
  //==================

  if (topic === TOPICOS.umidade) {
    document.getElementById("umidade").innerText = valor + " %";

    atualizarGrafico(graficoUmidade, Number(valor));
  }

  //==================
  // VIBRAÇÃO
  //==================

  if (topic === TOPICOS.vibracao) {
    document.getElementById("vibracao").innerText = valor;

    atualizarGrafico(graficoVibracao, Number(valor));

    if (Number(valor) > 80) {
      alerta("⚠ VIBRAÇÃO EXCESSIVA");
    }
  }

  //==================
  // STATUS MÁQUINA
  //==================

  if (topic === TOPICOS.status) {
    document.getElementById("status").innerText = valor;
  }
});
//====================================
// ALERTAS
//====================================

function verificarTemperatura(temp) {
  if (temp > 50) {
    alerta("🔴 EMERGÊNCIA - Temperatura crítica");
  } else if (temp > 40) {
    alerta("🟠 ALERTA - Superaquecimento");
  } else {
    limparAlerta();
  }
}

function verificarVibracao(vib) {
  if (vib > 80) {
    alerta("⚠ Vibração Excessiva");
  }
}

function alerta(texto) {
  alertas.innerHTML = texto;
}

function limparAlerta() {
  alertas.innerHTML = "Nenhum alerta";
}

//====================================
// GRAFICOS
//====================================

function atualizarGrafico(grafico, valor) {
  grafico.data.labels.push(new Date().toLocaleTimeString());

  grafico.data.datasets[0].data.push(Number(valor));

  if (grafico.data.labels.length > 10) {
    grafico.data.labels.shift();

    grafico.data.datasets[0].data.shift();
  }

  grafico.update();
}

//====================================
// ESP32 OFFLINE
//====================================

setInterval(() => {
  const agora = Date.now();

  if (agora - ultimoPacote > 10000) {
    alerta("⚠ ESP32 OFFLINE");
  }
}, 1000);

//====================================
// CONTROLE REMOTO
//====================================

document.getElementById("ligarBtn").onclick = () => {
  client.publish(TOPICOS.comando, "ON");
};

document.getElementById("desligarBtn").onclick = () => {
  client.publish(TOPICOS.comando, "OFF");
};

//====================================
// DARK MODE
//====================================

document.getElementById("darkModeBtn").onclick = () => {
  document.body.classList.toggle("dark");
};
