import * as zmq from "zeromq";

async function run() {
  const sock = new zmq.Request();

  sock.connect("tcp://127.0.0.1:3000");
  console.log("Producer bound to port 3000");
	let time = 1;
	while(true) {

  await sock.send(JSON.stringify({times: time}));
  const [result] = await sock.receive();
  time++;
  console.log(JSON.parse(result).ret,1111);
	}
}

run();

