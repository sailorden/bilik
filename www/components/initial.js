
//  Uncomment the line below to store the Facebook token in localStorage instead of sessionStorage
//  openFB.init('YOUR_FB_APP_ID', 'http://localhost/openfb/oauthcallback.html', window.localStorage);


    function login(scope, storage, to, ionicLoading, timeout, ref) {
        
         ionicLoading.show({
                content: '<i class="icon ion-loading-c" ></i>',
                animation: 'fade-in',
                showBackdrop: false,
                maxWidth: 50
             });
        openFB.login('email',
                function() {
                      getInfo(scope, storage, to, timeout, ionicLoading, ref);
                },
                function() {
                    alert('Facebook login failed');
                });
        return true;
    }
    function logout(){
        openFB.logout();
    }
    function loginmeli(scope, htt, loadin, ref) {

        openML.login('email',function(tk, us){ 
            htt({method: 'GET', url: 'https://api.mercadolibre.com/users/'+us}).
                success(function(data, status, headers, config) {
                ref.update({
                    "mercadolibre": {"id": us, "nickname" : data.nickname}
                });
                usu.idMeli = us;
                }).
                error(function(data, status, headers, config) {
                    
            });
            htt({method: 'GET', url: 'https://api.mercadolibre.com/users/'+us+'/addresses?access_token='+tk}).
                success(function(data, status, headers, config) {
                var locs = new Array();
                
               for(var i = 0; i<data.length; i++){
                   
                if(data[i].latitude != null && data[i].longitude != null){
                    locs.push({lat: data[i].latitude, long: data[i].longitude, name: data[i].address_line})
                }
               }
                var usua = storage.getObject('user');
                usua.locs = locs;
                storage.setObject('user', usua);
                scope.user = usua;
                }).
                error(function(data, status, headers, config) {
                    
            });
            loadin.hide();
            
        });
        
    }

    function getInfo(scope, storage, to, timeout, ionicLoading, ref) {
        
        openFB.api({
            path: '/me',
            success: function(data) {
                   ref.orderByChild("idFacebook").equalTo(data.id).on('value', function (snapshot) {
                   if(!snapshot.val()){
                       idConfiguraciones = ref.parent().child("configuraciones").push(createConfiguraciones(4,true,true,true));
                       user = ref.push(
                            Usuario.create(
                                data.first_name,
                                data.last_name,
                                data.email,
                                data.id,
                                "http://graph.facebok.com/"+data.id+"/picture?type=large",
                                data.birthday,
                                null,
                                idConfiguraciones.key(),
                                [],
                                null,
                                Firebase.ServerValue.TIMESTAMP,
                                [],
                                null,
                                [],
                                [],
                                [])
                            , function(){
                                storage.set('idUser', user.key());
                                timeout(function(){ionicLoading.hide(); scope.to('buy-step1')}, 1200);
                            }); 
                        }else{
                            snapshot.forEach(function(childSnapshot) {
                            storage.set('idUser', childSnapshot.key());
                            });
                            timeout(function(){ionicLoading.hide(); scope.to('buy-step1')}, 1200);
                        }
                        
                   });
                    
                },
                    error: errorHandler});
            }
                
    /*function getProducts(tk, us){
        
         openML.api({
            path: '/users/'+us+'/items/search?access_token='+tk,
            success: function(data) {
                  document.getElementById('sellstep1').style.display = 'block';
            },
            error: errorHandler});
    }*/
    function share() {
        openFB.api({
            method: 'POST',
            path: '/me/feed',
            params: {
                message: 'Testing Facebook APIs'
            },
            success: function(data) {
                alert('the item was posted on Facebook');
            },
            error: errorHandler});
    }

    function revoke() {
        openFB.revokePermissions(
                function() {
                    alert('Permissions revoked');
                },
                errorHandler);
    }

    function errorHandler(error) {
        alert(error.message);
    }


// handle custom url scheme
function handleOpenURL(url) {

  var path = url.match('://(.*?)[\\?#]')[1];

  if (path == 'oauth-callback') {

    // get hash part
    var query = url.substr(url.indexOf("#") + 1);

    var data = {};

    // split into parts
    var parts = query.split('&');

    // read names and values
    for (var i = 0; i < parts.length; i++) {
      var name = parts[i].substr(0, parts[i].indexOf('='));
      var val = parts[i].substr(parts[i].indexOf('=') + 1);
      val = decodeURIComponent(val);
      data[name] = val;
    }

    // save auth using LayoutController

    var $scope = angular.element(document.body).scope();

    $scope.$apply(function () {
      $scope.onAuth(data);
    });
  }
}

var app = angular.module('ionicApp', ['ionic', 'ionic.contrib.ui.tinderCards', 'geolocation', 'ngCordova'])


.factory('$localstorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}])
.factory('Camera', ['$q', function($q) {

  return {
    getPicture: function(options) {
      var q = $q.defer();

      navigator.camera.getPicture(function(result) {
        // Do any magic you need
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, 
      {allowEdit: true,
    correctOrientation: true,
    destinationType: Camera.DestinationType.DATA_URL,
    sourceType: Camera.PictureSourceType.CAMERA,
    targetHeight: 320,
    targetWidth: 320}
      );

      return q.promise;
    }
  }
}])
.factory('Library', ['$q', function($q) {

  return {
    getPicture: function(options) {
      var q = $q.defer();

      navigator.camera.getPicture(function(result) {
        // Do any magic you need
        q.resolve(result);
      }, function(err) {
        q.reject(err);
      }, 
      {allowEdit: true,
    correctOrientation: true,
    destinationType: Camera.DestinationType.DATA_URL,
    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
    targetHeight: 320,
    targetWidth: 320}
      );

      return q.promise;
    }
  }
}])
.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
  .state('into', {
    url: '/',
    templateUrl: 'intro.html',
    controller: 'IntroCtrl'
  })
  .state('register', {
    url: '/register',
    templateUrl: 'register.html',
    controller: 'RegisterCtrl'
  })
  .state('fb', {
    url: '/fb',
    templateUrl: 'fb.html',
    controller: 'FbCtrl'
  })
  .state('buy-step1', {
    cache: false,
    url: '/buy-step1/:search',
    templateUrl: 'buy-step1.html',
    controller: 'CardCtrl'
  })
  .state('seller', {
    url: '/seller/:tab',
    templateUrl: 'seller.html',
    controller: 'SellerCtrl'
  })
  .state('create', {
    url: '/create',
    templateUrl: 'create.html',
    controller: 'CreateCtrl'
  })
  .state('publicate', {
    url: '/publicate',
    templateUrl: 'publicate.html',
    controller: 'PublicateCtrl'
  })
  .state('publications', {
    url: '/publications',
    templateUrl: 'publications.html',
    controller: 'PublicationsCtrl'
  })
  .state('buy-config', {
    cache: false,
    url: '/buy-config',
    templateUrl: 'buy-config.html',
    controller: 'BuyConfigCtrl'
  })
  .state('buy-messages', {
    cache: false,
    url: '/buy-messages',
    templateUrl: 'buy-messages.html',
    controller: 'BuyMessagesCtrl'
  })
  .state('sell-config', {
    url: '/sell-config',
    templateUrl: 'sell-config.html',
    controller: 'SellConfigCtrl'
  })
  .state('searching', {
    url: '/searching',
    templateUrl: 'searching.html',
    controller: 'SearchingCtrl'
  })
  .state('buy-chat', {
    cache: false,
    url: '/buy-chat/:which',
    templateUrl: 'buy-chat.html',
    controller: 'BuyChatCtrl'
  });


  $urlRouterProvider.otherwise("/");

})
.directive('focusMe', function($timeout) {
  return {
    link: function(scope, element, attrs) {

      $timeout(function() {
        element[0].focus(); 
      },0);
    }
  };
})
.directive('styleParent', function(){ 
   return {
     restrict: 'A',
     link: function(scope, elem, attr) {
        
            var img = elem[0];
            var h = img.naturalHeight;
            var w = img.naturalWidth;
            if(h!=w){
                img.style.borderTopLeftRadius = "0px";
                img.style.borderTopRightRadius = "0px";
                img.style.marginTop = "2%";
                
            }
            //check width and height and apply styling to parent here.

     }
   };
})
.directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
}).directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
})
.controller('IntroCtrl', function($scope, $state, $ionicSlideBoxDelegate, $ionicPlatform, $ionicActionSheet, $timeout, $localstorage, $ionicLoading) { 
  // Called to navigate to the main ap
   ionic.Platform.ready(function() {
       document.getElementById("justIntro").href="";
    // hide the status bar using the StatusBar plugin
     if (!ionic.Platform.isIOS()) {
        // Android styles
          document.getElementById("styleId").href="css/style.css";
          document.getElementById("tinderId").href="css/tinder.android.css";
          document.getElementById("ionicId").href="components/ionic/release/css/ionic.android.css";
      }
    
    navigator.splashscreen.hide();
    $scope.init10 = false;
    $scope.init15 = false;
    $timeout(function(){$scope.init10 = true}, 500);
    $timeout(function(){$scope.init15 = true;}, 800);
    
  });
  
  //startLogin();
  //getInfo($scope);
  //alert($scope.userId);
  $scope.refUsuario = new Firebase("https://torrid-torch-3019.firebaseio.com/usuario");
    
  $scope.helpStyle = {"display" : "block", "color" : "#FFF", "font-size": "medium", "position" : "absolute", "top" : "77.5%", "right" : "28%"};
  $scope.noHelpStyle = {"display" : "none"};
  $scope.nameStyle = {"display" : "none"};
  $scope.continueStyle = { "position":"absolute",  "z-index":"1000", "width": "94.2%", "right": "3.1%"};

  $scope.changeToRegister = function(){
        $scope.nameStyle = {"display" : "block"};
        $scope.helpStyle = {"display" : "none"};
        $scope.noHelpStyle = {"display" : "block", "color" : "#FFF", "font-size": "medium", "position" : "absolute", "top" : "85%", "right" : "32%"};
        $scope.continueStyle = {"position":"absolute",  "z-index":"1000", "width": "94.2%", "right": "3.1%"};
  }
   $scope.changeToLogin = function(){
      $scope.helpStyle = {"display" : "block", "color" : "#FFF", "font-size": "medium", "position" : "absolute", "top" : "77.5%", "right" : "28%"};
      $scope.noHelpStyle = {"display" : "none"};
      $scope.nameStyle = {"display" : "none"};
      $scope.continueStyle = {"position":"absolute", "z-index":"1000", "width": "94.2%", "right": "3.1%"};


  }

 $scope.checkStyle = {"display": "none"};
 $scope.passStyle = {"border-bottom-right-radius": "6px",  "border-bottom-left-radius": "6px"};
 $scope.changeCheckStyle = function(){
      $scope.checkStyle = {"display": "block", "border-bottom-right-radius": "6px",  "border-bottom-left-radius": "6px"};
      $scope.passStyle ={};
 }

$scope.fblogin = function(){
    
    login($scope, $localstorage, 'buy-step1', $ionicLoading, $timeout, $scope.refUsuario);
}
$scope.fbsell = function(){
    login($scope,$localstorage, 'seller');
}
  $ionicPlatform.goToMercadolibre = false;
  $scope.slideHasChanged = function(index){
    
  }
  $scope.to = function(to) {
    
    $state.go(to);
  };
  // Called each time the slide changes
 //$localstorage.setObject('user', {})

if($localstorage.get('idUser') == "null" || typeof $localstorage.get('idUser') === undefined || $localstorage.get('idUser') == "undefined" || $localstorage.get('idUser') == undefined){
    $scope.to('into');
}else{
    $scope.to('buy-step1');
}
}).controller('BuyConfigCtrl', function($scope, $state, $ionicActionSheet, $state, $localstorage,$ionicLoading, $timeout, $ionicModal, $http) { 
    $scope.perma = {};
    $scope.configuraciones = {};
    $scope.distancia = {};
    $scope.usuario = {};
    $scope.to = function(to) {
        $state.go(to);
    };
  $scope.toTab = function(to, tab) {
    $state.go(to, {tab: tab});
  };
    $scope.myLoc = [];
  window.navigator.geolocation.getCurrentPosition(function(position) {
             position = position.coords;
              $http({method: 'POST', url: 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+position.latitude+','+position.longitude+'&sensor=false'}).
                success(function(data, status, headers, config) {
                  $scope.located.lat = position.latitude.toFixed(7);
                  $scope.located.long = position.longitude.toFixed(7);
                  $scope.located.street =  data.results[0].address_components[1].short_name;
                  var num = data.results[0].address_components[0].short_name.toString();
                  var whe = num.indexOf("-", 0);
                  var ber = num.substr(0, whe);
                  $scope.located.number =  parseInt(ber);
                  $scope.located.state = true;
                  $scope.located.barrio = data.results[0].address_components[2].short_name;
                  $scope.located.ciudad = data.results[0].address_components[3].short_name;
                  $scope.located.pais = data.results[0].address_components[4].short_name;
                  $scope.located.name = $scope.located.street + " " + $scope.located.number;
                  $scope.myLoc.push($scope.located);
                }).
                error(function(data, status, headers, config) {
                    
            });
           
        } );
  function onPrompt(results) {
    
      if(results.buttonIndex==2 && results.input1 !="" ){
         navigator.notification.confirm(
    'Te enviaremos un mail a '+results.input1+' con toda la informacion', // message
     null,            // callback to invoke with index of button pressed
    'Listo!',           // title
    ['Ok']     // buttonLabels
); 
      }else if(results.buttonIndex!=1){
         
         navigator.notification.confirm(
    'Error', // message
     null,            // callback to invoke with index of button pressed
    'Intenta nuevamente',
    ['Ok']     // buttonLabels
); 
      }
   
}
        $scope.createPublication = function(){
            navigator.notification.prompt(
                'Ingresa tu mail',  // message
                onPrompt,                  // callback to invoke
                'Un solo detalle',            // title
                ['Cancelar','Continuar'],             // buttonLabels
                ''                 // defaultText
            );
        };
        
        $scope.refUsuario = new Firebase("https://torrid-torch-3019.firebaseio.com/usuario/" + $localstorage.get("idUser")  + "/");
        $scope.refUsuario.on('value', function(dataSnapshot) {
          $scope.usuario = dataSnapshot.val();
        });
        $scope.refConfiguraciones = new Firebase("https://torrid-torch-3019.firebaseio.com/configuraciones/" + $scope.usuario.idConfiguraciones);
        $scope.refConfiguraciones.on("value", function(snapshot) {
          $scope.configuraciones = snapshot.val();
          $scope.distancia = {"km": snapshot.val().distancia};
        });
        
        $scope.loginmeli = function(){
             $ionicLoading.show({
                content: '<i class="icon ion-loading-c" ></i>',
                animation: 'fade-in',
                showBackdrop: false,
                maxWidth: 50
             });
            loginmeli($scope, $http, $ionicLoading, $scope.refUsuario);
        }
        
    
      $scope.changeDistance = function(){
        $scope.refConfiguraciones.update({
            "distancia": $scope.distancia.km
        });
         $localstorage.set('idBusqueda', '');
      }
      $scope.changeOfUser = function(what){
          if(what == "edad"){
             if(!isNaN($scope.configuraciones.edad)){
                  $scope.refConfiguraciones.update({
                    "edad" : $scope.configuraciones.edad
                  });
             }
          }else if(what == "telefono"){
            if(!isNaN($scope.configuraciones.telefono)){
                  $scope.refConfiguraciones.update({
                    "telefono" : $scope.configuraciones.telefono
                  });
            }
          }else if(what == "compra"){
              $scope.refConfiguraciones.update({
                "compra" : $scope.configuraciones.compra
              });
          }else if(what == "mensaje"){
              $scope.refConfiguraciones.update({
                "mensaje" : $scope.configuraciones.mensaje
              });
          }else if(what == "ubicacion"){
              $scope.refConfiguraciones.update({
                "ubicacion" : $scope.configuraciones.ubicacion
              });
          }
         
          
      }
      $scope.deleteLocation = function(ind){
          var vl = parseInt(ind);
          
          $scope.refUsuario.child("ubicacion").child(vl).remove();
      }
      $scope.openPicture = function(imageUrl){
          
          $scope.imageURL = imageUrl;
          $ionicModal.fromTemplateUrl('modal-picture.html', {
            scope: $scope
          }).then(function(modal) {
            $scope.modalPic = modal;
            $scope.modalPic.show();
          });
      };
      $scope.located = {};
      $scope.located.state = false;
       $scope.localiz = false;
      $scope.addLocation = function(){
          $scope.localiz = true;
          $timeout(function(){$scope.localiz = false}, 550);
        if(!$scope.located.street || !$scope.located.number || $scope.located.street.length == 0 || $scope.located.number <= 0){
         window.navigator.geolocation.getCurrentPosition(function(position) {
             position = position.coords;
              $http({method: 'POST', url: 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+position.latitude+','+position.longitude+'&sensor=false'}).
                success(function(data, status, headers, config) {
                  $scope.located.lat = position.latitude.toFixed(7);
                  $scope.located.long = position.longitude.toFixed(7);
                  $scope.located.street =  data.results[0].address_components[1].short_name;
                  var num = data.results[0].address_components[0].short_name.toString();
                  var whe = num.indexOf("-", 0);
                  var ber = num.substr(0, whe);
                  $scope.located.number =  parseInt(ber);
                  $scope.located.state = true;
                  $scope.located.barrio = data.results[0].address_components[2].short_name;
                  $scope.located.ciudad = data.results[0].address_components[3].short_name;
                  $scope.located.pais = data.results[0].address_components[4].short_name;
                }).
                error(function(data, status, headers, config) {
                    
            });
           
        } );
      }else{
         
          window.navigator.geolocation.getCurrentPosition(function(position) {
                 position = position.coords;
                  $http({method: 'POST', url: 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+position.latitude+','+position.longitude+'&sensor=false'}).
                    success(function(data, status, headers, config) {
                        
                      $scope.located.state = true;
                      if(data.results[0].address_components[2])
                      $scope.located.barrio = data.results[0].address_components[2].short_name;
                       if(data.results[0].address_components[3])
                      $scope.located.ciudad = data.results[0].address_components[3].short_name;
                       if(data.results[0].address_components[4])
                      $scope.located.pais = data.results[0].address_components[4].short_name;
                      $http({method: 'POST', url: 'http://maps.googleapis.com/maps/api/geocode/json?address='+$scope.located.number+' '+$scope.located.street+', '+$scope.located.barrio+', '+$scope.located.ciudad+', '+$scope.located.pais+'&sensor=false'}).
                       success(function(info, status, headers, config) {
                            var numi =  info.results[0].address_components[0].short_name.toString();
                            numi = numi.replace("-"," ~ ");
                            var thename = info.results[0].address_components[1].short_name + " " +numi;
                            var newloc =  {lat: info.results[0].geometry.bounds.northeast.lat.toFixed(7), long:info.results[0].geometry.bounds.northeast.lng.toFixed(7), name: thename};
                            $scope.locs = []
                            if($scope.usuario.ubicacion)
                            $scope.locs = $scope.usuario.ubicacion;
                            $scope.locs.unshift(newloc);
                            
                            $scope.refUsuario.update({
                               "ubicacion":  $scope.locs
                            });
                            $scope.located.street =  "";
                            $scope.located.number =  "";
                       }).
                       error(function(data, status, headers, config) {
                       });
                      
                    }).
                    error(function(data, status, headers, config) {
                        
                });
        
        });
          
          
          
      }
    
      }
      
       $scope.openModalProfile = function() {
          $ionicModal.fromTemplateUrl('modal-profile.html', {
            scope: $scope
          }).then(function(modal) {
            $scope.modalProfile = modal;
            $scope.modalProfile.show();
          });
         }
          $scope.openModalLocations = function() {
          $ionicModal.fromTemplateUrl('modal-locations.html', {
            scope: $scope
          }).then(function(modal) {
            $scope.modalLocations = modal;
            $scope.modalLocations.show();
          });
         }
         $scope.closeMe = function(){
            $scope.modalPicture.hide();
        }
           $scope.closeProfile = function(){
            $scope.modalProfile.hide();
        }
           $scope.closeLocations = function(){
            $scope.modalLocations.hide();
        }
          // Execute action on hide modal
          $scope.$on('modal.hidden', function() {
            // Execute action
          });
          // Execute action on remove modal
          $scope.$on('modal.removed', function() {
            // Execute action
          });
      $scope.logout = function(){
          navigator.notification.confirm("Desea cerrar sesion?", function(index){
              if(index==1){
                
                $ionicLoading.show({
                content: '<i class="icon ion-loading-c" >aa</i>',
                animation: 'fade-in',
                showBackdrop: false,
                maxWidth: 50,
                duration: 1500
             });
          $scope.refUsuario.update({
              "estado": Firebase.ServerValue.TIMESTAMP 
          })
          logout();
           localStorage.setItem("search", '');
          $localstorage.setObject('cards', {});
          localStorage.setItem("idUser", '');
          $localstorage.setObject("messages", []);
          
          
          $timeout(function(){$state.go('into');}, 1500);
              
          }}, "Atencion");
        
         
      }
}).controller('BuyMessagesCtrl', function($scope, $ionicActionSheet, $state, $timeout, $localstorage) { 
ionic.Platform.ready(function() {
  
});

 $scope.selected = false;
    $scope.aux = [];
    $scope.orden = {};
    $scope.keys = [];
  $scope.to = function(to) {
    $state.go(to);
  };
  $scope.toChat = function(which) {
    $state.go('buy-chat', {which:which});
  };
    

    
    $scope.refUsuario = new Firebase("https://torrid-torch-3019.firebaseio.com/usuario/"+$localstorage.get("idUser"));
    $scope.refTarjetas = new Firebase("https://torrid-torch-3019.firebaseio.com/tarjeta");
    $scope.refOrdenes = new Firebase("https://torrid-torch-3019.firebaseio.com/orden/");
    $scope.refConversaciones = new Firebase("https://torrid-torch-3019.firebaseio.com/conversacion/");
    $scope.refPreguntas = new Firebase("https://torrid-torch-3019.firebaseio.com/pregunta/");
    
     $scope.loadAgain = false;
     $scope.actualizar = function(){
        $scope.refUsuario.child('Orden').limitToFirst(1).once('value', function(firstSnapshot){
              firstSnapshot.ref().update({
                  "estado": Firebase.ServerValue.TIMESTAMP
              })
              
          });
          
     }
  $scope.loadAgainF = function(){
      if($scope.loadAgain == false){
          $scope.loadAgain = true;
          $timeout(function(){
              $scope.loadAgain = false;
              $scope.actualizar();
          }, 1500);
          
      }
     
  }
    $scope.refUsuario.on('value', function(dataSnapshot) {
        $scope.usuario = dataSnapshot.val();
    
    });
    if($localstorage.getObject("messages").length > 0){
        $scope.orden.value = $localstorage.getObject("messages");
        
    }
    $scope.refUsuario.child('Orden').on('value', function(ordenSnapshot){
        
        $scope.orden.preguntas = 0;
        $scope.orden.conversaciones = 0;
        angular.forEach(ordenSnapshot.val(), function(value, key) {
        
            if(typeof value === 'object' && value.estado > 0 && $scope.keys.indexOf(key) < 0){
               
                if(!$scope.keys.indexOf(key)){
                   $scope.keys.push(key); 
                }
                $scope.theorden = value;
                if($scope.orden.value){
                    
                    for(var k = 0;k < $scope.orden.value.length; k++){
                        if($scope.theorden.idTarjeta == $scope.orden.value[k].idTarjeta){
                            $scope.orden.value.splice(k, 1);
                        }
                    }
                    
                }
              
    
                if($scope.theorden.idConversacion){
                    $scope.refConversaciones.child($scope.theorden.idConversacion).once('value', function(convSnapshot) {
                        
                        $scope.theorden.conversacion = convSnapshot.val();
                        
                        if($scope.orden.conversaciones!=2){
                        
                            $scope.orden.conversaciones = $scope.theorden.estado;
                        }
                      $scope.chats = []
                      
                      $scope.idVendedor = $scope.theorden.conversacion.vendedor.id;
                      angular.forEach(convSnapshot.val(), function(obj, key){
                        
                        angular.forEach(obj, function(value, index){
                            
                          if(typeof value === 'object'){
                            $scope.chats.push(value);
                          }
                          //
                        });
                          //$scope.chats.push(obj);
                      });
                      $scope.chats.sort(function(a, b){return a.date-b.date});
                      $scope.ultimoMensaje = $scope.chats[$scope.chats.length-1].content;
         
               });
                    
                }
                if($scope.theorden.idPregunta){
                    $scope.refPreguntas.child($scope.theorden.idPregunta).once('value', function(pregSnapshot) {
                        $scope.theorden.pregunta = pregSnapshot.val();
                        if($scope.orden.preguntas!=2){
                            $scope.orden.preguntas = $scope.theorden.estado;
                        }
                     });
                     
                } 
            $scope.refUsuario.parent().child($scope.theorden.idVendedor).once('value', function(usuSnapshot) {
                 $scope.theorden.vendedor = usuSnapshot.val();
             });
            $scope.refTarjetas.child($scope.theorden.idTarjeta).on('value', function(tarjaSnapshot) {
    
                 $scope.theorden.tarjeta = tarjaSnapshot.val();
             });
             if($scope.theorden.estado > 0){
                
                $scope.aux.push($scope.theorden);
             }
             
              
            if(!$scope.orden.value){$scope.orden.value = []} 

            if($scope.aux.length > 0){
               
                $scope.orden.value = $scope.aux;
                $localstorage.setObject("messages", $scope.orden.value);
                 
            }
            
            
         }
        });
       
    
    
    });
    $timeout(function(){$scope.actualizar();}, 300);          
$scope.showSheetApproved = function(conv, nombre) {
   // Show the action sheet
   var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: '<b>Chat with '+nombre+'</b>' },
       { text: 'See publication' }
     ],
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {
         if(index==1){
              //$state.go('register');
         }
         if(index==0){
              $state.go('buy-chat', {which: conv});
         }
       return true;
     }
   });
    
   // For example's sake, hide the sheet after two seconds
   $timeout(function() {
     hideSheet();
   }, 10000);
}
}).controller('BuyChatCtrl', function($scope, $state, $timeout, $stateParams, $localstorage, $ionicScrollDelegate) { 
   
   
     $scope.to = function(to) {
        $state.go(to);
      };
      $scope.focusMua = true;
      
      var idConversacion = $stateParams.which;
      
      
      $scope.whoWas = function(whowa){
          
          return typeof whowa.id  !== 'string';
      }
      $scope.dameCuando = function(timestamp){
        if(timestamp == 1){
            return "En linea"
        }
        var date = new Date(timestamp);
        var today = new Date();
        var year = date.getFullYear()
        var month = date.getMonth()
        
        var day = date.getDay();
        // hours part from the timestamp
        var hours = date.getHours();
        // minutes part from the timestamp
        var minutes = "0" + date.getMinutes();
        // seconds part from the timestamp
        var seconds = "0" + date.getSeconds();
        
        
        // will display time in 10:30:23 format
        var formattedTime = hours + ':' + minutes.substr(minutes.length-2);
        
        if(today.getDay() - day > 1){
            return "ult. vez " + day + "/" + month + "/" + year;
        }else if (today.getDay() - day == 1){
            return "ult. vez ayer a las "+formattedTime;
        }else{
            return "ult. vez hoy a las " + formattedTime;
        }
      }
      $scope.refUsuario = new Firebase("https://torrid-torch-3019.firebaseio.com/usuario/");
      $scope.refConversacion = new Firebase("https://torrid-torch-3019.firebaseio.com/conversacion/" + idConversacion);
      $scope.refConversacion.on('value', function(convSnapshot){
          $scope.chats = [];
          
          $scope.idVendedor = convSnapshot.val().vendedor.id;
          angular.forEach(convSnapshot.val(), function(obj, key){
            angular.forEach(obj, function(value, index){
              if(typeof value === 'object'){
                $scope.chats.push(value);
              }
              //
            });
              //$scope.chats.push(obj);
          });
          $scope.chats.sort(function(a, b){return a.date-b.date});
          $scope.refUsuario.child($scope.idVendedor).on('value', function(vendedorSnapshot){
            $scope.vendedor = vendedorSnapshot.val();
        })
        $timeout(function(){$scope.focusMua = false}, 500);
      });
        $scope.sendStyle = {"display":"none"};
        
      $scope.focusInput = function(){
          $scope.sendStyle = {"display":"block"};
          $scope.notSendStyle = {"display":"none"};
      }
      $scope.blurInput = function(){
          $scope.sendStyle = {"display":"none"};
          $scope.notSendStyle = {"display":"block"};
      }
      
  $scope.userChatStyle = {"left": "0px !important", "right": "0px !important"};


  $scope.add = function() {
    $scope.refConversacion.child("comprador").push(
        {content: "<p>"+$scope.textMessage+"</p>",
        date: Firebase.ServerValue.TIMESTAMP
        }
    )
    /*var nextMessage = {content: "<p>"+$scope.textMessage+"</p>",
        date: Firebase.ServerValue.TIMESTAMP
        }
    $scope.chats.push(angular.extend({}, nextMessage));*/
   
    // Update the scroll area and tell the frosted glass to redraw itself
    $scope.textMessage = "";
    $scope.focusMua = true;
    $timeout(function(){$scope.focusMua = false;}, 100);
    //$timeout(function(){$ionicScrollDelegate.$getByHandle('theScroll').anchorScroll('start');},3000);
    $scope.sendStyle = {"display" : "none"};
  };
  
 $timeout(function(){$scope.userStatusStyle = {"left": "0px !important", "right": "0px !important", "font-size": "12px", "color": "#AAA", "margin-top": "29px"}}, 1000);
 $timeout(function(){$scope.userChatStyle = {"left": "0px !important", "right": "0px !important", "margin-top": "12px", "color" : "#000", "font-size": "16px"}}, 1000);

})
.controller('SearchingCtrl', function($scope, $state, $ionicSlideBoxDelegate, $timeout, $ionicLoading, $localstorage) {
    
$scope.searchs = []
$scope.aux = []
$scope.tops = [{"text" : "bag"}, {"text" : "camperita"}, {"text" : "Tv lcd 23 pulgadas"}, {"text" : "computadora thinkpad"}, {"text" : "yoghurt simple"}]
$scope.usuario = {};
$scope.userSearches = [];

    $scope.refUsuario = new Firebase("https://torrid-torch-3019.firebaseio.com/usuario/" + $localstorage.get("idUser")  + "/");
    $scope.refUsuario.on('value', function(dataSnapshot) {
      $scope.usuario = dataSnapshot.val();
      if(dataSnapshot.child("idBusqueda").hasChildren()){
            $scope.userSearches = $scope.usuario.idBusqueda;   
        }
    });
    $scope.refBusquedas = new Firebase("https://torrid-torch-3019.firebaseio.com/busqueda/");
    $timeout(function(){$scope.firebaseSearchFailed = true}, 3000);
    angular.forEach($scope.userSearches, function(value, key){
       
       
        $scope.refBusquedas.child(value).once('value', function(busqSnapshot){
            if(busqSnapshot.val().texto && $scope.aux.indexOf(busqSnapshot.val().texto) < 0 && $scope.aux.length < 9){
                $scope.aux.push(busqSnapshot.val().texto);
                $scope.searchs.push({"text" : busqSnapshot.val().texto})
            }
            
        })
       
    });
$scope.activeSlide = 0;

$timeout(function(){$scope.slider = $ionicSlideBoxDelegate.$getByHandle('myHandle');}, 10)
$scope.texti = {};

$scope.activeSlider = function(n){
    $scope.activeSlide = n;
    $scope.slider.slide(n, 1500);
}
$scope.deleteSearchs = function(){
    navigator.notification.confirm("Desea eliminar el historial?", function(index){
              if(index==1){
                
                $ionicLoading.show({
                content: '<i class="icon ion-loading-c" ></i>',
                animation: 'fade-in',
                showBackdrop: false,
                maxWidth: 50,
                duration: 100
             });
          
          $timeout(function(){$scope.searchs = {};}, 100);
              
          }}, "Atencion");
}
   $scope.to = function(to) {
        $state.go(to);
      };
      $scope.searchStyle =  {"display" : "none"};
      $scope.sendStyle = {"display":"none"};
      $scope.notSendStyle = {"display":"block"};
      $scope.focusInput = function(){
           $scope.sendStyle = {"display":"block"};
           $scope.notSendStyle = {"display":"none"};
           $scope.searchStyle =  {"display" : "block", "border-radius": "4px", "min-height": "34px","line-height": "1", "font-size": "13px", "border" : "1px solid", "margin-left": "5px"};
      };
      $scope.blurInput = function(){
          $scope.sendStyle = {"display":"none"};
          $scope.notSendStyle = {"display":"block"};
        if($scope.texti.t && $scope.texti.t.length > 0 && $scope.texti.t != "")
           $scope.searchStyle =  {"display" : "none"};
      };
      $scope.searchFrom = function(tex){
           if(!tex || tex==""){
               if($scope.texti.t){
                   var busqueda = $scope.refBusquedas.push(
                        Busqueda.create(
                             $scope.texti.t, [], Firebase.ServerValue.TIMESTAMP
                        )   
                    )
                    $localstorage.set('idBusqueda', busqueda.key());
                    
                    $scope.userSearches.push(busqueda.key())
                   $scope.refUsuario.child("idBusqueda").set($scope.userSearches);
                   $state.go('buy-step1', {search: $scope.texti.t});
               }
           }else{
                var busqueda = $scope.refBusquedas.push(
                    Busqueda.create(
                         tex, [], Firebase.ServerValue.TIMESTAMP
                    )   
                )
               $localstorage.set('idBusqueda', busqueda.key());
               $scope.userSearches.push(busqueda.key());
               $scope.refUsuario.child("idBusqueda").set($scope.userSearches);
               $state.go('buy-step1', {search: tex});
           }
      }
      
}).controller('CardCtrl', function($scope, $state, geolocation, $ionicGesture, $cordovaStatusbar, TDCardDelegate, $compile, $ionicPlatform, $http, $ionicLoading, $ionicModal,  $ionicBackdrop, $ionicPopover, $ionicPopup, $ionicSideMenuDelegate, $ionicSlideBoxDelegate, $timeout, $stateParams,$localstorage) {
    $scope.done = true;
    $scope.finished = false
    $scope.likeDown = false;
    $scope.laterDown = false;
    $scope.haveTouched = [];
    $scope.pressed = {};
    $scope.usuario = {};
    
    $scope.cardsPassed = [];
    $scope.configuraciones = {};
    $scope.ordenes = [];
    $scope.orden = {};
    $scope.userSearches = [];
    $scope.aux = [];
    $scope.backend = {};
    $scope.refBackend = new Firebase("https://torrid-torch-3019.firebaseio.com/backend");
    $scope.refGeofire = new Firebase("https://torrid-torch-3019.firebaseio.com/geofire");
    $scope.geoFire = new GeoFire($scope.refGeofire);
    $scope.refUsuario = new Firebase("https://torrid-torch-3019.firebaseio.com/usuario/"+$localstorage.get("idUser"));
    $scope.refOrdenes = new Firebase("https://torrid-torch-3019.firebaseio.com/orden/");
    $scope.refConversaciones = new Firebase("https://torrid-torch-3019.firebaseio.com/conversacion/");
    $scope.refPreguntas = new Firebase("https://torrid-torch-3019.firebaseio.com/pregunta/");
    $scope.refProductos = new Firebase("https://torrid-torch-3019.firebaseio.com/producto/");
     $scope.actualizar = function(){
        $scope.refUsuario.child('Orden').limitToFirst(1).once('value', function(firstSnapshot){
              firstSnapshot.ref().update({
                  "estado": Firebase.ServerValue.TIMESTAMP
              })
          });
     }
     $scope.refBackend.child("titulo").once('value', function(backendSnapshot){
         $scope.backend.titulo = backendSnapshot.val();
     });
    $scope.refUsuario.on('value', function(dataSnapshot) {
      $scope.usuario = dataSnapshot.val();
      $scope.usuario.key = dataSnapshot.key();
      if(dataSnapshot.child("idBusqueda").hasChildren()){
            $scope.userSearches = $scope.usuario.idBusqueda;
      }
      $scope.refConfiguraciones = new Firebase("https://torrid-torch-3019.firebaseio.com/configuraciones/"+$scope.usuario.idConfiguraciones);
      $scope.refConfiguraciones.on("value", function(snapshot) {
          $scope.configuraciones = snapshot.val();
      });
    });
    $scope.refUsuario.child("Orden").on('value', function(ordenSnapshot){
    $scope.orden.preguntas = 0;
    $scope.orden.conversaciones = 0;
     
    angular.forEach(ordenSnapshot.val(), function(obj, key){
        if(typeof obj === 'object' && obj.estado > 0){
            $scope.theorden = obj;
                if($scope.orden.value){
                    for(var k = 0;k < $scope.orden.value.length; k++){
                        if($scope.theorden.idTarjeta == $scope.orden.value[k].idTarjeta){
                            $scope.orden.value.splice(k, 1);
                        }
                    }
                }
                
                if($scope.theorden.idConversacion){
                    if($scope.theorden.estado == 3){
                       $scope.refUsuario.parent().child($scope.theorden.idVendedor).once('value', function(vendSnapshot){
                            
                           $scope.alertName = vendSnapshot.val().nombre + ":&nbsp;"
                        });
                        $scope.refConversaciones.child($scope.theorden.idConversacion).once('value', function(convSnapshot){
                           angular.forEach(convSnapshot.val().vendedor, function(value, key){
                               
                               $scope.alertValue = value.content;
                               $scope.alert = $scope.alertName + $scope.alertValue;
                           });
                           $timeout(function(){$scope.alert = "";
                            $scope.refUsuario.child("Orden").child(key).update({
                                "estado" : 2
                            })
                           
                            }, 5000);
                        });
                        
                        
                         
                        
                        
                    }
                    if($scope.orden.conversaciones!=2){
                        $scope.orden.conversaciones = $scope.theorden.estado;
                    }
                }
                if($scope.theorden.idPregunta){
                    if($scope.orden.preguntas!=2){
                        $scope.orden.preguntas = $scope.theorden.estado;
                    }
                }
             if($scope.theorden.estado>0)
             $scope.aux.push($scope.theorden);
            
                if(!$scope.orden.value){$scope.orden.value = []} 
                $scope.orden.value = $scope.aux;
                
                
             
        }
        
                
             
            
        });
    });
    $timeout(function(){$scope.actualizar()}, 100);
    $scope.refUsuario.update({
      "estado": 1
    });
    $scope.refUsuario.onDisconnect().update({ "estado": Firebase.ServerValue.TIMESTAMP });
    $scope.refTarjetas = new Firebase("https://torrid-torch-3019.firebaseio.com/tarjeta");
    $scope.reProductos = new Firebase("https://torrid-torch-3019.firebaseio.com/producto");
    if($localstorage.get('idBusqueda') && $localstorage.get('idBusqueda') != ''){
        $scope.refBusquedas = new Firebase("https://torrid-torch-3019.firebaseio.com/busqueda/" + $localstorage.get('idBusqueda'));
         $scope.refBusquedas.equalTo($localstorage.get('idBusqueda')).once('value', function(snapshot) {
          if(snapshot.child("idProducto").hasChildren()){
            $scope.cardsPassed = snapshot.val().idProduct;
          }
        });
    }else{
        $localstorage.setObject('cards', {});
        $scope.refBusquedas = new Firebase("https://torrid-torch-3019.firebaseio.com/busqueda/");
        var busqueda = $scope.refBusquedas.push(
                        Busqueda.create(
                             "ofertas", null, Firebase.ServerValue.TIMESTAMP
                        )   
                    )
        
        $localstorage.set('idBusqueda', busqueda.key());
        $scope.userSearches.push(busqueda.key())
        $scope.refUsuario.child("idBusqueda").set($scope.userSearches);
       
    }
    

    
    if($scope.modal){
        $scope.modal.remove();
    }
     
          
    // Execute action on hide modal
    $scope.$on('modalPic.hidden', function() {
  
    });
    // Execute action on remove modal
    $scope.$on('modalPic.removed', function() {
   
    });
    

    
    $scope.fakeContent = {};
    
    $scope.hideLoading = function(){
        $scope.showTinderButtons = false;
    }
    
     

   $scope.to = function(to) {
     
    $state.go(to);
  };
  
  $scope.showBuyPressed = false;
  $scope.showNopePressed = false;
  $scope.showNopePressedF = function(ind){
      return $scope.showNopePressed && ind+1 == $scope.cards.length;
  }
  $scope.showBuyPressedF = function(ind){
      return $scope.showBuyPressed && ind+1 == $scope.cards.length;
  }
  $scope.canPress = true;
  $scope.likeProduct = function(){
    if($scope.canPress){  
        $scope.canPress = false;
        $scope.showBuyPressed = true;
        var card = $scope.cards[$scope.cards.length -1];
        var orden = $scope.refUsuario.child("Orden").push(
            Orden.create(
                $scope.usuario.key, card.idVendedor, parseInt(card.id), 0
                 
            )   
        )
        
        
        $timeout(function(){
            $scope.pressedButtonLeft = {'opacity': 0};
            $scope.cardSwiped();
            $scope.showBuyPressed = false;
        }, 200);
        $timeout(function(){$scope.canPress = true}, 300);
         $scope.pressedButtonLeft = {'opacity': 1 };
       
    }
    if($scope.modal){
        $scope.modal.remove();
    }
  }
  $scope.laterProduct = function(){
    if($scope.canPress){
        $scope.canPress = false;
        $scope.showNopePressed = true;
        $timeout(function(){
            $scope.pressedButtonRight = {'opacity': 0};
            $scope.cardSwiped();
            $scope.showNopePressed = false;
        }, 200);
        $timeout(function(){$scope.canPress = true}, 300);
        $scope.pressedButtonRight = {'opacity': 1};
    }
    if($scope.modal){
        $scope.modal.remove();
    }
  }
   $scope.heading = "&heading=";
    $scope.headingValue = 0;
    $scope.moveLeft = function(){
         if($scope.headingValue<20)
            $scope.headingValue = 340;
         else
            $scope.headingValue -=20;
         console.log($scope.headingValue);
         
    }
    $scope.moveRight = function(){
        if($scope.headingValue>=340)
            $scope.headingValue = 0;
        else
            $scope.headingValue +=20;
         console.log($scope.headingValue);
    }
   $scope.openPicture = function(imageUrl){
        $scope.imageURL = imageUrl;
        $ionicModal.fromTemplateUrl('modal-picture.html', {
            scope: $scope
          }).then(function(modal) {
            $scope.modalPicture = modal;
            $scope.modalPicture.show();
          });
    };
    $scope.openLive = function(imageUrl){
          $scope.imageURL = imageUrl;
        $ionicModal.fromTemplateUrl('modal-live.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modalLive = modal;
           
            $scope.modalLive.show();
        });
    };
  $scope.closeMe = function(){
     $scope.modalPicture.hide(); 
  }
  $scope.closeLive = function(){
     $scope.modalLive.hide(); 
  }
  $scope.getRoundedPrice = function(what){
     if(what > 1000){
        what = (what/1000).toString()
        return what.substr(0,what.indexOf("."))+"k";
    }else{
        return what;
    }
  }
  $scope.likeFromModal = function(){
        $scope.modal.remove();
        $timeout(function(){
            $scope.likeProduct();
            //StatusBar.backgroundColorByHexString("#0089ba");
        }, 100);
       
  }
  $scope.laterFromModal = function(){
    $scope.modal.remove();
    $timeout(function(){
        $scope.laterProduct();
        //StatusBar.backgroundColorByHexString("#0089ba");
    }, 100);
  }
  

  $scope.likeTouch = function(){
    $scope.tinderClick = true;  
  }
  $scope.likeRelease = function(){
    $scope.tinderClick=false;
  }
  $scope.laterTouch = function(){
    $scope.tinderDesClick = true;  
  }
  $scope.laterRelease = function(){
      $scope.tinderDesClick=false;
  }
   $scope.imageStyleTinder = {"background-image": "url('img/loading.gif')", "border-radius": "100px", "width": "100px",  "height": "100px", "border" : "2px solid #FFF", "display" : "block", "margin" : "0 auto"};
    $scope.share = function(){
        window.plugins.share.show(
          {
              subject: 'Echale un vistazo a esta app',
              text: 'Mira esta nueva app para comprar productos por tu zona.'
          },
          function() {}, // Success function
          function() {alert('Share failed')} // Failure function
      );
    }
    $scope.blurInput = function(){
        var inp = document.getElementById("searchData");
        inp.blur();
        //var firstCard = document.getElementById("startCard");
        //firstCard.style.opacity = "0";
    }
    $scope.newCard = function(){
        var text = $scope.searching.searchText;
        $scope.addCard(text);

    };
    $scope.addLot = function(){
        $scope.customOffer.show = false;
        $scope.showTinderButtons = false;
        $scope.cards = [];
        var i = 0;
       

       // for(i = 0; i<6; i++){
            
           $scope.newCard();
           $scope.finished = false;
        //}
            
           $scope.finished = true;
       
    };
    $scope.searching = {};
    $scope.givenText = $stateParams.search;
    $scope.searching.searchText = $scope.givenText;
    $scope.cargarNuevas = false;
    if($scope.searching && $scope.searching.searchText && $scope.searching.searchText != "" ){
        localStorage.setItem("search", $scope.searching.searchText);
        $scope.cargarNuevas = true;
    }
    if(!$scope.searching.searchText || $scope.searching.searchText ==""){
         $scope.searching.searchText = localStorage.getItem("search");
         $scope.cargarNuevas = false;
         $scope.showTinderButtons = false;
    }
    
    $scope.onHold = function(index){
      $scope.showConfirm (); 
    };
    $scope.capslow = function(){
       var tex = $scope.searching.searchText;
       $scope.searching.searchText = tex.charAt(0) + tex.slice(1).toLowerCase();
       
    };
    $scope.addToPrice = function(valu){
        $scope.priceRange+=valu;
    }
    
    $scope.inRangeHour = function(inp, outp){
        return inp < outp;
    }
    $scope.elements = [];
    $scope.openModalProduct = function(indice) {
    
    if(indice == null){
    indice = $scope.cards.length -1;
    }
    $scope.selectedCard = $scope.cards[indice];
    $scope.priceRange = parseInt($scope.selectedCard.precio);
  $ionicModal.fromTemplateUrl('modal-product-2.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
    $scope.modal.show();
    $scope.selectedCard = $scope.cards[indice];
    $scope.refProductos.child($scope.selectedCard.idProducto).once('value', function(prodSnapshot){
        $scope.selectedCard.producto = prodSnapshot.val();
    });
    $scope.isFakeContent = true;

  });
 }
  $scope.getWithDiscount = function(price){
      return parseInt(price * 0.9, 10);
  } 
  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.remove();
    $timeout(function(){
        //StatusBar.backgroundColorByHexString("#0089ba")
        
        }, 200);
  };

  //Cleanup the modal when we're done with it!
  // Execute action on hide modal
 

    $scope.showConfirm = function() {
     var confirmPopup = $ionicPopup.confirm({
       title: 'Cancel',
       template: 'Are you cancel this product?'
     });
     confirmPopup.then(function(res) {
       if(res) {
         console.log('You are sure');
       } else {
         console.log('You are not sure');
       }
     });
   };
      $scope.searchTouch = function(){
          $scope.tinderSearch = true;
      }
       $scope.desSearchTouch = function(){
          $scope.tinderDesSearch = true;
      }
        $scope.searchRelease = function(){
          $scope.tinderSearch = false;
      }
       $scope.desSearchRelease = function(){
          $scope.tinderDesSearch = false;
      }
      $scope.deleteSearch = function(){
          $scope.searching.searchText = '';
          $scope.searching = {};
          localStorage.setItem("search", '');
          $scope.refBusquedas = new Firebase("https://torrid-torch-3019.firebaseio.com/busqueda/");
          var busqueda = $scope.refBusquedas.push(
                Busqueda.create(
                     "ofertas", null, Firebase.ServerValue.TIMESTAMP
                )   
            )
          $localstorage.set('idBusqueda', busqueda.key());
          $scope.userSearches.push(busqueda.key())
          $scope.refUsuario.child("idBusqueda").set($scope.userSearches);
          $localstorage.setObject('cards', {});
          $scope.addCard();
          $scope.showTinderButtons = true;
      }
          $ionicPopover.fromTemplateUrl('refine.html', {
        scope: $scope,
      }).then(function(popover) {
        $scope.popover = popover;
       
      });
      $scope.openPopover = function($event) {
           $ionicPopover.fromTemplateUrl('refine.html', {
        scope: $scope,
      }).then(function(popover) {
        $scope.popover = popover;
      
      });
        $scope.popover.show($event);
       
      };
      $scope.closePopover = function() {
        $ionicLoading.hide();
        $scope.ifCards();
      };
      //Cleanup the popover when we're done with it!
      $scope.$on('$destroy', function() {
        
        $scope.popover.remove();
       $scope.ifCards();
      });
      // Execute action on hide popover
      $scope.$on('popover.hidden', function() {
      $scope.ifCards();
      });
      // Execute action on remove popover
      $scope.$on('popover.removed', function() {
       $scope.ifCards();
      });
      $scope.ifCards = function(){
          if($scope.cards && $scope.cards.length>0)
           $scope.showTinderButtons = true;
      }
  $scope.openConfigurations = function(){
       $ionicSideMenuDelegate.toggleLeft();
        $ionicBackdrop.release();
  }
  $scope.onTouchIfConfigurations = function(){
      if($ionicSideMenuDelegate.isOpen()){
       $ionicSideMenuDelegate.toggleLeft();
      }
      
  }
  $scope.openChat = function(){
    $ionicSlideBoxDelegate.next();
  }
  $scope.openShop = function(){
    $ionicSlideBoxDelegate.previous();
  }
  $scope.goAway = function() {
    //var catrd = $ionicSwipeCardDelegate.getSwipebleCard($scope);
    card.swipe();
  };
  $scope.isZero = function(ind){
      return ind+1 == $scope.cards.length;
  }
  $scope.isOne = function(ind){
      return ind+2 == $scope.cards.length;
  }
  $scope.isTwo = function(ind){
      return ind+3 == $scope.cards.length;
  }
  $scope.isThree = function(ind){
      return ind+4 == $scope.cards.length;
  }
  $scope.isFour = function(ind){
     return ind+5== $scope.cards.length;
  }

  $scope.isMoreThanFive = function(ind){
      return ind+5 < $scope.cards.length;
  }
  
  
$scope.cardSwiped = function() {
    var card = $scope.cards[$scope.cards.length -1];
    if($scope.cardsPassed.indexOf(card.id) < 0){
         $scope.cardsPassed.push(card.id); 
        $scope.refBusquedas.update({
            "idProducto" : $scope.cardsPassed
        })
         
    }
   
   
    if($scope.cards){
        $scope.cards.pop();
    $localstorage.setObject('cards', $scope.cards);
   if($scope.cards.length<1){
      $scope.addLot();
   }
}
    
    
       //init(true, 1);
  };

  $scope.cardDestroyed = function(index) {
     $scope.cardSwiped(index);
      //Mandar a bbdd que no le gusto
  };


$scope.toTab = function(to, tab) {
    $state.go(to, {tab: tab});
  };

  $scope.searchingOk = true;
  $scope.position = {};
  
   
 $scope.extraCards  = [];
function fuzzy_match(str,pattern){
    pattern = pattern.split("").reduce(function(a,b){ return a+".*"+b; });
    return (new RegExp(pattern)).test(str);
};

  $scope.addCard = function(data) {
      
      $scope.showTinderButtons = false;
      $scope.repeatFinished = false;
      $scope.here = 1;
    var savedCards = $localstorage.getObject('cards');
    if(savedCards &&  savedCards.length > 0 && !$scope.cargarNuevas){
        $timeout(function(){$scope.cards = savedCards; $scope.showTinderButtons = true;}, 1);
        
    }else{
        $scope.here = 2;
        $scope.cards = [];
        $scope.pushed = [];
        $localstorage.setObject('cards', {});
        $scope.showTinderButtons = false;
        $timeout(function(){$scope.showTinderButtons = false;}, 1);
        if(geolocation){
            $scope.here = 0;
            if(geolocation.getLocation()){
               $timeout(function(){
                   if($scope.here < 3){
                       $scope.addLot();
                   }
               
               }, 6000)
            }else{
                $scope.here = -2;
            }
        }else{
            $scope.here = -3;
        }
        geolocation.getLocation().then(function(position){
             $scope.here = 3;
             $scope.position = position.coords;
              $scope.haveTouched = [];
                $scope.refTarjetas.once('value', function (snapshot) {
                    var numChildren = snapshot.numChildren();
                    snapshot.forEach(function(childSnapshot) {
                        $scope.here = 5;
                        numChildren--;
                        for(var i = 0; i< childSnapshot.val().ubicacion.length; i++){
                            var rute = childSnapshot.key() + "+ubicacion+" + i;
                            var geoObject = [childSnapshot.val().ubicacion[i].latitud, childSnapshot.val().ubicacion[i].longitud];
                            var myGeoObject = [$scope.position.latitude, $scope.position.longitude];
                             $scope.geoFire.set(rute, geoObject).then(function() {
                              var geoQuery = $scope.geoFire.query({
                                  center: myGeoObject,
                                  radius: parseFloat($scope.configuraciones.distancia) //kilometers
                              });
                              geoQuery.on("key_entered", function(key, location, distance) {
                                    $scope.refTarjetas.child(key.substr(0,key.indexOf("+ubicacion+"))).once('value', function(tarjetasSnapshot){
                                            if($scope.pushed.indexOf(tarjetasSnapshot.key())==-1){
                                                if($scope.searching && $scope.searching.searchText){
                                                    if(fuzzy_match(tarjetasSnapshot.val().rotulo, $scope.searching.searchText)){
                                                        
                                                        var tarjeta = tarjetasSnapshot.val();
                                                        if(distance)
                                                        tarjeta.distancia = parseFloat(distance).toFixed(1);
                                                        tarjeta.id = tarjetasSnapshot.key();
                                                        $scope.cards.push(tarjeta);
                                                        $scope.pushed.push(tarjetasSnapshot.key());
                                                        $scope.showTinderButtons = true;
                                                        $scope.friendsStyle = {"color": "#0089ba"};
                                                        $localstorage.setObject('cards', $scope.cards);
                                                        $scope.searchingOk = true;
                                                        $scope.usedBadConnection = false;
                                                        $scope.imageStyleTinder = {"background-image": "url('img/loading.gif')", "border-radius": "100px", "width": "100px",  "height": "100px", "border" : "2px solid #FFF", "display" : "block", "margin" : "0 auto"};

                                                    }
                                                }else{
                                                    if(tarjetasSnapshot.val().isOffer){
                                                        var tarjeta = tarjetasSnapshot.val();
                                                        if(distance)
                                                        tarjeta.distancia = parseFloat(distance).toFixed(1);
                                                        tarjeta.id = tarjetasSnapshot.key();
                                                        $scope.cards.push(tarjeta);
                                                        $scope.pushed.push(tarjetasSnapshot.key());
                                                        $scope.showTinderButtons = true;
                                                        $scope.friendsStyle = {"color": "#0089ba"};
                                                        $localstorage.setObject('cards', $scope.cards);
                                                        $scope.searchingOk = true;
                                                        $scope.usedBadConnection = false;
                                                        $scope.imageStyleTinder = {"background-image": "url('img/loading.gif')", "border-radius": "100px", "width": "100px",  "height": "100px", "border" : "2px solid #FFF", "display" : "block", "margin" : "0 auto"};
                                                    }
                                                    
                                                }
                                                
    
                                            }
                                    })
                                    
                              });
                              
                            }, function(error) {
                              console.log("Error: " + error);
                            });
                        }
                        
                    });
                });
                                /*
                $scope.searchingOk = false;
                $scope.usedBadConnection = false;
                $timeout(function(){$scope.imageStyleTinder = {"background-image": "url('img/loading.png')", "border-radius": "100px", "width": "100px",  "height": "100px", "border" : "2px solid #FFF", " filter":" gray", "-webkit-filter": "grayscale(100%)"}}, 500);
                */
                
                        
        });

       

       
    }
   
  
  }
  
  
  $scope.badConnection = function(){
      if(!$scope.searchingOk && !$scope.usedBadConnection){
           $scope.addCard();
           $scope.usedBadConnection = true;
           $scope.imageStyleTinder = {"background-image": "url('img/loading.gif')", "border-radius": "100px", "width": "100px",  "height": "100px", "border" : "2px solid #FFF", "display" : "block", "margin" : "0 auto"};
      }
  }
  $scope.touche = false;
  $scope.desTouche = false;
  $scope.keepTouching = false;
  $scope.onTouch = function(){
      $scope.touche = true;
      $scope.desTouche = false;
      $scope.keepTouching = true

  }
  $scope.onRelease = function(){
      $scope.touche = false;
      //$scope.desTouche = true;
      //$scope.keepTouching = false;
      var newNode = document.createElement('div');
      $timeout(function(){
          newNode.className = newNode.className + "disapearImage  disapearAnimation";
          var element = document.getElementById("tinerLoading")
          if(element)
          element.appendChild(newNode); 
          $timeout(function(){newNode.remove()}, 4000);
          
      }, 500);
     
  }
  $scope.onRelease()
  $timeout(function(){$scope.onRelease()}, 5000);
  $timeout(function(){$scope.onRelease()}, 10000);
  $timeout(function(){$scope.onRelease()}, 15000);
  $scope.repeatFinished = false;
  $scope.customOffer = {};
   $scope.addOffers = function(){
       $scope.customOffer.text = "zapatillas";
       $scope.customOffer.show = true;
       $scope.cards = [];
         var offers = "offers";
        var i = 0;
         $scope.showTinderButtons = false;
        
        //    for(i = 0; i<6; i++){
               $scope.addCard(offers);
               $scope.finished = false;
          // }
            
           $scope.finished = true;
       $scope.done = !$scope.done;
       
    };
   
    $scope.cardPartialSwipe = function(amt, index){
        $scope.haveTouched[index] = true;
        var opacity = amt > 0 ? amt*2 : 0;
        var opacity2 = amt < 0 ? Math.abs(amt)*2 : 0;
        $scope.leftTextOpacity = {
          'opacity': opacity 
        };
        $scope.rightTextOpacity = {
          'opacity': opacity2
        };
    }
    $scope.cardSwipedLeft = function(index) {
    console.log('LEFT SWIPE');
     $scope.cardSwiped(index);
    
     
  };
  
  $scope.cardSwipedRight = function(index) {
    console.log('RIGHT SWIPE');
    var card = $scope.cards[$scope.cards.length -1];
    var orden = $scope.refUsuario.child("Orden").push(
            Orden.create(
                $scope.usuario.key, card.idVendedor, parseInt(card.id), 0
                 
            )   
    )
   
    $scope.cardSwiped(index);
   
  };
  $scope.$on('$viewContentLoaded', function() {
     $scope.cards = [];   
     $scope.addOffers();
 
 });
  
 $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
     
    $scope.repeatFinished = true;
   
});

})
.constant('salesforce_client_id', '6092');













