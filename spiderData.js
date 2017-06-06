let slice = [].slice;
let DATA_WORKSHEET_NAME = 'Albums';
let NUMBER_OF_PLATFORMS = 3;

initUnderlyingData = function() {

  function errorWrapped(context, fn) {
    return function() {
      let args, err;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      try {
        return fn.apply(null, args);
      } catch (error) {
        err = error;
        return console.error("Got error during '", context, "' : ", err.message, err.stack);
      }
    };
  }

  function getValidIndexes(table, columnNames) {
    let columns = table.getColumns();
    let repIndex, monthLis, soldAlbums = 0;

    columns.map( (val, index) => {
      switch (val.getFieldName()) {
        case columnNames[0]: repIndex = index; break;
        case columnNames[1]: monthLis = index; break;
        case columnNames[2]: soldAlbums = index; break;
      }
    });

    return [repIndex, monthLis, soldAlbums]; 
  }

  function getMaxValues(table, columnNames) {
    let columns = table.getColumns();
    let maxItunesListeners, maxSpotifyListeners, maxOtherListeners, maxSoldItunes, maxSoldSpotify, maxSoldOther = 0;
    let tableData = table.getData()[0];

    columns.map( (val, index) => {
      switch (val.getFieldName()) {
        case columnNames[0]: maxItunesListeners = tableData[index].value; break;
        case columnNames[1]: maxSpotifyListeners = tableData[index].value; break;
        case columnNames[2]: maxOtherListeners = tableData[index].value; break;
        case columnNames[3]: maxSoldItunes = tableData[index].value; break;
        case columnNames[4]: maxSoldSpotify = tableData[index].value; break;
        case columnNames[5]: maxSoldOther = tableData[index].value; break;
      }
    });
    return [ Math.max(maxItunesListeners, maxSpotifyListeners, maxOtherListeners), Math.max(maxSoldItunes, maxSoldSpotify, maxSoldOther)]; 

  }

  function getInitData(platforms, columnNames) {
    let initObject = {};

    function getNullData(columnNames) {
      let nullData = [];

      columnNames.map( col => {
        nullData.push({axis: col, value: 0, perc: 0});
      } );

      return nullData;

    }

    platforms.map( platform => {
      initObject[platform] = {
        platform: platform,
      data: getNullData(columnNames)
      };

    });

    return initObject;
  }


  function initEditor() {
    let initData = getInitData(["iTunes", "Spotify", "Others"], ["Song reputation", "Monthly listeners", "# of sold albums"]);

    RadarChart(".radarChartITunes", initData.iTunes, radarChartOptions);
    RadarChart(".radarChartSpotify", initData.Spotify, radarChartOptions);
    RadarChart(".radarChartOthers", initData.Others, radarChartOptions);

  }

  function querySelectedMark(currentSheet) {
    currentSheet.getUnderlyingDataAsync({
      maxRows: 0,
      ignoreSelection: false,
      includeAllColumns: true,
      ignoreAliases: true
    }).then(onDataLoadOk, onDataLoadError);

  }
  function onDataLoadError(err) {
    return console.err("Error during Tableau Async request:", err);
  }
  function onDataLoadOk(table) {
    let tableData = table.getData();

    if (tableData.length != NUMBER_OF_PLATFORMS) {
      return;
    }

    setAlbumTitleLabel(tableData);
    setSpiderChartData(table);
  }

  function onMarkSelected(e) {
    // Prevent multiple querying by checking name of workshee
    // DATA_WORKSHEET_NAME must be given at the beggining of this filet 
    if (e.getWorksheet().getName() == DATA_WORKSHEET_NAME) {
      currentSheet = TBLib.getWorksheet(e.getWorksheet().getIndex());

      if (!currentSheet) return;
      querySelectedMark(currentSheet);
    }
  }

  function setAlbumTitleLabel(tableData) {
    // Hard coded column index for "Album title"
    let albumTitle = tableData[0][0].value;
    let albumTitleSelector = document.getElementById('albumTitle');
    albumTitleSelector.innerHTML = albumTitle;
  }

  function getSpiderChartData(platforms, columnNames, table) {
    let dataObject = {};
    let tableData = table.getData();
    
    let colIndexes = getValidIndexes(table, columnNames);
    let maxNumbers = [1];

    maxNumbers = maxNumbers.concat(getMaxValues(table, ["Max Monthly listeners Itunes", "Max Monthly listeners Spotify", "Max Monthly listeners other", "Max # of sold albums Itunes", "Max # of sold albums Spotify", "Max # of sold albums other"]));

    function getChartData(columnNames, platformIndex) {
      let platformData = [];

      columnNames.map( (column, index) => {
        platformData.push( { axis: column, value: tableData[platformIndex][colIndexes[index]].value, perc: tableData[platformIndex][colIndexes[index]].value / maxNumbers[index] } );
      } );

      return platformData;
    }

    platforms.map( (platform, platformIndex) => {
      dataObject[platform] = {
        platform: platform,
        data: getChartData(columnNames, platformIndex)
      };

    });

    return dataObject;
  }

  function setSpiderChartData(table) {
    let spiderData = getSpiderChartData(["iTunes", "Others", "Spotify"], ["Song reputation", "Monthly listeners", "# of sold albums"], table);

    RadarChart(".radarChartITunes", spiderData.iTunes, radarChartOptions);
    RadarChart(".radarChartSpotify", spiderData.Spotify, radarChartOptions);
    RadarChart(".radarChartOthers", spiderData.Others, radarChartOptions);

  }

  initEditor();

  return TBLib.getCurrentViz().addEventListener(tableau.TableauEventName.MARKS_SELECTION, e => onMarkSelected(e));

};

this.initUnderlyingData = initUnderlyingData;
