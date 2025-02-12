import React from "react";
import axios from "axios";
import { RiseLoader } from "halogenium";
import List from "./List.js";
import Map from "./Map.js";
import Utils from "./utility.js";
import Filter from "./filter.js";
import Modal from "./Modal.js";

class App extends React.Component {
  constructor(props) {
    super(props);
    // console.log(props)
    let state = window.location.hash.split("/")[1];
    this.state = {
      dataJSON: undefined,
      topoJSON: {},
      category: null,
      filterJSON: [],
      filteredDataJSON: undefined,
      filters: this.props.filters,
      showModal: false,
      card: undefined,
      mode: window.innerWidth <= 500 ? "col4" : "col7",
      filterConfigurationJSON: this.props.filterConfigurationJSON,
      obj: {},
      currentTab: '',
      tabJSON: {},
      mappingJSON: {}
    };
    this.ListReference = undefined;
    this.showModal = this.showModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.onTabChange = this.onTabChange.bind(this);
  }

  componentDidMount() {
    let mappingJSON_URL = 'https://cdn.protograph.pykih.com/55825b09931bee16055a/mapping.json';
    let tabJSON_URL = 'https://landconflictwatch.pro.to/e4a37dc3ea5258b355e78287/data.json'
    const { dataURL, topoURL, filterConfigsURL } = this.props;
    axios.all([axios.get(dataURL), axios.get(topoURL), axios.get(tabJSON_URL)]).then(
      axios.spread((card, topo, tab) => {
        let data,
          filters,
          filterJSON,
          keyValue,
          groupBy,
          selectedTab = this.props.chartOptions.selectedTab;

        data = card.data;

        data.forEach((d, i) => {
          d[selectedTab] = +d[selectedTab];
          if (
            (d[selectedTab] >= 0 && d[selectedTab] < 500) ||
            d[selectedTab] === ""
          ) {
            d.no_of_people_affected_range = "< 500";
          } else if (d[selectedTab] >= 500 && d[selectedTab] < 2000) {
            d.no_of_people_affected_range = "500-2000";
          } else if (d[selectedTab] >= 2000 && d[selectedTab] < 5000) {
            d.no_of_people_affected_range = "2000-5000";
          } else if (d[selectedTab] >= 5000 && d[selectedTab] < 20000) {
            d.no_of_people_affected_range = "5000-20000";
          } else if (d[selectedTab] >= 5000 && d[selectedTab] < 20000) {
            d.no_of_people_affected_range = "5000-20000";
          } else if (d[selectedTab] >= 20000 && d[selectedTab] < 100000) {
            d.no_of_people_affected_range = "20000-100000";
          } else {
            d.no_of_people_affected_range = "> 100000";
          }
        });

        data.forEach((d, i) => {
          d[selectedTab] = +d[selectedTab];
          if (
            (d[selectedTab] >= 0 && d[selectedTab] < 50) ||
            d[selectedTab] === ""
          ) {
            d.land_area_affected_range = "< 50";
          } else if (d[selectedTab] >= 50 && d[selectedTab] < 500) {
            d.land_area_affected_range = "50-500";
          } else if (d[selectedTab] >= 500 && d[selectedTab] < 5000) {
            d.land_area_affected_range = "500-5000";
          } else if (d[selectedTab] >= 5000 && d[selectedTab] < 50000) {
            d.land_area_affected_range = "5000-50000";
          } else if (d[selectedTab] >= 50000 && d[selectedTab] < 100000) {
            d.land_area_affected_range = "50000-100000";
          } else {
            d.land_area_affected_range = "> 100000";
          }
        });

        data.forEach((d, i) => {
          d[selectedTab] = +d[selectedTab];
          if (
            (d[selectedTab] >= 0 && d[selectedTab] < 100) ||
            d[selectedTab] === ""
          ) {
            d.investments_range = "< 100";
          } else if (d[selectedTab] >= 100 && d[selectedTab] < 1000) {
            d.investments_range = "50-500";
          } else if (d[selectedTab] >= 1000 && d[selectedTab] < 20000) {
            d.investments_range = "500-5000";
          } else if (d[selectedTab] >= 20000 && d[selectedTab] < 50000) {
            d.investments_range = "5000-50000";
          } else if (d[selectedTab] >= 50000 && d[selectedTab] < 100000) {
            d.investments_range = "50000-100000";
          } else {
            d.investments_range = "> 100000";
          }
        });

        // console.log(data, "data with ranges added")
        data.forEach((e, i) => {
          e.u_id = i + 1;
        });

        filters = this.state.filters.map(filter => {
          // console.log("hey",groupBy)
          // console.log(data)
          groupBy = Utils.groupBy(data, filter.propName);
          keyValue = this.findKeyValue(groupBy);
          // console.log(groupBy)
          // console.log(keyValue)
          return {
            name: filter.alias,
            key: filter.propName,
            filters: this.sortObject(
              this.createObj(groupBy, filter.propName, keyValue),
              filter
            )
            // filters: this.sortObject(Utils.groupBy(data, filter.propName), filter)
          };
        });

        filterJSON = [
          {
            name: "Tab - 1",
            filters: filters
          }
        ];
          
        this.setState(
          {
            dataJSON: data,
            filteredDataJSON: data,
            topoJSON: topo.data,
            filterJSON: filterJSON,
            keyValue: keyValue,
            tabJSON: tab.data
          },

          e => {
            this.initF3BTWShareLinks();
            var that = this;
            if (window.ga) {
              ga(function() {
                var tracker = ga.getAll()[0].get("name");
                window.ga(`${tracker}.send`, {
                  hitType: "event",
                  eventCategory: "user interaction",
                  eventAction: "click",
                  eventLabel: "map view"
                });
                window.ga(`${tracker}.send`, {
                  hitType: "event",
                  eventCategory: "user interaction",
                  eventAction: "select",
                  eventLabel: this.state.mapDropdownName
                });
              });
            }
          }
        );
      })
    );

    let dimension = this.getScreenSize();
    //Polyfill for element.closest in old browsers.
    if (window.Element && !Element.prototype.closest) {
      Element.prototype.closest = function(s) {
        var matches = (this.document || this.ownerDocument).querySelectorAll(s),
          i,
          el = this;
        do {
          i = matches.length;
          while (--i >= 0 && matches.item(i) !== el) {}
        } while (i < 0 && (el = el.parentElement));
        return el;
      };
    }

    //show modal 5s after page has loaded
    window.setTimeout(
      function() {
        if (document.location.href.match(/#/g) !== null) {
          let viewCastID = document.location.href.substring(
            document.location.href.lastIndexOf("#") + 1
          );
          let data = this.state.dataJSON.find(i => i.view_cast_id === viewCastID)
          this.setState({
            iframeURL: data.iframe_url,
            showModal: true
          });
        }
      }.bind(this),
      5000
    );
  }

  findKeyValue(group) {
    let arr_of_values = [];
    // console.log(group)
    for (let value in group) {
      arr_of_values.push(value);
    }
    // console.log(arr_of_values,"arr_of_values");
    return arr_of_values;
  }

  createObj(group, param, keyValue) {
    let obj = {},
      arr1 = [];

    for (let i = 0; i < keyValue.length; i++) {
      if (group[keyValue[i]] === undefined) {
        obj[keyValue[i]] = [];
      } else {
        obj[keyValue[i]] = group[keyValue[i]];
      }
    }
    // console.log(obj, "object")
    return obj;
  }

  initF3BTWShareLinks() {
    var url = window.location.href,
      fb_share = $('meta[property="og:description"]').attr("content"),
      tw_share = $('meta[name="twitter:description"]').attr("content"),
      fb_share_url,
      tw_share_url;

    url = url.split("#")[0];

    fb_share_url = `http://www.facebook.com/sharer/sharer.php?u=${url}${
      fb_share ? "&description=" + encodeURI(fb_share) : ""
    }`;
    tw_share_url = `http://twitter.com/share?url=${url}${
      tw_share ? "&text=" + encodeURI(tw_share) : ""
    }`;

    document.getElementById("facebook-share-link").href = fb_share_url;
    document.getElementById("twitter-share-link").href = tw_share_url;
  }

  componentDidUpdate() {
    $(".tabs-area .single-tab").on("click", function(e) {
      $(".single-tab").removeClass("active-tab");
      $(this).addClass("active-tab");
      $(".tabs.active-area").removeClass("active-area");
      $(".tabs" + this.dataset.href).addClass("active-area");
    });

    if (this.state.mode === "col4") {
      $(".hamburger-icon").on("click", e => {
        $(".mobile-navigations-screen").addClass(
          "mobile-navigations-screen-slide-in"
        );
      });

      $(".close-icon").on("click", e => {
        $(".mobile-navigations-screen").removeClass(
          "mobile-navigations-screen-slide-in"
        );
      });
    }
  }

  getUniqueValuesOfKey(array, key) {
    return array.reduce(function(carry, item) {
      if (item[key] && !~carry.indexOf(item[key])) carry.push(item[key]);
      return carry;
    }, []);
  }

  sortObject(obj, filter) {
    var arr = [],
      nai,
      na;
    for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        arr.push({
          name: `${prop}`,
          value: prop === "Not available" ? "" : prop,
          count: obj[prop] === undefined ? 0 : obj[prop].length
        });
      }
    }
    na = arr.findIndex(x => x.name === "Not available");
    nai = arr.splice(na, 1);
    if (filter.propName === "year") {
      // console.log(nai)
      arr.sort((a, b) => {
        // console.log(a.value,b.value,a.value>b.value)
        if (a.value > b.value) return 1;
        if (a.value < b.value) return -1;
        else return 0;
      });
      arr.reverse();
    } else if (filter.propName === "type_of_land") {
      arr.forEach((e, i) => {
        switch (e.name) {
          case "Private":
            e.index = 1;
            break;
          case "Common":
            e.index = 2;
            break;
          case "Both":
            e.index = 3;
            break;
          default:
            e.index = 4;
        }
      });

      arr.sort((a, b) => {
        return a.index > b.index;
      });
    } else {
      arr.sort(function(a, b) {
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
    }
    arr.push(nai[0]);
    return arr; // returns array
  }

  onChange(filteredData) {
    // console.log(filteredData)
    // console.log(filteredData, "filteredData")
    let groupBy, keyValue;
    let filtDat = this.state.filters.map(filter => {
      groupBy = Utils.groupBy(filteredData, filter.propName);
      keyValue = this.findKeyValue(
        Utils.groupBy(this.state.dataJSON, filter.propName)
      );
      // console.log(groupBy, "groupBy")
      return {
        name: filter.alias,
        key: filter.propName,
        filters: this.sortObject(
          this.createObj(groupBy, filter.propName, keyValue),
          filter
        )
        // filters: this.sortObject(Utils.groupBy(filteredData, filter.propName), filter)
      };
    });

    // console.log(filtDat, filteredData, "on chnage filteredData")

    let filterJSON = [
      {
        name: "Tab - 1",
        filters: filtDat
      }
    ];

    let conflictSum = filteredData.length;
    let peopleAffected = 0, investment = 0, landAffected = 0;
    filteredData.forEach(k => {
      if (k.no_of_people_affected === "") {
        k.no_of_people_affected = "0"
      }
      if (k.investments === "") {
        k.investments = "0"
      }
      if (k.land_area_affected === "") {
        k.land_area_affected = "0"
      }
      peopleAffected += parseInt(k.no_of_people_affected);
      investment += parseInt(k.investments);
      landAffected += parseInt(k.land_area_affected);})
    let tabs = this.state.tabJSON
    tabs.data.tabs[0].number = conflictSum.toString();
    tabs.data.tabs[1].number = peopleAffected.toString();
    tabs.data.tabs[2].number = landAffected.toString();
    tabs.data.tabs[3].number = investment.toString();


    this.setState({
      filteredDataJSON: filteredData,
      filterJSON: filterJSON,
      tabJSON: tabs
    });
  }

  showModal(e) {
    if (window.ga) {
      window.ga(function() {
        var tracker = ga.getAll()[0].get("name");
        window.ga(`${tracker}.send`, {
          hitType: "event",
          eventCategory: "user interaction",
          eventAction: "click",
          eventLabel: "tell me how this map is constructed"
        });
      });
    }

    let viewCastID = e.target
        .closest(".protograph-trigger-modal")
        .getAttribute("id"),
      data = this.state.dataJSON.find(i => i.view_cast_id === viewCastID)
    this.setState({
      iframeURL: data.iframe_url,
      showModal: true
    });

    //change url in address bar based on the point clicked
    if (typeof history.pushState != "undefined") {
      let url;
      let currentURL = document.location.href;
      if (currentURL.indexOf("#") !== -1) {
        url = currentURL.substring(0, currentURL.indexOf("#")) + "#" + viewCastID;
      } else if (currentURL[currentURL.length - 1] == "/") {
        url =
          currentURL.substring(currentURL.lastIndexOf("#" + 1)) +
          "#" +
          viewCastID;
      } else {
        url =
          currentURL.substring(currentURL.lastIndexOf("#" + 1)) +
          "/#" +
          viewCastID;
      }
      let obj = { Title: viewCastID, Url: url };
      history.pushState(obj, obj.Title, obj.Url);
    } else {
      alert("Browser does not support HTML5.");
    }
  }

  closeModal() {
    //remove view cast id from url after modal is closed
    let currentURL = document.location.href;
    if (typeof history.pushState != "undefined") {
      let url = currentURL.substring(0, currentURL.indexOf("#"));
      let obj = { Title: "Land Conflict Watch", Url: url };
      history.pushState(obj, obj.Title, obj.Url);
    } else {
      alert("Browser does not support HTML5.");
    }
    this.setState({
      iframeURL: undefined,
      showModal: false
    });
  }

  onTabChange(e) {
    let tab = e.target.getAttribute("id"),
      label;

    if (!window.ga) return;
    if (window.ga && window.ga.constructor !== Function) return;

    switch (tab) {
      case "map-tab":
        label = "map view";
        break;
      case "list-tab":
        label = "table view";
        break;
      default:
        label = "";
        break;
    }

    if (window.ga) {
      ga(function() {
        var tracker = ga.getAll()[0].get("name");
        window.ga(`${tracker}.send`, {
          hitType: "event",
          eventCategory: "user interaction",
          eventAction: "click",
          eventLabel: label
        });
      });
    }
  }

  selectTab(){
    return 1
  }

  handleTabClick(tab){
    this.setState({
      currentTab: tab
    });
  }

  renderTabs(tabs){
    let tabNames;
    let tabClass;
    tabNames = tabs.map((tab,i)=>{
      let currTab = this.state.currentTab === '' ? this.selectTab() : this.state.currentTab;
      tabClass = (i+1 === currTab)? "cover-single-tab active":"cover-single-tab";
      return(
        <a key={i.toString()} className="tab-links" onClick={()=>this.handleTabClick(i+1)}>
          <div className={tabClass}>
            {tab.title}
            <div className="tab-value">
              {this.formatNumber(tab.number)}
              <img src={tab.tabIcon} height="24px"/>
            </div>
          </div>
        </a>
      )
    })
    return tabNames;
  }

  formatNumber(num){
    let rev = "";
    let frNumRev="";
    let frNum = '';
    let remain;
    for (var i = num.length - 1; i >= 0; i--) {
        rev += num[i];
    }
    remain = rev;
    frNum = remain.slice(0,3);
    if(num.length>3){
      frNum += ',';
      remain = remain.slice(3);
      while(remain.length>0){
        if(remain.length<=2){
          frNum += remain;
          break;
        }
        else{
          frNum += remain.slice(0,2)+',';
          remain = remain.slice(2);
        }
      }
    }
    for (var i = frNum.length - 1; i >= 0; i--) {
      frNumRev += frNum[i];
    }
    return frNumRev;
  }

  renderTabContent(tabs,tabNo){
    let tabContent;
    let display;
    tabContent = tabs.map((tab,i)=>{
      display = (tabNo === i+1)? "":"none";
      return(
        <div className="selected-tab-content" style={{display:display}}>
          <div className="content-title">
            {tab.title} <img src={tab.desIcon}/>
          </div>
          <div className="display-value">
            {this.formatNumber(tab.number)}
          </div>
          <p>{tab.description}</p>
        </div>
      )
    })
    return tabContent;
  }


  renderCover16() {
    if (this.state.fetchingData ){
      return(<div>Loading</div>)
    } else {
      let data = this.state.tabJSON.data,
        bg_image = data.cover_image,
        title = data.title,
        tabs = data.tabs,
        currTab = this.state.currentTab === '' ? this.selectTab() : this.state.currentTab;
        console.log(currTab, "currTab")
      return (
        <div id="protograph_div" className="protograph-col7-mode">
          <div className="col-16-cover-area">
            <div className="background-image">
              <img src={bg_image}/>
            </div>
            <div className="color-overlay">
              <div className="page-title">
                Data
              </div>
              {this.renderTabContent(data.tabs, currTab)}
              <div className="vertical-tabs">
                {this.renderTabs(data.tabs)}
              </div>
            </div>
          </div>
        </div>
      )
    }
  }

  renderCover4() {
    if (this.state.fetchingData) {
      return (<div>Loading</div>)
    } else {
      let data = this.state.tabJSON.data,
        bg_image = data.cover_image,
        title = data.title,
        tabs = data.tabs,
        currTab = this.state.currentTab === '' ? this.selectTab() : this.state.currentTab;
      return (
        <div id="protograph_div" className="protograph-col4-mode" style={{display: 'flex'}}>
          <div className="col-4-cover-area">
            <div className="background-image">
              <img src={bg_image}/>
            </div>
            <div className="color-overlay">
              <div className="page-title">
                Data
              </div>
              {this.renderTabContent(data.tabs, currTab)}
              <div className="vertical-tabs">
                {this.renderTabs(data.tabs)}
              </div>
            </div>
          </div>
        </div>
      )
    }
  }

  renderLoader() {
    let color = ProtoGraph.site["house_colour"],
      style = {
        display: "-webkit-flex",
        display: "flex",
        WebkitFlex: "0 1 auto",
        flex: "0 1 auto",
        WebkitFlexDirection: "column",
        flexDirection: "column",
        WebkitFlexGrow: 1,
        flexGrow: 1,
        WebkitFlexShrink: 0,
        flexShrink: 0,
        WebkitFlexBasis: "100%",
        flexBasis: "100%",
        maxWidth: "100%",
        height: "200px",
        WebkitAlignItems: "center",
        alignItems: "center",
        WebkitJustifyContent: "center",
        justifyContent: "center"
      };
    return (
      <div
        className="outer-container"
        style={{
          boxSizing: "border-box",
          display: "-webkit-flex",
          display: "flex",
          WebkitFlex: "0 1 auto",
          flex: "0 1 auto",
          WebkitFlexDirection: "row",
          flexDirection: "row",
          WebkitFlexWrap: "wrap",
          flexWrap: "wrap",
          clear: "both"
        }}
      >
        <div className="inner-container" style={style}>
          <RiseLoader color={color} />
        </div>
      </div>
    );
  }

  renderLaptop() {
    if (this.state.dataJSON === undefined) {
      return this.renderLoader();
    } else {
      $(".social-share-icons").css("display", "block");
      return (
        <div className="banner-area">
        {(this.state.mode === 'col4' ? this.renderCover4() : this.renderCover16())}
          <div className="proto-col col-4 filter-col protograph-filter-area">
            <div className="summary">
              <div className="article-share-icons">
                <a href="#" id="facebook-share-link" target="_blank">
                  <div className="single-share-icon">
                    <img src="https://cdn.protograph.pykih.com/Assets/proto-app/img/article-share-facebook.png" />
                  </div>
                </a>
                <a href="#" id="twitter-share-link" target="_blank">
                  <div className="single-share-icon">
                    <img src="https://cdn.protograph.pykih.com/Assets/proto-app/img/article-share-twitter.png" />
                  </div>
                </a>
              </div>
              {ProtoGraph.page.summary && (
                <div className="summary-text">{ProtoGraph.page.summary}</div>
              )}
            </div>
            <Filter
              configurationJSON={this.props.filterConfigurationJSON}
              dataJSON={this.state.filteredDataJSON}
              filterJSON={this.state.filterJSON}
              onChange={e => {
                this.onChange(e);
              }}
              hintText=""
            />
          </div>
          <div className="proto-col col-12 protograph-app-map-and-list">
            <div className="tabs-area">
              <div
                className="single-tab active-tab"
                id="map-tab"
                data-href="#map-area"
              >
                MAP
              </div>
              <div className="single-tab" id="list-tab" data-href="#list-area">
                LIST
              </div>
            </div>
            <div className="tabs map-area active-area" id="map-area">
              <div className="map-hint-text">
                Click on the circle to see details of the conflict
              </div>
              <Map
                dataJSON={this.state.filteredDataJSON}
                topoJSON={this.state.topoJSON}
                showModal={this.showModal}
                mode={this.props.mode}
                chartOptions={this.props.chartOptions}
              />
            </div>
            <div className="tabs list-area" id="list-area">
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
      );
    }
  }

  render() {
    return this.renderLaptop();
  }

  getScreenSize() {
    let w = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName("body")[0],
      width = w.innerWidth || e.clientWidth || g.clientWidth,
      height = w.innerHeight || e.clientHeight || g.clientHeight;

    return {
      width: width,
      height: height
    };
  }
}

export default App;
