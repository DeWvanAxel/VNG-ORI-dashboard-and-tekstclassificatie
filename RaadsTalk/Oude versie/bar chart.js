var queries = Array("Algemene Verordening Gegevensbescherming","Cannabis","Common Ground","Digitalisering","Energietransitie", "Energiebesparing","Gemeentelijke Gemeenschappelijke Infrastructuur","Informatiesamenleving","Informatieveiligheid", "Klantreizen" ,"Klimaat","Omgevingswet", "Privacy","Sterke lokale democratie","Transformatie sociaal domein", "Schuldhulpverlening", "VNG Realisatie","VNG");


var N = 10;
var w = 1500;
var h = 400;
var marginBar = {
  top: 45,
  bottom: 150,
  left: 100,
  right: 10
};
var widthBar = w - marginBar.left - marginBar.right;
var heightBar = h - marginBar.top - marginBar.bottom;

var test 
getAmountBar($("#gemeente1").val(), $("#query").val(),$("#start_date").val(), $("#end_date").val(), "eerste")


var controls = d3.select("#chart3")
  .append("div") 
  .attr("id", "control");

var sort_btn = controls.append("button")
  .attr("state", 0)
  .html("Sorteer oplopend"); 

var chartGroup = d3.select("#chart3")
  .append("svg")
  .attr("id", "chart")
  .attr("height", h)
  .attr("width", w)
  .append("g")
  .attr("transform", "translate(" + marginBar.left + "," + marginBar.top + ")");

function getAmountBar(gemeente, query,start_date, end_date, intention) {
  counterBar = 0;
  ValuesBar = Array();
  queries.push(query)
  for (var i = 0; i < queries.length; i++) {
    getQueryResults(gemeente, queries[i], i,start_date, end_date, intention);
  }    
}

function getQueryResults(gemeente, query, valueIndex,start_date, end_date, intention){
  if (gemeente == "combined_index"){
  	gemeente = "";
  } else{
  	gemeente += "/"
  }
  $.post('http://api.openraadsinformatie.nl/v0/'+gemeente+'search', 
  	'{"query":"\\"'+query+'\\"","filters":{"collection":{"terms":["aalsmeer","alkmaar","almelo","almere","amersfoort","amstelveen","amsterdam","arnhem","baarn","barneveld","beemster","binnenmaas","bodegravenreeuwijk","borne","boxmeer","buren","cappelleadijssel","castricum", "culemborg","den_helder","denhaag","deventer","dewolden","diemen","doetinchem","dongen","drimmelen","edamvolendam","ede","emmen","enschede","epe","ettenleur","goirle","gouda","groningen","hardenberg","heemskerk","heerde","hendrikidoambacht","hilvarenbeek","hilversum","hollandskroon","hulst","katwijk","krimpenadijssel","krimpenerwaard","landsmeer","leeuwarden","leiden","leiderdorp","leusden","lingewaard","loonopzand","losser","maassluis","maastricht","medemblik","meierijstad","meppel","moerdijk","molenwaard","nieuwegein","nieuwkoop","nijkerk","noordoostpolder","noordwijk","noordwijkerhout","oisterwijk","oldambt","ommen","oosterhout","oostgelre","oss","oude_ijsselstreek","overbetuwe","raalte","rheden","rhenen","rijswijk","roermond","roosendaal","rucphen","schagen","schiedam","soest","staphorst","steenbergen","steenwijkerland","stichtsevecht","texel","teylingen","utrecht","veenendaal","velsen","vlaardingen","vlissingen","voorschoten","voorst","waalwijk","wageningen","wassenaar","zaanstad","zandvoort","zeist","zoetermeer","zwartewaterland","zwolle"]}, "start_date":{"from": "'+start_date+'","to":"'+end_date+'"}}}')
  .done(function(data){
    ValuesBar[valueIndex] = {y: query,x:data.meta.total};
    var dataset = ValuesBar
    counterBar ++;
    if(counterBar == queries.length){
      if(intention == "update"){
        chartGroup.selectAll("*").remove()
      }
      if(true){
        var yScaleBar = d3.scale.linear()
          .domain([0, d3.max(dataset, function (d) {
            return d.x
          })])
          .range([heightBar, 0]);

        var xScaleBar = d3.scale.ordinal()
          .domain(dataset.map(function (d) {
              return d.y
          }))
          .rangeBands([0, widthBar]);

        var linearColorScale = d3.scale.linear()
          .domain([0, dataset.length])
          .range(["#572500", "#F68026"]);

        var ordinalColorScale = d3.scale.category20();

        var xAxisBar = d3.svg.axis()
          .scale(xScaleBar)
          .orient("bottom");

        var yAxisBar = d3.svg.axis()
          .scale(yScaleBar)
          .orient("left");

        if(gemeente == ""){
	    	gemeenteNaam = "alle gemeentes"
	    }
	    else{
	    	gemeenteNaam = gemeente.slice(0,-1)
	    }

        chartGroup.append("text")
			.attr("class", "title")
		    .attr("x", 0)             
		    .attr("y", -30)
		    .attr("text-anchor", "left")  
		    .style("font-size", "16px") 
		    .style("text-decoration", "underline")  
		    .text("Staafdiagram: Hoeveelheid documenten uit " + gemeenteNaam +" waarin onderstaande termen voorkwamen tussen "+ $("#start_date").val()+" en " +$("#end_date").val()+ ".");

        function drawAxis(params) {
          if (params.initialize === true) {
            //Draw X Axis
            this.append("g")
              .classed("x axis", true)
              .attr("transform", "translate(" + 0 + " , " + heightBar + ")")
              .call(params.axis.x)
              .selectAll("text")
              .classed("x-axis-label", true)
              .style("text-anchor", "end")
              .attr("dx", -8)
              .attr("dy", 8)
              .attr("transform", "translate(0, 0) rotate(-20)");

            //Draw Y Axis
            this.append("g")
              .classed("y axis", true)
              .attr("transform", "translate(" + 0 + "," + 0 + ")")
              .call(params.axis.y);

            //Draw Y Label
            this.select(".y.axis")
              .append("text")
              .attr("x", 0)
              .attr("y", 0)
              .style("text-anchor", "middle")
              .attr("transform", "translate(-70," + heightBar / 2 + ") rotate(-90)")
              .text("Voorgekomen");

            //Draw X Label
            this.select(".x.axis")
              .append("text")
              .attr("x", 0)
              .attr("y", 0)
              .style("text-anchor", "middle")
              .attr("transform", "translate(" + widthBar / 2 + ", 130)")
              .text("term");

          } else if (params.initialize === false) {
            this.selectAll("g.x.axis")
              .transition()
              .duration(500)
              .call(params.axis.x);

            this.selectAll(".x-axis-label")
              .style("text-anchor", "end")
              .attr("dx", -8)
              .attr("dy", 8)
              .attr("transform", "translate(0, 0) rotate(-20)");

            this.selectAll("g.y.axis")
              .transition()
              .duration(500)
              .call(params.axis.y);
          }
        }
        
        function plot(params) {
          yScaleBar.domain([0, d3.max(params.data, function (d) {
            return d.x
          })]);
          xScaleBar.domain(params.data.map(function (d) {
            return d.y
          }));

          drawAxis.call(this, params);

          //Enter Phase
          this.selectAll(".bar")
            .data(params.data)
            .enter()
            .append("rect")
            .classed("bar", true)
            .on("mouseover", function (d, i) {
              d3.select(this).style("fill", "yellow")
            })
            .on("mouseout", function (d, i) {
              d3.select(this).style("fill", ordinalColorScale(d.y));
            })
            .on('click', function(d) {
			    var options = {filters:{collection:{terms:["aalsmeer","alkmaar","almelo","almere","amersfoort","amstelveen","amsterdam","arnhem","baarn","barneveld","beemster","binnenmaas","bodegravenreeuwijk","borne","boxmeer","buren","cappelleadijssel","castricum", "culemborg","den_helder","denhaag","deventer","dewolden","diemen","doetinchem","dongen","drimmelen","edamvolendam","ede","emmen","enschede","epe","ettenleur","goirle","gouda","groningen","hardenberg","heemskerk","heerde","hendrikidoambacht","hilvarenbeek","hilversum","hollandskroon","hulst","katwijk","krimpenadijssel","krimpenerwaard","landsmeer","leeuwarden","leiden","leiderdorp","leusden","lingewaard","loonopzand","losser","maassluis","maastricht","medemblik","meierijstad","meppel","moerdijk","molenwaard","nieuwegein","nieuwkoop","nijkerk","noordoostpolder","noordwijk","noordwijkerhout","oisterwijk","oldambt","ommen","oosterhout","oostgelre","oss","oude_ijsselstreek","overbetuwe","raalte","rheden","rhenen","rijswijk","roermond","roosendaal","rucphen","schagen","schiedam","soest","staphorst","steenbergen","steenwijkerland","stichtsevecht","texel","teylingen","utrecht","veenendaal","velsen","vlaardingen","vlissingen","voorschoten","voorst","waalwijk","wageningen","wassenaar","zaanstad","zandvoort","zeist","zoetermeer","zwartewaterland","zwolle"]},types:{terms:["events","motions","vote_events"]},classification:{terms:["Agendapunt","Agenda","Ingekomen stukken","Toezeggingen","Moties","Schriftelijke vragen","Raadsbrieven","Verslag","Commissiebrieven S&R", "Toezeggingen S&R","Amendementen","Besluitenlijst B&W","Toezeggingen M&S","Commissiebrieven M&S","Raadsvragen","Schriftelijke vragen (export)","Gemeentebladen","Schriftelijke Vragen","Toezeggingen Raad","Uitnodigingen","RSS","Voortganglijst/toezeggingen" ,"Brieven aan de raad","Informatie","Informatieve Stukken College","Stemmingen","Persberichten","Raadsverslagen","Artikel 44 vragen","Informatie van het college","Verslagen S&R","Collegebrieven","Aangeleverde raadsvoorstellen","Aanbevelingen onderzoeken","Brieven B&W aan raad","Besluitenlijsten raad","Griffie-info documenten","Besluitenlijsten college van B&W","Technische vragen","Besluitenlijst Raad","Rapport","Raadsmededelingen & Memo's","Memo's","Informatienota's","Memo actieve raadsinformatie","Overige raadsinformatie","B&W besluiten","Vragen aan het college","Weekmail","Standpuntenlijsten commissie(s)","Artikel 45 vragen","Artikel 32 vragen","Vragen","Besluitenlijsten (B&W)","Genomen raadsbesluiten","Raadsvragen en antwoorden","College besluitenlijsten","Beantwoorde raadsvragen","Report","Besluitenlijsten college","Verslagen M&S","Dossiers","Notulen raad","Besluitenlijsten van de raad","Vastgesteld beleid","Rekenkamerrapporten","Schriftelijke vragen (artikel 41 RvO)","Besluitenlijsten","Verslag B&W","Vergaderstukken gemeenschappelijke regelingen", "Collegevoorstellen (ter informatie)","Raadsvragen Schriftelijke","Verslagen Raad","export","Brieven aan de raad – Openbaar","Besluitenlijst","Collegeberichten","agendapunt_actielijst","Besluitenlijst raad","Raadsbesluiten","Besluitenlijst PS","Politieke vragen","Videotulen Commissie Stad en Ruimte","Openbare besluitenlijsten college","Notulen","Raadsinformatie","Videotulen Raadsvergadering ","Schriftelijke vragen art. 18","Besluitenlijsten B&W","Verslagen Vragenuur","Griffie-info","Schriftelijke vragen art. 41","Sjabloonvragen","Verslag Raad","Videotulen Commissie Mens en Samenleving","Raadsjournaal","Besluitenlijsten Raad","Mondelinge Vragen","Videotulen Gemeenteraad","Resolution"]},start_date:{from:start_date+"T00:00:01.000Z",to:end_date+ "T22:59:59.000Z"}}, facets:{start_date:{interval:"year"}},sort:"start_date",order:"desc"}
			    options = window.LZString.compressToBase64(JSON.stringify(options)).split('/').join('-')

			    if (gemeente != "alle gemeentes") {
				    window.open(
				    	'http://zoek.openraadsinformatie.nl/#/g/'+$("#gemeente1").val()+'/search/' +d.y+'/options/'+options,
				    	'_blank' // <- This is what makes it open in a new window.
			    	);
			    }
			    else{
			    	 window.open(
				    	'http://zoek.openraadsinformatie.nl/#/search/"' +d.y+'"	/options/'+options,
				    	'_blank' // <- This is what makes it open in a new window.
			    	);
			    }
			});;

          this.selectAll(".bar-label")
            .data(dataset)
            .enter()
            .append("text")
            .classed("bar-label", true);

          // Update Phase
          this.selectAll(".bar")
            .transition()
            .duration(500)
            .ease("bounce")
            .delay(function (d, i) {
              return i * 50
            })
            .attr("x", function (d, i) {
              return xScaleBar(d.y)
            })
            .attr("y", function (d, i) {
              return yScaleBar(d.x)
            })
            .attr("width", function (d, i) {
              return xScaleBar.rangeBand()
            })
            .attr("height", function (d, i) {
              return heightBar - yScaleBar(d.x)
            })
            .style("fill", function (d, i) {
              return ordinalColorScale(d.y)
            });

          this.selectAll(".bar-label")
            .transition()
            .duration(500)
            .ease("bounce")
            .delay(function (d, i) {
              return i * 50
            })
            .attr("x", function (d, i) {
              return xScaleBar(d.y) + xScaleBar.rangeBand() / 2
            })
            .attr("y", function (d, i) {
              return yScaleBar(d.x) - 20
            })
            .attr("dy", 15)
            .text(function (d, i) {
              return d.x
            })
            .style("fill", "black")
            .style("text-anchor", "middle");

          // //Exit Phase
          // this.selectAll(".bar")
          //   .data(params.data)
          //   .exit()
          //   .remove();

          // this.selectAll(".bar-label")
          //   .data(params.data)
          //   .exit()
          //   .remove();
        }



        plot.call(chartGroup, {
          data: dataset,
          axis: {
            x: xAxisBar,
            y: yAxisBar
          },
          initialize: true
        });

        sort_btn.on("click", function () {
        var self = d3.select(this);
        var state = +self.attr("state");
        var ascending = function (a, b) {
          return a.x - b.x
        }
        var descending = function (a, b) {
          return b.x - a.x
        }
        var txt = "Sorteer ";
        if (state === 0) {
          dataset.sort(ascending);
          state = 1;
          txt += "aflopend";
        } else if (state === 1) {
          dataset.sort(descending);
          state = 0;
          txt += "oplopend";
        }
        self.attr("state", state);
        self.html(txt);
        plot.call(chartGroup, {
          data: dataset,
          axis: {
            x: xAxisBar,
            y: yAxisBar
          },
          // gridline: yGridLinesBar,
          initialize: false
        });
      });
  }}}
)}

$("#klikhiermannetje").click(function(){getAmountBar($("#gemeente1").val(), $("#query").val(),$("#start_date").val(), $("#end_date").val(), "update");});