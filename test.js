try {
  const zmq = require('zeromq');
  console.log('ZeroMQ loaded! Version:', zmq.version);
} catch (err) {
  console.error('LOAD ERROR:', err);
  console.error('FULL ERROR:', err.stack);
}
