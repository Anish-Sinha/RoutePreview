import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './RouteSearch.css';
import { Row } from 'react-bootstrap';
import { Col } from 'react-bootstrap';
import GoogleMapReact from 'google-map-react';
import Backend from './backend';
import Search from './Search';
var backend = new Backend();

class RouteImg extends Component{
    render() {
        return <img src={this.props.src} className="route-img" style={this.props.style} onClick={this.props.handleClick} alt="test"/>
    }
}

class MapPlace extends Component {
  static propTypes = {
    text: PropTypes.string
  };

  static defaultProps = {};

  render() {
    return (
       <div style={this.props.style}>
          {this.props.text}
       </div>
    );
  }
}


class RouteSearch extends Component{
    static propTypes = {
        center: PropTypes.array,
        zoom: PropTypes.number,
        greatPlaceCoords: PropTypes.any
    };


    static defaultProps = {
        center: [32.871798,  -117.233799],
        zoom: 12,
        greatPlaceCoords: {lat: 59.724465, lng: 30.080121}
      };
    constructor(props){
        super(props);
        this.state = {
            coords: [],
            images: [],
            start: '',
            end: '',
            index: 0,
            playing: false,
            speed: 100
        }
        //Binding so we can call 'this' inside the methods
        // this.handleChange = this.handleChange.bind(this);
        // this.handleSubmit = this.handleSubmit.bind(this);
        //this.playRoute = this.playRoute.bind(this);
        //Load the intial images
    }

    render(){
        var imgs = []
        for(var i in this.state.images){
            imgs.push(this.renderImage(i));
        }

        var places = [];
        for(var i in this.state.coords){
            places.push(this.renderPlace(i));
        }

        var style = {
            "display": this.state.playing ? "none" : "inline"
        }
        document.body.addEventListener('keydown', this.handleKeyPress);
        return (
            <div className="container">
                <Row>
                    <Col md={3}>
                        <div className="start-end">
                            <Search handleChange={(e) => this.handleChange(e)} handleClick={(e) => this.handleSubmit(e)}/>
                        </div>
                    </Col>
                    <Col md={9}>
                        <div className="route-gif">
                            <a href="#" className="playWrapper">
                                <span className="playBtn"><img style={style} src="http://wptf.com/wp-content/uploads/2014/05/play-button.png" width="50" height="50" alt=""></img></span>
                            </a>
                            <ul>
                                {imgs}
                            </ul>
                        </div>
                        <Row>
                            <p className="text-center">Use the Arrow Keys to change speed and step frames. Press Space to toggle video</p>
                        </Row>
                        <div style={{width: "100%", height: "200px", margin: "auto"}}>
                        <GoogleMapReact
                            // apiKey={YOUR_GOOGLE_MAP_API_KEY} // set if you need stats etc ...
                            center={this.props.center}
                            zoom={this.props.zoom}>
                            {places}
                            </GoogleMapReact>
                        </div>
                    </Col>
                </Row>
            </div>
        )
    }

    componentDidMount() {
        this.getImages();
    }

    handleChange( event ) {
        this.setState( {[event.target.id]: event.target.value});
    }

    /*
    * Makes an API request when submit is clicked
    */
    handleSubmit( event ) {
        console.log(this);
        event.preventDefault();

        //Callback to update the UI once our API call has finished.
        var callback = (res) => {
            this.setState({images: res[0], coords: res[1]});
        }
        backend.getRoute(this.state.start, this.state.end, callback);
    }

    handleClick() {
        this.playRoute();
    }

    incRoute(){
        this.setState({index: (this.state.index + 1)%this.state.images.length});
    }

    renderImage(i) {
        var style = {
            "display": i == this.state.index ? "inline" : "none"
        }
        return <RouteImg key={i} src={this.state.images[i]} style={style} handleClick={() => this.handleClick()}/>;
    }

    renderPlace(i) {
        var currlat = 0;
        var currlong = 0;

        var style = {
            "display": i == this.state.index ? "inline" : "none"
        }

        if(this.state.coords[i]){
          currlat = this.state.coords[i][0];
          currlong = this.state.coords[i][1];
        }
        return <MapPlace lat={currlat} lng={currlong} style={style} text={'YOU ARE HERE'} /* Kreyser Avrora */ />
    }

    getImages(){
        var res = backend.bikeRoute();
        console.log(res);
        this.setState({images: res[0], coords: res[1]});
    }

    playRoute(){
        if(!this.state.playing){
            this.interval = setInterval(() => this.incRoute(), this.state.speed);
            this.setState({playing: true});
        }
        else{
            clearInterval(this.interval);
            this.setState({playing: false});
        }
    }

    updateSpeed(delta){
        if(!this.state.playing){
            this.setState({speed: Math.max(10, this.state.speed + delta)});
        }
        else{
            clearInterval(this.interval);
            this.interval = setInterval(() => this.incRoute(), Math.max(10, this.state.speed + delta));
            this.setState({speed: Math.max(10, this.state.speed + delta)});
        }
    }

    handleKeyPress = (event) => {
        if(document.activeElement.tagName === "INPUT") return;
        switch(event.key){
            case " ":
                event.preventDefault();
                return this.playRoute();
            case "ArrowLeft":
                event.preventDefault();
                this.setState({index: Math.max(this.state.index-1, 0)})
                return;
            case "ArrowRight":
                event.preventDefault();
                this.setState({index: (this.state.index + 1)%this.state.images.length});
                return;
            case "ArrowUp":
                event.preventDefault();
                this.updateSpeed(-10);
                return;
            case "ArrowDown":
                event.preventDefault();
                this.updateSpeed(10);
                return;

            default:
                return;
        }
    }
}

export default RouteSearch;
