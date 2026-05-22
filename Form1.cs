using System.Text;
using System.Drawing;
using System.Windows.Forms;
using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Protocol;

namespace MQTT
{
    public partial class Form1 : Form
    {
        IMqttClient? mqttClient;

        Label lblTemperatura;

        Random random = new Random();

        public Form1()
        {
            Width = 400;
            Height = 200;
            Text = "Temperatura MQTT";

            lblTemperatura = new Label();
            lblTemperatura.Text = "Aguardando...";
            lblTemperatura.AutoSize = true;
            lblTemperatura.Font =
                new Font("Arial", 24);

            lblTemperatura.Left = 90;
            lblTemperatura.Top = 50;

            Controls.Add(lblTemperatura);

            ConectarMQTT();
        }

        async void ConectarMQTT()
        {
            try
            {
                var factory =
                    new MqttFactory();

                mqttClient =
                    factory.CreateMqttClient();

                var options =
                    new MqttClientOptionsBuilder()
                    .WithTcpServer(
                        "3a2c5e78e4fa4b9488eb0da3307566b1.s1.eu.hivemq.cloud",
                        8883)
                    .WithCredentials(
                        "MqGuiTT",
                        "2px9p7Q@J7JNYpq")
                    .WithTlsOptions(o => { })
                    .Build();

                // RECEBER MENSAGEM
                mqttClient.ApplicationMessageReceivedAsync += e =>
                {
                    string mensagem =
                        Encoding.UTF8.GetString(
                            e.ApplicationMessage.PayloadSegment.ToArray());

                    Console.WriteLine(
                        "Recebido MQTT: " +
                        mensagem);

                    Invoke(() =>
                    {
                        lblTemperatura.Text =
                            mensagem + " °C";
                    });

                    return Task.CompletedTask;
                };

                // CONECTA
                await mqttClient.ConnectAsync(options);

                MessageBox.Show(
                    "MQTT conectado!");

                // SUBSCRIBE
                await mqttClient.SubscribeAsync(
                    "industria/temperatura",
                    MqttQualityOfServiceLevel.AtMostOnce);

                Console.WriteLine(
                    "Inscrito no topico!");

                // inicia simulador
                SimularESP32();
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    ex.ToString());
            }
        }

        async void SimularESP32()
        {
            while (true)
            {
                double temperatura =
                    random.Next(200, 351) / 10.0;

                string mensagem =
                    temperatura.ToString();

                Console.WriteLine(
                    "Enviando: " +
                    mensagem);

                var mqttMessage =
                    new MqttApplicationMessageBuilder()
                    .WithTopic(
                        "industria/temperatura")
                    .WithPayload(
                        mensagem)
                    .Build();

                if (mqttClient != null)
                {
                    await mqttClient.PublishAsync(
                        mqttMessage);
                }

                await Task.Delay(3000);
            }
        }
    }
}