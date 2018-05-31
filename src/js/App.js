import React from 'react';
import axios from 'axios';
import { RiseLoader } from 'halogenium';
import List from './List.js';
import Map from './Map.js';
import Utils from './utility.js';
import Filter from "./filter.js";
import Modal from "./Modal.js";

class App extends React.Component {
  constructor(props) {
    super(props)
    let state = window.location.hash.split('/')[1];
    this.state = {
      dataJSON: undefined,
      topoJSON: {},
      category: null,
      filterJSON: [],
      filteredDataJSON: undefined,
      filters: this.props.filters,
      showModal: false,
      card: undefined,
      mode: window.innerWidth <= 500 ? 'col4' : 'col7',
      filterConfigurationJSON: this.props.filterConfigurationJSON,
      obj: {}
    }
    this.ListReference = undefined;
    this.showModal = this.showModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.onTabChange = this.onTabChange.bind(this);
  }

  componentDidMount() {
    const { dataURL, topoURL, filterConfigsURL } = this.props;
    axios.all([
      axios.get(dataURL),
      axios.get(topoURL)
    ]).then(axios.spread((card, topo) => {
        let data,
          filters,
          filterJSON,
          keyValue,
          groupBy;

        data = card.data;
        data.forEach((e,i) => { e.u_id = (i+1) });

        filters = this.state.filters.map((filter) => {
          groupBy = Utils.groupBy(data, filter.propName)
          keyValue = this.findKeyValue(groupBy)
          return {
            name: filter.alias,
            key: filter.propName,
            filters: this.sortObject(this.createObj(groupBy, filter.propName, keyValue), filter)
            // filters: this.sortObject(Utils.groupBy(data, filter.propName), filter)
          }
        });

        filterJSON = [
          {
            name: "Tab - 1",
            filters: filters
          }
        ];

        this.setState({
          dataJSON: data,
          filteredDataJSON: data,
          topoJSON: topo.data,
          filterJSON: filterJSON,
          keyValue: keyValue
        }, (e) => {
          this.initF3BTWShareLinks();
          var that = this;
          if (window.ga) {
            ga(function(){
              var tracker = ga.getAll()[0].get('name');
              window.ga(`${tracker}.send`, {
                hitType: 'event',
                eventCategory: 'user interaction',
                eventAction: 'click',
                eventLabel: 'map view'
              });
              window.ga(`${tracker}.send`, {
                hitType: 'event',
                eventCategory: 'user interaction',
                eventAction: 'select',
                eventLabel: this.state.mapDropdownName
              });
            })
          }
        });
    }));

    let dimension = this.getScreenSize();
    //Polyfill for element.closest in old browsers.
    if (window.Element && !Element.prototype.closest) {
      Element.prototype.closest =
        function (s) {
          var matches = (this.document || this.ownerDocument).querySelectorAll(s),
            i,
            el = this;
          do {
            i = matches.length;
            while (--i >= 0 && matches.item(i) !== el) { };
          } while ((i < 0) && (el = el.parentElement));
          return el;
        };
    }
  }

  findKeyValue(group){
    let arr_of_values = [];
    for (let value in group){
      arr_of_values.push(value)
    }
    // console.log(arr_of_values,"arr_of_values");
    return arr_of_values;
  }

  createObj(group, param, keyValue){
    let obj = {},
      arr1 = [];

    for (let i=0; i<keyValue.length; i++){
      if (group[keyValue[i]] === undefined){
        obj[keyValue[i]] = []
      } else {
        obj[keyValue[i]] = group[keyValue[i]]
      }
    }
    // console.log(obj, "object")
    return obj;
  }

  initF3BTWShareLinks() {
    var url = window.location.href,
      fb_share = $('meta[property="og:description"]').attr('content'),
      tw_share = $('meta[name="twitter:description"]').attr('content'),
      fb_share_url,
      tw_share_url;

    url = url.split("#")[0]

    fb_share_url = `http://www.facebook.com/sharer/sharer.php?u=${url}${fb_share ? '&description=' + encodeURI(fb_share) : ''}`;
    tw_share_url = `http://twitter.com/share?url=${url}${tw_share ? '&text=' + encodeURI(tw_share) : ''}`;

    document.getElementById('facebook-share-link').href = fb_share_url;
    document.getElementById('twitter-share-link').href = tw_share_url;
  }

  componentDidUpdate() {
    $(".tabs-area .single-tab").on("click", function(e){
      $(".single-tab").removeClass("active-tab");
      $(this).addClass("active-tab");
      $(".tabs.active-area").removeClass("active-area");
      $(".tabs"+this.dataset.href).addClass("active-area");
    });

    if (this.state.mode === 'col4') {
      $('.hamburger-icon').on('click', (e) => {
        $('.mobile-navigations-screen').addClass('mobile-navigations-screen-slide-in')
      });

      $('.close-icon').on('click', (e) => {
        $('.mobile-navigations-screen').removeClass('mobile-navigations-screen-slide-in')
      })
    }

  }

  getUniqueValuesOfKey(array, key) {
    return array.reduce(function (carry, item) {
      if (item[key] && !~carry.indexOf(item[key])) carry.push(item[key]);
      return carry;
    }, []);
  }


  sortObject(obj, filter) {
    var arr = [];
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        arr.push({
          'name': `${prop}`,
          'value': prop,
          'count': obj[prop] === undefined ? 0 : obj[prop].length
        });
      }
    }
    arr.sort(function (a, b) {
      let key1 = a.count,
        key2 = b.count;
      if (key1 > key2) {
        return -1;
      } else if (key1 == key2) {
        return 0;
      } else {
        return 1;
      }
    });
    return arr; // returns array
  }

  onChange(filteredData) {
    // console.log(filteredData, "filteredData")
    let groupBy, keyValue;
    let filtDat = this.state.filters.map((filter) => {
      groupBy = Utils.groupBy(filteredData, filter.propName)
      keyValue = this.findKeyValue(Utils.groupBy(this.state.dataJSON, filter.propName))
      // console.log(groupBy, "groupBy")
      return {
        name: filter.alias,
        key: filter.propName,
        filters: this.sortObject(this.createObj(groupBy, filter.propName, keyValue), filter)
        // filters: this.sortObject(Utils.groupBy(filteredData, filter.propName), filter)
      }
    });

    // console.log(filtDat, filteredData, "on chnage filteredData")

    let filterJSON = [
      {
        name: "Tab - 1",
        filters: filtDat
      }
    ];

    this.setState({
      filteredDataJSON: filteredData,
      filterJSON: filterJSON
    });
  }

  showModal(e) {
    if (window.ga) {
      window.ga(function(){
        var tracker = ga.getAll()[0].get('name');
        window.ga(`${tracker}.send`, {
          hitType: 'event',
          eventCategory: 'user interaction',
          eventAction: 'click',
          eventLabel: 'tell me how this map is constructed'
        });
      });
    }
    let district = e.target.closest('.protograph-trigger-modal').getAttribute('data-district_code'),
      data = this.state.dataJSON.filter((k, i) => {
        return k.district === district;
      })[0];
      // console.log(data, "data")
    this.setState({
      iframeURL: data.iframe_url,
      showModal: true
    })
  }

  closeModal() {
    this.setState({
      iframeURL: undefined,
      showModal: false
    })
  }

  onTabChange (e) {
    let tab = e.target.getAttribute('id'),
      label;

    if (!window.ga) return;
    if (window.ga && window.ga.constructor !== Function) return;

    switch (tab) {
      case 'map-tab':
        label = 'map view';
        break;
      case 'list-tab':
        label = 'table view';
        break;
      default:
        label = '';
        break;
    }

    if (window.ga) {
      ga(function(){
        var tracker = ga.getAll()[0].get('name');
        window.ga(`${tracker}.send`, {
          hitType: 'event',
          eventCategory: 'user interaction',
          eventAction: 'click',
          eventLabel: label
        });
      });
    }
  }


  renderLoader() {
    let color = ProtoGraph.site['house_colour'],
      style = {
        display: '-webkit-flex',
        display: 'flex',
        WebkitFlex: '0 1 auto',
        flex: '0 1 auto',
        WebkitFlexDirection: 'column',
        flexDirection: 'column',
        WebkitFlexGrow: 1,
        flexGrow: 1,
        WebkitFlexShrink: 0,
        flexShrink: 0,
        WebkitFlexBasis: '100%',
        flexBasis: '100%',
        maxWidth: '100%',
        height: '200px',
        WebkitAlignItems: 'center',
        alignItems: 'center',
        WebkitJustifyContent: 'center',
        justifyContent: 'center'
      };
    return (
      <div
        className="outer-container"
        style={{
          boxSizing: 'border-box',
          display: '-webkit-flex',
          display: 'flex',
          WebkitFlex: '0 1 auto',
          flex: '0 1 auto',
          WebkitFlexDirection: 'row',
          flexDirection: 'row',
          WebkitFlexWrap: 'wrap',
          flexWrap: 'wrap',
          clear: 'both'
      }}>
        <div className="inner-container" style={style}><RiseLoader color={color} /></div>
      </div>
    )
  }

  renderLaptop() {
    if (this.state.dataJSON === undefined) {
      return this.renderLoader();
    } else {
      $('.social-share-icons').css("display", "block")
      // console.log(this.state.filteredDataJSON, "state.filteredDataJSON")
      return (
        <div className="banner-area">
          <div className="proto-col col-4 filter-col protograph-filter-area">
            <div className="summary">
              <div className="article-share-icons">
                <a href='#' id='facebook-share-link' target="_blank"><div className="single-share-icon"><img src="https://cdn.protograph.pykih.com/Assets/proto-app/img/article-share-facebook.png"/></div></a>
                <a href='#' id='twitter-share-link' target="_blank"><div className="single-share-icon"><img src="https://cdn.protograph.pykih.com/Assets/proto-app/img/article-share-twitter.png"/></div></a>
              </div>
              {
                ProtoGraph.page.summary &&
                  <div className="summary-text">{ProtoGraph.page.summary}</div>
              }
            </div>
            <Filter
              configurationJSON={this.props.filterConfigurationJSON}
              dataJSON={this.state.filteredDataJSON}
              filterJSON={this.state.filterJSON}
              onChange={(e) => {this.onChange(e);}}
              hintText=""
            />
          </div>
          <div className="proto-col col-12 protograph-app-map-and-list">
              <div className="tabs-area">
                <div className="single-tab active-tab" id='map-tab' data-href='#map-area' >MAP</div>
                <div className="single-tab" id='list-tab' data-href='#list-area'>LIST</div>
              </div>
              <div className="tabs map-area active-area" id='map-area'>
                <div className="map-hint-text">Click on the circle to see details of the conflict</div>
                <Map
                  dataJSON={this.state.filteredDataJSON}
                  topoJSON={this.state.topoJSON}
                  showModal={this.showModal}
                  mode={this.props.mode}
                  chartOptions={this.props.chartOptions}
                />
              </div>
              <div className="tabs list-area" id='list-area'>
                <List
                  dataJSON={this.state.filteredDataJSON}
                  mode={this.props.mode}
                  showModal={this.showModal}
                />
              </div>
              <Modal
                showModal={this.state.showModal}
                closeModal={this.closeModal}
                mode={this.state.mode}
                iframeURL={this.state.iframeURL}
              />
          </div>
        </div>
      )
    }
  }

  render() {
    return this.renderLaptop();
  }

  getScreenSize() {
    let w = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName('body')[0],
      width = w.innerWidth || e.clientWidth || g.clientWidth,
      height = w.innerHeight|| e.clientHeight|| g.clientHeight;

    return {
      width: width,
      height: height
    };
  }
}

export default App;