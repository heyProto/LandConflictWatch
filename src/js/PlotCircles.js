import React from 'react';
import Util from '../js/Utility';

class PlotCircles extends React.Component { 
  render() {
    if (this.props.dataJSON === undefined) {
      return(<div></div>)
    } else {
      const {colorCategory, defaultCircleColor} = this.props.chartOptions;
      const circles = this.props.dataJSON.map((point, i) => {
        return(
          <circle id="map_circles"
            className={`map-circles circle-${point.district}-${point.state}`}
            key={i} 
            cx={this.props.projection([point.longitude, point.latitude])[0]} 
            cy={this.props.projection([point.longitude, point.latitude])[1]} 
            r={4}
            fill={defaultCircleColor}>
          </circle>
        )
      });
      return(
        <g>{circles}</g>
      )
    }
  }
}

export default PlotCircles;
