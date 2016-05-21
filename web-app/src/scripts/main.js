var socket = io.connect();
socket.on('weather', function(data) {
  console.log(data);
});
socket.on('TfLArrivals', function(data) {
  console.log(data);
});
socket.on('TfLDisruptions', function(data) {
  console.log(data);
});
