import * as zmq from "zeromq";

async function run() {
  const sock = new zmq.Reply();

  await sock.bind("tcp://127.0.0.1:3000");
let time = 100
  for await (const [msg] of sock) {
    console.log(msg.toString(), 22222222);
    await sock.send(JSON.stringify({ret: time, mes: 'ok'}));
          time++
  }
}

run();
