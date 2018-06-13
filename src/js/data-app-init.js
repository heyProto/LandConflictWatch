ProtoGraph.initDataApp = function () {
    var x = new ProtoGraph.Card.toMaps(),
        streams = ProtoGraph.streams,
        page = ProtoGraph.page,
        selectedTab;

    // console.log(page.headline, "page.headline")

    switch(page.headline){
        case "No. of conflicts": 
            selectedTab = 'no_of_conflicts'
            break;
        case "Investments":
            selectedTab = 'investments'
            break;
        case "No. of people affected":
            selectedTab = 'no_of_people_affected'
            break;
        case "Land Area affected":
            selectedTab = 'land_area_affected'
            break;
    }
    console.log(streams.Grid.url)
    x.init({
        selector: document.querySelector('#card-list-div'),
        dataURL: "https://d2izuvkqhcn1gq.cloudfront.net/3085c3451ef0813e425ca73d/index.json",
        topoURL: 'https://duxxuzyhk2mdg.cloudfront.net/data/india-topo.json',
        chartOptions: {
            height: 700,
            defaultCircleColor: ProtoGraph.site['house_colour'],
            selectedTab: selectedTab
        },
        filterConfigurationJSON: {
            colors: {
                house_color: ProtoGraph.site['house_colour'],
                text_color: '#343434',
                active_text_color: ProtoGraph.site['house_colour'],
                filter_summary_text_color: ProtoGraph.site['reverse_font_colour']
            },
            selected_heading: 'FILTERS',
            reset_filter_text: 'Reset'
        },
        filters: [
            {
                "alias": "Year when conflict started ",
                "propName": "year"
            },
            {
                "alias": "State",
                "propName": "state"
            },
            {
                "alias": "District",
                "propName": "district"
            },
            // {
            //     "alias": "Number of people affected",
            //     "propName": "no_of_people_affected"
            // },
            // {
            //     "alias": "Land area affected (in ha)",
            //     "propName": "land_area_affected"
            // },
            // {
            //     "alias": "Investment (in crores Rs.)",
            //     "propName": "investments"
            // },
            {
                "alias": "Sector/ Type of industry",
                "propName": "type_of_industry"
            },
            {
                "alias": "Reasons/ Nature of land conflict",
                "propName": "nature_of_land_conflict"
            },
            {
                "alias": "Type of land",
                "propName": "type_of_land"
            }
        ]
    });
    x.renderLaptop();
}