(() => {
  const keep = (window.__rpcErr = []);
  const Orig = window.WebSocket;
  window.WebSocket = new Proxy(Orig, {
    construct(t, args) {
      const ws = new t(...args);
      ws.addEventListener("message", (e) => {
        if (typeof e.data === "string" && /timed out|rpc_error|could not be reached/.test(e.data)) keep.push(e.data.slice(0, 600));
      });
      return ws;
    },
  });
})();
