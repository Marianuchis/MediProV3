import React, { useEffect, useState } from "react";
import { View, StyleSheet, Button, Alert, Platform } from "react-native";
import { DataTable, Text } from "react-native-paper";

//Datos de usuario
type Usuario = {
  idUsuario: number;
  usuario: string;
  tipo: number;
};

export default function CitasScreen() {
  //Usuario
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  //
  const [page, setPage] = useState(0);
  //Cantidad de registros que se muestran por pagina
  const itemsPerPage = 5;

  //Peticion de lista de usuarios
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        //Hacer el request
        const res = await fetch("http://localhost:3000/usuarios"); 
        const data = await res.json();
        //Si se reciben los datos, guardarlos en usuarios
        if (data.ok) {
          setUsuarios(data.data);
          console.log(data);
        }
      } catch (err) {
        console.error("Error cargando usuarios:", err);
      }
    };

    fetchUsuarios();
  }, []);


  //Peticion para eliminar
  const eliminarUsuario = async (idUsuario:number) => {
  try {
    const response = await fetch(`http://localhost:3000/usuarios/${idUsuario}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (data.ok) {
      alert("Usuario eliminado correctamente");
      // Actualiza el estado quitando el usuario eliminado
      setUsuarios((prev) => prev.filter((u) => u.idUsuario !== idUsuario));
    } else {
      alert(data.message || "Error al eliminar");
    }
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    alert("No se pudo eliminar el usuario");
  }
};

const confirmarEliminacion = (id:number) => {
  if (Platform.OS === "web") {
    if (window.confirm(`¿Eliminar al usuario?`)) {
      eliminarUsuario(id);
    }
  } else {
    Alert.alert(
      "Confirmar",
      `¿Eliminar al usuario?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", onPress: () => eliminarUsuario(id) },
      ]
    );
  }
};


  function tipoUsuario(tipo:number){
    if (tipo==1){
      return "Admin"
    }else if(tipo==2){
      return "usuario"
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Usuarios registrados</Text>
 
       <DataTable>
        <DataTable.Header>
          <DataTable.Title style={styles.column}>ID</DataTable.Title>
          <DataTable.Title style={styles.column}>Usuario</DataTable.Title>
          <DataTable.Title style={styles.column}>Tipo</DataTable.Title>
          <DataTable.Title style={styles.column}>Opciones</DataTable.Title>
        </DataTable.Header>

        {usuarios
          .slice(page * itemsPerPage, (page + 1) * itemsPerPage)
          .map((u) => (
            <DataTable.Row key={u.idUsuario}>
              <DataTable.Cell style={styles.column} numeric>{u.idUsuario}</DataTable.Cell>
              <DataTable.Cell style={styles.column}>{u.usuario}</DataTable.Cell>
              <DataTable.Cell style={styles.column} numeric>{tipoUsuario(u.tipo)}</DataTable.Cell>
              <DataTable.Cell style={styles.column}> 
                   <View style={styles.botones}>
      <Button 
        title="Eliminar"
        color="red"
        onPress={() => confirmarEliminacion(u.idUsuario)}
      />
      <View style={{ width: 10 }} /> {/* Espacio entre botones */}
      <Button title="Modificar" />
    </View>
              </DataTable.Cell>
            </DataTable.Row>
          ))}

        <DataTable.Pagination
          page={page}
          numberOfPages={Math.ceil(usuarios.length / itemsPerPage)}
          onPageChange={(p) => setPage(p)}
          label={`${page * itemsPerPage + 1}-${Math.min(
            (page + 1) * itemsPerPage,
            usuarios.length
          )} de ${usuarios.length}`}
        />
      </DataTable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 100},
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16 , textAlign:"center"},
  column: {
    flex: 1,                 // Todas las columnas tienen el mismo ancho
    justifyContent: "center", // Centrado vertical
    alignItems: "center",     // Centrado horizontal
    fontSize: 22,
  },
  botones:{
    flexDirection: "row",   // Los botones en línea horizontal
    justifyContent: "center",
    alignItems: "center",
  }
});