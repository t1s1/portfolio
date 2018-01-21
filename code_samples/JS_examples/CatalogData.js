/* CatalogData handles loading and retrieval of catalog data
 * configures and displays the data using the 
 * DataTables plugin
 */
var CatalogData = (function() {

  var URL = "fetch.php?"
  var loadingMessage = '<tr><td colspan="5" class="loadingMessage">Loading data, please wait a moment...</td></tr>';
  var registerLinkText = "Request Training";
  var webexLinkText = "Register Here";
  var recordedLinkText = "View Recorded Session";
  var noSessionsAvailableText = "There are no sessions scheduled for this topic.";
  var requestLinkText = "Request Subscription";
  var scheduleHTMLTableHeader = "<h3>Schedule</h3><table width='100%'><thead><tr><th width='25%'>Location</th><th width='25%'>Date</th><th width='25%'>Time</th><th width='25%'>Link</th></tr></thead>";
  var dataTableObj = {};
  var swfPath = "./js/copy_cvs_xls.swf";
  var sDom = 'T<"clear">lfrtip';
  
  var aoColumnDefs = [ 
    {"bSortable": false, "aTargets" : [cMap.description, cMap.schedule] },
    {"sClass": "courseName", "aTargets" : [cMap.course] }, 
    {"sClass": "deliveryMode", "aTargets" : [cMap.mode] }, 
    {"sType": "currency", "aTargets" : [cMap.price] }, 
    {"sClass": "coursePrice", "aTargets" : [cMap.price] },
    {"sClass": "courseDuration", "aTargets" : [cMap.duration] },
    {"sClass": "courseAudience", "aTargets" : [cMap.audience] },
    {"sClass": "courseDescription", "aTargets" : [cMap.description] },
    {"sClass": "courseSchedule", "aTargets" : [cMap.schedule] }
  ];
  
  /* converts scheduleData object to HTML
   */
  function format(catalogData) {
    // iterate through catalog array of courses
    $.each( catalogData, function(cIndex) {
      // for each course, extract schedule_data object
      var scheduleData = catalogData[cIndex][cMap.schedule].schedule_data;
      // scheduleHTML is constructed from scheduleData object
      var scheduleHTML = "";
      // if there is NO SCHEDULE DATA
      if (scheduleData === null || scheduleData.length === 0) { 
        // check delivery mode ...for eLearning
        if ( catalogData[cIndex][cMap.mode] == "eLearning" ) {
          scheduleHTML += "<p><a href='#' onclick=\"RequestForm.show(\'";
          scheduleHTML += Filters.selectedProduct()+"\',\'";
          scheduleHTML += catalogData[cIndex][cMap.course]+"\',\'";
          scheduleHTML += catalogData[cIndex][cMap.mode]+"\',\'";
          scheduleHTML += "Online"+"\',\'";
          scheduleHTML += "Subscription"+"\',\'"; 
          scheduleHTML += "Subscription";
          scheduleHTML += "\')\">"+ requestLinkText +"</a></p>";
        }
        // ...check for Webinar
        else if ( catalogData[cIndex][cMap.mode] == "Webinar" ) {
          scheduleHTML += "<table><tr><td>"+noSessionsAvailableText+"<br><a href='"+catalogData[cIndex][cMap.webExURL]+"' target='webex'>"+recordedLinkText+"</a></td></tr></table>";
        }
        // it's not eLearning, and it's not Webinar, so this schedule is "TBD"
        else {
          scheduleHTML += scheduleHTMLTableHeader;
          scheduleHTML += buildTableRow(
            Filters.selectedProduct(),
            catalogData[cIndex][cMap.course],
            "TBD",
            "TBD",
            "TBD",
            "TBD",
            ""
          );
        }
      }
       // we have some schedule data
      else {
        // start schedule table
        scheduleHTML += scheduleHTMLTableHeader;
        // iterate through schedule for each course to get classes
        $.each( scheduleData, function(sIndex, classData ) {
          var classInfo = {
            product:  Filters.selectedProduct(),
            course:   catalogData[cIndex][cMap.course],
            mode:     catalogData[cIndex][cMap.mode],
            location: scheduleData[sIndex][sMap.location],
            date:     scheduleData[sIndex][sMap.date],
            time:     scheduleData[sIndex][sMap.time],
            link:     scheduleData[sIndex][sMap.link]
          };
          // build table row
          scheduleHTML += buildTableRow(
            classInfo.product,
            classInfo.course,
            classInfo.mode,
            classInfo.location,
            classInfo.date,
            classInfo.time,
            classInfo.link
          );
        });
        scheduleHTML += "</table>";
      }
      // replace scheduleData object with constructed HTML
      catalogData[cIndex][cMap.schedule] = scheduleHTML;
      // strip out the recorded WebEx URL, because we only needed it if there were no scheduled sessions for essentials
      catalogData[cIndex].splice(cMap.webExURL,1);
    });
    return catalogData;
  }
  // constructs table row in schedule (details)
  function buildTableRow(product, course, mode, location, date, time, link) {
    var scheduleTableRowHTML = "<tr>";
    if(mode === "Webinar") {
      scheduleTableRowHTML += "<td class='data'>"+ location +"</td>";
      scheduleTableRowHTML += "<td class='data'>"+ date +"</td>";
      scheduleTableRowHTML += "<td class='data'>"+ time +"</td>";
      scheduleTableRowHTML += "<td><a href='"+ link +"' target='webex'>"+ webexLinkText +"</a></td></tr>";
    }
    else {
      scheduleTableRowHTML += "<td class='data'>"+ location +"</td>";
      scheduleTableRowHTML += "<td class='data'>"+ date +"</td>";
      scheduleTableRowHTML += "<td class='data'>"+ time +"</td>";
      scheduleTableRowHTML += "<td><a href='#' onclick=\"RequestForm.show(\'";
      scheduleTableRowHTML += product+"\',\'";
      scheduleTableRowHTML += course+"\',\'";
      scheduleTableRowHTML += mode+"\',\'";
      scheduleTableRowHTML += location+"\',\'";
      scheduleTableRowHTML += date+"\',\'";
      scheduleTableRowHTML += time;
      scheduleTableRowHTML += "\')\">"+ registerLinkText +"</a></td></tr>";
    }
    return scheduleTableRowHTML;  
  }
  
  /* when dataTable is done loading
   */
  function fnInitComplete() {
    $('#catalogTable').show('slow');
    $('#filterByMonth').show('slow');
    $('#initialHint').hide();
  }
  /* switch zebra striping (open is green, closed is either gray or white)
   */
  function switchRowStatus(row) {
    if( $(row).hasClass('odd') ){
      $(row).removeClass('odd').addClass('wasOdd');
    } 
    else if( $(row).hasClass('even') ){ 
      $(row).removeClass('even').addClass('wasEven');
    }
    else if( $(row).hasClass('wasOdd') ){
      $(row).removeClass('wasOdd').addClass('odd'); 
    } 
    else if( $(row).hasClass('wasEven') ){ 
      $(row).removeClass('wasEven').addClass('even');
    }
  }
  /* configures and loads dataTables plugin
   */
  function setupDataTable(data) {
    // dataTable plugin is configured, initialized and stored in dataTableObj
    dataTableObj = $('#catalogTable').dataTable({
      "sDom": sDom, 
      "oTableTools": {"aButtons": ["csv"], "sSwfPath": swfPath},
      "bAutoWidth": false, 
      "bPaginate": false, 
      "bFilter": true, 
      "bSort": true, 
      "aaSorting": [ [0,'asc'] ],
      "bDestroy": true,
      "bInfo": false, 
      "aoColumnDefs": aoColumnDefs,
      "aaData": data,
      "fnInitComplete": fnInitComplete 
    });
  }
  /* initialize module
   */
  function init() {
    // send correct number of columns to Filters to use for product list
    Filters.setColumns(2);

    // handle click event to OPEN row
    $('.odd .courseName, .even .courseName').live('click', function(event) {
      var thisRow = this.parentNode;
      var isClassroom = ( $('.deliveryMode', thisRow).text()== "Classroom" ) ? true : false;
      // create HTML for description and duration
      var itemHTML = "<p>"+$('.courseDescription', thisRow).text()+"</p>";
      // add HTML for schedule
      itemHTML += $('.courseSchedule', thisRow).html();
      // open row and add class for styling
      var row = dataTableObj.fnOpen( thisRow, itemHTML, 'dataTables_detail' );
      // kind of a hack to fix the automatic setting that the datatables plugin does
      // we only want 5 columns instead of 7, because 2 are hidden
      $(row).children("td").attr("colspan","5");
      // update zebra-striping
      switchRowStatus(thisRow);
      // table cells of upper row get special style as well
      $('> td', thisRow).addClass('dataTables_detailTop');
      // disable standard event behavior (if any)
      return false;
    } );

    // handle click event to CLOSE row
    $('.wasOdd .courseName, .wasEven .courseName').live('click', function(event) {
      var thisRow = this.parentNode;
      switchRowStatus(thisRow);
      dataTableObj.fnClose(thisRow);      
      $(thisRow).children('td').removeClass('dataTables_detailTop');
      // disable standard event behavior (if any)
      return false;
    } );
  }
  // called on jQuery ready
  $( init );
  
  return {
    update : function(id) {
      // GET specified products as JSONP - json_data is JSON object
      $.getJSON(URL +'product_'+id.toString()+'=?', function(json_data){ 
        // format catalog data
        var formattedCatalog = format(json_data.catalog_data);
        setupDataTable(formattedCatalog);
        // loading message appears until overwritten by datatable
        $('.catalogTable tbody').append(loadingMessage);
      });  
    },
    getProducts : function() {
      // GET list of products as JSONP - json_data is JSON object
      $.getJSON(URL +'product_list'+'=?', function(json_data){
        // update product filter dropdown with list of products
        Filters.update(json_data.products); 
      });
    },
    filterByMonth : function(monthName) {
      // filters dataTable by given month, if it appears in schedule
      dataTableObj.fnFilter(monthName, cMap.schedule ); 
    }
  };
}());