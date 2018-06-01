import React from 'react';
import * as topojson from 'topojson-client';
import {geoPath, geoCentroid, geoMercator} from 'd3-geo';
import PlotCircles from '../js/PlotCircles';
import Voronoi from '../js/Voronoi';

class MapsCard extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      projection: undefined,
      regions: [],
      outlines: [],
      country: undefined,
      path: undefined,
      offsetWidth: undefined,
      offsetHeight: undefined
    }
  }

  componentWillMount() {
    let offsetWidth = this.props.mode === 'laptop' ? 700 : 360,
      offsetHeight = this.props.mode === 'laptop' ? 700 : 400;

    let ch = this.props.topoJSON,
      country = topojson.feature(ch, ch.objects),
      center = geoCentroid(topojson.feature(ch, ch.objects)),
      scale = 700,
      projection = geoMercator().center(center)
        .scale(scale)
        .translate([offsetWidth/2, offsetHeight/2]),
      path = geoPath()
        .projection(projection);

    let bounds  = path.bounds(country),
      hscale = scale*offsetWidth  / (bounds[1][0] - bounds[0][0]),
      vscale = scale*offsetHeight / (bounds[1][1] - bounds[0][1]);
    scale = (hscale < vscale) ? hscale : vscale;
    let offset = [offsetWidth - (bounds[0][0] + bounds[1][0])/2, offsetHeight - (bounds[0][1] + bounds[1][1])/2];

    projection = geoMercator().center(center)
      .scale(scale)
      .translate(offset);
    path = path.projection(projection);

    let regions = country.features.map((d,i) => {
      return(
        <g key={i} className="region">
          <path className="geo-region" d={path(d)}></path>
        </g>
      )
    })

    let outlines = country.features.map((d,i) => {
      return(
        <path key={i} className="geo region-outline" d={path(d)}></path>
      )
    })

    this.setState({
      projection: projection,
      regions: regions,
      outlines: outlines,
      country: country,
      path: path,
      offsetWidth: offsetWidth,
      offsetHeight: offsetHeight
    })
  }

  render(){
    let styles = {
      strokeWidth: 0.675
    }
    const {projection, regions, outlines, country, path, offsetWidth, offsetHeight} = this.state;
    return(
      <div id="map_and_tooltip_container" className="protograph-map-container">
        { this.renderLegends() }
        <svg id='map_svg' viewBox={`0, 0, ${offsetWidth}, ${offsetHeight}`} width={offsetWidth} height={offsetHeight}>
          <g id="regions-grp" className="regions">{regions}</g>
          <path className='geo-borders' d={path(country)}></path>
          <g className="outlines" style={styles}>{outlines}</g>
          <PlotCircles dataJSON={this.props.dataJSON} projection={projection} chartOptions={this.props.chartOptions} height={offsetHeight} width={offsetWidth} />
          <Voronoi data={this.props.dataJSON} projection={projection} width={offsetWidth} height={offsetHeight} mode={this.props.mode} circleClicked={this.props.circleClicked} handleCircleClicked={this.props.handleCircleClicked} circleHover={this.props.circleHover} showModal={this.props.showModal}/>
        </svg>
      </div>
    )
  }

  renderLegends() {
    let selectedTab = this.props.chartOptions.selectedTab,
      map_legends, legend_name,
      r = [4, 6, 8, 10, 12, 14],
      ry = [8, 25, 45, 68, 95, 125];
    if (selectedTab === 'no_of_people_affected'){
      legend_name = ['< 500', '500-2000', '2000-5000', '5000-20000', '20000-100000', '> 100000']
      map_legends = legend_name.map((d, i) => {
        return(          
          <g className="protograph-map-legend" transform={`translate(15,${ry[i]})`}>
            <circle className="protograph-map-legend-color-circle" r={r[i]} fill={'#FAA10C'}></circle>
            <text className="protograph-map-legend-text" transform={`translate(20,3)`}>{d}</text>
          </g>
        )
      })
      return(
        <div className="protograph-map-legends-container">
          <svg className="protograph-map-legends" width="140">
            {map_legends}
          </svg>
        </div>
      )
    } else if (selectedTab === 'land_area_affected'){
      legend_name = ['< 50', '50-500', '500-5000', '5000-50000', '50000-100000', '> 100000']
      map_legends = legend_name.map((d, i) => {
        return(
          <g className="protograph-map-legend" transform={`translate(15,${ry[i]})`}>
            <circle className="protograph-map-legend-color-circle" r={r[i]} fill={'#FAA10C'}></circle>
            <text className="protograph-map-legend-text" transform={`translate(20,3)`}>{d}</text>
          </g>
        )
      })
      return(
        <div className="protograph-map-legends-container">
          <svg className="protograph-map-legends" width="140">
            {map_legends}
          </svg>
        </div>
      )
    } else if (selectedTab === 'investments') {
      legend_name = ['< 100', '100-1000', '1000-20000', '20000-50000', '50000-100000', '> 100000'] 
      map_legends = legend_name.map((d, i) => {
        return(
          <g className="protograph-map-legend" transform={`translate(15,${ry[i]})`}>
            <circle className="protograph-map-legend-color-circle" r={r[i]} fill={'#FAA10C'}></circle>
            <text className="protograph-map-legend-text" transform={`translate(20,3)`}>{d}</text>
          </g>
        )
      })
      return(
        <div className="protograph-map-legends-container">
          <svg className="protograph-map-legends" width="140">
            {map_legends}
          </svg>
        </div>
      )
    } else {
      let sector = [
        { "name": "Industry", "color": "blue" },
        { "name": "Infrastructure", "color": "red"},
        { "name": "Land use", "color": "yellow" },
        { "name": "Mining", "color": "black"},
        { "name": "Power", "color": "green"},
        { "name": "Protected area", "color": "purple"}
      ]
      map_legends = sector.map((d, i) =>{
        return(
          <div className="protograph-map-legend">
            <div className="protograph-map-legend-color" style={{backgroundColor: d.color}}></div>
            <div className="protograph-map-legend-text">{d.name}</div>
          </div>
        )
      })
      return(
        <div className="protograph-map-legends-container">
          <div className="protograph-map-legends">
          {map_legends}
          </div>
        </div>
      )
    }
  }
}

export default MapsCard;
