import React from 'react';
import ReactDOM from 'react-dom';
import {voronoi as d3Voronoi} from 'd3-voronoi';
// import Modal from '../js/Modal';
import Util from '../js/Utility';

class Voronoi extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      tooltipData: this.props.onLoadTooltipData
    }
  }

  handleMouseOver(e, card, name) {
    this.props.circleHover = true;
    if (!this.props.circleClicked) { 
      Util.highlightCircle(name, card)
    }
  }

  // componentDidUpdate(prevProps, prevState) {
  //   let cards = [].slice.call(document.querySelectorAll('.voronoi-map')),
  //     newCards;

  //   newCards = cards.filter((e,i) => {
  //     return !e.querySelector('iframe');
  //   });

  //   newCards.forEach((element,i) => {
  //     let iframe_url = element.getAttribute('data-iframe_url');
  //     setTimeout(function () {
  //       new ProtoEmbed.initFrame(element, iframe_url, "grid", {
  //         headerJSON: ProtoGraph.headerJSON
  //       });
  //     }, 0);
  //   });
  // }

  render() {
    let projection = this.props.projection,
      voronoi = d3Voronoi()
        .x(function (d){
          return projection([d.longitude, d.latitude])[0]
        })
        .y(function (d){
          return projection([d.longitude, d.latitude])[1]
        })
        .size([this.props.width, this.props.height])(this.props.data);

    let polygons = voronoi.polygons(this.props.data),
      cleanVoronoiCells = polygons.clean(undefined);

    let styles = {
      fill: 'none',
      pointerEvents: 'all'
    }
   
    let voronoiPaths = cleanVoronoiCells.map((d, i) => {
      let name = `${d.data.district}-${d.data.state}`
      return(
        <path style={styles}
          d={`M ${d.join("L")} Z`}
          className={`voronoi-map protograph-trigger-modal`}
          data-iframe_url={d.data.iframe_url}
          data-district_code={d.data.district}
          onClick={this.props.showModal}
          onMouseMove={(e) => this.handleMouseOver(e, d.data, name)}
          onTouchStart={(e) => this.handleMouseOver(e, d.data, name)}
          >
        </path>
      )
    }) 

    return(
      <g className="voronoiWrapper">{voronoiPaths}</g>
    )
  }
}

Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

export default Voronoi;
