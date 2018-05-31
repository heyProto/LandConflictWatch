import React from 'react';
import Util from '../js/Utility';
import { scaleLinear as d3ScaleLinear } from 'd3-scale';
import { max as d3Max } from 'd3-array';

class PlotCircles extends React.Component { 
  render() {
    if (this.props.dataJSON === undefined) {
      return(<div></div>)
    } else {
      const {selectedTab, defaultCircleColor} = this.props.chartOptions;
      let radiusScale;
      if (selectedTab !== 'no_of_conflicts'){
        let max = d3Max(this.props.dataJSON, function (d, i){
          return d[selectedTab];
        })

        radiusScale = d3ScaleLinear()
          .domain([0, max])
          .range([4, 20]);
      }
      const circles = this.props.dataJSON.map((point, i) => {
        // console.log(radiusScale(point.no_of_people_affected), point.no_of_people_affected, "radius")
        let radius
        if (selectedTab === 'no_of_conflicts'){
          radius = 4
        } else {
          console.log("else")
          radius = radiusScale(point[selectedTab])
        }
        return(
          <circle id="map_circles"
            className={`map-circles circle-${point.district}-${point.state}`}
            key={i} 
            cx={this.props.projection([point.longitude, point.latitude])[0]} 
            cy={this.props.projection([point.longitude, point.latitude])[1]} 
            r={radius}
            opacity={selectedTab === 'no_of_conflicts' ? 1 : 0.6}
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
// r={radiusScale(point.no_of_people_affected)}
 // r={4 * Math.sqrt(point[selectedTab] / Math.PI)} 