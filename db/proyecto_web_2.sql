CREATE TABLE almacen(
	id_almacen int, 
	nombre varchar(50),
	ubicacion varchar(50),
	
	Primary key(id_almacen)
)

CREATE TABLE insumo(
	id_insumo int,
	nombre varchar(50),
	descripcion varchar(50),
	precio int,
	id_almacen int,
	
	Primary Key(id_insumo),
	Foreign Key(id_almacen) references almacen(id_almacen)
)

CREATE TABLE consecionario(
	id_consecionario int,
	nombre varchar(50),
	direccion varchar(50),
	marcas_distribuidas varchar(50),
	
	Primary Key(id_consecionario)
)

CREATE TABLE clientes(
	id int,
	nombre varchar(50),
	apellido varchar(50),
	telefono varchar(50),
	id_consecionario int,
	
	Primary Key(id),
	Foreign Key(id_consecionario) references consecionario(id_consecionario)
)

CREATE TABLE vehiculos(
	id int,
	marca varchar(50),
	modelo varchar(50),
	modelo_year varchar(50),
	precio int,
	id_consecionario int,
	
	Primary Key(id),
	Foreign Key(id_consecionario) references consecionario(id_consecionario)
)

CREATE TABLE vendedor(
	id int,
	nombre varchar(50),
	cargo varchar(50),
	telefono varchar(50),
	salario varchar(50),
	id_consecionario int,
	
	Primary Key(id),
	Foreign Key(id_consecionario) references consecionario(id_consecionario)
)

CREATE TABLE venta(
	id int,
	fecha date,
	id_cliente int,
	id_vendedor int,
	precio_total int,
	
	Primary Key(id),
	Foreign Key(id_cliente) references clientes(id),
	Foreign Key(id_vendedor) references vendedor(id)
)

CREATE TABLE detalleVenta(
	id_detalle int,
	id_venta int,
	id_producto int,
	tipo_producto varchar(50),
	cantidad int,
	precio_unitario int,
	precio_total int,
	
	Primary Key(id_detalle),
	Foreign Key(id_venta) references venta(id),
	Foreign Key(id_producto) references vehiculos(id),
	Foreign Key(id_producto) references insumo(id_insumo)
)