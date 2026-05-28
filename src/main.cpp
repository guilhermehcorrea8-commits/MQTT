#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>

//==================================================
// WIFI
//==================================================

const char *ssid =
    "POCO";

const char *password =
    "5poruso1";

//==================================================
// MQTT
//==================================================

const char *mqtt_server =
    "3a2c5e78e4fa4b9488eb0da3307566b1.s1.eu.hivemq.cloud";

const int mqtt_port =
    8883;

const char *mqtt_user =
    "MqGuiTT";

const char *mqtt_password =
    "2px9p7Q@J7JNYpq";

//==================================================
// TOPICOS MQTT
//==================================================

const char *topicTemperatura =
    "industria/temperatura";

const char *topicUmidade =
    "industria/umidade";

const char *topicVibracao =
    "industria/vibracao";

const char *topicStatus =
    "industria/status";

const char *topicComando =
    "industria/comando";

//==================================================
// OBJETOS MQTT
//==================================================

WiFiClientSecure espClient;
PubSubClient client(espClient);

//==================================================
// VARIAVEIS
//==================================================

bool maquinaLigada =
    true;

unsigned long ultimoEnvio =
    0;

const long intervalo =
    3000;

//==================================================
// WIFI
//==================================================

void conectarWiFi()
{
    Serial.println(
        "Conectando WiFi...");

    WiFi.begin(
        ssid,
        password);

    while (
        WiFi.status() != WL_CONNECTED)
    {
        delay(500);

        Serial.print(".");
    }

    Serial.println();
    Serial.println(
        "WiFi conectado!");

    Serial.print(
        "IP: ");

    Serial.println(
        WiFi.localIP());
}

//==================================================
// CALLBACK MQTT
//==================================================

void callback(
    char *topic,
    byte *payload,
    unsigned int length)
{
    String mensagem = "";

    for (
        int i = 0;
        i < length;
        i++)
    {
        mensagem +=
            (char)payload[i];
    }

    Serial.print(
        "Mensagem recebida: ");

    Serial.println(
        mensagem);

    //===========================
    // CONTROLE MAQUINA
    //===========================

    if (
        mensagem == "ON")
    {
        maquinaLigada =
            true;

        Serial.println(
            "Maquina Ligada");
    }

    if (
        mensagem == "OFF")
    {
        maquinaLigada =
            false;

        Serial.println(
            "Maquina Desligada");
    }
}

//==================================================
// MQTT
//==================================================

void conectarMQTT()
{
    while (
        !client.connected())
    {
        Serial.println(
            "Conectando MQTT...");

        bool conectado =
            client.connect(
                "ESP32_INDUSTRIAL",
                mqtt_user,
                mqtt_password);

        if (
            conectado)
        {
            Serial.println(
                "MQTT conectado!");

            client.subscribe(
                topicComando);
        }
        else
        {
            Serial.print(
                "Erro MQTT: ");

            Serial.println(
                client.state());

            delay(3000);
        }
    }
}

//==================================================
// PUBLICAR DADOS
//==================================================

void publicarDados()
{
    float temperatura =
        random(250, 460) / 10.0;

    float umidade =
        random(400, 900) / 10.0;

    int vibracao =
        random(0, 100);

    String status =
        maquinaLigada
            ? "LIGADA"
            : "DESLIGADA";

    client.publish(
        topicTemperatura,
        String(
            temperatura)
            .c_str());

    client.publish(
        topicUmidade,
        String(
            umidade)
            .c_str());

    client.publish(
        topicVibracao,
        String(
            vibracao)
            .c_str());

    client.publish(
        topicStatus,
        status.c_str());

    Serial.println(
        "==================");

    Serial.print(
        "Temperatura: ");

    Serial.println(
        temperatura);

    Serial.print(
        "Umidade: ");

    Serial.println(
        umidade);

    Serial.print(
        "Vibracao: ");

    Serial.println(
        vibracao);

    Serial.print(
        "Status: ");

    Serial.println(
        status);
}

//==================================================
// SETUP
//==================================================

void setup()
{
    Serial.begin(
        115200);

    randomSeed(
        analogRead(34));

    conectarWiFi();

    espClient
        .setInsecure();

    client.setServer(
        mqtt_server,
        mqtt_port);

    client.setCallback(
        callback);
}

//==================================================
// LOOP
//==================================================

void loop()
{
    if (
        WiFi.status() != WL_CONNECTED)
    {
        conectarWiFi();
    }

    if (
        !client.connected())
    {
        conectarMQTT();
    }

    client.loop();

    unsigned long agora =
        millis();

    if (
        agora - ultimoEnvio >= intervalo)
    {
        ultimoEnvio =
            agora;

        publicarDados();
    }
}