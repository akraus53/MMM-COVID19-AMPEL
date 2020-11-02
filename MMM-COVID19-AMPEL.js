/* global Module */

/* Magic Mirror
 * Module: MMM-COVID19-AMPEL
 *
 * By Daniel Osterkamp
 * MIT Licensed.
 */

Module.register("MMM-COVID19-AMPEL", {
  defaults: {
    header: 'COVID-19 Inzidenzwert',
    cityID: ["224"], // City ID from  https://npgeo-corona-npgeo-de.hub.arcgis.com/datasets/917fc37a709542548cc3be077a786c17_0/data
    infoRowClass: "small", // small, medium
    showUpdateDateInHeader: true,
    showUpdateDateInRow: false,
    updateInterval: 3600000, // update interval in milliseconds
    fadeSpeed: 4000,
    updateDate: "no update received yet"
  },

  getStyles: function () {
    return ["MMM-COVID19-AMPEL.css"]
  },

  start: function () {
    this.getInfo()
    this.scheduleUpdate()
  },

  scheduleUpdate: function (delay) {
    var nextLoad = this.config.updateInterval
    if (typeof delay !== "undefined" && delay >= 0) {
      nextLoad = delay
    }
    var self = this
    setInterval(function () {
      self.getInfo()
    }, nextLoad)
  },

  getInfo: function () {
    this.sendSocketNotification('GET_INCIDENTS', this.config.cityID)
  },

  socketNotificationReceived: function (notification, payload) {
    var self = this
    if (notification === "INCIDENTS") {
      this.globalIncidents = payload
      this.updateDom(self.config.fadeSpeed)
    }
  },

  getHeader: function () {
    var headerTitle = this.config.header
    if (this.config.showUpdateDateInHeader) headerTitle +=  " - " + this.config.updateDate;
    return headerTitle
  },

  getDom: function () {
    var wrapper = document.createElement("table")
    if (this.globalIncidents === null || this.globalIncidents === undefined) return wrapper
    if (Object.entries(this.globalIncidents).length === 0) return wrapper

    var globalStats = this.globalIncidents
    //globalStats is array with attributes and ITEMS

    wrapper.className = this.config.tableClass || 'covidAmpel'
    
    for (let i = 0; i < globalStats.length; i++) {
      const element = globalStats[i].attributes;



      let tableRow = document.createElement("tr");
      let incidentStateColora = document.createElement("td");
      let incidentCityName = document.createElement("td");
      let incidentUpdateDate = document.createElement("td");
      let incident7DayNumber = document.createElement("td");
      let incidentStateColorb = document.createElement("td");

      incidentCityName.innerHTML = element.GEN;
      incidentCityName.className = this.config.infoRowClass

      this.config.updateDate = element.last_update;
      if (this.config.showUpdateDateInRow) {
        incidentUpdateDate.innerHTML = element.last_update;
        incidentUpdateDate.className = this.config.infoRowClass
      }
      incident7DayNumber.className = this.config.infoRowClass
      incident7DayNumber.innerHTML = (Math.round(element.cases7_per_100k * 100) / 100).toFixed(2);

      incidentStateColora.innerHTML = "__";
      incidentStateColorb.innerHTML = "__";

      if (parseFloat(element.cases7_per_100k) <= 35) {
        incidentStateColora.className = incidentStateColorb.className = "green"
      }
      if (parseFloat(element.cases7_per_100k) > 35) {
        incidentStateColora.className = incidentStateColorb.className = "yellow"
      }
      if (parseFloat(element.cases7_per_100k) > 50) {
        incidentStateColora.className = incidentStateColorb.className = "red"
      }
      if (parseFloat(element.cases7_per_100k) > 100) {
        incidentStateColora.className = incidentStateColorb.className = "darkred"
      }

      tableRow.appendChild(incidentStateColora)
      tableRow.appendChild(incidentCityName)
      if (this.config.showUpdateDateInRow) { tableRow.appendChild(incidentUpdateDate) }
      tableRow.appendChild(incident7DayNumber)
      tableRow.appendChild(incidentStateColorb)

      wrapper.appendChild(tableRow)
    }
    return wrapper
  },
})
