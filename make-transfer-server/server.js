const express = require('express');
const http = require('http');
const { Kafka } = require('kafkajs');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

class TransferServer {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        
        // Detailed Kafka configuration with extensive logging
        this.kafkaConfig = {
            clientId: 'transfer-server',
            brokers: ['kafka-188320-0.cloudclusters.net:10215'],
            ssl: {
                rejectUnauthorized: true,
                ca: [fs.readFileSync(path.join(__dirname, 'config', 'cacert.pem'))],
                cert: fs.readFileSync(path.join(__dirname, 'config', 'cert.pem')),
                key: fs.readFileSync(path.join(__dirname, 'config', 'key.pem'))
            },
            sasl: {
                mechanism: 'scram-sha-256',
                username: 'auto',
                password: 'vietnb99@'
            },
        };

        // Producers and Consumers
        this.kafka = null;
        this.producer = null;
        this.consumer = null;

        // Connected devices tracking
        this.connectedDevices = new Map();

        this.setupMiddleware();
        this.setupRoutes();
    }

    async initializeKafka() {
        try {
            // Create Kafka instance
            this.kafka = new Kafka(this.kafkaConfig);

            // Create producer
            this.producer = this.kafka.producer({
                allowAutoTopicCreation: true,
                transactionTimeout: 30000
            });

            // Create consumer
            this.consumer = this.kafka.consumer({ 
                groupId: 'transfer-server-group',
                sessionTimeout: 30000,
                heartbeatInterval: 3000
            });

            // Connect producer and consumer
            await this.producer.connect();
            console.log('Kafka Producer connected successfully');

            await this.consumer.connect();
            console.log('Kafka Consumer connected successfully');

            // Subscribe to topics
            await this.consumer.subscribe({ 
                topics: [
                    'device_disconnection', 
                    'make_transfer_result', 
                ],
                fromBeginning: false 
            });

            // Start consuming messages
            await this.consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    try {
                        console.log(`Received message from topic: ${topic}`);
                        
                        const value = message.value ? message.value.toString() : null;
                        
                        if (!value) {
                            console.warn(`Empty message received from topic ${topic}`);
                            return;
                        }

                        const data = JSON.parse(value);

                        switch(topic) {
                            case 'device_disconnection':
                                this.handleDeviceDisconnection(data);
                                break;
                            case 'make_transfer_result':
                                this.handleTransferResult(data);
                                break;
                            default:
                                console.log(`Unhandled topic: ${topic}`);
                        }
                    } catch (error) {
                        console.error(`Error processing message from topic ${topic}:`, error);
                    }
                },
            });

            console.log('Kafka consumer initialized successfully');
        } catch (error) {
            console.error('Critical error initializing Kafka:', error);
            throw error;
        }
    }

    setupMiddleware() {
        this.app.use(bodyParser.json());
        
        this.app.use((err, req, res, next) => {
            console.error('Unhandled error:', err);
            res.status(500).json({ error: 'Internal server error' });
        });
    }

    setupRoutes() {
        // API to update device connection status
        this.app.post('/update-device', async (req, res) => {
            try {
                const { Sender, Bank, BeforeAmount, AfterAmount, Serial, Time, Status} = req.body;

                // Validate input
                if (!Sender) {
                    return res.status(400).json({ error: 'Sender is required' });
                }
                // Update or add device with comprehensive information
                this.connectedDevices.set(Serial, {
                    Serial,
                    Status: Status || 'connected',
                    Bank: Bank,
                    BeforeAmount: BeforeAmount,
                    AfterAmount: AfterAmount,
                    Serial: Serial,
                    connectedAt: Time,
                    lastUpdated: Date.now()
                });

                res.status(200).json({ 
                    message: 'Device updated successfully', 
                    device: this.connectedDevices.get(Serial) 
                });
            } catch (error) {
                console.error('Error updating device:', error);
                res.status(500).json({ error: 'Failed to update device', details: error.message });
            }
        });

        // API for making transfer
        this.app.post('/make-transfer', async (req, res) => {
            const transferData = req.body;
            
            try {
                if (!transferData) {
                    return res.status(400).json({ error: 'Invalid transfer data' });
                }

                if (!this.producer) {
                    throw new Error('Kafka producer not initialized');
                }

                await this.producer.send({
                    topic: 'make_transfer',
                    messages: [{ 
                        value: JSON.stringify(transferData),
                        key: transferData.Serial ? transferData.Serial.toString() : null
                    }]
                });

                res.status(200).json({ message: 'Transfer request sent' });
            } catch (error) {
                console.error('Error sending transfer request:', error);
                res.status(500).json({ error: 'Failed to process transfer', details: error.message });
            }
        });

        // API to get available devices with current balance
        this.app.get('/available-devices', (req, res) => {
            const availableDevices = Array.from(this.connectedDevices.entries())
                .filter(([serial, deviceInfo]) => {
                    return deviceInfo.AfterAmount > 0 && deviceInfo.Status === 'Connected';
                })
                .map(([serial, deviceInfo]) => deviceInfo);
            
            res.json(availableDevices);
        });
    }

    handleDeviceDisconnection(disconnectionData) {
        try {
            const { Serial } = disconnectionData;

            if (!Serial) {
                console.warn('Received device disconnection without Serial');
                return;
            }

            // Remove device from connected devices
            if (this.connectedDevices.has(Serial)) {
                this.connectedDevices.delete(Serial);
                console.log(`Device disconnected: ${Serial}`);
            }
        } catch (error) {
            console.error('Error handling device disconnection:', error);
        }
    }

    handleTransferResult(result) {
        try {
            const {RefNo, Sender, Bank, AccountNo, Amount, BeforeAmount, AfterAmount, Serial, Time, Status, Receipt} = result;


            if (!Serial) {
                console.warn('Received transfer result without Serial');
                return;
            }

            const deviceInfo = this.connectedDevices.get(Serial);
            if (deviceInfo) {
                deviceInfo.BeforeAmount = BeforeAmount;
                deviceInfo.AfterAmount = AfterAmount;
                deviceInfo.lastUpdated = Date.now();
                this.connectedDevices.set(Serial, deviceInfo);

                console.log(`Transfer result processed for device: ${Serial}`);
                // push result
            } else {
                console.warn(`No device found for transfer result: ${Serial}`);
            }
        } catch (error) {
            console.error('Error handling transfer result:', error);
        }
    }

    async start(port = 3000) {
        try {
            await this.initializeKafka();

            this.server.listen(port, () => {
                console.log(`Transfer server running on port ${port}`);
            });
        } catch (error) {
            console.error('Failed to start server:', error);
            process.exit(1);
        }
    }
}

// Instantiate and start the server
const transferServer = new TransferServer();
transferServer.start();
