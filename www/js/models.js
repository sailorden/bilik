var Producto = Model("producto", function(klass, proto) {
  klass.create = function(imagen, idVendedor, origen, idPregunta, idCritica, idTarjeta) {
   var producto = new Producto();
   producto.attr("imagen", imagen);
   producto.attr("idVendedor", idVendedor);
   producto.attr("origen", origen);
   producto.attr("idPregunta", idPregunta);
   producto.attr("idCritica", idCritica);
   producto.attr("idTarjeta", idTarjeta);
   return producto.attr();
  }

  proto.update = function() {
    this.attr("done", true)
  }
});

var Tarjeta = Model("tarjeta", function(klass, proto) {
  klass.create = function(rotulo, imagen, precio, categoria, estado, titulo, descripcion, idVendedor, ubicacion, isOffer, idProducto) {
   var tarjeta = new Tarjeta();
   tarjeta.attr("rotulo", titulo);
   tarjeta.attr("imagen", imagen);
   tarjeta.attr("precio", precio);
   tarjeta.attr("categoria", categoria);
   tarjeta.attr("estado", estado);
   tarjeta.attr("titulo", titulo);
   tarjeta.attr("descripcion", descripcion);
   tarjeta.attr("idVendedor", idVendedor);
   tarjeta.attr("ubicacion", ubicacion);
   tarjeta.attr("isOffer", isOffer);
   tarjeta.attr("idProducto", idProduct);
   return tarjeta.attr();
  }
  proto.update = function() {
    this.attr("done", true)
  }
});
var Buscador = Model("buscador", function(klass, proto) {
  klass.create = function(rotulo, precio, categoria, estado, titulo, descripcion, ubicacion, isOffer, idTarjeta) {
   var buscador = new Buscador();
   buscador.attr("rotulo", titulo);
   buscador.attr("precio", precio);
   buscador.attr("categoria", categoria);
   buscador.attr("estado", estado);
   buscador.attr("titulo", titulo);
   buscador.attr("ubicacion", ubicacion);
   buscador.attr("descripcion", descripcion);
   buscador.attr("isOffer", isOffer);
   buscador.attr("idTarjeta", idTarjeta);
   
   return buscador.attr();
  }
 
  proto.update = function() {
    this.attr("done", true)
  }
});


var Usuario = Model("usuario", function(klass, proto) {
  klass.create = function(nombre, apellido, mail, idFacebook, imagen, edad, telefono, idConfiguraciones, fechaVendedor, Orden, estado, idBusqueda, mercadolibre, idCritica, idAmigo, ubicacion) {
   var usuario = new Usuario();
   usuario.attr("nombre", nombre);
   usuario.attr("apellido", apellido);
   usuario.attr("mail", mail);
   usuario.attr("estado", estado);
   usuario.attr("idFacebook", idFacebook);
   usuario.attr("imagen", imagen);
   usuario.attr("edad", edad);
   usuario.attr("telefono", telefono);
   usuario.attr("idConfiguraciones", idConfiguraciones);
   usuario.attr("fechaVendedor", fechaVendedor);
   usuario.attr("Orden", Orden);
   usuario.attr("idBusqueda", idBusqueda);
   usuario.attr("mercadolibre", mercadolibre);
   usuario.attr("idCritica", idCritica);
   usuario.attr("idAmigo", idAmigo);
   usuario.attr("ubicacion", ubicacion)
   return usuario.attr();
  }

  proto.update = function() {
    this.attr("done", true)
  }
})


var Orden = Model("orden", function(klass, proto) {
  klass.create = function(idComprador, idVendedor, idTarjeta, estado, idConversacion, idPregunta) {
   var orden = new Tarjeta();
   orden.attr("idComprador", idComprador);
   orden.attr("idVendedor", idVendedor);
   orden.attr("idTarjeta", idTarjeta);
   orden.attr("estado", estado);
   orden.attr("idConversacion", idConversacion);
   orden.attr("idPregunta", idPregunta);
   return orden.attr();
  }

  proto.update = function() {
    this.attr("done", true)
  }
});


var Conversacion = Model("conversacion", function(klass, proto) {
  klass.create = function(comprador, vendedor, fecha) {
   var conversacion = new Conversacion();
   conversacion.attr("comprador", comprador);
   conversacion.attr("vendedor", vendedor);
   return conversacion.attr();
  }

  proto.update = function() {
    this.attr("done", true)
  }
});

var Pregunta = Model("pregunta", function(klass, proto) {
  klass.create = function(comprador, vendedor, fecha) {
   var pregunta = new Conversacion();
   pregunta.attr("comprador", comprador);
   pregunta.attr("vendedor", vendedor);
   pregunta.attr("fecha", fecha);
   return pregunta.attr();
  }

  proto.update = function() {
    this.attr("done", true)
  }
});


var Busqueda = Model("busqueda", function(klass, proto) {
  klass.create = function(texto, idProducto, fecha) {
   var busqueda = new Busqueda();
   busqueda.attr("texto", texto);
   busqueda.attr("idProducto", idProducto);
    busqueda.attr("fecha", fecha);
   return busqueda.attr();
  }

  proto.update = function() {
    this.attr("done", true)
  }
});

var Critica = Model("critica", function(klass, proto) {
  klass.create = function(puntaje, idComprador, texto, idProducto) {
   var critica = new Critica();
   critica.attr("texto", texto);
   critica.attr("idProducto", idProducto);
   critica.attr("puntaje", puntaje);
   critica.attr("idComprador", idComprador);
  
   return critica.attr();
  }

  proto.update = function() {
    this.attr("done", true)
  }
});

var Configuraciones = Model("configuraciones", function(klass, proto){
    klass.create = function(distancia, compra, mensaje, ubicacion) {
   var configuraciones = new Configuraciones();
   configuraciones.attr("distancia", distancia);
   configuraciones.attr("compra", compra);
   configuraciones.attr("mensaje", mensaje);
   configuraciones.attr("ubicacion", ubicacion);
   return configuraciones.attr();
  }
  proto.update = function() {
    this.attr("done", true)
  }
});





