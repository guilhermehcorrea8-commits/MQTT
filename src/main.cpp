#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>

// =====================
// WIFI
// =====================
const char *ssid = "POCO X5 Pro 5G";
const char *password = "5por uso";

// =====================
// MQTT HIVEMQ CLOUD
// =====================
const char *mqtt_server =
    "3a2c5e78e4fa4b9488eb0da3307566b1.s1.eu.hivemq.cloud";

const int mqtt_port = 8883;

const char *mqtt_user =
    "MqGuiTT";

const char *mqtt_password =
    "2px9p7Q@J7JNYpq";

// =====================
// OBJETOS
// =====================
WiFiClientSecure espClient;
PubSubClient client(espClient);

// =====================
// CONECTAR WIFI
// =====================
void conectarWiFi()
{
    Serial.println("Conectando WiFi...");

    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println();
    Serial.println("WiFi conectado!");
}

// =====================
// CONECTAR MQTT
// =====================
void conectarMQTT()
{
    while (!client.connected())
    {
        Serial.println("Tentando conectar MQTT...");

        bool conectado =
            client.connect(
                "ESP32_TEMP",
                mqtt_user,
                mqtt_password);

        if (conectado)
        {
            Serial.println("MQTT conectado!");
        }
        else
        {
            Serial.print("Falha MQTT. Codigo: ");
            Serial.println(client.state());

            delay(3000);
        }
    }
}

// =====================
// SETUP
// =====================
void setup()
{
    Serial.begin(115200);

    conectarWiFi();

    // ignora certificado SSL
    espClient.setInsecure();

    client.setServer(
        mqtt_server,
        mqtt_port);
}

// =====================
// LOOP
// =====================
void loop()
{
    if (!client.connected())
    {
        conectarMQTT();
    }

    client.loop();

    // temperatura fake de 20 a 35
    float temperatura =
        random(200, 350) / 10.0;

    String mensagem =
        String(temperatura);

    client.publish(
        "industria/temperatura",
        mensagem.c_str());

    Serial.print("Temperatura enviada: ");
    Serial.println(mensagem);

    delay(3000);
}