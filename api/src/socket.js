const md5 = require('md5');

const getHashCode = (toBeHashed) => md5(toBeHashed);

class SocketController {
  constructor(redis, helpers, logger) {
    this.redis = redis;
    this.helpers = helpers;
    this.logger = logger;
    this.isAlive = false;
  }

  create(token, region, routerSvcUrl) {
    const socket = require('socket.io-client')(`${routerSvcUrl}`, {
      extraHeaders: {
        'x-token': token,
      },
      transports: ['websocket'],
      upgrade: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 'Infinity',
    });
    this.logger.debug(`** socketController - create socket method ${token}`);
    socket.emit('psEmit', { text: 'ack on psEmit' });
    socket.on('disconnect', this.socketDisconnected.bind(this, socket));
    socket.on('connect', this.socketConnected.bind(this, socket));
    socket.on('connect_error', this.socketConnectionError.bind(this, socket));
    socket.on('unauthorizedSocket', this.socketUnauthorized.bind(this, socket));
    socket.on('error', (err) => this.logger.info('Socket Error', err));
    socket.on('psResponse', this.socketPsResponse.bind(this));
    socket.on('smResponse', this.socketSmResponse.bind(this));
    return socket;
  }

  async socketSmResponse(responseData) {
    const responseJson = JSON.parse(responseData.value);
    this.logger.info('socket sm response', responseJson);
    const hash = getHashCode(`${responseJson.Namespace}${responseJson.Id}`);
    await this.redis.set(hash, JSON.stringify({
      key: responseData.key,
      message: responseData.value,
    }), { EX: 500 });
    await this.saveProvisionMessageState(responseJson);
  }

  async socketPsResponse(responseData) {
    const responseJson = JSON.parse(responseData.value);
    this.logger.info('socket ps response', responseJson);
    const hash = getHashCode(`${responseJson.Namespace}${responseJson.Id}`);
    await this.redis.set(hash, JSON.stringify({
      key: responseData.key,
      message: responseData.value,
    }), { EX: 500 });
    await this.saveProvisionMessageState(responseJson);
  }

  async saveProvisionMessageState(data) {
    const {
      provision_message_status_insert,
      provision_message_upsert,
      processMessageResponse,
    } = this.helpers;
    const result = JSON.parse(data.Data);
    this.logger.info('Provisioning Message DATA', result);
    const scriptOutput = JSON.parse(result.ScriptOutput);
    this.logger.info('Provisioning Message Script Output', scriptOutput);
    const msgSuccess = !parseInt(scriptOutput.Success, 10);
    const executionState = msgSuccess ? 'completed' : 'completed-with-errors';
    await provision_message_status_insert({ provision_message_id: data.Id, state: executionState });
    await provision_message_upsert({ message_id: data.Id, message_response: data });

    this.logger.info(`ScriptOutput Success ${scriptOutput.Success} ${msgSuccess}`);
    if (msgSuccess) {
      await processMessageResponse(data);
    } else {
      this.logger.info(`Save Provision Message State ${msgSuccess} - ${scriptOutput.Success}`, result);
    }
  }

  socketDisconnected(socket) {
    this.logger.info('-socket disconnected');
    socket.isAlive = false;
  }

  socketConnected(socket) {
    this.logger.info(`+socket connected ${socket?.id}`);
    socket.isAlive = true;
  }

  socketConnectionError(socket, error) {
    this.logger.warn(`socket connection error ${error}`);
    socket.isAlive = false;
  }

  socketUnauthorized(socket, data) {
    this.logger.info(`unauthorizedSocket ${socket.id} ${socket.io.opts.extraHeaders['x-token']}`, data);
  }
}

module.exports = SocketController;
