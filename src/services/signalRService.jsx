// services/signalRService.js
import * as signalR from "@microsoft/signalr";

class SignalRService {
  connection = null;

  async startConnection(urlServer, userToken, userId) {
    if (!userToken || !urlServer || !userId) {
      return null;
    }

    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return this.connection;
    }

    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (e) {
        // ignore error during cleanup
      }
      this.connection = null;
    }

    const hubUrl = `${urlServer}/Notification?userId=${userId}`;
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => userToken,
        transport: signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Error)
      .build();

    this.connection.onclose((err) => {
      this.connection = null;
    });

    try {
      await this.connection.start();
      return this.connection;
    } catch (err) {
      return null;
    }
  }


  async stopConnection() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  on(methodName, callback) {
    if (this.connection) {
      this.connection.on(methodName, callback);
    }
  }

  off(methodName) {
    if (this.connection) {
      this.connection.off(methodName);
    }
  }

  async invoke(methodName, ...args) {
    if (this.connection) {
      return await this.connection.invoke(methodName, ...args);
    }
  }

  async sendNotification(userId, transactionRecId, transactionName, code,status) {
    try {
      await this.connection.invoke("SendNotification", userId, transactionRecId, transactionName, code,status);
    } catch (err) {
     }
  }

  getConnectionState() {
    return this.connection ? this.connection.state : null;
  }

  getConnection() {
    return this.connection;
  }

}

export default new SignalRService();
