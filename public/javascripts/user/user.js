$document.ready(function () {
	var strHTMLOutput = '';
	$.ajax('/portfolio/byuser/' + contact, {
		dataType: 'json',
		error: function () {
			console.log("ajax error : (");
		},
		success: function (data) {
			if(data.length > 0) {
				if(data.status && data.status === 'error') {
					strHTMLOutput = "<li>Error: " + data.error + "</li>";
				} else {
					var intItem,
						totalItems = data.length,
						arrLI = [];
					for(intItem = totalItems -1; intItem >=0; intItem--) {
						arrLI.push('<a href="/portfolio/'+data[intItem]._id + '">' + data[intItem].name + "</a");
					}
					strHTMLOutput = "<li>" + arrLI.join('</li><li>') + "</li>";
				}
			} else {
				strHTMLOutput = "<li>You haven't created portfolios yet</li>";
			}
			$('#myportfolios').html(strHTMLOutput);
		}
	});
});