// =======================
// MQTT
// =======================

const client = mqtt.connect(
    "wss://3a2c5e78e4fa4b9488eb0da3307566b1.s1.eu.hivemq.cloud:8884/mqtt",
    {
        username: "MqGuiTT",
        password: "2px9p7Q@J7JNYpq"
    }
);

// tópico MQTT
const TOPICO =
    "industria/temperatura";

// =======================
// GRÁFICO
// =======================

const ctx =
    document.getElementById("grafico");

const grafico = new Chart(ctx, {
    type: "line",

    data: {
        labels: [],
        datasets: [{
            label: "Temperatura °C",
            data: [],
            borderWidth: 3,
            tension: 0.3
        }]
    },

    options: {
        responsive: true
    }
});

// =======================
// MQTT CONECTADO
// =======================

client.on("connect", () => {

    console.log(
        "MQTT conectado");

    client.subscribe(TOPICO);

    // inicia simulador
    simularESP32();
});

// =======================
// RECEBER TEMPERATURA
// =======================

client.on(
    "message",
    (topic, message) =>
{
    const temperatura =
        Number(message.toString());

    document
        .getElementById(
            "temperatura")
        .innerText =
            temperatura + " °C";

    const hora =
        new Date()
        .toLocaleTimeString();

    grafico.data.labels
        .push(hora);

    grafico.data.datasets[0]
        .data.push(
            temperatura);

    // máximo de pontos
    if (
        grafico.data.labels.length > 10
    )
    {
        grafico.data.labels.shift();

        grafico.data.datasets[0]
            .data.shift();
    }

    grafico.update();
});

// =======================
// ESP32 FAKE (SIMULADA)
// =======================

function simularESP32()
{
    setInterval(() =>
    {
        // temperatura fake
        const temperatura =
            (
                Math.random() * 15
                + 20
            ).toFixed(1);

        console.log(
            "Enviando:",
            temperatura
        );

        // publica MQTT
        client.publish(
            TOPICO,
            temperatura
        );

    }, 3000);
}