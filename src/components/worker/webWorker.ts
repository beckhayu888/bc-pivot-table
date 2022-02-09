function getWebWorker(worker: any, param: any[] = []) {
  return new Promise((resolve, reject) => {
    const workerCode = worker.toString();
    const myWorkerFun = `function () {
      addEventListener('message', (e) => {
          postMessage(${workerCode.toString()}(...e.data));
      })
    }`;
    const blob = new Blob([`(${myWorkerFun})()`]);
    const workerObject = new Worker(URL.createObjectURL(blob));
    if (workerObject.onmessage !== undefined) {
      workerObject.onmessage = (msg: any) => {
        resolve(msg.data);
        workerObject.terminate(); // 关闭线程
      };
    }
    if (workerObject.onerror !== undefined) {
      workerObject.onerror = (msg: any) => {
        reject(msg.data);
        workerObject.terminate(); // 关闭线程
      };
    }
    workerObject.postMessage(param);
  });
}
export default getWebWorker;
