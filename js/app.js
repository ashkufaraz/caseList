App = Ember.Application.create();
App.Router.map(function() {
      this.route("cases", { path: '/cases/:access_token/:server/:workspace/:client_id/:client_secret' });
});

//Get Access Token
App.IndexController = Ember.Controller.extend({
    actions: {
        login: function() {
 
            var username 		= this.get('username');
            var password 		= this.get('password');
            var client_id	    = this.get('client_id');
            var client_secret 	= this.get('client_secret');
            var server      	= this.get('serverAddress');
            var workspace		= this.get('workspace');
						
			var self = this;
            if (!Ember.isEmpty(username) && !Ember.isEmpty(password) && !Ember.isEmpty(client_id) && !Ember.isEmpty(client_secret) && !Ember.isEmpty(server) && !Ember.isEmpty(workspace)) {
				server=server.replace("/", ""); 
				server=server.replace("http:", ""); 
				
				var addressAccess="http://"	+	server +	"/"	+	workspace	+"/oauth2/token";
				
                var jqxhr = $.ajax({
                        type: "POST",
                        url: addressAccess,
                        dataType: 'json',
                        data: {
                            grant_type: 'password',
                            scope: '*',
                            client_id: client_id,
                            client_secret: client_secret,
                            username: username,
                            password: password
                        }
                    })
                    .done(function(data) {
                        if (data.error) {
                            alert("Error in login!\nError: " + data.error + "\nDescription: " + data.error_description);
                        } else if (data.access_token) {                      
                            var d = new Date();
                            d.setTime(d.getTime() + 60 * 60 * 1000);

                            document.cookie = "access_token=" + data.access_token + "; expires=" + d.toUTCString();
                            document.cookie = "refresh_token=" + data.refresh_token; //refresh token doesn't expire

                            self.transitionToRoute('cases',data.access_token,server,workspace,client_id,client_secret);
                        } else {
                            alert(JSON.stringify(data, null, 4)); //for debug
                        }
                    })
                    .fail(function(data, statusText, xhr) {
                        alert("Failed to connect.\nHTTP status code: " + xhr.status + ' ' + statusText);
                    });
            } else
                alert('All field is required!!!');
        },
		login2: function() {
 
            
            var client_id	    = this.get('client_id2');          
            var server      	= this.get('serverAddress2');
            var workspace		= this.get('workspace2');
						
			var self = this;
            if (!Ember.isEmpty(client_id)  && !Ember.isEmpty(server) && !Ember.isEmpty(workspace)) {
				server=server.replace("/", ""); 
				server=server.replace("http:", ""); 
				
				var addressAccess="http://"	+	server +	"/"	+	workspace	+"/oauth2/authorize?response_type=code&client_id="+client_id+"&scope=*";
				window.open(addressAccess);
                 
            } else
                alert('All field is required!');
        }
    
	}
});


//Get List Case
App.CasesRoute = Ember.Route.extend({
	 
    model: function(params) { 
		//params.queryParams.code is undefined
		//callBack:http://192.168.0.40/caseList/index.html#/cases/x/codechallenge.processmaker.io/workflow/YWEATDYCAEBAUXNXAMTNSOVSWCAIWUNU/66453249555bfcddfa6f920097209037
		var code=window.location.search.split('=')[1];
		var access_token="";
		 console.log(params);
		if(code!=undefined){
			var addressAccessToken="http://"	+	params.server +	"/"	+	params.workspace	+"/oauth2/token"; 
			 var jqxhr = $.ajax({
                        type: "POST",
                        url: addressAccessToken,
                        dataType: 'json',
                        data: {
                            grant_type: 'authorization_code',
                            scope: '*',
                            code: code,
                            client_id: params.client_id,
                            client_secret: params.client_secret
                        }
                    })
                    .done(function(data) {
                        if (data.error) {
                            alert("Error in login!\nError: " + data.error + "\nDescription: " + data.error_description);
                        } else if (data.access_token) {                      
                            var d = new Date();
                            d.setTime(d.getTime() + 60 * 60 * 1000);

                            document.cookie = "access_token=" + data.access_token + "; expires=" + d.toUTCString();
                            document.cookie = "refresh_token=" + data.refresh_token; //refresh token doesn't expire

                            var addressCases="http://"	+	params.server +	"/api/1.0/"	+	params.workspace	+"/cases";
							 return $.ajax({
								url: addressCases,
								type: "GET",
								contentType: false,
								beforeSend: function(request) {
									request.setRequestHeader("Authorization", "Bearer " +data.access_token);
								},
								success: function(data) {
									var addressAccess="http://"	+	params.server +	"/sys"	+	params.workspace	+"/en/neoclassic/cases/";
									 $.each(data, function(i, item) {
										data[i]['caseAddress']=addressAccess+"cases_Open?APP_UID="+data[i]['app_uid']+"&DEL_INDEX="+data[i]['del_index']+"&action=todo";
									}); 
								
									return data;
								},error:function(data, statusText, xhr) {
											alert("Failed to connect.\nHTTP status code: " + xhr.status + ' ' + statusText);
								 }

							});
                        } else {
                            alert(JSON.stringify(data, null, 4)); //for debug
                        }
                    })
                    .fail(function(data, statusText, xhr) {
                        alert("Failed to connect.\nHTTP status code: " + xhr.status + ' ' + statusText);
                    });			
		}
		else			
		{ 
			var addressCases="http://"	+	params.server +	"/api/1.0/"	+	params.workspace	+"/cases";
			 return $.ajax({
				url: addressCases,
				type: "GET",
				contentType: false,
				beforeSend: function(request) {
					request.setRequestHeader("Authorization", "Bearer " + params.access_token);
				},
				success: function(data) {
					var addressAccess="http://"	+	params.server +	"/sys"	+	params.workspace	+"/en/neoclassic/cases/";
					 $.each(data, function(i, item) {
						data[i]['caseAddress']=addressAccess+"cases_Open?APP_UID="+data[i]['app_uid']+"&DEL_INDEX="+data[i]['del_index']+"&action=todo";
					}); 
				
					return data;
				},error:function(data, statusText, xhr) {
							alert("Failed to connect.\nHTTP status code: " + xhr.status + ' ' + statusText);
				 }

			});
		}
    }
});
