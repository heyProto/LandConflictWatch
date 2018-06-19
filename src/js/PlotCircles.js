import React from 'react';
import Util from '../js/utility';
import { scaleLinear as d3ScaleLinear, scaleOrdinal as d3ScaleOrdinal } from 'd3-scale';
import { max as d3Max, min as d3Min } from 'd3-array';

class PlotCircles extends React.Component { 
  render() {
    if (this.props.dataJSON === undefined) {
      return(<div></div>)
    } else {
      const {selectedTab, defaultCircleColor} = this.props.chartOptions;
      let radiusScale,fillColorScale;
      if (selectedTab === 'no_of_people_affected'){
        radiusScale = d3ScaleOrdinal()
          .domain(['< 500', '500-2000', '2000-5000', '5000-20000', '20000-100000', '> 100000'])
          .range([4, 6, 8, 10, 12, 14]);
      } else if (selectedTab === 'land_area_affected') {
        radiusScale = d3ScaleOrdinal()
          .domain(['< 50', '50-500', '500-5000', '5000-50000', '50000-100000', '> 100000'])
          .range([4, 6, 8, 10, 12, 14]);
      } else if (selectedTab === 'investments'){
        radiusScale = d3ScaleOrdinal()
          .domain(['< 100', '100-1000', '1000-20000', '20000-50000', '50000-100000', '> 100000'])
          .range([4, 6, 8, 10, 12, 14]);
      }

      // console.log(selectedTab);

      if(selectedTab === "no_of_conflicts"){
        fillColorScale = d3ScaleOrdinal()
          .domain(["Industry", "Infrastructure", "Land Use", "Mining", "Conservation/Forestry", "Power"])
          .range(['#1570da','#d0021b','#faa516','#000000','#59ab00','#bd10e0']);
      }
      

      const circles = this.props.dataJSON.map((point, i) => {
        let radius,fillColor;
        if (selectedTab === 'no_of_conflicts'){
          radius = 4
          if(point["type_of_industry"])
            fillColor = fillColorScale(point["type_of_industry"])
          else  
            fillColor = defaultCircleColor  
        } else {
          radius = radiusScale(+point[selectedTab])
        }
        if(!fillColor){
          fillColor = defaultCircleColor;
        }
        return(
          <circle id="map_circles"
            className={`map-circles circle-${point.district}-${point.state}`}
            key={i} 
            cx={this.props.projection([point.longitude, point.latitude])[0]} 
            cy={this.props.projection([point.longitude, point.latitude])[1]} 
            r={radius}
            opacity={selectedTab === 'no_of_conflicts' ? 1 : 0.6}
            fill={fillColor}>
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