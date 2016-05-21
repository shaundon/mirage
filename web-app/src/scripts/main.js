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

var WeatherData = React.createClass({
  getInitialState: function() {
    return {data:{}};
  },
  componentDidMount: function() {
    var that = this;
    socket.on('weather', function(weatherData) {
      //console.log(weatherData);
      that.setState({data:weatherData});
    });
  },
  sanitiseData: function(data) {

  },
  render: function() {
    return (
      <dl>
        <dt>Weather</dt>
        <dd>{this.state.data.toString()}</dd>
      </dl>
    );
  }
});
ReactDOM.render(
  <WeatherData />,
  document.getElementById('weather')
);
