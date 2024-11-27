# Transfer Server

## Features
- API for making transfers via Kafka
- Socket.io for real-time device connections
- Tracking of device status and balance
- Kafka integration for transfer processing

## Setup
1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

## API Endpoints
- `POST /make-transfer`: Send transfer request
- `GET /available-devices`: Get list of devices with balance > 0

## Socket Events
- `device-connect`: Register device connection
- `disconnect`: Handle device disconnection
- `transfer-result`: Receive transfer results

## Kafka Topics
- `make_transfer`: Publish transfer requests
- `make_transfer_result`: Receive transfer results
- `device_status`: Publish device connection/disconnection status
